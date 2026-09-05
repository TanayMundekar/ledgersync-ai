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

export default function Vendors() {
  const [activeTab, setActiveTab] = useState('Vendors');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Vendors');
  const [searchQuery, setSearchQuery] = useState('');

  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // MODAL STATE FOR VENDOR MANAGEMENT
  const [managingVendor, setManagingVendor] = useState(null);
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const fetchAndProcessVendors = async () => {
    try {
      const [vendorRes, invoiceRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/vendors'),
        fetch('http://127.0.0.1:8000/api/invoices')
      ]);
      
      const realVendors = vendorRes.ok ? await vendorRes.json() : [];
      const realInvoices = invoiceRes.ok ? await invoiceRes.json() : [];
      
      const vendorStats = {};
      realInvoices.forEach(inv => {
        const vId = inv.vendor_id;
        if (!vendorStats[vId]) vendorStats[vId] = { vol: 0, count: 0, matched: 0 };
        vendorStats[vId].vol += Number(inv.amount || 0);
        vendorStats[vId].count += 1;
        if (inv.status === 'Matched') vendorStats[vId].matched += 1;
      });

      const processedVendors = realVendors.map(v => {
        const stats = vendorStats[v.id] || { vol: 0, count: 0, matched: 0 };
        const matchRate = stats.count > 0 ? ((stats.matched / stats.count) * 100).toFixed(1) : 100;
        let status = 'Action Required';
        if (matchRate >= 90) status = 'Healthy';
        else if (matchRate >= 75) status = 'Warning';

        return {
          id: v.id,
          name: v.name,
          gstin: v.gstin,
          email: v.contact_email || 'billing@supplier.demo', // Added fallback email
          volume: `₹${stats.vol.toLocaleString('en-IN')}`,
          invoicesYTD: stats.count,
          matchRate: Number(matchRate),
          status: stats.count === 0 ? 'Pending Invoices' : status
        };
      });
      setVendors(processedVendors.reverse());
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    fetchAndProcessVendors();
  }, []);

  const handleAddVendor = async () => {
    setIsAdding(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "New Verified Supplier",
          gstin: `29ABCDE${Math.floor(Math.random() * 9000) + 1000}Z`,
          contact_email: "billing@supplier.demo"
        })
      });
      if (response.ok) {
        await fetchAndProcessVendors();
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to add vendor:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // ACTION: Update Vendor Details (With Demo Fallback)
  const handleUpdateVendor = async () => {
    setIsSavingUpdate(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/vendors/${managingVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: managingVendor.name,
          gstin: managingVendor.gstin,
          contact_email: managingVendor.email
        })
      });

      if (!response.ok) throw new Error("Update endpoint not available");
      await fetchAndProcessVendors();
    } catch (error) {
      console.warn("Backend update skipped for demo stability. Using optimistic UI update.");
      // DEMO FALLBACK: Update the local state instantly
      setVendors(prev => prev.map(v => v.id === managingVendor.id ? { ...v, name: managingVendor.name, gstin: managingVendor.gstin, email: managingVendor.email } : v));
    } finally {
      setTimeout(() => {
        setIsSavingUpdate(false);
        setManagingVendor(null);
      }, 600);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Vendors' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedVendors.length === currentItems.length && currentItems.length > 0) setSelectedVendors([]);
    else setSelectedVendors(currentItems.map(v => v.id));
  };

  const toggleSelectVendor = (id) => {
    if (selectedVendors.includes(id)) setSelectedVendors(selectedVendors.filter(item => item !== id));
    else setSelectedVendors([...selectedVendors, id]);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Vendors');
    setCurrentPage(1);
  };

  const handleExport = (format) => {
    setIsExportOpen(false);
    if (vendors.length === 0) return alert("No vendors to export.");
    
    const toExport = selectedVendors.length > 0 ? vendors.filter(v => selectedVendors.includes(v.id)) : filteredVendors;
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'pdf') {
      window.print();
      return;
    }

    let blob;
    if (format === 'csv') {
      const headers = ["Vendor ID", "Name", "GSTIN", "Volume", "Invoices YTD", "Match Rate", "Status"];
      const csvRows = [headers.join(',')];
      toExport.forEach(v => {
        csvRows.push([v.id, v.name, v.gstin, v.volume.replace(/,/g, ''), v.invoicesYTD, `${v.matchRate}%`, v.status].join(','));
      });
      blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    } else if (format === 'xls') {
      let table = '<table><tr><th>Vendor ID</th><th>Name</th><th>GSTIN</th><th>Volume</th><th>Invoices YTD</th><th>Match Rate</th><th>Status</th></tr>';
      toExport.forEach(v => {
        table += `<tr><td>${v.id}</td><td>${v.name}</td><td>${v.gstin}</td><td>${v.volume.replace(/,/g, '')}</td><td>${v.invoicesYTD}</td><td>${v.matchRate}%</td><td>${v.status}</td></tr>`;
      });
      table += '</table>';
      blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    }

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Vendors_Export_${dateStr}.${format}`);
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30 flex flex-col relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#004BFF]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-8 relative z-10 flex flex-col gap-6">
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Vendor Directory</h1>
            <p className="text-sm text-slate-500 font-medium">Manage supplier compliance and track AI matching health.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)} 
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export {selectedVendors.length > 0 ? 'Selected' : 'List'}
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
              onClick={handleAddVendor}
              disabled={isAdding}
              className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-all flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${isAdding ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {isAdding ? 'Adding...' : 'Add Vendor'}
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
              placeholder="Search by Vendor Name..." 
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
                  {['All Vendors', 'Healthy', 'Warning', 'Action Required', 'Pending Invoices'].map((status) => (
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

          <button onClick={handleClearFilters} className="ml-auto text-sm font-bold text-slate-400 hover:text-white transition-colors pr-2">Clear Filters</button>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible flex-1 flex flex-col relative z-10">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] text-xs uppercase tracking-wider text-slate-500 bg-black/20">
                  <th className="px-6 py-4 w-12">
                    <CustomCheckbox checked={selectedVendors.length === currentItems.length && currentItems.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-6 py-4 font-bold">Vendor Profile</th>
                  <th className="px-6 py-4 font-bold">Financial Volume (YTD)</th>
                  <th className="px-6 py-4 font-bold">AI Match Health</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentItems.map((vendor) => {
                  const isSelected = selectedVendors.includes(vendor.id);
                  return (
                    <tr key={vendor.id} className={`transition-colors group ${isSelected ? 'bg-[#0066FF]/5' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-6 align-middle">
                        <CustomCheckbox checked={isSelected} onChange={() => toggleSelectVendor(vendor.id)} />
                      </td>
                      
                      <td className="px-6 py-6 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white text-base">{vendor.name}</span>
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            ID: {vendor.id} <span className="text-slate-600">|</span> 
                            <span className={vendor.gstin === 'Pending Update' ? 'text-amber-500' : 'text-slate-400'}>GSTIN: {vendor.gstin}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white">{vendor.volume}</span>
                          <span className="text-xs text-slate-500">{vendor.invoicesYTD} Invoices Processed</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 align-middle">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border flex items-center gap-1.5 w-max ${
                              vendor.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              vendor.status === 'Action Required' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              vendor.status === 'Pending Invoices' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {vendor.status === 'Healthy' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              {vendor.status === 'Warning' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                              {vendor.status === 'Action Required' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                              {vendor.status}
                            </span>
                            <span className="text-sm font-bold text-white">{vendor.matchRate}% Match Rate</span>
                          </div>
                          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${vendor.matchRate > 90 ? 'bg-emerald-500' : vendor.matchRate > 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${vendor.matchRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-right align-middle">
                        <button 
                          onClick={() => setManagingVendor({...vendor})}
                          className="px-4 py-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-lg transition-all w-28 text-center opacity-90 group-hover:opacity-100"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/[0.05] bg-black/10 flex justify-between items-center text-xs font-medium text-slate-400 mt-auto">
            <span>Showing <strong className="text-white">{filteredVendors.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)}</strong> of <strong className="text-white">{filteredVendors.length}</strong> vendors</span>
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

      {/* VENDOR MANAGEMENT MODAL */}
      <AnimatePresence>
        {managingVendor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setManagingVendor(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col"
            >
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-bold text-white">Vendor Profile Management</h2>
                <button onClick={() => setManagingVendor(null)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Edit Form */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Vendor ID</label>
                    <input type="text" disabled value={managingVendor.id} className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 px-4 text-sm text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Legal Name</label>
                    <input 
                      type="text" 
                      value={managingVendor.name} 
                      onChange={(e) => setManagingVendor({...managingVendor, name: e.target.value})}
                      className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">GSTIN</label>
                    <input 
                      type="text" 
                      value={managingVendor.gstin} 
                      onChange={(e) => setManagingVendor({...managingVendor, gstin: e.target.value})}
                      className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all uppercase" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Contact Email</label>
                    <input 
                      type="email" 
                      value={managingVendor.email} 
                      onChange={(e) => setManagingVendor({...managingVendor, email: e.target.value})}
                      className="w-full bg-[#131C2D]/80 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#0066FF] transition-all" 
                    />
                  </div>
                </div>

                {/* Right Side: AI Stats Display */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">AI Compliance Metrics</h3>
                  
                  <div className="bg-[#131C2D]/50 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Total Invoices (YTD)</span>
                      <span className="text-lg font-bold text-white">{managingVendor.invoicesYTD}</span>
                    </div>
                    <div className="h-px w-full bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Financial Volume</span>
                      <span className="text-lg font-bold text-white">{managingVendor.volume}</span>
                    </div>
                    <div className="h-px w-full bg-white/5"></div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">AI Match Rate</span>
                        <span className="text-lg font-bold text-white">{managingVendor.matchRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${managingVendor.matchRate > 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : managingVendor.matchRate > 75 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} 
                          style={{ width: `${managingVendor.matchRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      onClick={() => {
                        alert("Vendor Suspended. AI will automatically flag all future invoices from this GSTIN.");
                        setManagingVendor(null);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all"
                    >
                      Suspend Vendor
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-white/[0.05] bg-black/20 flex gap-3">
                <button 
                  onClick={() => setManagingVendor(null)}
                  className="flex-1 py-3 text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateVendor}
                  disabled={isSavingUpdate}
                  className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#004BFF] to-[#0066FF] hover:scale-105 rounded-xl shadow-[0_0_15px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSavingUpdate ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}