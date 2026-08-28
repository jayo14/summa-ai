# Summa AI

## Comprehensive Product Requirements Document

**Product:** Summa AI
**Parent Ecosystem:** SummaStudy
**Product Category:** AI-powered personalized learning environment
**Primary Users:** University students
**Primary Interface:** Conversational learning workspace
**Status:** Product definition / architecture planning
**Document Purpose:** Define the product vision, learning model, UX, functionality, AI behavior, backend requirements, interaction system, and measurable learning outcomes for Summa AI.

---

# 1. Executive Summary

Summa AI is an AI-powered personalized learning environment designed primarily for university students.

It is not simply an AI tutor, chatbot, question-answering system, or collection of study tools.

Summa AI is designed to help a student:

**understand what they need to learn → learn it → practice it → demonstrate understanding → identify weaknesses → improve → retain knowledge → know what to do next.**

The primary interface is a **conversation**.

Within that conversation, Summa AI can dynamically create and embed interactive learning experiences such as:

* quizzes
* flashcards
* guided exercises
* simulations
* diagrams
* concept maps
* worked examples
* coding exercises
* problem-solving interfaces
* practice tests
* study guides
* progress cards
* learning summaries
* revision activities

These experiences should feel like native parts of the conversation rather than separate applications.

Summa AI connects to **SummaStudy**, the academic resource layer.

SummaStudy provides access to the student's approved academic resources, including course materials, notes, past questions, documents, and other learning resources.

With explicit user authorization through SummaStudy OAuth, Summa AI can retrieve relevant resources and use them as learning context.

Students may also upload resources directly into a conversation.

The result is:

> **SummaStudy provides the knowledge environment. Summa AI provides the intelligence and learning experience.**

---

# 2. Product Vision

## Vision

Build an AI learning system that understands each student's learning journey and continuously adapts the learning experience around them.

The long-term goal is not to make students dependent on AI.

The goal is to make students:

* understand better
* remember longer
* solve problems independently
* recognize their own weaknesses
* study more effectively
* become more confident learners
* perform better academically

## Product thesis

Traditional education assumes:

> Same curriculum + same pace + same materials = learning.

Summa AI operates on a different principle:

> **Same learning objectives, personalized path.**

Every student can approach the same academic objective differently depending on:

* prior knowledge
* current mastery
* misconceptions
* learning history
* available time
* assessment requirements
* exam proximity
* preferred explanation style
* performance
* retention

---

# 3. The Core Product Loop

The entire product should revolve around a continuous learning loop:

**Understand → Assess → Plan → Teach → Practice → Evaluate → Diagnose → Adapt → Reinforce → Reassess**

### Example

A student wants to learn recursion.

Summa AI:

1. Determines what the student already knows.
2. Identifies relevant source materials.
3. Breaks the topic into learning objectives.
4. Determines prerequisites.
5. Explains the concept.
6. Generates an appropriate interactive.
7. Gives the student a problem.
8. Evaluates the response.
9. Identifies the reason for failure or success.
10. Updates the learner model.
11. Chooses the next intervention.
12. Schedules future review.
13. Measures whether the student retained the concept.

The conversation therefore becomes a **closed-loop learning system**.

---

# 4. Problem Statement

University students have access to enormous amounts of educational content but often lack personalized guidance.

Common problems include:

### 4.1 Resource overload

Students have:

* lecture notes
* PDFs
* slides
* textbooks
* past questions
* videos
* assignments
* websites
* handwritten notes

but often do not know which resource matters at a particular moment.

### 4.2 Lack of personalization

Most educational systems present the same material to every student.

### 4.3 Poor awareness of mastery

Students frequently confuse:

> “I recognize this.”

with:

> “I can independently use this.”

### 4.4 Ineffective studying

Students often rely heavily on:

* rereading
* highlighting
* passive watching
* cramming

without sufficient retrieval, application, or feedback.

### 4.5 Weak feedback loops

After getting a question wrong, students often receive:

> Correct answer: B.

They do not receive:

> Why did I get this wrong?

### 4.6 Fragmented learning tools

Students may have to move between:

* notes
* PDFs
* YouTube
* flashcard apps
* quiz apps
* ChatGPT
* course platforms

### 4.7 Poor continuity

A generic AI conversation may know what was discussed but not necessarily maintain a structured understanding of:

* what the student has mastered
* what they struggle with
* what they previously got wrong
* what needs revision
* what should happen next

### 4.8 Exam panic

Students often begin serious preparation late and need to determine how to prioritize limited study time.

---

# 5. Problems Summa AI Will Solve

Summa AI should directly address:

1. **What should I study?**
2. **What do I already know?**
3. **What don't I understand?**
4. **Why am I struggling?**
5. **How should this concept be explained to me?**
6. **Can I actually use what I learned?**
7. **What should I practice next?**
8. **What should I review later?**
9. **How prepared am I for my assessment?**
10. **Am I actually improving?**

---

# 6. What Summa AI Is Not

Summa AI should deliberately avoid becoming:

### A generic chatbot

The product should provide learning-specific intelligence beyond ordinary conversation.

### A traditional LMS

It should not require students to navigate through many disconnected academic screens.

### A PDF chatbot

Resources are inputs to learning, not the product itself.

### A flashcard app

Flashcards are one learning mechanism.

### A quiz generator

Assessment is one part of the learning loop.

### A homework answer machine

The product should prioritize understanding and independent capability.

### A passive content library

SummaStudy already handles the resource ecosystem.

### A dashboard-first product

The student's primary experience should remain the learning conversation.

---

# 7. Relationship Between SummaStudy and Summa AI

## SummaStudy

**Role:** Academic resource layer.

SummaStudy provides:

* course materials
* academic documents
* lecture notes
* past questions
* resources
* course context
* approved academic content

## Summa AI

**Role:** Intelligence and learning layer.

Summa AI provides:

* personalized tutoring
* reasoning
* learning planning
* assessment
* diagnosis
* adaptation
* practice
* retention
* progress intelligence
* learning memory

## Relationship

```text
SUMMASTUDY
Academic Resources
        │
        │ OAuth + User Consent
        ▼
SUMMA AI
Learning Intelligence
        │
        ▼
Personalized Learning Experience
```

