import {useState,useEffect} from "react"
import {SignOutButton, useUser} from "@clerk/clerk-react"
import {Link,useNavigate} from "react-router-dom"
import {Menu, X, Activity, Heart, Target, Droplet, Moon, Utensils, TrendingUp} from "lucide-react"


export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false)
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmiResult, setBmiResult] = useState({ bmi: 0, category: "", advice: "" })
  const [hasProfile, setHasProfile] = useState(false)
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
                Blogs
              </Link>
              <Link to="/community-post" className="text-gray-300 hover:text-green-500 transition-colors font-medium">
                Comminuty Posts
              </Link>
              <Link to="/trainer" className="text-gray-300 hover:text-green-500 transition-colors font-medium">
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

        {/* Goal Progress Section */}
        <div className="mt-8 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-green-500">Goal Progress Tracking</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4 text-lg">
            Set fitness goals such as weight loss, muscle gain, calorie limits, hydration, or workout targets — and
            track how close you are to achieving them.
          </p>
          <p className="text-gray-400">
            The system compares your <span className="text-green-500 font-semibold">current logged data</span> with your
            <span className="text-green-500 font-semibold"> fitness goals</span> and shows progress, trends, and
            remaining targets.
          </p>
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
