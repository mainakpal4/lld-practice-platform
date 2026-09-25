import React, { useState } from 'react';
import { AttemptProgressionReport, Attempt } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, RotateCcw } from 'lucide-react';

interface AttemptHistoryProps {
  history: AttemptProgressionReport[];
  onSelectAttempt: (attempt: Attempt) => void;
  onForkAttempt: (attempt: Attempt) => void;
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  history,
  onSelectAttempt,
  onForkAttempt,
}) => {
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(history.length - 1);

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No Attempts Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          Complete and submit your first design attempt to unlock progression tracking.
        </p>
      </div>
    );
  }

  const activeReport = history[selectedReportIndex] || history[history.length - 1];

  return (
    <div className="space-y-6">
      {/* History Timeline Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Attempt Timeline & Progression
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {history.length} Attempt{history.length > 1 ? 's' : ''} Recorded
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {history.map((report, idx) => {
            const attempt = report.currentAttempt;
            const isSelected = idx === selectedReportIndex;
            const score = attempt.evaluationResult?.overallScore ?? 0;
            const delta = report.scoreDelta;

            return (
              <button
                key={attempt.id}
                onClick={() => {
                  setSelectedReportIndex(idx);
                  onSelectAttempt(attempt);
                }}
                className={`flex-1 min-w-[140px] p-3 rounded-lg border text-left transition ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-800">
                    Attempt #{attempt.attemptNumber}
                  </span>
                  {delta !== 0 && (
                    <span
                      className={`flex items-center text-[10px] font-bold ${
                        delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {delta > 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-slate-900">
                    {attempt.evaluationResult ? score : '—'}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-medium">
                    {attempt.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progression Comparison Details */}
      {activeReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  Attempt #{activeReport.currentAttempt.attemptNumber}
                </span>
                {activeReport.previousAttempt && (
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    Compared to Attempt #{activeReport.previousAttempt.attemptNumber}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1">{activeReport.highlight}</h4>
            </div>

            <button
              onClick={() => onForkAttempt(activeReport.currentAttempt)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-600 rounded-lg transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load this Attempt into Editor</span>
            </button>
          </div>

          {/* Criteria Delta Table */}
          {activeReport.criteriaDeltas.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
                    <th className="py-2.5 px-3 font-bold">Evaluation Criterion</th>
                    <th className="py-2.5 px-3 font-bold text-right">Prev Score</th>
                    <th className="py-2.5 px-3 font-bold text-right">Current Score</th>
                    <th className="py-2.5 px-3 font-bold text-right">Progression Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {activeReport.criteriaDeltas.map((c) => {
                    const isPositive = c.delta > 0;
                    return (
                      <tr key={c.criterionId} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-sans text-slate-900 font-semibold">
                          {c.criterionName}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 font-medium">
                          {c.previousScore !== undefined ? `${c.previousScore} / ${c.maxScore}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-900 font-extrabold">
                          {c.currentScore} / {c.maxScore}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {c.delta === 0 ? (
                            <span className="text-slate-400 font-bold">0.0</span>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border border-rose-300'
                              }`}
                            >
                              {isPositive ? `+${c.delta}` : c.delta}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