The student should not need to repeatedly switch between the products during learning.

---

# 8. Authentication and Authorization

Summa AI should support authentication through SummaStudy OAuth.

## OAuth flow

1. Student opens Summa AI.
2. Student chooses:
   **Continue with SummaStudy**
3. SummaStudy authenticates the student.
4. SummaStudy requests/records authorization for resource access.
5. Summa AI receives the authorized identity and appropriate access token/scopes.
6. Summa AI can retrieve approved resources.

## Principle

**Explicit consent is mandatory.**

Summa AI should never silently access resources that the user has not authorized.

## Permissions

Resource access should support granular permissions such as:

* profile
* courses
* materials
* past questions
* saved resources
* academic metadata

The architecture should allow additional scopes in the future.

---

# 9. Target Users

## Primary persona

### University student

Needs:

* academic help
* course-specific learning
* exam preparation
* personalized practice
* explanations
* revision
* progress awareness

## Secondary personas

Future versions may support:

* lecturers
* tutors
* departments
* academic institutions

These are explicitly secondary to the student experience for the initial product.

---

# 10. Core User Jobs

### Job 1 — Learn

> “Teach me this.”

### Job 2 — Understand

> “I don't understand this.”

### Job 3 — Practice

> “Give me questions.”

### Job 4 — Diagnose

> “Why do I keep getting this wrong?”

### Job 5 — Review

> “Help me remember this.”

### Job 6 — Prepare

> “My exam is next week. What should I do?”

### Job 7 — Explore

> “Explain this deeper.”

### Job 8 — Continue

> “Continue from where we stopped.”

### Job 9 — Assess

> “How well do I actually know this?”

### Job 10 — Plan

> “What should I study today?”

---

# 11. Product Principles

## Principle 1 — Chat is the classroom

The conversation is the primary workspace.

## Principle 2 — Interaction beats passive consumption

When appropriate, students should think, answer, manipulate, solve, explain, and retrieve.

## Principle 3 — The AI should not always answer immediately

The AI should sometimes ask questions, provide hints, scaffold reasoning, or request the student's own explanation.

Guided learning and active participation are central behaviors in modern AI tutoring approaches.

## Principle 4 — Learning evidence matters

A student saying:

> “I understand.”

is not sufficient evidence.

Evidence should come from:

* answers
* explanations
* problem solving
* retrieval
* application
* performance over time

## Principle 5 — Context follows the student

The student should not have to repeatedly explain:

* their course
* topic
* learning goal
* previous mistakes
* available materials

## Principle 6 — The interface should adapt to the learning task

The UI should change depending on what is useful.

## Principle 7 — Don't gamify learning unnecessarily

Gamification should never replace actual learning.

## Principle 8 — The AI should know when not to generate an interactive

Text may be the best interface for a simple question.

---

# 12. Primary Experience

The primary Summa AI interface is:

# Conversational Learning Workspace

The workspace consists of:

* conversation
* contextual navigation
* resource controls
* interactive learning experiences
* progress moments
* composer
* optional learning context

---

# 13. Main Layout

Conceptually:

```text
┌──────────────────────────────────────────────────────┐
│ Summa AI                                      Profile │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│ + New Chat │                                         │
│            │             Conversation                │
│ Recent     │                                         │
│ Chats      │                                         │
│            │                                         │
│            │     AI message                         │
│ My Learning│                                         │
│            │     Interactive                         │
│            │                                         │
│            │     Student response                   │
│            │                                         │
│ Settings   │     Feedback                            │
│            │                                         │
│            │                                         │
│            │  ┌──────────────────────────────────┐   │
│            │  │ Message Summa AI...            ↑ │   │
│            │  └──────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────┘
```

The exact visual design should remain open during the UX phase.

---

# 14. Conversation System

The conversation is not limited to text messages.

A conversation can contain multiple content types.

## Message types

### AI message

Standard conversational response.

### Student message

User input.

### Source citation

Reference to an approved resource.

### Interactive

Embedded learning experience.

### Assessment

Question or assessment block.

### Progress moment

Learning-state update.

### Recommendation

Suggested next action.

### System event

Session state information.

---

# 15. Conversation as a Learning Timeline

A conversation may look like:

```text
AI explanation
       ↓
Interactive visualization
       ↓
Student interaction
       ↓
Assessment question
       ↓
Student answer
       ↓
AI diagnosis
       ↓
Targeted explanation
       ↓
Practice problem
       ↓
Progress update
       ↓
Recommended review
```

The student should experience this as one continuous session.

---

# 16. Interactive Learning System

The working internal term for these components is:

# Interactive

An Interactive is a dynamically generated learning experience embedded directly into the conversation.

The exact user-facing terminology may be refined later.

## Interactive characteristics

Every Interactive should have:

* purpose
* learning objective
* context
* state
* inputs
* outputs
* interaction events
* assessment capability where applicable
* completion state
* persistence state
* source context
* learning metadata

---

# 17. Interactive Types

## 17.1 Flashcards

Used for:

* definitions
* terminology
* formulas
* factual recall
* key concepts

Should support:

* reveal
* confidence rating
* next/previous
* shuffle
* difficulty
* spaced review
* automatic saving

---

# 18. Quizzes

Types:

* multiple choice
* multiple select
* true/false
* short answer
* matching
* ordering
* fill-in-the-blank
* scenario-based questions

Questions should be mapped to learning objectives.

---

# 19. Guided Practice

The AI presents a problem and progressively assists the student.

Possible scaffolding:

1. Ask student to attempt.
2. Detect difficulty.
3. Give hint.
4. Give partial clue.
5. Show relevant concept.
6. Demonstrate one step.
7. Ask student to continue.
8. Evaluate final response.

---

# 20. Simulations

Used when interaction improves understanding.

Examples:

* sorting algorithms
* binary search
* networking
* physics
* circuits
* database queries
* probability
* economics
* system architecture

---

# 21. Visual Explanations

Possible experiences:

* diagrams
* timelines
* flowcharts
* concept maps
* relationship maps
* annotated examples
* interactive graphs

Visual and interactive explanations are particularly useful for abstract mathematical and scientific concepts.

---

# 22. Coding Interactives

For computing students:

