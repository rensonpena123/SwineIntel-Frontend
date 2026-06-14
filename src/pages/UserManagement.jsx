import React, { useState, useEffect } from 'react';
import API from '../api';
import { Users, UserPlus, Shield, Mail, Loader2, RefreshCw, Key } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creation Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [formLoading, setFormLoading] = useState(false);

  const currentUserRole = localStorage.getItem('role') || 'Staff';

  const fetchUsers = async () => {
  try {
    setLoading(true);
    setError('');

    const response = await API.get('/users'); 
    
    setUsers(response.data);
  } catch (err) {
    console.error("Failed to load user accounts:", err);
    setError('Could not retrieve user access records from the central server.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    // Security Guard: Prevent non-owners from initializing fetches
    if (currentUserRole === 'Owner') {
      fetchUsers();
    }
  }, [currentUserRole]);

  const handleRegisterUser = async (e) => {
  e.preventDefault();
  setFormLoading(true);
    try {

        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || 'Worker';
        const lastName = nameParts.slice(1).join(' ') || 'Staff';

        const payload = {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase()
            };


        await API.post('/users/register', payload); 
        
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'Staff' });
        fetchUsers(); // Instantly reload list to show the new card
    } catch (err) {
        alert(err.response?.data?.message || 'Error creating new employee profile.');
    } finally {
        setFormLoading(false);
    }
    };

  // UI Security Gate: If a user somehow types the URL manually without clearance
  if (currentUserRole !== 'Owner') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-2xl p-8 text-center">
        <Shield className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">
          Only users registered with Owner clearances are permitted to view or alter system account privileges.
        </p>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium">Retrieving active farm worker profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Upper Control Bar Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review system authorization logs, configure employee roles, and register farm hand accounts.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchUsers}
            className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Refresh Users List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            <span>Register New Account</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-medium rounded-xl">
          ⚠️ Connection Warning: {error}
        </div>
      )}

      {/* Main Users Database Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400 font-medium">
            No registered farm employee profiles discovered.
          </div>
        ) : (
          users.map((account) => (
            <div key={account._id} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Profile Heading Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base tracking-tight">
                        {account.firstName} {account.lastName}
                     </h3>
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 ${
                        account.role === 'owner' 
                            ? 'text-purple-700 bg-purple-50 border border-purple-100' 
                            : 'text-blue-700 bg-blue-50 border border-blue-100'
                        }`}>
                        {account.role}
                     </span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-2 border-t border-slate-50 pt-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {/* Display user email as clean static text to guarantee no formatting breakage */}
                    <span className="truncate font-medium">{account.email}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Identifier Tag */}
              <div className="text-[10px] text-slate-300 font-normal mt-4 pt-2 border-t border-slate-100 text-right">
                SYSTEM UID: {account._id.slice(-8).toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* REGISTRATION FORM MODAL LAYOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 transform scale-100 transition-all">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Register System Account</h3>
            <p className="text-xs text-slate-400 mt-1">Provision login access and access scopes for a fresh farm team member.</p>
            
            <form onSubmit={handleRegisterUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ray Bakal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Access Authorization Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="Staff">Staff (Caretaker View)</option>
                    <option value="Owner">Owner (Full Permissions)</option>
                  </select>
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
                  {formLoading ? 'Provisioning...' : 'Create Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;