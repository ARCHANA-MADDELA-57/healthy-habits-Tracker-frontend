import React, { useState, useEffect, useContext } from "react";
import MobileNav from "../components/MobileNav";
import { Bell, BellOff, RefreshCw, Smartphone } from "lucide-react"; 
import { useGoogleLogin } from '@react-oauth/google';
import { healthService, fetchRealGoogleFitData } from '../services/healthService';
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

const Settings = () => {
  const { user: authUser, updateUserState } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [healthData, setHealthData] = useState(healthService.fetchData());
  const [isSyncing, setIsSyncing] = useState(false);

  const { registerPushSubscription } = useNotifications(authUser);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
    }
  }, [authUser]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      try {
        const realData = await fetchRealGoogleFitData(tokenResponse.access_token);
        const updated = healthService.syncData(realData);
        setHealthData(updated);
      } catch (error) {
        console.error("Sync Error:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
    flow: 'implicit', 
  });

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notificationsEnabled", newState);
  
    if (newState) {
      // ON LOGIC: Request permission and register
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        registerPushSubscription(); // This now returns correctly, stopping the crash
      }
    } else {
      // OFF LOGIC: Remove from database
      try {
        const response = await fetch("http://localhost:5000/api/auth/unsubscribe", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (response.ok) {
          console.log("Successfully unsubscribed from server");
          localStorage.removeItem("subscriptionSynced"); // Reset sync flag
        }
      } catch (err) {
        console.error("Failed to delete subscription:", err);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });

      const data = await response.json();

      if (response.ok) {
        updateUserState(data.user);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#16113a] text-white font-sans overflow-x-hidden">
      <MobileNav />
      
      <div className="max-w-4xl mx-auto pb-24 pt-4 px-4 md:px-8">
        {/* Header - Centered on mobile, left-aligned on desktop */}
        <header className="mb-10 text-center md:text-left mt-4">
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-blue-500">
            Settings
          </h1>
          <p className="text-gray-400 font-bold italic mt-1 uppercase text-[10px] tracking-widest">
            Personalize your healthy habits journey
          </p>
        </header>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-indigo-400">👤</span> Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email (Read Only)</label>
                  <input
                    type="email"
                    value={authUser?.email || ""}
                    disabled
                    className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-3.5 text-gray-500 cursor-not-allowed text-sm font-bold"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
              >
                {isUpdating ? "Saving..." : isSaved ? "✅ Changes Saved" : "Save Changes"}
              </button>
            </form>
          </section>

          {/* Health Sync Section - Fully Responsive Grid */}
          <section className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-indigo-400">⌚</span> Device Integrations
            </h2>
            <div className="flex flex-col p-5 md:p-8 bg-black/20 rounded-3xl border border-white/5 gap-8">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                  <Smartphone size={32} />
                </div>
                <div className="flex-1">
                  <p className="font-black italic uppercase text-lg leading-tight">Google Fit Sync</p>
                  <p className="text-xs text-gray-400 mt-1 font-bold">Pull real-time step data from your Google account.</p>
                  {healthData.lastSynced && (
                    <p className="text-[9px] text-indigo-400 font-black uppercase mt-2 tracking-widest bg-indigo-500/10 inline-block px-2 py-1 rounded">Last Sync: {healthData.lastSynced}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Steps</p>
                    <p className="text-2xl font-black italic text-indigo-400">{healthData.steps}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Sleep</p>
                    <p className="text-2xl font-black italic text-pink-500">{healthData.sleepHours}h</p>
                </div>
              </div>

              <button 
                onClick={() => login()} 
                disabled={isSyncing}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all justify-center ${
                  isSyncing ? "bg-gray-700 text-gray-400" : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-lg shadow-indigo-600/20"
                }`}
              >
                <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Connecting..." : "Sync Google Fit"}
              </button>
            </div>
          </section>

          {/* App Preferences */}
          <section className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="text-indigo-400">⚙️</span> App Preferences
            </h2>
            <div className="flex items-center justify-between p-5 md:p-6 bg-black/20 rounded-3xl border border-white/5 gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl hidden sm:block ${notificationsEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/10 text-gray-500'}`}>
                  {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
                </div>
                <div>
                  <p className="font-black italic uppercase text-sm">Daily Reminders</p>
                  <p className="text-[10px] text-gray-400 font-bold">Receive notifications to log your habits.</p>
                </div>
              </div>
              <div 
                onClick={toggleNotifications} 
                className={`shrink-0 w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${notificationsEnabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;