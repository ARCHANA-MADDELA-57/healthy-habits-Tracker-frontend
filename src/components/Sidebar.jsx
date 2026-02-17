import { NavLink, useNavigate } from "react-router-dom"; // Use useNavigate, not Navigate
import { useState } from "react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate hook

  const handleLogout = () => {
    // 1. Clear the login status
    localStorage.removeItem("isLoggedIn");
    
    // 2. Redirect the user using the navigate function
    navigate("/login");
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex w-64 bg-gradient-to-b from-indigo-900/80 to-purple-900/80 backdrop-blur-xl p-6 flex-col justify-between h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-white">HealthyHabits</h1>

          <nav className="flex flex-col gap-6 text-gray-300">
            <NavLink to="/dashboard" className="hover:text-white transition">Dashboard</NavLink>
            <NavLink to="/analytics" className="hover:text-white transition">Analytics</NavLink>
            <NavLink to="/settings" className="hover:text-white transition">Settings</NavLink>
          </nav>
        </div>

        {/* Updated Logout Button */}
        <button 
          onClick={handleLogout} 
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition text-white"
        >
          Logout
        </button>
      </div>

      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-indigo-900 p-4 flex justify-between items-center z-50">
        <h1 className="text-lg font-bold text-white">HealthyHabits</h1>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">☰</button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-indigo-800 p-6 flex flex-col gap-6 z-40 text-white">
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className="hover:text-gray-300">Dashboard</NavLink>
          <NavLink to="/analytics" onClick={() => setOpen(false)} className="hover:text-gray-300">Analytics</NavLink>
          <NavLink to="/settings" onClick={() => setOpen(false)} className="hover:text-gray-300">Settings</NavLink>
          
          {/* Also added the click handler to the mobile logout button */}
          <button 
            onClick={handleLogout} 
            className="bg-red-500 px-4 py-2 rounded-lg text-left"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;