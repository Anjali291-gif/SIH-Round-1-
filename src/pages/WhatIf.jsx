import { useState, useEffect } from "react";
import { whatIfSimulate } from "../api/client";

function getLocalCondition(rpm, temp, vib) {
  let score = 100;
  if (rpm > 2800) score -= 10;
  else if (rpm > 2600) score -= 4;

  if (temp > 200) score -= 25;
  else if (temp > 185) score -= 15;
  else if (temp > 175) score -= 6;

  if (vib > 7) score -= 30;
  else if (vib > 5) score -= 18;
  else if (vib > 4) score -= 8;

  score = Math.max(0, Math.min(100, score));

  let status = "HEALTHY";
  let cls = "healthy";
  let color = "#1cb86a";

  if (score < 55) {
    status = "CRITICAL";
    cls = "critical";
    color = "#e53935";
  } else if (score < 80) {
    status = "WARNING";
    cls = "warning";
    color = "#f59e0b";
  }

  const reasons = [];
  if (temp > 185) reasons.push("elevated cylinder temperature");
  if (vib > 5) reasons.push("high mechanical vibration");
  if (rpm > 2800) reasons.push("excessive RPM");

  const explanation =
    reasons.length === 0
      ? "Engine parameters are within normal operating bounds."
      : `Degradation predicted due to: ${reasons.join(" and ")}. Inspection recommended.`;

  return { status, cls, color, score, explanation, model: "Rule-Based Engine" };
}

export default function WhatIf({ wsConnected }) {
  const [rpm, setRpm] = useState(2450);
  const [temp, setTemp] = useState(165);
  const [vib, setVib] = useState(3);
  const [prediction, setPrediction] = useState(() => getLocalCondition(2450, 165, 3));

  useEffect(() => {
    let cancelled = false;

    async function runPrediction() {
      const local = getLocalCondition(rpm, temp, vib);
      try {
        const res = await whatIfSimulate(rpm, temp, vib);
        if (!cancelled && res && res.predicted_health !== undefined) {
          const score = res.predicted_health;
          const status = res.status || local.status;
          let cls = "healthy";
          let color = "#1cb86a";
          if (score < 55) {
            cls = "critical";
            color = "#e53935";
          } else if (score < 75) {
            cls = "warning";
            color = "#f59e0b";
          }
          setPrediction({
            score,
            status,
            cls,
            color,
            explanation: res.explanation || local.explanation,
            model: res.model || "RandomForestRegressor",
          });
          return;
        }
      } catch (e) {
        // Fallback to local
      }

      if (!cancelled) {
        setPrediction(local);
      }
    }

    const timer = setTimeout(runPrediction, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [rpm, temp, vib]);

  const dataTag = wsConnected ? (
    <span className="sim-tag live-tag">🟢 LIVE ML MODEL</span>
  ) : (
    <span className="sim-tag">⚠ SIMULATED</span>
  );

  return (
    <>
      <div className="page-title">What-If Engine Simulation</div>
      <div className="page-sub">
        {wsConnected
          ? "Explore how changing engine inputs affects predicted health via real-time Random Forest regression."
          : "Explore how changes in engine conditions may affect engine health."}
      </div>

      <div className="grid-2">
        {/* Sliders */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">🎛 Engine Parameters</div>
            {dataTag}
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">🔄 Engine RPM</span>
              <span className="slider-val">{rpm} RPM</span>
            </div>
            <input
              type="range"
              min={1500}
              max={3000}
              value={rpm}
              onChange={(e) => setRpm(Number(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#5a6f8a",
                marginTop: 3,
              }}
            >
              <span>1500 RPM</span>
              <span>3000 RPM</span>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">🌡 Engine Temperature</span>
              <span className="slider-val">{temp} °C</span>
            </div>
            <input
              type="range"
              min={100}
              max={220}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#5a6f8a",
                marginTop: 3,
              }}
            >
              <span>100 °C</span>
              <span>220 °C</span>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-row">
              <span className="slider-label">📳 Vibration Level</span>
              <span className="slider-val">{vib} / 10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={vib}
              onChange={(e) => setVib(Number(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#5a6f8a",
                marginTop: 3,
              }}
            >
              <span>0 (None)</span>
              <span>10 (Severe)</span>
            </div>
          </div>

          <div className="info-box mt-8">
            <span>🤖</span>
            <span style={{ fontSize: 12 }}>
              <strong>AI Model Active:</strong> {prediction.model}. Dynamic regression estimates degradation under non-linear operating stress.
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-header">
            <div className="section-title">📊 Predicted Engine Condition</div>
            {dataTag}
          </div>

          <div
            className={`whatif-result ${prediction.cls}`}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 140,
            }}
          >
            <div className="whatif-label">Predicted Condition</div>
            <div className="whatif-status" style={{ color: prediction.color }}>
              {prediction.status}
            </div>
            <div className="whatif-score">
              Health Score: <strong>{Math.round(prediction.score)}%</strong>
            </div>
          </div>

          {/* Summary rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "#f4f7fb",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#5a6f8a" }}>Engine RPM</span>
              <strong style={{ color: "#0d2144" }}>{rpm} RPM</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "#f4f7fb",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#5a6f8a" }}>Engine Temperature</span>
              <strong
                style={{
                  color: temp > 185 ? "#e53935" : temp > 175 ? "#f59e0b" : "#0d2144",
                }}
              >
                {temp} °C
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "#f4f7fb",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#5a6f8a" }}>Vibration Level</span>
              <strong
                style={{
                  color: vib > 7 ? "#e53935" : vib > 5 ? "#f59e0b" : "#0d2144",
                }}
              >
                {vib} / 10
              </strong>
            </div>
          </div>

          <div
            className={`fault-result ${prediction.cls === "healthy" ? "ok" : "warn"}`}
            style={{ padding: "12px 14px" }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: prediction.color }}>
              {prediction.cls === "critical"
                ? "CRITICAL ALERT: "
                : prediction.cls === "warning"
                ? "WARNING ADVISORY: "
                : "STATUS NOMINAL: "}
              {prediction.explanation}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
