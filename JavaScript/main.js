// ============================================================
//  FoodieExpress – main.js
//  Auth system using localStorage as user database
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = "red";
  el.style.display = "block";
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = "green";
  el.style.display = "block";
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// Returns the users array stored in localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("foodie_users") || "[]");
}

// Saves the users array back to localStorage
function saveUsers(users) {
  localStorage.setItem("foodie_users", JSON.stringify(users));
}

// Basic email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Basic phone check (10 digits, optional +91 prefix)
function isValidPhone(phone) {
  return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.trim());
}

// ── Tab switching ─────────────────────────────────────────────

function switchTab(tab) {
  const loginForm  = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginTab   = document.getElementById("login-tab");
  const signupTab  = document.getElementById("signup-tab");
  const tabHeader  = document.getElementById("tabHeader");

  // Hide forgot-password steps whenever tabs switch
  ["forgot-step1","forgot-step2","forgot-step3","forgot-step4"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  tabHeader.style.display = "flex";

  hideError("loginError");
  hideError("signupError");

  if (tab === "login") {
    loginForm.style.display  = "block";
    signupForm.style.display = "none";
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  } else {
    loginForm.style.display  = "none";
    signupForm.style.display = "block";
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  }
}

// ── LOGIN ─────────────────────────────────────────────────────

function handleLogin() {
  hideError("loginError");

  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // 1. Empty checks
  if (!email || !password) {
    showError("loginError", "⚠️ Please fill in both email and password.");
    return;
  }

  // 2. Email format
  if (!isValidEmail(email)) {
    showError("loginError", "⚠️ Please enter a valid email address.");
    return;
  }

  // 3. Check if user exists in localStorage
  const users = getUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    showError("loginError", "❌ No account found with this email. Please sign up first.");
    return;
  }

  // 4. Check password
  if (user.password !== password) {
    showError("loginError", "❌ Incorrect password. Please try again.");
    return;
  }

  // 5. Remember me – save session
  const remember = document.getElementById("remember").checked;
  if (remember) {
    localStorage.setItem("foodie_loggedIn", JSON.stringify({ email: user.email, name: user.name }));
  } else {
    sessionStorage.setItem("foodie_loggedIn", JSON.stringify({ email: user.email, name: user.name }));
  }

  // 6. Redirect to home
  alert(`✅ Welcome back, ${user.name}!`);
  window.location.href = "home.html";
}

// ── SIGNUP ────────────────────────────────────────────────────

function handleSignup() {
  hideError("signupError");

  const name     = document.getElementById("signupName").value.trim();
  const email    = document.getElementById("signupEmail").value.trim();
  const phone    = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value;

  // 1. Empty checks
  if (!name || !email || !phone || !password) {
    showError("signupError", "⚠️ Please fill in all fields.");
    return;
  }

  // 2. Name length
  if (name.length < 3) {
    showError("signupError", "⚠️ Name must be at least 3 characters.");
    return;
  }

  // 3. Email format
  if (!isValidEmail(email)) {
    showError("signupError", "⚠️ Please enter a valid email address.");
    return;
  }

  // 4. Phone validation
  if (!isValidPhone(phone)) {
    showError("signupError", "⚠️ Enter a valid 10-digit Indian mobile number.");
    return;
  }

  // 5. Password strength (min 6 chars)
  if (password.length < 6) {
    showError("signupError", "⚠️ Password must be at least 6 characters.");
    return;
  }

  // 6. Check if email already registered
  const users = getUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showError("signupError", "❌ An account with this email already exists. Please login.");
    return;
  }

  // 7. Save new user
  users.push({ name, email, phone, password });
  saveUsers(users);

  showSuccess("signupError", "✅ Account created! Redirecting to login...");

  setTimeout(() => {
    switchTab("login");
    document.getElementById("loginEmail").value = email;
  }, 1500);
}

// ── FORGOT PASSWORD ───────────────────────────────────────────

let _otpGenerated  = null;
let _forgotEmail   = null;

function showForgot() {
  document.getElementById("login-form").style.display  = "none";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("tabHeader").style.display   = "none";
  hideError("forgotError");
  showStep(1);
}

function showStep(n) {
  [1,2,3,4].forEach(i => {
    document.getElementById(`forgot-step${i}`).style.display = "none";
  });
  document.getElementById(`forgot-step${n}`).style.display = "block";
}

function backToLogin() {
  [1,2,3,4].forEach(i => {
    document.getElementById(`forgot-step${i}`).style.display = "none";
  });
  document.getElementById("tabHeader").style.display = "flex";
  switchTab("login");
}

function sendOtp(isResend = false) {
  hideError("forgotError");

  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) {
    showError("forgotError", "⚠️ Please enter your email address.");
    return;
  }

  if (!isValidEmail(email)) {
    showError("forgotError", "⚠️ Please enter a valid email address.");
    return;
  }

  // Check if email is registered
  const users = getUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    showError("forgotError", "❌ No account found with this email.");
    return;
  }

  // Generate 4-digit OTP (simulated – shown in alert since there's no backend)
  _otpGenerated = String(Math.floor(1000 + Math.random() * 9000));
  _forgotEmail  = email;

  document.getElementById("sentToEmail").textContent = email;

  // In a real app this would be sent via email; here we simulate it
  alert(`🔐 Your OTP is: ${_otpGenerated}\n(In production this would be emailed to you)`);

  if (!isResend) showStep(2);
  else {
    // Clear previous OTP inputs
    document.querySelectorAll(".otp-digit").forEach(i => i.value = "");
    hideError("otpError");
  }
}

function otpMove(input, index) {
  // Auto-focus next box
  const digits = document.querySelectorAll(".otp-digit");
  if (input.value && index < digits.length - 1) {
    digits[index + 1].focus();
  }
}

function verifyOtp() {
  hideError("otpError");

  const digits  = document.querySelectorAll(".otp-digit");
  const entered = Array.from(digits).map(d => d.value).join("");

  if (entered.length < 4) {
    showError("otpError", "⚠️ Please enter the complete 4-digit OTP.");
    return;
  }

  if (entered !== _otpGenerated) {
    showError("otpError", "❌ Incorrect OTP. Please try again.");
    return;
  }

  showStep(3);
}

function resetPassword() {
  hideError("resetError");

  const newPwd     = document.getElementById("newPassword").value;
  const confirmPwd = document.getElementById("confirmPassword").value;

  if (!newPwd || !confirmPwd) {
    showError("resetError", "⚠️ Please fill in both password fields.");
    return;
  }

  if (newPwd.length < 6) {
    showError("resetError", "⚠️ Password must be at least 6 characters.");
    return;
  }

  if (newPwd !== confirmPwd) {
    showError("resetError", "❌ Passwords do not match.");
    return;
  }

  // Update password in localStorage
  const users = getUsers();
  const idx   = users.findIndex(u => u.email.toLowerCase() === _forgotEmail.toLowerCase());
  if (idx !== -1) {
    users[idx].password = newPwd;
    saveUsers(users);
  }

  _otpGenerated = null;
  _forgotEmail  = null;

  showStep(4);
}

// ── Cart count (if needed on this page) ──────────────────────

function updateCartCount() {
  const cart      = JSON.parse(localStorage.getItem("foodie_cart") || "[]");
  const countEl   = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  if (countEl) {
    if (totalItems > 0) {
      countEl.textContent = totalItems;
      countEl.style.display = "inline-block";
    } else {
      countEl.style.display = "none";
    }
  }
}

// Run on page load
updateCartCount();