import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; 
import { Mail, Eye, EyeOff, PiggyBank } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      const fullName = `${response.data.firstName} ${response.data.lastName}`;
      localStorage.setItem('userName', fullName);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans select-none">
      
      {/* Main Container Card */}
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row p-4 md:p-6 min-h-[600px]">
        
        {/* LEFT SIDE: Login Form Interaction Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-8">
          
          {/* Header Identity Icon & Text */}
          <div className="flex flex-col items-center text-center mb-8 w-full">
            <div className="text-slate-800 mb-2 p-1">
              <PiggyBank className="w-10 h-10 text-slate-800" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter your details.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5 text-slate-400" strokeWidth={2} />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              />
              {/* Clickable Eye Icon to reveal password */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Eye className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>

            {/* Settings Row */}
            <div className="flex items-center justify-end text-xs text-slate-500 px-1">
              <button type="button" className="hover:text-emerald-600 transition-colors font-medium">Forgot password?</button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Verifying Account...' : 'Login'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">or</span>
          </div>

          {/* OAuth Buttons */}
          <div className="flex justify-center items-center space-x-4">
            <button type="button" className="px-4 py-2 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Google</button>
            <button type="button" className="px-4 py-2 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Facebook</button>
          </div>

        </div>

        {/* RIGHT SIDE: Emerald Gradient Graphic Grid */}
        <div className="w-full md:w-1/2 hidden md:block rounded-[32px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-950"></div>
          <div className="absolute inset-0 mix-blend-multiply opacity-40 bg-radial-gradient from-white/20 to-transparent blur-xl pointer-events-none transform scale-125"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-emerald-300/30 mix-blend-screen blur-2xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-800/40 mix-blend-color-burn blur-3xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-[32px] pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
};

export default Login;