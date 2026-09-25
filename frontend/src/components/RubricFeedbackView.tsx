import React from 'react';
import { EvaluationResult } from '../types';
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface RubricFeedbackViewProps {
  result: EvaluationResult;
  attemptNumber: number;
  onTryAgain: () => void;
  onViewHistory: () => void;
}

export const RubricFeedbackView: React.FC<RubricFeedbackViewProps> = ({
  result,
  attemptNumber,
  onTryAgain,
  onViewHistory,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-800 bg-emerald-50 border-emerald-500';
    if (score >= 65) return 'text-green-800 bg-green-50 border-green-500';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-500';
    return 'text-rose-800 bg-rose-50 border-rose-500';
  };

  const getScoreBarColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-emerald-600';
    if (pct >= 65) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold shadow-xs ${getScoreColor(
              result.overallScore
            )}`}
          >
            <span className="text-2xl tracking-tight font-extrabold">{result.overallScore}</span>
            <span className="text-[10px] uppercase font-mono font-bold">/ 100</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold">
                Attempt #{attemptNumber}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Evaluator: <span className="text-slate-800 font-semibold">{result.evaluatorType}</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">Rubric-Based Architectural Feedback</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-normal">
              Evaluated against SOLID principles, clean abstractions, and edge-case handling.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={onViewHistory}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-600 rounded-lg transition shadow-xs"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>View Progression</span>
          </button>

          <button
            onClick={onTryAgain}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition"
          >
            <span>Try Again (Attempt #{attemptNumber + 1})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strengths & Immediate Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.keyStrengths.length > 0 && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Key Architectural Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-800">
              {result.keyStrengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-extrabold">&bull;</span>
                  <span className="font-medium leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.improvementSuggestions.length > 0 && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>Top Refactoring Recommendations</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-800">
              {result.improvementSuggestions.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-extrabold">&bull;</span>
                  <span className="font-medium leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rubric Criteria Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Detailed Criterion Breakdown (Shape: Score &rarr; Evidence &rarr; Concern &rarr; Suggestion)
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {result.criteriaFeedback.map((crit) => {
            const pct = (crit.score / crit.maxScore) * 100;
            return (
              <div
                key={crit.criterionId}
                className="bg-white border border-slate-200 rounded-xl p-5 transition-all shadow-xs hover:border-emerald-300"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{crit.criterionName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold">
                        Weight: {crit.weight}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-900">
                      <span className="text-emerald-700">{crit.score}</span>
                      <span className="text-xs text-slate-500 font-normal"> / {crit.maxScore}</span>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(
                      crit.score,
                      crit.maxScore
                    )}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Structured Breakdown: Evidence, Concern, Suggestion */}
                <div className="space-y-2.5 text-xs">
                  {/* Evidence */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                    <span className="font-bold text-slate-700 whitespace-nowrap min-w-[70px]">
                      Evidence:
                    </span>
                    <span className="text-slate-800 font-mono text-[11px] leading-relaxed">
                      {crit.evidence || 'Analyzed candidate class definitions and structure.'}
                    </span>
                  </div>

                  {/* Concern */}
                  {crit.concern && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-amber-900 leading-relaxed font-medium">
                        <span className="font-bold mr-1.5 text-amber-950">Identified Concern:</span>
                        {crit.concern}
                      </div>
                    </div>
                  )}

                  {/* Suggestion */}
                  {crit.suggestion && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5">
                      <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-emerald-950 leading-relaxed font-medium">
                        <span className="font-bold mr-1.5 text-emerald-900">Actionable Suggestion:</span>
                        {crit.suggestion}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
