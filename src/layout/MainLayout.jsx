import Sidebar from "../components/Sidebar"; 

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {/* 1. Sidebar Container: Fixed position keeps it pinned to the screen */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-50">
        <Sidebar />
      </div>

      {/* 2. Main Area: 
          - ml-64 prevents content from hiding behind the fixed sidebar.
          - w-full ensures it takes up the remaining width.
      */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 w-full">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;