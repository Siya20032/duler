const { Op, QueryTypes } = require("sequelize");

const sequelize = require("../db");

const {
  Job,
  Queue,
  Worker,
  JobExecution,
  JobLog,
  DeadLetterQueue,
} = require("../models");

class JobWorker {
  constructor(options = {}) {
    this.projectId = options.projectId;

    this.workerName =
      options.workerName ||
      `worker-${require("os").hostname()}-${process.pid}`;

    this.hostname = require("os").hostname();

    this.pollInterval = Number(
      options.pollInterval || 1000
    );

    this.defaultConcurrency = Number(
      options.concurrency || 1
    );

    this.workerId = null;

    this.running = false;
    this.stopping = false;

    this.activeJobs = new Map();

    this.pollTimer = null;
    this.heartbeatTimer = null;
  }

  /* =========================================================
     START WORKER
  ========================================================= */

  async start() {
    if (this.running) {
      return;
    }

    console.log("");
    console.log("==========================================");
    console.log("      DISTRIBUTED JOB WORKER");
    console.log("==========================================");
    console.log(`Worker name : ${this.workerName}`);
    console.log(`Hostname    : ${this.hostname}`);
    console.log(`Project ID  : ${this.projectId}`);
    console.log(`Concurrency : ${this.defaultConcurrency}`);
    console.log("==========================================");
    console.log("");

    await sequelize.authenticate();

    console.log("PostgreSQL connected");

    await this.registerWorker();

    this.running = true;
    this.stopping = false;

    console.log(`Worker registered: ${this.workerId}`);

    await this.sendHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat().catch((error) => {
        console.error(
          "Heartbeat error:",
          error.message
        );
      });
    }, 5000);

    this.poll();

    console.log("Worker polling started");
  }

  /* =========================================================
     REGISTER WORKER
  ========================================================= */

  async registerWorker() {
    let worker = await Worker.findOne({
      where: {
        projectId: this.projectId,
        name: this.workerName,
      },
    });

    if (!worker) {
      worker = await Worker.create({
        projectId: this.projectId,
        name: this.workerName,
        hostname: this.hostname,
        status: "online",
        concurrency: this.defaultConcurrency,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
      });
    } else {
      worker.hostname = this.hostname;
      worker.status = "online";
      worker.concurrency = this.defaultConcurrency;
      worker.startedAt = new Date();
      worker.stoppedAt = null;
      worker.lastHeartbeatAt = new Date();

      await worker.save();
    }

    this.workerId = worker.id;
  }

  /* =========================================================
     HEARTBEAT
  ========================================================= */

  async sendHeartbeat() {
    if (!this.workerId) {
      return;
    }

    const worker = await Worker.findByPk(
      this.workerId
    );

    if (!worker) {
      return;
    }

    worker.status = "online";
    worker.lastHeartbeatAt = new Date();

    await worker.save();

    await Worker.sequelize.models.WorkerHeartbeat.create({
      workerId: this.workerId,
      activeJobs: this.activeJobs.size,
      metadata: {
        pid: process.pid,
        hostname: this.hostname,
        active_jobs: this.activeJobs.size,
        concurrency: worker.concurrency,
      },
      recordedAt: new Date(),
    });

    console.log(
      `[HEARTBEAT] active=${this.activeJobs.size}/${worker.concurrency}`
    );
  }

  /* =========================================================
     POLLING LOOP
  ========================================================= */

  async poll() {
    if (!this.running || this.stopping) {
      return;
    }

    try {
      const worker = await Worker.findByPk(
        this.workerId
      );

      if (!worker) {
        throw new Error(
          "Worker record no longer exists"
        );
      }

      const availableSlots =
        worker.concurrency -
        this.activeJobs.size;

      if (availableSlots > 0) {
        for (
          let i = 0;
          i < availableSlots;
          i++
        ) {
          const job =
            await this.claimNextJob();

          if (!job) {
            break;
          }

          this.executeClaimedJob(job)
            .catch((error) => {
              console.error(
                `[JOB ${job.job.id}] Unhandled worker error:`,
                error
              );
            });
        }
      }
    } catch (error) {
      console.error(
        "[WORKER POLL ERROR]",
        error.message
      );
    }

    if (
      this.running &&
      !this.stopping
    ) {
      this.pollTimer = setTimeout(
        () => this.poll(),
        this.pollInterval
      );
    }
  }

  /* =========================================================
     ATOMIC JOB CLAIM

     Supports:
     QUEUED jobs
     SCHEDULED jobs whose scheduledAt has arrived

     PostgreSQL advisory lock is used per queue.
  ========================================================= */

  async claimNextJob() {
    const transaction =
      await sequelize.transaction();

    try {
      const queues =
        await Queue.findAll({
          where: {
            projectId: this.projectId,
            isPaused: false,
          },

          order: [
            ["priority", "DESC"],
            ["createdAt", "ASC"],
          ],

          transaction,

          lock: transaction.LOCK.UPDATE,
        });

      for (const queue of queues) {
        /*
         * PostgreSQL advisory transaction lock.
         *
         * This prevents multiple workers from
         * exceeding queue concurrency simultaneously.
         */

        await sequelize.query(
          `
          SELECT pg_advisory_xact_lock(
            hashtext(:queueId)
          )
          `,
          {
            replacements: {
              queueId: queue.id,
            },

            type: QueryTypes.SELECT,

            transaction,
          }
        );

        /*
         * Count currently active jobs.
         */

        const activeCount =
          await Job.count({
            where: {
              queueId: queue.id,

              status: {
                [Op.in]: [
                  "CLAIMED",
                  "RUNNING",
                ],
              },
            },

            transaction,
          });

        if (
          activeCount >=
          queue.concurrencyLimit
        ) {
          continue;
        }

        /*
         * IMPORTANT:
         *
         * Pick both:
         *
         * 1. QUEUED jobs ready to execute
         *
         * 2. SCHEDULED jobs whose scheduledAt
         *    time has arrived.
         */

        const now = new Date();

        const job =
          await Job.findOne({
            where: {
              queueId: queue.id,

              [Op.or]: [
                /*
                 * Normal queued job
                 */
                {
                  status: "QUEUED",

                  [Op.or]: [
                    {
                      scheduledAt: {
                        [Op.lte]: now,
                      },
                    },

                    {
                      scheduledAt: null,
                    },
                  ],
                },

                /*
                 * Scheduled job whose
                 * execution time has arrived
                 */
                {
                  status: "SCHEDULED",

                  scheduledAt: {
                    [Op.lte]: now,
                  },
                },
              ],
            },

            order: [
              ["priority", "DESC"],
              ["createdAt", "ASC"],
            ],

            transaction,

            lock: transaction.LOCK.UPDATE,

            skipLocked: true,
          });

        if (!job) {
          continue;
        }

        /*
         * If this was a scheduled job,
         * make it QUEUED first.
         */

        if (
          job.status === "SCHEDULED"
        ) {
          job.status = "QUEUED";

          await job.save({
            transaction,
          });
        }

        /*
         * CLAIM JOB
         */

        job.status = "CLAIMED";

        job.claimedAt =
          new Date();

        job.attemptCount += 1;

        await job.save({
          transaction,
        });

        /*
         * Create execution record.
         */

        const execution =
          await JobExecution.create(
            {
              jobId: job.id,

              workerId:
                this.workerId,

              attemptNumber:
                job.attemptCount,

              status: "CLAIMED",

              startedAt: null,
            },

            {
              transaction,
            }
          );

        /*
         * Create execution log.
         */

        await JobLog.create(
          {
            jobId: job.id,

            executionId:
              execution.id,

            level: "INFO",

            message:
              `Job claimed by worker ${this.workerName}`,
          },

          {
            transaction,
          }
        );

        await transaction.commit();

        console.log(
          `[CLAIMED] job=${job.id} type=${job.jobType} attempt=${job.attemptCount}`
        );

        return {
          job,
          execution,
          queue,
        };
      }

      await transaction.rollback();

      return null;
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (_) {}

      console.error(
        "[CLAIM ERROR]",
        error.message
      );

      return null;
    }
  }

  /* =========================================================
     EXECUTE JOB
  ========================================================= */

  async executeClaimedJob(data) {
    const {
      job,
      execution,
    } = data;

    this.activeJobs.set(
      job.id,
      {
        jobId: job.id,
        executionId:
          execution.id,
      }
    );

    const startedAt =
      new Date();

    try {
      await job.update({
        status: "RUNNING",
        startedAt,
      });

      await execution.update({
        status: "RUNNING",
        startedAt,
      });

      await JobLog.create({
        jobId: job.id,

        executionId:
          execution.id,

        level: "INFO",

        message:
          `Job execution started by ${this.workerName}`,
      });

      console.log(
        `[RUNNING] job=${job.id} type=${job.jobType}`
      );

      const result =
        await this.executeTask(job);

      const finishedAt =
        new Date();

      const durationMs =
        finishedAt.getTime() -
        startedAt.getTime();

      await job.update({
        status: "COMPLETED",

        completedAt:
          finishedAt,

        lastError: null,
      });

      await execution.update({
        status: "COMPLETED",

        finishedAt,

        durationMs,

        result,
      });

      await JobLog.create({
        jobId: job.id,

        executionId:
          execution.id,

        level: "INFO",

        message:
          `Job completed successfully in ${durationMs} ms`,
      });

      console.log(
        `[COMPLETED] job=${job.id} duration=${durationMs}ms`
      );
    } catch (error) {
      await this.handleJobFailure(
        job,
        execution,
        error
      );
    } finally {
      this.activeJobs.delete(
        job.id
      );

      if (
        this.running &&
        !this.stopping
      ) {
        setImmediate(() => {
          this.poll().catch(
            () => {}
          );
        });
      }
    }
  }

  /* =========================================================
     TASK EXECUTOR
  ========================================================= */

  async executeTask(job) {
    const payload =
      job.payload || {};

    const jobType =
      String(
        job.jobType || ""
      ).toLowerCase();

    /*
     * Explicit failure testing
     */

    if (
      payload.should_fail === true ||
      jobType === "test_failure"
    ) {
      throw new Error(
        payload.error_message ||
          "Simulated job failure"
      );
    }

    /*
     * Configurable execution time.
     *
     * Minimum: 100 ms
     * Maximum: 30 seconds
     */

    const duration =
      Math.min(
        Math.max(
          Number(
            payload.duration_ms ||
              1000
          ),
          100
        ),
        30000
      );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          duration
        )
    );

    return {
      success: true,

      worker_id:
        this.workerId,

      worker_name:
        this.workerName,

      job_type:
        job.jobType,

      duration_ms:
        duration,

      completed_at:
        new Date().toISOString(),

      payload,
    };
  }

  /* =========================================================
     FAILURE + RETRY
  ========================================================= */

  async handleJobFailure(
    job,
    execution,
    error
  ) {
    const finishedAt =
      new Date();

    const durationMs =
      job.startedAt
        ? finishedAt.getTime() -
          new Date(
            job.startedAt
          ).getTime()
        : null;

    const errorMessage =
      error?.message ||
      "Unknown job failure";

    /*
     * Mark current execution failed.
     */

    await execution.update({
      status: "FAILED",

      finishedAt,

      durationMs,

      errorMessage,
    });

    /*
     * Failure log.
     */

    await JobLog.create({
      jobId: job.id,

      executionId:
        execution.id,

      level: "ERROR",

      message:
        `Job execution failed: ${errorMessage}`,
    });

    /*
     * Load queue + retry policy.
     */

    const queue =
      await Queue.findByPk(
        job.queueId,
        {
          include: [
            {
              association:
                "retryPolicy",
            },
          ],
        }
      );

    const retryPolicy =
      queue?.retryPolicy;

    const maxAttempts =
      Number(
        job.maxAttempts || 3
      );

    const attempts =
      Number(
        job.attemptCount || 0
      );

    /*
     * RETRY
     */

    if (
      attempts < maxAttempts
    ) {
      const delay =
        this.calculateRetryDelay(
          retryPolicy,
          attempts
        );

      const nextAttempt =
        new Date(
          Date.now() +
            delay
        );

      await job.update({
        status: "QUEUED",

        scheduledAt:
          nextAttempt,

        lastError:
          errorMessage,

        failedAt:
          finishedAt,
      });

      await JobLog.create({
        jobId: job.id,

        executionId:
          execution.id,

        level: "WARN",

        message:
          `Retry scheduled for ${nextAttempt.toISOString()} after ${delay} ms`,
      });

      console.log(
        `[RETRY] job=${job.id} attempt=${attempts}/${maxAttempts} delay=${delay}ms`
      );
    } else {
      /*
       * Maximum attempts exceeded.
       */

      await job.update({
        status: "FAILED",

        failedAt:
          finishedAt,

        lastError:
          errorMessage,
      });

      /*
       * Move job to DLQ.
       */

      await DeadLetterQueue.findOrCreate({
        where: {
          jobId: job.id,
        },

        defaults: {
          jobId: job.id,

          reason:
            "Maximum retry attempts exceeded",

          finalError:
            errorMessage,

          failedAt:
            finishedAt,
        },
      });

      await JobLog.create({
        jobId: job.id,

        executionId:
          execution.id,

        level: "ERROR",

        message:
          "Job moved to Dead Letter Queue",
      });

      console.log(
        `[DLQ] job=${job.id} attempts=${attempts}`
      );
    }
  }

  /* =========================================================
     RETRY STRATEGY
  ========================================================= */

  calculateRetryDelay(
    retryPolicy,
    attempt
  ) {
    if (!retryPolicy) {
      return 5000;
    }

    const strategy =
      String(
        retryPolicy.strategy ||
          "EXPONENTIAL"
      ).toUpperCase();

    const initial =
      Number(
        retryPolicy.initialDelaySeconds ||
          5
      ) * 1000;

    const max =
      Number(
        retryPolicy.maxDelaySeconds ||
          300
      ) * 1000;

    let delay;

    /*
     * FIXED
     */

    if (
      strategy === "FIXED"
    ) {
      delay = initial;
    }

    /*
     * LINEAR
     */

    else if (
      strategy === "LINEAR"
    ) {
      delay =
        initial * attempt;
    }

    /*
     * EXPONENTIAL
     */

    else {
      delay =
        initial *
        Math.pow(
          2,
          Math.max(
            attempt - 1,
            0
          )
        );
    }

    return Math.min(
      Math.max(
        delay,
        1000
      ),
      max
    );
  }

  /* =========================================================
     STOP WORKER
  ========================================================= */

  async stop() {
    if (!this.running) {
      return;
    }

    console.log("");

    console.log(
      "Stopping worker gracefully..."
    );

    this.stopping = true;

    this.running = false;

    if (this.pollTimer) {
      clearTimeout(
        this.pollTimer
      );

      this.pollTimer = null;
    }

    if (
      this.heartbeatTimer
    ) {
      clearInterval(
        this.heartbeatTimer
      );

      this.heartbeatTimer =
        null;
    }

    /*
     * Wait for currently
     * running jobs.
     */

    while (
      this.activeJobs.size >
      0
    ) {
      console.log(
        `Waiting for ${this.activeJobs.size} active job(s)...`
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      );
    }

    /*
     * Mark worker offline.
     */

    if (this.workerId) {
      const worker =
        await Worker.findByPk(
          this.workerId
        );

      if (worker) {
        worker.status =
          "offline";

        worker.stoppedAt =
          new Date();

        await worker.save();
      }
    }

    console.log(
      "Worker stopped successfully"
    );

    await sequelize.close();
  }
}

module.exports = JobWorker;