
# MamaSafe Project Overview

## 🚀 What is MamaSafe?
MamaSafe is an **AI‑powered pregnancy and early parenting health companion** providing personalized guidance, interactive tracking tools, educational courses, and curated resources for expectant and new parents through every stage of their journey—from preconception to toddlerhood.

---

## 🎯 Core Mission
Empower parents with accurate, accessible, and timely health information and tools in a supportive, easy‑to‑use platform.

## 🚨 Problem Statement
Expectant and new parents face significant challenges when navigating pregnancy and early parenting:
1. **Information Overload**: The internet is filled with conflicting, overwhelming, and sometimes unreliable pregnancy and parenting advice
2. **Limited 24/7 Access**: Personalized guidance from healthcare providers is not available around the clock
3. **Fragmented Tools**: Pregnancy tracking, baby name ideas, educational courses, and health chat are often spread across multiple disconnected apps
4. **Lack of Personalization**: Most advice is generic and doesn't adapt to an individual's specific stage, health history, or concerns
5. **Confidence Gap**: New parents often feel uncertain about their decisions, leading to stress and anxiety

MamaSafe addresses these problems by providing a unified, AI‑powered platform that delivers personalized, accessible, and trusted guidance 24/7.

---

## 🛠️ Technologies & Tools

### Backend Technologies
- **Runtime**: Node.js (v20‑27)
- **Web Framework**: Express.js (v5.2.1)
- **Database**: MongoDB Atlas (cloud) + Mongoose ODM (v9.4.1)
- **AI/ML**:
  - Groq SDK (v1.2.0) – runs Llama 3.3 70B
  - @huggingface/hub (v2.13.1) – optional model downloads
  - @huggingface/transformers (v4.2.0) – optional local inference
  - @tensorflow/tfjs (v4.22.0) – optional TensorFlow.js
  - @google/generative-ai (v0.24.1) – alternative AI (Gemini)
- **Authentication**: Passport.js (v0.7.0) + Google OAuth 2.0
- **Security**: Helmet (v8.1.0), CORS (v2.8.6), dotenv (v16.3.1)
- **Logging & Compression**: Morgan (v1.10.1), Compression (v1.8.1)
- **Utilities**: pdf‑parse (v2.4.5), express‑session (v1.19.0)

### Frontend Technologies
- **Markup & Styling**: HTML5, CSS3
- **Language**: Vanilla JavaScript (ES6+)
- **Authentication**: Firebase Auth
- **Utilities**: http‑server (v14.1.1) for local dev serving
- **AI Alternatives**: @google/generative-ai (v0.24.1)

### Development & DevOps
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (workflows in `.github/workflows/`)
- **Hosting Options**: Firebase Hosting, Render (via `render.yaml`)
- **Project Management**: GitHub Issues & Pull Requests

---

## 📱 Project Pages & Their Functions

### 🏠 Mamasafe (Home Dashboard)
- **`index.html`**:
  - Central hub for all features
  - Quick navigation to tools, chat, courses, baby names
  - Personalized pregnancy/parenting stage info
  - Notifications (🔔)
  - Theme toggle (🌙)
  - Search functionality (🔍)

### 🤰 Pregnancy
- **`pregnancy-advanced.html`**:
  - Advanced pregnancy tracking
  - Week‑by‑week pregnancy information
  - Symptoms, milestones, and tips
- **Pregnancy features**:
  - Neon‑themed pregnancy UI (`pregnancy-neon.js`)
  - Pregnancy tools and calculators (`pregnancy-tools.js`)
  - RAG (retrieval‑augmented generation) features (`pregnancy-rag.js`)

### 📚 Courses
- **Courses UI (`courses-functions.js`, `courses-ui.js`)**:
  - Pregnancy and parenting courses
  - Structured learning modules
  - Progress tracking

### 👶 Baby Names
- **Baby Names Features**:
  - Local names database (`frontend/local-names-database.js`)
  - Baby name suggestions and search
  - Tested via `backend/test-baby-names.js`

### ❓ Help Section
- **Help & Guidance**:
  - AI chat (`chat.html`, `health-chatbot.html`) for 24/7 help
  - Easy access to pregnancy/parenting resources

### 🔍 Search
- **Search Functionality**:
  - Search pages, words, and functions across the platform
  - Quick access to information

