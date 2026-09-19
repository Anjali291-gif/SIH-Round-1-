import { useState } from "react";
import { analyzeFault, simulateFault, resetFault } from "../api/client";

const badgeMap = {
  normal:   ["badge badge-normal",   "NORMAL"  ],
  warning:  ["badge badge-warning",  "WARNING" ],
  critical: ["badge badge-critical", "CRITICAL"],
};

export default function FaultDetection({ hasFault, setHasFault, liveData, wsConnected }) {
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [analysisRun, setAnalysisRun] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    const data = await analyzeFault();
    setLoading(false);
    if (data) {
      setResult(data);
      setHasFault(data.is_anomaly);
    } else {
      // Offline fallback
      setResult({ is_anomaly: false, prediction_label:"NORMAL", confidence:96, anomaly_score:-0.12,
        fault_type:null, recommendation:"No fault detected.",
        conditions:{Combustion:"NORMAL",Lubrication:"NORMAL",Temperature:"NORMAL",Vibration:"NORMAL"},
        health_score:92, engine_status:"HEALTHY", model:"(offline – simulated)", current_readings:{} });
      setHasFault(false);
    }
    setAnalysisRun(true);
  }

  async function handleSimFault() {
    setLoading(true);
    await simulateFault("vibration");
    const data = await analyzeFault();
    setLoading(false);
    if (data) {
      setResult(data);
      setHasFault(data.is_anomaly);
    } else {
      setResult({ is_anomaly:true, prediction_label:"ANOMALY", confidence:88.5, anomaly_score:-0.54,
        fault_type:"Mechanical Vibration",
        recommendation:"Inspect engine mounts, propeller balance and cylinder head integrity.",
        conditions:{Combustion:"NORMAL",Lubrication:"NORMAL",Temperature:"NORMAL",Vibration:"WARNING"},
        health_score:63, engine_status:"DEGRADED", model:"(offline – simulated)", current_readings:{} });
      setHasFault(true);
    }
    setAnalysisRun(true);
  }

  async function handleReset() {
    await resetFault();
    setHasFault(false);
    setResult(null);
    setAnalysisRun(false);
  }

  const dataTag = wsConnected
    ? <span className="sim-tag live-tag">🟢 LIVE ML</span>
    : <span className="sim-tag">⚠ SIMULATED</span>;

  return (
    <>
      <div className="page-title">AI Fault Detection</div>
      <div className="page-sub">
        {wsConnected
          ? "Powered by Isolation Forest (n=300) trained on 1,200 engine state samples"
          : "Simulated AI analysis of engine sensor parameters"}
      </div>

      <div className="grid-2">
        {/* Controls */}
        <div className="card">
          <div className="card-title">ANALYSIS CONTROLS</div>
          <p style={{ fontSize:13,color:"#5a6f8a",marginBottom:16,lineHeight:1.7 }}>
            <strong>Run Health Analysis</strong> — runs the Isolation Forest model on the latest sensor snapshot.<br/>
            <strong>Simulate Fault</strong> — injects a vibration anomaly into the data stream, then re-runs the model.
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <button className="btn btn-primary" onClick={handleAnalyze}
              disabled={loading} style={{ width:"100%",justifyContent:"center" }}>
              {loading ? "⏳ Analysing…" : "🔍 Run Health Analysis"}
            </button>
            <button className="btn btn-warn" onClick={handleSimFault}
              disabled={loading} style={{ width:"100%",justifyContent:"center" }}>
              {loading ? "⏳ Injecting…" : "⚠️ Simulate Fault"}
            </button>
            {analysisRun && (
              <button className="btn btn-outline" onClick={handleReset}
                style={{ width:"100%",justifyContent:"center" }}>
                ↩ Reset to Normal
              </button>
            )}
          </div>

          {result && (
            <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:8 }}>
              <div className="divider" style={{ margin:"4px 0" }}/>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:".6px",color:"#5a6f8a",textTransform:"uppercase" }}>
                Model Output
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                <span style={{ color:"#5a6f8a" }}>Model</span>
                <span style={{ fontWeight:600,color:"#0d2144" }}>{result.model || "IsolationForest"}</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                <span style={{ color:"#5a6f8a" }}>Anomaly Score</span>
                <span style={{ fontWeight:700,color: result.is_anomaly?"#e53935":"#1cb86a" }}>
                  {result.anomaly_score?.toFixed(4)}
                </span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                <span style={{ color:"#5a6f8a" }}>Confidence</span>
                <span style={{ fontWeight:700,color:"#0d2144" }}>{result.confidence?.toFixed(1)}%</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                <span style={{ color:"#5a6f8a" }}>Health Score</span>
                <span style={{ fontWeight:700,color:"#0d2144" }}>{result.health_score?.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">🤖 AI Analysis Result</div>
            {dataTag}
          </div>

          {!analysisRun && (
            <div style={{ textAlign:"center",padding:"40px 0",color:"#5a6f8a" }}>
              <div style={{ fontSize:40,marginBottom:10 }}>🔍</div>
              <div style={{ fontSize:13 }}>Click "Run Health Analysis" to start</div>
              <div style={{ fontSize:11,marginTop:6,color:"#7a8fa8" }}>
                Isolation Forest will analyse current sensor readings
              </div>
            </div>
          )}

          {analysisRun && !result?.is_anomaly && (
            <div className="fault-result ok">
              <div className="fault-icon">✅</div>
              <div className="fault-title">No Fault Detected</div>
              <div className="fault-sub">Isolation Forest: <strong>NORMAL</strong></div>
              <div className="fault-sub">{result?.recommendation}</div>
            </div>
          )}

          {analysisRun && result?.is_anomaly && (
            <div className="fault-result warn">
              <div className="fault-icon">⚠️</div>
              <div className="fault-title">{result.fault_type?.toUpperCase()} DETECTED</div>
              <div className="fault-sub">Engine: <strong style={{ color:"#d97706" }}>{result.engine_status}</strong></div>
              <div className="divider" style={{ margin:"8px 0" }}/>
              <div style={{ fontSize:13,fontWeight:600,color:"#1a2940" }}>Recommended Action:</div>
              <div className="fault-sub">{result.recommendation}</div>
              <span className="badge badge-warning">● MAINTENANCE ADVISORY</span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions grid */}
      {analysisRun && result?.conditions && (
        <div className="card mt-16">
          <div className="section-header">
            <div className="section-title">🔎 Subsystem Condition Assessment</div>
            {dataTag}
          </div>
          <div className="grid-4">
            {Object.entries(result.conditions).map(([name, st]) => (
              <div className="param-card" key={name}>
                <div className="param-name">{name}</div>
                <span className={badgeMap[st.toLowerCase()]?.[0] ?? "badge badge-normal"}>
                  {st}
                </span>
                {st === "WARNING" && (
                  <div style={{ fontSize:11,color:"#d97706",marginTop:4 }}>Abnormal readings</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
