const API_BASE = "http://192.168.100.193:8080";
let currentUser = null;

// Quiz State
let activeSession = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // Maps questionId -> selectedAnswerText
let timerInterval = null;

// Initial check when page loads
document.addEventListener("DOMContentLoaded", () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "login.html";
        return;
    }

    currentUser = JSON.parse(userStr);
    if (currentUser.role === "ADMIN") {
        window.location.href = "admin.html";
        return;
    }

    document.getElementById("user-display").textContent = `${currentUser.name} (${currentUser.regNo})`;
    loadPastAttempts();
});

// ==========================================
// API CLIENT / HELPERS
// ==========================================
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-User-Role": currentUser ? currentUser.role : "STUDENT"
    };
}

function showMessage(type, msg) {
    const errorEl = document.getElementById("error-msg");
    const successEl = document.getElementById("success-msg");

    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

    if (type === "error") {
        errorEl.textContent = msg;
        errorEl.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === "success") {
        successEl.textContent = msg;
        successEl.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function clearMessages() {
    document.getElementById("error-msg").classList.add("hidden");
    document.getElementById("success-msg").classList.add("hidden");
}

// ==========================================
// VIEW 1: LOBBY & PAST ATTEMPTS
// ==========================================
async function loadPastAttempts() {
    try {
        const response = await fetch(`${API_BASE}/api/result/user/${currentUser.id}`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to load results");
        }

        const results = await response.json();
        const tbody = document.getElementById("attempts-table-body");
        tbody.innerHTML = "";

        if (results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="center" style="color: var(--text-secondary);">No attempts logged yet.</td></tr>`;
            return;
        }

        results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        results.forEach(result => {
            const date = new Date(result.submittedAt).toLocaleString();
            const badgeClass = result.autoSubmitted ? "badge-danger" : "badge-success";
            const badgeText = result.autoSubmitted ? "Auto-Submitted" : "Manual";

            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${result.totalQuestions}</td>
                    <td>${result.score} / ${result.totalQuestions}</td>
                    <td>${result.percentage.toFixed(1)}%</td>
                    <td><span class="badge badge-warning">${result.grade}</span></td>
                    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                </tr>
            `;
        });

    } catch (error) {
        showMessage("error", "Error loading history: " + error.message);
    }
}

// ==========================================
// VIEW 2: QUIZ RUNTIME & TIMER
// ==========================================
async function startNewQuiz() {
    clearMessages();
    const count = parseInt(document.getElementById("question-count").value);

    if (isNaN(count) || count < 1 || count > 25) {
        showMessage("error", "Please select a number of questions between 1 and 25");
        return;
    }

    const userId = currentUser && (currentUser.id || currentUser.userId);
    if (!userId) {
        showMessage("error", "Session error: user ID not found. Please log in again.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/quiz/start?userId=${userId}&numberOfQuestions=${count}`, {
            method: "POST",
            headers: getHeaders()
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to start quiz session");
        }

        activeSession = await response.json();
        quizQuestions = activeSession.questions;
        userAnswers = {};
        currentQuestionIndex = 0;

        if (quizQuestions.length === 0) {
            throw new Error("No questions available in the question pool. Please contact an Administrator.");
        }

        document.getElementById("lobby-view").classList.add("hidden");
        document.getElementById("quiz-view").classList.remove("hidden");

        renderActiveQuestion();
        startQuizTimer(new Date(activeSession.expiryTime));

    } catch (error) {
        showMessage("error", "Could not start quiz: " + error.message);
    }
}

function startQuizTimer(expiryTime) {
    if (timerInterval) clearInterval(timerInterval);

    const timerDisplay = document.getElementById("timer-display");
    const timerBox = document.querySelector(".timer-box");

    function updateTimer() {
        const now = new Date().getTime();
        const distance = expiryTime.getTime() - now;

        if (distance <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00";
            showMessage("error", "Time expired! Submitting your answers automatically...");
            submitQuiz(true);
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const mStr = minutes < 10 ? "0" + minutes : minutes;
        const sStr = seconds < 10 ? "0" + seconds : seconds;

        timerDisplay.textContent = `${mStr}:${sStr}`;

        if (distance < 60000) {
            timerBox.style.background = "rgba(244, 63, 94, 0.3)";
            timerBox.style.borderColor = "var(--accent-rose)";
        } else {
            timerBox.style.background = "rgba(244, 63, 94, 0.15)";
            timerBox.style.borderColor = "var(--accent-rose)";
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function renderActiveQuestion() {
    const q = quizQuestions[currentQuestionIndex];

    document.getElementById("question-counter").textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    const pct = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById("quiz-progress-bar").style.width = `${pct}%`;

    document.getElementById("active-question-text").innerHTML = `
        <span style="color: var(--primary); font-weight: 800; margin-right: 8px;">Q${currentQuestionIndex + 1}.</span>
        ${escapeHtml(q.questionText)}
        <span style="font-size: 0.75rem; vertical-align: middle; margin-left: 8px;" class="badge badge-warning">${q.difficultyLevel}</span>
    `;

    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    const optionsList = q.shuffledOptions && q.shuffledOptions.length > 0
        ? q.shuffledOptions
        : [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);

    optionsList.forEach((optionText, idx) => {
        const optionLetter = String.fromCharCode(65 + idx);
        const isSelected = userAnswers[q.id] === optionText;
        const selectedClass = isSelected ? "selected" : "";
        const checkedAttr = isSelected ? "checked" : "";

        optionsContainer.innerHTML += `
            <div class="option-card ${selectedClass}" onclick="selectOption(${q.id}, '${escapeQuote(optionText)}')">
                <input type="radio" class="option-radio" name="options-group" id="opt-${optionLetter}" value="${escapeHtml(optionText)}" ${checkedAttr} />
                <span style="color: var(--primary); font-weight: 700; margin-right: 8px;">${optionLetter}.</span>
                <span class="option-text">${escapeHtml(optionText)}</span>
            </div>
        `;
    });

    document.getElementById("btn-prev").disabled = currentQuestionIndex === 0;

    const nextBtn = document.getElementById("btn-next");
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextBtn.textContent = "Finish";
        nextBtn.classList.add("hidden");
        document.getElementById("btn-submit").classList.remove("hidden");
    } else {
        nextBtn.textContent = "Next";
        nextBtn.classList.remove("hidden");
        document.getElementById("btn-submit").classList.add("hidden");
    }

    renderGridMap();
}

function renderGridMap() {
    const gridContainer = document.getElementById("question-grid-container");
    gridContainer.innerHTML = "";

    quizQuestions.forEach((q, idx) => {
        const isAnswered = userAnswers[q.id] !== undefined;
        const isActive = idx === currentQuestionIndex;
        let classes = "grid-num";

        if (isActive) classes += " active";
        else if (isAnswered) classes += " answered";

        gridContainer.innerHTML += `
            <div class="${classes}" onclick="jumpToQuestion(${idx})">${idx + 1}</div>
        `;
    });
}

window.selectOption = function(questionId, optionText) {
    userAnswers[questionId] = optionText;
    renderActiveQuestion();
};

window.jumpToQuestion = function(idx) {
    if (idx >= 0 && idx < quizQuestions.length) {
        currentQuestionIndex = idx;
        renderActiveQuestion();
    }
};

window.nextQuestion = function() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderActiveQuestion();
    }
};

window.prevQuestion = function() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderActiveQuestion();
    }
};

