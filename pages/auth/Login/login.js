import { getAllUsers } from "../../../services/user_services.js";

const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("loginMessage");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const rememberMeInput = document.getElementById("rememberMe");
const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const btnText = loginBtn.querySelector(".btn-text");
const btnLoader = loginBtn.querySelector(".btn-loader");

function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `auth-message show ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "auth-message";
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  btnText.classList.toggle("d-none", isLoading);
  btnLoader.classList.toggle("d-none", !isLoading);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  togglePassword.innerHTML = isPassword
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", clearMessage);
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const rememberMe = rememberMeInput.checked;

  if (!email || !password) {
    showMessage("من فضلك أدخل البريد الإلكتروني وكلمة المرور", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("البريد الإلكتروني غير صالح", "error");
    return;
  }

  setLoading(true);

  try {
    const usersRes = await getAllUsers();

    if (!usersRes.success) {
      showMessage("حدث خطأ أثناء تحميل بيانات المستخدمين", "error");
      setLoading(false);
      return;
    }

    const users = usersRes.data || [];

    const foundUser = users.find(
      (user) =>
        user.email?.trim().toLowerCase() === email.toLowerCase() &&
        String(user.password).trim() === password
    );

    if (!foundUser) {
      showMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة", "error");
      setLoading(false);
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    showMessage("تم تسجيل الدخول بنجاح", "success");

    setTimeout(() => {
      if (foundUser.user_type === "specialist" || foundUser.user_type === "player") {
        window.location.href = "../Home/home.html";
      } else {
        window.location.href = "../../index.html";
      }
    }, 1000);
  } catch (error) {
    console.error(error);
    showMessage("حدث خطأ غير متوقع أثناء تسجيل الدخول", "error");
  } finally {
    setLoading(false);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const rememberedEmail = localStorage.getItem("rememberedEmail");

  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeInput.checked = true;
  }
});