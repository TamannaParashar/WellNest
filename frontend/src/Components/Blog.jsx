"use client"
import { useUser } from "@clerk/clerk-react"
import { useState, useEffect } from "react"
import { Upload, Menu, X, Heart, MessageCircle,Edit, Trash2, Share2 } from "lucide-react"
import { useNavigate, Link} from "react-router-dom"

export default function Blog() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    blogText: "",
    thumbnail: null,
    authorName: "",
  })
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [filterType, setFilterType] = useState("user")
  const [expandedBlogIds, setExpandedBlogIds] = useState([])
  const [likedBlogs, setLikedBlogs] = useState({})
  const [commentStates, setCommentStates] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState(null)

  const { isLoaded, user } = useUser()
  const navigate = useNavigate()

  const fetchCommentsForBlog = async (blogId) => {
  const res = await fetch(`http://localhost:8080/api/blogs/${blogId}/comments`)
  return await res.json()
  }
  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/blogs")
        const data = await res.json()
        setBlogs(data)
        // Initialize comment states for all blogs
        const newCommentStates = {}
        for (const blog of data){
          const comments = await fetchCommentsForBlog(blog.id)
          newCommentStates[blog.id] = {
            isOpen: false,
            newComment: "",
            comments: comments,
          }
        }
        setBlogs(data);
        setCommentStates(newCommentStates);
        if (user) {
        const likedState = {};
        data.forEach(blog => {
          likedState[blog.id] = blog.likedBy?.includes(user.id);
        });
        setLikedBlogs(likedState);
      }
      } catch (err) {
        console.error("Failed to fetch blogs:", err)
      }
    }
    fetchBlogs()
  }, [])

  const handleShare = async (blogId) => {
  const shareUrl = `${window.location.origin}/blogContent/${blogId}`

  try {
    await navigator.clipboard.writeText(shareUrl)
    alert("Blog link copied to clipboard!")
  } catch {
    alert("Failed to copy link")
  }
}
const handleDelete = async (blogId) => {
  if (!window.confirm("Are you sure you want to delete this blog?")) return

  try {
    await fetch(`http://localhost:8080/api/blogs/${blogId}`, {
      method: "DELETE",
    })

    setBlogs((prev) => prev.filter((b) => b.id !== blogId))
  } catch (err) {
    console.error("Failed to delete blog", err)
  }
}
const handleEdit = (blog) => {
  setIsEditing(true)
  setEditingBlogId(blog.id)

  setFormData({
    title: blog.title,
    blogText: blog.content,
    authorName: blog.authorName,
    thumbnail: null,
  })

  setThumbnailPreview(`http://localhost:8080/${blog.thumbnailUrl}`)
  setIsModalOpen(true)
}

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const openBlogPage = (blog) => {
    navigate("/blogContent", { state: { blog } })
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!isLoaded || !user) return

  const data = new FormData()
  data.append("authorId", user.id)
  data.append("authorName", formData.authorName)
  data.append("title", formData.title)
  data.append("content", formData.blogText)
  data.append("userType", "user")

  if (formData.thumbnail) {
    data.append("thumbnail", formData.thumbnail)
  }

  const url = isEditing
    ? `http://localhost:8080/api/blogs/${editingBlogId}`
    : "http://localhost:8080/api/blogs"

  const method = isEditing ? "PUT" : "POST"

  const res = await fetch(url, {
    method,
    body: data,
  })

  const result = await res.json()

  setBlogs((prev) =>
    isEditing
      ? prev.map((b) => (b.id === result.id ? result : b))
      : [result, ...prev]
  )

  setIsModalOpen(false)
  setIsEditing(false)
  setEditingBlogId(null)
  setFormData({ title: "", blogText: "", thumbnail: null, authorName: "" })
  setThumbnailPreview(null)
}


  const handleLike = async (blogId) => {
  if (!isLoaded || !user) {
    alert("Please sign in to like blogs");
    return;
  }

  try {
    const isLiked = likedBlogs[blogId];
    const res = await fetch("http://localhost:8080/api/blogs/like", {
      method: isLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, userId: user.id }),
    });

    const result = await res.json();

    setLikedBlogs((prev) => ({
      ...prev,
      [blogId]: !isLiked
    }));


    // Update blog's like count from backend
    setBlogs((prev) =>
      prev.map((blog) => (blog.id === blogId ? { ...blog, likes: result.likes } : blog))
    );
  } catch (err) {
    console.error("Failed to like blog:", err);
  }
};


