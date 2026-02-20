import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success'

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus("loading");

    setTimeout(() => {
      const allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];
      const userMatch = allUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (userMatch) {
        localStorage.setItem("registeredUser", JSON.stringify(userMatch));
        login(userMatch);
        
        // Switch to Success State
        setStatus("success");

        // Redirect after a short delay so they can see the success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setStatus("idle");
        alert("Invalid credentials!");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-[400px] border border-white/10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status !== "idle"}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 transition-all disabled:opacity-50"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status !== "idle"}
            className="w-full p-3 mb-2 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-indigo-400 transition-all disabled:opacity-50"
            required
          />

          <button
            type="submit"
            disabled={status !== "idle"}
            className={`relative w-full p-3 rounded-lg font-semibold transition-all flex items-center justify-center min-h-[50px] shadow-lg ${
              status === "success" ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Authenticating...</span>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Login Successful!</span>
                </motion.div>
              )}

              {status === "idle" && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Login
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400">
          Don’t have an account?
          <Link to="/signup" className="text-indigo-400 ml-1 hover:underline">Signup</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;