"""
AeroTwin AI – ML Engine
Models:
  1. IsolationForest  – anomaly / fault detection
  2. RandomForestRegressor – engine health score (0-100)
  3. RandomForestRegressor (what-if) – health prediction from user inputs
"""
import numpy as np
import warnings
warnings.filterwarnings("ignore")

from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler


# ─── Training data generators ────────────────────────────────────────────────

def _normal_data(n: int = 1200) -> np.ndarray:
    rng = np.random.default_rng(42)
    return np.column_stack([
        rng.normal(2450, 80,  n),   # RPM
        rng.normal(165,   8,  n),   # CHT
        rng.normal(720,  20,  n),   # EGT
        rng.normal(4.2,  0.2, n),   # Oil Pressure
        rng.normal(92,    4,  n),   # Oil Temp
        rng.normal(18.0, 0.8, n),   # Fuel Flow
        rng.normal(3.0,  0.5, n),   # Vibration
    ])


def _fault_data_vibration(n: int = 200) -> np.ndarray:
    rng = np.random.default_rng(7)
    return np.column_stack([
        rng.normal(2680, 100, n),
        rng.normal(165,    8, n),
        rng.normal(720,   20, n),
        rng.normal(4.2,  0.2, n),
        rng.normal(92,     4, n),
        rng.normal(18.0, 0.8, n),
        rng.normal(7.5,  1.5, n),   # HIGH vibration
    ])


def _fault_data_thermal(n: int = 150) -> np.ndarray:
    rng = np.random.default_rng(13)
    return np.column_stack([
        rng.normal(2450,  80, n),
        rng.normal(198,    5, n),   # HIGH CHT
        rng.normal(790,   15, n),   # HIGH EGT
        rng.normal(4.2,  0.2, n),
        rng.normal(110,    4, n),
        rng.normal(19.5, 0.6, n),
        rng.normal(3.0,  0.3, n),
    ])


# ─── Health score label generator ────────────────────────────────────────────

def _health_score(row: np.ndarray) -> float:
    rpm, cht, egt, oil_p, oil_t, ff, vib = row
    score = 100.0

    # Vibration penalty (most critical)
    if   vib > 9.0: score -= 55
    elif vib > 7.0: score -= 35
    elif vib > 5.5: score -= 18
    elif vib > 4.5: score -= 8

    # CHT penalty
    if   cht > 205: score -= 25
    elif cht > 195: score -= 14
    elif cht > 185: score -= 6

    # EGT penalty
    if   egt > 800: score -= 20
    elif egt > 780: score -= 10
    elif egt > 760: score -= 4

    # Oil pressure penalty
    if   oil_p < 2.5: score -= 30
    elif oil_p < 3.2: score -= 15
    elif oil_p < 3.8: score -= 5

    # RPM penalty
    if   rpm > 2900: score -= 10
    elif rpm > 2750: score -= 4

    return float(max(0.0, min(100.0, score)))


# ─── Main ML Engine class ─────────────────────────────────────────────────────

