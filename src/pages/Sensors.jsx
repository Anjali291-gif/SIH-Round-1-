import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchSensorHistory } from "../api/client";

const TABS = [
  { id: "rpm",          label: "RPM",          unit: "RPM",  color: "#8b5cf6" },
  { id: "cht",          label: "CHT",          unit: "°C",   color: "#f59e0b" },
  { id: "egt",          label: "EGT",          unit: "°C",   color: "#fb923c" },
  { id: "oil_pressure", label: "Oil Pressure", unit: "bar",  color: "#3b82f6" },
  { id: "vibration",    label: "Vibration",    unit: "mm/s", color: "#e53935" },
];

export default function Sensors({ hasFault, liveData, wsConnected }) {
  const [tab,     setTab]     = useState("rpm");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchSensorHistory(25);
      if (data && data.length > 0) setHistory(data);
    }
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const d = liveData || {};
  const current = [
    { id:"rpm",          label:"RPM",                      unit:"RPM",  val: d.rpm          ? Math.round(d.rpm)         : 2450,  st:"normal" },
    { id:"cht",          label:"Cylinder Head Temperature", unit:"°C",   val: d.cht          ? d.cht.toFixed(1)          : "165", st:"normal" },
    { id:"egt",          label:"Exhaust Gas Temperature",   unit:"°C",   val: d.egt          ? Math.round(d.egt)         : 720,   st:"normal" },
    { id:"oil_pressure", label:"Oil Pressure",              unit:"bar",  val: d.oil_pressure ? d.oil_pressure.toFixed(2) : "4.2", st:"normal" },
    { id:"oil_temp",     label:"Oil Temperature",           unit:"°C",   val: d.oil_temp     ? Math.round(d.oil_temp)   : 92,    st:"normal" },
    { id:"fuel_flow",    label:"Fuel Flow",                 unit:"L/hr", val: d.fuel_flow    ? d.fuel_flow.toFixed(1)   : "18.0",st:"normal" },
    { id:"vibration",    label:"Vibration",                 unit:"mm/s", val: d.vibration    ? d.vibration.toFixed(2)   : "3.0",
      st: (d.vibration ?? 3) > 5 ? "warning" : "normal" },
  ];

  const tabInfo  = TABS.find(t => t.id === tab) || TABS[0];
  const chartData = history.length > 0 ? history : [];

  const dataTag = wsConnected
    ? <span className="sim-tag live-tag">🟢 LIVE DATA</span>
    : <span className="sim-tag">⚠ SIMULATED DATA</span>;

  return (
    <>
      <div className="page-title">Real-Time Sensor Monitoring</div>
      <div className="page-sub">
        {wsConnected ? "Live telemetry from backend — updated every 2 seconds" : "Simulated engine sensor data"}
      </div>

      <div className="section-header">
        <div className="section-title">📡 Sensor Readings</div>
        {dataTag}
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {current.map(s => (
          <div className="param-card" key={s.id}>
            <div className="param-name">{s.label}</div>
            <div className="param-val">{s.val}<span className="param-unit">{s.unit}</span></div>
            <span className={s.st === "warning" ? "badge badge-warning" : "badge badge-normal"}>
              {s.st.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">📈 Sensor Trend</div>
          {dataTag}
        </div>
        <div className="tab-group">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6"/>
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#5a6f8a" }}/>
              <YAxis tick={{ fontSize: 10, fill: "#5a6f8a" }}/>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #d0ddef" }}
                formatter={(v) => [`${parseFloat(v).toFixed(2)} ${tabInfo.unit}`, tabInfo.label]}
              />
              <Line
                type="monotone" dataKey={tab}
                stroke={tabInfo.color}
                strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name={tabInfo.label}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"#5a6f8a",fontSize:13 }}>
            Waiting for backend data…
          </div>
        )}
        <div className="info-box mt-8">
          <span>ℹ️</span>
          <span>
            {wsConnected
              ? "Data is fetched from the SQLite database (backend) every 3 seconds. Each point = one engine snapshot."
              : "Select a parameter to view its simulated trend. Connect the backend for live data."}
          </span>
        </div>
      </div>
    </>
  );
}
