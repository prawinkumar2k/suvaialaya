import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Volume2 } from "lucide-react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

const CONVERSATION_FLOW = [
  { trigger: "Kari Virundhu enna?", response: "Madurai oda parambarai virundhu saar. Inga 24+ authentic dishes irukku." },
  { trigger: "Slot available ah?", response: "Indru 7 PM slot la 12 seats available irukku." },
  { trigger: "Enakku book pannunga.", response: "Kandippa saar. Ungal peyarai sollunga." }
];

export function SuvaiBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-0", sender: "bot", text: "Vanakkam! Naan SuvaiBot. Madurai-ku Ungalai Anbudan Varaverkiren." }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), sender: "user", text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      let botResponse = "Kandippa, ungal details sollunga.";
      if (step < CONVERSATION_FLOW.length) {
        botResponse = CONVERSATION_FLOW[step].response;
        setStep(prev => prev + 1);
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end pointer-events-none">
      
      {/* Persistent Speech Bubble when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-white text-black px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border-2 border-[#C9841A]/30 mb-4 max-w-[200px] pointer-events-auto cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <p className="text-xs font-bold leading-snug">
              Ready to Explore Madurai? <br/> Ask me about events and food!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 sm:w-96 bg-[#16120D] border-2 border-[#C9841A]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans mb-4 pointer-events-auto"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#C9841A]/20 to-transparent border-b border-[#C9841A]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C9841A] flex items-center justify-center text-black shadow-lg shadow-[#C9841A]/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold tracking-widest uppercase font-display">SuvaiBot</h3>
                  <p className="text-[10px] text-[#C9841A] uppercase tracking-widest font-bold">Cultural Guide</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="h-[280px] overflow-y-auto p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-opacity-5">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md ${m.sender === 'user' ? 'bg-[#C9841A] text-black rounded-tr-sm font-medium' : 'bg-[#2A241B] border border-[#C9841A]/20 text-white rounded-tl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {step < CONVERSATION_FLOW.length && (
              <div className="px-4 pb-2 pt-2 bg-[#16120D] flex flex-wrap gap-2 border-t border-white/5">
                <button 
                  onClick={() => setInput(CONVERSATION_FLOW[step].trigger)}
                  className="px-4 py-2 bg-[#C9841A]/10 border border-[#C9841A]/30 rounded-full text-xs font-bold text-[#C9841A] hover:bg-[#C9841A] hover:text-black transition-all"
                >
                  {CONVERSATION_FLOW[step].trigger}
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-[#16120D] flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Madurai..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9841A]/50 transition-colors"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 rounded-full bg-[#C9841A] flex items-center justify-center text-black hover:bg-[#E09528] transition-colors shadow-lg shadow-[#C9841A]/20"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cute Robot Mascot Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[160] pointer-events-auto"
      >
        <div className="w-24 h-24 relative flex items-center justify-center">
          {/* Audio wave effects on sides */}
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2], scaleX: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-2 text-cyan-400"><Volume2 size={16} /></motion.div>
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2], scaleX: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="absolute -right-2 text-cyan-400"><Volume2 size={16} /></motion.div>
          
          {/* The robot body (custom styled to look cute) */}
          <div className="w-20 h-20 bg-gradient-to-b from-orange-300 to-orange-500 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            {/* Crown / Temple Gopuram Hat */}
            <div className="absolute -top-1 w-8 h-4 bg-yellow-400 rounded-t-lg border-b-2 border-orange-600" />
            
            {/* Face screen */}
            <div className="w-14 h-10 bg-gray-900 rounded-xl mt-2 flex items-center justify-center gap-2 border-2 border-gray-700">
              {/* Eyes */}
              <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} className="w-3 h-4 bg-cyan-400 rounded-full" />
              <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} className="w-3 h-4 bg-cyan-400 rounded-full" />
            </div>
            
            {/* Smile */}
            <div className="w-4 h-1 border-b-2 border-orange-800 rounded-full mt-1 opacity-50" />
          </div>
        </div>
      </motion.button>
    </div>
  );
}
