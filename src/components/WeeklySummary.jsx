import React from 'react';
import { motion } from 'framer-motion';

const WeeklySummary = ({ userEmail }) => {
  const userKey = `habits_${userEmail}`;
  const historyKey = `${userKey}_history`;
  
  // Pull data from LocalStorage
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
        <div className="text-5xl mb-4">📜</div>
        <h3 className="text-xl font-bold text-white/50">Your history is empty</h3>
        <p className="text-gray-500 text-sm mt-2">Finish your habits today, and they'll appear here tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-white">Weekly Progress</h2>
        <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Last 7 Days</p>
      </header>

      {history.map((dayRecord, index) => (
        <motion.div
          key={dayRecord.date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#1e1b4b]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-xl"
        >
          {/* Header of the Day Card */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h4 className="text-lg font-black text-white">{dayRecord.date}</h4>
              <p className="text-xs text-indigo-300 font-bold uppercase">
                {new Date(dayRecord.date).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-500">
                {Math.round((dayRecord.habits.filter(h => h.completed).length / dayRecord.habits.length) * 100)}%
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Success Rate</p>
            </div>
          </div>

          {/* List of Habits for that Day */}
          <div className="p-4 space-y-3">
            {dayRecord.habits.map((habit, i) => (
              <div 
                key={i} 
                className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${habit.completed ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-semibold text-gray-200">{habit.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-500">{habit.score}</span>
                  <span className={`text-xs font-black uppercase ${habit.completed ? 'text-green-400' : 'text-red-400'}`}>
                    {habit.completed ? "Goal Met" : "Missed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WeeklySummary;