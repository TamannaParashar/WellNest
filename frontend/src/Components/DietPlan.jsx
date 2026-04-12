import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import { GoogleGenAI } from "@google/genai"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Sparkles, RefreshCw, ChevronLeft, Utensils,
  Coffee, Sun, Sunset, Moon, Apple, Flame, Zap, Droplets, Lightbulb, Stethoscope
} from "lucide-react"
import WellNestLoader from "./WellNestLoader"

const MEAL_ICONS = {
  breakfast: Coffee,
  "morning snack": Apple,
  lunch: Sun,
  "evening snack": Sunset,
  dinner: Moon,
}

const MEAL_COLORS = {
  breakfast:        { border: "border-yellow-500/30", bg: "bg-yellow-500/5",  badge: "bg-yellow-500/15 text-yellow-400", icon: "text-yellow-400" },
  "morning snack":  { border: "border-emerald-500/30",  bg: "bg-emerald-500/5",   badge: "bg-emerald-500/15 text-emerald-400",  icon: "text-emerald-400"  },
  lunch:            { border: "border-orange-500/30", bg: "bg-orange-500/5",  badge: "bg-orange-500/15 text-orange-400", icon: "text-orange-400" },
  "evening snack":  { border: "border-purple-500/30", bg: "bg-purple-500/5",  badge: "bg-purple-500/15 text-purple-400", icon: "text-purple-400" },
  dinner:           { border: "border-blue-500/30",   bg: "bg-blue-500/5",    badge: "bg-blue-500/15 text-blue-400",   icon: "text-blue-400"   },
}

