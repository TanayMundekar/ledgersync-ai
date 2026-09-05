import React from 'react';

export default function InvoiceCard({ title, value, glowColor, children }) {
  // Map standard colors to Tailwind classes for the ambient glow
  const glowVariants = {
    blue: "bg-[#0066FF]/10 group-hover:bg-[#0066FF]/20",
    amber: "bg-amber-500/10 group-hover:bg-amber-500/20",
    emerald: "bg-emerald-500/10 group-hover:bg-emerald-500/20"
  };

  return (
    <div className="bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl relative overflow-hidden group flex flex-col justify-between transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full transition-all ${glowVariants[glowColor] || glowVariants.blue}`}></div>
      
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
        {value && <p className="text-3xl font-bold text-white mb-2">{value}</p>}
      </div>
      
      {children}
    </div>
  );
}