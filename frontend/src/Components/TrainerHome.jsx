import { useState } from "react"
import { SignOutButton, useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import {Menu,X,Activity,Users,ClipboardList,Calendar,MessageCircle,FileText,User} from "lucide-react"

export default function TrainerHome() {
  const { user,isLoaded } = useUser();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [trainerProfile,setTrainerProfile] = useState(null);
  const [trainersName,setTrainerName] = useState("")
  const [trainerProfileModule,setTrainerProfileModule] = useState(false);
  if(!isLoaded) return <div className="text-center mt-20 text-green-500 align-middle text-3xl">Loading...</div>
  const email = user.primaryEmailAddress.emailAddress
  const getProfile=async()=>{
    const data = await fetch(`http://localhost:8080/api/trainer-clients/trainer/${email}`)
    const res = await data.json();
    document.body.style.overflow = "hidden"
    setTrainerProfile(res[0]);
    setTrainerProfileModule(true);
    setTrainerName(res[0].trainerName)
  }
  const closeProfileModal = () => {
    setTrainerProfileModule(false);
    document.body.style.overflow = "auto"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="bg-black border-b border-green-500/30 fixed top-0 left-0 w-full z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-500 flex items-center gap-2">
            <Activity className="w-7 h-7" />
            WellNest Trainer
          </h1>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/trainerDashboard" className="nav-link">Dashboard</Link>
            <button onClick={getProfile} className="nav-link">My Profile</button>
            <Link to="/blog" className="nav-link">Blogs</Link>
            <SignOutButton>
              <button className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold">
                Sign Out
              </button>
            </SignOutButton>
          </div>

          <button
            className="md:hidden text-green-500"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isNavOpen && (
          <div className="md:hidden border-t border-green-500/30 p-4 space-y-3">
            <Link className="block text-center nav-link" to="trainerDashboard">Dashboard</Link>
            <Link className="block text-center nav-link" to="blogs">Blogs</Link>
            <SignOutButton>
              <button className="w-full bg-green-500 text-black py-2 rounded-lg font-semibold">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        )}
      </nav>

      {/* Main */}
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        {/* Hero */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-green-500">
            Welcome {trainerProfile?trainersName:" Trainer"}
          </h1>
          <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
            Manage your clients, assign workouts, publish blogs, schedule sessions,
            and track client progress from one place.
          </p>
        </section>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Clients */}
          <FeatureCard
            icon={<Users />}
            title="My Clients"
            desc="View all clients registered under you and track their progress."
          />

          {/* Assign Tasks */}
          <FeatureCard
            icon={<ClipboardList />}
            title="Assign Tasks"
            desc="Create workout plans, diet tasks, and weekly goals for clients."
          />

          {/* Schedule */}
          <FeatureCard
            icon={<Calendar />}
            title="Schedule Sessions"
            desc="Plan online training sessions and manage availability."
          />

          {/* Chat */}
          <FeatureCard
            icon={<MessageCircle />}
            title="Chat with Clients"
            desc="Communicate directly with your clients in real time."
          />

          {/* Blogs */}
          <FeatureCard
            icon={<FileText />}
            title="Trainer Blogs"
            desc="Post fitness & nutrition blogs or read community articles."
          />

          {/* Profile */}
          <FeatureCard
            icon={<User />}
            title="My Profile"
            desc="View and update your trainer profile and certifications."
          />
        </div>
      </div>

      {trainerProfileModule && trainerProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border-2 border-green-500 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-green-500/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-500">My Profile</h2>
            <div className="space-y-4 text-gray-300">
              <p><strong>Name:</strong> {trainerProfile.trainerName}</p>
              <p><strong>Email:</strong> {trainerProfile.trainerEmail}</p>
              <p><strong>Phone:</strong> {trainerProfile.trainerPhone}</p>
              <p><strong>Title:</strong> {trainerProfile.trainerTitle}</p>
              <p><strong>Bio:</strong> {trainerProfile.trainerBio}</p>
              <p><strong>Expertise:</strong> {trainerProfile.trainerExpertise}</p>
              <p><strong>Certification:</strong> {trainerProfile.trainerCertification}</p>
            </div>
            <button
              onClick={closeProfileModal}
              className="w-full mt-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="text-center text-green-500 pb-4">
        &copy; {new Date().getFullYear()} WellNest. All rights reserved | <Link to='#'>Privacy Policy</Link>
      </footer>
    </div>
  )
}

/* Reusable Feature Card */
function FeatureCard({ icon, title, desc, action }) {
  return (
    <div
      onClick={action}
      className="cursor-pointer bg-black border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-500 transition-all"
    >
      <div className="flex items-center gap-3 mb-4 text-green-500">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-300 text-sm">{desc}</p>
    </div>
  )
}
