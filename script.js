// ============================================
// FULL WORKING ONLINE EXAM + PROCTORING SYSTEM
// ============================================

// ===============================
// GLOBAL VARIABLES
// ===============================

let currentUser = null;
let currentRole = "student";
let currentExam = null;
let examInProgress = false;

let remainingSeconds = 0;
let timerInterval = null;

let mediaStream = null;

let snapshotInterval = null;

let faceMonitorInterval = null;

let offCenterCount = 0;

let lastPopupAt = 0;

// ===============================
// DOM ELEMENTS
// ===============================

const loginBtn =
  document.getElementById("login-btn");

const loginStatus =
  document.getElementById("login-status");

const loginHint =
  document.getElementById("login-hint");

const roleToggle =
  document.getElementById("role-toggle");

const roleLabel =
  document.getElementById("role-label");

const teacherPanel =
  document.getElementById("teacher-panel");

const examSection =
  document.getElementById("exam-section");

const examTitle =
  document.getElementById("exam-title");

const examMeta =
  document.getElementById("exam-meta");

const questionsDiv =
  document.getElementById("questions");

const timerEl =
  document.getElementById("timer");

const submitBtn =
  document.getElementById("submit-btn");

const submitStatus =
  document.getElementById("submit-status");

const scoreBox =
  document.getElementById("score-container");

const scoreEl =
  document.getElementById("score");

const submittedAtEl =
  document.getElementById("submitted-at");

const detailsEl =
  document.getElementById("details");

// Teacher

const examTitleInput =
  document.getElementById("exam-title-input");

const examDurationInput =
  document.getElementById("exam-duration-input");

const questionCountInput =
  document.getElementById("question-count-input");

const generateQuestionsBtn =
  document.getElementById("generate-questions-btn");

const teacherQuestionsContainer =
  document.getElementById(
    "teacher-questions-container"
  );

const createExamBtn =
  document.getElementById("create-exam-btn");

const deleteExamBtn =
  document.getElementById("delete-exam-btn");

const teacherStatus =
  document.getElementById("teacher-status");

// Camera

const webcamVideo =
  document.getElementById("webcam");

const startCameraBtn =
  document.getElementById("start-camera-btn");

const mediaStatus =
  document.getElementById("media-status");

// ===============================
// USERS
// ===============================

const users = [

  {
    id: "t1",
    username: "teacher1",
    password: "admin",
    role: "teacher"
  },

  {
    id: "s1",
    username: "student1",
    password: "1234",
    role: "student"
  }
];

// ===============================
// DEFAULT EXAM
// ===============================

let exam = {

  id: "default-exam",

  title: "Demo Exam",

  durationMinutes: 5,

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
      options: [
        "Delhi",
        "Mumbai",
        "Chennai",
        "Kolkata"
      ],
      answerIndex: 0,
      marks: 5
    }
  ]
};

// ===============================
// ROLE SWITCH
// ===============================

function setRole(role) {

  currentRole = role;

  const isTeacher =
    role === "teacher";

  roleLabel.textContent =
    isTeacher
      ? "Teacher Login"
      : "Student Login";

  loginHint.textContent =
    isTeacher
      ? "teacher1 / admin"
      : "student1 / 1234";

  teacherPanel.style.display =
    isTeacher
      ? "block"
      : "none";
}

roleToggle.addEventListener(
  "click",
  () => {

    setRole(
      currentRole === "student"
        ? "teacher"
        : "student"
    );
  }
);

// ===============================
// LOGIN
// ===============================

loginBtn.addEventListener(
  "click",
  () => {

    const username =
      document.getElementById(
        "username"
      ).value.trim();

    const password =
      document.getElementById(
        "password"
      ).value.trim();

    const user =
      users.find(
        u =>
          u.username === username &&
          u.password === password &&
          u.role === currentRole
      );

    if (!user) {

      loginStatus.textContent =
        "Invalid Credentials";

      return;
    }

    currentUser = user;

    loginStatus.textContent =
      `Logged in as ${user.username}`;

    if (
      currentRole === "student"
    ) {

      renderExam();
    }
  }
);

// ===============================
// GENERATE QUESTIONS
// ===============================

