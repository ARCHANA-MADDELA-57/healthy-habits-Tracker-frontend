import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiHome, FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { name: "Analytics", path: "/analytics", icon: <FiBarChart2 /> },
    { name: "Settings", path: "/settings", icon: <FiSettings /> },
  ];

  return (
    <div className="md:hidden">
      {/* Top Bar - Fixed height to prevent layout shifts */}
      <div className="bg-[#16113a]/90 backdrop-blur-md px-5 h-16 flex justify-between items-center border-b border-white/10 fixed top-0 left-0 right-0 z-[60]">
        <h1 className="text-xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
          HealthyHabits
        </h1>
        <button 
          onClick={() => setIsOpen(true)} 
          className="text-white bg-white/5 p-2 rounded-lg border border-white/10 active:scale-90 transition-transform"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Spacer to push content down below the fixed Top Bar */}
      <div className="h-16 w-full"></div>

      {/* Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative h-full w-[280px] bg-[#1c1a4e] shadow-2xl p-6 flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Navigation</span>
              <button onClick={() => setIsOpen(false)} className="text-white p-2">
                <FiX size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "hover:bg-white/5 text-gray-400"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-indigo-400"}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 text-red-400 border-t border-white/10 mt-auto font-black uppercase text-xs tracking-widest"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;