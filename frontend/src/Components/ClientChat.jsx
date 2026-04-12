"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@clerk/clerk-react"
import { useParams, Link } from "react-router-dom"

export default function ClientChat() {
  const { user, isLoaded } = useUser()
  const { trainerEmail } = useParams()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [trainerName,setTrainerName] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!isLoaded || !user || !trainerEmail) return

    const clientEmail = user.primaryEmailAddress.emailAddress

    fetch(`http://localhost:8080/api/chat/${trainerEmail}/${clientEmail}`)
      .then(res => res.json())
      .then(setMessages)
      .catch(console.error)
  }, [isLoaded, user, trainerEmail])

  useEffect(()=>{
  const fetchName=async()=>{
      const data = await fetch(`http://localhost:8080/api/trainer-clients/trainer/${trainerEmail}`)
      const res = await data.json();
      setTrainerName(res[0].trainerName);
    }
    fetchName();
  },[user,isLoaded]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  if (!isLoaded) {
    return <div className="text-white p-6">Loading chat...</div>
  }

  if (!user) {
    return <div className="text-white p-6">Please login</div>
  }

  const clientEmail = user.primaryEmailAddress.emailAddress

  const sendMessage = async () => {
    if (!text.trim()) return

    await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainerEmail,
        clientEmail,
        sender: "CLIENT",
        message: text
      })
    })

    setMessages(prev => [
      ...prev,
      { sender: "CLIENT", message: text }
    ])

    setText("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl shadow-emerald-500/5 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-b border-emerald-500/20">
          <div className="flex items-center gap-4">
            <Link
              to="/trainers"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/40 text-gray-400 hover:text-emerald-400 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                {(trainerEmail?.charAt(0) || "T").toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-100">
                  {trainerName}
                </h1>
              </div>
            </div>
          </div>

          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-400 font-medium">Online</span>
          </span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-600 text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "CLIENT" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    m.sender === "CLIENT"
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-gray-900 rounded-br-md shadow-lg shadow-emerald-500/20"
                      : "bg-gray-800/80 text-gray-100 rounded-bl-md border border-gray-700/50"
                  }`}
                >
                  <p className="text-sm break-words">{m.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-gray-950/60 border-t border-gray-800">
          <div className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-2xl text-gray-100 resize-none focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-black font-bold disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
