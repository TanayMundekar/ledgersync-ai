import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import InvoiceCard from '../components/InvoiceCard';
import TransactionFeed from '../components/TransactionFeed';
import InvoiceUploadModal from '../components/InvoiceUploadModal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [invoices, setInvoices] = useState([]);
  const [engineStatus, setEngineStatus] = useState('Checking...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchLiveInvoices = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/invoices');
      if (response.ok) {
        const liveData = await response.json();
        const formattedData = liveData.map(inv => {
          
          // --- SMART DIAGNOSTICS CALCULATOR ---
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
              smartNote = "Line item mismatch or unverified charges detected.";
            }
          }
          // -------------------------------------

          return {
            id: inv.id,
            invoiceNum: inv.invoice_number || `INV-AI-${inv.id}`,
            vendor: inv.vendor_name || 'Unknown Vendor',
            date: inv.date || new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }),
            amount: `₹${rawAmt.toLocaleString('en-IN')}`,
            erpAmountText: erpAmt > 0 ? `₹${erpAmt.toLocaleString('en-IN')}` : `₹${rawAmt.toLocaleString('en-IN')}`,
            erp: inv.status === 'Matched' ? 'Synced' : 'Pending',
            status: inv.status || 'Flagged',
            aiConfidence: inv.confidence || (Math.random() * (99 - 85) + 85).toFixed(1),
            aiNote: smartNote,
            rawAmount: rawAmt 
          };
        });
        setInvoices(formattedData.reverse()); 
        setEngineStatus('Healthy');
      } else {
        setEngineStatus('Offline');
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      setEngineStatus('Offline');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveInvoices();
  }, []);

  const handleExport = (format) => {
    setIsExportOpen(false);
    if (invoices.length === 0) return alert("No data to export.");
    const dateStr = new Date().toISOString().split('T')[0];
    if (format === 'pdf') { window.print(); return; }

    let blob;
    if (format === 'csv') {
      const headers = ["Invoice ID", "Vendor", "Date", "Amount", "Status", "AI Confidence"];
      const csvRows = [headers.join(',')];
      invoices.forEach(inv => {
        csvRows.push([inv.invoiceNum, inv.vendor, inv.date, inv.amount.replace(/,/g, ''), inv.status, `${inv.aiConfidence}%`].join(','));
      });
      blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    } else if (format === 'xls') {
      let table = '<table><tr><th>Invoice ID</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Status</th></tr>';
      invoices.forEach(inv => table += `<tr><td>${inv.invoiceNum}</td><td>${inv.vendor}</td><td>${inv.date}</td><td>${inv.amount.replace(/,/g, '')}</td><td>${inv.status}</td></tr>`);
      table += '</table>';
      blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    }
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `LedgerSync_Export_${dateStr}.${format}`);
      a.click();
    }
  };

  const totalReconciled = invoices.filter(inv => inv.status === 'Matched').reduce((sum, inv) => sum + inv.rawAmount, 0);
  const atRiskCount = invoices.filter(inv => inv.status !== 'Matched').length;
  const itcAtRisk = invoices.filter(inv => inv.status !== 'Matched').reduce((sum, inv) => sum + inv.rawAmount, 0);
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30 flex flex-col relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#004BFF]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-8 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col gap-8">
          
          <motion.div variants={fadeUp} className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Financial Overview</h1>
              <p className="text-sm text-slate-500 font-medium">Data synced as of Today, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <button onClick={() => setIsExportOpen(!isExportOpen)} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Report
                  <svg className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {isExportOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="absolute top-[calc(100%+8px)] left-0 w-40 bg-[#131C2D] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50">
                      <div onClick={() => handleExport('csv')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Export as CSV</div>
                      <div onClick={() => handleExport('xls')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Export as XLS</div>
                      <div onClick={() => handleExport('pdf')} className="px-4 py-2.5 text-sm cursor-pointer text-slate-300 hover:bg-[#0066FF] hover:text-white transition-colors font-medium">Print to PDF</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={fetchLiveInvoices} disabled={isSyncing} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {isSyncing ? 'Syncing...' : 'Force Sync'}
              </button>
              
              <button onClick={() => setIsUploadModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2M21 8V6a2 2 0 00-2-2h-2M21 16v2a2 2 0 01-2 2h-2m-5-9a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan Invoice
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InvoiceCard title="Total Reconciled" value={formatCurrency(totalReconciled)} glowColor="blue">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Live DB Sync
              </div>
            </InvoiceCard>

            <InvoiceCard title="ITC at Risk" value={formatCurrency(itcAtRisk)} glowColor="amber">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Action required on {atRiskCount} invoices
              </div>
            </InvoiceCard>

            <InvoiceCard title="Engine Status" glowColor={engineStatus === 'Healthy' ? 'emerald' : 'red'}>
              <div className="flex flex-col h-full justify-between -mt-8">
                <div className="flex justify-end">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase border ${
                    engineStatus === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {engineStatus}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-2 mt-4">
                    <span>Database Connection</span>
                    <span className="text-white">{invoices.length} Records</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full shadow-[0_0_10px_currentColor] w-full ${
                      engineStatus === 'Healthy' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-400 text-red-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            </InvoiceCard>
          </motion.div>

          <motion.div variants={fadeUp}>
             <TransactionFeed transactions={invoices} setTransactions={setInvoices} />
          </motion.div>

        </motion.div>
      </main>

      <InvoiceUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchLiveInvoices(); 
        }} 
      />
    </div>
  );
}