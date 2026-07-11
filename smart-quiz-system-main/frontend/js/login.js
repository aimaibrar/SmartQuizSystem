const API_BASE = "http://192.168.100.193:8080";

async function login() {
    const regNo    = document.getElementById("regNo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!regNo || !password) {
        showMessage("error", "Please fill in all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ regNo, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage("error", data.error || "Login failed");
            return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        showMessage("success", `Welcome, ${data.name}! Redirecting...`);

        setTimeout(() => {
            if (data.role === "ADMIN") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "student.html";
            }
        }, 1000);

    } catch (error) {
        showMessage("error", "Cannot connect to server. Is the backend running?");
    }
}

function showMessage(type, message) {
    const errorEl   = document.getElementById("error-msg");
    const successEl = document.getElementById("success-msg");

    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

    if (type === "error") {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    } else {
        successEl.textContent = message;
        successEl.classList.remove("hidden");
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
});