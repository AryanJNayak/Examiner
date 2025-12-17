# Examiner — Online Exam Platform

**Examiner** is a full-stack online exam management system (React + Vite frontend, Express/MongoDB backend) with an experimental AI module to index syllabus PDFs and generate MCQs using Google Gemini + Pinecone (RAG).

---

## ✨ Features

- Role-based users: **Admin**, **Teacher**, **Student**
- Teacher: create exams, upload student lists, view results and statistics
- Admin: upload teacher/course lists, fetch aggregated counts and reports
- Student: attempt exams, view results, download result PDFs
- AI-assisted MCQ generator:
  - Index syllabus PDFs into Pinecone
  - Generate MCQs using Gemini (Google Generative AI)
- File upload support (XLSX for lists, PDFs for syllabus, generated result PDFs)

---

## 🧩 Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: React + Vite
- AI: Google Gemini (via @google/genai / @langchain), Pinecone vector DB
- Utilities: multer, pdfkit, xlsx

---

## 🚀 Quick start

Prerequisites:
- Node.js (v18+ recommended)
- MongoDB (Atlas)
- Pinecone account and index
- Google Generative AI (Gemini) API Key

1. Clone the repo

```bash
git clone git@github.com:AryanJNayak/Examiner.git
cd Examiner
```

2. Install dependencies

```bash
# root
npm install

# backend
cd backend && npm install

# frontend
cd ../examiner && npm install
```

3. Create `.env` in the project root with required variables (see next section) and ensure your MongoDB is accessible.

4. Run (dev):

```bash
# from project root
npm run start

# or run server and client individually
cd backend && npm run dev
cd examiner && npm run dev
```

The client runs by default on Vite (http://localhost:5173) and backend on http://localhost:80 (or `PORT` if set).

---

## 🔐 Environment variables

Create a `.env` file in the project root and set at least:

```
# Mongo
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/examiner
PORT=80

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Pinecone (if used)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX_NAME=your_index_name

# (Optional / recommended) Move secrets currently hard-coded in code into env vars
# Example: JWT_SECRET, MAIL_USER, MAIL_PASS
JWT_SECRET=some_strong_random_secret
MAIL_USER=you@domain.com
MAIL_PASS=app_password_or_env_secret
```

> Note: The repository currently uses a hard-coded `JWT_SECRET` and in-code mail credentials inside `backend/controller/auth.js` — replace these with environment variables for security.

---

## 🔎 Notable npm scripts

- Root (runs both client and server): `npm run start`
- Backend: `npm run dev` (nodemon), `npm run start`
- AI indexing (manual): `node backend/ai-mcq/index.js` — use to index a PDF into Pinecone
- Frontend: `cd examiner && npm run dev` (Vite)

---

## 📡 API overview

Base URL: `http://localhost:80/api` (or set `PORT`)

### Auth (public)
- POST `/auth/signup` — body: { role, email, password, ... }
- POST `/auth/login` — body: { role, email, password }
- POST `/auth/forgot-password` — body: { email, role }
- POST `/auth/verify` — body: { email, otp }
- POST `/auth/reset-password` — body: { role, email, password }
- GET `/auth/getUser` — headers: Authorization token (uses `fetchuser` middleware)

### Admin
- POST `/admin/teacherList` — form-data with key `xlsx` upload teacher/course XLSX (processes courses & departments)
- GET `/admin/counts` — returns top-level counts
- GET `/admin/getResults` — aggregated results per department

### Teacher
- POST `/teacher/studentList` — form-data with key `xlsx` to upload students list
- POST `/teacher/exam` — create an exam (body contains teacher_id, course_id, startTime, endTime, questions)
- GET `/teacher/exams/:teacherId` — get teacher exams
- POST `/teacher/studentsStatus` — get status, POST `/teacher/gender` — gender stats

### Student
- GET `/student/user-exam/:userId` — exams for student
- GET `/student/exam/:examId` — single exam data
- POST `/student/exam/:examId` — submit answers
- GET `/student/result/:studentId` — get student results
- POST `/student/result` — generate result PDF

### AI (RAG & MCQ)
- POST `/api/ai/upload` — form-data with key `file` (PDF) to upload & index into Pinecone
- POST `/api/ai/generate` — body: { count: 5 } to generate MCQs (returns array of MCQ objects)

Example MCQ generation cURL:

```bash
# Upload PDF
curl -X POST -F "file=@/path/to/syllabus.pdf" http://localhost:80/api/ai/upload

# Generate MCQs
curl -X POST -H "Content-Type: application/json" -d '{"count":5}' http://localhost:80/api/ai/generate
```

---

## 📁 Uploads & storage

- Admin uploads: `backend/upload/Admin/`
- Teacher uploads (student lists): `backend/upload/Teacher/`
- Result PDFs: `backend/upload/results/`

---

## ✅ Security & TODOs

- Move `JWT_SECRET` and mail credentials out of code and into `.env`
- Validate and rate-limit AI endpoints to prevent abuse
- Add comprehensive tests (unit/integration)
- Improve error handling and status codes where currently 204/500 are used

---

## 💡 Contribution

1. Fork the repo
2. Create a feature branch
3. Open a PR with a clear description

---

## 📜 License

This project currently does not include a LICENSE file.
---
