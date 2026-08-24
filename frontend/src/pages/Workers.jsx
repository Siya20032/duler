import { useEffect, useState } from "react";
import api from "../api";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadWorkers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      console.log("Fetching workers...");

      const response = await api.get("/workers");

      console.log("Workers response:", response.data);

      setWorkers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load workers:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load workers."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkers();

    const interval = setInterval(() => {
      loadWorkers(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getWorkerStatusClass = (status) => {
    if (status === "online") {
      return "status-badge status-success";
    }

    if (status === "offline") {
      return "status-badge status-danger";
    }

    return "status-badge status-neutral";
  };

  return (
    <div className="page">

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <h2>Workers</h2>

          <p>
            Monitor workers connected to your distributed
            job scheduler.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            console.log("Refresh button clicked");
            loadWorkers(true);
          }}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="professional-auth-error">
          <div className="auth-error-icon">!</div>

          <div>
            <strong>Unable to load workers</strong>

            <span>{error}</span>
          </div>
        </div>
      )}

      {/* INITIAL LOADING */}
      {loading && (
        <div className="empty-panel">
          <div className="loading-spinner"></div>

          <h3>Loading workers</h3>

          <p>
            Checking connected worker instances...
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && workers.length === 0 && (
        <div className="empty-panel">

          <div className="empty-icon">
            ⚙
          </div>

          <h3>No workers found</h3>

          <p>
            Start a worker service to see it here.
          </p>
        </div>
      )}

      {/* WORKERS TABLE */}
      {!loading && workers.length > 0 && (
        <div className="data-panel">

          <table className="data-table">

            <thead>
              <tr>
                <th>Worker</th>
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
                      {worker.name || "Unnamed Worker"}
                    </strong>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "11px",
                        color: "#9ca3af",
                      }}
                    >
                      ID: {worker.id}
                    </div>
                  </td>

                  <td>
                    {worker.hostname || "-"}
                  </td>

                  <td>
                    <span
                      className={getWorkerStatusClass(
                        worker.status
                      )}
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