const handleAddComment = async (blogId) => {
  if (!isLoaded || !user) {
    alert("Please sign in to comment");
    return;
  }

  const commentText = commentStates[blogId]?.newComment;
  if (!commentText || !commentText.trim()) {
    alert("Please enter a comment");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/blogs/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blogId,
        userId: user.id,
        userName: user.firstName || user.primaryEmailAddress.emailAddress.split("@")[0],
        text: commentText,
      }),
    });

    const result = await res.json(); // result = array of comments

    setCommentStates((prev) => ({
      ...prev,
      [blogId]: {
        ...prev[blogId],
        newComment: "",
        comments: result, // update full list from backend
        isOpen: true, // auto-open comments after posting
      },
    }));
  } catch (err) {
    console.error("Failed to add comment:", err);
  }
};


  const toggleComments = (blogId) => {
    setCommentStates((prev) => ({
      ...prev,
      [blogId]: {
        ...prev[blogId],
        isOpen: !prev[blogId]?.isOpen,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-black border-b border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-500">WellNest</h1>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/community-post" className="text-white hover:text-green-500 transition-colors">Community Post</Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
              >
                <Upload size={20} />
                Start Writing
              </button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsNavOpen(!isNavOpen)} className="text-green-500 hover:text-green-600">
                {isNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isNavOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <button
                onClick={() => {
                  setIsModalOpen(true)
                  setIsNavOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <Upload size={20} />
                {isEditing ? "Update Blog" : "Upload Blog"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Modal for uploading blog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-green-500 p-6 flex justify-between items-center sticky top-0 bg-gray-900">
              <h2 className="text-2xl font-bold text-green-500">{isEditing ? "Edit Blog" : "Upload Blog"}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-green-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Blog Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your blog title"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Author Name *</label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your name"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Blog Content *</label>
                <textarea
                  name="blogText"
                  value={formData.blogText}
                  onChange={handleInputChange}
                  required
                  placeholder="Write your blog content here..."
                  rows="6"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Upload Thumbnail Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 file:bg-green-500 file:text-black file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer file:font-semibold hover:file:bg-green-600 transition-colors"
                />
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg border border-green-500"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> {isEditing ? "Update Blog" : "Upload Blog"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-white mb-4">Articles</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setFilterType("user")}
              className={`px-4 py-2 rounded-lg font-semibold ${filterType === "user" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}
            >
              User
            </button>
            <button
              onClick={() => setFilterType("trainer")}
              className={`px-4 py-2 rounded-lg font-semibold ${filterType === "trainer" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}
            >
              Trainer
            </button>
          </div>
          <div>

          </div>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs
            .filter((blog) => blog.userType === filterType)
            .map((blog) => (
              <div key={blog.id} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                <img
                  src={`http://localhost:8080/${blog.thumbnailUrl}`}
                  alt={blog.title}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openBlogPage(blog)}
                />
                <div className="p-4">
                  <h3
                    className="text-xl font-bold text-white cursor-pointer hover:text-green-500 transition-colors"
                    onClick={() => openBlogPage(blog)}
                  >
                    {blog.title}
                  </h3>
                  <p className="text-gray-400 mb-4">by {blog.authorName}</p>

                  <div className="flex items-center gap-4 mb-4 border-t border-gray-700 pt-4">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        likedBlogs[blog.id]
                          ? "bg-red-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                      }`}
                    >
                      <Heart size={18} fill={likedBlogs[blog.id] ? "currentColor" : "none"} />
                      <span className="text-sm">{blog.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(blog.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-green-500 hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">{commentStates[blog.id]?.comments?.length || 0}</span>
                    </button>
                    <div className="flex gap-2">
    {/* Share */}
                  <button
                    onClick={() => handleShare(blog.id)}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-green-500 hover:bg-gray-700"
                    title="Share"
                  >
                    <Share2 size={16} />
                  </button>

                  {/* Edit & Delete only for author */}
                  {user && blog.authorId === user.id && (
                    <>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-gray-700"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  </div>
                  </div>

                  {commentStates[blog.id]?.isOpen && (
                    <div className="border-t border-gray-700 pt-4 space-y-3">
                      {/* Display existing comments */}
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {commentStates[blog.id]?.comments?.map((comment, idx) => (
                          <div key={idx} className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-green-500 font-semibold text-sm">{comment.userName}</p>
                            <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add new comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentStates[blog.id]?.newComment || ""}
                          onChange={(e) => {
                            setCommentStates((prev) => ({
                              ...prev,
                              [blog.id]: {
                                ...prev[blog.id],
                                newComment: e.target.value,
                              },
                            }))
                          }}
                          className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(blog.id)}
                          className="bg-green-500 text-black px-3 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  )
}