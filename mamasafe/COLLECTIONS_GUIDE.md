# 🗄️ MongoDB Collections & Llama Integration

## What each collection stores (and how Llama uses them)

Your Mamasafe app has **two types of AI/data**:

1. **Llama 3.3 70B (via Groq)**: The main AI that answers pregnancy questions
2. **MongoDB Collections**: Store app data, which Llama uses to give personalized answers

---

## 📦 Collection Breakdown

### 👤 User & App State
| Collection | What it stores | How Llama uses it |
|------------|----------------|-------------------|
| `users` | User accounts (name, email, pregnancy stage, due date, etc.) | Llama uses this to give *personalized advice* (e.g., if you're in week 20, it gives week‑20‑specific info) |
| `pregnancies` | Active pregnancy records | Llama uses this to tailor responses to your current pregnancy |
| `pregnancy_data` | General pregnancy information | Used for quick facts and reference |
| `pregnancy_weeks` | Week‑by‑week pregnancy info | Llama pulls week‑specific guidance from here |

### 💬 AI Chat & History
| Collection | What it stores | How Llama uses it |
|------------|----------------|-------------------|
| `chatHistory` | Complete chat logs between users and Llama | Llama sees your conversation history to remember previous questions and give consistent answers |
| `chat_sessions` | Individual chat sessions | Tracks which chat is which |

### 📊 Health & Medical Data
| Collection | What it stores | How Llama uses it |
|------------|----------------|-------------------|
| `pregnancy_vital_assessments` | Vital signs (BP, blood sugar, heart rate, BMI) | Llama analyzes this to give health advice and flag concerns |
| `maternal_health_risk_records` | Risk assessment records | Llama uses this for risk evaluation |
| `danger_signs` | List of pregnancy danger signs | Llama uses this to recognize and warn about dangers |
| `symptoms` | Symptom tracking | Llama uses this to give symptom‑specific guidance |
| `nutrition` | Nutrition tracking | Llama gives dietary advice based on this |
| `sleep` | Sleep tracking | Llama gives sleep tips |
| `health_pregnancy_indicators` | Health indicators data | Used for health assessments |
| `who_anc_data_elements` | WHO ANC guidelines | Llama references WHO guidelines for evidence‑based advice |
| `mn_survey_records` | MNCH survey data | Reference data |
| `maternal_mortality_indicators` | Mortality indicators (reference) | Reference data |

### 📚 Educational & Reference Content
| Collection | What it stores | How Llama uses it |
|------------|----------------|-------------------|
| `articles` | Educational articles | Llama pulls info from these |
| `faqs` | Frequently asked questions | Llama uses these for quick answers |
| `who_guidelines` | WHO guidelines documents | Evidence‑based reference for Llama |
| `who_document_chunks` | Chunked WHO docs | Used for retrieval‑augmented generation (RAG) |
| `milestones` | Developmental milestones | Llama uses this for baby milestone info |

### 📅 Reminders, Appointments & Activities
| Collection | What it stores | How Llama uses it |
|------------|----------------|-------------------|
| `reminders` | User reminders | Llama can help set and remind about appointments, meds, etc. |
| `appointments` | Medical appointments | Llama uses this to ask about upcoming/previous visits |
| `notifications` | Push notifications | App notifications |
| `activities` | User activity logs | Tracks user actions |

### 🔧 App Admin & Events
| Collection | What it stores |
|------------|----------------|
| `app_events` | App event logs (tracks actions in the app) |
| `admin_audit` | Admin audit logs (tracks admin panel actions) |
| `pregnancy_source_datasets` | Source datasets for import scripts |
| `pregnancy_knowledge` | Knowledge base data |

---

## 🤖 How Llama Works with MongoDB

When you ask Llama a question like:
> "I'm 25 weeks pregnant and my blood pressure is 140/90, should I worry?"

Here's what happens:
1. Backend fetches *your user profile* from `users`
2. Backend fetches *your vital signs* from `pregnancy_vital_assessments`
3. Backend fetches *week 25 info* from `pregnancy_weeks`
4. Backend fetches *danger signs* from `danger_signs`
5. Backend sends all this **context** to Llama via Groq
6. Llama uses this personal data + general guidelines to give a personalized answer

Llama is hosted on Groq, but uses *your MongoDB data* to make answers personal!
