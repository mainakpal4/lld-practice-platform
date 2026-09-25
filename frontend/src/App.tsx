import React, { useState, useEffect } from 'react';
import { ProblemSummary, ProblemDetail } from './types';
import { api } from './api/client';
import { Navbar } from './components/Navbar';
import { ProblemList } from './components/ProblemList';
import { PracticeWorkspace } from './components/PracticeWorkspace';
import { ArchitectureModal } from './components/ArchitectureModal';

export const App: React.FC = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null);
  const [isLoadingProblemDetail, setIsLoadingProblemDetail] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problem catalog:', err);
      } finally {
        setIsLoadingProblems(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleSelectProblem = async (problemId: string) => {
    setIsLoadingProblemDetail(true);
    try {
      const detail = await api.getProblem(problemId);
      setSelectedProblem(detail);
    } catch (err: any) {
      alert(`Could not load problem: ${err.message}`);
    } finally {
      setIsLoadingProblemDetail(false);
    }
  };

  const handleNavigateHome = () => {
    setSelectedProblem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <Navbar
        currentView={selectedProblem ? 'practice' : 'catalog'}
        problemTitle={selectedProblem?.title}
        onNavigateHome={handleNavigateHome}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      <main className="flex-1">
        {isLoadingProblemDetail ? (
          <div className="max-w-6xl mx-auto py-24 px-4 text-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-slate-600">Loading Problem Workspace...</p>
          </div>
        ) : selectedProblem ? (
          <PracticeWorkspace
            problem={selectedProblem}
            onBackToCatalog={handleNavigateHome}
          />
        ) : (
          <ProblemList
            problems={problems}
            onSelectProblem={handleSelectProblem}
            isLoading={isLoadingProblems}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-600">
            CipherSchools Engineering &bull; Low-Level Design Practice Platform MVP
          </p>
          <p className="text-slate-400">
            Built with Domain-Driven Design &bull; Clean Monolith
          </p>
        </div>
      </footer>

      <ArchitectureModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
};

export default App;
