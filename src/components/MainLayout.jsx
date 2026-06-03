import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* Permanent Structural Sidebar Element */}
      <Sidebar />

      {/* Dynamic Screen View Injection Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {/* React Router Outlet acts as a window where pages swap out */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;