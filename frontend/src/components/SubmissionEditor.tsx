import React, { useState, useEffect } from 'react';
import { SubmissionPayload, StarterTemplate } from '../types';
import { Play, RotateCcw, Eye, Code, FileText, GitBranch, Sparkles } from 'lucide-react';
import mermaid from 'mermaid';

interface SubmissionEditorProps {
  initialPayload: SubmissionPayload;
  starterTemplate: StarterTemplate;
  isSubmitting: boolean;
  onSubmit: (payload: SubmissionPayload) => void;
  attemptNumber: number;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'forest',
  securityLevel: 'loose',
});

export const SubmissionEditor: React.FC<SubmissionEditorProps> = ({
  initialPayload,
  starterTemplate,
  isSubmitting,
  onSubmit,
  attemptNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'assumptions' | 'diagram' | 'classes' | 'patterns'>('classes');
  const [payload, setPayload] = useState<SubmissionPayload>(initialPayload);
  const [showDiagramPreview, setShowDiagramPreview] = useState<boolean>(true);
  const [diagramSvg, setDiagramSvg] = useState<string>('');
  const [diagramError, setDiagramError] = useState<string>('');

  // Sync payload if initialPayload changes
  useEffect(() => {
    setPayload(initialPayload);
  }, [initialPayload]);

  // Live Mermaid diagram renderer
  useEffect(() => {
    let isCancelled = false;
    const renderDiagram = async () => {
      if (!payload.classDiagramMermaid.trim()) {
        setDiagramSvg('');
        setDiagramError('');
        return;
      }
      try {
        const id = `mermaid-preview-${Date.now()}`;
        const { svg } = await mermaid.render(id, payload.classDiagramMermaid);
        if (!isCancelled) {
          setDiagramSvg(svg);
          setDiagramError('');
        }
      } catch (err: any) {
        if (!isCancelled) {
          setDiagramError(err.message || 'Invalid Mermaid syntax');
          setDiagramSvg('');
        }
      }
    };

    const timer = setTimeout(renderDiagram, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [payload.classDiagramMermaid]);

  const handleResetToTemplate = () => {
    if (window.confirm('Reset editor to initial problem template? Any unsaved edits will be replaced.')) {
      setPayload({
        assumptions: starterTemplate.assumptions,
        classDiagramMermaid: starterTemplate.classDiagramMermaid,
        classSkeletonCode: starterTemplate.classSkeletonCode,
        designPatterns: starterTemplate.designPatterns,
        tradeOffsAndEdgeCases: starterTemplate.tradeOffsAndEdgeCases,
        evaluator: payload.evaluator || 'composite',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payload);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full shadow-xs">
      {/* Editor Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
            Attempt #{attemptNumber}
          </span>
          <span className="text-sm font-bold text-slate-800">Design Workspace</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Evaluator Selection (Change Test B) */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span className="hidden sm:inline">Evaluator:</span>
            <select
              value={payload.evaluator || 'composite'}
              onChange={(e) => setPayload({ ...payload, evaluator: e.target.value })}
              className="bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium shadow-xs"
            >
              <option value="composite">Composite Engine (Rules + AI) [Recommended]</option>
              <option value="deterministic">Deterministic Rules Engine</option>
              <option value="llm">Cognitive LLM Engine</option>
              <option value="human">Staff Reviewer Stub (Change Test B)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetToTemplate}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition font-medium shadow-xs"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Template</span>
          </button>
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/70 px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'classes'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Classes & Interfaces</span>
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'diagram'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Class Diagram (Mermaid)</span>
        </button>

        <button
          onClick={() => setActiveTab('assumptions')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'assumptions'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Assumptions & Scope</span>
        </button>

        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'patterns'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patterns & Concurrency</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
        {activeTab === 'classes' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Declare domain classes, interfaces, enums, and key method signatures:</span>
              <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {payload.classSkeletonCode.split('\n').length} lines
              </span>
            </div>
            {/* GeeksforGeeks-Style Code Canvas */}
            <textarea
              value={payload.classSkeletonCode}
              onChange={(e) => setPayload({ ...payload, classSkeletonCode: e.target.value })}
              className="flex-1 min-h-[360px] w-full bg-slate-900 font-mono text-xs text-emerald-300 p-4 rounded-lg border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed resize-none shadow-inner"
              placeholder="// Write domain interfaces and classes here..."
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Edit Mermaid Class Diagram notation or preview live:</span>
              <button
                type="button"
                onClick={() => setShowDiagramPreview(!showDiagramPreview)}
                className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showDiagramPreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
              <textarea
                value={payload.classDiagramMermaid}
                onChange={(e) => setPayload({ ...payload, classDiagramMermaid: e.target.value })}
                className="h-full min-h-[320px] bg-slate-900 font-mono text-xs text-emerald-200 p-4 rounded-lg border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed resize-none shadow-inner"
                placeholder="classDiagram\n  class A\n  class B\n  A --> B"
                spellCheck={false}
              />

              {showDiagramPreview && (
                <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[320px] overflow-auto shadow-xs">
                  {diagramError ? (
                    <div className="text-rose-600 text-xs text-center font-mono">
                      <p className="font-bold">Mermaid Syntax Warning:</p>
                      <p className="mt-1">{diagramError}</p>
                    </div>
                  ) : diagramSvg ? (
                    <div
                      className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: diagramSvg }}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Diagram preview will appear here</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assumptions' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="text-xs text-slate-600 font-medium">
              Define domain assumptions, capacity limits, external gateways, and scope boundaries:
            </div>
            <textarea
              value={payload.assumptions}
              onChange={(e) => setPayload({ ...payload, assumptions: e.target.value })}
              className="flex-1 min-h-[360px] w-full bg-white font-mono text-xs text-slate-800 p-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed resize-none shadow-xs"
              placeholder="- Assumption 1: ...\n- Assumption 2: ..."
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Design Patterns & Architectural Rationale
              </label>
              <textarea
                value={payload.designPatterns}
                onChange={(e) => setPayload({ ...payload, designPatterns: e.target.value })}
                className="flex-1 min-h-[320px] bg-white font-mono text-xs text-slate-800 p-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed resize-none shadow-xs"
                placeholder="1. Strategy Pattern: To decouple spot allocation algorithms...\n2. State Pattern: ..."
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Concurrency, Thread Safety & Edge Cases
              </label>
              <textarea
                value={payload.tradeOffsAndEdgeCases}
                onChange={(e) => setPayload({ ...payload, tradeOffsAndEdgeCases: e.target.value })}
                className="flex-1 min-h-[320px] bg-white font-mono text-xs text-slate-800 p-4 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed resize-none shadow-xs"
                placeholder="1. Race conditions during simultaneous booking: Synchronized lock or atomic CAS...\n2. Full capacity fallback..."
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Submit Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-600 font-medium">
          <span className="font-bold text-emerald-800">Pro-Tip:</span> Define interfaces to decouple algorithms and avoid monolithic manager classes.
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Submit for Evaluation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
