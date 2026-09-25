import React from 'react';
import { X, CheckCircle, GitBranch, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">System Architecture & Design Decisions</h2>
              <p className="text-xs text-slate-500 font-medium">CipherSchools Engineering Assessment Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Section 1 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              1. The Practice Loop Model
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              The platform implements the explicit learner journey demanded by the brief:
            </p>
            <div className="mt-3 p-3 rounded-lg bg-emerald-950 font-mono text-xs text-emerald-300 flex items-center justify-between overflow-x-auto shadow-inner">
              <span>Choose Problem &rarr; Think/Design &rarr; Submit &rarr; Get Rubric Feedback &rarr; Review &rarr; Try Again</span>
            </div>
          </div>

          {/* Section 2: Two Change Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase mb-2">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Change Test A: Submission Format</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                <strong>Challenge:</strong> Today learner submits text. Later platform supports interactive diagrams. How much domain model changes?
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Solution:</strong> <em>Zero changes to domain logic.</em> The core domain relies on polymorphic <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800 font-mono">ISubmissionContent</code>. Adding visual diagram nodes simply introduces another class implementing the same interface.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase mb-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Change Test B: Evaluator Evolution</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                <strong>Challenge:</strong> Today feedback comes from one evaluator. Later you add a rule-based evaluator or human review. Can you add it without rewriting the practice flow?
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Solution:</strong> Solved with the <strong>Composite Pattern</strong> (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800 font-mono">CompositeEvaluator implements IEvaluator</code>). We demonstrate this live in the UI dropdown with <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800 font-mono">HumanReviewEvaluatorStub</code>.
              </p>
            </div>
          </div>

          {/* Section 3: Evaluation Shape */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Fixed Rubric Evaluation Shape
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Instead of unconstrained generic prompts ("Is this good?"), evaluations output a strict shape:
            </p>
            <div className="p-3 bg-white rounded-lg font-mono text-xs text-slate-800 border border-slate-300 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-emerald-700 font-bold">criterion</span> &rarr;{' '}
              <span className="text-blue-700 font-bold">score</span> &rarr;{' '}
              <span className="text-purple-700 font-bold">evidence</span> &rarr;{' '}
              <span className="text-rose-700 font-bold">concern</span> &rarr;{' '}
              <span className="text-amber-700 font-bold">suggestion</span> &rarr;{' '}
              <span className="text-emerald-800 font-bold">confidence</span>
            </div>
          </div>

          {/* Section 4: Scale and Reliability */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Practical Scaling & Failure Handling
            </h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Non-blocking Async:</strong> Submissions respond immediately with <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-slate-800">202 Accepted</code>; the client polls cleanly.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Data Loss:</strong> Submission is persisted synchronously before evaluation starts. If external evaluators fail, the work is never lost.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Idempotency Guards:</strong> Multiple rapid clicks or retries check active runner state to prevent duplicate processing.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Got it, back to practice
          </button>
        </div>
      </div>
    </div>
  );
};
