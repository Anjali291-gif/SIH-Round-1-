export default function Navbar({ page, setPage }) {
  const links = [
    { id: "dashboard", label: "Dashboard" },
    { id: "health",    label: "Engine Health" },
    { id: "sensors",   label: "Sensors" },
    { id: "fault",     label: "Fault Detection" },
    { id: "whatif",    label: "What-If" },
  ];
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setPage("dashboard")}>
        <div className="brand-icon">✈</div>
        <div className="brand-col">
          <span>AeroTwin <span className="accent">AI</span></span>
          <span className="tagline">UAV Engine Digital Twin</span>
        </div>
      </div>
      <div className="navbar-nav">
        {links.map(l => (
          <button
            key={l.id}
            className={`nav-link${page === l.id ? " active" : ""}`}
            onClick={() => setPage(l.id)}
          >{l.label}</button>
        ))}
      </div>
      <div className="status-badge">
        <span className="status-dot"></span>
        SYSTEM ONLINE
      </div>
    </nav>
  );
}
