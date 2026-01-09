"use client";

import { SignOutButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goalSteps: "",
    goalCalories: "",
    goalExerciseMinutes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail");

  // Fetch profile data from backend
  useEffect(() => {
    if (!email) {
      alert("User not logged in!");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/user-profile/${email}`);
        const data = await res.json();
        setFormData({
          name: data.name || "",
          age: data.age || "",
          weight: data.weight || "",
          height: data.height || "",
          goalSteps: data.goalSteps ?? "",
          goalCalories: data.goalCalories ?? "",
          goalExerciseMinutes: data.goalExerciseMinutes ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:8080/api/user-profile/${email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
      ...formData,
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
      goalSteps: Number(formData.goalSteps),
      goalCalories: Number(formData.goalCalories),
      goalExerciseMinutes: Number(formData.goalExerciseMinutes),
    }),
      });
      const data = await res.json();
      alert("Profile updated successfully!");
      navigate('/home')
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-green-500 text-xl">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Navbar */}
      <nav className="bg-black border-b border-green-500 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-green-500">WellNest</h1>
        </div>
      </nav>

      {/* Form */}
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-green-500 text-center mb-8">Build Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Weight (kg)"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height (cm)"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />
            <input
              type="number"
              name="goalSteps"
              value={formData.goalSteps}
              onChange={handleChange}
              placeholder="Daily Steps Goal (e.g. 10000)"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />

            <input
              type="number"
              name="goalCalories"
              value={formData.goalCalories}
              onChange={handleChange}
              placeholder="Daily Calories Goal"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />

            <input
              type="number"
              name="goalExerciseMinutes"
              value={formData.goalExerciseMinutes}
              onChange={handleChange}
              placeholder="Daily Exercise Time (minutes)"
              className="w-full px-4 py-2 bg-gray-900 border border-green-500 rounded-lg text-white"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-black font-semibold rounded-lg ${
                isSubmitting ? "bg-green-400" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
