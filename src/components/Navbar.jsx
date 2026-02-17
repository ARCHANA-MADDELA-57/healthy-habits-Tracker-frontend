const Navbar = () => {
    return (
      <div className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold tracking-wide">
          HealthyHabits
        </h1>
  
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-300">Welcome, Archana</span>
  
          <button className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </div>
    );
  };
  
  export default Navbar;
  