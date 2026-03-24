import { authLogic } from "../../js/auth/auth.logic.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("loginError");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    errorBox.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const result = await authLogic.login(email, password);

      if (!result.success) {
        errorBox.textContent = result.message;
        return;
      }

      if (result.user.user_type === "admin") {
        window.location.href = "../../pages/admin/dashboard.html";
      } else if (result.user.user_type === "specialist") {
        window.location.href = "../../pages/specialist/dashboard.html";
      } else {
        window.location.href = "../../pages/player/Player.html";
      }
    } catch (error) {
      errorBox.textContent = "Something went wrong during login.";
      console.error(error);
    }
  });
}