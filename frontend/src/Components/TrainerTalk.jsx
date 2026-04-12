"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
export default function TrainerTasks() {
  const { user, isLoaded } = useUser()
  const [tasks, setTasks] = useState([])

  const clientEmail = user?.primaryEmailAddress?.emailAddress
  useEffect(() => {
    if (!isLoaded || !clientEmail) return

    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tasks/${clientEmail}`)
        if (!res.ok) throw new Error("Failed to fetch tasks")
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTasks()
  }, [isLoaded, clientEmail])

  if (!isLoaded) return <div>Loading...</div>

  return (
    <main className="flex flex-col min-h-screen bg-black text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-orange-500 mb-6">Your Tasks</h1>

      {Array.isArray(tasks) && tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li
              key={task.id || Math.random()}
              className="bg-gray-900 p-4 rounded border border-emerald-700 space-y-3"
            >
              <p>
                <strong>Trainer:</strong>{" "}
                {task.trainerName || task.trainerEmail || "Unknown"}
              </p>
              <p>
                <strong>Task:</strong> {task.taskText || "No description"}
              </p>
              {task.trainerEmail && (
                <Link to={`/client/chat/${task.trainerEmail}`} className="inline-block mt-2 bg-orange-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                  Open Chat
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tasks currently assigned.</p>
      )}
    </main>
  )
}