* code editor
* execution
* output
* test cases
* debugging
* code tracing
* prediction questions
* visualization

Example:

```text
Code
  ↓
Student predicts output
  ↓
Run
  ↓
Compare
  ↓
Explain discrepancy
```

---

# 23. Problem-Solving Interfaces

For:

* mathematics
* statistics
* physics
* chemistry
* engineering
* programming
* accounting

The system should focus on reasoning rather than merely displaying the answer.

---

# 24. Study Guides

AI-generated structured learning guides can be interactive.

Example:

```text
Normalization

✓ 1NF
✓ 2NF
⚠ Functional Dependencies
○ 3NF
○ BCNF
```

Clicking a weak area can continue the learning conversation.

---

# 25. Practice Tests

A practice test should:

* select relevant objectives
* account for mastery
* account for exam format
* account for difficulty
* include weak areas
* provide post-test analysis

---

# 26. Progress Cards

Progress should appear contextually in conversation.

Example:

```text
┌──────────────────────────────┐
│ POLYMORPHISM                 │
│                              │
│ Mastery                      │
│ ████████████░░ 78%           │
│                              │
│ +23% since starting          │
│                              │
│ Strong                       │
│ ✓ Definitions                │
│ ✓ Identification             │
│                              │
│ Keep working on              │
│ → Implementation             │
└──────────────────────────────┘
```

Progress cards should not become unnecessary dashboard clutter.

---

# 27. Adaptive Interface

The interface should dynamically change according to the learning task.

### Simple question

Text.

### Conceptual difficulty

Explanation + visual.

### Recall task

Flashcards.

### Application task

Practice problem.

### Assessment

Quiz.

### Coding concept

Code interactive.

### Exam preparation

Practice sequence.

The AI should determine the most appropriate interaction.

---

# 28. Resource Integration

Summa AI can retrieve resources from SummaStudy after authorization.

## Resource types

* lecture notes
* PDFs
* slides
* textbooks
* past questions
* assignments
* course outlines
* syllabus
* user uploads
* other approved resources

---

# 29. Resource Selection

The student should be able to explicitly choose sources.

Example:

```text
Sources

☑ CSC 201 Lecture 4
☑ OOP Notes
☑ 2025 Past Questions

+ Add from SummaStudy
+ Upload
```

The student can also allow Summa AI to choose relevant approved sources automatically.

---

# 30. Source Grounding

When using academic resources, Summa AI should prefer relevant approved sources over unsupported model knowledge.

Responses should be able to indicate:

* source
* page/section where available
* confidence
* whether the information comes from the student's materials or general knowledge

The system should distinguish:

**Source-grounded statement**

from:

**General explanation**

---

# 31. Uploaded Resources

Users can upload files directly into the conversation.

Supported formats should initially include common educational formats such as:

* PDF
* DOCX
* PPTX
* TXT
* images

The exact technical support matrix is implementation-dependent.

Uploaded resources should:

1. be associated with the conversation
2. become available to the AI
3. have appropriate metadata
4. optionally become part of the student's persistent learning context
5. respect user deletion and privacy controls

---

# 32. Learning Objectives

Learning objectives are central to Summa AI.

A topic should not simply be:

> “Recursion”

It should be decomposed into observable capabilities.

Example:

```text
Recursion

├── Define recursion
├── Identify base cases
├── Explain recursive calls
├── Trace recursive execution
├── Implement recursive functions
├── Debug recursive functions
└── Apply recursion to novel problems
```

This enables meaningful mastery tracking.

---

# 33. Bloom's Taxonomy

Learning objectives should optionally map to cognitive levels:

1. Remember
2. Understand
3. Apply
4. Analyze
5. Evaluate
6. Create

Bloom-style mapping is useful for making generated assessments and learning activities align with explicit cognitive goals. Research has explored this approach in AI-supported learning and question generation.

---

# 34. Student Learning Model

Summa AI should maintain a structured representation of the student's learning state.

For relevant objectives, the system may track:

* mastery estimate
* confidence
* attempt count
* success rate
* recent performance
* historical performance
* last interaction
* retention estimate
* error patterns
* misconceptions
* difficulty
* prerequisites
* evidence
* learning velocity

---

# 35. Mastery

Mastery should be an estimate, not a binary field.

Bad:

```text
Recursion = completed
```

Better:

```text
Recursion

Definition              94%
Base cases               87%
Recursive calls          76%
Tracing                  48%
Implementation           42%
Application              35%
```

This allows Summa AI to identify the actual weakness.

---

# 36. Evidence of Learning

Evidence may include:

* correct answer
* explanation in student's own words
* successful application
* successful problem solving
* repeated retrieval
* delayed retrieval
* successful transfer
* reduced hint dependency

A single correct answer should not automatically imply mastery.

---

# 37. Misconception Detection

The system should distinguish different failure causes.

Possible classifications:

* conceptual misunderstanding
* prerequisite gap
* recall failure
* procedural error
* calculation error
* reasoning error
* misreading
* terminology confusion
* careless error
* incomplete understanding

Example:

```text
Student repeatedly fails recursion tracing.

AI detects:

Problem ≠ recursion definition.

Underlying weakness =
understanding call-stack execution.
```

---

# 38. Adaptive Learning Engine

The Adaptive Learning Engine determines:

> **What should happen next?**

Potential inputs:

* current objective
* mastery
* prerequisites
* mistakes
* exam date
* course importance
* available time
* previous activity
* retention
* student goal
* resource availability

Potential outputs:

* teach
* explain differently
* ask a question
* provide hint
* generate practice
* review prerequisite
* generate flashcards
* schedule review
* move forward
* revisit weak topic
* stop and summarize

---

# 39. AI Tutor

The tutor should behave as an adaptive instructor.

## Core behaviors

### Assess before overexplaining

Determine what the student already understands.

### Explain progressively

Start at an appropriate level.

### Use multiple representations

* explanation
* analogy
* example
* counterexample
* diagram
* code
* problem

### Encourage active participation

Ask students to reason and answer.

### Scaffold

Provide support proportional to difficulty.

### Avoid unnecessary answer dumping

Especially for learning tasks.

### Check understanding

Ask the student to:

* explain
* predict
* apply
* solve
* compare

