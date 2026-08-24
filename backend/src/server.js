const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const config = require("./config");
const sequelize = require("./db");

// Load Sequelize models
require("./models");

// Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const queueRoutes = require("./routes/queues");
const jobRoutes = require("./routes/jobs");
const dlqRoutes = require("./routes/dlq");
const workerRoutes = require("./routes/workers");
const scheduledRoutes = require("./routes/scheduledJobs");
const metricsRoutes = require("./routes/metrics");

const { startScheduler } = require("./services/scheduler");

const app = express();

/* =========================
   Security
========================= */

app.use(helmet());

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

/* =========================
   Body Parser
========================= */

app.use(express.json({ limit: "2mb" }));

/* =========================
   Health / Root Routes
========================= */

app.get("/", (req, res) => {
  res.json({
    name: config.appName,
    version: config.appVersion,
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
  });
});

app.get("/health/database", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

/* =========================
   API Routes
========================= */

app.use(authRoutes);
app.use(projectRoutes);
app.use(queueRoutes);
app.use(jobRoutes);
app.use(dlqRoutes);
app.use(workerRoutes);
app.use(scheduledRoutes);
app.use(metricsRoutes);

/* =========================
   Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      detail: "A resource with the same unique value already exists",
    });
  }

  res.status(err.status || 500).json({
    detail: err.message || "Internal server error",
  });
});

/* =========================
   Start Server
========================= */

async function start() {
  try {
    // Check PostgreSQL connection
    await sequelize.authenticate();

    console.log("PostgreSQL connected");

    /*
     * IMPORTANT:
     * Do NOT run sequelize.sync() here.
     *
     * The PostgreSQL database already exists and was
     * originally created by the previous Python/FastAPI
     * implementation.
     *
     * Running sequelize.sync() attempts to modify existing
     * PostgreSQL enums and columns and causes startup errors.
     */
    console.log(
      "Database schema already exists; skipping Sequelize sync"
    );

    // Start Express server
    app.listen(config.port, "0.0.0.0", () => {
      console.log(
        `Node.js + Express API running on http://127.0.0.1:${config.port}`
      );
    });

    // Start scheduler
    startScheduler();
    console.log("Scheduler started");
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

start();

module.exports = app;