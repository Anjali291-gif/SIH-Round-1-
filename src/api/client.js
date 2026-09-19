/**
 * AeroTwin AI – API Client
 * Falls back gracefully to null if backend is unreachable.
 */

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://aerotwin-ai-backend.onrender.com";

const WS_URL = BASE_URL.replace(/^http/, "ws");

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const fetchCurrentSensors = () =>
  safeFetch(`${BASE_URL}/api/sensors/current`);

export const fetchSensorHistory = (limit = 20) =>
  safeFetch(`${BASE_URL}/api/sensors/history?limit=${limit}`);

export const fetchEngineHealth = () =>
  safeFetch(`${BASE_URL}/api/engine/health`);

export const analyzeFault = () =>
  safeFetch(`${BASE_URL}/api/fault/analyze`, { method: "POST" });

export const simulateFault = (fault_type = "vibration") =>
  safeFetch(`${BASE_URL}/api/fault/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fault_type }),
  });

export const resetFault = () =>
  safeFetch(`${BASE_URL}/api/fault/reset`, { method: "POST" });

export const whatIfSimulate = (rpm, temperature, vibration) =>
  safeFetch(`${BASE_URL}/api/whatif`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rpm, temperature, vibration }),
  });

export const fetchAlerts = () =>
  safeFetch(`${BASE_URL}/api/alerts`);

export function createWebSocket(onMessage, onConnect, onDisconnect) {
  try {
    const ws = new WebSocket(`${WS_URL}/ws/sensors`);
    ws.onopen    = () => onConnect && onConnect();
    ws.onclose   = () => onDisconnect && onDisconnect();
    ws.onerror   = () => onDisconnect && onDisconnect();
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch { }
    };
    return ws;
  } catch {
    onDisconnect && onDisconnect();
    return null;
  }
}
