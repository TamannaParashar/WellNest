"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import WellNestLoader from "./WellNestLoader"

export default function TrainerDashboard() {
  const { user, isLoaded } = useUser()
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState({})

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchClients = async () => {
      try {
        const trainerEmail = user.primaryEmailAddress.emailAddress
        const res = await fetch(`http://localhost:8080/api/trainer-clients/trainer/${trainerEmail}`)
        if (!res.ok) throw new Error("Failed to fetch clients")
        const data = await res.json()

        const profiles = await Promise.all(
          data.map(async (client) => {
            try {
              const profileRes = await fetch(`http://localhost:8080/api/user-profile/${client.clientEmail}`)
              if (!profileRes.ok) throw new Error("Profile not found")
              const profileData = await profileRes.json()
              return { ...client, profile: profileData }
            } catch {
              return { ...client, profile: null }
            }
          })
        )
        setClients(profiles)
      } catch (err) {
        console.error(err)
        alert("Failed to load clients")
      }
    }

    fetchClients()
  }, [isLoaded, user])

  const scheduleMeeting = () => {
  const meetWindow = window.open("https://meet.google.com/new", "_blank");
  if (meetWindow) {
    alert("A new Google Meet has opened. Copy the link from the address bar to share it with your client.");
  } else {
    alert("Please allow pop-ups to schedule a meeting.");
  }
};


  const handleTaskChange = (clientEmail, value) => {
    setTasks(prev => ({ ...prev, [clientEmail]: value }))
  }

  const sendTask = async (clientEmail) => {
    const taskText = tasks[clientEmail]
    if (!taskText) return alert("Enter task text")
    try {
      await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerEmail: user.primaryEmailAddress.emailAddress,
          clientEmail,
          taskText
        })
      })
      alert("Task sent!")
      setTasks(prev => ({ ...prev, [clientEmail]: "" }))
    } catch (err) {
      console.error(err)
      alert("Failed to send task")
    }
  }

  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <WellNestLoader text="Loading trainer dashboard" />
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            WellNest
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            Your Clients
          </h1>
        </div>
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No clients registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.clientEmail}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/40 rounded-2xl p-6 flex flex-col space-y-5 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
              >
                {/* Client Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                      {(client.profile?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold text-orange-400 group-hover:text-orange-300 transition-colors">
                      {client.profile?.name || "Unknown"}
                    </h2>
                  </div>
                  
                  {client.profile ? (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Age</p>
                        <p className="text-gray-200 font-medium">{client.profile.age || "N/A"}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Height</p>
                        <p className="text-gray-200 font-medium">{client.profile.height || "N/A"} cm</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Weight</p>
                        <p className="text-gray-200 font-medium">{client.profile.weight || "N/A"} kg</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Goals</p>
                        <p className="text-gray-200 font-medium text-sm">{client.profile.fitnessGoals || "N/A"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/30 rounded-lg px-4 py-3 text-center">
                      <p className="text-gray-500 text-sm">Profile not available</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3 pt-2 border-t border-gray-800">
                  {/* Contact */}
                  <a
                    href={`mailto:${client.clientEmail}`}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-gray-900 font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </a>
                  <Link
                    to={`/chat/${client.clientEmail}`}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold py-2.5 rounded-xl transition-all"
                    >💬 Chat</Link>
                  <div className="flex flex-col space-y-2">
                    <textarea
                      className="w-full p-3 rounded-xl bg-gray-800/70 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none transition-all duration-200"
                      rows={3}
                      placeholder="Assign a task..."
                      value={tasks[client.clientEmail] || ""}
                      onChange={(e) => handleTaskChange(client.clientEmail, e.target.value)}
                    />
                    <button
                      className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 font-medium py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => sendTask(client.clientEmail)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Task
                    </button>
                  </div>

                  {/* Schedule Meeting */}
                  <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 font-medium py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={scheduleMeeting}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Meeting
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
