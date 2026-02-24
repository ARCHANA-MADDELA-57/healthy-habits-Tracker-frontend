import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
// 1. Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { logout } = useContext(AuthContext); // Get logout from context

  const handleLogout = () => {
    toast.info("Logging out...", {
      position: "top-center",
      autoClose: 1500,
      theme: "dark",
    });

    // Call the central logout function from AuthContext
    setTimeout(() => {
      logout(); 
    }, 1500);
  };

  return (
    <>
      {/* 4. Add the Container here so it's always listening */}
      <ToastContainer limit={1} />

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex fixed left-0 top-0 w-64 bg-gradient-to-b from-indigo-900/90 to-purple-900/90 backdrop-blur-xl p-6 flex-col justify-between h-screen border-r border-white/10 z-50">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-white tracking-tighter">HealthyHabits</h1>

          <nav className="flex flex-col gap-6 text-gray-300">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "text-white font-bold" : "hover:text-white transition"}>Dashboard</NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? "text-white font-bold" : "hover:text-white transition"}>Analytics</NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? "text-white font-bold" : "hover:text-white transition"}>Settings</NavLink>
          </nav>
        </div>

        <button 
          onClick={handleLogout} 
          className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition font-semibold"
        >
          Logout
        </button>
      </div>

      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-indigo-900 p-4 flex justify-between items-center z-[60]">
        <h1 className="text-lg font-bold text-white">HealthyHabits</h1>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">☰</button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-indigo-800 p-6 flex flex-col gap-6 z-[55] text-white shadow-2xl">
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className="hover:text-gray-300">Dashboard</NavLink>
          <NavLink to="/analytics" onClick={() => setOpen(false)} className="hover:text-gray-300">Analytics</NavLink>
          <NavLink to="/settings" onClick={() => setOpen(false)} className="hover:text-gray-300">Settings</NavLink>
          
          <button 
            onClick={handleLogout} 
            className="bg-red-500 px-4 py-2 rounded-lg text-center font-bold"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;