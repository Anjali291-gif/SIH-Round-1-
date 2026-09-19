import { BASE_URL } from "../api/client";

export default function Navbar({ page, setPage, wsConnected }) {
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

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {wsConnected ? (
          <div className="status-badge live">
            <span className="status-dot live-dot"></span>
            LIVE DATA
          </div>
        ) : (
          <div className="status-badge">
            <span className="status-dot"></span>
            SYSTEM ONLINE
          </div>
        )}
        {wsConnected && (
          <a
            href={`${BASE_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(0,180,216,.15)",
              border: "1px solid rgba(0,180,216,.3)",
              color: "#00b4d8",
              fontSize: 11, fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              textDecoration: "none",
              letterSpacing: ".4px",
            }}
          >API DOCS ↗</a>
        )}
      </div>
    </nav>
  );
}
