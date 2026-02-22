import { motion } from "framer-motion";

const WellnessCard = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'stroke-green-400';
    if (score >= 50) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl border transition-all duration-500 flex items-center gap-6 h-full ${
      score < 40 ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
    }`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle className="text-white/10" strokeWidth="4" fill="transparent" r="28" cx="32" cy="32" />
          <motion.circle 
            initial={{ strokeDashoffset: 176 }}
            animate={{ strokeDashoffset: 176 - (176 * score) / 100 }}
            transition={{ duration: 1.5 }}
            className={`${getScoreColor()}`}
            strokeWidth="4" 
            strokeDasharray={176} 
            strokeLinecap="round" 
            fill="transparent" 
            r="28" cx="32" cy="32" 
          />
        </svg>
        <span className="absolute text-sm font-black">{score}%</span>
      </div>

      <div className="flex flex-col">
        <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">System Status</h4>
        <p className="text-lg font-bold leading-tight">Wellness Score</p>
        <span className="text-[10px] font-bold text-indigo-300/60 mt-1 tracking-tight">
          {score < 40 ? "Attention Required" : "Vitality Index Stable"}
        </span>
      </div>
    </div>
  );
};

export default WellnessCard;