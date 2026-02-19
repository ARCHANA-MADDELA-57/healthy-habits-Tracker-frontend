import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import confetti from "canvas-confetti";
import WellnessCard from "../components/WellnessCard";

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

  const [quote, setQuote] = useState({ text: "Loading inspiration...", author: "" });
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const userName = storedUser?.fullName || storedUser?.username || storedUser?.email?.split("@")[0] || "User";
  const userKey = storedUser ? `habits_${storedUser.email}` : null;

  // 1. Load Quotes
  useEffect(() => {
    const localQuotes = [
      { text: "Start where you are.", author: "Arthur Ashe" },
      { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
      { text: "Keep going. Each step counts.", author: "Unknown" },
      { text: "Focus on the step, not the mountain.", author: "Unknown" },
    ];
    setQuote(localQuotes[Math.floor(Math.random() * localQuotes.length)]);
  }, []);

  // 2. Load Habits
  useEffect(() => {
    if (userKey) {
      const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem(`${userKey}_lastVisit`);

      if (lastVisit !== today) {
        const resetHabits = storedHabits.map((h) => ({ ...h, current: 0, completedToday: false }));
        setHabits(resetHabits);
        localStorage.setItem(`${userKey}_lastVisit`, today);
      } else {
        setHabits(storedHabits);
      }
      setIsDataLoaded(true);
    }
  }, [userKey]);

  // 3. Save Habits
  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  // 4. Calculations
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

  // 5. Handlers
  const addHabit = (title, description, target, category) => {
    setHabits([...habits, { id: Date.now(), title, description, target: parseInt(target) || 1, category: category || "General", current: 0, streak: 0, completedToday: false }]);
  };

  const updateHabit = (id, title, description, target, category) => {
    setHabits(habits.map((h) => h.id === id ? { ...h, title, description, target: parseInt(target), category } : h));
  };

  const incrementProgress = (id) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id === id) {
        const nextVal = Math.min((h.current || 0) + 1, h.target);
        const isDone = nextVal >= h.target;
        if (isDone && !h.completedToday) {
          confetti({ particleCount: 150, spread: 60, origin: { y: 0.7 }, colors: ["#6366f1", "#a855f7", "#f59e0b"] });
        }
        return { ...h, current: nextVal, streak: isDone && !h.completedToday ? h.streak + 1 : h.streak, completedToday: isDone };
      }
      return h;
    }));
  };

  const decrementProgress = (id) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, current: Math.max(0, (h.current || 0) - 1), completedToday: false } : h));
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      <div className="hidden md:block w-64 h-full shrink-0"><Sidebar /></div>

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        {/* Header with Wellness Widget */}
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full">
            <div>
              <h1 className="text-3xl font-bold">Hey, {userName}! 👋</h1>
              <p className="text-gray-400">Your journey is looking great today.</p>
            </div>
            <WellnessCard score={currentScore} trend={currentScore - 70} />
          </div>
          <div className="lg:max-w-[300px] bg-indigo-500/10 border-r-4 border-indigo-500 p-3 rounded-l-xl backdrop-blur-sm">
             <p className="text-xs italic text-indigo-200">"{quote.text}"</p>
             <p className="text-[9px] text-indigo-400 font-black uppercase mt-1">— {quote.author}</p>
          </div>
        </header>

        {showWarning && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 flex items-center gap-3 animate-pulse">
            <span className="text-xl">⚠️</span>
            <p className="text-red-400 font-bold text-sm">Wellness Alert: Your score is dipping! Log a habit to stay on track.</p>
          </div>
        )}


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

        {/* RESTORED: Stats Cards Grid */}
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

        {/* RESTORED: Streak Milestone Banner */}
        {hasMilestone && (
          <div className="relative overflow-hidden mb-8 animate-in slide-in-from-left duration-500">
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
          {habits.length === 0 && <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20 text-gray-400">No habits yet. Start by clicking the + button!</div>}
          {habits.map((habit) => {
            const perc = Math.round((habit.current / habit.target) * 100);
            return (
              <div key={habit.id} className={`p-6 rounded-[2rem] border transition-all ${habit.completedToday ? "bg-indigo-500/10 border-indigo-500/50" : "bg-white/5 border-white/10"}`}>
                <div className="flex justify-between mb-4">
                  <div className="text-left">
                    <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase">{habit.category}</span>
                    <h3 className={`text-lg font-bold truncate mt-1 ${habit.completedToday ? "line-through text-indigo-400/50" : ""}`}>{habit.title}</h3>
                  </div>
                  <div className="text-right text-orange-400 font-bold text-xs">🔥 {habit.streak}</div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${perc}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{perc}%</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decrementProgress(habit.id)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">-</button>
                  <button onClick={() => incrementProgress(habit.id)} disabled={habit.completedToday} className={`flex-1 h-10 rounded-lg font-bold text-[10px] uppercase ${habit.completedToday ? "bg-green-500/20 text-green-400" : "bg-indigo-600 hover:bg-indigo-500"}`}>
                    {habit.completedToday ? "Done ✓" : "+ Progress"}
                  </button>
                </div>
                <div className="flex gap-2 mt-4 opacity-40 hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingHabit(habit); setIsOpen(true); }} className="flex-1 py-1 text-[9px] font-bold uppercase border border-white/10 rounded-md">Edit</button>
                  <button onClick={() => { if(window.confirm("Delete?")) setHabits(habits.filter(h => h.id !== habit.id)) }} className="flex-1 py-1 text-[9px] font-bold uppercase border border-red-500/20 text-red-500 rounded-md">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <button onClick={() => { setEditingHabit(null); setIsOpen(true); }} className="fixed bottom-6 right-6 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all">+</button>

      <AddHabitModal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingHabit(null); }} onAdd={addHabit} onUpdate={updateHabit} editingHabit={editingHabit} />
    </div>
  );
};

export default Dashboard;