### Adapt

Change teaching strategy when the current strategy fails.

Guided questioning, layered explanations, active participation, and actionable feedback are also central behaviors described in current AI tutoring approaches.

---

# 40. AI Orchestrator

The AI system should not rely on one undifferentiated prompt.

Conceptually:

```text
User
 ↓
Context Assembly
 ↓
Learning State
 ↓
Intent Detection
 ↓
Learning Objective
 ↓
Resource Retrieval
 ↓
Pedagogical Decision
 ↓
Response / Interactive
 ↓
Assessment
 ↓
Learning Event
 ↓
Student Model Update
```

---

# 41. AI Decision Types

The AI may decide:

```text
ANSWER
EXPLAIN
QUESTION
ASSESS
PRACTICE
HINT
REMEDIATE
REVIEW
GENERATE_INTERACTIVE
SUMMARIZE
PLAN
RECOMMEND
REFLECT
```

---

# 42. Interactive Generation Protocol

When generating an Interactive, the AI should determine:

```text
objective
activity_type
difficulty
instructions
content
interaction_model
success_criteria
assessment_rules
feedback_rules
source_context
persistence
```

Example:

```text
objective:
"Trace recursive execution"

activity_type:
"code-trace"

difficulty:
"intermediate"

success_criteria:
"Student correctly identifies call-stack state"
```

The frontend renders the structured Interactive.

The model should not be trusted to freely generate arbitrary executable UI code without validation.

---

# 43. Interactive Runtime

The frontend should provide a controlled Interactive runtime.

Conceptually:

```text
AI
 ↓
Structured Interactive Schema
 ↓
Validation
 ↓
Renderer
 ↓
Student Interaction
 ↓
Interaction Events
 ↓
Backend
 ↓
Learning Engine
```

This gives the platform:

* safety
* consistency
* analytics
* versioning
* accessibility
* performance
* predictable behavior

---

# 44. Interactive Schema

A conceptual schema:

```json
{
  "type": "quiz",
  "title": "Test Your Understanding",
  "objective_id": "obj_123",
  "difficulty": "medium",
  "instructions": "Choose the best answer.",
  "items": [],
  "completion_rules": {},
  "feedback_rules": {},
  "source_refs": []
}
```

The actual schema should be formally defined during engineering design.

---

# 45. Learning Event System

Every meaningful interaction should produce a learning event.

Examples:

```text
SESSION_STARTED
OBJECTIVE_STARTED
EXPLANATION_VIEWED
QUESTION_PRESENTED
QUESTION_ANSWERED
ANSWER_CORRECT
ANSWER_INCORRECT
HINT_REQUESTED
SOLUTION_VIEWED
INTERACTIVE_COMPLETED
OBJECTIVE_ASSESSED
MASTERY_UPDATED
REVIEW_SCHEDULED
REVIEW_COMPLETED
```

This event system becomes the foundation of learning analytics.

---

# 46. Memory System

Summa AI's memory is a major differentiator.

Memory should operate at multiple levels.

## Conversation memory

What happened in the current conversation.

## Long-term learning memory

What the student has learned.

## Student preferences

How the student likes to learn.

## Academic context

Courses, topics, objectives, materials.

## Performance memory

Previous assessment performance.

## Mistake memory

Recurring errors.

## Goal memory

Exam goals, study goals, academic objectives.

---

# 47. Memory Principle

Memory should not mean:

> Store every conversation forever.

It should mean:

> **Retain information that improves future learning.**

---

# 48. Example Memory

```text
Student:
John

Course:
CSC 201

Topic:
Polymorphism

Known:
- definition
- basic identification

Weak:
- implementation
- runtime behavior

Recent mistake:
Confuses method overriding with overloading

Recommended:
Application practice

Last reviewed:
2026-08-26

Next review:
2026-08-29
```

---

# 49. "Continue Learning" Experience

When a student returns:

```text
Welcome back.

Yesterday you were working on:

Recursion

You were strong on:
✓ Base cases

Still developing:
⚠ Recursive tracing

You have 30 minutes.

[Continue]
```

This is more valuable than simply reopening the previous chat.

---

# 50. Study Planning

Students should be able to ask:

> “What should I study today?”

Summa should consider:

* goals
* courses
* exams
* deadlines
* mastery
* weakness
* retention
* available time
* importance

The result should be a prioritized set of actions.

---

# 51. Exam Preparation

Exam mode should be a major workflow.

Input:

> “I have CSC 203 exam in 9 days.”

System considers:

* exam date
* syllabus
* past questions
* course resources
* student mastery
* weak topics
* question distribution where available
* study time
* retention

Then creates:

**Exam Preparation Plan**

Example:

```text
9 days remaining

Priority 1
Normalization
Mastery: 42%

Priority 2
Transactions
Mastery: 51%

Priority 3
Indexing
Mastery: 64%

Maintenance
SQL basics
Mastery: 87%
```

---

# 52. Exam Readiness

Readiness should be an estimate.

It should not claim:

> “You will score 85%.”

Instead:

> “Your current evidence suggests strong readiness for foundational questions, but your performance on application questions remains inconsistent.”

---

# 53. Past Questions

Past questions should become structured learning data.

Each question can be associated with:

* course
* topic
* objective
* difficulty
* cognitive level
* year
* examination
* source

This allows Summa AI to identify patterns.

Example:

> “You consistently struggle with application questions on normalization.”

---

# 54. Automatic Organization

Generated Interactives should be automatically organized.

Example:

```text
My Learning

Computer Science
 ├── CSC 201
 │    └── Object-Oriented Programming
 │         ├── Flashcards
 │         ├── Practice
 │         └── Quizzes
 │
 └── CSC 203
      └── Databases
           ├── Practice
           └── Review
```

Students should not need to manually organize every generated resource.

---

# 55. Living Learning Objects

Saved Interactives should not necessarily be static.

A flashcard set can evolve.

Example:

```text
Polymorphism Review

Strong:
Card 1
Card 4
Card 7

Weak:
Card 2
Card 5

Forgotten:
Card 8
```

Future reviews can prioritize weak or forgotten concepts.

---

# 56. Secondary Pages

Summa AI should remain chat-first.

Secondary surfaces should support the conversation rather than compete with it.

