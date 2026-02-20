import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import MobileNav from "../components/MobileNav";
import Header from "../components/Header";
import HabitCard from "../components/HabitCard";
import { useHabits } from "../hooks/useHabits"; // Hook import

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

  const userName = storedUser?.fullName || storedUser?.username || "User";
  const userKey = storedUser ? `habits_${storedUser.email}` : null;

  // Using the hook to replace the logic you moved to useHabits.js
  const { 
    habits, 
    addHabit, 
    updateHabit, 
    incrementProgress, 
    decrementProgress, 
    deleteHabit 
  } = useHabits(userKey);

  const [quote, setQuote] = useState({ text: "Loading inspiration...", author: "" });
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // 1. Load Quotes (UI specific logic stays here)
  useEffect(() => {
    const localQuotes = [
      { text: "Start where you are.", author: "Arthur Ashe" },
      { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
      { text: "Keep going. Each step counts.", author: "Unknown" },
      { text: "Focus on the step, not the mountain.", author: "Unknown" },
    ];
    setQuote(localQuotes[Math.floor(Math.random() * localQuotes.length)]);
  }, []);

  // 2. Calculations (Kept here for UI rendering)
  const perfectedToday = habits.filter((h) => h.completedToday).length;
  const currentScore = habits.length > 0 ? Math.round((perfectedToday / habits.length) * 100) : 0;

  const totalProgressArray = habits.map((h) => (h.current || 0) / (h.target || 1));
  const overallProgress = habits.length > 0 
    ? Math.round((totalProgressArray.reduce((a, b) => a + b, 0) / habits.length) * 100) 
    : 0;

  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;
  const hasMilestone = habits.some((h) => h.streak >= 7);

  useEffect(() => {
    setShowWarning(habits.length > 0 && currentScore < 50);
  }, [currentScore, habits.length]);

  if (!isLoggedIn || !storedUser) return <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white font-bold">Please Login.</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <MobileNav />
      <div className="hidden md:block w-64 h-full shrink-0">
        <Sidebar />
      </div>

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <Header userName={userName} currentScore={currentScore} quote={quote} showWarning={showWarning} />

        {/* Momentum Bar */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Daily Momentum</h2>
              <p className="text-2xl font-black">{overallProgress}%</p>
            </div>
            <p className="text-gray-400 text-xs font-bold">{perfectedToday} / {habits.length} Done</p>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Total Habits</p>
            <h3 className="text-2xl font-black">{habits.length}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-green-400 text-[9px] font-bold uppercase mb-1">Completed</p>
            <h3 className="text-2xl font-black text-green-400">{perfectedToday}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-orange-400 text-[9px] font-bold uppercase mb-1">Best Streak</p>
            <h3 className="text-2xl font-black text-orange-400">{bestStreak} Days</h3>
          </div>
        </div>

        {/* Milestone Banner */}
        {hasMilestone && (
          <div className="relative overflow-hidden mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-black/40 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
              <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg">🔥</div>
              <div>
                <h3 className="text-lg font-bold">7-Day Streak Club!</h3>
                <p className="text-gray-400 text-xs">You're maintaining incredible consistency. Keep the fire burning!</p>
              </div>
            </div>
          </div>
        )}

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {habits.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20 text-gray-400">
              No habits yet. Start by clicking the + button!
            </div>
          )}
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onIncrement={incrementProgress}
              onDecrement={decrementProgress}
              onEdit={(h) => { setEditingHabit(h); setIsOpen(true); }}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      </main>

      <button
        onClick={() => { setEditingHabit(null); setIsOpen(true); }}
        className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all"
      >
        +
      </button>

      <AddHabitModal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditingHabit(null); }}
        onAdd={addHabit}
        onUpdate={updateHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
};

export default Dashboard;