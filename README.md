# LLD Practice Platform (MVP)

> **CipherSchools 2-Day Engineering Assignment**  
> **Author:** Mainak Pal  
> A focused practice and evaluation platform for Low-Level Object-Oriented System Design (Parking Lot, Elevator, Vending Machine, Rate Limiter).

---

## 1. Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24.16.0)
- **npm**: v9+ (tested on npm 11.13.0)

### Running the Application

You can run both the backend API and the frontend client simultaneously in separate terminal windows:

#### Terminal 1: Backend Service (Port 4000)
```bash
cd backend
npm install
npm run dev
```
*Backend runs at:* `http://localhost:4000`  
*API Health check:* `http://localhost:4000/health`

#### Terminal 2: Frontend Client (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at:* `http://localhost:3000` (proxies `/api` requests to backend).

---

## 2. Running Automated Tests

A comprehensive unit and integration test suite verifies the domain models, state machines, evaluators, and edge cases:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **`Attempt.test.ts`**: Verifies the strict state machine transitions (`DRAFT` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`), idempotency, and submission validation.
- **`Evaluators.test.ts`**: Verifies deterministic rule evaluation, heuristic/LLM cognitive analysis, and composite aggregation.
- **`PracticeService.test.ts`**: Tests attempt creation, submission flow, asynchronous runner, and progression delta calculation across attempts.
- **`EdgeCases.test.ts`**: Tests duplicate submission rejection (idempotency guard), evaluator failure recovery, and retry flow.

---

## 3. The Learner Journey (The Practice Loop)

The platform is designed around deliberate practice rather than passive reading:

$$\boxed{\text{Choose Problem}} → \boxed{\text{Think - Model}} → \boxed{\text{Submit}} → \boxed{\text{Rubric Feedback}} → \boxed{\text{Review}} → \boxed{\text{Try Again (Progression)}}$$

1. **Choose Problem:** Select from curated, archetypal LLD challenges:
   - **Parking Lot System** (Vehicle polymorphism, Spot allocation strategy, Dynamic pricing strategy, Concurrency).
   - **Elevator Control System** (State pattern, Internal vs. External calls, SCAN/LOOK dispatching).
   - **Vending Machine** (State transitions: Idle, HasMoney, Dispensing, SoldOut; Inventory rollback).
   - **Rate Limiter Library** (Token Bucket, Leaky Bucket, Sliding Window, Thread-safe atomic operations).
2. **Think & Model:** Define domain assumptions, render live Mermaid class diagrams, write class/interface skeletons, and document concurrency mechanisms.
3. **Submit:** Non-blocking async submission (`202 Accepted`).
4. **Rubric Feedback:** Receive actionable feedback structured in a fixed shape:
   $$\text{Criterion} → \text{Score} → \text{Evidence} → \text{Concern} → \text{Suggestion} → \text{Confidence}$$
5. **Review & Try Again:** Re-attempt the problem and view an explicit **Progression Delta** comparing Attempt $N$ and Attempt $N-1$.

---

## 4. Architectural Highlights & Key Decisions

### A. Monolithic Domain-Driven Design (No Microservice Bloat)
Per Section 5 of the brief, we avoid unnecessary Kubernetes, microservice, or Docker bloat. The system is built as a modular TypeScript monolith with decoupled domain boundaries:
- **`domain/models`**: Pure business entities (`Problem`, `Attempt`, `Submission`, `EvaluationResult`, `Rubric`).
- **`domain/evaluators`**: Strategy pattern implementation (`DeterministicRuleEvaluator`, `LlmEvaluator`, `CompositeEvaluator`, `HumanReviewEvaluatorStub`).
- **`services`**: `PracticeService` coordinating attempts, idempotency, and progression reports.
- **`infrastructure`**: Asynchronous `EvaluationJobRunner` providing non-blocking execution and failure resilience.

### B. The Two Change Tests Answered
- **Change Test A (Diagram Support Later):** Today the learner submits text/code. Later the platform supports visual diagram editing.  
  *Impact:* **Zero changes to domain logic.** The domain defines `ISubmissionContent`. We implement `StructuredTextSubmissionContent`. Adding a visual editor simply introduces another implementation of `ISubmissionContent`.
- **Change Test B (Pluggable Evaluators Later):** Today feedback comes from one evaluator. Later rule-based evaluators or human reviewers are added.  
  *Impact:* **Zero changes to practice flow.** Handled via `CompositeEvaluator implements IEvaluator`. We include a live `HumanReviewEvaluatorStub` in the UI to demonstrate this extensibility.

---

## 5. Project Deliverables

| Deliverable | File Location | Description |
| :--- | :--- | :--- |
| **Research Note** | [`RESEARCH_NOTE.md`](file:///c:/Task/RESEARCH_NOTE.md) | 1–2 page analysis of learner friction, existing tools, key gaps, and product direction. |
| **Design Note** | [`DESIGN_NOTE.md`](file:///c:/Task/DESIGN_NOTE.md) | Architectural specification, answers to the 5 design questions, and change test analysis. |
| **AI Usage Report** | [`AI_USAGE.md`](file:///c:/Task/AI_USAGE.md) | 4 critical AI-assisted decisions: what was suggested, accepted/rejected, and engineering rationale. |
| **Backend Prototype & Tests** | [`backend/`](file:///c:/Task/backend/) | Domain model, evaluators, 17 passing tests, and Express REST API. |
| **Frontend Prototype** | [`frontend/`](file:///c:/Task/frontend/) | React + Tailwind application with live Mermaid preview, real-time polling, and progression diff. |

---

## 6. Known Limitations & Production Roadmap

1. **Persistence:** The prototype uses in-memory repositories (`InMemoryProblemRepository`, `InMemoryAttemptRepository`). For production, replace with PostgreSQL or MongoDB using the same repository interfaces (`IProblemRepository`, `IAttemptRepository`).
2. **Distributed Worker:** For 10,000+ concurrent learners, extract `EvaluationJobRunner` to a standalone Redis/BullMQ worker queue.
3. **Live Remote LLM:** The system includes both offline heuristic rubric evaluation (zero setup required) and an optional remote LLM hook (`OPENAI_API_KEY` / `GEMINI_API_KEY`).
