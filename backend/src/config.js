const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

module.exports = {
  appName: process.env.APP_NAME || "Distributed Job Scheduler",

  appVersion: process.env.APP_VERSION || "1.0.0",

  port: Number(process.env.PORT || 8000),

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://scheduler_user:scheduler_password@127.0.0.1:5432/distributed_scheduler",

  jwtSecret:
    process.env.JWT_SECRET_KEY ||
    "change-this-secret-key-before-submission",

  jwtAlgorithm:
    process.env.JWT_ALGORITHM || "HS256",

  tokenMinutes:
    Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 60),

  corsOrigins: (
    process.env.CORS_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Worker configuration
  workerProjectId:
    process.env.WORKER_PROJECT_ID || "",

  workerName:
    process.env.WORKER_NAME || `worker-${require("os").hostname()}`,

  workerConcurrency:
    Math.max(
      Number(process.env.WORKER_CONCURRENCY || 2),
      1
    ),

  workerPollInterval:
    Math.max(
      Number(process.env.WORKER_POLL_INTERVAL || 1000),
      250
    ),
};