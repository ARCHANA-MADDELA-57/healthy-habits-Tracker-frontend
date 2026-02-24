import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const Header = ({ userName, neglectedHabit, quote }) => {
  const quoteDisplay = quote?.text ? `"${quote.text}" — ${quote.author || 'Unknown'}` : "Loading inspiration...";

  const scrollToHabit = () => {
    if (neglectedHabit) {
      const element = document.getElementById(`habit-${neglectedHabit.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Applying the red curved border/glow highlight
        element.classList.add('ring-4', 'ring-red-500/50', 'rounded-[2rem]', 'transition-all', 'duration-500', 'scale-[1.02]', 'z-10');
        
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-red-500/50', 'rounded-[2rem]', 'scale-[1.02]', 'z-10');
        }, 2500);
      }
    }
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
      <div className="max-w-xl">
        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 text-white">
          Hey, <span className="text-indigo-400">{userName}</span> ! 
          <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span>
        </h1>
        
        <div className="h-6 mt-2">
          <TypeAnimation
            key={quote?.text} 
            sequence={[quoteDisplay, 3000, "Consistency is the DNA of mastery.", 2000]}
            wrapper="p"
            speed={50}
            className="text-gray-400 text-sm italic font-medium"
            repeat={Infinity}
          />
        </div>
      </div>

      {neglectedHabit && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToHabit}
          className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-center gap-4 max-w-sm backdrop-blur-md shadow-lg shadow-red-500/10 cursor-pointer group"
        >
          <div className="bg-red-500/20 w-10 h-10 rounded-full flex items-center justify-center text-xl animate-pulse group-hover:bg-red-500/40 transition-colors">
            🚨
          </div>
          <div>
            <h4 className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">
              Neglect Detected: {neglectedHabit.category}
            </h4>
            <p className="text-white font-bold text-sm leading-tight">
              {neglectedHabit.title} is at {Math.round((neglectedHabit.current / neglectedHabit.target) * 100)}%
            </p>
            <p className="text-[9px] text-red-300/60 mt-1 font-bold italic underline group-hover:text-red-300 transition-colors">Click to take action →</p>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;