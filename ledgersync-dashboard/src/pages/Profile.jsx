import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState(null); 
  const [activeSettingsTab, setActiveSettingsTab] = useState('My Profile');
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  
  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // --- DYNAMIC USER DATA FROM JWT ---
  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('admin@company.com');
  const [userRole, setUserRole] = useState('Workspace Admin');
  const [initials, setInitials] = useState('AD');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        if (payload.sub) {
          setUserEmail(payload.sub);
          const namePart = payload.sub.split('@')[0];
          setUserName(namePart);
          setInitials(namePart.substring(0, 2).toUpperCase());
        }
        if (payload.role) setUserRole(payload.role);
      } catch (e) {
        console.error("Could not parse user token", e);
      }
    }
  }, []);

  const settingsTabs = ['My Profile', 'Workspace Details', 'Team & RBAC', 'ERP Integrations', 'Security & Audit'];

  // --- INTERACTIVE UI STATES FOR DEMO ---
  
  // Profile Toggles
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Workspace Form
  const [workspaceName, setWorkspaceName] = useState('Acme Corp Ltd.');
  const [workspaceGstin, setWorkspaceGstin] = useState('22AAAAA0000A1Z5');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);

  // Security Toggles
  const [ssoEnabled, setSsoEnabled] = useState(true);

  // ERP Integration States
  const [sapStatus, setSapStatus] = useState('Connected'); // 'Connected' or 'Disconnected'
  const [tallyStatus, setTallyStatus] = useState('Disconnected');

  // Dynamic Team Data
  const teamMembers = [
    { name: userName, email: userEmail, role: userRole, initial: initials, isCurrentUser: true },
    { name: 'Rahul Sharma', email: 'rahul.s@acmecorp.com', role: 'Editor', initial: 'RS', isCurrentUser: false },
    { name: 'Priya Patel', email: 'priya.p@acmecorp.com', role: 'Viewer', initial: 'PP', isCurrentUser: false },
  ];

  // Simulated Save Functions
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => { setIsSavingProfile(false); alert("Profile preferences saved successfully!"); }, 800);
  };

  const handleUpdateWorkspace = () => {
    setIsSavingWorkspace(true);
    setTimeout(() => { setIsSavingWorkspace(false); alert("Workspace configuration updated!"); }, 800);
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30 flex flex-col relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#004BFF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-8 py-10 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar: Settings Navigation */}
        <motion.aside initial="hidden" animate="visible" variants={fadeUp} className="w-full md:w-64 flex flex-col shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-6">Settings</h1>
          
          <nav className="flex flex-col gap-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveSettingsTab(tab);
                  setOpenMenuIndex(null); 
                }}
                className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                  activeSettingsTab === tab 
                    ? 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 shadow-[0_0_15px_rgba(0,102,255,0.1)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {tab}
                {activeSettingsTab === tab && (
                  <motion.div layoutId="indicator" className="w-1.5 h-1.5 rounded-full bg-[#0066FF] shadow-[0_0_5px_#0066FF]"></motion.div>
                )}
              </button>
            ))}
          </nav>

          {/* NEW LOGOUT BUTTON */}
          <div className="mt-6 pt-6 border-t border-white/[0.05]">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </motion.aside>

        {/* Right Content Panel */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1 flex flex-col gap-6">
          
          {/* TAB 1: MY PROFILE */}
          {activeSettingsTab === 'My Profile' && (
            <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/[0.05] flex items-center gap-6 bg-gradient-to-r from-black/20 to-transparent">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#004BFF] to-[#0066FF] flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(0,102,255,0.4)] border-2 border-[#0B0F19] capitalize">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#131C2D] border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 capitalize">{userName}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400">{userEmail}</span>
                    <span className="px-2.5 py-1 bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">First Name</label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all capitalize" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Last Name</label>
                    <input type="text" placeholder="Optional" className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                    <input type="email" value={userEmail} disabled className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-500 cursor-not-allowed" />
                    <p className="text-[11px] text-slate-500 mt-2">Email address is tied to your system authentication and cannot be changed here.</p>
                  </div>
                </div>

                <hr className="border-white/[0.05]" />

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Preferences</h3>
                  <div className="flex flex-col gap-4">
                    
                    <div className="flex items-center justify-between p-4 bg-[#131C2D]/50 border border-white/5 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-white">System Notifications</p>
                        <p className="text-xs text-slate-400 mt-1">Receive email alerts for flagged invoices and AI mismatches.</p>
                      </div>
                      <div onClick={() => setNotifEnabled(!notifEnabled)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notifEnabled ? 'bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.3)]' : 'bg-slate-700 border border-white/10'}`}>
                        <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm ${notifEnabled ? 'right-1' : 'left-1'}`}></motion.div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#131C2D]/50 border border-white/5 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-white">Weekly Compliance Digest</p>
                        <p className="text-xs text-slate-400 mt-1">A weekly summary of supplier match rates and ITC risks.</p>
                      </div>
                      <div onClick={() => setDigestEnabled(!digestEnabled)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${digestEnabled ? 'bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.3)]' : 'bg-slate-700 border border-white/10'}`}>
                        <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm ${digestEnabled ? 'right-1' : 'left-1 bg-slate-300'}`}></motion.div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-8 py-3 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all w-40 flex justify-center">
                    {isSavingProfile ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKSPACE DETAILS */}
          {activeSettingsTab === 'Workspace Details' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col p-8">
                <h2 className="text-xl font-bold text-white mb-6">Workspace Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Legal Company Name</label>
                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Primary GSTIN</label>
                    <input type="text" value={workspaceGstin} onChange={(e) => setWorkspaceGstin(e.target.value)} className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Base Currency</label>
                    <select className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] appearance-none cursor-pointer [&>option]:bg-[#0B0F19]">
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-white/[0.05]">
                  <button onClick={handleUpdateWorkspace} disabled={isSavingWorkspace} className="px-8 py-3 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all w-48 flex justify-center">
                    {isSavingWorkspace ? 'Updating...' : 'Update Workspace'}
                  </button>
                </div>
              </div>

              {/* WORKSPACE DELETION */}
              <div className="bg-[#131C2D]/50 border border-white/10 rounded-2xl p-8 flex flex-col items-start gap-4 shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Workspace Deletion</h3>
                  <p className="text-sm text-slate-400">Permanently remove your workspace and all associated financial data. This action requires a second-step confirmation.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/20 text-sm font-bold rounded-xl transition-all"
                >
                  Initiate Deletion
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM & RBAC */}
          {activeSettingsTab === 'Team & RBAC' && (
            <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible flex flex-col p-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Team Directory</h2>
                  <p className="text-sm text-slate-500 font-medium">Manage access and role-based permissions.</p>
                </div>
                <button onClick={() => alert("Invite link copied to clipboard!")} className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.4)] transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Invite Member
                </button>
              </div>
              
              <div className="border border-white/10 rounded-xl bg-black/20 divide-y divide-white/[0.05]">
                {teamMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors relative">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white capitalize ${member.isCurrentUser ? 'bg-gradient-to-br from-[#004BFF] to-[#0066FF]' : 'bg-slate-700'}`}>
                        {member.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2 capitalize">
                          {member.name} {member.isCurrentUser && <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded text-slate-300 font-medium">You</span>}
                        </p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${
                        member.role === 'Workspace Admin' || member.role === 'admin' ? 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20' : 
                        member.role === 'Editor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {member.role}
                      </span>
                      
                      {!member.isCurrentUser && (
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                          </button>
                          
                          <AnimatePresence>
                            {openMenuIndex === idx && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuIndex(null)}></div>
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-2 w-48 bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col py-1"
                                >
                                  <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit Role</button>
                                  <button onClick={() => alert("Invite resent.")} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Resend Invite</button>
                                  <div className="h-px w-full bg-white/10 my-1"></div>
                                  <button onClick={() => alert("User removed.")} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-2"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Remove User</button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ERP INTEGRATIONS */}
          {activeSettingsTab === 'ERP Integrations' && (
            <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col p-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Active Integrations</h2>
                  <p className="text-sm text-slate-500 font-medium">Manage API connections to your financial systems.</p>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Connection
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* SAP Integration Card */}
                <div className="p-5 bg-black/20 border border-white/10 rounded-xl flex flex-col gap-4 hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center border border-[#0066FF]/20">
                        <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">SAP S/4HANA</h3>
                        <p className="text-xs text-slate-400">Production Environment</p>
                      </div>
                    </div>
                    {sapStatus === 'Connected' ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold rounded uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Disconnected
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.05]">
                    <span className="text-xs text-slate-500">Last Sync: {sapStatus === 'Connected' ? 'Just now' : 'Unknown'}</span>
                    <button onClick={() => setSapStatus(sapStatus === 'Connected' ? 'Disconnected' : 'Connected')} className={`text-xs font-bold transition-colors ${sapStatus === 'Connected' ? 'text-red-400 hover:text-red-300' : 'text-[#0066FF] hover:text-white'}`}>
                      {sapStatus === 'Connected' ? 'Disconnect' : 'Reconnect API'}
                    </button>
                  </div>
                </div>

                {/* Tally Integration Card */}
                <div className="p-5 bg-black/20 border border-white/10 rounded-xl flex flex-col gap-4 hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Tally Prime</h3>
                        <p className="text-xs text-slate-400">Legacy Local Server</p>
                      </div>
                    </div>
                    {tallyStatus === 'Connected' ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold rounded uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Disconnected
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.05]">
                    <span className="text-xs text-slate-500">{tallyStatus === 'Connected' ? 'Last Sync: 1 min ago' : 'Auth Token Expired'}</span>
                    <button onClick={() => setTallyStatus(tallyStatus === 'Connected' ? 'Disconnected' : 'Connected')} className={`text-xs font-bold transition-colors ${tallyStatus === 'Connected' ? 'text-red-400 hover:text-red-300' : 'text-[#0066FF] hover:text-white'}`}>
                      {tallyStatus === 'Connected' ? 'Disconnect' : 'Reconnect API'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & AUDIT */}
          {activeSettingsTab === 'Security & Audit' && (
            <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col p-8">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-[#131C2D]/50 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">Two-Factor Authentication (2FA) <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-bold rounded border border-emerald-500/20">Enabled</span></p>
                    <p className="text-xs text-slate-400 mt-1">Require an authenticator code in addition to your password.</p>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all">
                    Configure
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#131C2D]/50 border border-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white">Single Sign-On (SSO)</p>
                    <p className="text-xs text-slate-400 mt-1">Enterprise login via Microsoft Entra or Google Workspace.</p>
                  </div>
                  <div onClick={() => setSsoEnabled(!ssoEnabled)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${ssoEnabled ? 'bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.3)]' : 'bg-slate-700 border border-white/10'}`}>
                    <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm ${ssoEnabled ? 'right-1' : 'left-1 bg-slate-300'}`}></motion.div>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-4 pt-6 border-t border-white/[0.05]">Audit Trail</h2>
              <p className="text-sm text-slate-400 mb-4">Download a cryptographic log of all system actions, approvals, and ERP syncs for compliance verification.</p>
              <div>
                <button onClick={() => alert("Audit log generation started. This will download automatically when complete.")} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Request System Log (.CSV)
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0B0F19] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 overflow-hidden z-10"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Workspace Deletion</h3>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    This action cannot be undone. This will permanently remove the <strong className="text-white">{workspaceName}</strong> workspace, wiping all uploaded ledgers, exceptions, and vendor data.
                  </p>
                </div>
                
                <div className="w-full text-left mb-8">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Please type <span className="text-white font-mono tracking-wider">DELETE</span> to confirm</label>
                  <input 
                    type="text" 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors" 
                    placeholder="Type DELETE here..."
                  />
                </div>

                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={deleteConfirmation !== 'DELETE'}
                    onClick={() => {
                      alert("Workspace deletion initiated. System will log you out.");
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                      deleteConfirmation === 'DELETE' 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-500/30' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    Confirm Deletion
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}