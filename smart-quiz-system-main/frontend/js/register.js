const API_BASE = "http://192.168.100.193:8080";

async function register() {
    const name     = document.getElementById("name").value.trim();
    const regNo    = document.getElementById("regNo").value.trim();
    const password = document.getElementById("password").value.trim();
    const role     = document.getElementById("role").value;

    if (!name || !regNo || !password) {
        showMessage("error", "Please fill in all fields");
        return;
    }

    if (password.length < 6) {
        showMessage("error", "Password must be at least 6 characters");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, regNo, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage("error", data.error || "Registration failed");
            return;
        }

        showMessage("success", "Account created! Redirecting to login...");

        setTimeout(() => {
            window.location.href = "login.html";
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
    if (e.key === "Enter") register();
});