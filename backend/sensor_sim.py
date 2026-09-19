import numpy as np
from datetime import datetime, timezone

class EngineSimulator:
    """Simulates realistic UAV aero-piston engine sensor data with Gaussian noise."""

    # Normal operating baseline values
    NORMAL = {
        "rpm":          (2450, 30),
        "cht":          (165,  3),
        "egt":          (720,  8),
        "oil_pressure": (4.2,  0.08),
        "oil_temp":     (92,   1.5),
        "fuel_flow":    (18.0, 0.3),
        "vibration":    (3.0,  0.2),
    }

    # Vibration fault scenario
    VIBRATION_FAULT = {
        "rpm":          (2680, 50),
        "cht":          (165,  3),
        "egt":          (720,  8),
        "oil_pressure": (4.2,  0.08),
        "oil_temp":     (92,   1.5),
        "fuel_flow":    (18.0, 0.3),
        "vibration":    (7.5,  1.0),
    }

    # Thermal fault scenario
    THERMAL_FAULT = {
        "rpm":          (2450, 30),
        "cht":          (198,  4),
        "egt":          (790,  12),
        "oil_pressure": (4.2,  0.08),
        "oil_temp":     (110,  3),
        "fuel_flow":    (19.5, 0.5),
        "vibration":    (3.0,  0.2),
    }

    def __init__(self):
        self.fault_active = False
        self.fault_type = None

    def _sample(self, profile: dict) -> dict:
        reading = {}
        for key, (mean, std) in profile.items():
            val = np.random.normal(mean, std)
            reading[key] = round(float(max(0, val)), 2)
        reading["timestamp"] = datetime.now(timezone.utc).isoformat()
        return reading

    def generate_reading(self) -> dict:
        if not self.fault_active:
            return self._sample(self.NORMAL)
        if self.fault_type == "thermal":
            return self._sample(self.THERMAL_FAULT)
        return self._sample(self.VIBRATION_FAULT)

    def simulate_fault(self, fault_type: str = "vibration"):
        self.fault_active = True
        self.fault_type = fault_type

    def reset(self):
        self.fault_active = False
        self.fault_type = None