## Suggested secondary pages

### My Learning

Saved Interactives and learning history.

### Progress

Detailed learning analytics.

### Profile

Personal information and academic context.

### Settings

Preferences, privacy, memory, integrations.

### Sources

Optional resource management.

### Maybe later: Plans

Long-term study plans and exam preparation.

---

# 57. My Learning

Purpose:

> Access previously generated learning experiences.

Should include:

* recent
* saved
* courses
* topics
* flashcards
* quizzes
* practice
* simulations
* study guides

Search and filtering should be available.

---

# 58. Progress

Progress should show:

### Overview

* overall learning activity
* mastery trends
* recent gains

### By course

* course mastery
* topic mastery

### Weaknesses

* weak objectives
* recurring misconceptions

### Retention

* upcoming reviews
* forgotten concepts

### Readiness

* exam readiness where applicable

---

# 59. Progress UX Principle

Progress should answer:

> **What am I getting better at?**

not:

> “How many minutes did I spend?”

Activity metrics are secondary.

Learning outcomes are primary.

---

# 60. UX Navigation Principle

The student should rarely leave the conversation to accomplish a learning task.

Example:

Bad:

```text
Chat
 ↓
Quiz page
 ↓
Results page
 ↓
Flashcards
 ↓
Dashboard
 ↓
Chat
```

Preferred:

```text
Chat
 ↓
Interactive
 ↓
Feedback
 ↓
Another Interactive
 ↓
Progress
 ↓
Continue conversation
```

---

# 61. Composer

The composer should support:

* text
* file upload
* source selection
* voice input in future
* optional commands
* context selection

Possible controls:

```text
[ + ] [Attach] [Sources]     Message Summa...      [↑]
```

---

# 62. Suggested Prompts

For a new conversation:

* Teach me something
* Help me understand
* Quiz me
* Prepare me for an exam
* Review my notes
* Explain this material
* Find my weak areas
* Continue learning

Suggestions should disappear once the student begins interacting.

---

# 63. Conversation Context

A conversation may have an optional context header:

```text
CSC 201
Object-Oriented Programming

Sources: 3
Current objective:
Understand polymorphism
```

The context should remain unobtrusive.

---

# 64. Responsive Design

Desktop should be the primary experience initially.

Tablet and mobile should preserve:

* conversation continuity
* Interactive usability
* readable source context
* composer accessibility

The sidebar should collapse on smaller screens.

---

# 65. Accessibility

The product should support:

* keyboard navigation
* semantic HTML
* screen readers
* sufficient contrast
* focus states
* reduced motion
* readable typography
* accessible Interactive controls

Generated Interactives must follow the same accessibility requirements as native UI.

---

# 66. Backend Domain

The backend should conceptually support the following domains.

## Identity

* User
* Profile
* OAuthIdentity
* AuthorizationGrant

## Academic

* Course
* Subject
* Topic
* LearningObjective
* Prerequisite
* Resource

## Learning

* LearningSession
* StudyPlan
* StudyTask
* MasteryRecord
* LearningEvent
* ReviewItem
* Misconception

## Assessment

* Question
* Assessment
* QuestionAttempt
* AssessmentResult

## AI

* Conversation
* Message
* AIResponse
* Context
* Retrieval
* Interactive

## Persistence

* SavedInteractive
* Collection
* Bookmark

---

# 67. Core Backend Relationship

```text
User
 │
 ├── Courses
 │
 ├── Conversations
 │
 ├── Learning Profile
 │      │
 │      ├── Mastery
 │      ├── Misconceptions
 │      └── Goals
 │
 └── Learning History
        │
        ├── Assessments
        ├── Interactions
        └── Reviews
```

---

# 68. Data Architecture Principle

Do not let the database become a transcript database.

The system needs structured educational data.

The most important objects are not:

> Message

but:

> **Learning Objective, Evidence, Mastery, and Learning Event.**

---

# 69. Retrieval Architecture

The retrieval system should support:

### Resource retrieval

Find relevant approved material.

### Context retrieval

Find relevant student memory.

### Learning-state retrieval

Find relevant mastery and weaknesses.

### Historical retrieval

Find previous related interactions when necessary.

The AI context should be assembled from all relevant layers.

---

# 70. Context Assembly

Before generating an important response, Summa AI may assemble:

```text
Current user message
+
Current conversation
+
Learning objective
+
Student mastery
+
Known misconceptions
+
Relevant memory
+
Relevant SummaStudy resources
+
Exam context
+
Recent performance
```

This prevents generic responses.

---

# 71. AI Safety and Accuracy

The system should explicitly manage AI limitations.

Potential problems:

* hallucinations
* incorrect explanations
* bad question generation
* incorrect grading
* misleading mastery estimates
* source misinterpretation

---

# 72. Source Priority

When the student asks a course-specific question:

1. User-provided source
2. Approved SummaStudy resource
3. Course metadata
4. Trusted general knowledge
5. Explicit uncertainty

The system should not fabricate citations.

---

# 73. Assessment Reliability

Generated questions should be validated where possible.

Validation can include:

* answer verification
* duplicate detection
* ambiguity detection
* source consistency
* difficulty validation
* objective alignment

For high-stakes assessments, AI-generated results should be treated cautiously.

---

# 74. Academic Integrity

Summa AI should encourage learning rather than unauthorized academic misconduct.

For example:

If a student says:

> “Give me the answer to this live exam.”

the system should not blindly comply.

The product should support:

* explanation
* studying
* practice
* feedback
* preparation
* reasoning

without facilitating prohibited academic cheating.

---

# 75. Privacy

Student learning data is sensitive.

The system should support:

* data minimization
* clear consent
* deletion
* export where appropriate
* access control
* secure storage
* resource permission boundaries
* memory controls

Users should be able to understand what Summa remembers.

---

# 76. Memory Controls

Settings should allow:

* memory enabled/disabled
* clear learning memory
* delete conversation
* delete saved Interactive
* disconnect SummaStudy
* revoke resource access

---

# 77. AI Transparency

When useful, Summa should explain:

> “I'm recommending this because you struggled with…”

rather than presenting recommendations as mysterious decisions.

This improves trust.

---

# 78. Learning Recommendations

