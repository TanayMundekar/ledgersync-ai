import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Reports');
  
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All Report Types');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // SCHEDULE MODAL STATES
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedName, setSchedName] = useState('');
  const [schedType, setSchedType] = useState('Financial Close');
  const [schedFreq, setSchedFreq] = useState('Weekly (Fridays)');
  const [schedFormat, setSchedFormat] = useState('XLSX');
  const [schedEmails, setSchedEmails] = useState('finance-team@acmecorp.com');

  const [reports, setReports] = useState([
    { id: 'RPT-2026-089', name: 'Month-End Reconciliation Summary', type: 'Financial Close', date: 'Sep 01, 2026, 18:00', size: '2.4 MB', format: 'XLSX', status: 'Ready' },
    { id: 'RPT-2026-088', name: 'Vendor Compliance & Match Rates', type: 'Supplier Health', date: 'Aug 28, 2026, 09:30', size: '1.1 MB', format: 'PDF', status: 'Ready' },
    { id: 'RPT-2026-087', name: 'ITC Risk Assessment Q3', type: 'Tax & Compliance', date: 'Aug 25, 2026, 14:15', size: '4.7 MB', format: 'XLSX', status: 'Ready' },
    { id: 'RPT-2026-086', name: 'Raw AI Diagnostics Log', type: 'Audit Trail', date: 'Aug 25, 2026, 14:10', size: '8.2 MB', format: 'CSV', status: 'Processing' },
    { id: 'RPT-2026-085', name: 'Flagged Invoices Masterlist', type: 'Exceptions', date: 'Aug 20, 2026, 10:00', size: '3.1 MB', format: 'XLSX', status: 'Ready' },
  ]);

  const handleGenerateReport = () => {
    const newId = `RPT-2026-0${Math.floor(Math.random() * 90) + 10}`;
    const newReport = {
      id: newId,
      name: 'On-Demand AI Diagnostics Export',
      type: 'Audit Trail',
      date: new Date().toLocaleString('en-IN', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      size: '1.2 MB',
      format: 'CSV',
      status: 'Processing'
    };
    setReports(prev => [newReport, ...prev]);
    setCurrentPage(1);

    setTimeout(() => {
      setReports(prev => prev.map(rpt => 
        rpt.id === newId ? { ...rpt, status: 'Ready' } : rpt
      ));
    }, 3000);
  };

  // ACTION: Save the custom scheduled report from the modal
  const handleSaveSchedule = () => {
    if (!schedName.trim()) return alert("Please provide a report name.");
    
    const newId = `RPT-2026-0${Math.floor(Math.random() * 90) + 10}`;
    const newReport = {
      id: newId,
      name: schedName,
      type: schedType,
      date: `Scheduled: ${schedFreq}`,
      size: '--',
      format: schedFormat,
      status: 'Scheduled'
    };
    
    setReports(prev => [newReport, ...prev]);
    setCurrentPage(1);
    
    // Reset and close
    setSchedName('');
    setIsScheduleModalOpen(false);
  };

  const handleDownload = (report) => {
    if (report.format === 'PDF') {
      window.print();
      return;
    }
    const content = `Report ID: ${report.id}\nName: ${report.name}\nGenerated: ${report.date}\n\n[Data aggregated from LedgerSync AI Database]`;
    const blob = new Blob([content], { type: report.format === 'CSV' ? 'text/csv' : 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${report.name.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`);
    a.click();
  };

  const filteredReports = reports.filter(rpt => {
    const matchesSearch = rpt.name.toLowerCase().includes(searchQuery.toLowerCase()) || rpt.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All Report Types' || rpt.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All Report Types');
    setDateFilter('Last 30 Days');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30 flex flex-col relative">
      <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-[#004BFF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-8 relative z-10 flex flex-col gap-6">
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 font-medium">Generate, schedule, and download system compliance records.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Schedule Report
            </button>
            <button 
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Generate New Report
            </button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex gap-4 items-center relative z-20">
          <div className="relative flex-1 max-w-sm">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search report name or ID..." 
              className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors" 
            />
          </div>
          
          <div className="relative w-48">
            <button 
              onClick={() => { setIsTypeOpen(!isTypeOpen); setIsDateOpen(false); }}
              className={`w-full bg-[#131C2D]/80 border ${isTypeOpen ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-white/10 hover:border-white/30'} rounded-xl py-2 px-4 text-sm text-white flex justify-between items-center transition-all focus:outline-none`}
            >
              <span className="truncate">{typeFilter}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isTypeOpen ? 'rotate-180 text-[#0066FF]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {isTypeOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                >
                  {['All Report Types', 'Financial Close', 'Supplier Health', 'Audit Trail', 'Tax & Compliance'].map((type) => (
                    <div 
                      key={type} onClick={() => { setTypeFilter(type); setIsTypeOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${typeFilter === type ? 'bg-[#0066FF] text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      {type}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative w-40">
            <button 
              onClick={() => { setIsDateOpen(!isDateOpen); setIsTypeOpen(false); }}
              className={`w-full bg-[#131C2D]/80 border ${isDateOpen ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-white/10 hover:border-white/30'} rounded-xl py-2 px-4 text-sm text-white flex justify-between items-center transition-all focus:outline-none`}
            >
              <span className="truncate">{dateFilter}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDateOpen ? 'rotate-180 text-[#0066FF]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {isDateOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                >
                  {['Last 30 Days', 'Last 7 Days', 'This Quarter'].map((date) => (
                    <div 
                      key={date} onClick={() => { setDateFilter(date); setIsDateOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${dateFilter === date ? 'bg-[#0066FF] text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      {date}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleClearFilters} className="ml-auto text-sm font-bold text-slate-400 hover:text-white transition-colors pr-2">Clear Filters</button>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible flex-1 flex flex-col relative z-10">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] text-xs uppercase tracking-wider text-slate-500 bg-black/20">
                  <th className="px-6 py-4 font-bold">Report Name & ID</th>
                  <th className="px-6 py-4 font-bold">Report Type</th>
                  <th className="px-6 py-4 font-bold">Generated On</th>
                  <th className="px-6 py-4 font-bold">Details</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentItems.map((report) => (
                  <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white text-sm">{report.name}</span>
                        <span className="text-xs text-slate-500">{report.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-white/5 border border-white/10 text-slate-300">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-middle text-sm text-slate-400">
                      {report.date}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            report.status === 'Ready' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 
                            report.status === 'Scheduled' ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' :
                            'bg-[#0066FF] animate-pulse shadow-[0_0_5px_#0066FF]'
                          }`}></span>
                          <span className="text-xs font-bold text-white">{report.status}</span>
                        </div>
                        <span className="text-xs text-slate-500">{report.format} • {report.size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right align-middle">
                      {report.status === 'Ready' ? (
                        <button 
                          onClick={() => handleDownload(report)}
                          className="px-4 py-2 text-xs font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all inline-flex items-center gap-2 opacity-90 group-hover:opacity-100"
                        >
                          <svg className="w-3.5 h-3.5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                      ) : report.status === 'Scheduled' ? (
                        <button disabled className="px-4 py-2 text-xs font-bold text-slate-500 bg-transparent border border-transparent cursor-not-allowed inline-flex items-center gap-2">
                          Scheduled
                        </button>
                      ) : (
                        <button disabled className="px-4 py-2 text-xs font-bold text-slate-500 bg-transparent border border-transparent cursor-not-allowed inline-flex items-center gap-2">
                          Generating...
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/[0.05] bg-black/10 flex justify-between items-center text-xs font-medium text-slate-400 mt-auto">
            <span>
              Showing <strong className="text-white">{filteredReports.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReports.length)}</strong> of <strong className="text-white">{filteredReports.length}</strong> reports
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-[#0066FF] text-white shadow-[0_0_10px_rgba(0,102,255,0.4)]' 
                        : 'border border-white/10 hover:bg-white/5 hover:text-white text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* EXTENSIVE ENTERPRISE SCHEDULE MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B0F19] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col"
            >
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Configure Scheduled Report
                </h2>
                <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Report Name</label>
                  <input 
                    type="text" 
                    value={schedName}
                    onChange={(e) => setSchedName(e.target.value)}
                    placeholder="e.g., Weekly ITC Compliance Digest"
                    className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0066FF] transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Data Source / Type</label>
                    <div className="relative">
                      <select 
                        value={schedType}
                        onChange={(e) => setSchedType(e.target.value)}
                        className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[#0066FF] appearance-none cursor-pointer transition-all"
                      >
                        <option value="Financial Close">Financial Close</option>
                        <option value="Supplier Health">Supplier Health</option>
                        <option value="Audit Trail">Audit Trail</option>
                        <option value="Exceptions">Exceptions Log</option>
                      </select>
                      <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Delivery Frequency</label>
                    <div className="relative">
                      <select 
                        value={schedFreq}
                        onChange={(e) => setSchedFreq(e.target.value)}
                        className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[#0066FF] appearance-none cursor-pointer transition-all"
                      >
                        <option value="Daily (EOD)">Daily (EOD)</option>
                        <option value="Weekly (Fridays)">Weekly (Fridays)</option>
                        <option value="Monthly (1st)">Monthly (1st)</option>
                        <option value="End of Quarter">End of Quarter</option>
                      </select>
                      <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Output Format</label>
                  <div className="flex gap-3">
                    {['XLSX', 'CSV', 'PDF'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSchedFormat(fmt)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          schedFormat === fmt 
                          ? 'bg-[#0066FF]/20 border-[#0066FF]/50 text-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.2)]' 
                          : 'bg-[#131C2D]/80 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Recipients</label>
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <input 
                      type="text" 
                      value={schedEmails}
                      onChange={(e) => setSchedEmails(e.target.value)}
                      placeholder="Comma separated emails..."
                      className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Reports will be encrypted and sent securely to the list above.</p>
                </div>

              </div>

              <div className="p-6 border-t border-white/[0.05] bg-black/20 flex gap-3">
                <button 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSchedule}
                  className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 rounded-xl shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-transform"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}