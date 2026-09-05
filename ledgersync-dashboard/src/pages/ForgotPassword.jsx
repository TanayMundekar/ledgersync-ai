import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to the backend to generate the magic link
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
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
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Enter the email address associated with your workspace and we'll send you a secure reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !email}
                    className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:from-[#0066FF] hover:to-[#004BFF] text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] border border-blue-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-6 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    We've sent a secure password reset link to <br/>
                    <span className="font-bold text-white">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Didn't receive it? <button onClick={() => setIsSubmitted(false)} className="text-[#0066FF] hover:text-white transition-colors font-bold">Click to try again</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Footer Area */}
        <div className="px-10 py-5 border-t border-white/[0.05] bg-black/20 text-center">
          <p className="text-sm font-medium text-slate-400">
            Remembered your password? <Link to="/login" className="text-white font-bold hover:text-[#0066FF] transition-colors ml-1">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}