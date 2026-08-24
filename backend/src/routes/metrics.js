const router = require("express").Router();
const { Op } = require("sequelize");

const {
  Job,
  JobExecution,
  Queue,
  Project,
  Worker,
} = require("../models");

const auth = require("../middleware/auth");

router.get("/metrics/overview", auth, async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: {
        createdBy: req.user.id,
        isActive: true,
      },
      attributes: ["id"],
    });

    const projectIds = projects.map((project) => project.id);

    const queues = await Queue.findAll({
      where: {
        projectId: {
          [Op.in]: projectIds,
        },
      },
      attributes: ["id"],
    });

    const queueIds = queues.map((queue) => queue.id);

    const jobs = await Job.findAll({
      where: {
        queueId: {
          [Op.in]: queueIds,
        },
      },
      attributes: ["status"],
    });

    const executions = await JobExecution.findAll({
      include: [
        {
          model: Job,
          where: {
            queueId: {
              [Op.in]: queueIds,
            },
          },
          attributes: [],
        },
      ],
      attributes: ["status"],
    });

    const workers = await Worker.findAll({
      where: {
        projectId: {
          [Op.in]: projectIds,
        },
      },
      attributes: ["status"],
    });

    const count = (items, status) =>
      items.filter((item) => item.status === status).length;

    res.json({
      total_projects: projects.length,

      total_queues: queues.length,

      total_jobs: jobs.length,
      queued_jobs: count(jobs, "QUEUED"),
      scheduled_jobs: count(jobs, "SCHEDULED"),
      claimed_jobs: count(jobs, "CLAIMED"),
      running_jobs: count(jobs, "RUNNING"),
      completed_jobs: count(jobs, "COMPLETED"),
      failed_jobs: count(jobs, "FAILED"),

      total_workers: workers.length,
      active_workers: workers.filter(
        (worker) => worker.status === "online"
      ).length,

      total_executions: executions.length,
      successful_executions: count(
        executions,
        "COMPLETED"
      ),
      failed_executions: count(
        executions,
        "FAILED"
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/metrics/queues/:id",
  auth,
  async (req, res, next) => {
    try {
      const queue = await Queue.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Project,
            where: {
              createdBy: req.user.id,
              isActive: true,
            },
            attributes: [],
          },
        ],
      });

      if (!queue) {
        return res.status(404).json({
          detail: "Queue not found",
        });
      }

      const jobs = await Job.findAll({
        where: {
          queueId: queue.id,
        },
        attributes: ["status"],
      });

      res.json({
        id: queue.id,
        name: queue.name,
        is_paused: queue.isPaused,

        total_jobs: jobs.length,

        queued_jobs: jobs.filter(
          (job) => job.status === "QUEUED"
        ).length,

        running_jobs: jobs.filter(
          (job) => job.status === "RUNNING"
        ).length,

        completed_jobs: jobs.filter(
          (job) => job.status === "COMPLETED"
        ).length,

        failed_jobs: jobs.filter(
          (job) => job.status === "FAILED"
        ).length,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;