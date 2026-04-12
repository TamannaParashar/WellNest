import {useState,useEffect,useRef} from "react"
import {SignOutButton, useUser} from "@clerk/clerk-react"
import {Link,useNavigate} from "react-router-dom"
import {Menu, X, Activity, Heart, Target, Droplet, Moon, Utensils, TrendingUp, Zap, RefreshCw, Bell, Dumbbell} from "lucide-react"
import { GoogleGenAI } from "@google/genai"
import { motion } from "framer-motion"
import ECGPulse from "./ECGPulse"
import WellNestLoader from "./WellNestLoader"

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false)
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmiResult, setBmiResult] = useState({ bmi: 0, category: "", advice: "" })
  const [hasProfile, setHasProfile] = useState(false)
  const [dailyTip, setDailyTip] = useState(null)
  const [tipLoading, setTipLoading] = useState(false)
  
  // Progress Notification State
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Trainer Bell Notification State
  const [trainerTasks, setTrainerTasks] = useState([])
  const [isBellOpen, setIsBellOpen] = useState(false)
  const bellRef = useRef(null)

  const { user } = useUser();
  const navigate = useNavigate();

  // Check if profile exists
  useEffect(() => {
    const checkProfile = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return

      try {
        const res = await fetch(`http://localhost:8080/api/user-profile/${user.emailAddresses[0].emailAddress}`)
        if (res.ok) {
          setHasProfile(true)
        } else {
          setHasProfile(false)
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setHasProfile(false)
      }
    }

    checkProfile()
  }, [user])

  // Fetch trainer tasks for bell notification
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
    if (!email) return

    const fetchTrainerTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tasks/${email}`)
        if (!res.ok) return
        const data = await res.json()
        setTrainerTasks(data || [])
      } catch (err) {
        console.error("Failed to fetch trainer tasks:", err)
      }
    }

    fetchTrainerTasks()
  }, [user])

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsBellOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Notification Logic
  useEffect(() => {
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) return;

    const checkProgressAndNotify = async () => {
      const todayString = new Date().toISOString().slice(0, 10);

      try {
        const profRes = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`);
        if (!profRes.ok) return;
        const profile = await profRes.json();
        
        const trackRes = await fetch(`http://localhost:8080/api/tracker/email/${encodeURIComponent(email)}`);
        let stepsToday = 0;

        if (trackRes.ok) {
           const trackData = await trackRes.json();
           const todayLog = trackData.find(l => l.date === todayString);
           if (todayLog && todayLog.workouts) {
             stepsToday = todayLog.workouts.reduce((s, w) => s + Number(w.steps || 0), 0);
           }
        }

        const noSteps = stepsToday === 0;
        const lowProgress = profile.goalSteps > 0 && stepsToday < (profile.goalSteps * 0.2);

        if (noSteps || lowProgress) {
           const alreadyNotified = sessionStorage.getItem("hasSeenNotification");
           if (!alreadyNotified) {
             setNotificationMessage(
               noSteps 
                 ? "You haven't logged any progress today! Time to get moving!" 
                 : "Your daily progress is running very low! Keep pushing to reach your health goals!"
             );
             setShowNotification(true);
             sessionStorage.setItem("hasSeenNotification", "true");
             
             // Play Sound Loud and Pop
             const audio = new Audio('/notification.mp3');
             audio.volume = 1.0; 
             audio.play().catch(e => console.log('Autoplay blocked. User interaction required.', e));
           }
        }
      } catch (err) {
         console.error("Error checking notification:", err);
      }
    };

    // Small delay so the page loads and catches attention nicely
    const timer = setTimeout(checkProgressAndNotify, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  const fetchAITip = async (force = false) => {
    const TWO_HOURS = 2 * 60 * 60 * 1000
    const savedRaw = localStorage.getItem("aiHealthTip")
    const savedTime = localStorage.getItem("aiHealthTipTime")
    const now = Date.now()

    if (!force && savedRaw && savedTime && now - Number(savedTime) < TWO_HOURS) {
      try { setDailyTip(JSON.parse(savedRaw)); return } catch {}
    }

    setTipLoading(true)
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY })
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a single, creative, expert-level daily health tip. Return ONLY a JSON object with these fields:
- "tip": a compelling, actionable health advice sentence (max 2 sentences)
- "category": one of ["Nutrition", "Fitness", "Sleep", "Hydration", "Mental Health", "Recovery"]
- "emoji": a single relevant emoji
Return only valid JSON, no markdown.`,
        config: { responseMimeType: "application/json", temperature: 1.2 }
      })
      const parsed = JSON.parse(response.text)
      setDailyTip(parsed)
      localStorage.setItem("aiHealthTip", JSON.stringify(parsed))
      localStorage.setItem("aiHealthTipTime", now.toString())
    } catch (err) {
      console.error("AI tip error:", err)
      setDailyTip({ tip: "Stay hydrated — aim for at least 8 glasses of water today to boost energy and focus.", category: "Hydration", emoji: "💧" })
    } finally {
      setTipLoading(false)
    }
  }

  useEffect(() => {
    fetchAITip()
    const interval = setInterval(() => fetchAITip(true), 2 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const calculateBMI = () => {
    const h = Number(height)
    const w = Number(weight)

    if (!h || !w) {
      alert("Please enter valid height and weight.");
      return
    }
    if(h<=0 || w<=0){
      alert("Height or weight cannot be negative.");
      return;
    }

    const heightInMeters = h / 100
    const bmi = w / (heightInMeters * heightInMeters)

    let category = ""
    let advice = ""

    if (bmi < 18.5) {
      category = "Underweight"
      advice = "Consider a balanced diet to gain healthy weight."
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Normal"
      advice = "Maintain your current lifestyle to stay healthy."
    } else {
      category = "Overweight"
      advice = "Incorporate regular exercise and monitor your diet."
    }

    setBmiResult({ bmi: bmi.toFixed(1), category, advice })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-slate-50/60 dark:bg-slate-950/80 border-b border-gray-200 dark:border-emerald-500/20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                <img src="/logo.jpeg" alt="WellNest Logo" className="w-14 h-14 object-cover rounded-full" />
                WellNest
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className={`text-gray-600 dark:text-gray-300 font-medium ${hasProfile ? "hover:text-blue-400 transition-colors" : "opacity-50 cursor-not-allowed"}`}>
                Dashboard
              </Link>
              <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                Nutrition
              </Link>
              <Link to="/trainers" className="text-gray-600 dark:text-gray-300 hover:text-orange-400 transition-colors font-medium">
                Trainers
              </Link>
              <Link to="/diet-plan" className="text-gray-600 dark:text-gray-300 hover:text-amber-400 transition-colors font-medium">
                Diet Plan
              </Link>
              <Link to="/reminders" className="text-gray-600 dark:text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Reminders
              </Link>
              <button
                onClick={() => {setIsBMIModalOpen(true);document.body.style.overflow = "hidden"}}
                className="text-gray-600 dark:text-gray-300 hover:text-teal-400 transition-colors font-medium"
              >
                BMI Calculator
              </button>


              {/* Bell Notification */}
              <div className="relative" ref={bellRef}>
                <button
                  id="trainer-bell-btn"
                  onClick={() => setIsBellOpen(prev => !prev)}
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-400 transition-colors"
                  title="Trainer Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {trainerTasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {trainerTasks.length > 9 ? "9+" : trainerTasks.length}
                    </span>
                  )}
                </button>

                {/* Bell Dropdown */}
                {isBellOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 z-[200] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-emerald-500/15 bg-gray-50 dark:bg-slate-950/60">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Trainer Notifications</span>
                      </div>
                      {trainerTasks.length > 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                          {trainerTasks.length} task{trainerTasks.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Task List */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800/50">
                      {trainerTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                          <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
                          <p className="text-gray-600 dark:text-gray-500 text-sm">No tasks from trainers</p>
                          <p className="text-gray-500 dark:text-gray-600 text-xs mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        trainerTasks.map((task, i) => (
                          <div key={task.id || i} className="px-5 py-4 hover:bg-emerald-500/5 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1 truncate">
                                  <Dumbbell className="w-3 h-3" /> {task.trainerName || task.trainerEmail}
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{task.taskText}</p>
                              </div>
                            </div>
                            <Link
                              to={`/client/chat/${task.trainerEmail}`}
                              onClick={() => setIsBellOpen(false)}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Open Chat →
                            </Link>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {trainerTasks.length > 0 && (
                      <div className="px-5 py-3 border-t border-gray-200 dark:border-emerald-500/15 bg-gray-50 dark:bg-slate-950/40">
                        <Link
                          to="/trainerTalk"
                          onClick={() => setIsBellOpen(false)}
                          className="block text-center text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                          View all in Trainer Talk →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <SignOutButton>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:text-black rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all font-semibold shadow-lg shadow-emerald-500/20">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsNavOpen(!isNavOpen)} className="text-emerald-500 hover:text-emerald-400">
                {isNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isNavOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-emerald-500/20 pt-4">
              <Link to="/profile" className="w-full text-gray-600 dark:text-gray-300 hover:text-emerald-400 block text-center py-2">
                Profile
              </Link>
              <button
                onClick={() => {setIsBMIModalOpen(true);document.body.style.overflow = "hidden"}}
                className="w-full text-gray-600 dark:text-gray-300 hover:text-teal-400 block text-center py-2"
              >
                BMI Calculator
              </button>
              <Link to="/tracker" className="w-full text-gray-600 dark:text-gray-300 hover:text-blue-400 block text-center py-2">
                Tracker
              </Link>
              <SignOutButton>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:text-black rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all font-semibold">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </nav>

      {/* BMI Modal */}
      {isBMIModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-x-hidden">
          <div className="bg-white dark:bg-slate-950 border-2 border-teal-500 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-teal-500/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center text-teal-500">Calculate Your BMI</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-teal-500/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-teal-500/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={calculateBMI}
                className="w-full py-3 bg-teal-500 text-white dark:text-black rounded-lg hover:bg-teal-400 transition-all font-bold text-lg shadow-lg shadow-teal-500/30"
              >
                Calculate BMI
              </button>

              {bmiResult.bmi > 0 && (
                <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg space-y-2">
                  <p className="text-xl font-bold text-teal-500">BMI: {bmiResult.bmi}</p>
                  <p className="text-lg">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="text-gray-900 dark:text-white font-semibold ml-2">{bmiResult.category}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{bmiResult.advice}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setIsBMIModalOpen(false)
                  setHeight("")
                  setWeight("")
                  setBmiResult({ bmi: 0, category: "", advice: "" })
                  document.body.style.overflow = "auto";
                }}
                className="w-full py-3 bg-white dark:bg-slate-950 border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-500/10 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal / Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-black border-2 border-red-500 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-red-500/50 transform transition-all animate-[pulse_2s_infinite]">
            <div className="flex items-center justify-center mb-6">
               <div className="p-4 bg-red-500/20 rounded-full">
                 <Activity className="w-12 h-12 text-red-500" />
               </div>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-center text-red-500">Wake Up!</h2>
            <p className="text-gray-900 dark:text-white text-lg font-medium text-center leading-relaxed mb-8">
              {notificationMessage}
            </p>
            <div className="flex gap-4">
              <button onClick={() => {setShowNotification(false); navigate("/tracker")}} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30 text-lg">
                Log Activity
              </button>
              <button onClick={() => setShowNotification(false)} className="py-3 px-6 bg-transparent border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-500/10 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-16 space-y-6 relative"
        >
          {/* ECG Heartbeat Background */}
          <ECGPulse />
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent relative z-10">Welcome to WellNest</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed relative z-10">
            Your personalized wellness companion for fitness, nutrition, and lifestyle improvement. Build your profile
            to unlock your full dashboard experience.
          </p>
          <div className="flex gap-4 justify-center pt-4 relative z-10">
            <Link to="/profile">
              <button className="glow-pulse px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-400 hover:to-amber-400 transition-all font-bold shadow-lg shadow-orange-500/30">
                Build Profile
              </button>
            </Link>
              <button className={`px-8 py-3 rounded-lg font-bold transition-all ${hasProfile?"bg-white dark:bg-slate-950 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer":"bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"}`} disabled={!hasProfile}onClick={() => {if (hasProfile) {navigate("/tracker");}}}>Start Tracking</button>
          </div>
        </motion.section>

        {/* AI Daily Health Tip */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 mb-16"
        >
          <div className="relative max-w-3xl mx-auto">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-cyan-500/30 rounded-3xl blur-xl" />

            <div className="relative bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-gray-200 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />

              {/* Decorative corner circles */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />

              <div className="relative p-7">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Daily Health Tip</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dailyTip && !tipLoading && (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                        <span className="text-base">{dailyTip.emoji}</span>
                        {dailyTip.category}
                      </span>
                    )}
                    <button
                      onClick={() => fetchAITip(true)}
                      disabled={tipLoading}
                      title="Refresh tip"
                      className="p-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-xl text-gray-400 hover:text-emerald-400 transition-all disabled:opacity-40"
                    >
                      <RefreshCw className={`w-4 h-4 ${tipLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Tip content */}
                {tipLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-white/10 rounded-full w-full" />
                    <div className="h-4 bg-white/10 rounded-full w-4/5" />
                    <div className="h-4 bg-white/10 rounded-full w-3/5" />
                  </div>
                ) : dailyTip ? (
                  <p className="text-gray-200 text-lg leading-relaxed font-medium">
                    {dailyTip.tip}
                  </p>
                ) : null}

                {/* Footer */}
                <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
                  <Zap className="w-3 h-3" />
                  <span>Refreshes every 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>


        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-10 mt-16"
        >
          {/* Health Blog */}
          <div className="hover-lift bg-slate-950 border-2 border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400">Health Blog</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Read health, nutrition, and fitness articles written by trainers and community members. Each post includes
              the author's name, detailed insights, and community interaction.
            </p>
            <p className="text-gray-400 text-sm">
              Like and comment on posts to ask questions, share opinions, and stay engaged.
            </p>
          </div>

          {/* Community Posts */}
          <div className="hover-lift bg-slate-950 border-2 border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/50 transition-all group shadow-lg shadow-pink-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-pink-400">Community Posts</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Connect with other WellNest users by sharing your fitness journey, progress pictures, challenges, or
              achievements.
            </p>
            <p className="text-gray-400 text-sm">Support each other through likes, comments, and sharing posts.</p>
          </div>

          {/* Trainer Matching */}
          <div className="hover-lift bg-slate-950 border-2 border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/50 transition-all group shadow-lg shadow-orange-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-orange-400">Trainer Matching</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Find and connect with certified trainers based on your fitness goals. Trainers list their expertise,
              availability, and contact information.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Specialization (Yoga, Strength, Weight Loss, Nutrition)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Available time slots
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Experience and certifications
              </li>
            </ul>
          </div>

          {/* Analytics Dashboard */}
          <div className="hover-lift bg-slate-950 border-2 border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all group shadow-lg shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-blue-400">Analytics Dashboard</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Access a full analytics dashboard that visualizes your wellness data to help you understand your habits
              and progress.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Workout Frequency & Duration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Calories Consumed vs Burned
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Water Intake & Sleep Patterns
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Trackers Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Your Wellness Trackers</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Workout Tracker */}
            <div className="bg-slate-950 border-2 border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                  <Activity className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-emerald-400">Workout Tracker</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Record your everyday workouts including:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Exercise type
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Duration spent
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Calories burned
                </li>
              </ul>
            </div>

            {/* Meal Tracker */}
            <div className="bg-slate-950 border-2 border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-amber-500/10 rounded-2xl">
                  <Utensils className="w-10 h-10 text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-amber-400">Meal Tracker</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Track your daily meals by logging:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Meal type
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Calories consumed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Nutritional info
                </li>
              </ul>
            </div>

            {/* Water & Sleep Tracker */}
            <div className="bg-slate-950 border-2 border-blue-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl">
                  <div className="flex gap-2">
                    <Droplet className="w-10 h-10 text-blue-500" />
                    <Moon className="w-10 h-10 text-purple-500" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Water & Sleep</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Maintain balance by recording:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Daily water intake
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Sleep duration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Sleep quality
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex justify-center text-emerald-500/70">
        <p className="mb-4">&copy; {new Date().getFullYear()} WellNest. All rights reserved | <Link to='#'>Privacy Policy</Link></p>
      </footer>
    </div>
  )
}