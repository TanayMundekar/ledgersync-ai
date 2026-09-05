import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  // CONNECTED TO REAL FASTAPI BACKEND
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // FastAPI OAuth2PasswordRequestForm strictly expects form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Save secure token
        localStorage.setItem('token', data.access_token);
        // Route to dashboard
        navigate('/dashboard');
      } else {
        alert("Login failed: Incorrect email or password.");
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      alert("Unable to connect to the backend server.");
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030509] p-6 font-sans text-slate-300 relative overflow-hidden selection:bg-[#0066FF]/30">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#004BFF]/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0066FF]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/[0.05] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden z-10 relative"
      >
        {/* Top Edge Highlight */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0066FF]/40 to-transparent"></div>

        <div className="p-10 flex flex-col gap-8">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center gap-4">
            <Link to="/" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
              <svg className="w-9 h-10 drop-shadow-[0_0_12px_rgba(0,102,255,0.4)]" viewBox="0 0 269 299" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z" fill="#E0F2FE"/>
                <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z" fill="#004BFF"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-400 mt-1">Sign in to your enterprise workspace.</p>
            </div>
          </div>

          {/* Enterprise SSO Buttons */}
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => alert("SSO integration configured for production deployment.")} className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3.5 text-sm font-bold text-white transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#00A4EF"/>
              </svg>
              Continue with Microsoft
            </button>
            <button type="button" onClick={() => alert("SSO integration configured for production deployment.")} className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl py-3.5 text-sm font-bold text-white transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.05]"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Or email</span>
            <div className="flex-1 h-px bg-white/[0.05]"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Work Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#0066FF] hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:from-[#0066FF] hover:to-[#004BFF] text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] border border-blue-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>

        {/* Bottom Footer Area */}
        <div className="px-10 py-5 border-t border-white/[0.05] bg-black/20 text-center">
          <p className="text-sm font-medium text-slate-400">
            Don't have an enterprise account? <Link to="/onboarding" className="text-white font-bold hover:text-[#0066FF] transition-colors ml-1">Set up workspace</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}