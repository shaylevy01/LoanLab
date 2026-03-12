
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Applicant, ChatMessage, DecisionResult, SystemMode } from '../types';
import { generateBankerResponse } from '../services/geminiService';

interface Props {
  applicant: Applicant;
  decision: DecisionResult;
  mode: SystemMode;
}

export const ChatInterface: React.FC<Props> = ({ applicant, decision, mode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: mode === 'A' 
        ? `שלום ${applicant.name}. אני הבנקאי הדיגיטלי שלך. הבקשה שלך עובדה.` 
        : `שלום ${applicant.name}. אני כאן כדי לעזור לך להבין את ההחלטה ואת הזכויות שלך.`,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when mode or applicant changes
  useEffect(() => {
    setMessages([{
      role: 'model',
      text: mode === 'A' 
        ? `שלום ${applicant.name}. אני הבנקאי הדיגיטלי שלך. הבקשה שלך עובדה.` 
        : `שלום ${applicant.name}. אני כאן כדי לעזור לך להבין את ההחלטה ואת הזכויות שלך.`,
      timestamp: new Date()
    }]);
  }, [mode, applicant.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const responseText = await generateBankerResponse(newHistory, applicant, decision, mode);
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'שגיאה בחיבור.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className={`p-4 border-b ${mode === 'A' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
        <h3 className="font-bold flex items-center gap-2">
          <Bot size={20} />
          בנקאי דיגיטלי ({mode === 'A' ? 'מודל ישן' : 'מודל אתי'})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' 
                ? 'bg-blue-100 text-slate-800 rounded-tr-none' 
                : 'bg-white border border-slate-200 shadow-sm text-slate-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border px-4 py-2 rounded-2xl rounded-tl-none text-xs text-slate-400">
              מקליד...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="שאל אותי על ההחלטה..."
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-slate-400"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className={`p-2 rounded-md text-white transition-colors ${
            loading ? 'bg-slate-700 text-slate-500' : (mode === 'A' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500')
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
