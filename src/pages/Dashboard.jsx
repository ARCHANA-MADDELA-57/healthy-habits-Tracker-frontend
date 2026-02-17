import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";

const Dashboard = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
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

    if (!isLoggedIn || !storedUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <p className="text-xl">Please login to view your habits.</p>
            </div>
        );
    }

    const addHabit = (title, description, target) => {
        const newHabit = {
            id: Date.now(),
            title,
            description,
            current: 0,
            target: parseInt(target) || 1, 
            completedToday: false,
            streak: 0,
            createdAt: new Date().toISOString()
        };
        setHabits([...habits, newHabit]);
    };

    const incrementProgress = (id) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id === id) {
                const nextValue = (habit.current || 0) + 1;
                const goal = habit.target || 1;
                if (habit.current >= goal) return habit;
                const isNowDone = nextValue === goal;
                return {
                    ...habit,
                    current: nextValue,
                    completedToday: isNowDone,
                    streak: (isNowDone && !habit.completedToday) ? habit.streak + 1 : habit.streak
                };
            }
            return habit;
        }));
    };

    const decrementProgress = (id) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id === id) {
                const nextValue = Math.max(0, (habit.current || 0) - 1);
                const goal = habit.target || 1;
                const wasDone = habit.current >= goal;
                const isNowNotDone = nextValue < goal;
                return {
                    ...habit,
                    current: nextValue,
                    completedToday: !isNowNotDone,
                    streak: (wasDone && isNowNotDone) ? Math.max(0, habit.streak - 1) : habit.streak
                };
            }
            return habit;
        }));
    };

    const updateHabit = (id, updatedTitle, updatedDescription, updatedTarget) => {
        setHabits(habits.map((habit) =>
            habit.id === id
                ? { ...habit, title: updatedTitle, description: updatedDescription, target: updatedTarget }
                : habit
        ));
    };

    const deleteHabit = (id) => {
        if (window.confirm("Delete this habit?")) {
            setHabits(habits.filter((habit) => habit.id !== id));
        }
    };

    const totalProgressArray = habits.map(h => (h.current || 0) / (h.target || 1));
    const overallProgress = habits.length > 0 
        ? Math.round((totalProgressArray.reduce((a, b) => a + b, 0) / habits.length) * 100) 
        : 0;
    const completedCount = habits.filter(h => (h.current || 0) >= (h.target || 1)).length;

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white overflow-hidden">
            
            {/* 1. FIXED SIDEBAR WRAPPER */}
            <div className="fixed inset-y-0 left-0 z-50">
                <Sidebar />
            </div>

            {/* 2. SCROLLABLE MAIN CONTENT */}
            {/* Added 'ml-64' (adjust based on your sidebar width) to push content past the fixed sidebar */}
            <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
                
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-indigo-200">Welcome, {storedUser.name}!</h1>
                </header>

                {/* Hero Overall Progress Card */}
                <section className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mb-10 shadow-2xl">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Daily Achievement</p>
                            <h2 className="text-5xl font-black">{overallProgress}%</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{completedCount} of {habits.length} Goals Met</p>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-1000 ease-in-out"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5 hover:bg-white/15 transition-colors">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Habits tracked</p>
                        <h2 className="text-3xl font-bold">{habits.length}</h2>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5 hover:bg-white/15 transition-colors">
                        <p className="text-green-400 text-xs font-bold uppercase mb-1">Perfect Today</p>
                        <h2 className="text-3xl font-bold">{completedCount}</h2>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5 hover:bg-white/15 transition-colors">
                        <p className="text-orange-400 text-xs font-bold uppercase mb-1">Best Streak</p>
                        <h2 className="text-3xl font-bold">
                            {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
                        </h2>
                    </div>
                </div>

                {/* Habit Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                    {habits.map((habit) => {
                        const current = habit.current || 0;
                        const target = habit.target || 1;
                        const percent = Math.round((current / target) * 100);

                        return (
                            <div key={habit.id} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="relative w-16 h-16 shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                                    strokeDasharray={175.9}
                                                    strokeDashoffset={175.9 - (175.9 * percent) / 100}
                                                    strokeLinecap="round"
                                                    className="text-indigo-500 transition-all duration-700" 
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black">
                                                {percent}%
                                            </span>
                                        </div>
                                        <div className="text-right flex-1 ml-4 overflow-hidden">
                                            <h3 className="text-lg font-bold truncate">{habit.title}</h3>
                                            <p className="text-orange-400 text-xs font-bold bg-orange-400/10 inline-block px-2 py-0.5 rounded">🔥 {habit.streak} DAYS</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-8 line-clamp-2 h-10 italic">"{habit.description}"</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold px-1">
                                        <span className="text-indigo-300">UNITS COMPLETED</span>
                                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{current} / {target}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => decrementProgress(habit.id)}
                                                disabled={current === 0}
                                                className="w-12 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white font-bold transition-all disabled:opacity-20"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => incrementProgress(habit.id)}
                                                disabled={current >= target}
                                                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                                                    current >= target 
                                                    ? "bg-green-600/30 text-green-200 cursor-default" 
                                                    : "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                                                }`}
                                            >
                                                {current >= target ? "GOAL ACHIEVED" : "+ ADD PROGRESS"}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingHabit(habit); setIsOpen(true); }} className="flex-1 py-2.5 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Edit</button>
                                            <button onClick={() => deleteHabit(habit.id)} className="flex-1 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Floating Add Habit Button */}
            <button
                onClick={() => { setEditingHabit(null); setIsOpen(true); }}
                className="fixed bottom-8 right-8 bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 shadow-indigo-500/40"
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