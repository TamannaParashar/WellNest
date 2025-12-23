"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { trainersData } from "../../trainers-data"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

export default function Trainers() {
  const [selectedTrainer, setSelectedTrainer] = useState(trainersData[0])
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isLoaded } = useUser()

  // Filter trainers based on search query matching expertise keywords
  const filteredTrainers = useMemo(() => {
    if (!searchQuery.trim()) return trainersData

    const query = searchQuery.toLowerCase()
    return trainersData.filter(
      (trainer) =>
        trainer.expertise.some((exp) => exp.toLowerCase().includes(query)) ||
        trainer.name.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const handleRegister = async () => {
  if (!isLoaded || !user) {
    alert("Please sign in first")
    return
  }

  try {
    const email = user.primaryEmailAddress.emailAddress

    // Save mapping only
    const res = await fetch("http://localhost:8080/api/trainer-clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
        trainerEmail: selectedTrainer.email,
        trainerPhone: selectedTrainer.phone || "",
        trainerTitle: selectedTrainer.title || "",
        trainerBio: selectedTrainer.bio || "",
        trainerExpertise: selectedTrainer.expertise?.join(",") || "",
        trainerCertification: selectedTrainer.certifications?.join(",") || "",
        clientEmail: email,
      }),
    })

    if (!res.ok) throw new Error("Already registered or error")

    alert("Registered successfully!")
  } catch (err) {
    console.error(err)
    alert("Registration failed")
  }
}

  // Update selected trainer if current selection is filtered out
  useMemo(() => {
    if (!filteredTrainers.find((t) => t.id === selectedTrainer.id)) {
      setSelectedTrainer(filteredTrainers[0] || trainersData[0])
    }
  }, [filteredTrainers, selectedTrainer])

  return (
    <div className="relative h-screen bg-black text-gray-100">
    <Link
      to="/trainerTalk"
      className="absolute top-4 right-6 z-50 bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
    >
      Trainer Talk
    </Link>
  <main className="flex h-full">
      {/* Left Sidebar - Trainers List */}
      <div className="w-72 border-r border-green-900 bg-black overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-green-900 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-green-500">Our Trainers</h1>
            <p className="text-sm text-gray-400 mt-1">Select a trainer to view details</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-green-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Trainers List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                onClick={() => setSelectedTrainer(trainer)}
                className={`p-4 border-b border-green-900 cursor-pointer transition-all ${
                  selectedTrainer.id === trainer.id
                    ? "bg-green-900 bg-opacity-30 border-l-4 border-l-green-500"
                    : "hover:bg-gray-900"
                }`}
              >
                <img
                  src={trainer.image || "/placeholder.svg"}
                  alt={trainer.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-green-400 text-sm">{trainer.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{trainer.expertise.join(", ")}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">No trainers found</div>
          )}
        </div>
      </div>

      {/* Right Content - Trainer Details */}
      <div className="flex-1 overflow-y-auto bg-gray-950 p-8">
        {selectedTrainer && (
          <div className="max-w-2xl">
            {/* Trainer Hero Image */}
            <div className="relative mb-8 rounded-xl overflow-hidden h-80">
              <img
                src={selectedTrainer.image || "/placeholder.svg"}
                alt={selectedTrainer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-4xl font-bold text-green-400">{selectedTrainer.name}</h1>
                <p className="text-gray-300 mt-2">{selectedTrainer.title}</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-300 mb-6 leading-relaxed">{selectedTrainer.bio}</p>

            {/* Expertise Badges */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-green-500 mb-3">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {selectedTrainer.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-3 py-1 bg-green-900 bg-opacity-50 border border-green-500 text-green-300 rounded-full text-sm font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-green-500 mb-3">Availability</h2>
              <div className="bg-gray-900 p-4 rounded-lg border border-green-900">
                <p className="text-gray-300">{selectedTrainer.availability}</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-green-500 mb-3">Certifications</h2>
              <ul className="space-y-2">
                {selectedTrainer.certifications.map((cert) => (
                  <li key={cert} className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-green-900 bg-opacity-20 border border-green-700 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-green-500 mb-4">Get in Touch</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <a
                    href={`mailto:${selectedTrainer.email}`}
                    className="text-green-400 hover:text-green-300 transition"
                  >
                    {selectedTrainer.email}
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Phone</p>
                  <a href={`tel:${selectedTrainer.phone}`} className="text-green-400 hover:text-green-300 transition">
                    {selectedTrainer.phone}
                  </a>
                </div>
              </div>
            </div>
            <button
      onClick={handleRegister}
      className="mt-6 w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors"
    >
      Register
    </button>
          </div>
        )}
      </div>
    </main>
    </div>
  )
}