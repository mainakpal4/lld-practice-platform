# AI Usage Report (AI_USAGE.md)

**Project:** LLD Practice Platform MVP (CipherSchools 2-Day Engineering Assignment)  
**Author:** Mainak Pal  
**Role:** Candidate / Systems Architect  

---

## Executive Summary: Engineering Judgement vs. AI Suggestions

As encouraged by Section 6 of the assignment brief, AI assistance (Gemini / Antigravity) was engaged throughout this project as a **brainstorming partner and rapid prototyping accelerator**. 

However, AI models suffer from known systemic biases when applied to software architecture:
1. **The Over-Engineering Bias:** Defaulting to distributed systems (Kafka, Docker, Microservices, Vector DBs) when a clean monolith is required.
2. **The "Sycophancy & Hallucination" Bias:** Handing out unearned 90+ scores and flattering praises instead of identifying subtle architectural anti-patterns.
3. **The "Pattern-itis" Anti-Pattern:** Cramming unnecessary design patterns (Visitor, Memento, Flyweight) where simple polymorphism or delegation suffices.
4. **The "Brittle Test Harness" Fallacy:** Assuming that low-level design can be verified with rigid unit tests checking exact class and method names.

To build a genuinely useful platform, **I actively audited, challenged, and rejected several key recommendations from the AI**. Below are **5 concrete architectural decisions** showcasing how my engineering judgement overruled the AI's suggestions.

---

### Decision 1: Submission Format (Code Compilation vs. Structured Architectural Model)

* **What the AI Suggested:**  
  The AI strongly recommended creating a containerized sandbox (using Docker, isolated worker containers, and an in-memory compiler) to compile student-written Java/TypeScript and run automated unit tests against their classes.
* **What Was Accepted:**  
  Accepted that learners should provide concrete class definitions, interfaces, and method signatures rather than pure high-level prose.
* **What I Rejected:**  
  **I firmly rejected containerized compilation and rigid automated unit test harnesses.**
* **Engineering Rationale & Why I Overruled the AI:**  
  1. *The Brittle Test Problem:* In real-world LLD, there is no single canonical class name or method signature. If a learner designs an elegant `SpotAllocationStrategy` with a method `findSpot(VehicleType)`, but our automated unit test expects `ParkingManager.allocate(SpotSize)`, the test suite fails—falsely penalizing a great design.
  2. *Violation of Assignment Scope:* Spinning up Docker daemon wrappers, sandboxed runtime environments, and resource quotas is a heavy DevOps/HLD task that violates Section 5's mandate to focus strictly on domain design.
  3. *The Solution Adopted:* I established a **Structured Architectural Model** (`ISubmissionContent`):
     - Explicit Domain Assumptions & Boundaries
     - Class/Interface Code Skeleton
     - Live Mermaid Class Diagram
     - Concurrency & Trade-offs
     This format captures the candidate's actual design decisions and abstractions without compiler brittleness.

---

### Decision 2: Evaluation Design (Single Prompt "Score out of 100" vs. Fixed Rubric Shape with Evidence Anchoring)

* **What the AI Suggested:**  
  The AI suggested a simple, single-shot prompt sending the student's submission and problem description to an LLM with the instruction: *"Evaluate this low-level design, score it from 1 to 100, and give suggestions."*
* **What Was Accepted:**  
  Accepted using LLMs for semantic and cognitive reasoning (e.g. detecting Single Responsibility violations or assessing whether a class is becoming a "God Object").
* **What I Rejected:**  
  **I completely rejected the single-prompt approach and the arbitrary 100-point score.**
* **Engineering Rationale & Why I Overruled the AI:**  
  1. *Lack of Repeatability:* Unconstrained LLM prompts produce wildly fluctuating evaluations. Submitting the exact same design twice frequently yields different numbers (e.g., 76/100 followed by 89/100), destroying learner trust.
  2. *Sycophancy:* Off-the-shelf LLMs tend to be overly polite, saying *"Great job! Your design is well-structured"* while overlooking critical design flaws like tight coupling or thread-safety race conditions.
  3. *The Solution Adopted:* I designed a **Hybrid Composite Evaluation Pipeline**:
     - **Deterministic First-Pass:** Regex/AST structural validation checks for minimum class decomposition, presence of interfaces, and edge-case handling.
     - **Strict Rubric Shape:** Every criterion is strictly modeled as:
       $$\text{Criterion} → \text{Score} → \text{Direct Evidence} → \text{Concern} → \text{Suggestion} → \text{Confidence}$$
     - **Evidence Requirement:** The evaluator is forced to extract literal code tokens from the candidate's text as `evidence` (e.g., *"In `ParkingSpot.ts`, method `calculateFee()` directly accesses billing rules"*). Without concrete evidence, a concern cannot be raised.

---

### Decision 3: System Architecture (Kafka + Microservices vs. Modular Domain Monolith)

* **What the AI Suggested:**  
  When asked how to handle slow or failing AI evaluations, the AI recommended an event-driven microservices architecture: an API Gateway, a submission microservice, an Apache Kafka or RabbitMQ event broker, separate Python evaluation workers, and a Redis state cache.