### 🔐 Authentication
- **`auth.html`**:
  - Google OAuth login/signup
  - Guest mode (feature‑locked)
  - Firebase Auth integration

### 🛠️ Admin
- **`admin/index.html`**:
  - Admin panel for platform management (requires admin credentials)

---

## 🧠 AI System Overview

### Primary AI: Llama 3.3 70B via Groq Cloud
This is the **exclusive AI for your project** after removing local models! Here's how it works:

1. **Where Llama lives**: Hosted on **Groq Cloud** (not on your local computer!)
2. **Why Groq?**:
   - Extremely fast responses (milliseconds!)
   - Free tier available with reasonable usage limits
   - Optimized specifically for Llama models
3. **How you access it**:
   - Using your **`GROQ_API_KEY`** stored in `backend/.env`
   - No Hugging Face token needed for this setup
4. **What it does**:
   - Answers pregnancy and parenting questions
   - Provides personalized health guidance
   - Generates responses tailored to your stage of pregnancy/parenting journey
   - Acts as a 24/7 virtual health companion

---

## 🔧 Full Architecture & Mechanics

### 1. Frontend (User Interface)
- **Location**: `mamasafe/frontend/`
- **Key Directories**:
  - `js/`: Core frontend JavaScript
    - `auth/`: Firebase Auth integration
    - `config/`: API and app constants
    - `features/`: Feature‑specific logic
    - `navigation/`: Client‑side routing
    - `services/`: Backend API communication
    - `utils/`: Helper functions
  - `src/`: Source files (components, services, html‑pages)
  - `assets/`: Images, logos, week‑by‑week pregnancy visuals
  - `admin/`: Admin panel

### 2. Backend (Server & Logic)
- **Location**: `mamasafe/backend/`
- **Key Directories & Files**:
  - `server.js`: Starts the Express server on port 5000
  - `routes/`: API endpoint definitions
    - `chatRoutes.js`: Chat API routes
  - `controllers/`: Request handlers
    - `chatController.js`: Chat request logic
  - `services/`: Core AI and business logic
    - `groqService.js`: Direct Groq Cloud + Llama 3.3 70B integration
    - `mamasafeAiPipeline.js`: Orchestrates AI workflow
  - `middleware/`: Auth, error handling, etc.
  - `models/`: Local model storage (now only `llama-groq-pregnancy-ai/` config remains)
  - `scripts/`: Data import, training, embedding generation (legacy/local AI setup)
  - `.env`: *Secret* configuration (not on GitHub!)

### 3. Data & Storage
- **MongoDB Atlas**:
  - Cloud NoSQL database
  - Stores user accounts, chat history, app data
  - Connection string via `MONGODB_URI` in `.env`
- **Firebase Auth**:
  - User authentication
  - Google OAuth integration

---

## 🔄 Step‑by‑Step: How a User Query Becomes an AI Response

Here's exactly what happens when someone asks the AI a question:

1. **User types a question** in `chat.html` or `health-chatbot.html`
2. **Frontend sends an HTTP POST request** to `/api/chat` on the backend
3. **Backend request handling**:
   - `chatRoutes.js` receives and routes the request
   - `chatController.js` processes input and prepares the prompt
   - `mamasafeAiPipeline.js` selects the AI service (Groq)
4. **AI service call**:
   - `groqService.js` uses your `GROQ_API_KEY` to send the question to Groq Cloud
   - Groq runs the **Llama 3.3 70B** model on their specialized Language Processing Units (LPUs)
   - Groq streams or returns the AI‑generated response back to your backend
5. **Response returned to frontend**:
   - Backend sends Llama's answer to the browser as JSON
   - Frontend displays the response to the user in the chat interface
6. **(Optional)**: Chat history is saved to MongoDB Atlas for future reference

---

## 📝 Environment Variables & Secrets

