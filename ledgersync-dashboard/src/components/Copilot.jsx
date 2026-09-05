import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown'; // <-- CORRECT IMPORT

export default function Copilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      type: 'text',
      content: 'Hello Tanay. I am LedgerSync Copilot. I am connected to the live database. How can I assist you with your ledger today?'
    }
  ]);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 1. Capture user input and add to UI instantly
    const userText = inputValue;
    const newUserMsg = { id: Date.now(), sender: 'user', type: 'text', content: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 2. Ping the live LedgerSync Backend
      const response = await fetch('http://127.0.0.1:8000/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      // 3. Append the real Gemini API response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          type: 'text', 
          content: data.response
        }
      ]);

    } catch (error) {
      console.error("Copilot API Error:", error);
      // Fallback UI if the server is off or rate-limited
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          type: 'text',
          content: "⚠️ Copilot is currently offline or rate-limited. Please check your backend connection."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Global Floating Trigger Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-8 w-14 h-14 bg-gradient-to-br from-[#004BFF] to-[#0066FF] rounded-full shadow-[0_0_25px_rgba(0,102,255,0.4)] border border-blue-400/30 flex items-center justify-center text-white z-[100]"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </motion.button>

      {/* Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            
            {/* Invisible Backdrop (Click to close) */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />

            {/* The Copilot Panel */}
            <motion.div 
              initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
              animate={{ x: 0, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}
              exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#0B0F19]/95 backdrop-blur-3xl border-l border-white/10 flex flex-col"
            >
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between bg-gradient-to-r from-black/20 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#004BFF] to-[#0066FF] flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">LedgerSync Copilot</h2>
                    <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">● System Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 uppercase">⌘K</span>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    
                    {/* FIXED TEXT RENDERER */}
                    {msg.type === 'text' && (
                      <div className={`p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-[#0066FF] text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-sm'}`}>
                        {msg.sender === 'user' ? (
                          msg.content
                        ) : (
                          <div className="flex flex-col gap-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ul>li]:pl-1 [&>strong]:text-white">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generative UI Component */}
                    {msg.type === 'generative-ui' && (
                      <div className="flex flex-col gap-3 w-full min-w-[320px]">
                        {/* Reasoning Block */}
                        <div className="px-3 py-2 bg-black/20 border border-white/5 rounded-lg flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-400 mb-1">Process Trail</span>
                          {msg.reasoning.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-500">
                              <svg className="w-3 h-3 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              {step}
                            </div>
                          ))}
                        </div>

                        {/* Interactive UI Card */}
                        <div className="bg-[#131C2D]/80 border border-white/10 rounded-2xl p-4 shadow-lg">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-white text-sm">INV-2026-090</span>
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded border border-red-500/20">Mismatch</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="block text-[10px] text-slate-500 uppercase">Invoice Value</span>
                              <span className="text-sm font-bold text-white">₹45,500</span>
                            </div>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div>
                              <span className="block text-[10px] text-slate-500 uppercase">ERP Value</span>
                              <span className="text-sm font-bold text-white">₹45,000</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#0066FF] font-medium mb-4">✦ 42.1% Confidence: Probable freight charge inclusion.</p>
                          
                          {/* HITL Action Buttons */}
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-lg transition-colors">
                              Flag Vendor
                            </button>
                            <button className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-xs font-bold text-white rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-colors">
                              Force Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="mr-auto px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/[0.05] bg-black/20">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Copilot anything..."
                    className="w-full bg-[#131C2D] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-2 p-1.5 bg-[#0066FF] text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </form>
                <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                  <button onClick={() => setInputValue('Why is invoice INV-AI-002 mismatched?')} className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                    Explain INV-AI-002
                  </button>
                  <button onClick={() => setInputValue('Show me all pending invoices')} className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/5 hover:border-white/20 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                    List Pending Invoices
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}