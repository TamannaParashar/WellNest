import { useEffect, useState } from "react"
import { SignOutButton, useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import {Menu,X,Activity,Users,ClipboardList,Calendar,MessageCircle,FileText,User} from "lucide-react"

export default function TrainerHome() {
  const { user,isLoaded } = useUser();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [trainerProfile,setTrainerProfile] = useState(null);
  const [trainersName,setTrainerName] = useState("")
  const [trainerProfileModule,setTrainerProfileModule] = useState(false);
  useEffect(()=>{
    if(!user || !isLoaded){
      return;
    }
    const email = user.primaryEmailAddress.emailAddress
    const fetchProfile=async()=>{
      const data = await fetch(`http://localhost:8080/api/trainer-clients/trainer/${email}`)
      const res = await data.json();
      setTrainerProfile(res[0]);
      setTrainerName(res[0].trainerName);
    }
    fetchProfile();
  },[user,isLoaded]);
  const getProfile=async()=>{
    document.body.style.overflow = "hidden"
    setTrainerProfileModule(true);
  }
  const closeProfileModal = () => {
    setTrainerProfileModule(false);
    document.body.style.overflow = "auto"
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-slate-950 border-b border-orange-500/20 fixed top-0 left-0 w-full z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
            <img src="/logo.jpeg" alt="WellNest Logo" className="w-14 h-14 object-cover rounded-full" />
            WellNest Trainer
          </h1>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/trainerDashboard" className="nav-link">Dashboard</Link>
            <button onClick={getProfile} className="nav-link">My Profile</button>
            <Link to="/blog" className="nav-link">Blogs</Link>
            <SignOutButton>
              <button className="px-4 py-2 bg-orange-500 text-black rounded-lg font-semibold">
                Sign Out
              </button>
            </SignOutButton>
          </div>

          <button
            className="md:hidden text-orange-500"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isNavOpen && (
          <div className="md:hidden border-t border-orange-500/20 p-4 space-y-3">
            <Link className="block text-center nav-link" to="trainerDashboard">Dashboard</Link>
            <Link className="block text-center nav-link" to="blogs">Blogs</Link>
            <SignOutButton>
              <button className="w-full bg-orange-500 text-black py-2 rounded-lg font-semibold">
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
          <h1 className="text-5xl font-bold text-orange-400">
            Welcome {trainersName}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
  <div className="relative bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 border border-orange-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-orange-500/10 max-h-[90vh] overflow-y-auto">

    {/* Close Button (top right) */}
    <button
      onClick={closeProfileModal}
      className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 text-xl"
    >
      ✕
    </button>

    {/* Profile Header */}
    <div className="flex flex-col items-center mb-6">
      <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-black text-3xl font-bold shadow-lg">
        {trainerProfile.trainerName?.[0]?.toUpperCase()}
      </div>
      <h2 className="text-2xl font-bold mt-3 text-orange-400">
        {trainerProfile.trainerName}
      </h2>
      <p className="text-gray-400 text-sm">
        {trainerProfile.trainerEmail}
      </p>
    </div>

    {/* Profile Details */}
    <div className="space-y-4">

      <ProfileItem label="Phone" value={trainerProfile.trainerPhone} />
      <ProfileItem label="Title" value={trainerProfile.trainerTitle} />
      <ProfileItem label="Expertise" value={trainerProfile.trainerExpertise} />
      <ProfileItem label="Certification" value={trainerProfile.trainerCertification} />

      <div className="bg-black/50 border border-orange-500/15 rounded-xl p-4">
        <p className="text-orange-400 font-semibold mb-1">Bio</p>
        <p className="text-gray-300 text-sm leading-relaxed">
          {trainerProfile.trainerBio}
        </p>
      </div>
    </div>

    {/* Close Button Bottom */}
    <button
      onClick={closeProfileModal}
      className="w-full mt-6 py-3 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition-all font-bold"
    >
      Close
    </button>
  </div>
</div>
      )}

      <footer className="text-center text-orange-400/60 pb-4">
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
      className="cursor-pointer bg-slate-950 border-2 border-orange-500/20 rounded-2xl p-6 hover:border-orange-500 transition-all"
    >
      <div className="flex items-center gap-3 mb-4 text-orange-400">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-300 text-sm">{desc}</p>
    </div>
  )
}
function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-black/50 border border-orange-500/15 rounded-xl px-4 py-3">
      <span className="text-orange-400 font-medium">{label}</span>
      <span className="text-gray-300 text-sm text-right max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}