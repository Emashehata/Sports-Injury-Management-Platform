import { authLogic } from "../../js/auth/auth.logic.js";

const registerForm = document.getElementById("registerForm");

const idInput = document.getElementById("id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");
const imgPathInput = document.getElementById("imgPath");
const userTypeInput = document.getElementById("user_type");

const generalError = document.getElementById("registerError");

const errorElements = {
  id: document.getElementById("idError"),
  name: document.getElementById("nameError"),
  email: document.getElementById("emailError"),
  password: document.getElementById("passwordError"),
  phone: document.getElementById("phoneError"),
  imgPath: document.getElementById("imgPathError"),
  user_type: document.getElementById("userTypeError")
};

function clearErrors() {
  generalError.textContent = "";

  Object.values(errorElements).forEach(el => {
    if (el) el.textContent = "";
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearErrors();

    const userData = {
      id: idInput.value.trim(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
      phone: phoneInput.value.trim(),
      imgPath: imgPathInput.value.trim(),
      user_type: userTypeInput.value.trim()
    };

    try {
      const result = await authLogic.register(userData);

      if (!result.success) {
        generalError.textContent = result.message;

        if (result.errors) {
          Object.keys(result.errors).forEach(key => {
            if (errorElements[key]) {
              errorElements[key].textContent = result.errors[key];
            }
          });
        }

        return;
      }

      alert("Register successful!");
      registerForm.reset();
      window.location.href = "../../pages/auth/login.html";
    } catch (error) {
      generalError.textContent = "Something went wrong during register.";
      console.error(error);
    }
  });
}