# AI Usage Report (AI_USAGE.md)

**Project:** LLD Practice Platform MVP (CipherSchools 2-Day Engineering Assignment)  
**Author:** Mainak Pal  

As encouraged by Section 6 of the assignment brief, AI assistance (Gemini / Antigravity) was utilized as an architectural thinking partner and accelerator. Below are 4 meaningful AI-assisted decisions demonstrating critical engineering judgement: what the AI suggested, what was accepted or rejected, and the rationale behind each choice.

---

### Decision 1: Submission Format (Code Compilation vs. Structured Architectural Model)

- **What the AI Suggested:**  
  The AI initially suggested setting up a Dockerized language sandbox to run Java/Python compiler passes and execute unit tests against the learner's submitted classes.
- **What Was Accepted:**  
  Accepted the principle that concrete code is valuable for verifying syntax and method signatures.
- **What Was Rejected:**  
  **Rejected the Dockerized compilation/test harness.**
- **Why / Engineering Rationale:**  
  In LLD, forcing compilation against a fixed test harness creates the "brittle test suite" problem: if the candidate names their class `ParkingSpotManager` instead of `ParkingLotService`, tests fail even if their design abstraction is brilliant. Furthermore, containerized code execution introduces immense HLD/operational overhead (sandboxing, security, timeouts, resource limits) which directly violates Section 5's mandate to focus strictly on domain design. Instead, we adopted a **Structured Architectural Submission** (Assumptions + Class/Interface Skeleton + Mermaid Diagram + Trade-offs). This provides rich design evidence without compilation brittleness.

---

### Decision 2: Evaluation Architecture (Pure LLM Prompting vs. Hybrid Composite Engine)

- **What the AI Suggested:**  
  The AI suggested a single-prompt approach: sending the entire student submission and problem description to an LLM with a prompt asking: *"Score this design out of 100 and write a review."*
- **What Was Accepted:**  
  Accepted utilizing LLM capabilities for non-deterministic semantic reasoning (such as assessing whether a class violates Single Responsibility or whether a pattern is over-engineered).
- **What Was Rejected:**  
  **Firmly rejected the single unconstrained LLM prompt and the 100-point arbitrary score.**
- **Why / Engineering Rationale:**  
  Unconstrained LLM prompts produce wildly fluctuating results, lack repeatability, and often indulge in sycophantic praise without holding learners to strict architectural standards. Furthermore, if the LLM API is down, the platform breaks entirely. We implemented a **Hybrid `CompositeEvaluator`**:
  1. A **Deterministic Evaluator** executes first to verify structural coverage, minimum class definitions, interface presence, and edge-case discussion.
  2. A **Rubric-Constrained Evaluator** scores specific orthogonal dimensions on a fixed shape: `criterion → score → evidence → concern → suggestion → confidence`.
  3. A reliable offline fallback is provided so the platform functions flawlessly even in offline/demo environments.

---

### Decision 3: Handling Slow or Failing Evaluations (Synchronous vs. Event-Driven Job Queue)

- **What the AI Suggested:**  
  The AI suggested an event-driven architecture using Apache Kafka or RabbitMQ with separate microservices for the API and evaluator workers.
- **What Was Accepted:**  
  Accepted the requirement for **asynchronous processing** with an explicit state machine (`SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `COMPLETED` / `FAILED`), so that slow evaluation does not block HTTP request/response cycles.
- **What Was Rejected:**  
  **Rejected external message brokers (Kafka/RabbitMQ) and microservices.**
- **Why / Engineering Rationale:**  
  Section 5 and Section 10 specifically instruct: *"Do not turn the assignment into a distributed-systems project. A simple monolith is completely acceptable."* Adding Kafka or RabbitMQ would add external infrastructure dependencies with zero domain value for a 2-day MVP. We built an in-process, thread-safe `EvaluationJobRunner` in TypeScript with state persistence and concurrency protection (preventing duplicate submissions on retry).

---

### Decision 4: Iterative Feedback & Progress Tracking (Attempt Progression Diff)

- **What the AI Suggested:**  
  The AI suggested storing a simple list of past submissions for display in a basic table.
- **What Was Accepted:**  
  Accepted storing previous attempts so the learner's journey is preserved.
- **What Was Enhanced & Accepted:**  
  Rather than a static table, we enhanced this to compute a **Domain-Level Progression Delta** comparing Attempt $N$ with Attempt $N-1$:
  - Tracking score changes per criterion (e.g. *Class Responsibilities: $+2$*).
  - Comparing architectural changes (e.g., detecting when a previously missing Strategy pattern or thread-safety lock was introduced in the revision).
- **Why / Engineering Rationale:**  
  The core value of an educational platform is the **learning loop**: *Choose problem $\rightarrow$ Think $\rightarrow$ Submit $\rightarrow$ Feedback $\rightarrow$ Review $\rightarrow$ Try again*. Showing how the design evolved directly addresses the assignment's emphasis on *supporting improvement, not just one-time solving*.
