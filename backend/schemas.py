from pydantic import BaseModel
from typing import Optional

class WhatIfRequest(BaseModel):
    rpm: float = 2450
    temperature: float = 165
    vibration: float = 3.0

class FaultSimulateRequest(BaseModel):
    fault_type: str = "vibration"
