import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const sensorDefs = [
  { id: "RPM",      label: "RPM",                      unit: "RPM",  val: "2450",  status: "normal"  },
  { id: "CHT",      label: "Cylinder Head Temperature", unit: "°C",   val: "165",   status: "normal"  },
  { id: "EGT",      label: "Exhaust Gas Temperature",   unit: "°C",   val: "720",   status: "normal"  },
  { id: "OIL_P",    label: "Oil Pressure",              unit: "bar",  val: "4.2",   status: "normal"  },
  { id: "OIL_T",    label: "Oil Temperature",           unit: "°C",   val: "92",    status: "normal"  },
  { id: "FUEL",     label: "Fuel Flow",                 unit: "L/hr", val: "18",    status: "normal"  },
  { id: "VIB",      label: "Vibration",                 unit: "",     val: "Normal",status: "normal"  },
];

const chartData = {
  RPM:   [
    {t:"10:00",v:2400},{t:"10:05",v:2430},{t:"10:10",v:2450},{t:"10:15",v:2460},{t:"10:20",v:2450},
  ],
  CHT:   [
    {t:"10:00",v:162},{t:"10:05",v:163},{t:"10:10",v:165},{t:"10:15",v:164},{t:"10:20",v:165},
  ],
  EGT:   [
    {t:"10:00",v:715},{t:"10:05",v:718},{t:"10:10",v:720},{t:"10:15",v:721},{t:"10:20",v:720},
  ],
  OIL_P: [
    {t:"10:00",v:4.1},{t:"10:05",v:4.2},{t:"10:10",v:4.2},{t:"10:15",v:4.3},{t:"10:20",v:4.2},
  ],
  OIL_T: [
    {t:"10:00",v:90},{t:"10:05",v:91},{t:"10:10",v:92},{t:"10:15",v:92},{t:"10:20",v:91},
  ],
  FUEL:  [
    {t:"10:00",v:17.8},{t:"10:05",v:18.0},{t:"10:10",v:18.1},{t:"10:15",v:18.0},{t:"10:20",v:18.0},
  ],
  VIB:   [
    {t:"10:00",v:2.8},{t:"10:05",v:3.0},{t:"10:10",v:3.1},{t:"10:15",v:3.0},{t:"10:20",v:3.0},
  ],
};

const tabLabels = [
  {id:"RPM",label:"RPM"},{id:"CHT",label:"CHT"},{id:"EGT",label:"EGT"},
  {id:"OIL_P",label:"Oil Pressure"},{id:"VIB",label:"Vibration"},
];

const badgeMap = {
  normal:   "badge badge-normal",
  warning:  "badge badge-warning",
};

export default function Sensors({ hasFault }) {
  const [tab, setTab] = useState("RPM");

  const displaySensors = sensorDefs.map(s => {
    if (hasFault && s.id === "VIB") return {...s, val:"HIGH", status:"warning"};
    if (hasFault && s.id === "RPM") return {...s, val:"2680"};
    return s;
  });

  const faultVibData = [
    {t:"10:00",v:3.0},{t:"10:05",v:3.5},{t:"10:10",v:5.8},{t:"10:15",v:7.2},{t:"10:20",v:8.1},
  ];
  const data = (hasFault && tab === "VIB") ? faultVibData : chartData[tab];

  return (
    <>
      <div className="page-title">Real-Time Sensor Monitoring</div>
      <div className="page-sub">Simulated engine sensor data from UAV aero-piston engine</div>

      {/* Sensor Grid */}
      <div className="section-header">
        <div className="section-title">📡 Sensor Readings</div>
        <span className="sim-tag">⚠ SIMULATED DATA</span>
      </div>
      <div className="grid-4" style={{marginBottom:20}}>
        {displaySensors.map(s => (
          <div className="param-card" key={s.id}>
            <div className="param-name">{s.label}</div>
            <div className="param-val">{s.val}<span className="param-unit">{s.unit}</span></div>
            <span className={badgeMap[s.status]||"badge badge-normal"}>{s.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">📈 Sensor Trend</div>
          <span className="sim-tag">⚠ SIMULATED DATA</span>
        </div>
        <div className="tab-group">
          {tabLabels.map(t => (
            <button
              key={t.id}
              className={`tab-btn${tab===t.id?" active":""}`}
              onClick={()=>setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{top:4,right:16,left:-16,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6"/>
            <XAxis dataKey="t" tick={{fontSize:11,fill:"#5a6f8a"}}/>
            <YAxis tick={{fontSize:11,fill:"#5a6f8a"}}/>
            <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #d0ddef"}}/>
            <Line
              type="monotone" dataKey="v" stroke={hasFault&&tab==="VIB"?"#f59e0b":"#1e5eb5"}
              strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}}
              name={tab}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="info-box mt-8">
          <span>ℹ️</span>
          <span>Select a parameter above to view its simulated trend over the last 20 minutes. No real sensor hardware is connected in this Round-1 prototype.</span>
        </div>
      </div>
    </>
  );
}
