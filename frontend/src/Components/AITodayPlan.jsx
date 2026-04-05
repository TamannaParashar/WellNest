import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GoogleGenAI } from "@google/genai"
import { Sparkles, ArrowRightCircle, Target } from "lucide-react"
import { Link } from "react-router-dom"

export default function AITodayPlan({ weekData, goals, userName }) {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If we only have loading skeleton or no data at all yet, don't ping AI
    if (!weekData || weekData.length === 0) return

    const fetchPlan = async () => {
      // 1. Prepare data Context
      const todayData = weekData[0] || {}
      const yesterdayData = weekData[1] || {}

      const prompt = `
        You are an expert AI Health & Fitness coach for ${userName || "this user"}.
        The user has these weekly goals: Steps: ${goals?.goalSteps * 7 || "N/A"}, Calories to Burn: ${goals?.goalCalories * 7 || "N/A"}.
        
        Yesterday, the user logged: 
        - Calories Burned: ${yesterdayData.caloriesBurned || 0}
        - Calories Consumed: ${yesterdayData.caloriesConsumed || 0}
        - Water: ${yesterdayData.water || 0}L
        - Sleep: ${yesterdayData.sleep || 0}h
        - Steps: ${yesterdayData.steps || 0}
        
        Today, the user has logged so far:
        - Calories Burned: ${todayData.caloriesBurned || 0}
        - Sleep: ${todayData.sleep || 0}h

        Based on yesterday's performance relative to normal healthy patterns, and what they have (or haven't) done today, give a ONE SENTENCE hyper-personalized, highly actionable piece of advice or motivating instruction.
        Be encouraging, very brief (under 25 words), and specific.
        
        Return ONLY a JSON object with this exact field:
        {"plan": "Your 1 sentence advice here"}
      `

      // 2. Fetch from Cache
      const todayStr = new Date().toISOString().split("T")[0]
      const cacheKey = `ai_plan_${todayStr}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setPlan(cached)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY })
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })

        let text = "Stay focused on your wellness goals today!";
        if (typeof response.text === 'function') {
          const parsed = JSON.parse(response.text());
          text = parsed.plan;
        } else {
          const parsed = JSON.parse(response.text || '{"plan": ""}');
          text = parsed.plan || text;
        }

        text = text.trim();
        setPlan(text)
        localStorage.setItem(cacheKey, text)
      } catch (err) {
        console.error("AI Today Plan error:", err)
         // Fallback if API fails
        setPlan("Stay consistent and focus on balancing your hydration and sleep today.")
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [weekData, goals, userName])

  if (!weekData || weekData.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="flex flex-col md:flex-row gap-5 items-center relative z-10">
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-50 animate-pulse" />
          <div className="w-14 h-14 bg-black border border-indigo-500/50 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
             <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-sm font-bold tracking-wider text-indigo-400 uppercase mb-1 flex items-center justify-center md:justify-start gap-2">
            <Target className="w-4 h-4" /> Today's AI Mission
          </h3>
          {loading ? (
             <div className="space-y-2 mt-2 w-full max-w-lg">
               <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
               <div className="h-4 bg-white/10 rounded animate-pulse w-4/5" />
             </div>
          ) : (
            <p className="text-white text-lg md:text-xl font-medium leading-relaxed drop-shadow-md">
              "{plan}"
            </p>
          )}
        </div>
        
        {!loading && (
           <Link to="/tracker" className="flex-shrink-0">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="w-full px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/50 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-500/20"
             >
                Let's Do It <ArrowRightCircle className="w-5 h-5" />
             </motion.button>
           </Link>
        )}
      </div>
    </motion.div>
  )
}