Recommendations should contain a reason.

Bad:

> Practice recursion.

Better:

> Your recursion definition is strong, but tracing recursive execution remains weak. Let's practice that next.

---

# 79. Notification System

Future notifications may include:

* review reminders
* unfinished learning sessions
* exam preparation
* scheduled study tasks
* forgotten concepts

Notifications should be useful, not spammy.

---

# 80. Voice

Voice is a potential future modality.

Potential use:

* conversational tutoring
* verbal explanations
* oral recall
* language learning

Not required for MVP.

---

# 81. Multimodal Learning

Future support may include:

* images
* diagrams
* handwriting
* screenshots
* photographed questions
* audio
* video context

The student should eventually be able to show Summa something rather than describe it.

---

# 82. Analytics

The analytics system should track both product and learning metrics.

## Product metrics

* active students
* sessions
* conversations
* retention
* Interactive usage
* resource usage
* subscription conversion

## Learning metrics

* mastery gain
* objective completion
* retention
* transfer
* assessment improvement
* error reduction
* learning efficiency

---

# 83. North Star Metric

The product should not optimize for:

> Messages per user.

A stronger north-star direction is:

> **Verified learning progress per active learner.**

A practical implementation may measure:

**Meaningful Mastery Gain**

The proportion of learning objectives where the student's demonstrated mastery improves meaningfully over time.

---

# 84. Supporting Learning Metrics

### Mastery gain

```text
Post-assessment mastery - Pre-assessment mastery
```

### Retention

Performance after a delay.

### Transfer

Ability to solve a new problem.

### Independence

Performance with fewer hints.

### Learning efficiency

Mastery gain relative to study time.

### Error reduction

Frequency of recurring mistakes.

---

# 85. Product Success Criteria

Summa AI succeeds if students increasingly demonstrate:

* greater mastery
* better retention
* improved application
* fewer recurring mistakes
* greater independent problem-solving ability
* better exam preparation
* less wasted study time

---

# 86. MVP

The first production version should **not** attempt to build the entire vision.

The MVP should prove the central loop.

## MVP capabilities

### Authentication

* SummaStudy OAuth
* resource authorization

### Chat

* persistent conversations
* streaming AI responses
* file upload
* resource selection

### AI Tutor

* source-grounded tutoring
* adaptive explanations
* guided questioning
* contextual memory

### Interactives

Start with:

1. Quiz
2. Flashcards
3. Guided practice
4. Progress card

### Learning model

* topics
* learning objectives
* basic mastery
* attempts
* learning events

### Memory

* conversation continuity
* learning memory
* key weaknesses
* studied topics

### My Learning

* saved/generated Interactives
* automatic organization

### Basic Progress

* topic mastery
* recent improvement
* weaknesses

---

# 87. MVP Learning Loop

The MVP must support:

```text
Student asks
      ↓
Retrieve resources
      ↓
Understand objective
      ↓
Teach
      ↓
Generate Interactive
      ↓
Student interacts
      ↓
Evaluate
      ↓
Diagnose
      ↓
Update mastery
      ↓
Recommend next action
```

If this loop works, Summa AI has a real product.

---

# 88. Phase 2

Add:

* adaptive study plans
* exam preparation
* spaced review
* advanced assessment
* misconception detection
* richer Interactives
* coding exercises
* visual simulations
* improved progress analytics

---

# 89. Phase 3

Add:

* advanced learner modeling
* predictive readiness
* personalized curricula
* voice
* multimodal learning
* advanced simulations
* institutional integrations
* lecturer-created learning experiences

---

# 90. Phase 4 — Learning Intelligence Platform

Long term, Summa AI can become a generalized learning intelligence layer.

It could understand:

```text
Student
 ↓
Curriculum
 ↓
Resources
 ↓
Objectives
 ↓
Knowledge
 ↓
Mastery
 ↓
Assessment
 ↓
Learning strategy
```

This could eventually support many educational environments.

---

# 91. Key User Flow — First Session

```text
User signs in
      ↓
OAuth authorization
      ↓
Summa retrieves academic context
      ↓
Welcome
      ↓
Student chooses goal
      ↓
Summa asks minimal calibration questions
      ↓
Student selects course/topic
      ↓
Relevant resources identified
      ↓
Learning begins
```

Calibration should be lightweight.

Do not create a 20-question onboarding form.

The system should learn about the student naturally through interaction.

---

# 92. Key User Flow — Learning a Topic

```text
Student:
"Teach me polymorphism."

        ↓

Summa identifies topic

        ↓

Checks prior learning

        ↓

Retrieves approved sources

        ↓

Determines likely objective

        ↓

Explains

        ↓

Checks understanding

        ↓

Generates Interactive

        ↓

Student interacts

        ↓

Evaluate

        ↓

Update mastery

        ↓

Determine next step

        ↓

Continue / remediate / advance
```

---

# 93. Key User Flow — Uploaded Resource

```text
Upload PDF
     ↓
Parse
     ↓
Associate with conversation
     ↓
Index
     ↓
Student asks question
     ↓
Retrieve relevant sections
     ↓
Answer
     ↓
Offer learning activity
```

---

# 94. Key User Flow — Exam Preparation

```text
"My exam is in 9 days."

       ↓

Identify course
       ↓
Find syllabus/resources
       ↓
Retrieve past questions
       ↓
Analyze student state
       ↓
Identify priority topics
       ↓
Generate plan
       ↓
Start first session
       ↓
Teach
       ↓
Practice
       ↓
Assess
       ↓
Update readiness
       ↓
Adjust plan
```

---

# 95. Key User Flow — Returning Student

```text
Student opens Summa AI
        ↓
Retrieve learning memory
        ↓
Identify unfinished work
        ↓
Check scheduled reviews
        ↓
Check current goals
        ↓
Generate contextual welcome
        ↓
Recommend next action
```

---

# 96. Key User Flow — Weakness Discovery

```text
Student repeatedly fails questions
        ↓
Learning event analysis
        ↓
Pattern detected
        ↓
Possible misconception identified
        ↓
Prerequisite checked
        ↓
Targeted remediation
        ↓
Reassessment
        ↓
Mastery update
```

---

# 97. UX States

The interface should support:

### Empty

