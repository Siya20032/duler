function Header({ user, currentPage, onLogout }) {
  const name =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    "User";

  const email = user?.email || "";

  return (
    <header className="top-header">
      <div>
        <h1>{currentPage}</h1>
        <p>Distributed Job Scheduler</p>
      </div>

      <div className="header-user">
        <div className="user-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{name}</strong>
          <span>{email}</span>
        </div>

        <button
          type="button"
          className="header-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;