// ==========================================
// SUBMISSION & RESULTS
// ==========================================
window.confirmSubmit = function() {
    const totalQuestions = quizQuestions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = totalQuestions - answeredCount;

    let confirmMsg = "Are you sure you want to submit your quiz?";
    if (unansweredCount > 0) {
        confirmMsg = `You have ${unansweredCount} unanswered questions remaining. Submit anyway?`;
    }

    if (confirm(confirmMsg)) {
        submitQuiz(false);
    }
};

async function submitQuiz(autoSubmitted = false) {
    if (timerInterval) clearInterval(timerInterval);

    const answersList = quizQuestions.map(q => {
        return {
            questionId: q.id,
            selectedAnswer: userAnswers[q.id] || ""
        };
    });

    try {
        const response = await fetch(`${API_BASE}/quiz/submit/${activeSession.id}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(answersList)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to submit quiz session");
        }

        const result = await response.json();

        document.getElementById("quiz-view").classList.add("hidden");
        document.getElementById("result-view").classList.remove("hidden");

        document.getElementById("result-score").textContent = `${result.score} / ${result.total}`;
        document.getElementById("result-percentage").textContent = `${result.percentage.toFixed(1)}%`;
        document.getElementById("result-grade").textContent = result.grade;

        const autoRow = document.getElementById("result-auto-submit-row");
        if (autoSubmitted) {
            autoRow.classList.remove("hidden");
        } else {
            autoRow.classList.add("hidden");
        }

        activeSession = null;
        quizQuestions = [];

    } catch (error) {
        showMessage("error", "Error submitting quiz: " + error.message);
    }
}

window.resetToLobby = function() {
    document.getElementById("result-view").classList.add("hidden");
    document.getElementById("lobby-view").classList.remove("hidden");
    loadPastAttempts();
    clearMessages();
};

// ==========================================
// SESSION MANAGEMENT / ROUTING
// ==========================================
window.logout = function() {
    if (timerInterval) clearInterval(timerInterval);
    localStorage.removeItem("user");
    window.location.href = "login.html";
};

window.goHome = function() {
    if (activeSession) {
        if (confirm("You have an active quiz session. Leaving this page will submit it as empty. Exit anyway?")) {
            submitQuiz(true);
        }
    } else {
        resetToLobby();
    }
};

// ==========================================
// UTILITIES
// ==========================================
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeQuote(text) {
    if (!text) return "";
    return text.replace(/'/g, "\\'");
}