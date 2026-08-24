import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [projectsResponse, organizationsResponse] =
        await Promise.all([
          api.get("/projects"),
          api.get("/organizations"),
        ]);

      setProjects(projectsResponse.data || []);
      setOrganizations(organizationsResponse.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to load projects."
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

    if (!organizationId) {
      setError("Please select an organization.");
      return;
    }

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/projects", {
        organization_id: organizationId,
        name: name.trim(),
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setOrganizationId("");
      setShowModal(false);

      await loadData();
    } catch (error) {
      console.error("Create project error:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Projects</h2>
          <p>Manage projects and their scheduled jobs.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setError("");
            setName("");
            setDescription("");
            setOrganizationId("");
            setShowModal(true);
          }}
        >
          + New Project
        </button>
      </div>

      {error && !showModal && (
        <div className="auth-error">{error}</div>
      )}

      {loading ? (
        <div className="empty-panel">
          <h3>Loading projects...</h3>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>
            Create a project to organize your distributed jobs.
          </p>
        </div>
      ) : (
        <div className="data-grid">
          {projects.map((project) => (
            <div className="data-card" key={project.id}>
              <div className="data-card-icon">📁</div>

              <div>
                <h3>{project.name}</h3>

                <p>
                  {project.description ||
                    "No description"}
                </p>

                <small>
                  Status:{" "}
                  {project.is_active === false ||
                  project.isActive === false
                    ? "Inactive"
                    : "Active"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Create Project"
          onClose={() => !creating && setShowModal(false)}
        >
          <form onSubmit={handleCreate}>
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label>Organization</label>

              <select
                value={organizationId}
                onChange={(event) =>
                  setOrganizationId(event.target.value)
                }
                disabled={creating}
              >
                <option value="">
                  Select organization
                </option>

                {organizations.map((organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Project Name</label>

              <input
                type="text"
                placeholder="e.g. Payment Processing"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                placeholder="Project description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                disabled={creating}
                rows="4"
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
                  : "Create Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Projects;