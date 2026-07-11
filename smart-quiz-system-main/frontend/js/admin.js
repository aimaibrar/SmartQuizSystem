const API_BASE = "http://192.168.100.193:8080";
let currentUser = null;
let allResults = []; // local cache for searching results

// Initial check when page loads
document.addEventListener("DOMContentLoaded", () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "login.html";
        return;
    }

    currentUser = JSON.parse(userStr);
    if (currentUser.role !== "ADMIN") {
        window.location.href = "student.html";
        return;
    }

    // Display profile info
    document.getElementById("user-display").textContent = `${currentUser.name} (${currentUser.regNo})`;
    
    // Load initial data
    loadQuestionPool();
});

// ==========================================
// API CLIENT / HELPERS
// ==========================================
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-User-Role": currentUser ? currentUser.role : "ADMIN"
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
// TAB NAVIGATION
// ==========================================
window.switchTab = function(tabName) {
    clearMessages();
    
    // Deactivate all tab buttons & views
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabBtns.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    // Activate selected tab & view
    document.getElementById(`tab-${tabName}`).classList.add("active");
    
    if (tabName === "pool") {
        document.getElementById("view-pool").classList.add("active");
        loadQuestionPool();
    } else if (tabName === "add") {
        document.getElementById("view-add").classList.add("active");
    } else if (tabName === "ai") {
        document.getElementById("view-ai").classList.add("active");
    } else if (tabName === "results") {
        document.getElementById("view-results").classList.add("active");
        loadStudentResults();
    }
};

