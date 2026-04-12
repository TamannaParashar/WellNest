import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Moon, Activity, Bell, Save, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reminders() {
  const { user, isSignedIn } = useUser();
  const [profile, setProfile] = useState(null);
  
  const [sleepTime, setSleepTime] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Alert states
  const [showSleepAlert, setShowSleepAlert] = useState(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [sleepHistory, setSleepHistory] = useState([]);

  // Fetch profile when signed in
  useEffect(() => {
    if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) return;
    
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setSleepTime(data.sleepTime || "");
          
          const history = JSON.parse(localStorage.getItem(`sleepHistory_${user.emailAddresses[0].emailAddress}`)) || [];
          setSleepHistory(history.reverse());
        }
      } catch (err) {
        console.error("Error fetching profile for alerts:", err);
      }
    };

    fetchProfile();
  }, [isSignedIn, user]);

  const handleSave = async () => {
    if (!profile) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    const updated = { ...profile, sleepTime: sleepTime };
    try {
      await fetch(`http://localhost:8080/api/user-profile/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setProfile(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) { console.error(e) }
  };

  // ── 1. Sleep Tracker Logic ──
  useEffect(() => {
    if (!profile?.sleepTime) return;

    const checkSleepTime = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const todayString = now.toISOString().slice(0, 10);

      const [sleepHours, sleepMinutes] = profile.sleepTime.split(':').map(Number);
      
      const storageKey = `lastSleepAlertDate_${profile.sleepTime}`;
      const lastAlertedDate = localStorage.getItem(storageKey);

      if (currentHours > sleepHours || (currentHours === sleepHours && currentMinutes >= sleepMinutes)) {
        if (lastAlertedDate !== todayString) {
          setShowSleepAlert(true);
          localStorage.setItem(storageKey, todayString);
          
          const email = user?.primaryEmailAddress?.emailAddress;
          if (email) {
            const histKey = `sleepHistory_${email}`;
            const existing = JSON.parse(localStorage.getItem(histKey)) || [];
            existing.push({ date: todayString, time: now.toLocaleTimeString() });
            localStorage.setItem(histKey, JSON.stringify(existing));
            setSleepHistory([...existing].reverse());
          }
          
          const audio = new Audio('/notification.mp3');
          audio.volume = 1.0;
          audio.play().catch(() => {});
        }
      }
    };

    const intervalId = setInterval(checkSleepTime, 10000); // check 10 seconds explicitly for this tab
    return () => clearInterval(intervalId);
  }, [profile]);

  // ── 2. Inactivity Tracker Logic ──
  useEffect(() => {
    if (!isSignedIn) return;

    let inactivityTimer;
    // 2 minutes in milliseconds = 2 * 60 * 1000 = 120000
    const INACTIVITY_LIMIT = 120000;

    const triggerInactivityAlert = () => {
      setShowInactivityAlert(true);
      const audio = new Audio('/notification.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (!showInactivityAlert) {
        inactivityTimer = setTimeout(triggerInactivityAlert, INACTIVITY_LIMIT);
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isSignedIn, showInactivityAlert]);

  // Force Test Functions
  const testSleepAlert = () => {
    setShowSleepAlert(true);
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
    
    const now = new Date();
    const todayString = now.toISOString().slice(0, 10);
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      const histKey = `sleepHistory_${email}`;
      const existing = JSON.parse(localStorage.getItem(histKey)) || [];
      existing.push({ date: todayString, time: now.toLocaleTimeString() + ' (Test)' });
      localStorage.setItem(histKey, JSON.stringify(existing));
      setSleepHistory([...existing].reverse());
    }
  };
  const testInactivityAlert = () => {
    setShowInactivityAlert(true);
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-black pt-24 text-white">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Bell className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Active Reminders
            </h1>
            <p className="text-gray-400 text-lg mt-1">Manage all your push notifications & alerts</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Sleep Alert */}
          <div className="bg-black border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.05)]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <Moon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Sleep Routine Alarm</h2>
              </div>
              <button onClick={testSleepAlert} className="text-xs flex items-center gap-1 text-indigo-400 hover:text-white transition bg-indigo-500/20 px-3 py-1 rounded">
                <PlayCircle className="w-3 h-3" /> Test
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-6 font-medium">We will loudly remind you to step away from all screens to recover at this exact time.</p>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">Configure Time</label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-4 py-3 bg-indigo-500/5 border border-indigo-500/30 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            
            <button 
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isSaved ? 'bg-emerald-500 text-black' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isSaved ? "Saved!" : <><Save className="w-5 h-5"/> Save Alarm</>}
            </button>

            {sleepHistory.length > 0 && (
              <div className="mt-8 border-t border-indigo-500/20 pt-6">
                <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Activity className="w-4 h-4" /> Alarm History
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {sleepHistory.map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                      <span className="text-gray-300">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Inactivity Alert */}
          <div className="bg-black border border-yellow-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.05)]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-white">Sedentary Tracker</h2>
              </div>
              <button onClick={testInactivityAlert} className="text-xs flex items-center gap-1 text-yellow-500 hover:text-white transition bg-yellow-500/20 px-3 py-1 rounded">
                <PlayCircle className="w-3 h-3" /> Test
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6 font-medium">Tracking your device movements. We will automatically alert you to stretch if you are totally motionless for exactly 2 minutes.</p>
            
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex flex-col items-center justify-center py-8">
                 <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping mb-4" />
                 <p className="text-yellow-500 font-bold tracking-wider uppercase text-sm">System Running</p>
                 <p className="text-xs text-gray-500 mt-2">No configuration required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Popup Overlay rendered strictly within this tab */}
      <AnimatePresence>
        {(showSleepAlert || showInactivityAlert) && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className={`border-4 rounded-3xl p-10 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-black text-center ${
                showSleepAlert ? 'border-indigo-500 shadow-indigo-500/50' : 'border-yellow-500 shadow-yellow-500/50'
              }`}
            >
              <div className="flex justify-center mb-6">
                {showSleepAlert ? (
                  <div className="p-6 bg-indigo-500/20 rounded-full animate-bounce">
                    <Moon className="w-16 h-16 text-indigo-400" />
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-500/20 rounded-full animate-pulse">
                    <Activity className="w-16 h-16 text-yellow-500" />
                  </div>
                )}
              </div>
              
              <h2 className={`text-4xl font-black mb-4 tracking-tight ${showSleepAlert ? 'text-indigo-400' : 'text-yellow-500'}`}>
                {showSleepAlert ? "Time to Unwind!" : "Are you still there?"}
              </h2>
              
              <p className="text-gray-300 text-xl font-medium leading-relaxed mb-10">
                {showSleepAlert 
                  ? `You requested to go to sleep at ${profile?.sleepTime}. Turn off your screens and get a restful night of sleep to boost your recovery!`
                  : "It's been a while since you've been active. Extended periods of sitting can slow down your metabolism. Get up, stretch, or do a light walk!"}
              </p>
              
              <button 
                onClick={() => {
                  setShowSleepAlert(false);
                  setShowInactivityAlert(false);
                }} 
                className={`w-full py-5 text-black font-black uppercase tracking-wider rounded-xl transition-all text-xl ${
                  showSleepAlert 
                    ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)]' 
                    : 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)]'
                }`}
              >
                Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
