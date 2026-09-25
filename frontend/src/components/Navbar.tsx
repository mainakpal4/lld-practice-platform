import React from 'react';
import { Layers, BookOpen, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'practice';
  problemTitle?: string;
  onNavigateHome: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  problemTitle,
  onNavigateHome,
  onOpenDocs,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">LLD Studio</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold">
                MVP Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">CipherSchools Practice Platform</p>
          </div>
        </div>

        {currentView === 'practice' && problemTitle && (
          <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span
              className="hover:text-emerald-700 cursor-pointer transition"
              onClick={onNavigateHome}
            >
              Problems
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{problemTitle}</span>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDocs}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-lg transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Architecture & Rubric</span>
          </button>

          <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300 shadow-sm">
              MF
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800">Learner Candidate</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Active Session
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
