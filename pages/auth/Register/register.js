import { addUser, deleteUser } from "../../../services/user_services.js";
import { addPlayer } from "../../../services/player_services.js";

const form = document.getElementById("playerRegisterForm");
const fileInput = document.getElementById("profileImageInput");
const previewImg = document.getElementById("imagePreview");
const placeholderDiv = document.getElementById("uploadPlaceholder");
const uploadTrigger = document.getElementById("uploadTrigger");
const feedback = document.getElementById("formFeedback");

let selectedFile = null;

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach(e => e.innerText = "");
}
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerText = msg;
}

console.log("REGISTER JS LOADED ✅");

function showFeedback(msg, isError = false) {
  feedback.innerText = msg;
  feedback.style.color = isError ? "red" : "green";
}

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

if (uploadTrigger && fileInput) {
  uploadTrigger.addEventListener("click", () => {
    fileInput.click();
  });
}

if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      selectedFile = file;

      previewImg.src = URL.createObjectURL(file);
      previewImg.style.display = "block";
      placeholderDiv.style.display = "none";
    } else {
      showFeedback("اختاري صورة صحيحة", true);
    }
  });
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function getSelectedSports() {
  const chips = document.querySelectorAll(".sport-chip.active");
  return Array.from(chips).map(c => c.dataset.sport);
}


document.querySelectorAll(".sport-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPass = document.getElementById("confirmPassword").value;

  const age = document.getElementById("age").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;

  let profileUrl = "";
  
  if (selectedFile) {
    try {
      profileUrl = await convertToBase64(selectedFile);
    } catch (e) {
      return showFeedback("فشل رفع الصورة", true);
    }
  }

  clearErrors();

let hasError = false;

if (fullName.length < 5) {
  setError("fullNameError", "الاسم غير صحيح");
  hasError = true;
}

if (!isValidEmail(email)) {
  setError("emailError", "الإيميل غير صالح");
  hasError = true;
}

if (phone && !/^\d+$/.test(phone)) {
  setError("phoneError", "رقم الهاتف يجب أن يحتوي على أرقام فقط");
  hasError = true;
}

if (password.length < 6) {
  setError("passwordError", "كلمة المرور ضعيفة");
  hasError = true;
}

if (password !== confirmPass) {
  setError("confirmPasswordError", "كلمات المرور غير متطابقة");
  hasError = true;
}

const sports = getSelectedSports();
if (sports.length === 0) {
  setError("sportError", "اختاري رياضة واحدة على الأقل");
  hasError = true;
}

  const ageNum = Number(age);
  const heightNum = Number(height);
  const weightNum = Number(weight);

  if (age && (isNaN(ageNum) || ageNum < 0)) {
    setError("ageError", "العمر يجب أن يكون رقماً موجباً");
    hasError = true;
  }

  if (height && (isNaN(heightNum) || heightNum < 0)) {
    setError("heightError", "الطول يجب أن يكون رقماً موجباً");
    hasError = true;
  }

  if (weight && (isNaN(weightNum) || weightNum < 0)) {
    setError("weightError", "الوزن يجب أن يكون رقماً موجباً");
    hasError = true;
  }

if (hasError) return;

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.innerText = "جاري التسجيل...";

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
      submitBtn.disabled = false;
      submitBtn.innerText = "إنشاء الحساب الرياضي";

      if (userRes.message && userRes.message.includes("already exists")) {
        setError("emailError", "الإيميل موجود بالفعل");
        return;
      }

      return showFeedback(userRes.message, true);
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

      submitBtn.disabled = false;
      submitBtn.innerText = "إنشاء الحساب الرياضي";

      return showFeedback("فشل إنشاء اللاعب وتم حذف الحساب", true);
    }

    showFeedback("تم إنشاء الحساب بنجاح 🎉");

    form.reset();
    fileInput.value = "";
    selectedFile = null;

    previewImg.style.display = "none";
    placeholderDiv.style.display = "block";

  } catch (err) {
    console.error(err);
    showFeedback("حصل خطأ في التسجيل", true);
  }

  submitBtn.disabled = false;
  submitBtn.innerText = "إنشاء الحساب الرياضي";
});