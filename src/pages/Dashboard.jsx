import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const healthData = [
  { t: "10:00", health: 95 },
  { t: "10:05", health: 94 },
  { t: "10:10", health: 93 },
  { t: "10:15", health: 92 },
  { t: "10:20", health: 92 },
];

const archSteps = [
  { icon: "⚙️", label: "Physical Engine" },
  { icon: "📡", label: "Engine Sensors" },
  { icon: "🖥", label: "Digital Twin" },
  { icon: "🤖", label: "AI/ML Analysis" },
  { icon: "❤️", label: "Engine Health" },
  { icon: "🚨", label: "Fault Alert" },
];

const techItems = [
  { icon: "🐍", name: "Python" },
  { icon: "🤖", name: "AI / ML" },
  { icon: "🖥", name: "Digital Twin" },
  { icon: "📡", name: "Sensor Data" },
  { icon: "📊", name: "Data Visualization" },
];

export default function Dashboard({ setPage, hasFault }) {
  const dotColor = hasFault ? "dot-orange" : "dot-green";
  const sensors = [
    { id: "RPM",       label: "RPM",       val: hasFault ? "2680" : "2450", dotCls: "dot-green" },
    { id: "CHT",       label: "CHT",       val: "165 °C",                  dotCls: "dot-green" },
    { id: "EGT",       label: "EGT",       val: "720 °C",                  dotCls: "dot-green" },
    { id: "OIL",       label: "OIL",       val: "4.2 bar",                 dotCls: "dot-green" },
    { id: "VIBRATION", label: "VIBRATION", val: hasFault ? "HIGH" : "Normal", dotCls: hasFault ? "dot-orange" : "dot-green" },
  ];

  return (
    <>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-title">AeroTwin <span>AI</span></div>
        <div style={{fontSize:13,color:"#7fb8e8",fontWeight:600,letterSpacing:".5px"}}>AI-Powered Digital Twin for UAV Engine Health</div>
        <div className="hero-sub">
          An AI-enabled Digital Twin prototype for monitoring UAV aero-piston engine health,
          detecting abnormal behaviour and supporting predictive maintenance.
        </div>
        <div className="hero-badge-row">
          <span className="hero-badge">🛡 SIH Round-1 Prototype</span>
          <span className="hero-badge">✈ MALE UAV Engines</span>
          <span className="hero-badge">📡 Simulated Engine Data</span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid-4">
        <div className="card">
          <div className="card-title">⚙️ Engine Health</div>
          <div className="card-value">{hasFault ? "78" : "92"}<span className="card-unit">%</span></div>
          <div style={{marginTop:10}}>
            <div className="progress-bar-wrap">
              <div className={`progress-bar-fill ${hasFault?"fill-orange":"fill-green"}`} style={{width:`${hasFault?78:92}%`}}></div>
            </div>
          </div>
          <div style={{marginTop:8}}><span className={`badge ${hasFault?"badge-warning":"badge-healthy"}`}>● {hasFault?"DEGRADED":"HEALTHY"}</span></div>
        </div>
        <div className="card">
          <div className="card-title">🔄 Engine RPM</div>
          <div className="card-value">{hasFault?"2680":"2450"}<span className="card-unit">RPM</span></div>
          <div style={{marginTop:8}}><span className="badge badge-normal">● NORMAL</span></div>
        </div>
        <div className="card">
          <div className="card-title">🌡 Engine Temperature</div>
          <div className="card-value">178<span className="card-unit">°C</span></div>
          <div style={{marginTop:8}}><span className="badge badge-normal">● NORMAL</span></div>
        </div>
        <div className="card">
          <div className="card-title">📳 Engine Vibration</div>
          <div className="card-value" style={{fontSize:22}}>{hasFault?"HIGH":"Normal"}</div>
          <div style={{marginTop:8}}><span className={`badge ${hasFault?"badge-warning":"badge-normal"}`}>● {hasFault?"WARNING":"NORMAL"}</span></div>
        </div>
      </div>

      {/* Digital Twin Visual + Health Chart */}
      <div className="grid-2" style={{marginTop:20}}>
        {/* Digital Twin Visual */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">🖥 Digital Twin Representation</div>
            <span className="sim-tag">⚠ SIMULATED DATA</span>
          </div>
          <div className="twin-visual">
            <div style={{textAlign:"center"}}>
              <svg width="220" height="120" viewBox="0 0 220 120">
                {/* Engine body */}
                <rect x="30" y="40" width="160" height="50" rx="8" fill="#e8f0fb" stroke="#4a9edd" strokeWidth="2"/>
                {/* Cylinders */}
                {[0,1,2,3].map(i => (
                  <g key={i}>
                    <rect x={50+i*32} y="18" width="20" height="28" rx="4" fill="#c8d8f0" stroke="#4a9edd" strokeWidth="1.5"/>
                    <circle cx={60+i*32} cy="20" r="4" fill={hasFault && i===2 ? "#f59e0b" : "#1cb86a"}/>
                  </g>
                ))}
                {/* Exhaust pipe */}
                <rect x="170" y="55" width="28" height="12" rx="4" fill="#b8cce8" stroke="#4a9edd" strokeWidth="1.5"/>
                {/* Prop shaft */}
                <circle cx="28" cy="65" r="12" fill="#e8f0fb" stroke="#4a9edd" strokeWidth="2"/>
                <circle cx="28" cy="65" r="5" fill="#4a9edd"/>
                {/* Label */}
                <text x="110" y="108" textAnchor="middle" fontSize="10" fill="#5a6f8a" fontFamily="inherit" fontWeight="600">UAV AERO-PISTON ENGINE (SCHEMATIC)</text>
              </svg>
            </div>
            <div className="sensor-indicators">
              {sensors.map(s => (
                <div className="sensor-pill" key={s.id}>
                  <span className={`dot ${s.dotCls}`}></span>
                  {s.id}: {s.val}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Chart */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">📈 Engine Health Overview</div>
            <span className="sim-tag">⚠ SIMULATED DATA</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={healthData} margin={{top:4,right:16,left:-16,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6"/>
              <XAxis dataKey="t" tick={{fontSize:11,fill:"#5a6f8a"}}/>
              <YAxis domain={[88,98]} tick={{fontSize:11,fill:"#5a6f8a"}}/>
              <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #d0ddef"}}/>
              <Line
                type="monotone" dataKey="health" stroke="#1cb86a"
                strokeWidth={2.5} dot={{r:4,fill:"#1cb86a"}} activeDot={{r:6}}
                name="Health %"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="info-box" style={{marginTop:12}}>
            <span>ℹ️</span>
            <span>Engine parameters are currently within normal operating range.</span>
          </div>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="card mt-24">
        <div className="section-header">
          <div className="section-title">⚙️ How AeroTwin AI Works</div>
        </div>
        <div className="arch-flow">
          {archSteps.map((s, i) => (
            <>
              <div className="arch-step" key={s.label}>
                <div className="arch-icon">{s.icon}</div>
                <div className="arch-label">{s.label}</div>
              </div>
              {i < archSteps.length - 1 && <div className="arch-arrow" key={`arrow-${i}`}>→</div>}
            </>
          ))}
        </div>

        <div className="divider"></div>

        <div className="section-title" style={{marginBottom:12}}>🛠 Technology Stack</div>
        <div className="tech-tags">
          {techItems.map(t => (
            <div className="tech-tag" key={t.name}>{t.icon} {t.name}</div>
          ))}
        </div>
        <div className="info-box" style={{marginTop:16}}>
          <span>📌</span>
          <div>
            <strong>Round-1 Prototype Notice:</strong> This demonstration uses simulated engine data.
            In the full system, real UAV engine sensor data and trained AI/ML models would be connected for live health monitoring and fault prediction.
          </div>
        </div>
      </div>
    </>
  );
}