New student.

### Learning

Active conversation.

### Assessing

Interactive question active.

### Processing

AI generating.

### Reviewing

Student reviewing previous material.

### Completed

Objective successfully demonstrated.

### Struggling

AI detects difficulty.

### Interrupted

Student leaves and returns later.

### Offline/error

Graceful recovery.

---

# 98. Error Handling

If retrieval fails:

> “I couldn't access that resource right now. I can still explain the concept using general knowledge, or you can reconnect your SummaStudy resources.”

If AI is uncertain:

> “Your notes don't clearly answer this. Here's the general explanation, and I'll distinguish it from what's in your materials.”

If Interactive generation fails:

The AI should fall back to conversational learning rather than blocking the session.

---

# 99. Performance

The chat should feel responsive.

Important:

* streaming responses
* optimistic UI where appropriate
* lazy-loading Interactives
* cached resources
* efficient retrieval
* background processing for expensive tasks
* resumable sessions

---

# 100. Technical Architecture

A conceptual architecture:

```text
                    SUMMA AI
                       │
              ┌────────┴────────┐
              │                 │
         Web Frontend       API Backend
              │                 │
              │          ┌──────┼──────┐
              │          │      │      │
              │       Learning AI   Memory
              │       Engine        │
              │          │          │
              │       Retrieval     │
              │          │          │
              │       SummaStudy    │
              │          │          │
              └──────────┴──────────┘
                       │
                    Database
```

---

# 101. Frontend Architecture

The frontend should treat Interactives as first-class UI components.

Conceptually:

```text
ChatMessage
 ├── Text
 ├── SourceCitation
 ├── Interactive
 │    ├── Quiz
 │    ├── Flashcards
 │    ├── Practice
 │    ├── Diagram
 │    └── Simulation
 └── ProgressCard
```

---

# 102. Backend Architecture

The backend should separate:

### API layer

Authentication and client communication.

### Conversation layer

Messages and sessions.

### Learning layer

Objectives, mastery, events.

### AI orchestration layer

Determines AI actions.

### Retrieval layer

Academic resources.

### Memory layer

Student learning context.

### Assessment layer

Questions and evaluation.

### Interactive layer

Generation, validation, persistence.

---

# 103. AI Architecture

The AI architecture should be modular rather than one massive prompt.

Potential internal components:

```text
Intent Analyzer
Learning Context Resolver
Student Model Retriever
Resource Retriever
Pedagogical Planner
Tutor
Assessment Generator
Assessment Evaluator
Misconception Detector
Interactive Generator
Mastery Estimator
Study Planner
Memory Manager
```

These may be implemented as logical modules rather than separate LLM agents.

Do not introduce multi-agent complexity unless it provides measurable value.

---

# 104. Model Strategy

The system should support model abstraction.

Do not hard-code the product to one model provider.

The architecture should allow:

* model selection
* task-specific models
* fallback models
* cheaper models for classification
* stronger models for difficult reasoning
* embeddings/retrieval models
* specialized evaluation models

---

# 105. AI Cost Strategy

Not every task requires the most expensive model.

Examples:

### Cheap model

* intent classification
* metadata extraction
* simple categorization

### Mid-tier model

* explanations
* question generation
* summarization

### Strong model

* complex reasoning
* difficult diagnosis
* sophisticated lesson planning

This is important for sustainable unit economics.

---

# 106. Security

Required:

* OAuth security
* encrypted credentials/tokens
* access control
* tenant isolation
* resource authorization
* rate limiting
* abuse protection
* secure file processing
* prompt injection defenses
* audit logging
* secure secrets management

---

# 107. Prompt Injection Protection

Academic resources may contain malicious or irrelevant instructions.

Retrieved content must be treated as **data**, not system instructions.

The AI should distinguish:

```text
System instructions
Developer instructions
Application context
Student input
Retrieved content
```

---

# 108. Observability

Track:

* AI latency
* retrieval latency
* Interactive failures
* generation failures
* assessment errors
* token/cost usage
* hallucination reports
* user feedback
* learning-event integrity

---

# 109. Evaluation Framework

Summa AI requires two evaluation layers.

## Product evaluation

Does the system work?

## Learning evaluation

Does the student learn?

---

# 110. AI Evaluation

Test:

* factual correctness
* source grounding
* pedagogical quality
* objective alignment
* difficulty
* feedback quality
* Interactive validity
* assessment correctness

---

# 111. Learning Evaluation

Test:

* pre/post mastery
* delayed retention
* transfer
* independent performance
* hint dependence
* error reduction

OpenAI's recent education research similarly emphasizes measuring learning outcomes over time rather than simply counting AI usage.

---

# 112. Experimentation

Future experiments may compare:

* direct explanation vs guided explanation
* static quiz vs adaptive quiz
* generic tutoring vs memory-aware tutoring
* fixed study plan vs adaptive plan
* passive flashcards vs adaptive retrieval

The objective is to discover what actually improves learning.

---

# 113. Success Metrics

## Primary

**Meaningful Mastery Gain**

## Secondary

* retention
* transfer
* exam readiness
* independent performance
* recurring error reduction
* learning efficiency

## Product

* weekly active learners
* learning sessions
* session completion
* returning learners
* Interactive usage
* subscription conversion
* retention

---

# 114. Anti-Metrics

Summa should avoid optimizing primarily for:

* message count
* session length
* number of generated Interactives
* number of uploaded files
* time spent in app

A student learning something in 15 minutes is better than a student chatting with Summa for two hours without learning.

---

# 115. Monetization

Summa AI is the premium intelligence layer of the Summa ecosystem.

Potential model:

### Free / limited

* basic tutoring
* limited AI usage
* limited Interactives
* basic memory

### Paid

* deeper memory
* advanced learning intelligence
* larger AI usage
* advanced Interactives
* exam preparation
* advanced progress
* advanced study planning
* expanded model access

Pricing should be validated through market testing.

---

# 116. SummaStudy Distribution Strategy

SummaStudy can act as the acquisition/distribution layer.

Potential journey:

```text
Student discovers SummaStudy
        ↓
Uses academic resources
        ↓
Sees "Learn with Summa AI"
        ↓
OAuth
        ↓
Personalized AI learning
        ↓
Premium conversion
```

