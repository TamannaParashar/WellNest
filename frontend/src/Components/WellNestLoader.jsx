import { Heart } from "lucide-react"

/**
 * WellNestLoader — Premium loading animation with dual spinning
 * gradient rings, a pulsing core, and a heartbeat icon.
 * 
 * @param {string} text - optional text shown below the spinner
 * @param {boolean} overlay - if true, renders as full-page overlay
 * @param {boolean} inline - if true, renders smaller inline version
 */
export default function WellNestLoader({ text = "Processing your health data", overlay = false, inline = false }) {
  const size = inline ? "w-10 h-10" : "w-20 h-20"
  const heartSize = inline ? "w-3 h-3" : "w-5 h-5"

  const spinner = (
    <div className={`wellnest-loader ${size}`}>
      <div className="loader-ring loader-ring-outer" />
      <div className="loader-ring loader-ring-inner" />
      <div className="loader-core" />
      <div className="loader-heartbeat">
        <Heart className={`${heartSize} text-emerald-400`} fill="currentColor" />
      </div>
    </div>
  )

  if (overlay) {
    return (
      <div className="loader-overlay">
        {spinner}
        {text && <p className="loader-text">{text}</p>}
      </div>
    )
  }

  if (inline) {
    return spinner
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {spinner}
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}
