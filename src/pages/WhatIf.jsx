import { useState } from "react";

function getCondition(rpm, temp, vib) {
  let score = 100;
  // RPM penalties
  if (rpm > 2800) score -= 10;
  else if (rpm > 2600) score -= 4;
  // Temperature penalties
  if (temp > 200) score -= 25;
  else if (temp > 185) score -= 15;
  else if (temp > 175) score -= 6;
  // Vibration penalties
  if (vib > 7) score -= 30;
  else if (vib > 5) score -= 18;
  else if (vib > 4) score -= 8;

  if (score >= 80) return { status: "HEALTHY",  cls: "healthy",  color: "#1cb86a", score };
  if (score >= 55) return { status: "WARNING",  cls: "warning",  color: "#f59e0b", score };
  return              { status: "CRITICAL", cls: "critical", color: "#e53935", score };
}

export default function WhatIf() {
  const [rpm,  setRpm]  = useState(2450);
  const [temp, setTemp] = useState(165);
  const [vib,  setVib]  = useState(3);

  const result = getCondition(rpm, temp, vib);

  return (
    <>
      <div className="page-title">What-If Engine Simulation</div>
      <div className="page-sub">Explore how changes in engine conditions may affect engine health.</div>

      <div className="grid-2">
        {/* Sliders */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">🎛 Engine Parameters</div>
            <span className="sim-tag">⚠ SIMULATED</span>
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">🔄 Engine RPM</span>
              <span className="slider-val">{rpm} RPM</span>
            </div>
            <input type="range" min={1500} max={3000} value={rpm}
              onChange={e=>setRpm(Number(e.target.value))}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#5a6f8a",marginTop:3}}>
              <span>1500 RPM</span><span>3000 RPM</span>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">🌡 Engine Temperature</span>
              <span className="slider-val">{temp} °C</span>
            </div>
            <input type="range" min={100} max={220} value={temp}
              onChange={e=>setTemp(Number(e.target.value))}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#5a6f8a",marginTop:3}}>
              <span>100 °C</span><span>220 °C</span>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">📳 Vibration Level</span>
              <span className="slider-val">{vib} / 10</span>
            </div>
            <input type="range" min={0} max={10} value={vib}
              onChange={e=>setVib(Number(e.target.value))}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#5a6f8a",marginTop:3}}>
              <span>0 (None)</span><span>10 (Severe)</span>
            </div>
          </div>

          <div className="info-box mt-8">
            <span>ℹ️</span>
            <span style={{fontSize:12}}>
              This simulation uses a rule-based scoring model for Round-1 demonstration.
              In the final system, a trained ML model (e.g. regression or neural network) would be used.
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="card" style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="section-title">📊 Predicted Engine Condition</div>

          <div className={`whatif-result ${result.cls}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <div className="whatif-label">Predicted Condition</div>
            <div className="whatif-status" style={{color:result.color}}>{result.status}</div>
            <div className="whatif-score">Health Score: <strong>{result.score}%</strong></div>
          </div>

          {/* Summary */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#f4f7fb",borderRadius:8}}>
              <span style={{fontSize:13,color:"#5a6f8a"}}>Engine RPM</span>
              <strong style={{color:"#0d2144"}}>{rpm} RPM</strong>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#f4f7fb",borderRadius:8}}>
              <span style={{fontSize:13,color:"#5a6f8a"}}>Engine Temperature</span>
              <strong style={{color:temp>185?"#e53935":temp>175?"#f59e0b":"#0d2144"}}>{temp} °C</strong>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#f4f7fb",borderRadius:8}}>
              <span style={{fontSize:13,color:"#5a6f8a"}}>Vibration Level</span>
              <strong style={{color:vib>7?"#e53935":vib>5?"#f59e0b":"#0d2144"}}>{vib} / 10</strong>
            </div>
          </div>

          {result.cls !== "healthy" && (
            <div className="fault-result warn" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#d97706"}}>
                ⚠️ {result.cls === "critical" ? "CRITICAL: " : "WARNING: "}
                High {temp > 185 ? "temperature" : ""}{temp > 185 && vib > 5 ? " and " : ""}{vib > 5 ? "vibration" : ""}
                {" "}may indicate abnormal engine behaviour.
              </div>
              <div style={{fontSize:12,color:"#92400e",marginTop:4}}>
                Recommend inspection before next flight mission.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
