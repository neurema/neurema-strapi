# Neurema Strapi Collections Documentation

This document provides detailed information about each collection (content type) in the Neurema Strapi application and the data they store.

## Overview

Neurema is a study management system that uses conceptual graphs and spaced repetition for learning. The system tracks students, their study topics, sessions, and questions organized by subjects and exams.

## Collections

### 1. User (users-permissions)
**Collection Name:** `up_users`  
**Description:** Standard Strapi user accounts with authentication capabilities.

**Fields:**
- `username` (string, required, unique): User's login name (min 3 characters)
- `email` (email, required): User's email address (min 6 characters)
- `name` (string, required): User's full name
- `password` (password, private): Encrypted password (min 6 characters)
- `provider` (string): Authentication provider (e.g., local, google)
- `confirmed` (boolean): Email confirmation status
- `blocked` (boolean): Whether the account is blocked
- `role` (relation): Link to users-permissions role
- `resetPasswordToken` (string, private): Token for password reset
- `confirmationToken` (string, private): Token for email confirmation

**Purpose:** Manages user authentication and basic account information.

---

### 2. Profile
**Collection Name:** `profiles`  
**Description:** Extended user profile linked to a plugin user, containing study preferences and institutional information.

**Fields:**
- `user` (relation - oneToOne): Link to users-permissions user
- `examType` (string): Type of exam the user is preparing for
- `examDate` (datetime): Target exam date
- `studyMode` (string): Current study mode/approach
- `isOnBreak` (boolean, default: false): Whether user is taking a break
- `isInstituteLinked` (boolean, default: false): If linked to an educational institution
- `college` (string): College/institution name
- `collegeEmail` (string): Institutional email address
- `year` (integer): Current academic year
- `rollNo` (string): Student roll number
- `dailyTopicLimit` (integer): Maximum topics to study per day
- `defaultSessionDuration` (integer): Default duration for study sessions
- `user_topics` (relation - oneToMany): Links to user's topic tracking records

**Purpose:** Stores user-specific study preferences, institutional affiliations, and study schedule settings.

---

### 3. Exam
**Collection Name:** `exams`  
**Description:** Exam metadata and grouped topics for different standardized exams.

**Fields:**
- `name` (string): Name of the exam (e.g., "NEET", "JEE")
- `highYieldTopics` (json): JSON array of topics that are frequently tested
- `subjects` (relation - manyToMany): Related subjects covered in this exam

**Purpose:** Organizes exam-specific information and identifies high-priority study topics.

---

### 4. Subject
**Collection Name:** `subjects`  
**Description:** Academic subjects (e.g., Physics, Chemistry, Biology).

**Fields:**
- `name` (string): Subject name
- `exams` (relation - manyToMany): Exams that include this subject
- `topics` (relation - oneToMany): Topics within this subject

**Purpose:** Organizes content into broad academic subjects for hierarchical organization.

---

### 5. Topic
**Collection Name:** `topics`  
**Description:** Individual study topics which may be conceptual or MCQ-based.

**Fields:**
- `name` (string): Topic name
- `section` (string): Sub-section or category within the subject
- `subject` (relation - manyToOne): Parent subject
- `conceptual` (relation - oneToOne): Associated conceptual graph (if applicable)
- `questions` (relation - oneToMany): MCQ questions for this topic
- `user_topics` (relation - oneToMany): Per-user tracking records for this topic

**Purpose:** Represents individual study topics that users can learn and practice.

---

### 6. Conceptual
**Collection Name:** `conceptuals`  
**Description:** Graph of conceptual nodes and edges representing knowledge structure for a topic.

**Fields:**
- `nodes` (json): JSON array of conceptual nodes with their properties
- `edges` (relation - oneToMany): Directed edges connecting nodes
- `question_nodes` (relation - oneToMany): Questions mapped to specific nodes
- `topic` (relation - oneToOne): Associated topic

**Purpose:** Stores the conceptual knowledge graph for visual learning and understanding topic relationships.

---

### 7. Edge
**Collection Name:** `edges`  
**Description:** Directed edges linking conceptual nodes in a knowledge graph.