export default function DietPlan() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  const email = user?.primaryEmailAddress?.emailAddress

  // Fetch profile
  useEffect(() => {
    if (!isLoaded || !email) return
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`)
        if (res.ok) setProfile(await res.json())
      } catch { /* ignore */ }
      finally { setFetching(false) }
    }
    load()
  }, [isLoaded, email])

  // Load cached plan
  useEffect(() => {
    if (!email) return
    const today = new Date().toISOString().slice(0, 10)
    const cached = localStorage.getItem(`diet_plan_${email}_${today}`)
    if (cached) {
      try { setPlan(JSON.parse(cached)) } catch { /* ignore */ }
    }
  }, [email])

  const generatePlan = async () => {
    if (!profile) return
    setLoading(true)
    setError(null)

    const isVeg = ["vegetarian", "vegan", "eggetarian"].includes(profile.dietType)
    const isVegan = profile.dietType === "vegan"
    const canEatEgg = profile.dietType === "eggetarian"
    const canEatMeat = profile.dietType === "non-vegetarian"

    // Rough TDEE calc
    const bmr = profile.gender === "female"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5

    const actMultiplier = {
      sedentary: 1.2, lightly_active: 1.375,
      moderately_active: 1.55, very_active: 1.725,
    }[profile.activityLevel] || 1.375

    const tdee = Math.round(bmr * actMultiplier)

    const prompt = `You are a certified nutritionist and diet coach. Create a detailed, practical, one-day meal plan for this person:

Name: ${profile.name || "User"}
Age: ${profile.age}, Gender: ${profile.gender || "not specified"}
Weight: ${profile.weight}kg, Height: ${profile.height}cm
Diet: ${profile.dietType}
Fitness Level: ${profile.fitnessLevel || "intermediate"}
Activity Level: ${profile.activityLevel || "moderately_active"}
Health Conditions: ${profile.healthConditions || "none"}
Allergies/Intolerances: ${profile.allergies || "none"}
Estimated TDEE: ~${tdee} kcal/day
Daily calorie burn goal: ${profile.goalCalories || 400} kcal from exercise

Diet restrictions:
- Vegetarian: ${isVeg && !isVegan && !canEatEgg ? "YES — no meat, fish, or eggs" : "NO"}
- Vegan: ${isVegan ? "YES — strictly plant-based, no dairy, no eggs, no honey" : "NO"}
- Can eat eggs: ${canEatEgg ? "YES (eggetarian)" : "NO"}
- Can eat meat/fish: ${canEatMeat ? "YES — include chicken, fish, or lean meats" : "NO"}

Create 5 meals: Breakfast, Morning Snack, Lunch, Evening Snack, Dinner.

For EACH meal provide:
1. Meal name (creative and appetizing)
2. Exact food items with specific quantities (grams or cups or pieces)
3. Preparation tip (1 sentence)
4. Macros: calories, protein_g, carbs_g, fats_g, fiber_g

Also include:
- A hydration schedule (how much water and when)
- 3 supplement suggestions appropriate for their profile (can be simple like "Vitamin D" or "Whey Protein")
- A short overall insight (2 sentences max)

Return ONLY valid JSON in this exact structure:
{
  "overall_calories": 2000,
  "overall_protein": 120,
  "overall_carbs": 220,
  "overall_fats": 60,
  "insight": "Two sentence overall diet insight here.",
  "hydration": "Drink 2 glasses on waking, 1 glass 30min before each meal, and 1 glass before bed.",
  "supplements": ["Vitamin D3 1000 IU with breakfast", "Magnesium 300mg at bedtime", "Omega-3 1g with lunch"],
  "meals": [
    {
      "type": "breakfast",
      "time": "7:00 – 8:00 AM",
      "name": "Meal name",
      "items": [
        { "food": "Rolled oats", "qty": "80g", "note": "use gluten-free if sensitive" },
        { "food": "Banana", "qty": "1 medium" }
      ],
      "prep_tip": "Soak oats overnight for a creamier texture.",
      "calories": 420, "protein_g": 18, "carbs_g": 65, "fats_g": 8, "fiber_g": 7
    }
  ]
}`

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY })
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.6, responseMimeType: "application/json" }
      })
      const parsed = JSON.parse(response.text)
      setPlan(parsed)
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem(`diet_plan_${email}_${today}`, JSON.stringify(parsed))
    } catch (err) {
      console.error(err)
      setError("Failed to generate diet plan. Please check your API key.")
    } finally {
      setLoading(false)
    }
  }

  const regenerate = () => {
    if (!email) return
    const today = new Date().toISOString().slice(0, 10)
    localStorage.removeItem(`diet_plan_${email}_${today}`)
    setPlan(null)
    generatePlan()
  }

  if (fetching) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <WellNestLoader text="Preparing your diet plan" />
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/90 border-b border-amber-500/15 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center gap-2 text-emerald-500 font-bold text-xl">
            <img src="/logo.jpeg" alt="WellNest Logo" className="w-14 h-14 object-cover rounded-full" /> WellNest
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Dashboard</Link>
            <Link to="/profile" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div>
            <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-amber-400 text-sm transition-colors mb-4">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
              <Utensils className="w-9 h-9 text-amber-400" /> AI Diet Plan
            </h1>
            <p className="text-gray-400">
              {profile
                ? `Personalized ${profile.dietType || "healthy"} meal plan for ${profile.name || "you"}`
                : "Set up your profile to get a personalized plan"}
            </p>
          </div>

          {profile && (
            <div className="flex items-center gap-3">
              {plan && (
                <button onClick={regenerate} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-40 text-sm">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
                </button>
              )}
              {!plan && (
                <button onClick={generatePlan} disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating...</>
                    : <><Sparkles className="w-4 h-4" /> Generate My Plan</>
                  }
                </button>
              )}
            </div>
          )}
        </div>

        {/* No profile warning */}
        {!profile && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Required</h2>
            <p className="text-gray-400 mb-6">Build your profile first so we can personalize your diet plan.</p>
            <Link to="/profile" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all">
              Build Profile →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>
        )}

        {/* Loading skeleton */}
        {loading && !plan && (
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-2xl" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {plan && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Macro Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Calories", val: plan.overall_calories, unit: "kcal", icon: Flame,    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                  { label: "Protein",        val: plan.overall_protein,  unit: "g",    icon: Zap,      color: "text-emerald-400",  bg: "bg-emerald-500/10",  border: "border-emerald-500/20"  },
                  { label: "Carbohydrates",  val: plan.overall_carbs,    unit: "g",    icon: Activity, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                  { label: "Fats",           val: plan.overall_fats,     unit: "g",    icon: Droplets, color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20"   },
                ].map(({ label, val, unit, icon: Icon, color, bg, border }) => (
                  <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className={`text-3xl font-extrabold ${color}`}>{val}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{unit}</p>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              {plan.insight && (
                <div className="mb-8 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{plan.insight}"</p>
                </div>
              )}

              {/* Diet type badge */}
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {profile?.dietType?.replace("-", " ") || "Balanced"} Plan
                </span>
                <span className="text-xs text-gray-600">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>

              {/* Meals */}
              <div className="space-y-5 mb-10">
                {plan.meals?.map((meal, i) => {
                  const mealKey = meal.type?.toLowerCase()
                  const colors = MEAL_COLORS[mealKey] || MEAL_COLORS.dinner
                  const Icon = MEAL_ICONS[mealKey] || Utensils
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`border ${colors.border} ${colors.bg} rounded-2xl overflow-hidden`}
                    >
                      {/* Meal header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${colors.bg} border ${colors.border}`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                                {meal.type}
                              </span>
                              <span className="text-xs text-gray-600">{meal.time}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mt-0.5">{meal.name}</h3>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-extrabold text-white">{meal.calories}</p>
                          <p className="text-xs text-gray-500">kcal</p>
                        </div>
                      </div>

                      {/* Food items */}
                      <div className="px-6 py-4">
                        <div className="grid sm:grid-cols-2 gap-2 mb-4">
                          {meal.items?.map((item, j) => (
                            <div key={j} className="flex items-start gap-2.5 p-2.5 bg-black/20 rounded-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                              <div>
                                <span className="text-sm text-white font-medium">{item.food}</span>
                                <span className="text-xs text-gray-500 ml-2">{item.qty}</span>
                                {item.note && <p className="text-xs text-gray-600 mt-0.5 italic">{item.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Prep tip */}
                        {meal.prep_tip && (
                          <div className="mb-4 flex gap-2 text-xs text-gray-500 items-start">
                            <Lightbulb className="text-yellow-500 w-4 h-4 flex-shrink-0" />
                            <span>{meal.prep_tip}</span>
                          </div>
                        )}

                        {/* Macro pills */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Protein",  val: meal.protein_g, unit: "g", color: "text-emerald-400 bg-emerald-500/10" },
                            { label: "Carbs",    val: meal.carbs_g,   unit: "g", color: "text-yellow-400 bg-yellow-500/10" },
                            { label: "Fats",     val: meal.fats_g,    unit: "g", color: "text-blue-400 bg-blue-500/10" },
                            { label: "Fiber",    val: meal.fiber_g,   unit: "g", color: "text-purple-400 bg-purple-500/10" },
                          ].map(({ label, val, unit, color }) => val != null && (
                            <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                              {label}: {val}{unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Hydration & Supplements */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Hydration */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-blue-300">Hydration Schedule</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{plan.hydration}</p>
                  {profile?.waterGoal && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-blue-500">Daily target:</span>
                      <span className="text-xs font-bold text-blue-400">{profile.waterGoal}L</span>
                    </div>
                  )}
                </div>

                {/* Supplements */}
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-purple-300">Recommended Supplements</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.supplements?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link to="/tracker"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20">
                  Log Today's Meals →
                </Link>
                <button onClick={regenerate}
                  className="px-6 py-3 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-xl transition-all">
                  Regenerate Plan
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial CTA */}
        {!plan && !loading && profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Personalized Diet Plan</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-2">
              Based on your <span className="text-amber-400 font-semibold">{profile.dietType}</span> diet,{" "}
              <span className="text-amber-400 font-semibold">{profile.fitnessLevel}</span> fitness level,
              and health profile — Gemini AI will craft a full one-day meal plan with exact quantities and macros.
            </p>
            {profile.healthConditions && profile.healthConditions !== "none" && (
              <p className="text-xs text-gray-600 mb-6 flex items-center justify-center gap-1">
                <Stethoscope className="w-3 h-3" /> Conditions considered: {profile.healthConditions}
              </p>
            )}
            <button onClick={generatePlan}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/20 text-lg flex items-center gap-3 mx-auto">
              <Sparkles className="w-5 h-5" /> Generate My Diet Plan
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
