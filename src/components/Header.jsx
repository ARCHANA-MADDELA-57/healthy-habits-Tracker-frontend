import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WellnessCard from "./WellnessCard";

const Header = ({ userName, currentScore, quote, showWarning }) => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Your journey is looking great today.",
    "Consistency is the key to success!"
  ];

  // Cycle messages every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Framer Motion Variants
  const container = {
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const letter = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  return (
    <header className="mb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full">
          <div className="min-h-[110px]">
            {/* TYPEWRITER HEADING */}
            <div className="flex flex-wrap items-center">
              <motion.h1
                variants={container}
                initial="hidden"
                animate="visible"
                className="text-3xl font-bold flex flex-wrap items-center"
              >
                {Array.from(`Hey, ${userName}! 👋`).map((char, i) => (
                  <motion.span key={i} variants={letter}>
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
                <motion.span
                  variants={letter}
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "steps(2)" }}
                  className="inline-block w-[3px] h-8 bg-indigo-500 ml-1"
                />
              </motion.h1>
            </div>

            {/* CYCLING TYPEWRITER MESSAGES */}
            <div className="mt-3 relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className={`${
                    index === 0 ? "text-gray-400" : "text-indigo-400 font-medium"
                  } text-sm md:text-base flex flex-wrap items-center`}
                >
                  {Array.from(messages[index]).map((char, i) => (
                    <motion.span key={i} variants={letter}>
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                  <motion.span
                    variants={letter}
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "steps(2)" }}
                    className="inline-block w-[2px] h-5 bg-indigo-400 ml-1"
                  />
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <WellnessCard score={currentScore} trend={currentScore - 70} />
        </div>

        {/* INSPIRATIONAL QUOTE BOX */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:max-w-[300px] bg-indigo-500/10 border-r-4 border-indigo-500 p-4 rounded-l-xl backdrop-blur-sm shadow-lg"
        >
          <p className="text-xs italic text-indigo-200">"{quote.text}"</p>
          <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-[0.1em]">
            — {quote.author}
          </p>
        </motion.div>
      </div>

      {/* WELLNESS WARNING (Moved inside Header for cleaner Dashboard) */}
      {showWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mt-6 flex items-center gap-3 animate-pulse"
        >
          <span className="text-xl">⚠️</span>
          <p className="text-red-400 font-bold text-sm">
            Wellness Alert: Your score is dipping! Log a habit to stay on track.
          </p>
        </motion.div>
      )}
    </header>
  );
};

export default Header;