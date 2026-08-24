import { useEffect, useState } from "react";
import api from "../api";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

function Dashboard() {
  const [backendStatus, setBackendStatus] =
    useState("Checking...");

  const [databaseStatus, setDatabaseStatus] =
    useState("Checking...");

  const [metrics, setMetrics] = useState(null);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/health");

      setBackendStatus(
        response.data?.status || "healthy"
      );
    } catch {
      setBackendStatus("offline");
    }

    try {
      const response =
        await api.get("/health/database");

      setDatabaseStatus(
        response.data?.database || "connected"
      );
    } catch {
      setDatabaseStatus("disconnected");
    }

    try {
      const response =
        await api.get("/metrics/overview");

      setMetrics(response.data);
    } catch (error) {
      console.error(
        "Failed to load dashboard metrics:",
        error
      );
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(
      loadDashboard,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Dashboard Overview</h2>

          <p>
            Monitor your distributed job scheduling
            system in real time.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Jobs"
          value={metrics?.total_jobs ?? 0}
          description="Total jobs"
          icon="⚙"
        />

        <StatCard
          title="Queues"
          value={metrics?.total_queues ?? 0}
          description="Scheduler queues"
          icon="☷"
        />

        <StatCard
          title="Workers"
          value={metrics?.total_workers ?? 0}
          description={
            metrics
              ? `${metrics.active_workers ?? 0} online`
              : "Registered workers"
          }
          icon="🖥"
        />

        <StatCard
          title="Completed"
          value={metrics?.completed_jobs ?? 0}
          description="Successfully completed"
          icon="✓"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>System Status</h3>

              <p>
                Current scheduler infrastructure
              </p>
            </div>
          </div>

          <div className="status-list">
            <div className="status-row">
              <span>Backend API</span>

              <StatusBadge
                status={backendStatus}
              />
            </div>

            <div className="status-row">
              <span>PostgreSQL Database</span>

              <StatusBadge
                status={databaseStatus}
              />
            </div>

            <div className="status-row">
              <span>Scheduler</span>

              <StatusBadge status="running" />
            </div>

            <div className="status-row">
              <span>Workers Online</span>

              <strong>
                {metrics?.active_workers ?? 0}
              </strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Job Summary</h3>

              <p>
                Current scheduler activity
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
        </section>
      </div>
    </div>
  );
}

export default Dashboard;