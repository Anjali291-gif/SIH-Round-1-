import CircProgress from "../components/CircProgress";

const params = [
  { name: "RPM",          val: "2450",  unit: "",    status: "normal"  },
  { name: "CHT (Cylinder Head Temp)", val: "165",   unit: "°C",  status: "normal"  },
  { name: "EGT (Exhaust Gas Temp)",   val: "720",   unit: "°C",  status: "normal"  },
  { name: "Oil Pressure", val: "4.2",   unit: "bar", status: "normal"  },
  { name: "Vibration",    val: "Normal",unit: "",    status: "normal"  },
];

const faultParams = [
  { name: "RPM",          val: "2680",  unit: "",    status: "normal"  },
  { name: "CHT (Cylinder Head Temp)", val: "165",   unit: "°C",  status: "normal"  },
  { name: "EGT (Exhaust Gas Temp)",   val: "720",   unit: "°C",  status: "normal"  },
  { name: "Oil Pressure", val: "4.2",   unit: "bar", status: "normal"  },
  { name: "Vibration",    val: "HIGH",  unit: "",    status: "warning" },
];

const systems = [
  { name: "Combustion System",     status: "normal"  },
  { name: "Lubrication System",    status: "normal"  },
  { name: "Thermal Management",    status: "normal"  },
  { name: "Mechanical Integrity",  status: "normal"  },
  { name: "Fuel System",           status: "normal"  },
];

const badgeMap = {
  normal:   ["badge badge-normal",   "NORMAL"  ],
  warning:  ["badge badge-warning",  "WARNING" ],
  critical: ["badge badge-critical", "CRITICAL"],
};

export default function EngineHealth({ hasFault }) {
  const pList = hasFault ? faultParams : params;
  const score = hasFault ? 78 : 92;
  const scoreColor = hasFault ? "#f59e0b" : "#1cb86a";
  const statusLabel = hasFault ? "DEGRADED" : "HEALTHY";
  const statusCls   = hasFault ? "badge-warning" : "badge-healthy";

  return (
    <>
      <div className="page-title">Engine Health Monitoring</div>
      <div className="page-sub">Real-time simulated health assessment of UAV aero-piston engine</div>

      <div className="grid-2">
        {/* Health Score Card */}
        <div className="card" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"32px 22px"}}>
          <div className="card-title" style={{textAlign:"center"}}>ENGINE HEALTH SCORE</div>
          <CircProgress value={score} size={140} stroke={12} color={scoreColor}/>
          <span className={`badge ${statusCls}`} style={{fontSize:12,padding:"5px 16px"}}>
            ● {statusLabel}
          </span>
          <div style={{fontSize:12,color:"#5a6f8a",textAlign:"center",maxWidth:240}}>
            Health score is calculated from the simulated engine parameters using weighted subsystem metrics.
          </div>
          <span className="sim-tag">⚠ SIMULATED DATA</span>
        </div>

        {/* Overall summary */}
        <div className="card">
          <div className="card-title">OVERALL STATUS</div>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600,color:"#1a2940"}}>Overall Health</span>
              <strong style={{fontSize:20,color:"#0d2144"}}>{score}%</strong>
            </div>
            <div className="progress-bar-wrap">
              <div className={`progress-bar-fill ${hasFault?"fill-orange":"fill-green"}`} style={{width:`${score}%`}}></div>
            </div>
            <div className="divider" style={{margin:"4px 0"}}></div>
            {systems.map(s => (
              <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#1a2940"}}>{s.name}</span>
                <span className={badgeMap[s.status][0]}>{badgeMap[s.status][1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter Cards */}
      <div style={{marginTop:20}}>
        <div className="section-header">
          <div className="section-title">📊 Engine Parameter Status</div>
          <span className="sim-tag">⚠ SIMULATED DATA</span>
        </div>
        <div className="grid-5">
          {pList.map(p => (
            <div className="param-card" key={p.name}>
              <div className="param-name">{p.name}</div>
              <div className="param-val">{p.val}<span className="param-unit">{p.unit}</span></div>
              <span className={badgeMap[p.status][0]}>{badgeMap[p.status][1]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box mt-16">
        <span>ℹ️</span>
        <div>
          In the final AeroTwin AI system, these parameters would be sourced from real UAV engine sensors
          and processed through trained anomaly detection models to provide accurate real-time health assessment.
        </div>
      </div>
    </>
  );
}
