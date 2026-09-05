import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const floatAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: [0, -15, 0], 
    transition: { 
      opacity: { duration: 1 },
      y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    } 
  }
};

const floatAnimationReverse = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: [0, 15, 0], 
    transition: { 
      opacity: { duration: 1, delay: 0.2 },
      y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    } 
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030509] text-slate-300 font-sans overflow-hidden selection:bg-[#0066FF]/30">
      
      {/* 1. NAVIGATION */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-between items-center px-8 md:px-16 py-8 max-w-[1400px] mx-auto relative z-50"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg className="w-8 h-9 drop-shadow-[0_0_10px_rgba(0,102,255,0.5)]" viewBox="0 0 269 299" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z" fill="#E0F2FE"/>
            <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z" fill="#004BFF"/>
          </svg>
          <span className="text-[20px] font-bold text-white tracking-tight">LedgerSync AI</span>
        </div>
        
        {/* Log In Button */}
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <header className="relative max-w-[1400px] mx-auto px-8 md:px-16 pt-12 pb-32 flex flex-col md:flex-row items-center gap-12 min-h-[80vh]">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex-1 relative z-20"
        >
          <motion.h1 variants={fadeUp} className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-tight mb-8 max-w-xl text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            Reconcile ledgers & manage cash flow
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed font-medium">
            For enterprises who want precision from their financial data — there's LedgerSync AI. Automate matching in a tap.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <Link to="/onboarding" className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#004BFF] to-[#0066FF] font-medium text-sm transition-transform hover:scale-105 shadow-[0_0_25px_rgba(0,102,255,0.4)] border border-blue-400/30 text-white">
              Get Started
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: Floating Enhanced App Cards (One Dark, One Blue) */}
        <div className="flex-1 relative w-full min-h-[600px] flex items-center justify-center pointer-events-none">
          {/* Ambient Glows */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#004BFF] via-[#0066FF] to-[#E0F2FE]/20 blur-[100px] rounded-full mix-blend-screen transform -rotate-12"
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border-[40px] border-transparent border-b-[#0066FF]/30 border-r-[#004BFF]/20 rounded-[100%] blur-xl transform rotate-12 -z-10"
          ></motion.div>

          {/* Top Card: Dark Glassmorphic Card (Enhanced Exceptions / Invoice Match) */}
          <motion.div 
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            className="absolute top-8 right-12 w-[360px] bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/10 rounded-2xl transform rotate-6 shadow-[0_20px_50px_rgba(0,102,255,0.25)] p-6 flex flex-col justify-between overflow-hidden z-20"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-10"></div>
            <div className="relative z-10 flex justify-between items-center mb-4">
               <span className="font-bold text-sm text-white">INV-2026-090</span>
               <span className="text-[10px] font-bold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">Mismatch</span>
            </div>
            <div className="relative z-10 flex flex-col gap-1 mb-4">
              <span className="text-xs text-slate-400">Global Tech • Variance of ₹500</span>
              <span className="text-xs text-[#0066FF] font-medium">✦ AI Confidence: 42.1%</span>
            </div>
            <div className="relative z-10 flex justify-between items-end pt-3 border-t border-white/10">
               <span className="font-bold text-xl text-white">₹45,500</span>
               <span className="text-xs text-slate-500">ERP PO: ₹45,000</span>
            </div>
          </motion.div>

          {/* Bottom Card: Vivid Blue Multi-Way Engine Card */}
          <motion.div 
            variants={floatAnimationReverse}
            initial="initial"
            animate="animate"
            className="absolute bottom-6 left-6 w-[310px] h-[310px] bg-gradient-to-br from-[#004BFF] to-[#0066FF] rounded-3xl transform -rotate-6 shadow-[0_20px_50px_rgba(0,102,255,0.35)] p-6 flex flex-col border border-blue-400/30 justify-between z-10"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md text-white backdrop-blur-sm">Multi-Way Engine</span>
              <h3 className="text-2xl font-bold text-white mt-3">Active Sync</h3>
            </div>
            
            <div className="flex flex-col gap-2.5 my-auto">
              <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center border border-white/10 backdrop-blur-sm">
                <span className="text-xs text-blue-100 font-medium">Purchase Orders</span>
                <span className="text-sm font-bold text-white">1,420 POs</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center border border-white/10 backdrop-blur-sm">
                <span className="text-xs text-blue-100 font-medium">GRNs Verified</span>
                <span className="text-sm font-bold text-white">1,395 GRNs</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-white/20">
              <span className="text-xs font-medium text-white">ERP Connected</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_#6ee7b7]"></span>
            </div>
          </motion.div>

        </div>
      </header>

      {/* 3. THE PROBLEM (The Bottleneck) */}
      <section className="relative py-32 border-t border-white/[0.05] bg-[#030509]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0066FF]/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-[1400px] mx-auto px-8 md:px-16"
        >
          <motion.div variants={fadeUp} className="mb-20 max-w-3xl">
            <h2 className="text-[13px] font-bold text-[#0066FF] uppercase tracking-widest mb-3">The Bottleneck</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Manual ledgers are a liability.</h3>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Modern enterprises process thousands of vendor invoices monthly. Relying on legacy ERP exports and spreadsheet-based matching introduces critical points of failure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} className="p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl hover:bg-[#0B0F19]/90 transition-all relative overflow-hidden group shadow-[0_15px_40px_-15px_rgba(0,102,255,0.15)]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-4 -bottom-8 text-[120px] font-bold text-[#0066FF]/5 select-none transition-transform duration-700 group-hover:scale-110 group-hover:text-[#0066FF]/10">01</div>
              <h4 className="text-white font-bold mb-4 text-2xl relative z-10">Lost ITC Claims</h4>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">Mismatched GSTINs or invoice values result in unclaimed Input Tax Credit, directly impacting working capital.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl hover:bg-[#0B0F19]/90 transition-all relative overflow-hidden group shadow-[0_15px_40px_-15px_rgba(0,102,255,0.15)] md:mt-12">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-4 -bottom-8 text-[120px] font-bold text-[#0066FF]/5 select-none transition-transform duration-700 group-hover:scale-110 group-hover:text-[#0066FF]/10">02</div>
              <h4 className="text-white font-bold mb-4 text-2xl relative z-10">Delayed Closures</h4>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">Finance teams spend weeks hunting down discrepancies across siloed procurement and accounting systems.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl hover:bg-[#0B0F19]/90 transition-all relative overflow-hidden group shadow-[0_15px_40px_-15px_rgba(0,102,255,0.15)] md:mt-24">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-4 -bottom-8 text-[120px] font-bold text-[#0066FF]/5 select-none transition-transform duration-700 group-hover:scale-110 group-hover:text-[#0066FF]/10">03</div>
              <h4 className="text-white font-bold mb-4 text-2xl relative z-10">Vendor Friction</h4>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">Manual review processes delay payment cycles, damaging critical supply chain relationships.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 4. THE SOLUTION (The Bento Grid) */}
      <section className="relative py-32 bg-[#030509]">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#004BFF]/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-[1400px] mx-auto px-8 md:px-16"
        >
          <motion.div variants={fadeUp} className="mb-20">
            <h2 className="text-[13px] font-bold text-[#0066FF] uppercase tracking-widest mb-3">The Infrastructure</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Automated. Verifiable. Secure.</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            <motion.div variants={fadeUp} className="md:col-span-8 p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <svg className="w-80 h-80 -mb-12 -mr-12" viewBox="0 0 269 299" fill="none" stroke="#0066FF" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z"/>
                  <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z"/>
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 relative z-10">AI-Powered Multi-Way Matching</h4>
              <p className="text-slate-400 max-w-md leading-relaxed relative z-10 text-lg font-medium">
                Our core engine ingests raw invoice data, POs, and GRNs, automatically reconciling them against your ERP ledger down to the line-item level with total precision.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-4 p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl flex flex-col shadow-2xl group hover:border-[#0066FF]/40 transition-colors">
              <h4 className="text-2xl font-bold text-white mb-4">Native ERP Sync</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-auto font-medium">
                Bi-directional integration with SAP, Tally Prime, and Oracle NetSuite architectures.
              </p>
              <div className="flex gap-3 mt-8">
                <div className="px-4 py-2 bg-[#0066FF]/10 border border-[#0066FF]/30 rounded-lg text-xs font-bold text-blue-200">SAP</div>
                <div className="px-4 py-2 bg-[#0066FF]/10 border border-[#0066FF]/30 rounded-lg text-xs font-bold text-blue-200">Tally</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-4 p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl shadow-2xl group hover:border-[#0066FF]/40 transition-colors">
              <h4 className="text-2xl font-bold text-white mb-4">Role-Based Access</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Granular permissions ensuring the right team members review, approve, or flag exceptions securely.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-8 p-10 border border-[#0066FF]/20 rounded-3xl bg-[#0B0F19]/60 backdrop-blur-2xl flex flex-col justify-center shadow-2xl relative overflow-hidden group hover:border-[#0066FF]/40 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/5 blur-[60px] rounded-full group-hover:bg-[#0066FF]/10 transition-colors duration-500"></div>
              <h4 className="text-2xl font-bold text-white mb-4 relative z-10">Enterprise-Grade Security</h4>
              <p className="text-slate-400 max-w-2xl leading-relaxed text-lg font-medium relative z-10">
                Your financial data never leaves your isolated tenant environment. Built on a zero-trust architecture with complete audit logging for every single action taken within the platform.
              </p>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* 5. THE CLOSER */}
      <section className="relative py-32 overflow-hidden border-t border-[#0066FF]/10 bg-gradient-to-b from-[#030509] to-[#004BFF]/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#0066FF]/20 rounded-full blur-[150px] -z-10"></div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="max-w-[1400px] mx-auto px-8 md:px-16 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Ready to secure your financial operations?
          </h2>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Deploy LedgerSync AI in minutes. Connect your ERP and run your first automated reconciliation today.
          </p>
          <div className="flex justify-center">
            <Link to="/onboarding" className="px-10 py-4 bg-gradient-to-r from-[#004BFF] to-[#0066FF] text-white font-bold rounded-full shadow-[0_0_30px_rgba(0,102,255,0.4)] border border-blue-400/30 transition-transform hover:scale-105">
              Create Enterprise Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 6. FOOTER */}
      <footer className="relative bg-[#020305] pt-24 pb-12 border-t border-white/[0.02]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-16 mb-16"
        >
          
          <motion.div variants={fadeUp} className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-9" viewBox="0 0 269 299" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M133.723 0L0 78.6883V140.685L66.8613 180.15L202.916 99.8434L220.939 110.482L84.9332 190.759L134.5 220.016L269 140.627V79.4831L202.916 40.4769L66.8613 120.784L48.0608 109.687L183.48 29.7552L133.723 0Z" fill="#E0F2FE"/>
                <path d="M0 161.897L134.5 240.746L269 161.897V220.038L134.5 298.888L0 220.038V161.897Z" fill="#004BFF"/>
              </svg>
              <span className="text-xl font-bold text-white tracking-tight">LedgerSync AI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed pr-4 font-medium">
              Automating enterprise financial operations with precision multi-way matching and compliance verification.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Reconciliation Engine</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">ERP Integrations</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Security Overview</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Pricing</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Resources</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Help Center</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0066FF] transition-colors">Terms of Service</a></li>
            </ul>
          </motion.div>

        </motion.div>
        
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 pt-8 border-t border-white/[0.05] text-xs font-medium text-slate-600 flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 LedgerSync AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}