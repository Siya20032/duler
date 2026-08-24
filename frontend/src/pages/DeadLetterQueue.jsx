import { useEffect, useState } from "react";
import api from "../api";

function DeadLetterQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeadLetterQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dlq");

      setItems(response.data?.items || []);
    } catch (error) {
      console.error(
        "Failed to load dead letter queue:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to load the dead letter queue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeadLetterQueue();
  }, []);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  };

  const handleRetry = async (id) => {
    try {
      setError("");

      await api.post(`/dlq/${id}/retry`);

      await loadDeadLetterQueue();
    } catch (error) {
      console.error(
        "Failed to retry DLQ job:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to retry this job."
      );
    }
  };

  const handleResolve = async (id) => {
    try {
      setError("");

      await api.post(`/dlq/${id}/resolve`);

      await loadDeadLetterQueue();
    } catch (error) {
      console.error(
        "Failed to resolve DLQ entry:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to resolve this DLQ entry."
      );
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Dead Letter Queue</h2>

          <p>
            Review jobs that could not be processed
            successfully.
          </p>
        </div>

        <button
          type="button"
          className="auth-button"
          onClick={loadDeadLetterQueue}
          disabled={loading}
          style={{
            width: "auto",
            padding: "8px 14px",
            fontSize: "13px",
            minWidth: "80px",
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-panel">
          <div className="empty-icon">⏳</div>

          <h3>
            Loading dead letter queue...
          </h3>

          <p>
            Retrieving failed jobs from the
            scheduler.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">⚠</div>

          <h3>
            Dead letter queue is empty
          </h3>

          <p>
            Failed jobs requiring attention
            will appear here.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Failed Jobs</h3>

              <p>
                {items.length} job
                {items.length === 1
                  ? ""
                  : "s"} require attention.
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Reason</th>
                  <th>Final Error</th>
                  <th>Failed At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.job_id ||
                          item.jobId ||
                          "—"}
                      </strong>
                    </td>

                    <td>
                      {item.reason || "—"}
                    </td>

                    <td>
                      {item.final_error ||
                        item.finalError ||
                        "—"}
                    </td>

                    <td>
                      {formatDate(
                        item.failed_at ||
                          item.failedAt
                      )}
                    </td>

                    <td>
                      {item.resolved_at ||
                      item.resolvedAt ? (
                        <span className="status-badge">
                          Resolved
                        </span>
                      ) : (
                        <span className="status-badge">
                          Failed
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="quick-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleRetry(
                              item.id
                            )
                          }
                        >
                          Retry
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleResolve(
                              item.id
                            )
                          }
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeadLetterQueue;