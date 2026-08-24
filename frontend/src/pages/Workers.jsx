import { useEffect, useState } from "react";
import api from "../api";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/workers");

      setWorkers(response.data || []);
    } catch (err) {
      console.error("Failed to load workers:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load workers"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkers();

    const interval = setInterval(loadWorkers, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Workers</h1>
          <p>
            Monitor workers connected to your job scheduler.
          </p>
        </div>

        <button
          onClick={loadWorkers}
          className="btn"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="card">
          Loading workers...
        </div>
      )}

      {error && (
        <div className="card error">
          {error}
        </div>
      )}

      {!loading && !error && workers.length === 0 && (
        <div className="card">
          <h3>No workers found</h3>
          <p>
            Start a worker to see it here.
          </p>
        </div>
      )}

      {!loading && workers.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Hostname</th>
                <th>Status</th>
                <th>Concurrency</th>
                <th>Last Heartbeat</th>
              </tr>
            </thead>

            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <strong>
                      {worker.name}
                    </strong>
                  </td>

                  <td>
                    {worker.hostname || "-"}
                  </td>

                  <td>
                    <span
                      className={
                        worker.status === "online"
                          ? "status-badge success"
                          : "status-badge"
                      }
                    >
                      {worker.status || "offline"}
                    </span>
                  </td>

                  <td>
                    {worker.concurrency ?? "-"}
                  </td>

                  <td>
                    {worker.last_heartbeat_at
                      ? new Date(
                          worker.last_heartbeat_at
                        ).toLocaleString()
                      : worker.lastHeartbeatAt
                      ? new Date(
                          worker.lastHeartbeatAt
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Workers;