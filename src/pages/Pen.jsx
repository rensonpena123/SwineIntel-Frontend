import React, { useState, useEffect } from 'react';
import API from '../api';
import { LayoutGrid, Plus, Loader2, RefreshCw, Layers } from 'lucide-react';

const Pens = () => {
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form States (Visible only if user role allows)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Kural', capacity: '' });
  const [formLoading, setFormLoading] = useState(false);
  
  const userRole = localStorage.getItem('role') || 'Staff';

  const fetchPens = async () => {
    try {
      setLoading(true);
      setError('');
      // Hits your exact GET /api/pens route
      const response = await API.get('/pens');
      setPens(response.data);
    } catch (err) {
      console.error("Failed to fetch farm infrastructure:", err);
      setError('Could not retrieve infrastructure data parameters from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPens();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload = {
        name: formData.name,
        type: formData.type,
        // Send blank or custom number; your backend hook automatically manages fallbacks!
        capacity: formData.capacity ? Number(formData.capacity) : undefined
      };

      await API.post('/pens', payload);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'Kural', capacity: '' });
      fetchPens(); // Refresh live workspace cards
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating a new pen entry.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && pens.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium">Mapping active barn infrastructure layouts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Upper Layout Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pens & Infrastructure</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor real-time space parameters, structural utilization limits, and grouping modules.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchPens}
            className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Refresh Framework"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          {/* Only render creation actions if user clearance levels match ownerOnly restrictions */}
          {userRole === 'Owner' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Register New Pen</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-medium rounded-xl">
          ⚠️ Connection Warning: {error}
        </div>
      )}

      {/* Main Structural Visual Grid Layout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pens.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400 font-medium">
            No registered farm pens found. Click "Register New Pen" to create your first structure block.
          </div>
        ) : (
          pens.map((pen) => {
            const headcount = pen.currentHeadcount || 0;
            const limit = pen.capacity || 1;
            const usagePercent = Math.min(Math.round((headcount / limit) * 100), 100);

            // Conditional layout badge configurations
            const progressColor = usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
            const statusText = usagePercent >= 100 ? 'At Max Capacity' : `${limit - headcount} Vacancies Left`;

            return (
              <div key={pen._id} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  {/* Top Heading Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base tracking-tight">{pen.name}</h3>
                        <span className="inline-block text-[11px] font-bold text-emerald-600 uppercase tracking-wide mt-0.5">{pen.type} unit</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      usagePercent >= 100 ? 'text-red-700 bg-red-50 border border-red-100' : 'text-slate-500 bg-slate-50 border border-slate-200/60'
                    }`}>
                      {usagePercent}% Full
                    </span>
                  </div>

                  {/* Quantitative Metrics Row */}
                  <div className="mt-4 flex justify-between items-baseline">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Headcount</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-800">{headcount}</span>
                      <span className="text-slate-400 text-xs font-semibold ml-1">/ {limit} pigs</span>
                    </div>
                  </div>

                  {/* Tailwind Utility Management Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Descriptive Badge */}
                <div className="border-t border-slate-100 pt-3 mt-4 text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <span>{statusText}</span>
                  <span className="text-[10px] text-slate-300 font-normal">ID: {pen._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DRAWER FORM FOR OWNERS ONLY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 transform scale-100 transition-all">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Register Structural Pen</h3>
            <p className="text-xs text-slate-400 mt-1">Configure a localized infrastructure unit within the production map modules.</p>
            
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pen Designation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pen #12, Gestation Stall A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Structural Classification Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="Kural">Kural (Grow-out / Default: 15 Max)</option>
                  <option value="Paanakan">Paanakan (Farrowing & Nursery / Default: 25 Max)</option>
                  <option value="Bartolina">Bartolina (Gestating Stall / Default: 1 Max)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Custom Max Headcount Limit <span className="text-slate-300 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave blank to use model standard rules"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2 text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50"
                >
                  {formLoading ? 'Building...' : 'Confirm Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pens;