**Fields:**
- `from` (string): Source node identifier
- `to` (string): Target node identifier
- `conceptual` (relation - manyToOne): Parent conceptual graph

**Purpose:** Defines relationships between concepts in the knowledge graph.

---

### 8. Question
**Collection Name:** `questions`  
**Description:** Multiple-choice questions or question definitions for practice and assessment.

**Fields:**
- `question` (text): Question text/statement
- `options` (json): JSON array of answer options
- `correctAnswer` (integer): Index of the correct answer in options array
- `topic` (relation - manyToOne): Topic this question belongs to
- `question_nodes` (relation - oneToMany): Links to nodes in conceptual graphs

**Purpose:** Stores MCQ questions for practice and testing, linkable to conceptual nodes.

---

### 9. Question Node
**Collection Name:** `question_nodes`  
**Description:** Junction connecting questions to specific nodes in conceptual graphs.

**Fields:**
- `node` (string): Node identifier in the conceptual graph
- `question` (relation - manyToOne): Associated question
- `conceptual` (relation - manyToOne): Parent conceptual graph

**Purpose:** Maps questions to specific concepts in the knowledge graph for targeted practice.

---

### 10. User Topic
**Collection Name:** `user_topics`  
**Description:** Per-user tracking information for topic progress using spaced repetition.

**Fields:**
- `profile` (relation - manyToOne): User's profile
- `topic` (relation - manyToOne): The topic being tracked
- `memoryLocation` (string): Current position in spaced repetition algorithm
- `lastSession` (datetime): Timestamp of last study session
- `nextSession` (datetime): Scheduled next study session
- `timeTotal` (integer): Total time allocated for this topic (seconds)
- `timeRemaining` (integer): Time remaining to complete topic (seconds)
- `revisionsDone` (integer): Number of revision sessions completed
- `sessions` (relation - oneToMany): Individual study sessions for this topic

**Purpose:** Implements spaced repetition tracking for each user-topic pair, managing when topics should be reviewed.

---

### 11. Study Session
**Collection Name:** `study_sessions`  
**Description:** Individual study sessions tracking study time and performance.

**Fields:**
- `user_topic` (relation - manyToOne): Associated user-topic tracking record
- `isPaused` (boolean, default: false): Whether session is currently paused
- `scheduledFor` (datetime): When this session was/is scheduled
- `timeTakenForRevision` (integer): Time spent on revision (seconds)
- `timeTakenForActivity` (integer): Time spent on practice activities (seconds)
- `timeAllotted` (integer): Total time allocated for session (seconds)
- `scoreActivity` (string): Performance score or results from activities
- `difficultyLevel` (string): Difficulty level of the session

**Purpose:** Tracks individual study sessions with timing and performance metrics.

---

## Data Relationships

### Hierarchical Content Structure
```
Exam → Subjects → Topics → Questions/Conceptuals
                           ↓
                     Question Nodes ← Edges
```

### User Progress Tracking
```
User → Profile → User Topics → Study Sessions
                      ↓
                   Topic
```

### Conceptual Learning Flow
```
Topic → Conceptual → Nodes (JSON) + Edges + Question Nodes
                                              ↓
                                         Questions
```

## Key Features

1. **Spaced Repetition**: User Topics track `lastSession`, `nextSession`, and `memoryLocation` for optimal review scheduling.

2. **Conceptual Graphs**: Topics can have visual knowledge graphs with nodes and edges, with questions mapped to specific concepts.

3. **Study Tracking**: Comprehensive session tracking including time allocation, actual time spent, and performance scores.

4. **Exam Preparation**: Content organized by exam type with high-yield topic identification.

5. **Institutional Integration**: Profiles support linking to educational institutions with college details and roll numbers.

## Database Schema Notes

- All collections have `draftAndPublish` disabled (content goes live immediately)
- No soft deletes are implemented; deletions are permanent
- Timestamps (createdAt, updatedAt) are automatically managed by Strapi
- All relations are properly inversed for bidirectional querying
