import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import EngineHealth from "./pages/EngineHealth";
import Sensors from "./pages/Sensors";
import FaultDetection from "./pages/FaultDetection";
import WhatIf from "./pages/WhatIf";
import { createWebSocket } from "./api/client";

// Simulated fallback values (used when backend is offline)
const SIMULATED_DEFAULTS = {
  rpm: 2450, cht: 165, egt: 720,
  oil_pressure: 4.2, oil_temp: 92,
  fuel_flow: 18.0, vibration: 3.0,
  health_score: 92, status: "HEALTHY",
  fault_active: false, fault_type: null,
};

export default function App() {
  const [page,       setPage]      = useState("dashboard");
  const [hasFault,   setHasFault]  = useState(false);
  const [liveData,   setLiveData]  = useState(SIMULATED_DEFAULTS);
  const [wsConnected,setWsConn]    = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      wsRef.current = createWebSocket(
        (data) => {
          setLiveData(data);
          setHasFault(!!data.fault_active);
        },
        () => setWsConn(true),
        () => {
          setWsConn(false);
          // retry after 5 s
          setTimeout(connect, 5000);
        }
      );
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} wsConnected={wsConnected} />
      <main className="page-content">
        {page === "dashboard" && (
          <Dashboard setPage={setPage} hasFault={hasFault} liveData={liveData} wsConnected={wsConnected} />
        )}
        {page === "health" && (
          <EngineHealth hasFault={hasFault} liveData={liveData} wsConnected={wsConnected} />
        )}
        {page === "sensors" && (
          <Sensors hasFault={hasFault} liveData={liveData} wsConnected={wsConnected} />
        )}
        {page === "fault" && (
          <FaultDetection
            hasFault={hasFault} setHasFault={setHasFault}
            liveData={liveData} wsConnected={wsConnected}
          />
        )}
        {page === "whatif" && <WhatIf wsConnected={wsConnected} />}
      </main>
    </div>
  );
}
