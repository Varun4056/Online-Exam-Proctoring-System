# Online Exam & Proctoring System

A simple full-stack project for college use:
- Teacher login and exam creation
- Student login and timed exam
- Score with correct/incorrect answer details
- Webcam + microphone permission
- Basic anti-cheating checks (tab switch detection + webcam monitoring from frontend)

## Project files

- `index.html` - Frontend UI
- `script.js` - Frontend logic
- `server.js` - Node.js backend API + static file serving
- `package.json` - Dependencies and scripts

## Demo credentials

- Teacher: `teacher1 / admin`
- Student: `student1 / 1234`

## How to run

1. Open terminal in project folder:
   - `c:\6th Sem\Full Stack Development PBL`
2. Install dependencies:
   - `npm install`
3. Start server:
   - `npm start`
4. Open browser:
   - `http://localhost:3000`

## Available API routes

- `POST /api/login`
- `GET /api/exam`
- `POST /api/exam`
- `DELETE /api/exam`
- `POST /api/exam/submit`
- `POST /api/proctor/log`
- `POST /api/proctor/snapshot`
- `GET /api/admin/submissions`
- `GET /api/admin/proctor-logs`

## Notes

- Data is in-memory in this demo backend (resets after server restart).
- Webcam face-direction detection depends on browser support.
- For production use, connect a real database and authentication tokens.
