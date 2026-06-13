# MongoDB Setup For MamaSafe

MamaSafe now uses MongoDB for pregnancy-focused records, dataset-backed pregnancy guidance, chat history, reminders, and admin/support activity.

## Core Collections

- `users` - account identity and profile fields.
- `pregnancies` - user pregnancy profile, due date, week, trimester, risk level, and notes.
- `pregnancy_data` - legacy pregnancy tracker entries.
- `pregnancy_vital_assessments` - saved pregnancy risk assessments.
- `maternal_health_risk_records` - expanded maternal risk CSV records with vitals, BMI, previous complications, diabetes flags, mental health flag, and risk level.
- `reminders` - prenatal checkups and care alerts.
- `appointments` - appointment records.
- `chat_sessions` - pregnancy RAG conversation history.
- `activities` - admin/support activity records.

## Pregnancy Dataset Collections

- `pregnancy_weeks`
- `symptoms`
- `danger_signs`
- `nutrition`
- `faqs`
- `articles`
- `who_guidelines`
- `who_document_chunks`
- `pregnancy_source_datasets`
- `maternal_health_risk_records`
- `who_anc_data_elements`

## Main API Endpoints

- `GET /api/health`
- `POST /api/users`
- `GET /api/users/:id`
- `POST /api/pregnancies`
- `GET /api/pregnancies/:userId`
- `POST /api/pregnancy`
- `GET /api/pregnancy/:userId`
- `POST /api/pregnancy/vitals/assess`
- `GET /api/pregnancy/risk/trends`
- `POST /api/ai-pregnancy-tracking`
- `POST /api/pregnancy/rag/chat`
- `GET /api/pregnancy/dataset/status`
- `POST /api/reminders`
- `GET /api/reminders/:userId`
- `POST /api/appointments`
- `GET /api/appointments/:userId`

Retired preconception and child-development modules no longer have frontend pages or backend data endpoints.

## Refresh The Maternal Risk Dataset

```bash
node backend/scripts/seed-pregnancy-downloaded-datasets.js --risk-only
```

The focused seed mode updates the source manifest and `maternal_health_risk_records` without refreshing the larger WHO PDF chunks.
