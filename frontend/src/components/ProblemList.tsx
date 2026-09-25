import React from 'react';
import { ProblemSummary, Difficulty } from '../types';
import { ArrowRight, BookCheck, Cpu, CheckCircle } from 'lucide-react';

interface ProblemListProps {
  problems: ProblemSummary[];
  onSelectProblem: (id: string) => void;
  isLoading: boolean;
}

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  INTERMEDIATE: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  ADVANCED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onSelectProblem,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Loading LLD Problem Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* GeeksforGeeks-Style Hero Banner */}
      <div className="mb-10 bg-gradient-to-r from-emerald-50 via-green-50/50 to-white p-8 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-100/50 rounded-full blur-2xl -z-0"></div>
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Deliberate Practice for Software Engineers
            </span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Master Low-Level System Design
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
            Practice real-world LLD problems (Parking Lot, Elevator, Vending Machine, Rate Limiter). Model classes, formulate polymorphic interfaces, preview live Mermaid diagrams, and receive explainable rubric-based feedback to track your architectural growth.
          </p>
        </div>

        {/* Practice Loop Flow Indicator */}
        <div className="mt-6 pt-5 border-t border-emerald-200/70 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 relative z-10">
          <span className="text-slate-800 font-bold">The Practice Loop:</span>
          <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-semibold shadow-xs">
            1. Select Problem
          </span>
          <span className="text-slate-400 font-bold">&rarr;</span>
          <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
            2. Model Classes & Diagrams
          </span>
          <span className="text-slate-400 font-bold">&rarr;</span>
          <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
            3. Submit & Validate
          </span>
          <span className="text-slate-400 font-bold">&rarr;</span>
          <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">
            4. Rubric Feedback
          </span>
          <span className="text-slate-400 font-bold">&rarr;</span>
          <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold shadow-xs">
            5. Review & Re-attempt
          </span>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem) => {
          const diff = difficultyColors[problem.difficulty] || difficultyColors.INTERMEDIATE;
          return (
            <div
              key={problem.id}
              className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-emerald-500 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    {problem.domain}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {problem.description}
                </p>

                {/* Key Concepts */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {problem.keyConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {problem.requirementsCount} Requirements Listed
                </span>

                <button
                  onClick={() => onSelectProblem(problem.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition group-hover:translate-x-0.5"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
