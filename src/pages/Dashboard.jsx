import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddHabitModal from "../components/AddHabitModal";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

  const [quote, setQuote] = useState({
    text: "Loading inspiration...",
    author: "",
  });

  useEffect(() => {
    fetch("https://type.fit/api/quotes")
      .then((res) => res.json())
      .then((data) => {
        const randomQuote = data[Math.floor(Math.random() * 20)]; // Get one of the top 20
        setQuote({
          text: randomQuote.text,
          author: randomQuote.author.split(",")[0],
        });
      })
      .catch(() =>
        setQuote({
          text: "Start where you are.",
          author: "Arthur Ashe",
        })
      );
  }, []);

  useEffect(() => {
    console.log("Storage Data:", storedUser);
  }, [storedUser]);

  const userName =
    storedUser?.name ||
    storedUser?.username ||
    storedUser?.email?.split("@")[0] ||
    "User";
  const userKey = storedUser ? `habits_${storedUser.email}` : null;

  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (userKey) {
      const storedHabits = JSON.parse(localStorage.getItem(userKey)) || [];
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem(`${userKey}_lastVisit`);

      // If it's a new day, reset daily progress but keep the streak logic
      if (lastVisit !== today) {
        const resetHabits = storedHabits.map((h) => ({
          ...h,
          current: 0,
          completedToday: false,
        }));
        setHabits(resetHabits);
        localStorage.setItem(`${userKey}_lastVisit`, today);
      } else {
        setHabits(storedHabits);
      }
      setIsDataLoaded(true);
    }
  }, [userKey]);

  useEffect(() => {
    if (isDataLoaded && userKey) {
      localStorage.setItem(userKey, JSON.stringify(habits));
    }
  }, [habits, userKey, isDataLoaded]);

  if (!isLoggedIn || !storedUser)
    return (
      <div className="h-screen bg-[#1a164d] flex items-center justify-center text-white">
        Please Login.
      </div>
    );

  const addHabit = (title, description, target, category) => {
    const newHabit = {
      id: Date.now(),
      title,
      description,
      target: parseInt(target) || 1,
      category: category || "General",
      current: 0,
      streak: 0,
      completedToday: false,
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id, title, description, target, category) => {
    setHabits(
      habits.map((h) =>
        h.id === id
          ? { ...h, title, description, target: parseInt(target), category }
          : h
      )
    );
  };

  const incrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextVal = Math.min((h.current || 0) + 1, h.target);
          const isDone = nextVal >= h.target;
          return {
            ...h,
            current: nextVal,
            streak: isDone && !h.completedToday ? h.streak + 1 : h.streak,
            completedToday: isDone,
          };
        }
        return h;
      })
    );
  };

  const decrementProgress = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              current: Math.max(0, (h.current || 0) - 1),
              completedToday: false,
            }
          : h
      )
    );
  };

  const perfectedToday = habits.filter((h) => h.current >= h.target).length;
  const totalProgressArray = habits.map(
    (h) => (h.current || 0) / (h.target || 1)
  );
  const overallProgress =
    habits.length > 0
      ? Math.round(
          (totalProgressArray.reduce((a, b) => a + b, 0) / habits.length) * 100
        )
      : 0;

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const chartData = {
    labels: habits.map((h) => h.title),
    datasets: [
      {
        label: "Completion %",
        data: habits.map((h) => ((h.current || 0) / (h.target || 1)) * 100),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#1a164d] via-[#2e1065] to-black text-white overflow-hidden">
      {/* Sidebar: Responsive - Hidden on small, shown on md+ */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area: Scrollable */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-10 custom-scrollbar">
        {/* Header Section */}
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">
              Welcome,{" "}
              <span className="text-indigo-400 capitalize">{userName}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Ready to crush your goals today?
            </p>
          </div>

          {/* Highlighter Quote Box */}
          <div className="md:max-w-[300px] text-right">
            <div className="inline-block bg-indigo-500/10 border-r-4 border-indigo-500 p-3 rounded-l-xl backdrop-blur-sm">
              <p className="text-[11px] md:text-xs italic text-indigo-200 leading-relaxed">
                <span className="bg-indigo-500/20 px-1 text-white not-italic font-bold mr-1 italic">
                  "
                </span>
                {quote.text}
                <span className="bg-indigo-500/20 px-1 text-white not-italic font-bold ml-1 italic">
                  "
                </span>
              </p>
              {quote.author && (
                <p className="text-[9px] text-indigo-400 font-black uppercase mt-1 tracking-widest">
                  — {quote.author}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Sleek Progress Header */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">
                Daily Momentum
              </h2>
              <p className="text-gray-400 text-xs">
                You've completed{" "}
                <span className="text-white font-bold">{perfectedToday}</span>{" "}
                out of{" "}
                <span className="text-white font-bold">{habits.length}</span>{" "}
                habits
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white">
                {overallProgress}%
              </span>
            </div>
          </div>

          {/* Slim Progress Bar */}
          <div className="relative w-full bg-black/40 h-2 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats Grid (Responsive 1-3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">
              Total
            </p>
            <h3 className="text-2xl font-black">{habits.length}</h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-green-400 text-[9px] font-bold uppercase mb-1">
              Perfect
            </p>
            <h3 className="text-2xl font-black text-green-400">
              {perfectedToday}
            </h3>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-orange-400 text-[9px] font-bold uppercase mb-1">
              Best Streak
            </p>
            <h3 className="text-2xl font-black text-orange-400">
              {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0}
            </h3>
          </div>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            Habit Comparison
          </h3>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>

        {/* Habit Cards Grid: Responsive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {habits.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/20">
              <p className="text-gray-400">
                No habits added yet. Click the + button to start your journey!
              </p>
            </div>
          )}
          {habits.map((habit) => {
            const percent = Math.round(
              ((habit.current || 0) / (habit.target || 1)) * 100
            );
            const safePercent = isNaN(percent) ? 0 : percent;

            return (
              <div
                key={habit.id}
                className={`p-6 rounded-[2rem] border transition-all shadow-xl flex flex-col justify-between backdrop-blur-md 
                    ${
                      habit.completedToday
                        ? "bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/10"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-white/5"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="#4f46e5"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={150.8}
                          strokeDashoffset={150.8 - (150.8 * safePercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {safePercent}%
                      </span>
                    </div>
                    <div className="text-right flex-1 ml-4">
                      <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase">
                        {habit.category}
                      </span>
                      <h3
                        className={`text-lg font-bold truncate mt-1 ${
                          habit.completedToday
                            ? "line-through text-indigo-400/50"
                            : "text-white"
                        }`}
                      >
                        {habit.title} {habit.completedToday && "✓"}
                      </h3>
                      <p className="text-orange-400 text-[10px] font-bold">
                        🔥 {habit.streak} DAYS
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-8 line-clamp-2 italic">
                    "{habit.description}"
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-white">
                      {habit.current} / {habit.target}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => decrementProgress(habit.id)}
                        className="w-12 py-3 rounded-xl bg-white/5 hover:bg-white/10"
                      >
                        -
                      </button>
                      <button
                        onClick={() => incrementProgress(habit.id)}
                        disabled={habit.completedToday}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all
        ${
          habit.completedToday
            ? "bg-green-500/20 text-green-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
                      >
                        {habit.completedToday
                          ? "Goal Reached ✓"
                          : "+ Log Progress"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingHabit(habit);
                          setIsOpen(true);
                        }}
                        className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete?"))
                            setHabits(habits.filter((h) => h.id !== habit.id));
                        }}
                        className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20"
                      >
                        Delete
                      </button>
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
        onClick={() => {
          setEditingHabit(null);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-indigo-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all"
      >
        +
      </button>

      <AddHabitModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingHabit(null);
        }}
        onAdd={addHabit}
        onUpdate={updateHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
};

export default Dashboard;
