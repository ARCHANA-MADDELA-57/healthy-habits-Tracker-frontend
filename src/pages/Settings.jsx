import React, { useState, useEffect } from "react";
import MobileNav from "../components/MobileNav";
import { Bell, BellOff, RefreshCw, Smartphone } from "lucide-react"; 
import { useGoogleLogin } from '@react-oauth/google';
// Ensure you have fetchRealGoogleFitData exported from your healthService
import { healthService, fetchRealGoogleFitData } from '../services/healthService';

const Settings = () => {
  const [user, setUser] = useState({ fullName: "", email: "" });
  const [isSaved, setIsSaved] = useState(false);
  
  // Health Sync States
  const [healthData, setHealthData] = useState(healthService.fetchData());
  const [isSyncing, setIsSyncing] = useState(false);

  // Notification Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (storedUser) {
      setUser({
        fullName: storedUser.fullName || "User",
        email: storedUser.email || "",
      });
    }
  }, []);

  // REAL GOOGLE SYNC LOGIC
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      try {
        // Use the access_token directly
        const realData = await fetchRealGoogleFitData(tokenResponse.access_token);
        const updated = healthService.syncData(realData);
        setHealthData(updated);
      } catch (error) {
        console.error("Sync Error:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    // Ensure the scope matches what you set in Google Cloud
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
    flow: 'implicit', 
  });

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notificationsEnabled", newState);
    if (newState && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    const updatedUser = { ...storedUser, fullName: user.fullName };
    localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto text-white pb-20 px-4">
      <MobileNav />
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-indigo-300 opacity-80 mt-1">Personalize your healthy habits journey.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">👤 Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  value={user.fullName}
                  onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email (Read Only)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
              {isSaved ? "✅ Changes Saved" : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Health Sync Section - Updated to use login() */}
        <section className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">⌚ Device Integrations</h2>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                <Smartphone size={32} />
              </div>
              <div>
                <p className="font-bold text-lg">Google Fit Sync</p>
                <p className="text-sm text-gray-400 max-w-[250px]">Pull real-time step data from your Google account.</p>
                {healthData.lastSynced && (
                  <p className="text-[10px] text-indigo-300 uppercase mt-1 tracking-widest">Last Sync: {healthData.lastSynced}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-8 text-center">
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Steps</p>
                    <p className="text-xl font-bold">{healthData.steps}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Sleep</p>
                    <p className="text-xl font-bold">{healthData.sleepHours}h</p>
                </div>
            </div>

            <button 
              onClick={() => login()} 
              disabled={isSyncing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all min-w-[160px] justify-center ${
                isSyncing ? "bg-gray-700 text-gray-400" : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Connecting..." : "Sync Google Fit"}
            </button>
          </div>
        </section>

        {/* App Preferences */}
        <section className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">⚙️ App Preferences</h2>
          <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${notificationsEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/10 text-gray-500'}`}>
                {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <p className="font-bold">Daily Reminders</p>
                <p className="text-xs text-gray-400 max-w-[200px]">Receive notifications to log your habits.</p>
              </div>
            </div>
            <div onClick={toggleNotifications} className={`w-14 h-7 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${notificationsEnabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 backdrop-blur-md p-8 rounded-[2rem] border border-red-500/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-red-400 mb-2">🛑 Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-6">Resetting your data will clear all progress.</p>
          <button onClick={() => { if (window.confirm("Are you sure?")) { localStorage.removeItem(`habits_${user.email}`); window.location.reload(); } }} className="border border-red-500/50 hover:bg-red-500/10 text-red-500 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all">Clear All Habit Progress</button>
        </section>
      </div>
    </div>
  );
};

export default Settings;