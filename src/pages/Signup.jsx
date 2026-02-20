import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setIsLoading(true);

    // Artificial delay for better UX/Loader visibility
    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        fullName,
        email,
        password,
      };

      const existingUsers = JSON.parse(localStorage.getItem("allUsers")) || [];

      if (existingUsers.some((u) => u.email === email)) {
        alert("This email is already registered!");
        setIsLoading(false);
        return;
      }

      existingUsers.push(newUser);
      localStorage.setItem("allUsers", JSON.stringify(existingUsers));

      setIsLoading(false);
      alert("Signup successful! Please login.");
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-[400px] border border-white/10"
      >
        <h2 className="text-3xl font-bold mb-2 text-center">Create Account</h2>
        <p className="text-indigo-200/60 text-center mb-8 text-sm">Join us for a healthier lifestyle</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 transition-all disabled:opacity-50"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 transition-all disabled:opacity-50"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 mb-2 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 transition-all disabled:opacity-50"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold transition-all flex items-center justify-center min-h-[50px] shadow-lg shadow-indigo-500/20"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Creating Account...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Signup
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?
          <Link to="/login" className="text-indigo-400 ml-1 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;