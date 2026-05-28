import React from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';

const Dashboard = () => {
  // Grab the logged-in user's details out of the browser memory
  const userName = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('role') || 'Staff';

  const handleLogout = () => {
    localStorage.clear(); // Clear tokens from memory on logout
    window.location.href = '/'; // Redirect back to login screen
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-sans select-none">
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-200/60 p-6 md:p-8 min-h-[500px] flex flex-col justify-between">
        
        {/* Topbar Row */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 pb-5 mb-6 gap-4">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <LayoutDashboard className="w-8 h-8" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">SwineIntel Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Double R Piggery Farm Management System</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-5 py-2.5 rounded-full text-sm font-medium transition-colors text-slate-600 group"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" strokeWidth={2} />
              <span>Log Out</span>
            </button>
          </div>
          
          {/* Welcome Interactive Alert Banner */}
          <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4 text-emerald-800 text-sm">
            👋 Welcome back, <strong className="font-semibold text-emerald-950">{userName}</strong>! You have successfully connected to the system architecture. Your active role clearance level is: <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider ml-1">{role}</span>
          </div>
        </div>

        {/* Bottom Footer Attribution */}
        <div className="text-center text-slate-400 text-xs mt-12 pt-4 border-t border-slate-50">
          SwineIntel Enterprise Infrastructure • Secure Capstone Workspace
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;