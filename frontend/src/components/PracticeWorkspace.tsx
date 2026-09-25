import React, { useState, useEffect } from 'react';
import {
  ProblemDetail,
  Attempt,
  SubmissionPayload,
  AttemptProgressionReport,
} from '../types';
import { api } from '../api/client';
import { SubmissionEditor } from './SubmissionEditor';
import { EvaluationStatus } from './EvaluationStatus';
import { RubricFeedbackView } from './RubricFeedbackView';
import { AttemptHistory } from './AttemptHistory';
import {
  ListOrdered,
  Award,
  History,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface PracticeWorkspaceProps {
  problem: ProblemDetail;
  onBackToCatalog: () => void;
}

export const PracticeWorkspace: React.FC<PracticeWorkspaceProps> = ({
  problem,
  onBackToCatalog,
}) => {
  const [leftTab, setLeftTab] = useState<'requirements' | 'rubric' | 'history'>('requirements');
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<AttemptProgressionReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState<boolean>(true);

  // Active editor payload
  const [editorPayload, setEditorPayload] = useState<SubmissionPayload>({
    assumptions: problem.starterTemplate.assumptions,
    classDiagramMermaid: problem.starterTemplate.classDiagramMermaid,
    classSkeletonCode: problem.starterTemplate.classSkeletonCode,
    designPatterns: problem.starterTemplate.designPatterns,
    tradeOffsAndEdgeCases: problem.starterTemplate.tradeOffsAndEdgeCases,
    evaluator: 'composite',
  });

  // Load history and initialize or fetch active attempt
  const refreshHistoryAndAttempt = async () => {
    try {
      const historyData = await api.getProblemHistory(problem.id);
      setHistory(historyData);

      if (historyData.length > 0) {
        // If there's an existing attempt in progress or completed, show the latest
        const latest = historyData[historyData.length - 1].currentAttempt;
        setCurrentAttempt(latest);
      } else {
        // Start first attempt
        const newAttempt = await api.startAttempt(problem.id);
        setCurrentAttempt(newAttempt);
      }
    } catch (err) {
      console.error('Failed to initialize attempt or history:', err);
    } finally {
      setIsLoadingAttempt(false);
    }
  };

  useEffect(() => {
    refreshHistoryAndAttempt();
  }, [problem.id]);

  const handleSubmit = async (payload: SubmissionPayload) => {
    if (!currentAttempt) return;
    setIsSubmitting(true);
    try {
      await api.submitAttempt(currentAttempt.id, payload);
      // Fetch updated attempt status (should be SUBMITTED or EVALUATING)
      const updated = await api.getAttempt(currentAttempt.id);
      setCurrentAttempt(updated);
      setEditorPayload(payload);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewAttempt = async () => {
    try {
      const newAttempt = await api.startAttempt(problem.id);
      setCurrentAttempt(newAttempt);
      // Refresh history so the previous attempts count is accurate
      const historyData = await api.getProblemHistory(problem.id);
      setHistory(historyData);
    } catch (err: any) {
      alert(`Failed to start new attempt: ${err.message}`);
    }
  };

  const handleForkAttempt = () => {
    handleStartNewAttempt();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Workspace Top Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToCatalog}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Catalog</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {problem.domain}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {problem.difficulty}
          </span>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
        {/* Left Pane (5 Cols): Problem context, Requirements, Rubric, History */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs h-full max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{problem.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">{problem.description}</p>
          </div>

          {/* Left Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100/60 px-2">
            <button
              onClick={() => setLeftTab('requirements')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                leftTab === 'requirements'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Requirements</span>
            </button>

            <button
              onClick={() => setLeftTab('rubric')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                leftTab === 'rubric'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Grading Rubric</span>
            </button>

            <button
              onClick={() => setLeftTab('history')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                leftTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {leftTab === 'requirements' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5">
                    Functional Requirements
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {problem.requirements
                      .filter((r) => r.type === 'FUNCTIONAL')
                      .map((req) => (
                        <li key={req.id} className="flex items-start space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{req.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Non-Functional Requirements & Constraints
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {problem.requirements
                      .filter((r) => r.type === 'NON_FUNCTIONAL')
                      .map((req) => (
                        <li key={req.id} className="flex items-start space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{req.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Architectural Concepts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.keyConcepts.map((kc, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium"
                      >
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'rubric' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  Submissions are graded across 6 weighted dimensions. Feedback includes exact evidence, identified concerns, and actionable advice:
                </p>

                <div className="space-y-3">
                  {problem.rubric.criteria.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {c.weight}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'history' && (
              <AttemptHistory
                history={history}
                onSelectAttempt={(att) => setCurrentAttempt(att)}
                onForkAttempt={handleForkAttempt}
              />
            )}
          </div>
        </div>

        {/* Right Pane (7 Cols): Dynamic State - Editor vs Evaluation vs Rubric Feedback */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {isLoadingAttempt ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center my-auto shadow-xs">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-xs font-semibold text-slate-600">Initializing practice session...</p>
            </div>
          ) : currentAttempt ? (
            <>
              {/* If in DRAFT: show editor */}
              {currentAttempt.status === 'DRAFT' && (
                <SubmissionEditor
                  initialPayload={editorPayload}
                  starterTemplate={problem.starterTemplate}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  attemptNumber={currentAttempt.attemptNumber}
                />
              )}

              {/* If in SUBMITTED or EVALUATING or FAILED: show status tracker */}
              {(currentAttempt.status === 'SUBMITTED' ||
                currentAttempt.status === 'EVALUATING' ||
                currentAttempt.status === 'FAILED') && (
                <div className="space-y-6">
                  <EvaluationStatus
                    attempt={currentAttempt}
                    onAttemptUpdated={(updated) => {
                      setCurrentAttempt(updated);
                      if (updated.status === 'COMPLETED') {
                        // Refresh history
                        api.getProblemHistory(problem.id).then(setHistory);
                      }
                    }}
                  />
                </div>
              )}

              {/* If in COMPLETED: show rich rubric feedback */}
              {currentAttempt.status === 'COMPLETED' && currentAttempt.evaluationResult && (
                <RubricFeedbackView
                  result={currentAttempt.evaluationResult}
                  attemptNumber={currentAttempt.attemptNumber}
                  onTryAgain={handleStartNewAttempt}
                  onViewHistory={() => setLeftTab('history')}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
