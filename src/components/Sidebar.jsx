import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Activity, 
  Users, 
  LogOut, 
  PiggyBank,
  LayoutGrid 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role') || 'Staff';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory / Feeds', path: '/inventory', icon: Database },
    { name: 'Live Pens Layout', path: '/pens', icon: LayoutGrid },
    { name: 'Health & Livestock', path: '/health', icon: Activity },
    // Only show User Management if the logged-in account is an OWNER
    ...(userRole === 'Owner' ? [{ name: 'User Management', path: '/users', icon: Users }] : []),
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
      <div>
        {/* Brand System Identity Header */}
        <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="p-2 bg-emerald-600 rounded-xl text-white">
            <PiggyBank className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SwineIntel</h1>
            <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">{userRole}</span>
          </div>
        </div>

        {/* Navigation Mapping */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={2} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Logout Control Base */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all group"
      >
        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" strokeWidth={2} />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;