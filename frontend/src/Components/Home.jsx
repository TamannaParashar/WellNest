"use client";

import { useState } from "react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isBMIModalOpen, setIsBMIModalOpen] = useState(false);
  const [bmiResult, setBmiResult] = useState({ bmi: 0, category: "", advice: "" });

  const handleBMIClick = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const email = user.primaryEmailAddress.emailAddress;
      const res = await fetch(`http://localhost:8080/api/users/${email}`);
      const data = await res.json();

      const weight = Number(data.weight);
      const height = Number(data.height);

      if (!weight || !height) {
        alert("Please update your weight and height in your profile first!");
        return;
      }

      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);

      let category = "";
      let advice = "";

      if (bmi < 18.5) {
        category = "Underweight";
        advice = "Consider a balanced diet to gain healthy weight.";
      } else if (bmi >= 18.5 && bmi < 24.9) {
        category = "Normal";
        advice = "Maintain your current lifestyle to stay healthy.";
      } else {
        category = "Overweight";
        advice = "Incorporate regular exercise and monitor your diet.";
      }

      setBmiResult({ bmi: bmi.toFixed(1), category, advice });
      setIsBMIModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch BMI data:", err);
      alert("Failed to fetch BMI data.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-500 text-xl">
        Loading user...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-black border-b border-green-500 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-500">WellNest</h1>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <SignOutButton>
                <button className="text-white hover:text-green-500 transition-colors">Sign Out</button>
              </SignOutButton>
              <button
                onClick={handleBMIClick}
                className="text-white hover:text-green-500 transition-colors"
              >
                BMI
              </button>
              <Link to="/tracker" className="text-white hover:text-green-500 transition-colors">
                Tracker
              </Link>
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
                onClick={handleBMIClick}
                className="w-full text-white hover:text-green-500 block text-center"
              >
                BMI
              </button>
              <Link
                to="/tracker"
                className="w-full text-white hover:text-green-500 block text-center"
              >
                Tracker
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* BMI Modal */}
      {isBMIModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <h2 className="text-2xl font-bold mb-4">Your BMI</h2>
            <p className="text-lg mb-2">BMI: {bmiResult.bmi}</p>
            <p className="font-semibold mb-2">Category: {bmiResult.category}</p>
            <p className="text-gray-700 mb-4">{bmiResult.advice}</p>
            <button
              onClick={() => setIsBMIModalOpen(false)}
              className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pt-20 text-center text-green-500 text-xl">
        Welcome, {user.fullName || "User"}!
      </div>
    </div>
  );
}
