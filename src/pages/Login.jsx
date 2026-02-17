import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext"; // Import context

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login } = useContext(AuthContext); // Use the login function
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (
      storedUser &&
      storedUser.email === email &&
      storedUser.password === password
    ) {
      // 1. Update global Auth State
      login(storedUser);
      
      // 2. Alert user
      alert("Login successful!");
      
      // 3. Navigate to dashboard
      navigate("/dashboard");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-[400px]"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg bg-white/20 outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold transition"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?
          <Link to="/signup" className="text-indigo-400 ml-1">
            Signup
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;