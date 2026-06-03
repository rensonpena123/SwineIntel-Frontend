import React, { useState, useEffect } from 'react';
import API from '../api';
import { ShieldAlert, Plus, RefreshCw, Loader2, Baby, ArrowUpRight, ShoppingBag, HeartCrack, Stethoscope, Search } from 'lucide-react';

const Pigs = () => {
  const [pigs, setPigs] = useState([]);
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Modal Control Triggers
  const [modalType, setModalType] = useState(null); // 'add' | 'farrow' | 'promote' | 'status' | 'sell' | 'mortality'
  const [selectedPig, setSelectedPig] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Reusable Multi-Form Inputs state
  const [formData, setFormData] = useState({
    pigType: 'Fattener', tagId: '', motherId: '', penId: '', breed: '', gender: 'Female', weight: '',
    pigletCount: '', toKuralId: '', targetBartolinaId: '', status: 'Healthy', description: ''
  });

  const userRole = localStorage.getItem('role') || 'Staff';

  const systemSync = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Concurrently query active inventory and pen options 
      const [pigRes, penRes] = await Promise.all([
        API.get('/pigs'),
        API.get('/pens')
      ]);

      setPigs(pigRes.data);
      setPens(penRes.data);
    } catch (err) {
      console.error("Pipeline breakdown:", err);
      setError('Could not pull centralized live animal parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    systemSync();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await API.post('/pigs', { ...formData, weight: formData.weight ? Number(formData.weight) : 0 });
      } else if (modalType === 'farrow') {
        await API.post('/pigs/farrow', {
          motherId: formData.motherId, penId: formData.penId,
          pigletCount: Number(formData.pigletCount), breed: formData.breed
        });
      } else if (modalType === 'promote') {
        await API.put('/pigs/promote', {
          motherId: formData.motherId, toKuralId: formData.toKuralId, targetBartolinaId: formData.targetBartolinaId
        });
      } else if (modalType === 'status') {
        await API.put(`/${selectedPig._id}/status`, { status: formData.status, description: formData.description });
      } else if (modalType === 'sell') {
        await API.put('/pigs/sell', { pigIds: [selectedPig._id] });
      } else if (modalType === 'mortality') {
        await API.put('/pigs/mortality', { pigId: selectedPig._id });
      }

      setModalType(null);
      setSelectedPig(null);
      // Reset defaults
      setFormData({ pigType: 'Fattener', tagId: '', motherId: '', penId: '', breed: '', gender: 'Female', weight: '', pigletCount: '', toKuralId: '', targetBartolinaId: '', status: 'Healthy', description: '' });
      await systemSync();
    } catch (err) {
      alert(err.response?.data?.message || 'Transaction submission error.');
    } finally {
      setFormLoading(false);
    }
  };

  const openFormModal = (type, pig = null) => {
    setSelectedPig(pig);
    setModalType(type);
    if (type === 'status' && pig) {
      setFormData(prev => ({ ...prev, status: pig.status }));
    } else if ((type === 'farrow' || type === 'promote') && pig) {
      setFormData(prev => ({ ...prev, motherId: pig._id }));
    }
  };

  // Live filter maps running dynamically inside local application states
  const filteredPigs = pigs.filter(pig => {
    const matchesSearch = (pig.tagId || '').toLowerCase().includes(search.toLowerCase()) || 
                          (pig.breed || '').toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' ? ['Healthy', 'Sick'].includes(pig.status) : pig.pigType === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading && pigs.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium">Synchronizing enterprise livestock ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Upper Control Bar Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Livestock Registry</h1>
          <p className="text-slate-500 text-sm mt-1">Manage herd lifecycle parameters, execute farrowing events, and monitor medical flags.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={systemSync} className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => openFormModal('promote')} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>Wean & Promote Litter</span>
          </button>
          <button onClick={() => openFormModal('farrow')} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
            <Baby className="w-4 h-4" />
            <span>Log Farrowing Event</span>
          </button>
          <button onClick={() => openFormModal('add')} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Add Single Animal</span>
          </button>
        </div>
      </div>

      {error && <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-medium rounded-xl">{error}</div>}

      {/* Navigation Filtering and Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['All Active', 'Sow', 'Piglet', 'Fattener'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'All Active' ? 'All' : tab)}
              className={`px-4 py-2 rounded-lg transition-all ${
                (activeTab === 'All' && tab === 'All Active') || activeTab === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search Tag ID or Breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Core Animal Data Matrix */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-4">Animal Tag / ID</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Location Pen</th>
                <th className="px-6 py-4">Breed & Weight</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredPigs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No matching livestock instances located inside this branch loop.</td>
                </tr>
              ) : (
                filteredPigs.map((pig) => (
                  <tr key={pig._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 tracking-tight">
                      {pig.tagId || <span className="text-xs text-slate-300 italic font-normal">No Tag (Piglet)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        pig.pigType === 'Sow' ? 'text-purple-700 bg-purple-50' : pig.pigType === 'Piglet' ? 'text-blue-700 bg-blue-50' : 'text-slate-700 bg-slate-100'
                      }`}>{pig.pigType}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {pig.penId?.name ? `${pig.penId.name} (${pig.penId.type})` : <span className="text-red-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      <div>Breed: <span className="text-slate-800 font-bold">{pig.breed || 'N/A'}</span></div>
                      <div className="mt-0.5">Weight: <span className="text-slate-800 font-bold">{pig.weight} kg</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold ${pig.status === 'Sick' ? 'text-red-600' : 'text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pig.status === 'Sick' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        <span>{pig.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button onClick={() => openFormModal('status', pig)} className="p-1.5 border border-slate-200 hover:border-blue-200 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors" title="Diagnostics Status Update"><Stethoscope className="w-4 h-4" /></button>
                      <button onClick={() => openFormModal('mortality', pig)} className="p-1.5 border border-slate-200 hover:border-red-200 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors" title="Log Mortality Incident"><HeartCrack className="w-4 h-4" /></button>
                      {userRole === 'Owner' && (
                        <button onClick={() => openFormModal('sell', pig)} className="p-1.5 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-lg transition-colors" title="Execute Direct Market Sale"><ShoppingBag className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC MASTER LIFECYCLE FORMS MODAL */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
              {modalType === 'add' ? 'Register Animal' : modalType === 'farrow' ? 'Record Farrowing Event' : modalType === 'promote' ? 'Wean & Promote Litter' : `${modalType} System Execution`}
            </h3>
            
            <form onSubmit={handleActionSubmit} className="mt-4 space-y-4">
              
              {/* FORM CONDITION A: ADD SINGLE LIVE ANIMAL */}
              {modalType === 'add' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Classification Type</label>
                      <select value={formData.pigType} onChange={(e) => setFormData({...formData, pigType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="Fattener">Fattener (Grower)</option>
                        <option value="Sow">Sow (Inahin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tag ID / Ear Notch</label>
                    <input type="text" required placeholder="e.g., RR-TAG-05" value={formData.tagId} onChange={(e) => setFormData({...formData, tagId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Breed Breed</label>
                      <input type="text" placeholder="e.g., Landrace" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Initial Weight (kg)</label>
                      <input type="number" placeholder="Weight" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Assign Destination Pen Layout</label>
                    <select required value={formData.penId} onChange={(e) => setFormData({...formData, penId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Choose Target Pen Node --</option>
                      {pens.filter(p => p.currentHeadcount < p.capacity).map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.type} - Space: {p.capacity - p.currentHeadcount})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* FORM CONDITION B: RECORD FARROWING EVENT BIRTHS */}
              {modalType === 'farrow' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Mother Sow</label>
                    <select required value={formData.motherId} onChange={(e) => setFormData({...formData, motherId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Select Farrowing Mother --</option>
                      {pigs.filter(p => p.pigType === 'Sow').map(p => (
                        <option key={p._id} value={p._id}>{p.tagId} [{p.breed || 'No Breed'}]</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Total Piglets Born</label>
                      <input type="number" required min="1" placeholder="Biiks count" value={formData.pigletCount} onChange={(e) => setFormData({...formData, pigletCount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Litter Breed</label>
                      <input type="text" placeholder="Leave blank to inherit" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Destination Nursery Pen</label>
                    <select required value={formData.penId} onChange={(e) => setFormData({...formData, penId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Choose a Paanakan Pen unit --</option>
                      {pens.filter(p => p.type === 'Paanakan').map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Vacancy space: {p.capacity - p.currentHeadcount})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* FORM CONDITION C: PROMOTE LITTER BATCH TO FATTENERS */}
              {modalType === 'promote' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Mother Sow</label>
                    <select required value={formData.motherId} onChange={(e) => setFormData({...formData, motherId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Choose Mother to Wean --</option>
                      {pigs.filter(p => p.pigType === 'Sow').map(p => (
                        <option key={p._id} value={p._id}>{p.tagId} (Sow Line)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Kural Grow-out Pen (For Piglets)</label>
                    <select required value={formData.toKuralId} onChange={(e) => setFormData({...formData, toKuralId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Choose Destination Kural --</option>
                      {pens.filter(p => p.type === 'Kural').map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Space: {p.capacity - p.currentHeadcount})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Bartolina Gestation Pen (For Mother)</label>
                    <select required value={formData.targetBartolinaId} onChange={(e) => setFormData({...formData, targetBartolinaId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Choose Gestation Crate --</option>
                      {pens.filter(p => p.type === 'Bartolina').map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Space: {p.capacity - p.currentHeadcount})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* FORM CONDITION D: DIAGNOSTICS & HEALTH TREATMENT UPDATES */}
              {modalType === 'status' && (
                <>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">Managing parameters for Animal: <span className="font-bold text-slate-800">{selectedPig?.tagId || 'Piglet Item'}</span></p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Condition Parameter</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="Healthy">Healthy (Optimal Parameters)</option>
                      <option value="Sick">Sick (Flag Clinical Incident)</option>
                    </select>
                  </div>
                  {formData.status === 'Sick' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Symptom Diagnostic Remarks / Description</label>
                      <textarea required placeholder="Declare active symptoms or complications clearly..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  )}
                </>
              )}

              {/* FORM CONDITION E & F: SELL BULK CARD / MORTALITY BANNER CONFIRMATIONS */}
              {(modalType === 'sell' || modalType === 'mortality') && (
                <div className="bg-red-50/60 p-4 border border-red-100 rounded-2xl text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-800">Are you completely sure?</p>
                  <p className="text-xs text-slate-500">
                    Executing this choice updates <span className="font-bold text-slate-700">{selectedPig?.tagId || 'the Selected Pig'}</span> to <span className="font-bold text-red-600 uppercase">{modalType === 'sell' ? 'SOLD' : 'DECEASED'}</span> status. This permanently clears it out of active pen capacity arrays.
                  </p>
                </div>
              )}

              {/* Submission CTA Options row */}
              <div className="flex space-x-3 pt-2 text-sm">
                <button type="button" onClick={() => { setModalType(null); setSelectedPig(null); }} className="w-1/2 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className={`w-1/2 py-2.5 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 text-white ${
                  modalType === 'mortality' || modalType === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                  {formLoading ? 'Executing Engine...' : modalType === 'sell' ? 'Confirm Sale' : modalType === 'mortality' ? 'Confirm Incident' : 'Save Parameters'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pigs;