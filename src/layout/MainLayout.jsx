import { useState } from "react";

const MainLayout = ({ children }) => {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark 
      ? "min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white"
      : "min-h-screen bg-gray-100 text-black"
    }>

      <button
        onClick={() => setDark(!dark)}
        className="fixed top-5 right-5 bg-white/20 px-4 py-2 rounded-lg"
      >
        Toggle Theme
      </button>

      {children}
    </div>
  );
};

export default MainLayout;
