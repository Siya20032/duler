function Sidebar({ currentPage, onNavigate, onLogout }) {
  const menuItems = [
    ["Dashboard", "▦"],
    ["Organizations", "🏢"],
    ["Projects", "📁"],
    ["Queues", "☷"],
    ["Jobs", "⚙"],
    ["Workers", "🖥"],
    ["Scheduled Jobs", "◷"],
    ["Dead Letter Queue", "⚠"],
    ["Metrics", "▥"],
    ["Settings", "⚙"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>

        <div>
          <div className="sidebar-title">Distributed</div>
          <div className="sidebar-subtitle">Job Scheduler</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">MAIN MENU</div>

        {menuItems.map(([name, icon]) => (
          <button
            key={name}
            type="button"
            className={`sidebar-item ${
              currentPage === name ? "active" : ""
            }`}
            onClick={() => onNavigate(name)}
          >
            <span className="sidebar-item-icon">{icon}</span>
            <span className="sidebar-item-label">{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <span className="sidebar-item-icon">↪</span>
          <span className="sidebar-item-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;