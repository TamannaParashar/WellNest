"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"

export default function TrainerTasks() {
  const { user, isLoaded } = useUser()
  const [tasks, setTasks] = useState([])

  const clientEmail = user?.primaryEmailAddress?.emailAddress

  // Fetch all tasks for this client
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
      <h1 className="text-3xl font-bold text-green-500 mb-6">Your Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li
              key={task.id}
              className="bg-gray-900 p-4 rounded border border-green-700"
            >
              <p><strong>Trainer:</strong> {task.trainerName || task.trainerEmail}</p>
              <p><strong>Task:</strong> {task.taskText}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
