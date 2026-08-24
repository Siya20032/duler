import { useEffect, useState } from "react";
import api from "../api";

function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = async () => {
    try {
      setError("");

      const response = await api.get("/metrics/overview");

      setMetrics(response.data);
    } catch (error) {
      console.error("Failed to load metrics:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to load metrics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();

    // Refresh metrics every 5 seconds
    const interval = setInterval(loadMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="empty-panel">
          <div className="empty-icon">⏳</div>
          <h3>Loading metrics...</h3>
          <p>Please wait while metrics are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Metrics</h2>

          <p>
            Monitor scheduler performance and job execution.
          </p>
        </div>
      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="metric-box">
          <span>Total Executions</span>

          <strong>
            {metrics?.total_executions ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Successful</span>

          <strong>
            {metrics?.successful_executions ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Failed</span>

          <strong>
            {metrics?.failed_executions ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Total Jobs</span>

          <strong>
            {metrics?.total_jobs ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Completed Jobs</span>

          <strong>
            {metrics?.completed_jobs ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Failed Jobs</span>

          <strong>
            {metrics?.failed_jobs ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Workers</span>

          <strong>
            {metrics?.active_workers ?? 0}
          </strong>
        </div>

        <div className="metric-box">
          <span>Queues</span>

          <strong>
            {metrics?.total_queues ?? 0}
          </strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Execution Summary</h3>

            <p>
              Current distributed scheduler execution status.
            </p>
          </div>
        </div>

        <div className="quick-actions">
          <div>
            Queued:{" "}
            <strong>
              {metrics?.queued_jobs ?? 0}
            </strong>
          </div>

          <div>
            Scheduled:{" "}
            <strong>
              {metrics?.scheduled_jobs ?? 0}
            </strong>
          </div>

          <div>
            Running:{" "}
            <strong>
              {metrics?.running_jobs ?? 0}
            </strong>
          </div>

          <div>
            Completed:{" "}
            <strong>
              {metrics?.completed_jobs ?? 0}
            </strong>
          </div>

          <div>
            Failed:{" "}
            <strong>
              {metrics?.failed_jobs ?? 0}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metrics;