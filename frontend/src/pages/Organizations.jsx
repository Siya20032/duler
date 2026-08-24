import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loadOrganizations = async () => {
    try {
      setLoading(true);

      const response = await api.get("/organizations");

      setOrganizations(response.data || []);
    } catch (error) {
      console.error("Failed to load organizations:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to load organizations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/organizations", {
        name: name.trim(),
      });

      setName("");
      setShowModal(false);

      await loadOrganizations();
    } catch (error) {
      console.error("Create organization error:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to create organization."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Organizations</h2>
          <p>Manage organizations for your scheduler.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setError("");
            setName("");
            setShowModal(true);
          }}
        >
          + New Organization
        </button>
      </div>

      {error && !showModal && (
        <div className="auth-error">{error}</div>
      )}

      {loading ? (
        <div className="empty-panel">
          <h3>Loading organizations...</h3>
        </div>
      ) : organizations.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon">🏢</div>
          <h3>No organizations yet</h3>
          <p>Create your first organization to get started.</p>
        </div>
      ) : (
        <div className="data-grid">
          {organizations.map((organization) => (
            <div
              className="data-card"
              key={organization.id}
            >
              <div className="data-card-icon">🏢</div>

              <div>
                <h3>{organization.name}</h3>
                <p>
                  Slug: {organization.slug}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Create Organization"
          onClose={() => !creating && setShowModal(false)}
        >
          <form onSubmit={handleCreate}>
            {error && (
              <div className="auth-error">{error}</div>
            )}

            <div className="form-group">
              <label htmlFor="organization-name">
                Organization Name
              </label>

              <input
                id="organization-name"
                type="text"
                placeholder="e.g. My Company"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={creating}
                autoFocus
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
                  : "Create Organization"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Organizations;