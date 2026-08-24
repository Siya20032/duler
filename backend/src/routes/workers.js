const router = require("express").Router();
const { Worker, WorkerHeartbeat, Project } = require("../models");
const auth = require("../middleware/auth");

/*
=========================================================
GET ALL WORKERS
=========================================================
*/
router.get("/workers", auth, async (req, res, next) => {
  try {
    const workers = await Worker.findAll({
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
      order: [["createdAt", "DESC"]],
    });

    res.json(
      workers.map((worker) => ({
        id: worker.id,
        project_id: worker.projectId,
        name: worker.name,
        hostname: worker.hostname,
        status: worker.status,
        concurrency: worker.concurrency,
        started_at: worker.startedAt,
        stopped_at: worker.stoppedAt,
        last_heartbeat_at: worker.lastHeartbeatAt,
        created_at: worker.createdAt,
        updated_at: worker.updatedAt,
      }))
    );
  } catch (error) {
    next(error);
  }
});

/*
=========================================================
GET SINGLE WORKER
=========================================================
*/
router.get("/workers/:id", auth, async (req, res, next) => {
  try {
    const worker = await Worker.findOne({
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

    if (!worker) {
      return res.status(404).json({
        detail: "Worker not found",
      });
    }

    res.json({
      id: worker.id,
      project_id: worker.projectId,
      name: worker.name,
      hostname: worker.hostname,
      status: worker.status,
      concurrency: worker.concurrency,
      started_at: worker.startedAt,
      stopped_at: worker.stoppedAt,
      last_heartbeat_at: worker.lastHeartbeatAt,
      created_at: worker.createdAt,
      updated_at: worker.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

/*
=========================================================
WORKER HEARTBEATS
=========================================================
*/
router.get(
  "/workers/:id/heartbeats",
  auth,
  async (req, res, next) => {
    try {
      const worker = await Worker.findOne({
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

      if (!worker) {
        return res.status(404).json({
          detail: "Worker not found",
        });
      }

      const limit = Math.min(
        Number(req.query.limit || 50),
        200
      );

      const heartbeats = await WorkerHeartbeat.findAll({
        where: {
          workerId: worker.id,
        },
        order: [["recordedAt", "DESC"]],
        limit,
      });

      res.json(
        heartbeats.map((heartbeat) => ({
          id: heartbeat.id,
          worker_id: heartbeat.workerId,
          active_jobs: heartbeat.activeJobs,
          metadata: heartbeat.metadata,
          recorded_at: heartbeat.recordedAt,
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;