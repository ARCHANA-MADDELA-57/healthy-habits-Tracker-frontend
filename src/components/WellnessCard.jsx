// components/WellnessCard.jsx
import React from 'react';

const WellnessCard = ({ score, trend }) => {
    // Logic for color
    const getScoreColor = () => {
      if (score >= 80) return 'stroke-green-400';
      if (score >= 50) return 'stroke-yellow-400';
      return 'stroke-red-400';
    };
  
    return (
      <div className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-6 max-w-sm">
        {/* Smaller, cleaner Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle className="text-white/10" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
            <circle 
              className={`${getScoreColor()} transition-all duration-700 ease-out`}
              strokeWidth="4" 
              strokeDasharray={176} 
              strokeDashoffset={176 - (176 * score) / 100} 
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="28" cx="32" cy="32" 
            />
          </svg>
          <span className="absolute text-sm font-bold">{score}%</span>
        </div>
  
        {/* Text Info */}
        <div className="flex flex-col">
          <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Wellness Score</h4>
          <p className="text-lg font-semibold leading-tight">Overall Health</p>
          
          {/* Compact Alert */}
          {trend < 0 && (
            <span className="text-[9px] font-bold text-red-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
              SCORE DROPPING
            </span>
          )}
        </div>
      </div>
    );
  };

export default WellnessCard;