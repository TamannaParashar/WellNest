"use client"

import { useEffect, useState } from "react"
import { Line, Bar } from "react-chartjs-2"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from "chart.js"
import { TrendingUp, Activity, Utensils, Droplet, Moon, Flame, Zap } from "lucide-react"
import {Link} from "react-router-dom"
import { useUser } from "@clerk/clerk-react"

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`)

        if (!response.ok) throw new Error("Cannot fetch user profile")

        const profile = await response.json()
        setName(profile.name || "User")
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
            fats = 0

          if (log) {
            caloriesBurned = log.workouts?.reduce((s, w) => s + Number(w.calories || 0), 0)

            caloriesConsumed = log.meals?.reduce((s, m) => s + Number(m.calories || 0), 0)

            protein = log.meals?.reduce((s, m) => s + (m.protein || 0), 0)
            carbs = log.meals?.reduce((s, m) => s + (m.carbs || 0), 0)
            fats = log.meals?.reduce((s, m) => s + (m.fats || 0), 0)

            water = log.waterIntake?.reduce((s, w) => s + (w.amount || 0), 0)
            sleep = log.sleepLog?.reduce((s, sl) => s + (sl.hours || 0), 0)
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
        </div>
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
          color: "rgb(134, 239, 172)",
          font: { size: 13, weight: "600" },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderColor: "rgba(34, 197, 94, 0.3)",
        borderWidth: 1,
        padding: 12,
        titleColor: "rgb(134, 239, 172)",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
        grid: { color: "rgba(34, 197, 94, 0.1)" },
      },
      y: {
        ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
        grid: { color: "rgba(34, 197, 94, 0.1)" },
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-500">Wellness Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Your 7-day health analytics</p>
              </div>
            </div>
            <Link to="/home">
              <button className="px-6 py-2.5 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-all font-semibold">
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {name}</h2>
          <p className="text-gray-400 text-lg">Here's your wellness overview for the past week</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-green-500 text-sm font-semibold">Total</span>
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
          {/* Calories Burned */}
          <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Calories Burned</h3>
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
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Calories Consumed */}
          <div className="bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-8 hover:border-yellow-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Utensils className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Calories Consumed</h3>
            </div>
            <div className="h-80">
              <Line
                data={{
                  labels,
                  datasets: [
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

          {/* Macros Breakdown */}
          <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-green-500" />
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
                      grid: { color: "rgba(34, 197, 94, 0.1)" },
                    },
                    y: {
                      stacked: true,
                      ticks: { color: "rgb(156, 163, 175)", font: { size: 12 } },
                      grid: { color: "rgba(34, 197, 94, 0.1)" },
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
