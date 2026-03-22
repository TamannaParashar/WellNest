"use client"
import { useUser } from "@clerk/clerk-react"
import { useState, useEffect } from "react"
import { Upload, Menu, X, Heart, MessageCircle, Share2,Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

// TIME AGO FUNCTION
function timeAgo(timestamp) {
  const now = Date.now()
  const diff = (now - timestamp) / 1000

  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Community() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState({})
  const [commentStates, setCommentStates] = useState({})

  const { isLoaded, user } = useUser()
  const navigate = useNavigate()

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/posts")
        const data = await res.json()
        setPosts(data)

        // Track comments correctly so they don’t reset
        const newStates = {}
        data.forEach((post) => {
          newStates[post.id] = {
            isOpen: false,
            newComment: "",
            comments: post.comments || [],
          }
        })
        setCommentStates(newStates)

        // Track liked posts
        if (user) {
          const likedState = {}
          data.forEach((post) => {
            likedState[post.id] = post.likedBy?.includes(user.id)
          })
          setLikedPosts(likedState)
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      }
    }
    fetchPosts()
  }, [user])

  // SUBMIT POST
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded || !user) {
      alert("Please sign in to post")
      return
    }
    if (!postContent.trim()) return

    try {
      const res = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.firstName || user.username || user.primaryEmailAddress.emailAddress.split("@")[0],
          content: postContent,
        }),
      })
      const result = await res.json()

      setPosts((prev) => [result, ...prev])

      setCommentStates((prev) => ({
        ...prev,
        [result.id]: { isOpen: false, newComment: "", comments: [] },
      }))

      setPostContent("")
      setIsModalOpen(false)
    } catch (err) {
      console.error("Failed to post:", err)
    }
  }

  const handleDelete = async (postId) => {
  if (!window.confirm("Are you sure you want to delete this post?")) return

  try {
    await fetch(`http://localhost:8080/api/posts/${postId}`, {
      method: "DELETE",
    })

    setPosts((prev) => prev.filter((p) => p.id !== postId))
  } catch (err) {
    console.error("Failed to delete blog", err)
  }
}

  // LIKE POST
  const handleLike = async (postId) => {
    if (!isLoaded || !user) {
      alert("Please sign in to like posts")
      return
    }

    try {
      const isLiked = likedPosts[postId]
      const res = await fetch("http://localhost:8080/api/posts/like", {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.id }),
      })
      const result = await res.json()

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }))

      // Update like count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: result.likes } : post
        )
      )
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  // ADD COMMENT
  const handleAddComment = async (postId) => {
    if (!isLoaded || !user) {
      alert("Please sign in to comment")
      return
    }

    const text = commentStates[postId]?.newComment
    if (!text || !text.trim()) return

    try {
      const res = await fetch("http://localhost:8080/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: user.id,
          userName: user.firstName || user.username || user.primaryEmailAddress.emailAddress.split("@")[0],
          text,
        }),
      })

      const updatedComments = await res.json()

      setCommentStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          newComment: "",
          comments: updatedComments,
          isOpen: true,
        },
      }))
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  // OPEN/CLOSE COMMENT SECTION
  const toggleComments = (postId) => {
    setCommentStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isOpen: !prev[postId]?.isOpen,
      },
    }))
  }

  // SHARE
  const handleShare = (postId) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    navigator.clipboard.writeText(post.content)
    alert("Post copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-black">
      {/* NAVBAR */}
      <nav className="bg-black border-b border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-green-500">WellNest</h1>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600"
              >
                <Upload size={20} />
                Start Writing
              </button>
            </div>

            <button
              className="md:hidden text-green-500"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              {isNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b p-6 flex justify-between items-center bg-gray-900">
              <h2 className="text-2xl font-bold text-green-500">Write a Post</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-green-500"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
                rows="6"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> Post
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POSTS SECTION */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900 rounded-lg p-4 space-y-3 shadow-lg">

            {/* NAME + TIME */}
            <p className="text-green-400 font-semibold">{post.userName}</p>
            <p className="text-gray-500 text-xs">{timeAgo(post.createdAt)}</p>

            {/* POST CONTENT */}
            <p className="text-white">{post.content}</p>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 border-t border-gray-700 pt-3">
              
              {/* LIKE */}
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  likedPosts[post.id]
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                }`}
              >
                <Heart size={18} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                <span className="text-sm">{post.likes || 0}</span>
              </button>

              {/* COMMENTS */}
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-green-500 hover:bg-gray-700"
              >
                <MessageCircle size={18} />
                <span className="text-sm">
                  {commentStates[post.id]?.comments?.length || 0}
                </span>
              </button>

              {/* SHARE */}
              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-green-500 hover:bg-gray-700"
              >
                <Share2 size={18} />
              </button>

              {user?.id === post.userId && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* COMMENT SECTION */}
            {commentStates[post.id]?.isOpen && (
              <div className="border-t border-gray-700 pt-3 space-y-3">
                
                {/* EXISTING COMMENTS */}
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {commentStates[post.id]?.comments?.map((cmt, idx) => (
                    <div key={idx} className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-green-500 font-semibold text-sm">{cmt.userName}</p>
                      <p className="text-gray-300 text-sm mt-1">{cmt.text}</p>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentStates[post.id]?.newComment || ""}
                    onChange={(e) =>
                      setCommentStates((prev) => ({
                        ...prev,
                        [post.id]: { ...prev[post.id], newComment: e.target.value },
                      }))
                    }
                    className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="bg-green-500 text-black px-3 py-2 rounded-lg hover:bg-green-600 font-semibold text-sm"
                  >
                    Post
                  </button>
                </div>

              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
