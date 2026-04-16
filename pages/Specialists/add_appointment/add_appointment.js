import {
  addAvailability,
  getAvailabilityByDay
} from "../../../services/availability_services.js";

import { showToast } from "../../../shared/js/toaster.js";

const availabilityForm = document.getElementById("availabilityForm");
const accessMessage = document.getElementById("accessMessage");
const submitBtn = availabilityForm.querySelector('button[type="submit"]');

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let isSubmitting = false;

function showAccessMessage(message, type = "error") {
  accessMessage.textContent = message;
  accessMessage.className = `form-message ${type}`;
}

function clearAccessMessage() {
  accessMessage.textContent = "";
  accessMessage.className = "form-message";
}

function hasSpecialistAccess() {
  if (!currentUser) {
    showAccessMessage("يجب تسجيل الدخول أولًا.");
    availabilityForm.style.display = "none";
    return false;
  }

  if (currentUser.userType !== "specialist") {
    showAccessMessage("هذه الصفحة مخصصة للطبيب فقط.");
    availabilityForm.style.display = "none";
    return false;
  }

  clearAccessMessage();
  return true;
}

function validateTimes(startTime, endTime, sessionDuration) {
  if (!startTime || !endTime || !sessionDuration) {
    showToast("من فضلك أدخل جميع البيانات المطلوبة", "error");
    return false;
  }

  if (Number(sessionDuration) <= 0) {
    showToast("مدة الجلسة يجب أن تكون أكبر من صفر", "error");
    return false;
  }

  if (startTime >= endTime) {
    showToast("وقت النهاية يجب أن يكون بعد وقت البداية", "error");
    return false;
  }

  return true;
}

availabilityForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  if (!hasSpecialistAccess()) return;

  const day = document.getElementById("day").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const sessionDuration = document.getElementById("sessionDuration").value;
  const isActive = document.getElementById("isActive").checked;

  if (!validateTimes(startTime, endTime, sessionDuration)) return;

  isSubmitting = true;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الحفظ...";
  }

  try {
    const existingDay = await getAvailabilityByDay(String(currentUser.id), day);

    if (existingDay) {
      showToast("تمت إضافة هذا اليوم بالفعل، يمكنك تعديله بدلًا من إضافته مرة أخرى", "warning");
      return;
    }

    const result = await addAvailability({
      specialist_id: String(currentUser.id),
      day,
      start_time: startTime,
      end_time: endTime,
      session_duration: Number(sessionDuration),
      is_active: isActive
    });

    if (result.success) {
      showToast("تم حفظ الوقت المتاح بنجاح", "success");

      availabilityForm.reset();
      document.getElementById("isActive").checked = true;

      setTimeout(() => {
        window.location.href = "../Doctor_appointments/doctor_appointments.html";
      }, 1200);
    } else {
      showToast(result.message || "حدث خطأ أثناء حفظ الوقت المتاح", "error");
    }
  } catch (error) {
    console.error(error);
    showToast("حدث خطأ أثناء حفظ الوقت المتاح", "error");
  } finally {
    isSubmitting = false;

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "حفظ";
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  hasSpecialistAccess();
});