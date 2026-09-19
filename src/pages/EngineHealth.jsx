import { useState, useEffect } from "react";
import CircProgress from "../components/CircProgress";
import { fetchEngineHealth } from "../api/client";

const FEATURE_COLORS = {
  Vibration:      "#e53935",
  CHT:            "#f59e0b",
  EGT:            "#fb923c",
  "Oil Pressure": "#3b82f6",
  RPM:            "#8b5cf6",
  "Oil Temp":     "#06b6d4",
  "Fuel Flow":    "#1cb86a",
};

const systems = [
  "Combustion System",
  "Lubrication System",
  "Thermal Management",
  "Mechanical Integrity",
  "Fuel System",
];

export default function EngineHealth({ hasFault, liveData, wsConnected }) {
  const [mlData, setMlData] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchEngineHealth();
      if (data) setMlData(data);
    }
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const score  = mlData?.health_score ?? liveData?.health_score ?? 92;
  const status = mlData?.status       ?? liveData?.status       ?? "HEALTHY";
  const importance = mlData?.feature_importance ?? {};
  const isHealthy  = score >= 75;
  const scoreColor = score >= 75 ? "#1cb86a" : score >= 55 ? "#f59e0b" : "#e53935";
  const dataTag    = wsConnected
    ? <span className="sim-tag live-tag">🟢 LIVE ML DATA</span>
    : <span className="sim-tag">⚠ SIMULATED DATA</span>;

  // Build parameter display from liveData
  const d = liveData || {};
  const params = [
    { name: "RPM",          val: d.rpm          ? Math.round(d.rpm)          : 2450,  unit: "",    status: "normal" },
    { name: "CHT",          val: d.cht          ? d.cht.toFixed(1)           : "165", unit: "°C",  status: "normal" },
    { name: "EGT",          val: d.egt          ? Math.round(d.egt)          : 720,   unit: "°C",  status: "normal" },
    { name: "Oil Pressure", val: d.oil_pressure ? d.oil_pressure.toFixed(2)  : "4.2", unit: "bar", status: "normal" },
    { name: "Vibration",    val: d.vibration    ? d.vibration.toFixed(2)     : "3.0", unit: "mm/s",
      status: d.vibration > 5 ? "warning" : "normal" },
  ];

  const badgeMap = {
    normal:  ["badge badge-normal",  "NORMAL" ],
    warning: ["badge badge-warning", "WARNING"],
  };

  return (
    <>
      <div className="page-title">Engine Health Monitoring</div>
      <div className="page-sub">
        {wsConnected ? "ML-powered live health assessment via Random Forest Regressor" : "Simulated health assessment of UAV aero-piston engine"}
      </div>

      <div className="grid-2">
        {/* Circular score */}
        <div className="card" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"32px 22px" }}>
          <div className="card-title" style={{ textAlign:"center" }}>ENGINE HEALTH SCORE</div>
          <CircProgress value={Math.round(score)} size={150} stroke={13} color={scoreColor}/>
          <span className={`badge ${isHealthy ? "badge-healthy" : "badge-warning"}`}
            style={{ fontSize:13, padding:"5px 18px" }}>● {status}</span>
          <div style={{ fontSize:12,color:"#5a6f8a",textAlign:"center",maxWidth:240 }}>
            {wsConnected
              ? "Computed by RandomForestRegressor trained on 1,550 engine state samples."
              : "Health score calculated from simulated engine parameters."}
          </div>
          {dataTag}
        </div>

        {/* Feature Importance */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">
              {Object.keys(importance).length > 0 ? "🌲 ML Feature Importance" : "📋 Subsystem Status"}
            </div>
            {dataTag}
          </div>

          {Object.keys(importance).length > 0 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:10,marginTop:4 }}>
              {Object.entries(importance)
                .sort((a,b) => b[1]-a[1])
                .map(([name, pct]) => (
                  <div key={name}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <span style={{ fontSize:12,fontWeight:600,color:"#1a2940" }}>{name}</span>
                      <span style={{ fontSize:12,color:"#5a6f8a" }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div style={{
                        height:"100%", borderRadius:6,
                        background: FEATURE_COLORS[name] || "#4a9edd",
                        width:`${pct}%`, transition:"width .5s"
                      }}/>
                    </div>
                  </div>
                ))}
              <div className="info-box" style={{ marginTop:8 }}>
                <span>🤖</span>
                <span style={{ fontSize:12 }}>
                  Importance shows which sensor contributes most to the health score.
                  High Vibration importance during fault = vibration is the primary degradation driver.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginTop:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:13,fontWeight:600 }}>Overall Health</span>
                <strong style={{ fontSize:20,color:"#0d2144" }}>{Math.round(score)}%</strong>
              </div>
              <div className="progress-bar-wrap">
                <div className={`progress-bar-fill ${isHealthy ? "fill-green" : "fill-orange"}`} style={{ width:`${score}%` }}/>
              </div>
              <div className="divider" style={{ margin:"4px 0" }}/>
              {systems.map(s => (
                <div key={s} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:13,color:"#1a2940" }}>{s}</span>
                  <span className="badge badge-normal">NORMAL</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Parameter Cards */}
      <div style={{ marginTop:20 }}>
        <div className="section-header">
          <div className="section-title">📊 Live Sensor Parameters</div>
          {dataTag}
        </div>
        <div className="grid-5">
          {params.map(p => (
            <div className="param-card" key={p.name}>
              <div className="param-name">{p.name}</div>
              <div className="param-val">{p.val}<span className="param-unit">{p.unit}</span></div>
              <span className={badgeMap[p.status][0]}>{badgeMap[p.status][1]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
