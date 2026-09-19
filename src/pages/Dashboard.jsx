import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchSensorHistory } from "../api/client";
import { useState, useEffect } from "react";

const archSteps = [
  { icon: "⚙️", label: "Physical Engine" },
  { icon: "📡", label: "Engine Sensors"  },
  { icon: "🖥",  label: "Digital Twin"    },
  { icon: "🤖", label: "AI/ML Analysis"  },
  { icon: "❤️", label: "Engine Health"   },
  { icon: "🚨", label: "Fault Alert"     },
];
const techItems = [
  { icon: "🐍", name: "Python FastAPI"    },
  { icon: "🤖", name: "Isolation Forest"  },
  { icon: "🌲", name: "Random Forest"     },
  { icon: "🖥",  name: "Digital Twin"      },
  { icon: "📊", name: "SQLite + Recharts" },
];

export default function Dashboard({ setPage, hasFault, liveData, wsConnected }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchSensorHistory(20);
      if (data && data.length > 0) setHistory(data);
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const d = liveData || {};
  const health = d.health_score ?? 92;
  const rpm    = d.rpm          ? Math.round(d.rpm) : 2450;
  const temp   = d.cht          ? Math.round(d.cht) : 178;
  const vib    = d.vibration    ? d.vibration.toFixed(1) : "3.0";
  const vibText = parseFloat(vib) > 5 ? "HIGH" : "Normal";
  const status  = d.status ?? "HEALTHY";

  const chartData = history.length > 0
    ? history.map(r => ({ t: r.t, health: r.health }))
    : [
        { t: "10:00", health: 95 }, { t: "10:05", health: 94 },
        { t: "10:10", health: 93 }, { t: "10:15", health: 92 },
        { t: "10:20", health: 92 },
      ];

  const sensors = [
    { id: "RPM",   val: `${rpm} RPM`,   dot: "dot-green" },
    { id: "CHT",   val: `${temp} °C`,   dot: "dot-green" },
    { id: "EGT",   val: `${d.egt ? Math.round(d.egt) : 720} °C`, dot: "dot-green" },
    { id: "OIL",   val: `${d.oil_pressure ? d.oil_pressure.toFixed(1) : "4.2"} bar`, dot: "dot-green" },
    { id: "VIB",   val: vibText, dot: parseFloat(vib) > 5 ? "dot-orange" : "dot-green" },
  ];

  const dataTag = wsConnected
    ? <span className="sim-tag live-tag">🟢 LIVE DATA</span>
    : <span className="sim-tag">⚠ SIMULATED DATA</span>;

  return (
    <>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-title">AeroTwin <span>AI</span></div>
        <div style={{ fontSize: 13, color: "#7fb8e8", fontWeight: 600 }}>
          AI-Powered Digital Twin for UAV Engine Health
        </div>
        <div className="hero-sub">
          An AI-enabled Digital Twin for monitoring UAV aero-piston engine health,
          detecting faults via Isolation Forest anomaly detection, and supporting predictive maintenance.
        </div>
        <div className="hero-badge-row">
          <span className="hero-badge">🛡 SIH Round-1 Prototype</span>
          <span className="hero-badge">✈ MALE UAV Engines</span>
          {wsConnected
            ? <span className="hero-badge" style={{background:"rgba(28,184,106,.25)",borderColor:"rgba(28,184,106,.5)"}}>🟢 Live Backend Connected</span>
            : <span className="hero-badge">📡 Simulated Data Mode</span>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <div className="card">
          <div className="card-title">⚙️ Engine Health</div>
          <div className="card-value">
            {Math.round(health)}<span className="card-unit">%</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="progress-bar-wrap">
              <div
                className={`progress-bar-fill ${health < 60 ? "fill-red" : health < 75 ? "fill-orange" : "fill-green"}`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${hasFault ? "badge-warning" : "badge-healthy"}`}>
              ● {status}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🔄 Engine RPM</div>
          <div className="card-value">{rpm}<span className="card-unit">RPM</span></div>
          <div style={{ marginTop: 8 }}><span className="badge badge-normal">● NORMAL</span></div>
        </div>

        <div className="card">
          <div className="card-title">🌡 Engine Temperature</div>
          <div className="card-value">{temp}<span className="card-unit">°C</span></div>
          <div style={{ marginTop: 8 }}><span className="badge badge-normal">● NORMAL</span></div>
        </div>

        <div className="card">
          <div className="card-title">📳 Engine Vibration</div>
          <div className="card-value" style={{ fontSize: 22 }}>{vibText}</div>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${parseFloat(vib) > 5 ? "badge-warning" : "badge-normal"}`}>
              ● {parseFloat(vib) > 5 ? "WARNING" : "NORMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Twin Visual + Chart */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">🖥 Digital Twin Representation</div>
            {dataTag}
          </div>
          <div className="twin-visual">
            <svg width="220" height="120" viewBox="0 0 220 120">
              <rect x="30" y="40" width="160" height="50" rx="8" fill="#e8f0fb" stroke="#4a9edd" strokeWidth="2"/>
              {[0,1,2,3].map(i => (
                <g key={i}>
                  <rect x={50+i*32} y="18" width="20" height="28" rx="4" fill="#c8d8f0" stroke="#4a9edd" strokeWidth="1.5"/>
                  <circle cx={60+i*32} cy="20" r="4" fill={hasFault && i===2 ? "#f59e0b" : "#1cb86a"}/>
                </g>
              ))}
              <rect x="170" y="55" width="28" height="12" rx="4" fill="#b8cce8" stroke="#4a9edd" strokeWidth="1.5"/>
              <circle cx="28" cy="65" r="12" fill="#e8f0fb" stroke="#4a9edd" strokeWidth="2"/>
              <circle cx="28" cy="65" r="5" fill="#4a9edd"/>
              <text x="110" y="108" textAnchor="middle" fontSize="10" fill="#5a6f8a" fontFamily="inherit" fontWeight="600">
                UAV AERO-PISTON ENGINE
              </text>
            </svg>
            <div className="sensor-indicators">
              {sensors.map(s => (
                <div className="sensor-pill" key={s.id}>
                  <span className={`dot ${s.dot}`}></span>
                  {s.id}: {s.val}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">📈 Engine Health Trend</div>
            {dataTag}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6"/>
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#5a6f8a" }}/>
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "#5a6f8a" }}/>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #d0ddef" }}/>
              <Line type="monotone" dataKey="health" stroke="#1cb86a" strokeWidth={2.5}
                dot={{ r: 3, fill: "#1cb86a" }} activeDot={{ r: 6 }} name="Health %"/>
            </LineChart>
          </ResponsiveContainer>
          <div className="info-box" style={{ marginTop: 10 }}>
            <span>ℹ️</span>
            <span>
              {wsConnected
                ? "Live health scores computed by the Random Forest Regressor every 2 seconds."
                : "Engine parameters are within normal operating range."}
            </span>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="card mt-24">
        <div className="section-header">
          <div className="section-title">⚙️ How AeroTwin AI Works</div>
        </div>
        <div className="arch-flow">
          {archSteps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="arch-step">
                <div className="arch-icon">{s.icon}</div>
                <div className="arch-label">{s.label}</div>
              </div>
              {i < archSteps.length - 1 && <div className="arch-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
        <div className="divider"/>
        <div className="section-title" style={{ marginBottom: 12 }}>🛠 Technology Stack</div>
        <div className="tech-tags">
          {techItems.map(t => (
            <div className="tech-tag" key={t.name}>{t.icon} {t.name}</div>
          ))}
        </div>
      </div>
    </>
  );
}
