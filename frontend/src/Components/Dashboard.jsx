"use client"

import { useEffect, useState } from "react"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from "chart.js"
import { TrendingUp, Activity, Utensils, Droplet, Moon, Flame, Zap, ShieldCheck, Trophy, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {Link} from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { motion } from "framer-motion"
import AIHealthInsights from "./AIHealthInsights"
import WellNestLoader from "./WellNestLoader"
import AITodayPlan from "./AITodayPlan"

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

export default function Dashboard() {
  const {user} = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [name, setName] = useState("")
  const [weekData, setWeekData] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekSummary, setWeekSummary] = useState({
    totalCaloriesBurned: 0,
    totalCaloriesConsumed: 0,
    totalWater: 0,
    totalSleep: 0,
  })
  const [goals, setGoals] = useState({
  goalSteps: 0,
  goalCalories: 0,
  goalExerciseMinutes: 0,
})




  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`)

        if (!response.ok) throw new Error("Cannot fetch user profile")

        const profile = await response.json()
        setName(profile.name || "User")
        setGoals({
        goalSteps: profile.goalSteps || 0,
        goalCalories: profile.goalCalories || 0,
        goalExerciseMinutes: profile.goalExerciseMinutes || 0,
      })
      } catch (err) {
        console.error("Error fetching profile:", err)
        setName("User")
      }
    }

    fetchUserProfile()
  }, [email])

  // FETCH WEEKLY TRACKER DATA
  useEffect(() => {
    if (!email) return

    const fetchWeekData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/tracker/email/${encodeURIComponent(email)}`)
        const data = await response.json()

        const today = new Date()
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(today.getDate() - i)
          return d.toISOString().split("T")[0]
        }).reverse()

        const formatted = last7.map((dateStr) => {
          const log = data.find((l) => {
            const logDate = new Date(l.date).toISOString().split("T")[0]
            return logDate === dateStr
          })

          let caloriesBurned = 0,
            caloriesConsumed = 0,
            water = 0,
            sleep = 0,
            protein = 0,
            carbs = 0,
            fats = 0,
            steps = 0,
            workouts = []

          if (log) {
            caloriesBurned = log.workouts?.reduce((s, w) => s + Number(w.calories || 0), 0)
            caloriesConsumed = log.meals?.reduce((s, m) => s + Number(m.calories || 0), 0)
            steps = log.workouts?.reduce((s, w) => s + Number(w.steps || 0), 0)

            protein = log.meals?.reduce((s, m) => s + (m.protein || 0), 0)
            carbs = log.meals?.reduce((s, m) => s + (m.carbs || 0), 0)
            fats = log.meals?.reduce((s, m) => s + (m.fats || 0), 0)

            water = log.waterIntake?.reduce((s, w) => s + (w.amount || 0), 0)
            sleep = log.sleepLog?.reduce((s, sl) => s + (sl.hours || 0), 0)
            workouts = log.workouts || []
          }

          return {
            date: dateStr,
            caloriesBurned,
            caloriesConsumed,
            water,
            sleep,
            protein,
            carbs,
            fats,
            steps,  
            workouts
          }
        })

        setWeekData(formatted)

        const totalCaloriesBurned = formatted.reduce((sum, d) => sum + d.caloriesBurned, 0)
        const totalCaloriesConsumed = formatted.reduce((sum, d) => sum + d.caloriesConsumed, 0)
        const totalWater = formatted.reduce((sum, d) => sum + d.water, 0)
        const totalSleep = formatted.reduce((sum, d) => sum + d.sleep, 0)

        setWeekSummary({
          totalCaloriesBurned,
          totalCaloriesConsumed,
          totalWater,
          totalSleep,
        })
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeekData()
  }, [email])

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <WellNestLoader text="Loading your wellness data" />
      </div>
    )

  // Labels
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const labels = weekData.map((d) => {
    const dt = new Date(d.date)
    return dayNames[dt.getDay()]
  })

  // Data arrays
  const caloriesBurned = weekData.map((d) => d.caloriesBurned)
  const caloriesConsumed = weekData.map((d) => d.caloriesConsumed)
  const water = weekData.map((d) => d.water)
  const sleep = weekData.map((d) => d.sleep)
  const protein = weekData.map((d) => d.protein)
  const carbs = weekData.map((d) => d.carbs)
  const fats = weekData.map((d) => d.fats)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgb(209, 213, 219)",
          font: { size: 13, weight: "600" },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        padding: 12,
        titleColor: "rgb(209, 213, 219)",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
        grid: { color: "rgba(148, 163, 184, 0.08)" },
      },
      y: {
        ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
        grid: { color: "rgba(148, 163, 184, 0.08)" },
      },
    },
  }

  const weeklyTargets = {
  steps: goals.goalSteps * 7,
  calories: goals.goalCalories * 7,
  exercise: goals.goalExerciseMinutes * 7,
}

