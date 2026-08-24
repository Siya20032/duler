import { useState } from "react";

function Settings({ user }) {
  const [name, setName] = useState(
    user?.full_name || user?.fullName || user?.name || ""
  );

  const email = user?.email || "";

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Manage your account settings.</p>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Profile</h3>

        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input type="email" value={email} disabled />
        </div>

        <button className="primary-button">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
