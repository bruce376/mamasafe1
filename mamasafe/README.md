# MamaSafe

MamaSafe is a pregnancy-focused web application for mothers. It combines a single-page frontend, MongoDB-backed pregnancy datasets, risk assessment tools, reminders, courses, baby-name search, and chatbot support.

## Current Features

- Pregnancy dashboard with due date, week, trimester, symptoms, vitals, kicks, contractions, reminders, and notes.
- MongoDB-backed pregnancy risk assessment using the expanded maternal risk dataset with BP, glucose, temperature, heart rate, BMI, complications, diabetes flags, mental health flag, age, and risk level.
- Pregnancy RAG chatbot that retrieves dataset records before answering.
- Safety override layer for urgent pregnancy danger signs.
- Baby Names page with AI-assisted name details.
- Courses page for pregnancy, breastfeeding support, recovery, safety, and maternal wellness.
- Help section, account pages, admin panel, and health chatbot support.

Older preconception and child-development modules have been retired from the active app.

## Main Stack

- Frontend: HTML, CSS, JavaScript SPA in `frontend/`.
- Backend: Express server in `backend/server.js`.
- Database: MongoDB Atlas.
- AI: Groq-backed services plus MongoDB pregnancy dataset retrieval.
- Auth: local/Firebase-compatible frontend auth helpers.

## Important Paths

- `frontend/index.html` - main SPA shell.
- `frontend/script-new.js` - main frontend behavior.
- `frontend/js/features/pregnancy-rag.js` - pregnancy dataset chatbot UI.
- `frontend/js/features/pregnancy-advanced.js` - pregnancy tools and guidance.
- `backend/server.js` - API server.
- `backend/services/pregnancyRag.js` - MongoDB pregnancy RAG and risk logic.
- `backend/services/localHealthChatbot.js` - local pregnancy health fallback.
- MongoDB collections - pregnancy knowledge, risk records, guideline chunks, vector embeddings, symptoms, nutrition, and danger signs.

## Run

```bash
npm install
npm start
```

The backend serves the frontend from `frontend/` and falls back to `frontend/index.html` for SPA routes.

## Checks

```bash
npm test
```

The test script runs syntax checks for the active backend and frontend JavaScript modules.

## Dataset Storage

```bash
npm --prefix backend run embed:pregnancy-knowledge
```

Pregnancy datasets should live in MongoDB, not in backend files. The backend only connects to MongoDB, generates embeddings, performs retrieval, and sends context to the Groq Llama 3.3 70B AI model.
