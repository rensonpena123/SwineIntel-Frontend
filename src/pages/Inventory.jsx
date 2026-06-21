import React, { useState, useEffect } from 'react';
import API from '../api';
import { Database, Plus, Minus, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

const Inventory = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ feedType: '', currentSacks: '', lowStockThreshold: '5' });
  const [formLoading, setFormLoading] = useState(false);

  // 1. FETCH LIVE INVENTORY FROM MONGO
  const fetchInventory = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await API.get('/feed');
        // Adapts smoothly if backend returns an array directly or nested inside an object
        setFeeds(Array.isArray(response.data) ? response.data : response.data.feeds || []);
      } catch (err) {
        console.error("Inventory fetch failure:", err);
        setError('Could not retrieve feed logs from the central server.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchInventory();
    }, []);

    // LOG NEW SHIPMENT SUBMISSION (Restock Modal Form)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      const payload = {
        feedType: formData.feedType,
        sacksAdded: Number(formData.currentSacks), 
        customThreshold: Number(formData.lowStockThreshold) 
      };
      
      await API.post('/feed/restock', payload);
      
      setIsModalOpen(false);
      setFormData({ feedType: '', currentSacks: '', lowStockThreshold: '5' });
      fetchInventory(); // Reload table data with fresh counts
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stock registry.');
    } finally {
      setFormLoading(false);
    }
  };

  // FAST ADJUSTMENT MACRO (Quick Plus and Minus Buttons)
  const handleQuickAdjust = async (item, amount) => {
    try {
      if (amount === 1) {
        await API.post('/feed/restock', {
          feedType: item.feedType,
          sacksAdded: 1 
        });
      } else if (amount === -1) {
        if (item.currentSacks <= 0) return alert("Stock cannot drop below 0 sacks.");
        
        // Look at your backend: withdraw expects 'sacksWithdrawn'
        await API.put('/feed/withdraw', {
          feedType: item.feedType,
          sacksWithdrawn: 1 
        });
      }
      
      fetchInventory(); // Refresh the screen metrics
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failure with bodega server.');
      fetchInventory();
    }
  };


  if (loading && feeds.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium">Loading bodega stock ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Header Panel Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Piggery Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage feed variants, track threshold safety limits, and log feed adjustments.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchInventory}
            className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-medium rounded-xl flex items-center space-x-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Database Table Container */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-4">Feed Classification Type</th>
                <th className="px-6 py-4">Current Stock Level</th>
                <th className="px-6 py-4">Safety Status</th>
                <th className="px-6 py-4 text-right">Quick Stock Modifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {feeds.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">
                    No item inventory records discovered inside this storage node.
                  </td>
                </tr>
              ) : (
                feeds.map((item) => {
                  // Uses your schema properties 'currentSacks' and 'lowStockThreshold'
                  const isLow = item.currentSacks <= (item.lowStockThreshold || 5);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name Column */}
                      <td className="px-6 py-4 font-semibold text-slate-800 flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                          <Database className="w-4 h-4" />
                        </div>
                        <span>{item.feedType}</span>
                      </td>
                      
                      {/* Quantity Column */}
                      <td className="px-6 py-4 font-bold text-base text-slate-900">
                        {item.currentSacks} <span className="text-xs font-normal text-slate-400">sacks</span>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4">
                        {isLow ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Low Stock Alert</span>
                        </span>
                        ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100">
                            Optimal Supply
                        </span>
                        )}
                      </td>
                      
                      {/* Interactive Controls Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            className="p-1.5 text-slate-500 hover:text-red-600 border border-slate-200 bg-white rounded-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 border border-slate-200 bg-white rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DRAWER FORM ENTRY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 transform scale-100 transition-all">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Add Stock Registry</h3>
            <p className="text-xs text-slate-400 mt-1">Declare a new feed batch allocation inside the storage schemas.</p>
            
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Feed Type Classification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Breeder, Pre-Starter, Starter, Grower"
                  value={formData.feedType}
                  onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Sacks</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Sacks count"
                    value={formData.currentSacks}
                    onChange={(e) => setFormData({ ...formData, currentSacks: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Low Threshold</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Alert tier"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
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
                  {formLoading ? 'Saving...' : 'Confirm Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;