import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";

const Dashboard = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    
    // DEBUG: Check this in your browser console (F12) to see why the name is missing
    useEffect(() => {
        console.log("Storage Data:", storedUser);
    }, [storedUser]);

    // Name Fix: Checks common keys. If all fail, it shows "User"
    const userName = storedUser?.name || storedUser?.username || storedUser?.email?.split('@')[0] || "User";
    const userKey = storedUser ? `habits_${storedUser.email}` : null;

    const [habits, setHabits] = useState([]);
    const [editingHabit, setEditingHabit] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        if (userKey) {
            const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
            setHabits(storedHabits);
            setIsDataLoaded(true);
        }
    }, [userKey]);

    useEffect(() => {
        if (isDataLoaded && userKey) {
            localStorage.setItem(userKey, JSON.stringify(habits));
        }
    }, [habits, userKey, isDataLoaded]);

    if (!isLoggedIn || !storedUser) return <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white">Please Login.</div>;

    const addHabit = (title, description, target, category) => {
        const newHabit = {
            id: Date.now(),
            title,
            description,
            target: parseInt(target) || 1,
            category: category || "General",
            current: 0,
            streak: 0,
            completedToday: false
        };
        setHabits([...habits, newHabit]);
    };

    const updateHabit = (id, title, description, target, category) => {
        setHabits(habits.map(h => h.id === id ? { ...h, title, description, target: parseInt(target), category } : h));
    };

    const incrementProgress = (id) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const nextVal = Math.min((h.current || 0) + 1, h.target);
                const isDone = nextVal >= h.target;
                return { ...h, current: nextVal, streak: isDone && !h.completedToday ? h.streak + 1 : h.streak, completedToday: isDone };
            }
            return h;
        }));
    };

    const decrementProgress = (id) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, current: Math.max(0, (h.current || 0) - 1), completedToday: false } : h));
    };

    const perfectedToday = habits.filter(h => h.current >= h.target).length;
    const totalProgressArray = habits.map(h => (h.current || 0) / (h.target || 1));
    const overallProgress = habits.length > 0 
        ? Math.round((totalProgressArray.reduce((a, b) => a + b, 0) / habits.length) * 100) 
        : 0;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
            {/* Sidebar: Responsive - Hidden on small, shown on md+ */}
            <div className="hidden md:block w-64 h-full shrink-0">
                <Sidebar />
            </div>

            {/* Main Content Area: Scrollable */}
            <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
                
                {/* Header Section */}
                <header className="mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-4xl font-bold">
                        Welcome, <span className="text-indigo-400 capitalize">{userName}</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Ready to crush your goals today?</p>
                </header>

                {/* Overall Completion Card (Responsive) */}
                <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 mb-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-4">
                        <div>
                            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Overall Progress</p>
                            <h2 className="text-4xl md:text-6xl font-black">{overallProgress}%</h2>
                        </div>
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold">{perfectedToday} / {habits.length} Perfect</p>
                    </div>
                    <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000" 
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Quick Stats Grid (Responsive 1-3 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Total</p>
                        <h3 className="text-2xl font-black">{habits.length}</h3>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-green-400 text-[9px] font-bold uppercase mb-1">Perfect</p>
                        <h3 className="text-2xl font-black text-green-400">{perfectedToday}</h3>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-orange-400 text-[9px] font-bold uppercase mb-1">Best Streak</p>
                        <h3 className="text-2xl font-black text-orange-400">
                            {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
                        </h3>
                    </div>
                </div>

                {/* Habit Cards Grid: Responsive Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                    {habits.map((habit) => {
                        const percent = Math.round(((habit.current || 0) / (habit.target || 1)) * 100);
                        const safePercent = isNaN(percent) ? 0 : percent;

                        return (
                            <div key={habit.id} className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-all shadow-xl">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="relative w-14 h-14 shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                                <circle cx="28" cy="28" r="24" stroke="#4f46e5" strokeWidth="4" fill="transparent"
                                                    strokeDasharray={150.8} strokeDashoffset={150.8 - (150.8 * safePercent) / 100} strokeLinecap="round" />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{safePercent}%</span>
                                        </div>
                                        <div className="text-right flex-1 ml-4">
                                            <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase">{habit.category}</span>
                                            <h3 className="text-lg font-bold truncate mt-1">{habit.title}</h3>
                                            <p className="text-orange-400 text-[10px] font-bold">🔥 {habit.streak} DAYS</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-8 line-clamp-2 italic">"{habit.description}"</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <span>Progress</span>
                                        <span className="text-white">{habit.current} / {habit.target}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => decrementProgress(habit.id)} className="w-12 py-3 rounded-xl bg-white/5 hover:bg-white/10">-</button>
                                            <button onClick={() => incrementProgress(habit.id)} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase">+ Log</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingHabit(habit); setIsOpen(true); }} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-white/10">Edit</button>
                                            <button onClick={() => { if(window.confirm("Delete?")) setHabits(habits.filter(h => h.id !== habit.id)) }} className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Mobile Add Button */}
            <button 
                onClick={() => { setEditingHabit(null); setIsOpen(true); }} 
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-indigo-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all"
            >
                +
            </button>

            <AddHabitModal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingHabit(null); }} onAdd={addHabit} onUpdate={updateHabit} editingHabit={editingHabit} />
        </div>
    );
};

export default Dashboard;