Your `backend/.env` file contains:
- **`GROQ_API_KEY`**: *Required* – Your key to access Llama on Groq Cloud
- **`HUGGING_FACE_HUB_TOKEN`**: Optional – For downloading models from Hugging Face (not needed for current setup)
- **`MONGODB_URI`**: MongoDB Atlas connection string
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`**: For Google OAuth login
- **`PORT`**: Server port (default 5000)
- **`NODE_ENV`**: Environment (`development`/`production`)
- **`ADMIN_USERNAME` / `ADMIN_PASSWORD`**: Admin panel credentials
- Email/SMTP config (optional)
- **`MEDGEMMA_BASE_URL`**: Optional alternative AI service

**Important**: `.env` is excluded from GitHub via `.gitignore` to keep your secrets safe!

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v20‑27)
- npm (comes with Node.js)
- A `GROQ_API_KEY` (from [console.groq.com](https://console.groq.com/))
- (Optional) MongoDB Atlas account (for full data persistence)

### Backend Setup
1. **Navigate to backend**:
   ```bash
   cd mamasafe/backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment**:
   - Copy `.env.example` to `.env` (if available) or create `.env`
   - Fill in your `GROQ_API_KEY` and other config
4. **Start the backend server**:
   ```bash
   npm start
   # Or use one of the batch files (Windows):
   # start-server.bat, start-backend-simple.bat, etc.
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup
1. **Navigate to frontend**:
   ```bash
   cd mamasafe/frontend
   ```
2. **Open in browser**:
   - Option 1: Directly open `index.html`
   - Option 2: Use a local dev server (recommended):
     ```bash
     npm run serve
     ```
   - Option 3: VS Code "Live Server" extension

### Access the App
- Open `http://localhost:5000` (if serving frontend via backend) or your local dev server URL
- Log in with Google or use guest mode
- Start chatting with the Llama‑powered AI!

---

## 📚 Optional: Legacy Local AI Setup

If you ever want to experiment with running AI models locally (instead of using Groq):
1. **Install Python** (see `backend/PYTHON_SETUP.md`)
2. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Download models** using:
   - `backend/download_huggingface_model.py` (Python)
   - `backend/download_hf_model_node.js` (Node.js)
4. **Update the pipeline**: Modify `mamasafeAiPipeline.js` to use local models instead of Groq

---

## 🎉 You're All Set!
Your MamaSafe project is now streamlined and running perfectly with **Llama 3.3 70B via Groq Cloud**! No need for huge local models or expensive hardware—Groq takes care of all the heavy lifting!

---

## 🚀 Deployment Guide

### Prerequisites
- A GitHub account with your code pushed (done!)
- A Render account (free tier works great)
- A Firebase account (free tier works great)
- Your `GROQ_API_KEY`, `MONGODB_URI`, and other env vars from `mamasafe/backend/.env`

---

### Step 1: Deploy Backend to Render
1. Go to [https://render.com](https://render.com) and log in/sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your `mamasafe1` repo
4. Render will automatically detect your `render.yaml`!
5. In the Environment Variables section:
   - Add all the "sync: false" variables from `render.yaml`:
     - `PUBLIC_BACKEND_URL` (we'll fill this after deployment)
     - `MONGODB_URI` (your MongoDB Atlas connection string)
     - `GROQ_API_KEY` (your Groq API key)
     - `GOOGLE_CLIENT_ID` (from Google Cloud Console)
     - `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
     - `ADMIN_USERNAME` (your admin username)
     - `ADMIN_PASSWORD` (your admin password)
6. Click **"Create Web Service"**
7. Wait for deployment (takes a few minutes)
8. Once deployed, copy your Render backend URL (looks like `https://mamasafe-backend-xxxxx.onrender.com`) and set it as `PUBLIC_BACKEND_URL` in Render's env vars
9. Also add your Render URL to `CORS_ORIGINS` in Render's env vars if needed

---

### Step 2: Deploy Frontend to Firebase Hosting
1. Make sure you have Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase in your project root (if not already done):
   ```bash
   cd c:\Users\ntare\Downloads\mamacare
   firebase init hosting
   ```
   - Select your existing Firebase project (or create a new one)
   - When asked for public directory, enter `mamasafe/frontend`
   - Configure as a single-page app? No (unless you want to)
4. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```
5. Wait for deployment, and you'll get your Firebase Hosting URL (looks like `https://your-project-name.web.app`)

---

### Step 3: Update CORS & API Config
- In Render's `CORS_ORIGINS` env var, add your Firebase Hosting URL
- In your frontend's API config, update the backend URL to your Render URL giving you fast, free AI!
