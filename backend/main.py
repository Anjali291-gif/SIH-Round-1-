"""
AeroTwin AI – FastAPI Backend
Endpoints: REST + WebSocket
ML:        Isolation Forest anomaly detection | Random Forest health regression
DB:        SQLite (aerotwin.db)
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import List

import uvicorn
from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import FaultEvent, SensorRecord, SessionLocal, create_tables, get_db
from ml_engine import ml_engine
from schemas import FaultSimulateRequest, WhatIfRequest
from sensor_sim import EngineSimulator

# ─── App setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="AeroTwin AI API",
    description=(
        "## AI-Powered Digital Twin Backend for UAV Aero-Piston Engine Health Monitoring\n\n"
        "**ML Models:**\n"
        "- `IsolationForest` (n=300) – Real-time anomaly/fault detection\n"
        "- `RandomForestRegressor` (n=150) – Engine health score 0–100\n\n"
        "**WebSocket:** `/ws/sensors` – Live sensor data every 2 s\n\n"
        "**SIH Round-1 Prototype** | Team AeroTwin AI"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global state ─────────────────────────────────────────────────────────────

simulator: EngineSimulator = EngineSimulator()
ws_clients: List[WebSocket] = []


# ─── Startup / background broadcaster ─────────────────────────────────────────

@app.on_event("startup")
async def startup():
    create_tables()
    asyncio.create_task(_broadcaster())


async def _broadcaster():
    """Generate sensor data every 2 s, save to DB, push to all WebSocket clients."""
    while True:
        try:
            reading = simulator.generate_reading()
            health  = ml_engine.compute_health(reading)

            db = SessionLocal()
            record = SensorRecord(
                rpm          = reading["rpm"],
                cht          = reading["cht"],
                egt          = reading["egt"],
                oil_pressure = reading["oil_pressure"],
                oil_temp     = reading["oil_temp"],
                fuel_flow    = reading["fuel_flow"],
                vibration    = reading["vibration"],
                health_score = health["health_score"],
                status       = health["status"],
                is_fault     = simulator.fault_active,
            )
            db.add(record)
            db.commit()
            db.close()

            payload = {
                **reading,
                "health_score":      health["health_score"],
                "status":            health["status"],
                "feature_importance":health["feature_importance"],
                "fault_active":      simulator.fault_active,
                "fault_type":        simulator.fault_type,
            }

            dead = []
            for ws in ws_clients:
                try:
                    await ws.send_text(json.dumps(payload))
                except Exception:
                    dead.append(ws)
            for ws in dead:
                ws_clients.remove(ws)

        except Exception as exc:
            print(f"[Broadcaster] error: {exc}")

        await asyncio.sleep(2)


# ─── WebSocket endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws/sensors")
async def ws_sensors(websocket: WebSocket):
    """Real-time sensor stream – new packet every 2 seconds."""
    await websocket.accept()
    ws_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()   # keep-alive ping
    except WebSocketDisconnect:
        if websocket in ws_clients:
            ws_clients.remove(websocket)


# ─── REST endpoints ───────────────────────────────────────────────────────────

@app.get("/", tags=["System"], summary="API health check")
def root():
    return {
        "project":    "AeroTwin AI",
        "version":    "1.0.0",
        "status":     "ONLINE",
        "ml_models":  ["IsolationForest (n=300)", "RandomForestRegressor (n=150)"],
        "docs":       "/docs",
        "websocket":  "/ws/sensors",
    }


@app.get("/api/sensors/current", tags=["Sensors"], summary="Latest sensor reading")
def get_current(db: Session = Depends(get_db)):
    record = db.query(SensorRecord).order_by(SensorRecord.id.desc()).first()
    if not record:
        reading = simulator.generate_reading()
        health  = ml_engine.compute_health(reading)
        return {**reading, **health, "fault_active": simulator.fault_active}
    return {
        "timestamp":    record.timestamp.isoformat(),
        "rpm":          round(record.rpm, 1),
        "cht":          round(record.cht, 1),
        "egt":          round(record.egt, 1),
        "oil_pressure": round(record.oil_pressure, 2),
        "oil_temp":     round(record.oil_temp, 1),
        "fuel_flow":    round(record.fuel_flow, 1),
        "vibration":    round(record.vibration, 2),
        "health_score": round(record.health_score, 1),
        "status":       record.status,
        "fault_active": record.is_fault,
    }


@app.get("/api/sensors/history", tags=["Sensors"], summary="Sensor history (last N records)")
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    records = (
        db.query(SensorRecord)
        .order_by(SensorRecord.id.desc())
        .limit(limit)
        .all()
    )
    records.reverse()
    return [
        {
            "t":            r.timestamp.strftime("%H:%M:%S"),
            "rpm":          round(r.rpm, 1),
            "cht":          round(r.cht, 1),
            "egt":          round(r.egt, 1),
            "oil_pressure": round(r.oil_pressure, 2),
            "oil_temp":     round(r.oil_temp, 1),
            "fuel_flow":    round(r.fuel_flow, 1),
            "vibration":    round(r.vibration, 2),
            "health":       round(r.health_score, 1),
        }
        for r in records
    ]


@app.get("/api/engine/health", tags=["Engine"], summary="ML-computed engine health score")
def get_health(db: Session = Depends(get_db)):
    record = db.query(SensorRecord).order_by(SensorRecord.id.desc()).first()
    if not record:
        reading = simulator.generate_reading()
    else:
        reading = {
            "rpm": record.rpm, "cht": record.cht, "egt": record.egt,
            "oil_pressure": record.oil_pressure, "oil_temp": record.oil_temp,
            "fuel_flow": record.fuel_flow, "vibration": record.vibration,
        }
    result = ml_engine.compute_health(reading)
    return {**result, "fault_active": simulator.fault_active, "model": "RandomForestRegressor"}


@app.post("/api/fault/analyze", tags=["Fault Detection"], summary="Run Isolation Forest anomaly detection")
def analyze(db: Session = Depends(get_db)):
    record = db.query(SensorRecord).order_by(SensorRecord.id.desc()).first()
    reading = (
        {
            "rpm": record.rpm, "cht": record.cht, "egt": record.egt,
            "oil_pressure": record.oil_pressure, "oil_temp": record.oil_temp,
            "fuel_flow": record.fuel_flow, "vibration": record.vibration,
        }
        if record
        else simulator.generate_reading()
    )

    fault  = ml_engine.analyze_fault(reading)
    health = ml_engine.compute_health(reading)

    if fault["is_anomaly"]:
        db.add(FaultEvent(
            fault_type     = fault["fault_type"],
            anomaly_score  = fault["anomaly_score"],
            confidence     = fault["confidence"],
            recommendation = fault["recommendation"],
        ))
        db.commit()

    return {
        **fault,
        "health_score":   health["health_score"],
        "engine_status":  health["status"],
        "current_readings": {k: round(float(v), 2) for k, v in reading.items()
                             if k not in ("timestamp",)},
    }


@app.post("/api/fault/simulate", tags=["Fault Detection"], summary="Inject a simulated fault")
def simulate_fault(req: FaultSimulateRequest):
    simulator.simulate_fault(req.fault_type)
    return {
        "status":     "FAULT_INJECTED",
        "fault_type": req.fault_type,
        "message":    f"Fault '{req.fault_type}' injected. Sensor stream now reflects abnormal readings.",
    }


@app.post("/api/fault/reset", tags=["Fault Detection"], summary="Reset engine to normal state")
def reset_fault():
    simulator.reset()
    return {"status": "RESET", "message": "Engine state reset to normal operation."}


@app.post("/api/whatif", tags=["Simulation"], summary="What-If ML prediction")
def whatif(req: WhatIfRequest):
    result = ml_engine.whatif_predict(req.rpm, req.temperature, req.vibration)
    return {
        **result,
        "input": {"rpm": req.rpm, "temperature": req.temperature, "vibration": req.vibration},
        "model": "RandomForestRegressor",
    }


@app.get("/api/alerts", tags=["Alerts"], summary="Recent fault alert log")
def get_alerts(limit: int = 10, db: Session = Depends(get_db)):
    events = db.query(FaultEvent).order_by(FaultEvent.id.desc()).limit(limit).all()
    return [
        {
            "id":            e.id,
            "timestamp":     e.timestamp.isoformat(),
            "fault_type":    e.fault_type,
            "confidence":    e.confidence,
            "recommendation":e.recommendation,
            "resolved":      e.resolved,
        }
        for e in events
    ]


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
