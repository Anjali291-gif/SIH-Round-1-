export default function CircProgress({ value, size = 120, stroke = 10, color = "#1cb86a" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8eef6" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .6s" }}
      />
      <text
        x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg)`, transformOrigin: "50% 50%", fontSize: 22, fontWeight: 800, fill: "#0d2144", fontFamily: "inherit" }}
      >{value}%</text>
    </svg>
  );
}
