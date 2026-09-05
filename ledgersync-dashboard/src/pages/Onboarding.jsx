import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedERP, setSelectedERP] = useState(null);
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Admin');

  // NEW: State for backend registration
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  // NEW: Full Backend Registration and Auto-Login Logic
  const handleRegisterAndComplete = async () => {
    if (!email || !password) {
      alert("Please provide an Admin Email and Password in Step 1 to create your account.");
      setStep(1);
      return;
    }

    setIsRegistering(true);
    try {
      // 1. Register the User
      const regResponse = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          password: password, 
          role: "admin" 
        })
      });

      if (regResponse.ok) {
        // 2. Automatically Log Them In
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const loginRes = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem('token', loginData.access_token);
          // 3. Redirect to Dashboard
          navigate('/dashboard');
        } else {
          alert("Registration successful, but auto-login failed. Redirecting...");
          navigate('/dashboard');
        }
      } else {
        const errorData = await regResponse.json();
        alert(`Registration failed: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to connect to the backend server.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030509] p-6 font-sans text-slate-300 relative overflow-hidden selection:bg-[#0066FF]/30">
      
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#004BFF]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0066FF]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8 z-10"
      >
        <svg className="w-10 h-11 drop-shadow-[0_0_8px_rgba(0,102,255,0.2)]" viewBox="0 0 269 299" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z" fill="#E0F2FE"/>
          <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z" fill="#004BFF"/>
        </svg>
        <span className="text-2xl font-bold text-white tracking-tight">LedgerSync AI</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-[#0B0F19]/60 backdrop-blur-2xl border border-white/[0.05] rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,102,255,0.05)] overflow-visible z-10 relative"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0066FF]/30 to-transparent"></div>

        <div className="px-10 pt-10 pb-6 border-b border-white/[0.05]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Setup your Workspace</h1>
            <span className="text-sm font-medium text-[#0066FF] bg-[#0066FF]/10 px-3 py-1 rounded-full border border-[#0066FF]/20">
              Step {step} of 3
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-[#004BFF] to-[#0066FF]' : 'bg-white/10'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-[#004BFF] to-[#0066FF]' : 'bg-white/10'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-gradient-to-r from-[#004BFF] to-[#0066FF]' : 'bg-white/10'}`}></div>
          </div>
        </div>

        <div className="p-10 min-h-[420px] relative">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Company & Account Details</h2>
                  <p className="text-sm text-slate-400 font-medium">Configure your ledger and create your admin account.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Legal Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp Ltd." className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-300 mb-2 uppercase tracking-wide">GSTIN / Tax ID</label>
                    <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Admin Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@company.com" required className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-300 mb-2 uppercase tracking-wide">Admin Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Connect your Data</h2>
                  <p className="text-sm text-slate-400 font-medium">Select your primary accounting software to sync invoices.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['Tally Prime', 'SAP ERP', 'QuickBooks', 'Oracle NetSuite'].map((erp) => (
                    <button 
                      key={erp}
                      onClick={() => setSelectedERP(erp)}
                      className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        selectedERP === erp 
                          ? 'bg-[#0066FF]/10 border-[#0066FF]/40 text-white shadow-[0_4px_15px_rgba(0,102,255,0.1)]' 
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${selectedERP === erp ? 'bg-gradient-to-br from-[#004BFF] to-[#0066FF] text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        {erp.charAt(0)}
                      </div>
                      <span className="text-sm font-bold">{erp}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6 relative">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Invite your Team</h2>
                  <p className="text-sm text-slate-400 font-medium">Assign roles to control who can approve or flag reconciliations.</p>
                </div>
                
                <div className="flex gap-3 items-start relative z-20">
                  <div className="flex-1">
                    <input type="email" placeholder="colleague@company.com" className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all placeholder:text-slate-600" />
                  </div>
                  
                  <div className="w-40 relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full bg-white/[0.02] border ${isDropdownOpen ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-white/10'} rounded-xl py-3.5 px-4 text-sm text-white flex justify-between items-center transition-all focus:outline-none`}
                    >
                      <span>{selectedRole}</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#0066FF]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-full bg-[#131C2D]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                        >
                          {['Admin', 'Editor', 'Viewer'].map((role) => (
                            <div 
                              key={role}
                              onClick={() => {
                                setSelectedRole(role);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-4 py-3 text-sm cursor-pointer transition-colors ${selectedRole === role ? 'bg-[#0066FF] text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                              {role}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-bold rounded-xl transition-all">
                    Add
                  </button>
                </div>

                <div className="mt-2 border border-white/[0.05] rounded-xl bg-white/[0.02] divide-y divide-white/[0.05] relative z-10">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-sm font-medium text-slate-300">finance@acmecorp.com</span>
                    <span className="text-[10px] font-bold px-3 py-1.5 bg-[#0066FF]/10 text-[#0066FF] rounded-lg border border-[#0066FF]/20 uppercase tracking-wider">Admin</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="px-10 py-6 border-t border-white/[0.05] bg-black/20 flex justify-between items-center relative z-0">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isRegistering}
            className={`px-6 py-3 text-sm font-bold rounded-xl transition-all ${step === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'}`}
          >
            Back
          </button>
          
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleRegisterAndComplete()}
            disabled={isRegistering}
            className="px-8 py-3 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(0,102,255,0.25)] border border-blue-400/20 transition-transform flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isRegistering && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            {step === 3 ? (isRegistering ? 'Creating Account...' : 'Complete Setup') : 'Continue'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}