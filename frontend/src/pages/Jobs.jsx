import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [queues, setQueues] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [queueId, setQueueId] = useState("");
  const [jobType, setJobType] = useState("");
  const [payload, setPayload] = useState("{}");
  const [priority, setPriority] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsResponse, queuesResponse] = await Promise.all([
        api.get("/jobs"),
        api.get("/queues"),
      ]);

      setJobs(jobsResponse.data?.items || []);
      setQueues(queuesResponse.data || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load jobs and queues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setError("");
    setSuccess("");

    setQueueId(queues.length > 0 ? queues[0].id : "");
    setJobType("");
    setPayload("{}");
    setPriority(0);
    setMaxAttempts(3);
    setIdempotencyKey("");

    setShowModal(true);
  };

  const closeCreateModal = () => {
    if (!creating) {
      setShowModal(false);
    }
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!queueId) {
      setError("Please select a queue.");
      return;
    }

    if (!jobType.trim()) {
      setError("Please enter a job type.");
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

      const response = await api.post("/jobs", {
        queue_id: queueId,
        job_type: jobType.trim(),
        payload: parsedPayload,
        priority: Number(priority),
        max_attempts: Number(maxAttempts),
        ...(idempotencyKey.trim()
          ? { idempotency_key: idempotencyKey.trim() }
          : {}),
      });

      const createdJob = response.data;

      setJobs((previousJobs) => [
        createdJob,
        ...previousJobs,
      ]);

      setSuccess("Job created successfully.");

      setShowModal(false);

      setJobType("");
      setPayload("{}");
      setPriority(0);
      setMaxAttempts(3);
      setIdempotencyKey("");
    } catch (err) {
      console.error("Create job error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create job."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Jobs</h2>
          <p>Monitor and manage distributed jobs.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateModal}
        >
          + Create Job
        </button>
      </div>

      {error && !showModal && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {loading ? (
        <div className="empty-panel">
          <div className="empty-icon">⏳</div>
          <h3>Loading jobs...</h3>
          <p>Please wait while jobs are loaded.</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">⚙</div>
          <h3>No jobs found</h3>
          <p>
            Create your first job to start processing tasks.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Jobs</h3>
              <p>
                {jobs.length} job
                {jobs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Attempts</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>
                        {job.job_type || "Unknown"}
                      </strong>
                    </td>

                    <td>
                      <StatusBadge
                        status={job.status || "unknown"}
                      />
                    </td>

                    <td>
                      {job.priority ?? 0}
                    </td>

                    <td>
                      {job.attempt_count ?? 0} /{" "}
                      {job.max_attempts ?? 0}
                    </td>

                    <td>
                      {job.created_at
                        ? new Date(
                            job.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title="Create Job"
          onClose={closeCreateModal}
        >
          <form
            className="auth-form"
            onSubmit={handleCreateJob}
          >
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {queues.length === 0 ? (
              <div className="auth-error">
                No queues are available. Please create a
                queue first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="job-queue">
                    Queue
                  </label>

                  <select
                    id="job-queue"
                    value={queueId}
                    onChange={(event) =>
                      setQueueId(event.target.value)
                    }
                    disabled={creating}
                  >
                    <option value="">
                      Select a queue
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
                  <label htmlFor="job-type">
                    Job Type
                  </label>

                  <input
                    id="job-type"
                    type="text"
                    placeholder="process_order"
                    value={jobType}
                    onChange={(event) =>
                      setJobType(event.target.value)
                    }
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job-payload">
                    Payload (JSON)
                  </label>

                  <textarea
                    id="job-payload"
                    rows="7"
                    value={payload}
                    onChange={(event) =>
                      setPayload(event.target.value)
                    }
                    disabled={creating}
                    placeholder={`{
  "order_id": "ORD-1001",
  "amount": 2499
}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job-priority">
                    Priority
                  </label>

                  <input
                    id="job-priority"
                    type="number"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job-max-attempts">
                    Max Attempts
                  </label>

                  <input
                    id="job-max-attempts"
                    type="number"
                    min="1"
                    value={maxAttempts}
                    onChange={(event) =>
                      setMaxAttempts(event.target.value)
                    }
                    disabled={creating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job-idempotency">
                    Idempotency Key (optional)
                  </label>

                  <input
                    id="job-idempotency"
                    type="text"
                    placeholder="ORDER-1001"
                    value={idempotencyKey}
                    onChange={(event) =>
                      setIdempotencyKey(event.target.value)
                    }
                    disabled={creating}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={creating}
                >
                  {creating
                    ? "Creating Job..."
                    : "Create Job"}
                </button>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Jobs;