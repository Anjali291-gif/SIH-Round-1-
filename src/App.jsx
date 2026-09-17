import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import EngineHealth from "./pages/EngineHealth";
import Sensors from "./pages/Sensors";
import FaultDetection from "./pages/FaultDetection";
import WhatIf from "./pages/WhatIf";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [hasFault, setHasFault] = useState(false);

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />
      <main className="page-content">
        {page === "dashboard"  && <Dashboard setPage={setPage} hasFault={hasFault} />}
        {page === "health"     && <EngineHealth hasFault={hasFault} />}
        {page === "sensors"    && <Sensors hasFault={hasFault} />}
        {page === "fault"      && <FaultDetection hasFault={hasFault} setHasFault={setHasFault} />}
        {page === "whatif"     && <WhatIf />}
      </main>
    </div>
  );
}
