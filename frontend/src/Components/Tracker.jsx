"use client"

import { useEffect, useState, useRef } from "react"
import { Activity, Utensils, Droplet, Moon, Plus, Trash2, Calendar, TrendingUp, Camera, RefreshCw } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { GoogleGenAI } from "@google/genai"

export default function Tracker() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("workout")
  const [workouts, setWorkouts] = useState([])
  const [workoutForm, setWorkoutForm] = useState({ exerciseType: "", duration: "", calories: "", steps: "" })
  const [meals, setMeals] = useState([])
  const [mealForm, setMealForm] = useState({ mealType: "", calories: "", protein: "", carbs: "", fats: "" })
  const [waterIntake, setWaterIntake] = useState([])
  const [waterForm, setWaterForm] = useState({ amount: "", notes: "" })
  const [sleepLog, setSleepLog] = useState([])
  const [sleepForm, setSleepForm] = useState({ hours: "", notes: "" })
  const [isSaved, setIsSaved] = useState(false);

  // Smart Logger States
  const [scanningMeal, setScanningMeal] = useState(false);
  const [mealImagePreview, setMealImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchTodayLog = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;

        // encode email to avoid special character issues
        const response = await fetch(`http://localhost:8080/api/tracker/email/${encodeURIComponent(email)}`);
        if (!response.ok) {
          let errBody = null;
          try { errBody = await response.json(); } catch (_) { }
          throw new Error(errBody?.message || `Failed to fetch tracker: ${response.status}`);
        }

        const data = await response.json();

        // backend returns array of tracker documents for this email
        if (Array.isArray(data) && data.length > 0) {
          // use ISO yyyy-MM-dd to match backend LocalDate serialization
          const today = new Date().toISOString().slice(0, 10);
          const todayLog = data.find(log => log.date === today);

          if (todayLog) {
            setWorkouts(todayLog.workouts || []);
            setMeals(todayLog.meals || []);
            setWaterIntake(todayLog.waterIntake || []);
            setSleepLog(todayLog.sleepLog || []);
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Failed to fetch daily log:", error);
        setIsSaved(false);
      }
    };

    fetchTodayLog();
  }, [user]);

  // Helper to get today's ISO date string
  const isoToday = () => new Date().toISOString().slice(0, 10);

  const deriveSleepQuality = (hours) => {
    if (hours < 5) return "Poor"
    if (hours < 7) return "Fair"
    if (hours < 8) return "Good"
    return "Excellent"
  }

  // --- ADD FUNCTIONS ---
  const addWorkout = () => {
    const durationNum = Number(workoutForm.duration);
    const caloriesNum = workoutForm.calories ? Number(workoutForm.calories) : 0;
    const stepsNum = workoutForm.steps ? Number(workoutForm.steps) : 0;

    if (!workoutForm.exerciseType || !workoutForm.duration) {
      alert("Please fill in exercise type and duration")
      return
    }
    if (durationNum < 0 || caloriesNum < 0 || stepsNum < 0) {
      alert("Duration and Calories cannot be negative")
      return
    }

    setWorkouts([
      ...workouts,
      { id: Date.now(), ...workoutForm, date: isoToday() },
    ])
    setWorkoutForm({ exerciseType: "", duration: "", calories: "", steps: "" })
  }

  const deleteWorkout = (id) => setWorkouts(workouts.filter(w => w.id !== id));

  const addMeal = () => {
    const caloriesNum = Number(mealForm.calories);
    const proteinNum = mealForm.protein ? Number(mealForm.protein) : 0;
    const carbsNum = mealForm.carbs ? Number(mealForm.carbs) : 0;
    const fatsNum = mealForm.fats ? Number(mealForm.fats) : 0;

    if (!mealForm.mealType || !mealForm.calories) {
      alert("Please fill in meal type and calories")
      return
    }
    if (caloriesNum < 0 || proteinNum < 0 || carbsNum < 0 || fatsNum < 0) {
      alert("Calories and Macros cannot be negative")
      return
    }

    setMeals([
      ...meals,
      { id: Date.now(), ...mealForm, date: isoToday() },
    ])
    setMealForm({ mealType: "", calories: "", protein: "", carbs: "", fats: "" })
  }

  const deleteMeal = (id) => setMeals(meals.filter(m => m.id !== id));

  const addWater = () => {
    const amountNum = Number(waterForm.amount);
    if (!waterForm.amount) {
      alert("Please enter water amount")
      return
    }
    if (amountNum < 0) {
      alert("Water amount cannot be negative")
      return
    }

    setWaterIntake([
      ...waterIntake,
      { id: Date.now(), ...waterForm, date: isoToday() },
    ])
    setWaterForm({ amount: "", notes: "" })
  }

  const deleteWater = (id) => setWaterIntake(waterIntake.filter(w => w.id !== id));

  const addSleep = () => {
    const hoursNum = Number(sleepForm.hours)

    if (!sleepForm.hours) {
      alert("Please enter sleep duration")
      return
    }

    if (hoursNum < 0) {
      alert("Sleep hours cannot be negative")
      return
    }

    const quality = deriveSleepQuality(hoursNum)

    setSleepLog([
      ...sleepLog,
      {
        id: Date.now(),
        hours: hoursNum,
        quality,
        notes: sleepForm.notes,
        date: isoToday(),
      },
    ])

    setSleepForm({ hours: "", notes: "" })
  }
  const deleteSleep = (id) => setSleepLog(sleepLog.filter(s => s.id !== id));

  const saveTracker = async () => {
    if (isSaved) {
      alert("You have already saved today's log.");
      return;
    }
    if (workouts.length === 0 || meals.length === 0 || waterIntake.length === 0 || sleepLog.length === 0) {
      alert("Please fill ALL sections (Workout, Meal, Water, Sleep) before saving your Daily Log.");
      return;
    }

    // Convert all numeric fields to numbers
    const trackerData = {
      email: user?.primaryEmailAddress?.emailAddress,
      date: isoToday(), // include top-level date explicitly as ISO
      workouts: workouts.map(w => ({
        ...w,
        duration: Number(w.duration),
        calories: w.calories ? Number(w.calories) : undefined
      })),
      meals: meals.map(m => ({
        ...m,
        calories: Number(m.calories),
        protein: m.protein ? Number(m.protein) : 0,
        carbs: m.carbs ? Number(m.carbs) : 0,
        fats: m.fats ? Number(m.fats) : 0
      })),
      waterIntake: waterIntake.map(w => ({ ...w, amount: Number(w.amount) })),
      sleepLog: sleepLog.map(s => ({ ...s, hours: Number(s.hours) }))
    };

    try {
      const response = await fetch("http://localhost:8080/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackerData),
      });

      const respBody = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("Save failed:", respBody);
        alert(respBody?.message || `Failed to save log: ${response.status}`);
        return;
      }

      console.log("Saved!", respBody);
      alert("Daily log saved!");
      setIsSaved(true);
      navigate("/view-log", { state: { tracker: respBody } });
    } catch (error) {
      console.error(error);
      alert("Failed to save log");
    }
  };

  // navigate to a view page (route must exist in your app)
  const viewLog = () => {
    if (!isSaved) return;
    navigate(`/view-log`);
  };

  const handleImageScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setMealImagePreview(objectUrl);
    setScanningMeal(true);

    try {
      // Helper to strictly get the base64 string
      const fileToBase64 = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const base64Data = await fileToBase64(file);

      // Gemini 2.5 Flash natively supports multimodal Vision out of the box!
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
      const prompt = `Analyze this food image and estimate the entire meal's macro nutritional value. 
      Return ONLY a valid JSON object with the following exact keys:
      {"mealType": "Breakfast" | "Lunch" | "Dinner" | "Snack" (Guess the best fit based on the food),
       "calories": Number (total estimated calories),
       "protein": Number (grams),
       "carbs": Number (grams),
       "fats": Number (grams)}`;

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.5
        }
      });

      let text = typeof genResponse.text === 'function' ? genResponse.text() : genResponse.text;
      const parsedData = JSON.parse(text || "{}");

      setMealForm({
        mealType: parsedData.mealType || "Lunch",
        calories: parsedData.calories?.toString() || "",
        protein: parsedData.protein?.toString() || "",
        carbs: parsedData.carbs?.toString() || "",
        fats: parsedData.fats?.toString() || ""
      });

      // Quick visual feedback
      alert(`Gemini Vision Scan Complete!\nEstimated ${parsedData.calories || "some"} calories!`);

    } catch (err) {
      console.error("Smart Scan Error:", err);
      alert("Failed to analyze image using Gemini Vision. See console for details.");
    } finally {
      setScanningMeal(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
                <h1 className="text-3xl font-bold text-green-500">Wellness Tracker</h1>
                <p className="text-gray-500 text-sm mt-1">Monitor your daily health metrics</p>
              </div>
            </div>
            <Link to="/home">
              <button className="px-6 py-2.5 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-all font-semibold">
                Home
              </button>
            </Link>
          </div>

          {/* Tab navigation for better organization */}
          <div className="flex gap-2 mt-6 border-b border-green-500/20">
            {[
              { id: "workout", icon: Activity, label: "Workouts" },
              { id: "meal", icon: Utensils, label: "Meals" },
              { id: "water", icon: Droplet, label: "Water" },
              { id: "sleep", icon: Moon, label: "Sleep" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all relative ${activeTab === tab.id ? "text-green-500" : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === "workout" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Activity className="w-7 h-7 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Log Your Workout</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Exercise Type</label>
                  <select
                    value={workoutForm.exerciseType}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, exerciseType: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  >
                    <option value="">Select Exercise</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength Training</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Sports">Sports</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Calories (optional)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={workoutForm.calories}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, calories: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Steps (optional)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={workoutForm.steps}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, steps: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>

              </div>

              <button
                onClick={addWorkout}
                className="px-8 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
              >
                <Plus className="w-5 h-5" />
                Add Workout
              </button>
            </div>

            {/* Workout History */}
            {workouts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Recent Workouts
                </h3>
                <div className="grid gap-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
                              {workout.exerciseType}
                            </span>
                            <span className="text-gray-500 text-sm">{workout.date}</span>
                          </div>
                          <div className="flex gap-6 text-gray-300">
                            <div>
                              <span className="text-gray-500 text-sm">Duration</span>
                              <p className="text-white font-semibold">{workout.duration} min</p>
                            </div>
                            {workout.calories && (
                              <div>
                                <span className="text-gray-500 text-sm">Calories</span>
                                <p className="text-white font-semibold">{workout.calories} kcal</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "meal" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Utensils className="w-7 h-7 text-green-500" />
                  <h2 className="text-2xl font-bold text-white">Log Your Meal</h2>
                </div>
                {/* AI Smart Scan Button */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageScan}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={scanningMeal}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all font-semibold flex items-center gap-2"
                  >
                    {scanningMeal ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    {scanningMeal ? "Running AI Pipeline..." : "Smart Scan (AI)"}
                  </button>
                </div>
              </div>

              {/* Optional Preview */}
              {mealImagePreview && (
                <div className="mb-6 rounded-xl overflow-hidden border border-blue-500/30 w-32 h-32 relative">
                  {scanningMeal && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><RefreshCw className="w-6 h-6 text-blue-400 animate-spin" /></div>}
                  <img src={mealImagePreview} alt="Meal preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Meal Type</label>
                  <select
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  >
                    <option value="">Select Meal</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Total Calories</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-3">Macros (optional)</label>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="25"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={mealForm.fats}
                      onChange={(e) => setMealForm({ ...mealForm, fats: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus;border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addMeal}
                className="px-8 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
              >
                <Plus className="w-5 h-5" />
                Add Meal
              </button>
            </div>

            {/* Meal History */}
            {meals.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Meal History
                </h3>
                <div className="grid gap-4">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-black/40 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
                              {meal.mealType}
                            </span>
                            <span className="text-gray-500 text-sm">{meal.date}</span>
                          </div>
                          <div className="flex gap-6 text-gray-300">
                            <div>
                              <span className="text-gray-500 text-sm">Calories</span>
                              <p className="text-white font-semibold text-lg">{meal.calories} kcal</p>
                            </div>
                            {(meal.protein || meal.carbs || meal.fats) && (
                              <div className="flex gap-4 items-center pl-6 border-l border-green-500/30">
                                {meal.protein && (
                                  <div>
                                    <span className="text-gray-500 text-xs">Protein</span>
                                    <p className="text-white font-semibold">{meal.protein}g</p>
                                  </div>
                                )}
                                {meal.carbs && (
                                  <div>
                                    <span className="text-gray-500 text-xs">Carbs</span>
                                    <p className="text-white font-semibold">{meal.carbs}g</p>
                                  </div>
                                )}
                                {meal.fats && (
                                  <div>
                                    <span className="text-gray-500 text-xs">Fats</span>
                                    <p className="text-white font-semibold">{meal.fats}g</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "water" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Droplet className="w-7 h-7 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Log Water Intake</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Amount (liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={waterForm.amount}
                    onChange={(e) => setWaterForm({ ...waterForm, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., felt well hydrated"
                    value={waterForm.notes}
                    onChange={(e) => setWaterForm({ ...waterForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={addWater}
                className="px-8 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
              >
                <Plus className="w-5 h-5" />
                Log Water
              </button>
            </div>

            {/* Water History */}
            {waterIntake.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Hydration Log
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {waterIntake.map((water) => (
                    <div
                      key={water.id}
                      className="bg-black/40 border border-green-500/20 rounded-xl p-5 hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-gray-500 text-sm">{water.date}</span>
                          <p className="text-2xl font-bold text-green-500 mt-2">{water.amount}L</p>
                          {water.notes && <p className="text-gray-400 text-sm mt-2">{water.notes}</p>}
                        </div>
                        <button
                          onClick={() => deleteWater(water.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sleep" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Moon className="w-7 h-7 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Log Sleep</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-green-500 mb-2">Hours Slept</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="7.5"
                    value={sleepForm.hours}
                    onChange={(e) => setSleepForm({ ...sleepForm, hours: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-green-500 mb-2">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., woke up feeling refreshed"
                  value={sleepForm.notes}
                  onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                />
              </div>

              <button
                onClick={addSleep}
                className="px-8 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
              >
                <Plus className="w-5 h-5" />
                Log Sleep
              </button>
            </div>

            {/* Sleep History */}
            {sleepLog.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Sleep History
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {sleepLog.map((sleep) => (
                    <div
                      key={sleep.id}
                      className="bg-black/40 border border-green-500/20 rounded-xl p-5 hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-gray-500 text-sm">{sleep.date}</span>
                          <div className="flex items-baseline gap-3 mt-2">
                            <p className="text-2xl font-bold text-green-500">{sleep.hours}h</p>
                            {sleep.quality && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-semibold">
                                {sleep.quality}
                              </span>
                            )}
                          </div>
                          {sleep.notes && <p className="text-gray-400 text-sm mt-2">{sleep.notes}</p>}
                        </div>
                        <button onClick={() => deleteSleep(sleep.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            disabled={isSaved}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${isSaved ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-green-500 text-black hover:bg-green-400 shadow-green-500/50"}`}
            onClick={saveTracker}
          >
            {isSaved ? "Daily Log Already Saved" : "Daily Log"}
          </button>

          {/* View Log button: enabled only when a saved log exists (isSaved === true) */}
          <button
            onClick={viewLog}
            disabled={!isSaved}
            aria-disabled={!isSaved}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${!isSaved
              ? "bg-gray-700 text-gray-300 cursor-not-allowed"
              : "bg-green-500 text-black hover:bg-green-400 shadow-green-500/50"
              }`}
            title={!isSaved ? "No saved log for today" : "View today's saved log"}
          >
            View log
          </button>
        </div>
      </main>
    </div>
  )
}