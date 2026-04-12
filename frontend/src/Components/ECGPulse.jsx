/**
 * ECG Pulse Background — a continuous heartbeat monitor line
 * that scrolls horizontally behind the hero section.
 * Pure SVG + CSS animation — zero JS overhead at runtime.
 */
export default function ECGPulse() {
  // One full ECG cycle waveform (flat → P wave → QRS complex → T wave → flat)
  // Repeats so the scroll loops seamlessly
  const cycle = "L 60 60 L 80 60 Q 90 50 100 60 L 130 60 L 140 20 L 150 90 L 160 10 L 170 75 L 180 55 L 200 60 L 240 60 Q 260 45 280 60 L 320 60"
  const path = `M 0 60 ${cycle} ${cycle.replace(/(\d+)/g, (_, n) => Number(n) + 320)}`

  return (
    <div className="ecg-container" aria-hidden="true">
      <svg className="ecg-line" viewBox="0 0 640 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C853" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00E676" stopOpacity="1" />
            <stop offset="100%" stopColor="#2979FF" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path d={path} />
      </svg>
    </div>
  )
}