// Example actual values (adjust if your tracker has steps/exercise)
const weeklyActual = {
  steps: weekData.reduce((s, d) => s + (d.steps || 0), 0),
  calories: weekSummary.totalCaloriesBurned,
   exercise: weekData.reduce((s, d) => 
  s + (d.workouts?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0), 
0),
}

// Calculate Streak
let streak = 0;
for (let i = weekData.length - 1; i >= 0; i--) {
  const d = weekData[i];
  const hasActivity = d.caloriesBurned > 0 || d.caloriesConsumed > 0 || d.water > 0 || d.sleep > 0 || d.steps > 0 || (d.workouts && d.workouts.length > 0);
  if (hasActivity) {
    streak++;
  } else if (i !== weekData.length - 1) {
    break; // Only allow zero activity if it's today (maybe they haven't logged yet)
  }
}

// Trend Detection
const todayData = weekData[weekData.length - 1] || {};
const yesterdayData = weekData[weekData.length - 2] || {};
const isTrendingUp = (todayData.caloriesBurned || 0) >= (yesterdayData.caloriesBurned || 0);

// Calculate Health Score
let healthScore = 0;
if (weeklyTargets.calories > 0 || weeklyTargets.exercise > 0 || weeklyTargets.steps > 0) {
  let calScore = weeklyTargets.calories > 0 ? Math.min(100, (weeklyActual.calories / weeklyTargets.calories) * 100) : 100;
  let exScore = weeklyTargets.exercise > 0 ? Math.min(100, (weeklyActual.exercise / weeklyTargets.exercise) * 100) : 100;
  let stepScore = weeklyTargets.steps > 0 ? Math.min(100, (weeklyActual.steps / weeklyTargets.steps) * 100) : 100;
  healthScore = Math.round((calScore + exScore + stepScore) / 3);
} else {
  healthScore = weekSummary.totalCaloriesBurned > 0 ? 85 : 0;
}


  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Wellness Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Your 7-day health analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/home">
                <button className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-black transition-all font-semibold">
                  Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {name}</h2>
            <p className="text-gray-400 text-lg">Here's your wellness overview for the past week</p>
          </div>
          
          {/* Top Level Metric Badges */}
          {!loading && weekData.length > 0 && (
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-bold text-orange-400">{streak} Day Streak!</span>
                </motion.div>
              )}
               <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                 {isTrendingUp ? (
                   <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                 ) : (
                   <ArrowDownRight className="w-5 h-5 text-red-500" />
                 )}
                 <span className="text-sm font-medium text-gray-300">
                   {isTrendingUp ? "Activity Trending Up" : "Activity Trending Down"}
                 </span>
               </div>
            </div>
          )}
        </div>

        {!loading && weekData.length > 0 && (
          <div className="mb-12">
             <AITodayPlan weekData={[...weekData].reverse()} goals={goals} userName={name} />
          </div>
        )}

        {/* Health Score Banner */}
        {!loading && weekData.length > 0 && (
           <div className="w-full bg-gradient-to-r from-emerald-900/30 via-slate-950 to-teal-900/30 border-y border-emerald-500/20 py-8 mb-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl shadow-[0_0_50px_rgba(5,150,105,0.2)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                 <div className="relative">
                   <svg className="w-32 h-32 transform -rotate-90">
                     <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                     <motion.circle 
                       initial={{ strokeDasharray: "0 400" }} 
                       animate={{ strokeDasharray: `${(healthScore / 100) * 377} 400` }} 
                       transition={{ duration: 2, ease: "easeOut" }}
                       cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" 
                       className={`${healthScore >= 80 ? 'text-emerald-500' : healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`} 
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-4xl font-extrabold text-white">{healthScore}</span>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                     <ShieldCheck className="w-8 h-8 text-emerald-400" /> Weekly Health Score
                   </h3>
                   <p className="text-gray-300 max-w-lg text-lg">
                     {healthScore >= 80 ? "Outstanding performance! You are crushing your wellness goals this week." : 
                      healthScore >= 50 ? "Solid effort! A little more consistency and you'll be at the top." : 
                      "Just getting started. Every step counts, let's pick up the pace!"}
                   </p>
                 </div>
              </div>
           </div>
        )}

        {/* AI Health Visualizer */}
        {!loading && weekData.length > 0 && (
          <AIHealthInsights weekData={weekData} userName={name} healthScore={healthScore} />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-emerald-500 text-sm font-semibold">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{weekSummary.totalCaloriesBurned.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Calories Burned</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Utensils className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-yellow-500 text-sm font-semibold">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{weekSummary.totalCaloriesConsumed.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Calories Consumed</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Droplet className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 text-sm font-semibold">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{weekSummary.totalWater}L</p>
            <p className="text-gray-500 text-sm">Water Intake</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Moon className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-purple-500 text-sm font-semibold">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{weekSummary.totalSleep}h</p>
            <p className="text-gray-500 text-sm">Sleep</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Calories Overview */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Calories Overview</h3>
            </div>
            <div className="h-80">
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Calories Burned",
                      data: caloriesBurned,
                      borderColor: "rgb(34, 197, 94)",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      tension: 0.4,
                      borderWidth: 3,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      pointBackgroundColor: "rgb(34, 197, 94)",
                      pointBorderColor: "black",
                      pointBorderWidth: 2,
                    },
                    {
                      label: "Calories Consumed",
                      data: caloriesConsumed,
                      borderColor: "rgb(234, 179, 8)",
                      backgroundColor: "rgba(234, 179, 8, 0.1)",
                      tension: 0.4,
                      borderWidth: 3,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      pointBackgroundColor: "rgb(234, 179, 8)",
                      pointBorderColor: "black",
                      pointBorderWidth: 2,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Droplet className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Water Intake (L)</h3>
            </div>
            <div className="h-80">
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Water (L)",
                      data: water,
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderColor: "rgb(59, 130, 246)",
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: "rgb(59, 130, 246)",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Moon className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Sleep Hours</h3>
            </div>
            <div className="h-80">
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Sleep (hours)",
                      data: sleep,
                      backgroundColor: "rgba(168, 85, 247, 0.8)",
                      borderColor: "rgb(168, 85, 247)",
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: "rgb(168, 85, 247)",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

{/* 🎯 Goal Tracker */}
<div className="bg-gradient-to-br from-teal-500/5 to-blue-500/5 border border-teal-500/20 rounded-2xl p-8 hover:border-teal-500/40 transition-all">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-teal-500/20 rounded-lg">
      <TrendingUp className="w-5 h-5 text-teal-500" />
    </div>
    <h3 className="text-xl font-bold text-white">Goal Tracker</h3>
  </div>

  <div className="space-y-6 mt-4">
    {[
      {
        label: "Calories Burned",
        actual: weeklyActual.calories,
        target: weeklyTargets.calories,
      },
      {
        label: "Exercise Time (min)",
        actual: weeklyActual.exercise,
        target: weeklyTargets.exercise,
      },
      {
        label: "Steps",
        actual: weeklyActual.steps,
        target: weeklyTargets.steps,
      },
    ].map(({ label, actual, target }) => {
      const percentage = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0

      // Determine color based on percentage
      let colorClass = ""
      if (percentage < 50) colorClass = "bg-red-500"
      else if (percentage <= 75) colorClass = "bg-yellow-500"
      else if (percentage <= 99) colorClass = "bg-blue-500"
      else colorClass = "bg-emerald-500"

      const getInsight = (pct) => {
        if (pct < 50) return `You are just getting started with ${label.toLowerCase()}. Try to increase your activity!`
        if (pct <= 75) return `Good progress on ${label.toLowerCase()}. Keep pushing a bit more!`
        if (pct <= 90) return `Great work on ${label.toLowerCase()}. Almost there!`
        if (pct <= 99) return `Excellent effort on ${label.toLowerCase()}. One last push to hit your goal!`
        return `Goal achieved for ${label.toLowerCase()}! Keep up the fantastic work!`
      }

      return (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-white font-semibold">{label}</span>
            <span className="text-gray-400 font-medium">{percentage}%</span>
          </div>
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-1">
            <div className={`${colorClass} h-4 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
          </div>
          <p className="text-gray-400 text-sm">{getInsight(percentage)}</p>
        </div>
      )
    })}
  </div>
</div>


          {/* Macros Breakdown */}
          <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Macros Breakdown (grams)</h3>
            </div>
            <div className="h-80">
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Protein (g)",
                      data: protein,
                      backgroundColor: "rgba(239, 68, 68, 0.8)",
                      borderColor: "rgb(239, 68, 68)",
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                    {
                      label: "Carbs (g)",
                      data: carbs,
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderColor: "rgb(34, 197, 94)",
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                    {
                      label: "Fats (g)",
                      data: fats,
                      backgroundColor: "rgba(245, 158, 11, 0.8)",
                      borderColor: "rgb(245, 158, 11)",
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      stacked: true,
                      ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
                      grid: { color: "rgba(148, 163, 184, 0.08)" },
                    },
                    y: {
                      stacked: true,
                      ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
                      grid: { color: "rgba(148, 163, 184, 0.08)" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
