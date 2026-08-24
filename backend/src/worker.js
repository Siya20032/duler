require("dotenv").config();

const os = require("os");
const JobWorker = require("./services/jobWorker");

const worker = new JobWorker({
  projectId: process.env.WORKER_PROJECT_ID || null,
  workerName:
    process.env.WORKER_NAME ||
    `worker-${os.hostname()}-${process.pid}`,
  concurrency: Number(
    process.env.WORKER_CONCURRENCY || 5
  ),
  pollInterval: Number(
    process.env.WORKER_POLL_INTERVAL || 1000
  ),
});

async function start() {
  try {
    await worker.start();
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\nReceived ${signal}`);

  try {
    await worker.stop();
    process.exit(0);
  } catch (error) {
    console.error("Error while stopping worker:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