// ==========================================
// TAB 1: QUESTION POOL CRUD
// ==========================================
async function loadQuestionPool() {
    try {
        const response = await fetch(`${API_BASE}/api/questions`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to load question pool");
        }

        const questions = await response.json();
        const tbody = document.getElementById("questions-table-body");
        tbody.innerHTML = "";

        document.getElementById("pool-counter").textContent = `Total questions registered: ${questions.length}`;

        if (questions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="center" style="color: var(--text-secondary);">No questions in the database. Use manual entry or AI generator to add some.</td></tr>`;
            return;
        }

        // Render questions
        questions.forEach(q => {
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${escapeHtml(q.questionText)}</td>
                    <td>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            A: ${escapeHtml(q.optionA)}<br/>
                            B: ${escapeHtml(q.optionB)}<br/>
                            C: ${escapeHtml(q.optionC)}<br/>
                            D: ${escapeHtml(q.optionD)}
                        </div>
                    </td>
                    <td class="center"><span class="badge badge-success">${escapeHtml(q.correctAnswer)}</span></td>
                    <td class="center"><span class="badge badge-warning">${escapeHtml(q.difficultyLevel)}</span></td>
                    <td class="center">
                        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="deleteQuestion(${q.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        showMessage("error", "Error loading pool: " + error.message);
    }
}

window.deleteQuestion = async function(id) {
    if (!confirm("Are you sure you want to permanently delete this question?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/questions/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to delete question");
        }

        showMessage("success", "Question successfully deleted!");
        loadQuestionPool();

    } catch (error) {
        showMessage("error", "Error deleting question: " + error.message);
    }
};

// ==========================================
// TAB 2: MANUAL QUESTION SUBMISSION
// ==========================================
window.handleManualSubmit = async function(event) {
    event.preventDefault();
    clearMessages();

    const text = document.getElementById("manual-text").value.trim();
    const optA = document.getElementById("manual-optA").value.trim();
    const optB = document.getElementById("manual-optB").value.trim();
    const optC = document.getElementById("manual-optC").value.trim();
    const optD = document.getElementById("manual-optD").value.trim();
    const correct = document.getElementById("manual-correct").value;
    const diff = document.getElementById("manual-difficulty").value;

    const payload = {
        questionText: text,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correct,
        difficultyLevel: diff
    };

    try {
        const response = await fetch(`${API_BASE}/api/questions`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to create question");
        }

        showMessage("success", "Question added to database successfully!");
        document.getElementById("question-form").reset();
        
        // redirect to pool tab
        setTimeout(() => {
            switchTab("pool");
        }, 800);

    } catch (error) {
        showMessage("error", "Error creating question: " + error.message);
    }
};

// ==========================================
// TAB 3: GROQ AI GENERATION
// ==========================================
window.triggerAiGeneration = async function() {
    clearMessages();
    const topic = document.getElementById("ai-topic").value.trim();
    const count = parseInt(document.getElementById("ai-count").value);

    if (!topic) {
        showMessage("error", "Please specify a quiz topic");
        return;
    }

    if (isNaN(count) || count < 1 || count > 20) {
        showMessage("error", "Please request between 1 and 20 questions");
        return;
    }

    const aiForm = document.getElementById("ai-form");
    const aiLoading = document.getElementById("ai-loading");

    // Show loading spinner, hide form
    aiForm.classList.add("hidden");
    aiLoading.classList.remove("hidden");

    try {
        const response = await fetch(`${API_BASE}/quiz/generate?topic=${encodeURIComponent(topic)}&count=${count}`, {
            method: "POST",
            headers: getHeaders()
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Groq AI failed to generate questions");
        }

        showMessage("success", `Groq AI successfully generated and saved ${count} questions!`);
        document.getElementById("ai-topic").value = "";
        
        // Redirect to pool tab
        setTimeout(() => {
            switchTab("pool");
        }, 1200);

    } catch (error) {
        showMessage("error", "AI Builder Error: " + error.message);
    } finally {
        // Restore elements
        aiForm.classList.remove("hidden");
        aiLoading.classList.add("hidden");
    }
};

// ==========================================
// TAB 4: STUDENT RESULTS MONITOR
// ==========================================
async function loadStudentResults() {
    try {
        const response = await fetch(`${API_BASE}/api/result`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to load global student results");
        }

        allResults = await response.json();
        
        // Sort results by date descending
        allResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        renderResultsTable(allResults);

    } catch (error) {
        showMessage("error", "Error loading student results: " + error.message);
    }
}

function renderResultsTable(results) {
    const tbody = document.getElementById("results-table-body");
    tbody.innerHTML = "";

    if (results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="center" style="color: var(--text-secondary);">No attempts logged in the system.</td></tr>`;
        return;
    }

    results.forEach(res => {
        const date = new Date(res.submittedAt).toLocaleString();
        const badgeClass = res.autoSubmitted ? "badge-danger" : "badge-success";
        const badgeText = res.autoSubmitted ? "Auto-Submitted" : "Manual";
        
        // Handle User mappings safely (in case mapping is loose or empty)
        const name = res.user ? res.user.name : "Anonymous";
        const regNo = res.user ? res.user.regNo : "N/A";

        tbody.innerHTML += `
            <tr>
                <td>${date}</td>
                <td><strong>${escapeHtml(name)}</strong></td>
                <td>${escapeHtml(regNo)}</td>
                <td>${res.score} / ${res.totalQuestions}</td>
                <td>${res.percentage.toFixed(1)}%</td>
                <td><span class="badge badge-warning">${res.grade}</span></td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            </tr>
        `;
    });
}

window.filterResultsTable = function() {
    const query = document.getElementById("search-student").value.trim().toLowerCase();
    if (!query) {
        renderResultsTable(allResults);
        return;
    }

    const filtered = allResults.filter(res => {
        const regNo = res.user && res.user.regNo ? res.user.regNo.toLowerCase() : "";
        const name = res.user && res.user.name ? res.user.name.toLowerCase() : "";
        return regNo.includes(query) || name.includes(query);
    });

    renderResultsTable(filtered);
};

// ==========================================
// SESSION MANAGEMENT & LOGOUT
// ==========================================
window.logout = function() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
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
