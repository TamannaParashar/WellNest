import {useState,useEffect} from "react"
import {SignOutButton, useUser} from "@clerk/clerk-react"
import {Link,useNavigate} from "react-router-dom"
import {Menu, X, Activity, Heart, Target, Droplet, Moon, Utensils, TrendingUp, Sparkles, Zap, RefreshCw} from "lucide-react"
import { GoogleGenAI } from "@google/genai"

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false)
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmiResult, setBmiResult] = useState({ bmi: 0, category: "", advice: "" })
  const [hasProfile, setHasProfile] = useState(false)
  const [dailyTip, setDailyTip] = useState(null)
  const [tipLoading, setTipLoading] = useState(false)
  
  // Notification State
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

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
           setNotificationMessage(
             noSteps 
               ? "You haven't logged any progress today! Time to get moving!" 
               : "Your daily progress is running very low! Keep pushing to reach your health goals!"
           );
           setShowNotification(true);
           
           // Play Sound Loud and Pop
           const audio = new Audio('/notification.mp3');
           audio.volume = 1.0; 
           audio.play().catch(e => console.log('Autoplay blocked. User interaction required.', e));
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
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="bg-black border-b border-green-500/30 fixed top-0 left-0 w-full z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-500 flex items-center gap-2">
                <Activity className="w-7 h-7" />
                WellNest
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className={`text-gray-300 font-medium ${hasProfile ? "hover:text-green-500 transition-colors" : "opacity-50 cursor-not-allowed"}`}>
                Dashboard
              </Link>
              <Link to="/blog" className="text-gray-300 hover:text-green-500 transition-colors font-medium">
                Nutrition
              </Link>
              <Link to="/trainers" className="text-gray-300 hover:text-green-500 transition-colors font-medium">
                Trainers
              </Link>
              <button
                onClick={() => {setIsBMIModalOpen(true);document.body.style.overflow = "hidden"}}
                className="text-gray-300 hover:text-green-500 transition-colors font-medium"
              >
                BMI Calculator
              </button>
              <SignOutButton>
                <button className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all font-semibold">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsNavOpen(!isNavOpen)} className="text-green-500 hover:text-green-400">
                {isNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isNavOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-green-500/30 pt-4">
              <Link to="/profile" className="w-full text-gray-300 hover:text-green-500 block text-center py-2">
                Profile
              </Link>
              <button
                onClick={() => {setIsBMIModalOpen(true);document.body.style.overflow = "hidden"}}
                className="w-full text-gray-300 hover:text-green-500 block text-center py-2"
              >
                BMI Calculator
              </button>
              <Link to="/tracker" className="w-full text-gray-300 hover:text-green-500 block text-center py-2">
                Tracker
              </Link>
              <SignOutButton>
                <button className="w-full px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all font-semibold">
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
          <div className="bg-black border-2 border-green-500 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-green-500/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center text-green-500">Calculate Your BMI</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-green-500/50 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-green-500/50 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={calculateBMI}
                className="w-full py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all font-bold text-lg shadow-lg shadow-green-500/30"
              >
                Calculate BMI
              </button>

              {bmiResult.bmi > 0 && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
                  <p className="text-xl font-bold text-green-500">BMI: {bmiResult.bmi}</p>
                  <p className="text-lg">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white font-semibold ml-2">{bmiResult.category}</span>
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{bmiResult.advice}</p>
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
                className="w-full py-3 bg-black border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-500/10 transition-all font-semibold"
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
          <div className="bg-black border-2 border-red-500 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-red-500/50 transform transition-all animate-[pulse_2s_infinite]">
            <div className="flex items-center justify-center mb-6">
               <div className="p-4 bg-red-500/20 rounded-full">
                 <Activity className="w-12 h-12 text-red-500" />
               </div>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-center text-red-500">Wake Up!</h2>
            <p className="text-white text-lg font-medium text-center leading-relaxed mb-8">
              {notificationMessage}
            </p>
            <div className="flex gap-4">
              <button onClick={() => {setShowNotification(false); navigate("/tracker")}} className="flex-1 py-3 bg-red-500 text-black font-bold rounded-xl hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30 text-lg">
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
        <section className="text-center py-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-green-500 leading-tight">Welcome to WellNest</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your personalized wellness companion for fitness, nutrition, and lifestyle improvement. Build your profile
            to unlock your full dashboard experience.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/profile">
              <button className="px-8 py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all font-bold shadow-lg shadow-green-500/30">
                Build Profile
              </button>
            </Link>
              <button className={`px-8 py-3 rounded-lg font-bold transition-all ${hasProfile?"bg-black border-2 border-green-500 text-green-500 hover:bg-green-500/10 cursor-pointer":"bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-not-allowed"}`} disabled={!hasProfile}onClick={() => {if (hasProfile) {navigate("/tracker");}}}>Start Tracking</button>
          </div>
        </section>

        {/* AI Daily Health Tip */}
        <section className="mt-12 mb-16">
          <div className="relative max-w-3xl mx-auto">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-400/20 to-teal-500/30 rounded-3xl blur-xl" />

            <div className="relative bg-gradient-to-br from-gray-950 via-black to-gray-900 border border-green-500/30 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

              {/* Decorative corner circles */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />

              <div className="relative p-7">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">Daily Health Tip</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dailyTip && !tipLoading && (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                        <span className="text-base">{dailyTip.emoji}</span>
                        {dailyTip.category}
                      </span>
                    )}
                    <button
                      onClick={() => fetchAITip(true)}
                      disabled={tipLoading}
                      title="Refresh tip"
                      className="p-2 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-xl text-gray-400 hover:text-green-400 transition-all disabled:opacity-40"
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
        </section>


        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-10 mt-16">
          {/* Health Blog */}
          <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-500">Health Blog</h2>
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
          <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-500">Community Posts</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Connect with other WellNest users by sharing your fitness journey, progress pictures, challenges, or
              achievements.
            </p>
            <p className="text-gray-400 text-sm">Support each other through likes, comments, and sharing posts.</p>
          </div>

          {/* Trainer Matching */}
          <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-500">Trainer Matching</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Find and connect with certified trainers based on your fitness goals. Trainers list their expertise,
              availability, and contact information.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Specialization (Yoga, Strength, Weight Loss, Nutrition)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Available time slots
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Experience and certifications
              </li>
            </ul>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-500">Analytics Dashboard</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Access a full analytics dashboard that visualizes your wellness data to help you understand your habits
              and progress.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Workout Frequency & Duration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Calories Consumed vs Burned
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Water Intake & Sleep Patterns
              </li>
            </ul>
          </div>
        </div>

        {/* Trackers Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-green-500 text-center mb-12">Your Wellness Trackers</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Workout Tracker */}
            <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-500/10 rounded-2xl">
                  <Activity className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-green-500">Workout Tracker</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Record your everyday workouts including:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Exercise type
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Duration spent
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Calories burned
                </li>
              </ul>
            </div>

            {/* Meal Tracker */}
            <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-500/10 rounded-2xl">
                  <Utensils className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-green-500">Meal Tracker</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Track your daily meals by logging:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Meal type
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Calories consumed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Nutritional info
                </li>
              </ul>
            </div>

            {/* Water & Sleep Tracker */}
            <div className="bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-500/10 rounded-2xl">
                  <div className="flex gap-2">
                    <Droplet className="w-10 h-10 text-green-500" />
                    <Moon className="w-10 h-10 text-green-500" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4 text-green-500">Water & Sleep</h3>
              <p className="text-gray-300 text-sm mb-4 text-center">Maintain balance by recording:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Daily water intake
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Sleep duration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Sleep quality
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex justify-center text-green-500">
        <p className="mb-4">&copy; {new Date().getFullYear()} WellNest. All rights reserved | <Link to='#'>Privacy Policy</Link></p>
      </footer>
    </div>
  )
}