class AeroTwinMLEngine:
    FEATURE_NAMES = ["RPM", "CHT", "EGT", "Oil Pressure", "Oil Temp", "Fuel Flow", "Vibration"]

    def __init__(self):
        self._train()

    def _train(self):
        normal  = _normal_data(1200)
        fault_v = _fault_data_vibration(200)
        fault_t = _fault_data_thermal(150)

        # ── 1. Isolation Forest ───────────────────────────────────
        self.iso_forest = IsolationForest(
            n_estimators=300,
            contamination=0.08,
            random_state=42,
            max_samples="auto",
        )
        self.iso_forest.fit(normal)

        # ── 2. Health score regressor ─────────────────────────────
        X_all = np.vstack([normal, fault_v, fault_t])
        y_all = np.array([_health_score(r) for r in X_all])

        self.health_reg = RandomForestRegressor(
            n_estimators=150, random_state=42, n_jobs=-1
        )
        self.health_reg.fit(X_all, y_all)

        # ── 3. What-If regressor (3 inputs only) ──────────────────
        # Build training set: [rpm, temp, vib] → health score
        X_wi = X_all[:, [0, 1, 6]]   # RPM, CHT, Vibration
        self.whatif_reg = RandomForestRegressor(
            n_estimators=100, random_state=42, n_jobs=-1
        )
        self.whatif_reg.fit(X_wi, y_all)

        print("[AeroTwin ML] Models trained successfully.")

    # ── Public methods ────────────────────────────────────────────────────────

    def analyze_fault(self, reading: dict) -> dict:
        """Run Isolation Forest anomaly detection on a sensor snapshot."""
        features = self._to_array(reading)

        prediction   = self.iso_forest.predict(features)[0]          # -1 or 1
        raw_score    = float(self.iso_forest.score_samples(features)[0])  # neg float

        # Confidence: map raw score to 0-100 %
        # Typical range: -0.7 (anomaly) … +0.1 (normal)
        normalised  = min(1.0, max(0.0, (raw_score + 0.7) / 0.8))
        confidence  = normalised * 100 if prediction == 1 else (1 - normalised) * 100

        is_anomaly  = prediction == -1
        fault_type, recommendation = self._classify_fault(reading, is_anomaly)

        conditions = {
            "Combustion":  "WARNING" if fault_type == "Combustion Anomaly"  else "NORMAL",
            "Lubrication": "WARNING" if fault_type == "Oil Pressure Loss"   else "NORMAL",
            "Temperature": "WARNING" if fault_type == "Thermal Overload"    else "NORMAL",
            "Vibration":   "WARNING" if fault_type == "Mechanical Vibration" else "NORMAL",
        }

        return {
            "is_anomaly":       is_anomaly,
            "anomaly_score":    round(raw_score, 4),
            "confidence":       round(confidence, 1),
            "prediction_label": "ANOMALY" if is_anomaly else "NORMAL",
            "fault_type":       fault_type,
            "recommendation":   recommendation,
            "conditions":       conditions,
            "model":            "IsolationForest (n_estimators=300)",
        }

    def compute_health(self, reading: dict) -> dict:
        """Compute health score 0-100 + feature importance."""
        features = self._to_array(reading)
        score = float(self.health_reg.predict(features)[0])
        score = round(max(0.0, min(100.0, score)), 1)

        importance = {
            name: round(float(imp) * 100, 1)
            for name, imp in zip(self.FEATURE_NAMES, self.health_reg.feature_importances_)
        }

        status = (
            "HEALTHY"  if score >= 85 else
            "GOOD"     if score >= 70 else
            "DEGRADED" if score >= 55 else
            "WARNING"  if score >= 35 else
            "CRITICAL"
        )

        return {"health_score": score, "status": status, "feature_importance": importance}

    def whatif_predict(self, rpm: float, temperature: float, vibration: float) -> dict:
        """Predict health score from RPM, temperature and vibration."""
        X = np.array([[rpm, temperature, vibration]])
        score = float(self.whatif_reg.predict(X)[0])
        score = round(max(0.0, min(100.0, score)), 1)

        status = (
            "HEALTHY"  if score >= 85 else
            "GOOD"     if score >= 70 else
            "DEGRADED" if score >= 55 else
            "WARNING"  if score >= 35 else
            "CRITICAL"
        )

        reasons = []
        if temperature > 185: reasons.append("high cylinder temperature")
        if vibration   >   5: reasons.append("elevated mechanical vibration")
        if rpm         > 2800: reasons.append("excessive RPM")

        explanation = (
            "Engine parameters are within acceptable limits."
            if not reasons
            else f"Health degradation predicted due to: {', '.join(reasons)}. Inspection advised."
        )

        return {"predicted_health": score, "status": status, "explanation": explanation}

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _to_array(r: dict) -> np.ndarray:
        return np.array([[
            r.get("rpm",          2450),
            r.get("cht",          165 ),
            r.get("egt",          720 ),
            r.get("oil_pressure", 4.2 ),
            r.get("oil_temp",     92  ),
            r.get("fuel_flow",    18.0),
            r.get("vibration",    3.0 ),
        ]])

    @staticmethod
    def _classify_fault(r: dict, is_anomaly: bool):
        if not is_anomaly:
            return None, "No fault detected. Engine operating normally."

        vib   = r.get("vibration",    3.0)
        cht   = r.get("cht",          165)
        egt   = r.get("egt",          720)
        oil_p = r.get("oil_pressure", 4.2)

        if vib   > 5.5: return "Mechanical Vibration", \
            "Inspect engine mounts, propeller balance and cylinder head integrity. Ground before next flight."
        if cht   > 190: return "Thermal Overload", \
            "Reduce engine load. Check cooling fins and cylinder head for blockage."
        if egt   > 775: return "Combustion Anomaly", \
            "Check fuel mixture, ignition timing and carburetor settings."
        if oil_p < 3.5: return "Oil Pressure Loss", \
            "IMMEDIATE ENGINE SHUTDOWN. Check oil level, filter and pump."
        return "Unknown Anomaly", \
            "Run full diagnostic. Do not fly until issue is identified and cleared."


# ── Singleton ─────────────────────────────────────────────────────────────────
ml_engine = AeroTwinMLEngine()