* **What Was Accepted:**  
  Accepted the principle of **asynchronous non-blocking evaluation** (`202 Accepted`) and the necessity of an explicit lifecycle state machine (`DRAFT` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`).
* **What I Rejected:**  
  **I rejected Kafka, RabbitMQ, and microservice decomposition entirely.**
* **Engineering Rationale & Why I Overruled the AI:**  
  1. Section 5 & Section 10 of the brief explicitly warn: *"Do not turn the assignment into a distributed-systems project. A simple monolith is completely acceptable."*
  2. Introducing Kafka for an MVP is textbook resume-driven over-engineering. It adds serialization bugs, network latency, multi-process management, and deployment headaches without adding a single unit of value to the learner's feedback loop.
  3. *The Solution Adopted:* Built a clean, thread-safe, in-process `EvaluationJobRunner` in TypeScript. Submissions are persisted immediately, evaluation executes asynchronously without blocking HTTP requests, duplicate retries are guarded by an idempotency check, and failures recover gracefully.

---

### Decision 4: Design Pattern Appropriateness ("Pattern-itis" vs. Justified Pragmatism)

* **What the AI Suggested:**  
  When generating starter templates and evaluation rubrics, the AI attempted to inject 5–6 classical GoF design patterns into every problem: Abstract Factory, Visitor, Flyweight, Memento, and Observer for the *Parking Lot* and *Vending Machine*.
* **What Was Accepted:**  
  Accepted the value of classical design patterns when they solve an actual extensibility requirement.
* **What I Rejected:**  
  **I removed the Visitor, Memento, and Flyweight patterns from the problem definitions and grading criteria.**
* **Engineering Rationale & Why I Overruled the AI:**  
  1. *The "Pattern-itis" Anti-Pattern:* One of the biggest red flags in junior LLD interviews is applying patterns for the sake of showing off pattern vocabulary. A Parking Lot does not need the Visitor pattern to calculate hourly rates—doing so adds needless indirection and obfuscates the code.
  2. *The Solution Adopted:* I focused the evaluation criteria strictly on **pragmatic extensibility**:
     - **Strategy Pattern** for spot allocation and dynamic pricing (where business algorithms genuinely vary).
     - **State Pattern** for the Elevator and Vending Machine (where valid actions depend strictly on internal finite states).
     - The rubric now explicitly rewards *simple, cohesive classes* and warns against speculative over-engineering.

---

### Decision 5: The Learning Loop (Static Attempt History vs. Dynamic Progression Delta)

* **What the AI Suggested:**  
  The AI suggested a simple history view that just listed previous attempts in a basic table with timestamps and total scores.
* **What Was Accepted:**  
  Accepted that previous attempts must be retained and accessible to the learner.
* **What I Enhanced & Redesigned:**  
  **I rejected a static history table and designed an active "Progression Delta Engine".**
* **Engineering Rationale & Why I Overruled the AI:**  
  1. A list of scores does not answer the central question of deliberate practice: *"Did my design actually get better, and did I fix the specific flaw pointed out last time?"*
  2. *The Solution Adopted:* Implemented domain-level progression diffing in [`PracticeService.ts`](file:///C:/Task/backend/src/services/PracticeService.ts):
     - Compares Attempt $N$ against Attempt $N-1$.
     - Computes a criterion-by-criterion delta (e.g. *Class Responsibilities: $+2.0$, Concurrency: $+3.0$*).
     - Tracks whether previously identified concerns (e.g., tight coupling between `ParkingSpot` and `BillingManager`) were resolved in the latest submission.
     - Displays this delta visually in the UI to give learners immediate positive reinforcement.

---

## Summary Matrix of AI Interactions

| Decision Area | What AI Proposed | What I Decided | Engineering Justification |
| :--- | :--- | :--- | :--- |
| **1. Submission Model** | Docker sandbox + automated unit testing. | **Structured Text + Live Mermaid Class Diagram.** | Avoids brittle test naming; focuses on abstractions, relationships, and trade-offs. |
| **2. Evaluation Engine** | Single unconstrained prompt → 100-pt score. | **Hybrid Composite Evaluator + Fixed Rubric Shape.** | Eliminates AI sycophancy and score instability; requires token-level evidence. |
| **3. Scalability / Jobs** | Kafka + Microservices + Redis + Celery. | **In-Process `EvaluationJobRunner` in Monolith.** | Zero external bloat; satisfies Section 5 mandate while providing non-blocking async execution. |
| **4. Design Patterns** | Inject 6 GoF patterns per problem (Visitor, Memento, etc.). | **Pragmatic patterns only (Strategy & State).** | Penalizes over-engineering; rewards clean encapsulation and cohesion. |
| **5. Attempt History** | Static list of submission dates and scores. | **Progression Delta Engine (Attempt $N$ vs $N-1$).** | Deliberate practice requires tracking the exact resolution of architectural critique. |
