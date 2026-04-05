import { useState } from "react";
import { GoogleGenAI, Type} from "@google/genai";
import { Sparkles, AlertTriangle, TrendingUp, Activity, CheckCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIHealthInsights({ weekData, userName }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Initialize Gemini Client
      // We assume the key is provided in the root .env file as VITE_GEMINI_KEY
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
      
      // 2. Format Health Data for the AI
      const rawData = weekData.map(d => ({
        date: d.date,
        caloriesBurned: d.caloriesBurned,
        caloriesConsumed: d.caloriesConsumed,
        waterLiters: d.water,
        sleepHours: d.sleep,
        macros: { protein: d.protein, carbs: d.carbs, fats: d.fats },
        steps: d.steps
      }));

      const prompt = `
        You are an expert AI Health Coach.
        Here is the health data for ${userName || "the user"} over the past 7 days:
        ${JSON.stringify(rawData, null, 2)}
        
        Analyze this data. Identify patterns, health trends, and importantly, anomalies (e.g., severe lack of sleep on a day, caloric deficits/surpluses, low water intake, missed workouts).
        Provide actionable recommendations on how the user can improve starting today.
      `;

      // 3. Define the Structured Schema for reliable rendering
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          overall_score: {
             type: Type.INTEGER,
             description: "A calculated health score out of 100 based on the week's performance"
          },
          trend_summary: {
             type: Type.STRING,
             description: "A short motivational paragraph summarizing how the week went"
          },
          anomalies: {
             type: Type.ARRAY,
             description: "A list of anomalies or points of concern found in the data",
             items: { type: Type.STRING }
          },
          recommendations: {
             type: Type.ARRAY,
             description: "A list of specific, highly actionable recommendations",
             items: { type: Type.STRING }
          }
        },
        required: ["overall_score", "trend_summary", "anomalies", "recommendations"]
      };

      // 4. Call the Model
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        }
      });

      const parsedData = JSON.parse(response.text);
      setInsights(parsedData);

    } catch (err) {
      console.error("AI Generation Error:", err);
      setError("Unable to generate insights. Ensure your Gemini API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden mb-12">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                WellNest AI
              </h2>
            </div>
            <p className="text-gray-400 text-lg">
              Transform your raw weekly data into actionable, personalized intelligence.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateInsights}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold flex items-center gap-2 hover:shadow-indigo-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? "Analyzing Data..." : "Generate Insights"}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 mb-6 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {insights && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-[1fr_2fr] gap-8"
            >
              {/* Score Card */}
              <div className="bg-black/40 border border-indigo-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-gray-400 font-semibold mb-4 uppercase tracking-wider text-sm">Weekly Health Score</h3>
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
                    <motion.circle 
                      initial={{ strokeDasharray: "0 400" }}
                      animate={{ strokeDasharray: `\${(insights.overall_score / 100) * 377} 400` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" 
                      className={`\${
                        insights.overall_score >= 80 ? 'text-green-500' : 
                        insights.overall_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute text-3xl font-bold text-white">
                    {insights.overall_score}
                  </div>
                </div>
                <p className="text-gray-300 italic text-sm">"{insights.trend_summary}"</p>
              </div>

              {/* Details Column */}
              <div className="space-y-6">
                {/* Anomalies section */}
                <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 text-purple-400 font-bold mb-4">
                    <AlertTriangle className="w-5 h-5" /> Detected Anomalies
                  </h3>
                  {insights.anomalies.length > 0 ? (
                     <ul className="space-y-3">
                     {insights.anomalies.map((anom, i) => (
                       <motion.li 
                         key={i}
                         initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                         className="flex items-start gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10"
                       >
                         <Activity className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                         <span className="text-gray-300 text-sm leading-relaxed">{anom}</span>
                       </motion.li>
                     ))}
                   </ul>
                  ) : (
                    <p className="text-green-400 text-sm">No major anomalies detected. Great consistency!</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="bg-black/40 border border-indigo-500/20 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                    <TrendingUp className="w-5 h-5" /> Action Plan
                  </h3>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i + 0.3 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