generateQuestionsBtn.addEventListener(
  "click",
  () => {

    const count =
      parseInt(
        questionCountInput.value
      );

    if (!count || count < 1) {

      teacherStatus.textContent =
        "Enter valid count";

      return;
    }

    teacherQuestionsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {

      const div =
        document.createElement("div");

      div.className = "question";

      div.innerHTML = `

        <input
          class="question-text"
          placeholder="Question ${i + 1}"
        />

        <input
          class="question-option"
          placeholder="Option 1"
        />

        <input
          class="question-option"
          placeholder="Option 2"
        />

        <input
          class="question-option"
          placeholder="Option 3"
        />

        <input
          class="question-option"
          placeholder="Option 4"
        />

        <input
          class="question-answer"
          type="number"
          min="1"
          max="4"
          placeholder="Correct Option"
        />

        <input
          class="question-marks"
          type="number"
          value="5"
          placeholder="Marks"
        />
      `;

      teacherQuestionsContainer
        .appendChild(div);
    }

    teacherStatus.textContent =
      "Questions Generated";
  }
);

// ===============================
// CREATE EXAM
// ===============================

createExamBtn.addEventListener(
  "click",
  () => {

    const title =
      examTitleInput.value.trim();

    const duration =
      parseInt(
        examDurationInput.value
      );

    if (!title || !duration) {

      teacherStatus.textContent =
        "Fill all fields";

      return;
    }

    const blocks =
      teacherQuestionsContainer
        .querySelectorAll(".question");

    const questions = [];

    let totalMarks = 0;

    blocks.forEach((block, i) => {

      const text =
        block.querySelector(
          ".question-text"
        ).value;

      const options =
        Array.from(
          block.querySelectorAll(
            ".question-option"
          )
        ).map(
          input => input.value
        );

      const answerIndex =
        parseInt(
          block.querySelector(
            ".question-answer"
          ).value
        ) - 1;

      const marks =
        parseInt(
          block.querySelector(
            ".question-marks"
          ).value
        );

      totalMarks += marks;

      questions.push({

        id: `q${i + 1}`,

        text,

        options,

        answerIndex,

        marks
      });
    });

    exam = {

      id: "teacher-exam",

      title,

      durationMinutes: duration,

      totalMarks,

      questions
    };

    teacherStatus.textContent =
      "Exam Created";
  }
);

// ===============================
// DELETE EXAM
// ===============================

deleteExamBtn.addEventListener(
  "click",
  () => {

    exam = null;

    teacherStatus.textContent =
      "Exam Deleted";
  }
);

// ===============================
// RENDER EXAM
// ===============================

function renderExam() {

  if (!exam) {

    submitStatus.textContent =
      "No Exam Available";

    return;
  }

  currentExam = exam;

  examInProgress = true;

  examTitle.textContent =
    exam.title;

  examMeta.textContent =
    `${exam.questions.length} Questions | ${exam.durationMinutes} Minutes`;

  questionsDiv.innerHTML = "";

  exam.questions.forEach((q, i) => {

    const wrapper =
      document.createElement("div");

    wrapper.className = "question";

    wrapper.innerHTML =
      `<h3>${i + 1}. ${q.text}</h3>`;

    const optionsDiv =
      document.createElement("div");

    optionsDiv.className = "options";

    q.options.forEach((opt, idx) => {

      const label =
        document.createElement("label");

      const radio =
        document.createElement("input");

      radio.type = "radio";

      radio.name = q.id;

      radio.value = idx;

      label.appendChild(radio);

      label.appendChild(
        document.createTextNode(opt)
      );

      optionsDiv.appendChild(label);
    });

    wrapper.appendChild(optionsDiv);

    questionsDiv.appendChild(wrapper);
  });

  examSection.style.display = "block";

  startTimer(
    exam.durationMinutes
  );
}

// ===============================
// TIMER
// ===============================

function updateTimerDisplay() {

  const m =
    Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");

  const s =
    (remainingSeconds % 60)
      .toString()
      .padStart(2, "0");

  timerEl.textContent =
    `${m}:${s}`;
}

function startTimer(minutes) {

  remainingSeconds = minutes * 60;

  clearInterval(timerInterval);

  updateTimerDisplay();

  timerInterval = setInterval(() => {

    remainingSeconds--;

    if (remainingSeconds <= 0) {

      remainingSeconds = 0;

      updateTimerDisplay();

      submitExam(true);

      return;
    }

    updateTimerDisplay();

  }, 1000);
}

