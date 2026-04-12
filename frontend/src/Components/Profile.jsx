"use client";

import { SignOutButton, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, User, Target, Heart, ChevronRight, ChevronLeft, Check, Loader2, Leaf, Utensils, Trees, Settings, BatteryLow, BatteryMedium, Battery, Monitor, Footprints, Zap, Dumbbell } from "lucide-react";
import WellNestLoader from "./WellNestLoader";

const STEPS = [
  { id: 1, title: "Basic Info",    icon: User,     desc: "Personal details" },
  { id: 2, title: "Body Stats",   icon: Activity,  desc: "Height, weight & gender" },
  { id: 3, title: "Lifestyle",    icon: Heart,     desc: "Diet & activity level" },
  { id: 4, title: "Goals",        icon: Target,    desc: "Your fitness targets" },
];

const INPUT = "w-full px-4 py-3 bg-gray-900/80 border border-emerald-500/30 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all";
const SELECT = INPUT + " cursor-pointer";
const LABEL = "block text-sm font-semibold text-gray-400 mb-1.5";

const optionCard = (value, current, setter, label, Icon) => (
  <button
    type="button"
    key={value}
    onClick={() => setter(value)}
    className={`flex flex-col items-center justify-center min-h-[90px] gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg
      ${current === value
        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20"
        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:border-emerald-500/40 hover:text-emerald-500"
      }`}
  >
    <div className="text-emerald-500 mb-1">
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </div>
    <span>{label}</span>
  </button>
);

