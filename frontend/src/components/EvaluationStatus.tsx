import React, { useEffect } from 'react';
import { Attempt } from '../types';
import { api } from '../api/client';
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, Sparkles, Layers } from 'lucide-react';

interface EvaluationStatusProps {
  attempt: Attempt;
  onAttemptUpdated: (updated: Attempt) => void;
}

export const EvaluationStatus: React.FC<EvaluationStatusProps> = ({
  attempt,
  onAttemptUpdated,
}) => {
  const isFinished = attempt.status === 'COMPLETED' || attempt.status === 'FAILED';

  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(async () => {
      try {
        const latest = await api.getAttempt(attempt.id);
        if (latest.status !== attempt.status || latest.evaluationResult) {
          onAttemptUpdated(latest);
        }
      } catch (err) {
        console.error('Failed to poll attempt status:', err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [attempt.id, attempt.status, isFinished, onAttemptUpdated]);

  const handleRetry = async () => {
    try {
      await api.retryAttempt(attempt.id);
      const latest = await api.getAttempt(attempt.id);
      onAttemptUpdated(latest);
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Attempt #{attempt.attemptNumber} Evaluation Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-mono">Attempt ID: {attempt.id}</p>
          </div>
        </div>

        <div>
          {attempt.status === 'SUBMITTED' && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Queued in Job Runner</span>
            </span>
          )}

          {attempt.status === 'EVALUATING' && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Evaluating Rubric & SOLID</span>
            </span>
          )}

          {attempt.status === 'COMPLETED' && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evaluation Complete</span>
            </span>
          )}

          {attempt.status === 'FAILED' && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Evaluation Failed</span>
            </span>
          )}
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="py-6">
        <div className="grid grid-cols-3 gap-2 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                attempt.status !== 'DRAFT'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">Submitted</span>
            <span className="text-[11px] text-slate-500 font-medium">Persisted safely</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                attempt.status === 'EVALUATING'
                  ? 'bg-emerald-600 text-white animate-pulse ring-4 ring-emerald-100'
                  : attempt.status === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">Rubric Analysis</span>
            <span className="text-[11px] text-slate-500 font-medium">Rules & AI reasoning</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                attempt.status === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : attempt.status === 'FAILED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">Explainable Feedback</span>
            <span className="text-[11px] text-slate-500 font-medium">Evidence & Suggestions</span>
          </div>
        </div>
      </div>

      {/* Failure State & Recovery */}
      {attempt.status === 'FAILED' && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800">Evaluator Encountered an Error:</p>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">{attempt.errorMessage || 'Unknown evaluator failure.'}</p>
            <p className="text-[11px] text-slate-600 mt-1">Your submission was safely preserved. You can retry evaluation now.</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Evaluation</span>
          </button>
        </div>
      )}
    </div>
  );
};
