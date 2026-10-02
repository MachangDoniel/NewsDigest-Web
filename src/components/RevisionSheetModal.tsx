import React, { useState } from 'react';
import { X, Printer, Copy, Check, Download, FileText } from 'lucide-react';
import { Digest, PAPERS } from '../types';
import { formatDhakaPretty } from '../services/store';

interface RevisionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  digests: Digest[];
}

export const RevisionSheetModal: React.FC<RevisionSheetModalProps> = ({
  isOpen,
  onClose,
  date,
  digests,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Flatten all items
  const allItems = digests.flatMap((d) =>
    d.sections.flatMap((s) =>
      s.items.map((item) => ({
        paper: d.paper,
        category: s.category,
        item,
      }))
    )
  );

  const keyFactsList = Array.from(
    new Set(allItems.flatMap((i) => i.item.keyFacts || []))
  );

  const categories = [
    'Bangladesh Affairs',
    'International Affairs',
    'Economy',
    'Science & Tech',
    'Environment',
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = async () => {
    const lines = [
      `# BCS DAILY CURRENT AFFAIRS BRIEFING`,
      `**Date**: ${date} (${formatDhakaPretty(date)})`,
      `**Sources**: The Daily Star & Prothom Alo`,
      '',
      `---`,
      '',
      `## 📌 Key Examination Facts To Memorize`,
      ...keyFactsList.map((fact) => `- ${fact}`),
      '',
    ];

    categories.forEach((cat) => {
      const catItems = allItems.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        lines.push(`## ${cat}`);
        catItems.forEach((it) => {
          lines.push(`### ${it.item.headline}`);
          lines.push(`*Source: ${PAPERS[it.paper].name} (Page ${it.item.page})*`);
          (it.item.bullets || []).forEach((b) => lines.push(`- ${b}`));
          lines.push('');
        });
      }
    });

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Controls Toolbar (hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                BCS Examination Daily Revision Sheet
              </h3>
              <p className="text-xs text-stone-500">
                {date} · {formatDhakaPretty(date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy for Notion / Anki'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Broadsheet Revision Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-serif leading-relaxed space-y-6 bg-white selection:bg-amber-100">
          {/* Masthead */}
          <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1">
            <div className="text-[11px] font-sans uppercase tracking-[0.25em] text-stone-500 font-bold">
              Bangladesh Civil Service Examination Digest
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight">
              DAILY REVISION BRIEFING
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs font-sans text-stone-600 pt-1">
              <span>{formatDhakaPretty(date)}</span>
              <span>•</span>
              <span>The Daily Star & Prothom Alo</span>
              <span>•</span>
              <span>Dhaka Edition</span>
            </div>
          </div>

          {/* Key Facts Rapid Memorizer Banner */}
          {keyFactsList.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                <span>⚡ High-Frequency Facts for Prelims & Viva</span>
              </h3>
              <div className="flex flex-wrap gap-2 text-xs font-sans">
                {keyFactsList.map((fact, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-stone-200 rounded font-semibold text-stone-900"
                  >
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {categories.map((category) => {
              const items = allItems.filter((i) => i.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <div className="border-b border-stone-300 pb-1 flex items-baseline justify-between">
                    <h2 className="text-base font-sans font-bold text-stone-900 uppercase tracking-wider">
                      {category}
                    </h2>
                    <span className="text-xs font-sans text-stone-500">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {items.map((it, idx) => (
                      <article key={idx} className="space-y-1.5 text-xs sm:text-sm">
                        <h4 className="font-bold text-stone-950 leading-snug font-bangla text-base">
                          {it.item.headline}
                        </h4>

                        <div className="text-[11px] font-sans text-stone-500">
                          {PAPERS[it.paper].name} · Page {it.item.page}
                          {it.item.bcsRelevance === 'high' && ' · High Relevance 🔥'}
                        </div>

                        {it.item.bullets && (
                          <ul className="space-y-1 text-stone-700 font-bangla pl-3 list-disc">
                            {it.item.bullets.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {it.item.keyFacts && it.item.keyFacts.length > 0 && (
                          <div className="text-[11px] font-sans text-stone-600 font-medium">
                            Facts: {it.item.keyFacts.join(' · ')}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="border-t border-stone-200 pt-4 text-center text-xs font-sans text-stone-400">
            NewsDigest Web Edition · Prepared for Civil Service Study Revision
          </div>
        </div>
      </div>
    </div>
  );
};
