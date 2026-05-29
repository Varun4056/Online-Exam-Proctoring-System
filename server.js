const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// In-memory data store for demo project
const db = {
  users: [
    { id: "t1", username: "teacher1", password: "admin", role: "teacher" },
    { id: "s1", username: "student1", password: "1234", role: "student" }
  ],
  exam: {
    id: "exam-default",
    title: "Sample Demo Exam",
    durationMinutes: 10,
    totalMarks: 10,
    questions: [
      {
        id: "q1",
        text: "2 + 2 = ?",
        options: ["1", "2", "3", "4"],
        answerIndex: 3,
        marks: 5
      },
      {
        id: "q2",
        text: "Capital of India?",
        options: ["Delhi", "Mumbai", "Chennai", "Kolkata"],
        answerIndex: 0,
        marks: 5
      }
    ]
  },
  submissions: [],
  proctorLogs: []
};

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve frontend files (index.html, script.js)
app.use(express.static(__dirname));

app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  const user = db.users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ id: user.id, username: user.username, role: user.role });
});

app.get("/api/exam", (req, res) => {
  if (!db.exam) {
    return res.status(404).json({ message: "No exam available" });
  }
  res.json(db.exam);
});

app.post("/api/exam", (req, res) => {
  const { title, durationMinutes, questions } = req.body;
  if (!title || !durationMinutes || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ message: "Invalid exam payload" });
  }

  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  db.exam = {
    id: "exam-teacher",
    title,
    durationMinutes: Number(durationMinutes),
    totalMarks,
    questions
  };
  res.json({ message: "Exam saved", exam: db.exam });
});

app.delete("/api/exam", (req, res) => {
  db.exam = null;
  res.json({ message: "Exam deleted" });
});

app.post("/api/exam/submit", (req, res) => {
  const { userId, answers } = req.body;
  if (!db.exam) {
    return res.status(404).json({ message: "No exam available" });
  }

  let score = 0;
  const details = [];
  db.exam.questions.forEach((q) => {
    const selectedIndex =
      answers && Object.prototype.hasOwnProperty.call(answers, q.id)
        ? Number(answers[q.id])
        : null;
    const isCorrect = selectedIndex === q.answerIndex;
    if (isCorrect) score += q.marks;
    details.push({
      questionId: q.id,
      question: q.text,
      selected: selectedIndex !== null ? q.options[selectedIndex] : "Not answered",
      correct: q.options[q.answerIndex],
      isCorrect
    });
  });

  const submission = {
    id: uuidv4(),
    userId,
    score,
    totalMarks: db.exam.totalMarks,
    details,
    submittedAt: new Date().toISOString()
  };
  db.submissions.push(submission);
  res.json(submission);
});

app.post("/api/proctor/log", (req, res) => {
  const { userId, type, details } = req.body;
  db.proctorLogs.push({
    id: uuidv4(),
    userId,
    type,
    details,
    createdAt: new Date().toISOString()
  });
  res.json({ message: "Log saved" });
});

app.post("/api/proctor/snapshot", upload.single("snapshot"), (req, res) => {
  db.proctorLogs.push({
    id: uuidv4(),
    userId: req.body.userId || "unknown",
    type: "snapshot",
    details: { file: req.file ? req.file.filename : null },
    createdAt: new Date().toISOString()
  });
  res.json({ message: "Snapshot saved", file: req.file ? req.file.filename : null });
});

app.get("/api/admin/submissions", (req, res) => {
  res.json(db.submissions);
});

app.get("/api/admin/proctor-logs", (req, res) => {
  res.json(db.proctorLogs);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
