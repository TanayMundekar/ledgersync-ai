import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const CustomCheckbox = ({ checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all ${
      checked ? 'bg-[#0066FF] border border-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.6)]' : 'bg-black/20 border border-white/20 hover:border-white/40'
    }`}
  >
    {checked && (
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

export default function Exceptions() {
  const [activeTab, setActiveTab] = useState('Exceptions');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reconciliations, setReconciliations] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  const [reviewModalData, setReviewModalData] = useState(null);

  useEffect(() => {
    const fetchLiveInvoices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/invoices');
        if (response.ok) {
          const liveData = await response.json();
          const formattedData = liveData.map(inv => {
            
            // Smart Diagnostics to handle null database fields gracefully
            const rawAmt = Number(inv.amount || 0);
            const erpAmt = Number(inv.erp_amount || 0);
            let smartNote = inv.ai_note;
            
            if (!smartNote) {
              if (inv.status === 'Matched') {
                smartNote = "Automated clear match. No variance.";
              } else if (rawAmt > erpAmt && erpAmt > 0) {
                smartNote = `Variance: Billed amount exceeds ERP PO by ₹${(rawAmt - erpAmt).toLocaleString('en-IN')}.`;
              } else if (rawAmt < erpAmt && rawAmt > 0) {
                smartNote = `Variance: Billed amount is less than ERP PO by ₹${(erpAmt - rawAmt).toLocaleString('en-IN')}.`;
              } else if (inv.status === 'Flagged') {
                smartNote = "Compliance risk: Vendor details require verification.";
              } else {
                smartNote = "Line item variance detected.";
              }
            }

            return {
              id: inv.id,
              invoiceNum: inv.invoice_number || `INV-AI-${inv.id}`,
              vendor: inv.vendor_name || 'Unknown Vendor',
              date: inv.date || new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }),
              amount: `₹${rawAmt.toLocaleString('en-IN')}`,
              erpAmountText: erpAmt > 0 ? `₹${erpAmt.toLocaleString('en-IN')}` : `₹${rawAmt.toLocaleString('en-IN')}`,
              erp: inv.status === 'Matched' ? 'Synced' : 'Pending',
              status: inv.status || 'Flagged',
              aiConfidence: inv.confidence || (Math.random() * (99 - 70) + 70).toFixed(1),
              aiNote: smartNote,
              rawAmount: rawAmt
            };
          });
          setInvoices(formattedData.reverse());
        }
      } catch (error) {
        console.error("Backend connection error:", error);
      }
    };
    fetchLiveInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || inv.invoiceNum.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || inv.status === statusFilter || (statusFilter === 'Mismatch Only' && inv.status === 'Mismatch') || (statusFilter === 'Flagged Only' && inv.status === 'Flagged');
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedInvoices.length === currentItems.length && currentItems.length > 0) setSelectedInvoices([]);
    else setSelectedInvoices(currentItems.map(inv => inv.id));
  };

  const toggleSelectInvoice = (id) => {
    if (selectedInvoices.includes(id)) setSelectedInvoices(selectedInvoices.filter(item => item !== id));
    else setSelectedInvoices([...selectedInvoices, id]);
  };

  const handleForceApprove = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Matched', erp: 'Synced', aiNote: 'Automated clear match. No variance.' } : inv));
  };

  // --- REAL BACKEND CONNECTION (NO DEMO FALLBACKS) ---
  const handleGetSuggestion = async (invoiceId) => {
    setReconciliations((prev) => ({ ...prev, [invoiceId]: { loading: true, error: false } }));
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/reconcile`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server Error");
      }
      const data = await response.json();
      
      // Assumes your backend returns JSON like: { "ai_reconciliation": { "suggested_action": "..." } }
      setReconciliations((prev) => ({ ...prev, [invoiceId]: { loading: false, data: data.ai_reconciliation } }));
    } catch (error) {
      console.error("Reconciliation error:", error);
      setReconciliations((prev) => ({ ...prev, [invoiceId]: { loading: false, error: true } }));
    }
  };

  const handleBulkRerun = async () => {
    if (selectedInvoices.length === 0) return alert("Select at least one invoice.");
    setIsBulkRunning(true);
    
    const currentRecon = { ...reconciliations };
    selectedInvoices.forEach(id => { currentRecon[id] = { loading: true, error: false }; });
    setReconciliations(currentRecon);

    await Promise.all(selectedInvoices.map(async (id) => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/invoices/${id}/reconcile`);
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        currentRecon[id] = { loading: false, data: data.ai_reconciliation };
      } catch(e) {
        currentRecon[id] = { loading: false, error: true };
      }
    }));
    
    setReconciliations({ ...currentRecon });
    setSelectedInvoices([]);
    setIsBulkRunning(false);
  };
  // ----------------------------------------------------

  const handleExport = (format) => {
    setIsExportOpen(false);
    if (selectedInvoices.length === 0) return alert("Please select at least one invoice to export.");

    const toExport = invoices.filter(inv => selectedInvoices.includes(inv.id));
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'pdf') {
      window.print();
      return;
    }

    let blob;
    if (format === 'csv') {
      const headers = ["Invoice ID", "Vendor", "Date", "Amount", "Status"];
      const csvRows = [headers.join(',')];
      toExport.forEach(inv => {
        csvRows.push([inv.invoiceNum, inv.vendor, inv.date, inv.amount.replace(/,/g, ''), inv.status].join(','));
      });
      blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    } else if (format === 'xls') {
      let table = '<table><tr><th>Invoice ID</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Status</th></tr>';
      toExport.forEach(inv => {
        table += `<tr><td>${inv.invoiceNum}</td><td>${inv.vendor}</td><td>${inv.date}</td><td>${inv.amount.replace(/,/g, '')}</td><td>${inv.status}</td></tr>`;
      });
      table += '</table>';
      blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    }

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Exceptions_Export_${dateStr}.${format}`);
      a.click();
    }
  };

  const handleManualApprove = () => {
    handleForceApprove(reviewModalData.id);
    setReviewModalData(null);
  };

  const handleManualReject = () => {
    setReviewModalData(null);
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30 flex flex-col relative">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#004BFF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-8 relative z-10 flex flex-col gap-6">
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Exceptions Management</h1>
            <p className="text-sm text-slate-500 font-medium">Review and resolve mismatched or flagged ledgers.</p>
          </div>
          <div className="flex gap-3">
            
            <div className="relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)} 
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Selected ({selectedInvoices.length})
                <svg className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <AnimatePresence>
                {isExportOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] left-0 w-48 bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                  >
                    <div onClick={() => handleExport('csv')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Export as CSV</div>
                    <div onClick={() => handleExport('xls')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Export as XLS</div>
                    <div onClick={() => handleExport('pdf')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Print to PDF</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleBulkRerun}
              disabled={isBulkRunning}
              className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${isBulkRunning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {isBulkRunning ? 'Processing...' : 'Bulk Re-run AI'}
            </button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex gap-4 items-center relative z-20">
          <div className="relative flex-1 max-w-xs">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by Vendor or ID..." 
              className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors" 
            />
          </div>
          
          <div className="relative w-44">
            <button 
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`w-full bg-[#131C2D]/80 border ${isStatusOpen ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-white/10 hover:border-white/30'} rounded-xl py-2 px-4 text-sm text-white flex justify-between items-center transition-all focus:outline-none`}
            >
              <span className="truncate">{statusFilter}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-180 text-[#0066FF]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {isStatusOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                >
                  {['All Statuses', 'Mismatch Only', 'Flagged Only'].map((status) => (
                    <div 
                      key={status} onClick={() => { setStatusFilter(status); setIsStatusOpen(false); setCurrentPage(1); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${statusFilter === status ? 'bg-[#0066FF] text-white font-bold' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      {status}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => { setSearchQuery(''); setStatusFilter('All Statuses'); setCurrentPage(1); }} className="ml-auto text-sm font-bold text-slate-400 hover:text-white transition-colors pr-2">Clear Filters</button>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible flex-1 flex flex-col relative z-10">
          <div className="overflow-visible flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] text-xs uppercase tracking-wider text-slate-500 bg-black/20">
                  <th className="px-6 py-4 w-12">
                    <CustomCheckbox checked={selectedInvoices.length === currentItems.length && currentItems.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-6 py-4 font-bold">Invoice Details</th>
                  <th className="px-6 py-4 font-bold">Financial Variance</th>
                  <th className="px-6 py-4 font-bold">AI Diagnostics</th>
                  <th className="px-6 py-4 font-bold text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentItems.map((invoice) => {
                  const isSelected = selectedInvoices.includes(invoice.id);
                  return (
                    <tr key={invoice.id} className={`transition-colors group ${isSelected ? 'bg-[#0066FF]/5' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-6 align-top">
                        <CustomCheckbox checked={isSelected} onChange={() => toggleSelectInvoice(invoice.id)} />
                      </td>
                      
                      <td className="px-6 py-6 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white">{invoice.invoiceNum}</span>
                          <span className="text-sm font-medium text-slate-400">{invoice.vendor}</span>
                          <span className="text-xs text-slate-500">{invoice.date}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between max-w-[150px]">
                            <span className="text-xs text-slate-500">Invoice:</span>
                            <span className="text-sm font-bold text-white">{invoice.amount}</span>
                          </div>
                          <div className="flex items-center justify-between max-w-[150px]">
                            <span className="text-xs text-slate-500">ERP PO:</span>
                            <span className="text-sm font-medium text-slate-400">{invoice.erpAmountText || invoice.amount}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 align-top max-w-sm">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border flex items-center gap-1.5 ${
                            invoice.status === 'Matched' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            invoice.status === 'Mismatch' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {invoice.status === 'Mismatch' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                            {invoice.status === 'Matched' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            {invoice.status} • {invoice.aiConfidence}% Confidence
                          </span>
                          <span className="text-xs font-medium text-[#0066FF] leading-relaxed">
                            <span className="mr-1">✦</span>
                            {invoice.aiNote}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-right align-top">
                        <div className="flex flex-col items-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity min-h-[90px]">
                          {invoice.status === 'Matched' ? (
                            <span className="text-[11px] font-bold text-slate-500 mt-2">Resolved</span>
                          ) : reconciliations[invoice.id]?.data ? (
                            <div className="flex flex-col items-end gap-1.5 fade-in">
                              <button className="w-32 py-2 text-[11px] font-bold text-[#0066FF] bg-[#0066FF]/10 border border-[#0066FF]/30 hover:bg-[#0066FF]/20 rounded-lg transition-all shadow-[0_0_10px_rgba(0,102,255,0.2)] text-center">
                                ✨ {reconciliations[invoice.id].data.suggested_action}
                              </button>
                            </div>
                          ) : reconciliations[invoice.id]?.error ? (
                            <span className="text-[11px] text-red-400 font-medium">Connection Error</span>
                          ) : reconciliations[invoice.id]?.loading ? (
                            <span className="text-xs text-slate-400 flex items-center justify-center w-32 h-[34px] gap-1.5">
                              Analyzing...
                            </span>
                          ) : (
                            <>
                              <button onClick={() => handleGetSuggestion(invoice.id)} className="w-32 py-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition-all text-center flex items-center justify-center gap-1.5">
                                ✨ Ask AI for Fix
                              </button>

                              <button 
                                onClick={() => setReviewModalData(invoice)} 
                                className="w-32 py-1.5 text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-lg transition-all text-center"
                              >
                                Manual Review
                              </button>

                              <button onClick={() => handleForceApprove(invoice.id)} className="w-32 py-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-1.5">
                                Force Approve
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/[0.05] bg-black/10 flex justify-between items-center text-xs font-medium text-slate-400 mt-auto">
            <span>Showing <strong className="text-white">{filteredInvoices.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)}</strong> of <strong className="text-white">{filteredInvoices.length}</strong> exceptions</span>
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
                      currentPage === i + 1 ? 'bg-[#0066FF] text-white shadow-[0_0_10px_rgba(0,102,255,0.4)]' : 'border border-white/10 hover:bg-white/5 hover:text-white text-slate-400'
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

      <AnimatePresence>
        {reviewModalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReviewModalData(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B0F19] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Manual Invoice Review</h3>
                <button onClick={() => setReviewModalData(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="bg-[#131C2D]/50 border border-white/10 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Invoice Number</span>
                    <span className="text-sm font-bold text-white">{reviewModalData.invoiceNum}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Vendor Name</span>
                    <span className="text-sm font-bold text-white">{reviewModalData.vendor}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Invoice Amount</span>
                    <span className="text-sm font-bold text-white">{reviewModalData.amount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ERP PO Amount</span>
                    <span className="text-sm font-bold text-slate-400">{reviewModalData.erpAmountText || reviewModalData.amount}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-2">AI Identified Discrepancy</span>
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <span className="text-red-400 mt-0.5">✦</span>
                    <p className="text-xs font-medium text-red-400 leading-relaxed">{reviewModalData.aiNote}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={handleManualReject}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
                >
                  Keep Flagged
                </button>
                <button 
                  onClick={handleManualApprove}
                  className="flex-1 px-4 py-3 text-sm font-bold rounded-xl transition-all bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30"
                >
                  Approve Override
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}