This creates a natural funnel:

**Resources → Intelligence → Learning → Subscription**

---

# 117. Product Moat

The strongest long-term moat should not be:

> “We use an LLM.”

Anyone can do that.

Potential moat:

### 1. Academic resource ecosystem

SummaStudy.

### 2. Student learning memory

Longitudinal learning history.

### 3. Structured learner model

Mastery + objectives + misconceptions.

### 4. Learning event data

Evidence of how students learn.

### 5. Adaptive learning engine

Decision-making around what happens next.

### 6. Interactive runtime

A platform for dynamically generated learning experiences.

### 7. University/course context

Localized academic structure and resources.

Together:

```text
Resources
+
Learner Model
+
Learning Data
+
Adaptive Intelligence
+
Interactive Runtime
=
Summa AI
```

---

# 118. Competitive Positioning

Summa AI should not position itself simply as:

> AI tutor.

That category is crowded.

Better:

> **Personalized AI learning environment for university students.**

Or:

> **An AI learning companion that remembers what you know, understands what you struggle with, and adapts how you learn.**

Longer-term:

> **The intelligent learning layer for university education.**

---

# 119. Differentiation

### Generic AI

Answers questions.

### Traditional LMS

Organizes education.

### Flashcard app

Supports retrieval.

### Quiz platform

Tests knowledge.

### SummaStudy

Provides academic resources.

### Summa AI

**Understands the learner and orchestrates the learning process.**

---

# 120. Critical Product Constraint

Summa AI should not pretend to know a student's mastery with perfect accuracy.

All mastery values should be treated as estimates based on evidence.

The system should communicate uncertainty internally and avoid overconfident claims externally.

---

# 121. Critical UX Constraint

Never force a student to navigate away from the conversation simply because the AI needs to:

* quiz them
* show progress
* teach visually
* practice
* review
* generate flashcards
* analyze an answer

These should happen inline whenever practical.

---

# 122. Critical AI Constraint

The AI should optimize for:

> **Learning outcome**

rather than:

> **User satisfaction in the immediate turn.**

Sometimes the most helpful response is not the easiest response.

---

# 123. Critical Educational Constraint

Summa should prioritize:

**retrieval + reasoning + application + feedback + reflection + retention**

over:

**reading + rereading + answer consumption.**

---

# 124. Example End-to-End Experience

Student:

> Teach me database normalization using my CSC 203 materials.

Summa:

> I've found your CSC 203 normalization lecture and two related past-question sets.

It checks the student's history.

> You've previously shown good recall of 1NF, but you struggled with functional dependencies.

Then:

> Let's build that part first.

### Interactive appears

**Functional Dependency Explorer**

Student interacts.

Summa observes.

Then:

### Question

> If A determines B, what can we infer?

Student answers.

Summa evaluates.

> Correct. Now let's make it harder.

### Second Interactive

A normalization problem.

Student solves it.

Summa detects a mistake.

> You understand the dependency, but you're applying it incorrectly when identifying candidate keys.

It generates a targeted explanation.

Then:

### Practice

Three questions.

Student improves.

Then:

### Progress card

> Functional Dependencies: 44% → 71%

Finally:

> You're ready to move to 2NF. I'll bring functional dependencies back for retrieval practice later.

The student never left the conversation.

That is the experience Summa AI should aim for.

---

# 125. MVP Definition of Done

The MVP is successful when a student can:

* sign in with SummaStudy
* authorize resources
* start a conversation
* ask Summa to teach a topic
* upload/select resources
* receive source-grounded explanations
* answer guided questions
* interact with generated quizzes
* use generated flashcards
* complete guided practice
* receive meaningful feedback
* have their learning state updated
* see contextual progress
* return later
* have Summa remember relevant learning context
* continue from where they stopped
* find saved Interactives in My Learning

Most importantly:

> **The student should be able to enter with a learning problem and leave with demonstrably improved understanding.**

---

# 126. Future Vision

The mature Summa AI experience should feel less like:

> “Open an AI chatbot.”

and more like:

> **“Open my learning environment.”**

The system knows:

* what I'm studying
* where I'm strong
* where I'm weak
* what I've forgotten
* what resources I have
* what I've been working on
* what my goals are
* what assessment is coming
* what I should do next

And it can respond through whatever medium is most appropriate:

```text
Conversation
    +
Explanation
    +
Question
    +
Interactive
    +
Practice
    +
Feedback
    +
Memory
    +
Planning
    +
Assessment
```

---

# 127. Product North Star

The fundamental question behind every Summa AI feature should be:

> **Does this help the student learn something, retain it, apply it, understand their learning state, or make the next learning action better?**

If the answer is no, the feature probably does not belong in Summa AI.

---

# 128. Final Product Model

```text
                         SUMMA AI
                            │
                            ▼
                  PERSONALIZED LEARNING
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          CONVERSATION    MEMORY      RESOURCES
              │             │             │
              │             │         SUMMASTUDY
              │             │
              ▼             ▼
       LEARNING ORCHESTRATOR
              │
      ┌───────┼────────┐
      │       │        │
    TEACH   ASSESS   PRACTICE
      │       │        │
      └───────┼────────┘
              │
              ▼
         INTERACTIVES
              │
      ┌───────┼──────────┐
      │       │          │
    QUIZ   FLASHCARDS  SIMULATION
      │       │          │
      └───────┼──────────┘
              │
              ▼
          EVIDENCE
              │
              ▼
       LEARNER MODEL
              │
      ┌───────┼────────┐
      │       │        │
   MASTERY  ERRORS  RETENTION
      │       │        │
      └───────┼────────┘
              │
              ▼
        NEXT BEST ACTION
              │
              └───────────────→ LOOP
```

# 129. The Core Philosophy

**SummaStudy gives the student the material.**

**Summa AI gives the material meaning.**

**The conversation gives the student a place to learn.**

**Interactives turn explanations into experiences.**

**Assessment creates evidence.**

**Memory creates continuity.**

**The learner model creates personalization.**

**The adaptive engine decides what happens next.**

And the ultimate outcome is not:

> “The student used Summa AI.”

It is:

> **“The student learned.”**

That is the standard the entire product should be built against.
