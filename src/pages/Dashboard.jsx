import React, { useState, useEffect } from 'react';
import API from '../api';
import { PiggyBank, Activity, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const userName = localStorage.getItem('userName') || 'User';
  
  // State configured to map exactly to your nested controller response keys
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Hits your exact GET /api/dashboard path
        const response = await API.get('/dashboard'); 
        setData(response.data);
      } catch (err) {
        console.error("Dashboard engine catch error:", err);
        setError('Unable to synchronize with local farm runtime parameters.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium">Aggregating real-time database parameters...</p>
      </div>
    );
  }

  // Fallback defaults in case values return empty
  const livestock = data?.livestock || { totalActive: 0, sows: 0, piglets: 0, fatteners: 0 };
  const pens = data?.pens || { totalPens: 0, bartolina: { total: 0, available: 0 }, paanakan: { total: 0, available: 0 }, kural: { total: 0, available: 0 } };
  const monthlyMetrics = data?.monthlyMetrics || { pigsSoldThisMonth: 0, mortalitiesThisMonth: 0 };

  // 1. Dynamic Summary Cards mapping real data keys
  const cards = [
    { title: 'Total Active Herd', value: `${livestock.totalActive} head`, subtext: `Sows: ${livestock.sows} | Fatteners: ${livestock.fatteners}`, icon: PiggyBank, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Pigs Sold (Month)', value: `${monthlyMetrics.pigsSoldThisMonth} head`, subtext: 'Current calendar month', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { title: 'Infrastructure Usage', value: `${pens.totalPens} total pens`, subtext: 'Active localized structures', icon: Activity, color: 'text-amber-600 bg-amber-50' },
    { title: 'Monthly Mortalities', value: `${monthlyMetrics.mortalitiesThisMonth} head`, subtext: 'Deceased parameter tracker', icon: ShieldAlert, color: monthlyMetrics.mortalitiesThisMonth > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-100' },
  ];

  // Helper macro to calculate safe width percentage loops for pen utility stats
  const calculateUsagePercent = (total, available) => {
    if (!total) return 0;
    const occupied = total - available;
    return Math.min(Math.round((occupied / total) * 100), 100);
  };

  const penCategories = [
    { name: 'Bartolina Pen Group', stats: pens.bartolina },
    { name: 'Paanakan Breeding / Farrowing Group', stats: pens.paanakan },
    { name: 'Kural Grow-out Group', stats: pens.kural },
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Top Welcome Title Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-slate-500 text-sm mt-1">Live metrics compiled from the Double R Piggery production databases.</p>
        </div>
        {error && (
          <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            ⚠️ Node Sync Error: {error}
          </div>
        )}
      </div>

      {/* 4 Core Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-xl shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5 truncate">{card.value}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower Dashboard Splits: Left Livestock Subtally • Right Pen Capacities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Core Subtotals Box (Takes 1 Column) */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Livestock Subtotals</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Sows / Breeding Matrix</span>
                <span className="text-sm font-bold text-slate-800">{livestock.sows} head</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Piglets / Nursery</span>
                <span className="text-sm font-bold text-slate-800">{livestock.piglets} head</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-600">Fatteners / Grow-out</span>
                <span className="text-sm font-bold text-slate-800">{livestock.fatteners} head</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-4 text-center">
            * Filters out deceased and successfully sold entities.
          </div>
        </div>

        {/* Right Active Pen Infrastructure Tracker (Takes 2 Columns) */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Infrastructure Utilization Summary</h3>
          <div className="space-y-5">
            {penCategories.map((category) => {
              const usagePercent = calculateUsagePercent(category.stats.total, category.stats.available);
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{category.name}</span>
                    <span className="text-slate-500 font-medium">
                      {category.stats.total - category.stats.available} / {category.stats.total} Occupied ({usagePercent}%)
                    </span>
                  </div>
                  {/* Tailwind Progress Tracker Bar line container */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>{category.stats.available} pens currently have vacancies</span>
                    <span>Max Limit capacity tracking active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;