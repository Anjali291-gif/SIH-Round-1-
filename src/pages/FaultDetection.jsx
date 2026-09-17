import { useState } from "react";

const normalConditions = [
  { name: "Combustion", status: "normal", icon: "🔥" },
  { name: "Lubrication", status: "normal", icon: "🛢" },
  { name: "Temperature", status: "normal", icon: "🌡" },
  { name: "Vibration", status: "normal", icon: "📳" },
];

const faultConditions = [
  { name: "Combustion", status: "normal", icon: "🔥" },
  { name: "Lubrication", status: "normal", icon: "🛢" },
  { name: "Temperature", status: "normal", icon: "🌡" },
  { name: "Vibration", status: "warning", icon: "📳" },
];

const badgeMap = {
  normal:   ["badge badge-normal",   "NORMAL"  ],
  warning:  ["badge badge-warning",  "WARNING" ],
  critical: ["badge badge-critical", "CRITICAL"],
};

export default function FaultDetection({ hasFault, setHasFault }) {
  const [analysisRun, setAnalysisRun] = useState(hasFault);

  function runAnalysis() {
    setHasFault(false);
    setAnalysisRun(true);
  }
  function simulateFault() {
    setHasFault(true);
    setAnalysisRun(true);
  }

  const conditions = hasFault ? faultConditions : normalConditions;

  return (
    <>
      <div className="page-title">AI Fault Detection</div>
      <div className="page-sub">Simulated AI analysis of UAV engine sensor parameters</div>

      <div className="grid-2">
        {/* Control Panel */}
        <div className="card">
          <div className="card-title">ANALYSIS CONTROLS</div>
          <p style={{fontSize:13,color:"#5a6f8a",marginBottom:16,lineHeight:1.6}}>
            Click <strong>Run Health Analysis</strong> to analyse current simulated sensor values.
            Click <strong>Simulate Fault</strong> to inject an abnormal vibration scenario.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button className="btn btn-primary" onClick={runAnalysis} style={{width:"100%",justifyContent:"center"}}>
              🔍 Run Health Analysis
            </button>
            <button className="btn btn-warn" onClick={simulateFault} style={{width:"100%",justifyContent:"center"}}>
              ⚠️ Simulate Fault
            </button>
            {hasFault && (
              <button className="btn btn-outline" onClick={()=>{setHasFault(false);setAnalysisRun(false);}} style={{width:"100%",justifyContent:"center"}}>
                ↩ Reset to Normal
              </button>
            )}
          </div>
          <div className="info-box" style={{marginTop:16}}>
            <span>🤖</span>
            <span style={{fontSize:12}}>This is a simulated AI demonstration. In the final system, a trained anomaly detection model would process real sensor data.</span>
          </div>
        </div>

        {/* Analysis Result */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">🤖 AI Analysis Result</div>
            <span className="sim-tag">⚠ SIMULATED</span>
          </div>

          {!analysisRun && (
            <div style={{textAlign:"center",padding:"32px 0",color:"#5a6f8a"}}>
              <div style={{fontSize:32,marginBottom:8}}>🔍</div>
              <div style={{fontSize:13}}>Run analysis to see AI output</div>
            </div>
          )}

          {analysisRun && !hasFault && (
            <div className="fault-result ok">
              <div className="fault-icon">✅</div>
              <div className="fault-title">No Critical Fault Detected</div>
              <div className="fault-sub">Engine condition: <strong>NORMAL</strong></div>
              <div className="fault-sub">All monitored parameters are within acceptable ranges. No immediate maintenance action required.</div>
            </div>
          )}

          {analysisRun && hasFault && (
            <div className="fault-result warn">
              <div className="fault-icon">⚠️</div>
              <div className="fault-title">ABNORMAL VIBRATION DETECTED</div>
              <div className="fault-sub">Engine condition: <strong style={{color:"#d97706"}}>DEGRADED</strong></div>
              <div className="divider" style={{margin:"8px 0"}}></div>
              <div style={{fontSize:13,fontWeight:600,color:"#1a2940"}}>Recommended Action:</div>
              <div className="fault-sub">"Inspect engine vibration and associated mechanical components. Check propeller balance, engine mounts, and cylinder head integrity."</div>
              <div style={{marginTop:6}}>
                <span className="badge badge-warning">● MAINTENANCE ADVISORY</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monitored Conditions */}
      {analysisRun && (
        <div className="card mt-16">
          <div className="section-header">
            <div className="section-title">🔎 Monitored Engine Conditions</div>
            <span className="sim-tag">⚠ SIMULATED DATA</span>
          </div>
          <div className="grid-4">
            {conditions.map(c => (
              <div className="param-card" key={c.name}>
                <div style={{fontSize:24,marginBottom:4}}>{c.icon}</div>
                <div className="param-name">{c.name}</div>
                <span className={badgeMap[c.status][0]}>{badgeMap[c.status][1]}</span>
                {c.status === "warning" && (
                  <div style={{fontSize:11,color:"#d97706",marginTop:4}}>Abnormal readings detected</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
