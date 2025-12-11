import { useLocation, useNavigate } from "react-router-dom";

export default function BlogContent() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const blog = state?.blog;

  if (!blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Blog data not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-12 mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-green-500 mb-6"
      >
        ← Back
      </button>
      <h1 className="text-4xl font-bold text-green-500 mb-4">{blog.title}</h1>
      <p className="text-gray-400 mb-8">by {blog.authorName}</p>
      <img
        src={`http://localhost:8080/${blog.thumbnailUrl}`}
        alt={blog.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <p className="text-gray-200 whitespace-pre-line">{blog.content}</p>
    </div>
  );
}
