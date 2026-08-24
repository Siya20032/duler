import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";

function Queues() {
  const [queues, setQueues] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(0);
  const [concurrency, setConcurrency] = useState(5);

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [queuesResponse, projectsResponse] =
        await Promise.all([
          api.get("/queues"),
          api.get("/projects"),
        ]);

      setQueues(queuesResponse.data?.items || queuesResponse.data || []);
      setProjects(projectsResponse.data || []);
    } catch (error) {
      console.error("Failed to load queues:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to load queues."
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

    if (!projectId) {
      setError("Please select a project.");
      return;
    }

    if (!name.trim()) {
      setError("Queue name is required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/queues", {
        project_id: projectId,
        name: name.trim(),
        priority: Number(priority),
        concurrency_limit: Number(concurrency),
        retry_policy: {
          name: "default-retry-policy",
          strategy: "exponential",
          max_retries: 3,
          initial_delay_seconds: 5,
          max_delay_seconds: 300,
        },
      });

      setName("");
      setProjectId("");
      setPriority(0);
      setConcurrency(5);
      setShowModal(false);

      await loadData();
    } catch (error) {
      console.error("Create queue error:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to create queue."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Queues</h2>
          <p>Manage job queues used by your workers.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + New Queue
        </button>
      </div>

      {error && !showModal && (
        <div className="auth-error">{error}</div>
      )}

      {loading ? (
        <div className="empty-panel">
          <h3>Loading queues...</h3>
        </div>
      ) : queues.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">☷</div>
          <h3>No queues available</h3>
          <p>Create a queue to start processing jobs.</p>
        </div>
      ) : (
        <div className="data-grid">
          {queues.map((queue) => (
            <div className="data-card" key={queue.id}>
              <div className="data-card-icon">☷</div>

              <div>
                <h3>{queue.name}</h3>

                <p>
                  Priority: {queue.priority ?? 0}
                </p>

                <small>
                  Concurrency:{" "}
                  {queue.concurrency_limit ??
                    queue.concurrencyLimit ??
                    5}
                </small>

                <br />

                <small>
                  Status:{" "}
                  {queue.is_paused ||
                  queue.isPaused
                    ? "Paused"
                    : "Active"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Create Queue"
          onClose={() => !creating && setShowModal(false)}
        >
          <form onSubmit={handleCreate}>
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label>Project</label>

              <select
                value={projectId}
                onChange={(event) =>
                  setProjectId(event.target.value)
                }
                disabled={creating}
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Queue Name</label>

              <input
                type="text"
                placeholder="e.g. email-processing"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>

              <input
                type="number"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Concurrency Limit</label>

              <input
                type="number"
                min="1"
                value={concurrency}
                onChange={(event) =>
                  setConcurrency(event.target.value)
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
                  ? "Creating..."
                  : "Create Queue"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Queues;