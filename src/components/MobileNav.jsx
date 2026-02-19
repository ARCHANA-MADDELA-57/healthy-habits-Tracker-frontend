import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiHome, FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
      {/* Top Bar */}
      <div className="bg-[#1a164d]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10 sticky top-0 z-[60]">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          HealthyHabits
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-2xl p-2">
          <FiMenu />
        </button>
      </div>

      {/* Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="absolute right-0 top-0 h-full w-64 bg-[#1a164d] shadow-2xl p-6 flex flex-col">
            <button onClick={() => setIsOpen(false)} className="self-end text-2xl mb-8">
              <FiX />
            </button>

            <nav className="flex flex-col gap-4 flex-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors text-lg"
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 text-red-400 border-t border-white/10 mt-auto"
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