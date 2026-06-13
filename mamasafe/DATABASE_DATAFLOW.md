# MamaSafe Database Data Flow

This document describes the current pregnancy-focused data flow after older preconception and child-development modules were removed.

## System Overview

```mermaid
graph TB
    Frontend["Frontend SPA<br/>frontend/index.html<br/>script-new.js<br/>pregnancy RAG modules"]
    Backend["Express Backend<br/>backend/server.js"]
    MongoDB["MongoDB Atlas"]
    LocalStorage["Browser LocalStorage<br/>offline/user cache"]

    Frontend --> Backend
    Frontend --> LocalStorage
    Backend --> MongoDB
```

## Personal Pregnancy Layer

```mermaid
graph LR
    User["Mother/User"] --> Profile["users"]
    User --> Pregnancy["pregnancies"]
    User --> Reminders["reminders"]
    User --> Appointments["appointments"]
    User --> Assessments["pregnancy_vital_assessments"]
```

The personal layer stores account identity, pregnancy profile, due date/week, reminders, appointments, and saved vital-risk assessments.

## Dataset Layer

```mermaid
graph LR
    PregnancyPage["Pregnancy Page"] --> BackendRag["pregnancyRag service"]
    BackendRag --> Weeks["pregnancy_weeks"]
    BackendRag --> Symptoms["symptoms"]
    BackendRag --> DangerSigns["danger_signs"]
    BackendRag --> Nutrition["nutrition"]
    BackendRag --> FAQS["faqs"]
    BackendRag --> Articles["articles"]
    BackendRag --> WHO["who_guidelines / who_document_chunks"]
    BackendRag --> Risk["maternal_health_risk_records"]
```

The pregnancy page uses MongoDB dataset records for risk support, safety overrides, and educational answers.

## Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB

    User->>Frontend: Ask pregnancy question
    Frontend->>Backend: POST /api/pregnancy/rag/chat
    Backend->>MongoDB: Retrieve matching pregnancy dataset records
    Backend->>Backend: Apply danger-sign override when needed
    Backend->>MongoDB: Save chat_sessions record
    Backend-->>Frontend: Dataset-backed answer
```

## Risk Assessment Flow

```mermaid
sequenceDiagram
    participant Form as Vitals Form
    participant Backend
    participant MongoDB

    Form->>Backend: POST /api/pregnancy/vitals/assess
    Backend->>MongoDB: Read maternal_health_risk_records
    Backend->>Backend: Calculate calibrated risk result
    Backend->>MongoDB: Save pregnancy_vital_assessments
    Backend-->>Form: Risk level, score, guidance
```

Retired preconception and child-development collections and routes are no longer part of the active data flow.
