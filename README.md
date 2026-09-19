# AeroTwin AI – UAV Engine Digital Twin (SIH Round-1 Prototype)

> **AI-Powered Digital Twin for UAV Engine Health**  
> **Problem Statement:** AI-Enabled Real-Time Digital Twin System for Health Monitoring, Fault Prediction and Mission Reliability Enhancement of Aero Piston Engines used in MALE UAVs.  
> **Live Web App:** [https://aero-twin-ai-sooty.vercel.app/](https://aero-twin-ai-sooty.vercel.app/)

---

## 🚀 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React 18 + Vite + Recharts)                      │
│  Hosted on Vercel: aero-twin-ai-sooty.vercel.app            │
│  - Virtual Engine Command Center                            │
│  - Interactive 2D Digital Twin Schematic                    │
│  - Real-Time Sensor Telemetry Trends                        │
│  - Fault Detection & Predictive Maintenance Advisories       │
│  - Non-linear What-If Scenario Exploration                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Python FastAPI + SQLite + Uvicorn)                │
│  Ready for Render.com Free Cloud Deployment                 │
│                                                             │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Isolation Forest (ML) │   │ Random Forest Regressor   │  │
│  │ 300 Estimators        │   │ 150 Estimators            │  │
│  │ Anomaly Detection     │   │ Multi-subsystem Health    │  │
│  └───────────────────────┘   └───────────────────────────┘  │
│                                                             │
│  - SQLite Database (telemetry logs & fault history)         │
│  - WebSocket Server (/ws/sensors broadcasting at 2s)        │
│  - Interactive Swagger API Documentation (/docs)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Modules

1. **Virtual Engine Command Dashboard**:
   - Live KPI cards: Health Index (92%), RPM (2450), Temperature (178°C), Mechanical Vibration.
   - Dynamic 2D schematic Digital Twin with status indicators across RPM, CHT, EGT, Oil, and Vibration.
   - Real-time engine health trend line chart with simulated operational data.
   - Comprehensive end-to-end architecture pipeline and technology stack reference.

2. **Engine Health Monitoring**:
   - High-precision circular health indicator with health classification.
   - Subsystem condition monitors: Combustion, Lubrication, Thermal Management, Mechanical Integrity, Fuel System.
   - Machine learning feature importance distribution identifying leading degradation factors.

3. **Real-Time Sensor Monitoring**:
   - 7 primary engine telemetry channels: RPM, Cylinder Head Temp (CHT), Exhaust Gas Temp (EGT), Oil Pressure, Oil Temp, Fuel Flow, Vibration.
   - Interactive trend telemetry charts with multi-sensor parameter switching.

4. **AI Fault Detection**:
   - Machine-learning anomaly detection via **Isolation Forest (`n_estimators=300`)**.
   - One-click fault injector simulating abnormal mechanical vibration.
   - Automated prescriptive maintenance advisories with cross-system status propagation.

5. **What-If Engine Simulation**:
   - Interactive parameter controls for RPM (1500–3000), Temperature (100–220°C), and Vibration (0–10).
   - Real-time predictive regression output estimating degradation under compounding operational stress.

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status & ML model metadata |
| `GET` | `/docs` | Interactive Swagger UI API documentation |
| `GET` | `/api/sensors/current` | Latest engine telemetry snapshot |
| `GET` | `/api/sensors/history` | Historical sensor logs (custom limit) |
| `GET` | `/api/engine/health` | ML-computed health score & feature importance |
| `POST` | `/api/fault/analyze` | Isolation Forest anomaly detection & diagnostic report |
| `POST` | `/api/fault/simulate` | Inject simulated anomaly (vibration / thermal) |
| `POST` | `/api/fault/reset` | Reset engine to nominal state |
| `POST` | `/api/whatif` | ML regression prediction for user parameter combination |
| `GET` | `/api/alerts` | Historical fault events & maintenance recommendations |
| `WS` | `/ws/sensors` | Real-time WebSocket stream (updates every 2 seconds) |

---

## 💻 Local Setup & Development

### 1. Frontend (React + Vite)
```bash
# Navigate to project folder
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend (FastAPI + Python)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) to explore the interactive API.

---

## ☁️ Deployment Instructions

### Deploy Backend on Render (Free)
1. Go to [Render.com](https://render.com) and create a free account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `Anjali291-gif/SIH-Round-1-`.
4. Configure service settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Render will assign a public URL (e.g. `https://aerotwin-ai-backend.onrender.com`).

### Connect Frontend to Live Backend on Vercel
1. Go to your project on [Vercel](https://vercel.com).
2. Go to **Settings** → **Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-render-backend-url.onrender.com`
4. Trigger a Redeploy in Vercel.
5. Your dashboard will now automatically switch to **🟢 LIVE DATA** mode with real-time WebSocket streaming and ML inference!

---

*SIH Round-1 Prototype | Team AeroTwin AI*