// ===============================
// SUBMIT EXAM
// ===============================

submitBtn.addEventListener(
  "click",
  () => {

    submitExam(false);
  }
);

function submitExam(auto = false) {

  if (!examInProgress)
    return;

  examInProgress = false;

  clearInterval(timerInterval);

  clearInterval(snapshotInterval);

  let score = 0;

  detailsEl.innerHTML = "";

  currentExam.questions.forEach((q, i) => {

    const selected =
      document.querySelector(
        `input[name="${q.id}"]:checked`
      );

    const selectedIndex =
      selected
        ? parseInt(selected.value)
        : null;

    const correct =
      selectedIndex === q.answerIndex;

    if (correct) {

      score += q.marks;
    }

    const row =
      document.createElement("div");

    row.innerHTML =
      `<strong>Q${i + 1}</strong>
      | Your:
      ${
        selectedIndex !== null
          ? q.options[selectedIndex]
          : "Not Answered"
      }
      | Correct:
      ${q.options[q.answerIndex]}`;

    detailsEl.appendChild(row);
  });

  scoreEl.textContent =
    `${score}/${currentExam.totalMarks}`;

  submittedAtEl.textContent =
    new Date().toLocaleString();

  submitStatus.textContent =
    auto
      ? "Auto Submitted"
      : "Submitted";

  scoreBox.style.display =
    "block";
}

// ===============================
// CAMERA START
// ===============================

startCameraBtn.addEventListener(
  "click",
  async () => {

    try {

      mediaStatus.textContent =
        "Starting Camera...";

      mediaStream =
        await navigator.mediaDevices
          .getUserMedia({

            video: true,
            audio: true
          });

      webcamVideo.srcObject =
        mediaStream;

      await webcamVideo.play();

      mediaStatus.textContent =
        "Camera Active";

      console.log(
        "CAMERA STARTED"
      );

      // EVERY 10 SEC SNAPSHOT

      clearInterval(snapshotInterval);

      snapshotInterval =
        setInterval(async () => {

          if (
            examInProgress &&
            currentRole === "student"
          ) {

            console.log(
              "10 SEC SNAPSHOT"
            );

            await takeSnapshot(
              "auto_10sec"
            );
          }

        }, 10000);

    } catch (err) {

      console.error(err);

      mediaStatus.textContent =
        "Permission Denied";
    }
  }
);

// ===============================
// SNAPSHOT
// ===============================

async function takeSnapshot(
  reason = "snapshot"
) {

  try {

    if (!mediaStream)
      return;

    if (
      webcamVideo.readyState < 2
    ) return;

    const canvas =
      document.createElement("canvas");

    canvas.width =
      webcamVideo.videoWidth || 640;

    canvas.height =
      webcamVideo.videoHeight || 480;

    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      webcamVideo,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob =
      await new Promise(resolve =>
        canvas.toBlob(
          resolve,
          "image/png"
        )
      );

    if (!blob) return;

    const formData =
      new FormData();

    formData.append(
      "snapshot",
      blob,
      `snapshot-${Date.now()}.png`
    );

    formData.append(
      "userId",
      currentUser
        ? currentUser.id
        : "unknown"
    );

    formData.append(
      "reason",
      reason
    );

    const response =
      await fetch(
        "/api/proctor/snapshot",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await response.json();

    console.log(
      "SNAPSHOT SAVED:",
      data
    );

    return data;

  } catch (err) {

    console.error(
      "SNAPSHOT ERROR:",
      err
    );
  }
}

// ===============================
// TAB SWITCH
// ===============================

async function handleTabSwitch() {

  if (
    !examInProgress ||
    currentRole !== "student"
  ) return;

  alert(
    "Tab Switch Detected"
  );

  await takeSnapshot(
    "tab_switch"
  );

  setTimeout(() => {

    submitExam(true);

  }, 1000);
}

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "hidden"
    ) {

      handleTabSwitch();
    }
  }
);

window.addEventListener(
  "blur",
  handleTabSwitch
);

// ===============================
// START
// ===============================

setRole("student");