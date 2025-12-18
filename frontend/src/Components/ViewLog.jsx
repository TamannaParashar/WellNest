"use client"

import { useEffect, useState } from "react"
import { Activity, Utensils, Droplet, Moon, Calendar, ArrowLeft, Flame, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"

export default function ViewLog() {
  const {user} = useUser();
  const [logData, setLogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
const email = user?.primaryEmailAddress?.emailAddress;
const today = new Date().toISOString().split("T")[0]
  useEffect(() => {
    const fetchLogData = async () => {
      if (!email) {
        setError("Missing email or date parameter")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:8080/api/tracker/email/${encodeURIComponent(email)}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch tracker data: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
        const selectedLog = data.find((log) => {
            const logDate = new Date(log.date).toISOString().split("T")[0];
            return logDate === today;
        });

        if (selectedLog) {
            setLogData(selectedLog);
        } else {
            setError("No log found for this date");
        }
        } else {
          setError("No tracker data available")
        }
      } catch (err) {
        console.error("Failed to fetch log:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogData()
  }, [email, today])

  // Calculate totals
  const calculateTotals = () => {
    if (!logData)
      return {
        totalCaloriesBurned: 0,
        totalCaloriesConsumed: 0,
        totalWater: 0,
        totalSleep: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      }

    const totalCaloriesBurned = logData.workouts?.reduce((sum, w) => sum + (Number(w.calories) || 0), 0) || 0
    const totalCaloriesConsumed = logData.meals?.reduce((sum, m) => sum + (Number(m.calories) || 0), 0) || 0
    const totalProtein = logData.meals?.reduce((sum, m) => sum + (Number(m.protein) || 0), 0) || 0
    const totalCarbs = logData.meals?.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0) || 0
    const totalFats = logData.meals?.reduce((sum, m) => sum + (Number(m.fats) || 0), 0) || 0
    const totalWater = logData.waterIntake?.reduce((sum, w) => sum + (Number(w.amount) || 0), 0) || 0
    const totalSleep = logData.sleepLog?.reduce((sum, s) => sum + (Number(s.hours) || 0), 0) || 0

    return { totalCaloriesBurned, totalCaloriesConsumed, totalWater, totalSleep, totalProtein, totalCarbs, totalFats }
  }

  const totals = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your wellness log...</p>
        </div>
      </div>
    )
  }

  if (error || !logData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
            <p className="text-red-500 font-semibold">{error || "No data available"}</p>
          </div>
          <Link to="/tracker">
            <button className="px-6 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all font-bold">
              Back to Tracker
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-500">Daily Wellness Log</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(today).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Link to="/tracker">
              <button className="px-6 py-2.5 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-all font-semibold flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Tracker
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-6 h-6 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-400">Calories Burned</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totals.totalCaloriesBurned}</p>
            <p className="text-sm text-gray-500 mt-1">kcal</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Utensils className="w-6 h-6 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-400">Calories Consumed</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totals.totalCaloriesConsumed}</p>
            <p className="text-sm text-gray-500 mt-1">kcal</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Droplet className="w-6 h-6 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-400">Water Intake</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totals.totalWater}</p>
            <p className="text-sm text-gray-500 mt-1">L</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Moon className="w-6 h-6 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-400">Total Sleep</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totals.totalSleep}</p>
            <p className="text-sm text-gray-500 mt-1">hours</p>
          </div>
        </div>

        {/* Workouts Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-7 h-7 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Workout Activities</h2>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
              {logData.workouts?.length || 0} sessions
            </span>
          </div>

          {logData.workouts && logData.workouts.length > 0 ? (
            <div className="grid gap-4">
              {logData.workouts.map((workout, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-green-500/20 text-green-500 rounded-lg text-sm font-bold">
                          {workout.exerciseType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500 text-sm">Duration</span>
                          </div>
                          <p className="text-white font-semibold text-lg">{workout.duration} min</p>
                        </div>
                        {workout.calories && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Flame className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500 text-sm">Calories</span>
                            </div>
                            <p className="text-white font-semibold text-lg">{workout.calories} kcal</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No workout data recorded</p>
            </div>
          )}
        </div>

        {/* Meals Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="w-7 h-7 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Nutrition & Meals</h2>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
              {logData.meals?.length || 0} meals
            </span>
          </div>

          {/* Macros Summary */}
          {totals.totalProtein > 0 || totals.totalCarbs > 0 || totals.totalFats > 0 ? (
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Daily Macros</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Protein</p>
                  <p className="text-2xl font-bold text-white">{totals.totalProtein}g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Carbs</p>
                  <p className="text-2xl font-bold text-white">{totals.totalCarbs}g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Fats</p>
                  <p className="text-2xl font-bold text-white">{totals.totalFats}g</p>
                </div>
              </div>
            </div>
          ) : null}

          {logData.meals && logData.meals.length > 0 ? (
            <div className="grid gap-4">
              {logData.meals.map((meal, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-4 py-1.5 bg-green-500/20 text-green-500 rounded-lg text-sm font-bold">
                      {meal.mealType}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{meal.calories}</p>
                      <p className="text-gray-500 text-sm">kcal</p>
                    </div>
                  </div>

                  {(meal.protein || meal.carbs || meal.fats) && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-500/10">
                      {meal.protein > 0 && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Protein</p>
                          <p className="text-white font-semibold">{meal.protein}g</p>
                        </div>
                      )}
                      {meal.carbs > 0 && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Carbs</p>
                          <p className="text-white font-semibold">{meal.carbs}g</p>
                        </div>
                      )}
                      {meal.fats > 0 && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Fats</p>
                          <p className="text-white font-semibold">{meal.fats}g</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No meal data recorded</p>
            </div>
          )}
        </div>

        {/* Water Intake Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Droplet className="w-7 h-7 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Water Intake</h2>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
              {logData.waterIntake?.length || 0} entries
            </span>
          </div>

          {logData.waterIntake && logData.waterIntake.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {logData.waterIntake.map((water, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-green-500" />
                      <span className="text-gray-500 text-sm">Amount</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{water.amount} L</p>
                  </div>
                  {water.notes && (
                    <div className="pt-3 border-t border-green-500/10">
                      <p className="text-gray-500 text-xs mb-1">Notes</p>
                      <p className="text-gray-300 text-sm">{water.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No water intake data recorded</p>
            </div>
          )}
        </div>

        {/* Sleep Log Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Moon className="w-7 h-7 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Sleep Log</h2>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
              {logData.sleepLog?.length || 0} entries
            </span>
          </div>

          {logData.sleepLog && logData.sleepLog.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {logData.sleepLog.map((sleep, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-green-500" />
                      <span className="text-gray-500 text-sm">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{sleep.hours} hrs</p>
                  </div>

                  <div className="space-y-3">
                    {sleep.quality && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Quality</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              sleep.quality.toLowerCase() === "excellent"
                                ? "bg-green-500/20 text-green-500"
                                : sleep.quality.toLowerCase() === "good"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : sleep.quality.toLowerCase() === "fair"
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {sleep.quality}
                          </span>
                        </div>
                      </div>
                    )}
                    {sleep.notes && (
                      <div className="pt-3 border-t border-green-500/10">
                        <p className="text-gray-500 text-xs mb-1">Notes</p>
                        <p className="text-gray-300 text-sm">{sleep.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-8 text-center">
              <p className="text-gray-500">No sleep data recorded</p>
            </div>
          )}
        </div>

        {/* Net Calories */}
        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Net Calorie Balance</h3>
              <p className="text-gray-500 text-sm">Consumed - Burned</p>
            </div>
            <div className="text-right">
              <p
                className={`text-4xl font-bold ${
                  totals.totalCaloriesConsumed - totals.totalCaloriesBurned > 0
                    ? "text-green-500"
                    : totals.totalCaloriesConsumed - totals.totalCaloriesBurned < 0
                      ? "text-red-500"
                      : "text-gray-400"
                }`}
              >
                {totals.totalCaloriesConsumed - totals.totalCaloriesBurned > 0 ? "+" : ""}
                {totals.totalCaloriesConsumed - totals.totalCaloriesBurned}
              </p>
              <p className="text-gray-500 text-sm mt-1">kcal</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}