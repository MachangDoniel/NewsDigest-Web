import React from 'react';
import { Newspaper, CheckSquare, Archive, BookOpen, Settings } from 'lucide-react';

interface TabBarProps {
  activeTab: 'today' | 'practice' | 'archive' | 'papers' | 'settings';
  onTabChange: (tab: 'today' | 'practice' | 'archive' | 'papers' | 'settings') => void;
  mcqCount?: number;
}

interface TabItem {
  id: 'today' | 'practice' | 'archive' | 'papers' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  mcqCount = 0,
}) => {
  const tabs: TabItem[] = [
    { id: 'today', label: 'Today', icon: Newspaper },
    { id: 'practice', label: 'Practice', icon: CheckSquare, badge: mcqCount > 0 ? mcqCount : undefined },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'papers', label: 'Papers', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#f2f2f7]/90 dark:bg-[#161618]/90 backdrop-blur-xl border-t border-black/8 dark:border-white/10 pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center relative py-1 transition-transform active:scale-90 ${
                isActive
                  ? 'text-[#007aff] dark:text-[#0a84ff]'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 bg-[#007aff] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
