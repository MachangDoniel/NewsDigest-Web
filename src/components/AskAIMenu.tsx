import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, ExternalLink, Bot, Check, Copy } from 'lucide-react';
import { SavedItem, Mcq, PaperId, PAPERS } from '../types';

interface AskAIMenuProps {
  story?: SavedItem;
  mcq?: Mcq;
  paper?: PaperId;
  onOpenInAppChat: (prompt: string, contextTitle: string) => void;
  triggerButton?: React.ReactNode;
}

export const AskAIMenu: React.FC<AskAIMenuProps> = ({
  story,
  mcq,
  paper,
  onOpenInAppChat,
  triggerButton,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedApp, setCopiedApp] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const generatePrompt = (): { prompt: string; title: string } => {
    if (story) {
      const isBangla = story.paper === 'prothomalo';
      const parts = [
        "I'm preparing for the Bangladesh Civil Service (BCS) exam. Explain this news simply: the background, why it matters, and 3 likely exam questions with answers.",
        '',
        `Source: ${PAPERS[story.paper].name}, ${story.date}`,
        `Headline: ${story.item.sourceHeadline || story.item.headline}`,
      ];

      if (story.item.keyFacts && story.item.keyFacts.length > 0) {
        parts.push(`Key facts: ${story.item.keyFacts.join('; ')}`);
      }

      if (story.item.excerpt) {
        parts.push(`From the paper: ${story.item.excerpt}`);
      } else if (story.item.bullets) {
        parts.push(`Summary: ${story.item.bullets.join(' ')}`);
      }

      if (isBangla) {
        parts.push('', 'Please answer in Bangla (বাংলা).');
      }

      return {
        prompt: parts.join('\n'),
        title: story.item.headline,
      };
    }

    if (mcq) {
      const isBangla = paper === 'prothomalo';
      const optionsText = mcq.options
        .map((opt, i) => `${['A', 'B', 'C', 'D'][i] || i + 1}. ${opt}`)
        .join('  ');

      const parts = [
        "I'm preparing for the BCS exam. Explain why the answer to this MCQ is correct, why the other options are wrong, and give the background I should remember.",
        '',
        `Question: ${mcq.question}`,
        `Options: ${optionsText}`,
        `Correct Answer: ${mcq.answer}`,
      ];

      if (isBangla) {
        parts.push('', 'Please answer in Bangla (বাংলা).');
      }

      return {
        prompt: parts.join('\n'),
        title: mcq.question,
      };
    }

    return {
      prompt: "I'm preparing for the Bangladesh Civil Service (BCS) exam. Help explain current affairs.",
      title: 'Current Affairs',
    };
  };

  const handlePick = async (appId: string) => {
    const { prompt, title } = generatePrompt();

    if (appId === 'inapp') {
      setIsOpen(false);
      onOpenInAppChat(prompt, title);
      return;
    }

    // Copy prompt to clipboard
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedApp(appId);
      setTimeout(() => setCopiedApp(null), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }

    const encoded = encodeURIComponent(prompt.slice(0, 2000));
    let url = '';

    switch (appId) {
      case 'chatgpt':
        url = `https://chatgpt.com/?q=${encoded}`;
        break;
      case 'gemini':
        url = `https://gemini.google.com/app`;
        break;
      case 'claude':
        url = `https://claude.ai/new?q=${encoded}`;
        break;
      case 'grok':
        url = `https://grok.com/?q=${encoded}`;
        break;
      case 'perplexity':
        url = `https://www.perplexity.ai/search?q=${encoded}`;
        break;
      case 'copilot':
        url = `https://copilot.microsoft.com/?q=${encoded}`;
        break;
      case 'deepseek':
        url = `https://chat.deepseek.com/`;
        break;
      default:
        url = `https://chatgpt.com/?q=${encoded}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {triggerButton || (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#007aff] hover:text-[#0051a8] transition-colors p-1"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 p-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Ask an AI Mentor
          </div>

          {/* In-app BCS Summary */}
          <button
            onClick={() => handlePick('inapp')}
            className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-[#007aff] dark:text-[#0a84ff] hover:bg-[#007aff]/10 transition-colors font-semibold"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>BCS summary (in app)</span>
            </div>
            <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] dark:text-[#0a84ff] px-1.5 py-0.5 rounded font-bold">
              Instant
            </span>
          </button>

          <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />

          {/* External AI Apps */}
          <div className="space-y-0.5">
            {[
              { id: 'chatgpt', name: 'ChatGPT' },
              { id: 'gemini', name: 'Gemini' },
              { id: 'claude', name: 'Claude' },
              { id: 'grok', name: 'Grok' },
              { id: 'perplexity', name: 'Perplexity' },
              { id: 'deepseek', name: 'DeepSeek' },
            ].map((app) => (
              <button
                key={app.id}
                onClick={() => handlePick(app.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-xs"
              >
                <span>Ask {app.name}</span>
                <span className="text-neutral-400">
                  {copiedApp === app.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="px-3 pt-2 pb-1 text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 border-t border-black/5 dark:border-white/5 mt-1">
            <Copy className="w-3 h-3" />
            <span>Copies exam prompt to clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
};
