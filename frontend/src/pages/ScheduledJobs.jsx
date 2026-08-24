import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";

function ScheduledJobs() {
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [queues, setQueues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [queueId, setQueueId] = useState("");
  const [jobType, setJobType] = useState("");
  const [runAt, setRunAt] = useState("");
  const [cronExpression, setCronExpression] =
    useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [payload, setPayload] = useState("{}");

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        scheduledResponse,
        queuesResponse,
      ] = await Promise.all([
        api.get("/scheduled-jobs"),
        api.get("/queues"),
      ]);

      setScheduledJobs(
        scheduledResponse.data || []
      );

      setQueues(
        queuesResponse.data?.items ||
          queuesResponse.data ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to load scheduled jobs:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to load scheduled jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");

    if (!queueId) {
      setError("Please select a queue.");
      return;
    }

    if (!jobType.trim()) {
      setError("Job type is required.");
      return;
    }

    if (!runAt) {
      setError("Run date and time are required.");
      return;
    }

    let parsedPayload;

    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError("Payload must contain valid JSON.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/scheduled-jobs", {
        queue_id: queueId,
        job_type: jobType.trim(),
        payload: parsedPayload,
        run_at: new Date(runAt).toISOString(),
        cron_expression:
          cronExpression.trim() || null,
        timezone,
      });

      setQueueId("");
      setJobType("");
      setRunAt("");
      setCronExpression("");
      setTimezone("UTC");
      setPayload("{}");
      setShowModal(false);

      await loadData();
    } catch (error) {
      console.error(
        "Create scheduled job error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to create scheduled job."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this scheduled job?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/scheduled-jobs/${id}`);

      await loadData();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to delete scheduled job."
      );
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Scheduled Jobs</h2>
          <p>
            View jobs configured for future execution.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Schedule Job
        </button>
      </div>

      {error && !showModal && (
        <div className="auth-error">{error}</div>
      )}

      {loading ? (
        <div className="empty-panel">
          <h3>Loading scheduled jobs...</h3>
        </div>
      ) : scheduledJobs.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">◷</div>
          <h3>No scheduled jobs</h3>
          <p>
            Scheduled jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="data-grid">
          {scheduledJobs.map((scheduled) => (
            <div
              className="data-card"
              key={scheduled.id}
            >
              <div className="data-card-icon">
                ◷
              </div>

              <div>
                <h3>
                  {scheduled.job_type ||
                    scheduled.jobType ||
                    "Scheduled Job"}
                </h3>

                <p>
                  Run at:{" "}
                  {scheduled.run_at ||
                    scheduled.runAt
                      ? new Date(
                          scheduled.run_at ||
                            scheduled.runAt
                        ).toLocaleString()
                      : "Not specified"}
                </p>

                {(
                  scheduled.cron_expression ||
                  scheduled.cronExpression
                ) && (
                  <small>
                    Cron:{" "}
                    {scheduled.cron_expression ||
                      scheduled.cronExpression}
                  </small>
                )}

                <div className="card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleDelete(scheduled.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Schedule Job"
          onClose={() => !creating && setShowModal(false)}
        >
          <form onSubmit={handleCreate}>
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label>Queue</label>

              <select
                value={queueId}
                onChange={(event) =>
                  setQueueId(event.target.value)
                }
                disabled={creating}
              >
                <option value="">
                  Select queue
                </option>

                {queues.map((queue) => (
                  <option
                    key={queue.id}
                    value={queue.id}
                  >
                    {queue.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Job Type</label>

              <input
                type="text"
                placeholder="e.g. daily-report"
                value={jobType}
                onChange={(event) =>
                  setJobType(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Run At</label>

              <input
                type="datetime-local"
                value={runAt}
                onChange={(event) =>
                  setRunAt(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>
                Cron Expression (optional)
              </label>

              <input
                type="text"
                placeholder="0 9 * * *"
                value={cronExpression}
                onChange={(event) =>
                  setCronExpression(
                    event.target.value
                  )
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Timezone</label>

              <input
                type="text"
                value={timezone}
                onChange={(event) =>
                  setTimezone(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Payload JSON</label>

              <textarea
                rows="5"
                value={payload}
                onChange={(event) =>
                  setPayload(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowModal(false)}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={creating}
              >
                {creating
                  ? "Scheduling..."
                  : "Schedule Job"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ScheduledJobs;