import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Header({ activeTab, setActiveTab }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  
  // DYNAMIC USER STATE
  const [userName, setUserName] = useState('Admin User');
  const [userRole, setUserRole] = useState('Workspace Admin');
  const [initials, setInitials] = useState('AD');

  // Decode the token to get the real logged-in user
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
          // Use the part before the @ symbol as the display name
          const namePart = payload.sub.split('@')[0];
          setUserName(namePart);
          setInitials(namePart.substring(0, 2).toUpperCase());
        }
        if (payload.role) {
          setUserRole(payload.role);
        }
      } catch (e) {
        console.error("Could not parse user token", e);
      }
    }
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Exceptions', path: '/exceptions' },
    { name: 'Vendors', path: '/vendors' },
    { name: 'Reports', path: '/reports' }
  ];

  const notifications = [
    { id: 1, title: 'AI Copilot auto-resolved 4 flagged invoices.', time: 'Just now', type: 'success' },
    { id: 2, title: 'System generated Month-End Reconciliation Report.', time: '2 hrs ago', type: 'info' },
    { id: 3, title: 'High variance detected on Vendor Acme Corp.', time: '5 hrs ago', type: 'alert' },
  ];

  const handleMarkAllRead = () => setUnreadCount(0);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-16 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between px-6 lg:px-8 relative z-50"
    >
      <div className="flex items-center gap-6 lg:gap-10">
        <Link to="/dashboard" onClick={() => setActiveTab('Overview')} className="flex items-center gap-2.5 cursor-pointer">
          <svg className="w-7 h-8" viewBox="0 0 269 299" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z" fill="#E0F2FE"/>
            <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z" fill="#004BFF"/>
          </svg>
          <span className="text-base font-bold text-white tracking-tight">LedgerSync AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((tab) => (
            <Link 
              key={tab.name}
              to={tab.path}
              onClick={() => setActiveTab(tab.name)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === tab.name ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.name}
              {activeTab === tab.name && (
                <motion.div layoutId="activeTab" className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-[#0066FF]" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-5 ml-auto relative">
        <div className="relative hidden md:block w-48 lg:w-64">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search POs, Invoices..." 
            className="w-full bg-[#131C2D]/80 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors" 
          />
        </div>

        <div className="relative z-[9999]">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); }}
            className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#0B0F19] rounded-full"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#131C2D] border border-white/20 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden z-[9999]">
              <div className="px-4 py-3 border-b border-white/[0.05] flex justify-between items-center bg-black/40">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[#0066FF] hover:text-white transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-white/[0.05]">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-white/[0.05] transition-colors cursor-pointer flex gap-3 items-start">
                    <div className="mt-0.5">
                      {notif.type === 'success' && <span className="flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>}
                      {notif.type === 'info' && <span className="flex w-2 h-2 rounded-full bg-[#0066FF] shadow-[0_0_5px_#0066FF]"></span>}
                      {notif.type === 'alert' && <span className="flex w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className={`text-xs ${unreadCount > 0 ? 'text-white font-medium' : 'text-slate-400'} leading-tight`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-500">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link to="/settings" onClick={() => setActiveTab(null)} className="flex items-center gap-3 pl-4 lg:pl-5 border-l border-white/10 cursor-pointer group">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-white leading-tight group-hover:text-[#0066FF] transition-colors capitalize">{userName}</span>
            <span className="text-[11px] font-medium text-slate-400 tracking-tight mt-0.5 capitalize">{userRole}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-xs font-bold select-none group-hover:shadow-[0_0_15px_rgba(0,102,255,0.4)] transition-all">
            {initials}
          </div>
        </Link>
      </div>
    </motion.nav>
  );
}