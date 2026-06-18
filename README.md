# Mamasafe (Current Project)

Mamasafe is a pregnancy and motherhood care web app with AI support, week-by-week guidance, baby name discovery, and a Professional Help Center (hospitals + pharmacies + booking links).

This repository uses a single-page style UI (multiple page sections in `mamasafe/frontend/index.html`) powered primarily by a consolidated frontend script: `mamasafe/frontend/script-new.js`.

---

## What’s working / key UI areas

- **Pregnancy Risk Screening + Week Tracker**: `mamasafe/frontend/index.html` loads `mamasafe/frontend/js/features/pregnancy-rag.js` and uses functionality inside `mamasafe/frontend/script-new.js`.
- **Professional Help Center** (in `index.html`):
  - Hospitals search + categories
  - Pharmacies search + categories
  - **GPS sorting** for hospitals + pharmacies using browser geolocation
  - Appointments tab provides **external booking/calling/map links** (no internal scheduler UI in this repo)

---

## GPS sorting in Help Center (implemented)

`mamasafe/frontend/script-new.js` includes implementations for:

- `useHelpLocation()` (Hospitals GPS)
- `useHelpPharmacyLocation()` (Pharmacies GPS)

Both functions:

1. Request geolocation via `navigator.geolocation.getCurrentPosition`.
2. Compute distance to Rwanda district coordinates.
3. Sort the in-memory hospitals/pharmacies lists by distance.
4. Render the nearest results into `#helpHospitalList` and `#helpPharmacyList` and update the GPS status text.

---

## Frontend structure

- **Entry UI**: `mamasafe/frontend/index.html`
- **Main JS (consolidated)**: `mamasafe/frontend/script-new.js`
- **Pregnancy RAG / TensorFlow fallback feature**: `mamasafe/frontend/js/features/pregnancy-rag.js`
- **Additional feature scripts**:
  - `mamasafe/frontend/js/features/pregnancy-advanced.js`
  - `mamasafe/frontend/js/features/pregnancy-neon.js` (if referenced by pages)

---

## Backend (overview)

Backend implementation exists at the repository root (Express/server) and serves the frontend plus API endpoints.

Key folders/files at root include:

- `server.js`
- `backend-api.js`
- `backend/services/` (AI/services utilities)

---

## How to run

Use one of the provided start scripts/batch files:

- `start-mamasafe.bat`
- `start-both-servers.bat`
- `run-frontend.bat`
- `run-backend.bat`

(Exact steps depend on your local environment setup for Node and MongoDB.)

---

## Notes / limitations

- The Help Center “Appointments” tab in `mamasafe/frontend/index.html` shows external booking/telephone/map actions.
- Appointment **scheduling + saved appointment reminders** are not present as a scheduler UI/model in the repository at this time.

---

## Files modified in this update

- `mamasafe/frontend/script-new.js`
- `README.md` (this project documentation is updated to match the current repo UI structure)

---

## License

Proprietary and confidential. All rights reserved.

