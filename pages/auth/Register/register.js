import { addUser, deleteUser } from "../../../services/user_services.js";
import { addPlayer } from "../../../services/player_services.js";

const form = document.getElementById("playerRegisterForm");
const fileInput = document.getElementById("profileImageInput");
const previewImg = document.getElementById("imagePreview");
const placeholderDiv = document.getElementById("uploadPlaceholder");
const uploadTrigger = document.getElementById("uploadTrigger");
const feedback = document.getElementById("formFeedback");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

let selectedFile = null;

const fields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  password: document.getElementById("password"),
  confirmPassword: document.getElementById("confirmPassword"),
  age: document.getElementById("age"),
  height: document.getElementById("height"),
  weight: document.getElementById("weight")
};

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
  Object.values(fields).forEach((field) => field.classList.remove("input-error"));
}

function setError(id, msg, inputId = null) {
  const errorEl = document.getElementById(id);
  if (errorEl) errorEl.textContent = msg;

  if (inputId && fields[inputId]) {
    fields[inputId].classList.add("input-error");
  }
}

function showFeedback(msg, type = "success") {
  feedback.textContent = msg;
  feedback.className = `alert-message show ${type === "error" ? "alert-error" : "alert-success"}`;
}

function clearFeedback() {
  feedback.textContent = "";
  feedback.className = "alert-message";
}

function toggleLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.classList.toggle("d-none", isLoading);
  btnLoader.classList.toggle("d-none", !isLoading);
}

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^01[0-2,5]\d{8}$/.test(phone);
}

function getSelectedSports() {
  return Array.from(document.querySelectorAll(".sport-chip.active")).map(
    (chip) => chip.dataset.sport
  );
}

function resetImagePreview() {
  selectedFile = null;
  fileInput.value = "";
  previewImg.src = "";
  previewImg.style.display = "none";
  placeholderDiv.style.display = "flex";
  uploadTrigger.classList.remove("dragover");
}

function setImagePreview(file) {
  if (!file || !file.type.startsWith("image/")) {
    showFeedback("اختر صورة صحيحة بصيغة JPG أو PNG", "error");
    return;
  }

  selectedFile = file;
  previewImg.src = URL.createObjectURL(file);
  previewImg.style.display = "block";
  placeholderDiv.style.display = "none";
}

uploadTrigger?.addEventListener("click", () => fileInput.click());

fileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) setImagePreview(file);
});

uploadTrigger?.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadTrigger.classList.add("dragover");
});

uploadTrigger?.addEventListener("dragleave", () => {
  uploadTrigger.classList.remove("dragover");
});

uploadTrigger?.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadTrigger.classList.remove("dragover");

  const file = e.dataTransfer.files?.[0];
  if (file) setImagePreview(file);
});

document.querySelectorAll(".sport-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    if (getSelectedSports().length > 0) {
      document.getElementById("sportError").textContent = "";
    }
  });
});

document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const icon = btn.querySelector("i");

    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.className = isPassword ? "far fa-eye-slash" : "far fa-eye";
  });
});

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");

    const errorMap = {
      fullName: "fullNameError",
      email: "emailError",
      phone: "phoneError",
      password: "passwordError",
      confirmPassword: "confirmPasswordError",
      age: "ageError",
      height: "heightError",
      weight: "weightError"
    };

    const errorId = errorMap[key];
    if (errorId) document.getElementById(errorId).textContent = "";

    clearFeedback();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  clearFeedback();

  const fullName = fields.fullName.value.trim();
  const email = fields.email.value.trim();
  const phone = fields.phone.value.trim();
  const password = fields.password.value;
  const confirmPass = fields.confirmPassword.value;
  const age = fields.age.value.trim();
  const height = fields.height.value.trim();
  const weight = fields.weight.value.trim();
  const sports = getSelectedSports();

  let hasError = false;

  if (fullName.length < 5 || fullName.split(" ").length < 2) {
    setError("fullNameError", "أدخل اسمًا صحيحًا", "fullName");
    hasError = true;
  }

  if (!isValidEmail(email)) {
    setError("emailError", "البريد الإلكتروني غير صالح", "email");
    hasError = true;
  }

  if (!isValidPhone(phone)) {
    setError("phoneError", "أدخل رقم هاتف مصري صحيحًا", "phone");
    hasError = true;
  }

  if (password.length < 6) {
    setError("passwordError", "كلمة المرور يجب أن تكون 6 أحرف على الأقل", "password");
    hasError = true;
  }

  if (password !== confirmPass) {
    setError("confirmPasswordError", "كلمتا المرور غير متطابقتين", "confirmPassword");
    hasError = true;
  }

  if (sports.length === 0) {
    setError("sportError", "اختر رياضة واحدة على الأقل");
    hasError = true;
  }

  const ageNum = age ? Number(age) : null;
  const heightNum = height ? Number(height) : null;
  const weightNum = weight ? Number(weight) : null;

  if (age && (Number.isNaN(ageNum) || ageNum <= 0)) {
    setError("ageError", "العمر يجب أن يكون رقمًا موجبًا", "age");
    hasError = true;
  }

  if (height && (Number.isNaN(heightNum) || heightNum <= 0)) {
    setError("heightError", "الطول يجب أن يكون رقمًا موجبًا", "height");
    hasError = true;
  }

  if (weight && (Number.isNaN(weightNum) || weightNum <= 0)) {
    setError("weightError", "الوزن يجب أن يكون رقمًا موجبًا", "weight");
    hasError = true;
  }

  if (hasError) return;

  toggleLoading(true);

  let profileUrl = "";
  if (selectedFile) {
    try {
      profileUrl = await convertToBase64(selectedFile);
    } catch {
      toggleLoading(false);
      showFeedback("فشل رفع الصورة", "error");
      return;
    }
  }

  const userObj = {
    name: fullName,
    email,
    password,
    phone,
    imgPath: profileUrl,
    user_type: "player"
  };

  try {
    const userRes = await addUser(userObj);

    if (!userRes.success) {
      toggleLoading(false);

      if (userRes.message?.includes("already exists")) {
        setError("emailError", "هذا البريد الإلكتروني مستخدم بالفعل", "email");
        return;
      }

      showFeedback(userRes.message || "فشل إنشاء الحساب", "error");
      return;
    }

    const newUserId = userRes.data.id;

    const playerObj = {
      id: newUserId,
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      sport: sports.join(", ")
    };

    const playerRes = await addPlayer(playerObj);

    if (!playerRes.success) {
      await deleteUser(newUserId);
      toggleLoading(false);
      showFeedback("فشل إنشاء بيانات اللاعب وتم حذف الحساب", "error");
      return;
    }

    showFeedback("تم إنشاء الحساب بنجاح 🎉");

    form.reset();
    document.querySelectorAll(".sport-chip.active").forEach((chip) => {
      chip.classList.remove("active");
    });
    resetImagePreview();
  } catch (error) {
    console.error(error);
    showFeedback("حدث خطأ أثناء التسجيل", "error");
  } finally {
    toggleLoading(false);
  }
});