export default function Profile() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const email = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("userEmail");

  const [formData, setFormData] = useState({
    name: "", age: "", gender: "",
    weight: "", height: "",
    dietType: "", fitnessLevel: "", activityLevel: "",
    healthConditions: "", allergies: "",
    goalSteps: "", goalCalories: "", goalExerciseMinutes: "",
    waterGoal: "", sleepGoal: "", sleepTime: "", gymSplit: "",
  });

  useEffect(() => {
    if (!email) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("No profile yet");
        const data = await res.json();
        setFormData({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "",
          weight: data.weight || "",
          height: data.height || "",
          dietType: data.dietType || "",
          fitnessLevel: data.fitnessLevel || "",
          activityLevel: data.activityLevel || "",
          healthConditions: data.healthConditions || "",
          allergies: data.allergies || "",
          goalSteps: data.goalSteps ?? "",
          goalCalories: data.goalCalories ?? "",
          goalExerciseMinutes: data.goalExerciseMinutes ?? "",
          waterGoal: data.waterGoal || "",
          sleepGoal: data.sleepGoal || "",
          sleepTime: data.sleepTime || "",
          gymSplit: data.gymSplit || "",
        });
      } catch { /* new user — empty form */ }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [email]);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target?.value ?? e }));
  const setDirect = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`, {
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
          waterGoal: Number(formData.waterGoal),
          sleepGoal: Number(formData.sleepGoal),
        }),
      });
      setSaved(true);
      setTimeout(() => navigate("/home"), 1500);
    } catch { alert("Failed to save profile."); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <WellNestLoader text="Building your profile" />
    </div>
  );

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/90 border-b border-emerald-500/15 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center gap-2 text-emerald-500 font-bold text-xl">
            <img src="/logo.jpeg" alt="WellNest Logo" className="w-14 h-14 object-cover rounded-full" /> WellNest
          </Link>
          <div className="flex items-center gap-3">
            <SignOutButton>
              <button className="px-4 py-1.5 text-sm border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all">Sign Out</button>
            </SignOutButton>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Build Your Profile</h1>
          <p className="text-gray-400">The more you share, the smarter your AI plans become.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800 -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500 -z-10"
            style={{ width: `${progressPct}%` }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                  ${done ? "bg-emerald-500 border-emerald-500" : active ? "bg-black border-emerald-500" : "bg-black border-gray-700"}`}>
                  {done ? <Check className="w-5 h-5 text-black" /> : <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-gray-600"}`} />}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${active ? "text-emerald-400" : done ? "text-emerald-600" : "text-gray-600"}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-gray-950/80 border border-emerald-500/15 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">{STEPS[step - 1].title}</h2>
            <p className="text-gray-500 text-sm mt-1">{STEPS[step - 1].desc}</p>
          </div>

          <form onSubmit={step === STEPS.length ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>

            {/* ── STEP 1: Basic Info ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={LABEL}>Full Name *</label>
                  <input type="text" value={formData.name} onChange={set("name")} placeholder="e.g. Priya Sharma"
                    className={INPUT} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Age *</label>
                    <input type="number" value={formData.age} onChange={set("age")} placeholder="25" min="10" max="100"
                      className={INPUT} required />
                  </div>
                  <div>
                    <label className={LABEL}>Gender *</label>
                    <select value={formData.gender} onChange={set("gender")} className={SELECT} required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Health Conditions</label>
                  <input type="text" value={formData.healthConditions} onChange={set("healthConditions")}
                    placeholder="e.g. diabetes, hypertension, PCOS (or leave blank)" className={INPUT} />
                  <p className="text-xs text-gray-600 mt-1">Separate multiple conditions with commas</p>
                </div>
                <div>
                  <label className={LABEL}>Allergies / Intolerances</label>
                  <input type="text" value={formData.allergies} onChange={set("allergies")}
                    placeholder="e.g. nuts, dairy, gluten (or leave blank)" className={INPUT} />
                </div>
              </div>
            )}

            {/* ── STEP 2: Body Stats ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Weight (kg) *</label>
                    <input type="number" value={formData.weight} onChange={set("weight")} placeholder="65" step="0.1"
                      className={INPUT} required />
                  </div>
                  <div>
                    <label className={LABEL}>Height (cm) *</label>
                    <input type="number" value={formData.height} onChange={set("height")} placeholder="170"
                      className={INPUT} required />
                  </div>
                </div>
                {formData.weight && formData.height && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-sm text-gray-400">Your BMI</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {(formData.weight / ((formData.height / 100) ** 2)).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const bmi = formData.weight / ((formData.height / 100) ** 2);
                        if (bmi < 18.5) return "Underweight — consider a calorie surplus plan";
                        if (bmi < 25) return "Normal — keep maintaining your healthy habits";
                        if (bmi < 30) return "Overweight — a calorie deficit plan may help";
                        return "Obese — consult a doctor and consider a structured plan";
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Lifestyle ── */}
            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <label className={LABEL}>Diet Preference *</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      ["vegetarian",     "Vegetarian",    Leaf],
                      ["non-vegetarian", "Non-Veg",       Utensils],
                      ["vegan",          "Vegan",         Trees],
                      ["eggetarian",     "Eggetarian",    Settings],
                    ].map(([val, lbl, Icon]) => optionCard(val, formData.dietType, (v) => setDirect("dietType", v), lbl, Icon))}
                  </div>
                  {!formData.dietType && <p className="text-red-400 text-xs mt-1">Please select a diet type</p>}
                </div>

                <div>
                  <label className={LABEL}>Fitness Level *</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      ["beginner",     "Beginner",     BatteryLow],
                      ["intermediate", "Intermediate", BatteryMedium],
                      ["advanced",     "Advanced",     Battery],
                    ].map(([val, lbl, Icon]) => optionCard(val, formData.fitnessLevel, (v) => setDirect("fitnessLevel", v), lbl, Icon))}
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Activity Level *</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      ["sedentary",         "Sedentary",         Monitor],
                      ["lightly_active",    "Lightly Active",    Footprints],
                      ["moderately_active", "Moderately Active", Activity],
                      ["very_active",       "Very Active",       Dumbbell],
                    ].map(([val, lbl, Icon]) => optionCard(val, formData.activityLevel, (v) => setDirect("activityLevel", v), lbl, Icon))}
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Gym Split</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      ["PPL",          "Push/Pull/Legs", Activity],
                      ["Bro Split",    "Bro Split",      User],
                      ["Upper/Lower",  "Upper / Lower",  Zap],
                      ["Full Body",    "Full Body",      Target],
                    ].map(([val, lbl, Icon]) => optionCard(val, formData.gymSplit, (v) => setDirect("gymSplit", v), lbl, Icon))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Goals ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Daily Steps Goal *</label>
                    <input type="number" value={formData.goalSteps} onChange={set("goalSteps")} placeholder="10000"
                      className={INPUT} required />
                  </div>
                  <div>
                    <label className={LABEL}>Daily Calories to Burn *</label>
                    <input type="number" value={formData.goalCalories} onChange={set("goalCalories")} placeholder="500"
                      className={INPUT} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Exercise Time (min/day) *</label>
                    <input type="number" value={formData.goalExerciseMinutes} onChange={set("goalExerciseMinutes")} placeholder="45"
                      className={INPUT} required />
                  </div>
                  <div>
                    <label className={LABEL}>Sleep Goal (hrs/night)</label>
                    <input type="number" value={formData.sleepGoal} onChange={set("sleepGoal")} placeholder="7.5" step="0.5" min="4" max="12"
                      className={INPUT} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Water Goal (litres/day)</label>
                    <input type="number" value={formData.waterGoal} onChange={set("waterGoal")} placeholder="2.5" step="0.1" min="1" max="6"
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Sleep Reminder Time</label>
                    <input type="time" value={formData.sleepTime} onChange={set("sleepTime")}
                      className={INPUT} />
                  </div>
                </div>

                {/* Quick presets */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Quick Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Weight Loss", steps: 12000, cal: 600, min: 60 },
                      { label: "Maintenance", steps: 8000,  cal: 300, min: 30 },
                      { label: "Muscle Gain", steps: 6000,  cal: 250, min: 45 },
                    ].map(p => (
                      <button key={p.label} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, goalSteps: p.steps, goalCalories: p.cal, goalExerciseMinutes: p.min }))}
                        className="px-3 py-1.5 text-xs border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all"
                      >{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 gap-4">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:border-emerald-500/40 hover:text-white transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              <button type="submit"
                disabled={isSubmitting || (step === 3 && !formData.dietType)}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all
                  ${saved ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-black"}
                  disabled:opacity-50 disabled:cursor-not-allowed`}>
                {saved ? (
                  <><Check className="w-4 h-4" /> Saved! Redirecting...</>
                ) : isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : step === STEPS.length ? (
                  <>Save Profile <Check className="w-4 h-4" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Diet Plan shortcut (shown after step 3 when dietType is set) */}
        {formData.dietType && (
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-300">Ready for your AI Diet Plan?</p>
              <p className="text-xs text-gray-500 mt-0.5">Get a full personalized meal plan based on your profile</p>
            </div>
            <Link to="/diet-plan"
              className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-sm font-semibold transition-all">
              View Plan →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
