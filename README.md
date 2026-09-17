# AeroTwin AI – UAV Engine Digital Twin (SIH Round-1 Prototype)

> **AI-Powered Digital Twin for UAV Engine Health**
> Problem Statement: AI-Enabled Real-Time Digital Twin System for Health Monitoring, Fault Prediction and Mission Reliability Enhancement of Aero Piston Engines used in MALE UAVs.

---

## 🚀 Overview

AeroTwin AI is an AI-enabled Digital Twin prototype engineered for monitoring Medium-Altitude Long-Endurance (MALE) UAV aero-piston engines. The system visualizes real-time engine telemetry, computes dynamic health indices, performs simulated AI anomaly detection, and provides interactive what-if operational simulations.

---

## 🌟 Key Features

1. **Virtual Engine Command Dashboard**:
   - Real-time KPI telemetry cards (Engine Health 92%, RPM 2450, Temperature 178°C, Vibration).
   - Dynamic 2D schematic Digital Twin visual with status indicators for RPM, CHT, EGT, Oil, and Vibration.
   - 20-minute simulated engine health trend overview line chart.
   - End-to-end architecture flow and technology stack overview.

2. **Engine Health Monitoring**:
   - High-precision circular health indicator (92% Healthy).
   - Subsystem condition monitors (Combustion, Lubrication, Thermal Management, Mechanical Integrity, Fuel System).
   - Critical parameter status cards with automatic normal/warning thresholds.

3. **Real-Time Sensor Monitoring**:
   - 7 primary engine sensors: RPM, Cylinder Head Temp (CHT), Exhaust Gas Temp (EGT), Oil Pressure, Oil Temp, Fuel Flow, Vibration.
   - Interactive trend telemetry charts with multi-sensor parameter switching.

4. **AI Fault Detection**:
   - AI Health Analysis engine with baseline health checks.
   - One-click fault injector simulating abnormal mechanical vibration.
   - Prescriptive maintenance advisories and cross-system status propagation.

5. **What-If Engine Simulation**:
   - Interactive parameter sliders for RPM (1500–3000), Temperature (100–220°C), and Vibration Level (0–10).
   - Real-time rule-based health score calculation predicting Healthy, Warning, or Critical engine states.

---

## 🛠 Tech Stack

- **Frontend**: React 18+
- **Bundler**: Vite
- **Data Visualization**: Recharts
- **Styling**: Modern Defense & Aerospace Engineering UI (Navy & Cyan aesthetic)

---

## 💻 Local Setup & Development

```bash
# Clone the repository
git clone https://github.com/Anjali291-gif/SIH-Round-1-.git
cd SIH-Round-1-

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Build for Deployment

```bash
npm run build
```

The output files will be in the `dist/` directory, ready to deploy to **Vercel**, **Netlify**, or **GitHub Pages**.

---

*Note: This prototype utilizes realistic simulated telemetry data for Round-1 SIH concept validation.*
