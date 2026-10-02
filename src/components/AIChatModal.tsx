import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  contextTitle: string;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextTitle,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setMessages([{ role: 'user', text: initialPrompt }]);
      fetchAIResponse([{ role: 'user', text: initialPrompt }]);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchAIResponse = async (chatHistory: Message[]) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: contextTitle,
          messages: chatHistory,
        }),
      });

      const data = await res.json();
      if (data.ok && data.text) {
        setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.message || 'Sorry, could not generate a response. Please try again.',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `Error connecting to AI service: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    fetchAIResponse(updated);
  };

  const sendSuggested = (text: string) => {
    const userMsg: Message = { role: 'user', text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    fetchAIResponse(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl h-[85vh] sm:h-[680px] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col border border-black/10 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-[#f2f2f7]/60 dark:bg-[#2c2c2e]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#007aff]/10 flex items-center justify-center text-[#007aff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>BCS Study Assistant</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.2 rounded">
                  Gemini
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs sm:max-w-md">
                {contextTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/30 flex gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => sendSuggested('বাংলায় আরও বিস্তারিতভাবে ব্যাখ্যা করুন।')}
            className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-full border border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-300 whitespace-nowrap hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors"
          >
            বাংলায় বুঝিয়ে বলো
          </button>
          <button
            onClick={() => sendSuggested('What are 3 likely BCS prelims MCQ questions on this?')}
            className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-full border border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-300 whitespace-nowrap hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors"
          >
            3 BCS Prelims MCQs
          </button>
          <button
            onClick={() => sendSuggested('Give me the exact statistics and names to memorize for viva.')}
            className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-full border border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-300 whitespace-nowrap hover:bg-[#007aff]/10 hover:text-[#007aff] transition-colors"
          >
            Viva Memorization Points
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-[#007aff] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#007aff] text-white rounded-br-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-xs shadow-xs font-bangla whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-neutral-400 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#007aff] text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">Analyzing and preparing BCS response…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 bg-[#f2f2f7]/80 dark:bg-[#161618]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: explain in Bangla, background, facts…"
              className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-bangla"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-[#007aff] text-white hover:bg-[#0062cc] disabled:opacity-40 disabled:hover:bg-[#007aff] transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
