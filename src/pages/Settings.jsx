import React, { useState, useEffect } from "react";
import MobileNav from "../components/MobileNav";
import { Eye, EyeOff, Bell, BellOff } from "lucide-react"; 

const Settings = () => {
  const [user, setUser] = useState({ fullName: "", email: "" });
  const [isSaved, setIsSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Notification Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  // Password States
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (storedUser) {
      setUser({
        fullName: storedUser.fullName || "User",
        email: storedUser.email || "",
      });
    }
  }, []);

  // --- NEW: Handle Notification Toggle ---
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

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (!storedUser) return;
  
    if (passwords.old !== storedUser.password) {
      setPassError("Current password incorrect.");
      return;
    }
    if (passwords.new.length < 6) {
      setPassError("Min 6 characters required.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError("Passwords do not match.");
      return;
    }
  
    const updatedUser = { ...storedUser, password: passwords.new };
    localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
  
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const updatedList = allUsers.map(u => u.email === storedUser.email ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedList));
    localStorage.setItem(storedUser.email, JSON.stringify(updatedUser));
  
    setPassSuccess(true);
    setTimeout(() => {
      localStorage.removeItem("isLoggedIn"); // Better than clear() to keep settings
      alert("Security sync complete. Please log in with your new password.");
      window.location.href = "/login";
    }, 1500);
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

        {/* Password Section */}
        <section className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">🔒 Change Password</h2>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-4 max-w-md">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Current Password"
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />

            {passError && <p className="text-red-400 text-sm font-medium">{passError}</p>}
            {passSuccess && <p className="text-green-400 text-sm font-bold animate-bounce">Password Updated!</p>}

            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Update Security
            </button>
          </form>
        </section>

        {/* --- UPDATED: App Preferences --- */}
        <section className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            ⚙️ App Preferences
          </h2>
          <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${notificationsEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/10 text-gray-500'}`}>
                {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <p className="font-bold">Daily Reminders</p>
                <p className="text-xs text-gray-400 max-w-[200px]">
                  Receive a notification to log your habits when you fall behind.
                </p>
              </div>
            </div>
            
            {/* Functional Toggle Switch */}
            <div 
              onClick={toggleNotifications}
              className={`w-14 h-7 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${
                notificationsEnabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${
                notificationsEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}></div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 backdrop-blur-md p-8 rounded-[2rem] border border-red-500/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-red-400 mb-2">🛑 Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-6">Resetting your data will clear all progress for your habits.</p>
          <button
            onClick={() => {
              if (window.confirm("Are you sure? This will delete all your local habits!")) {
                const userKey = `habits_${user.email}`;
                localStorage.removeItem(userKey);
                window.location.reload();
              }
            }}
            className="border border-red-500/50 hover:bg-red-500/10 text-red-500 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all"
          >
            Clear All Habit Progress
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;