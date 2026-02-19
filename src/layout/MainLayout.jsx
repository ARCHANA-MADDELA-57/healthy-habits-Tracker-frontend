import Sidebar from "../components/Sidebar"; 

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex">
      {/* 1. Sidebar remains fixed inside this container */}
      <Sidebar />

      {/* 2. ml-64 pushes content to the right so it doesn't go under the fixed sidebar */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;