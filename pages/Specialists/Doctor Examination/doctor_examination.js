import {
  getAppointmentById,
  updateAppointment
} from "../../../services/appointment_services.js";

import {
  addInjury,
  getInjuriesByPlayer
} from "../../../services/injury_services.js";

import { showToast } from "../../../shared/js/toaster.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

const accessMessage = document.getElementById("accessMessage");

const playerName = document.getElementById("playerName");
const playerEmail = document.getElementById("playerEmail");
const playerPhone = document.getElementById("playerPhone");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const appointmentStatus = document.getElementById("appointmentStatus");

const previousInjuriesContainer = document.getElementById("previousInjuriesContainer");

const injuryForm = document.getElementById("injuryForm");
const injuryTypeInput = document.getElementById("injuryType");
const diagnosisInput = document.getElementById("diagnosis");
const injuryDateInput = document.getElementById("injuryDate");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");

const params = new URLSearchParams(window.location.search);
const appointmentId = params.get("appointmentId");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let currentAppointment = null;
let currentPlayer = null;
let previousInjuries = [];
let isSubmitting = false;

function showAccessMessage(message) {
  if (accessMessage) {
    accessMessage.textContent = message;
  }
}

function clearAccessMessage() {
  if (accessMessage) {
    accessMessage.textContent = "";
  }
}

function hasSpecialistAccess() {
  if (!currentUser) {
    showAccessMessage("يجب تسجيل الدخول أولًا");
    return false;
  }

  const userType = (currentUser.userType || currentUser.user_type || "").toLowerCase();

  if (userType !== "specialist") {
    showAccessMessage("هذه الصفحة مخصصة للأخصائي فقط");
    return false;
  }

  clearAccessMessage();
  return true;
}

async function getUserById(id) {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return {
      id,
      ...data
    };
  } catch (error) {
    console.error("Error loading user:", error);
    return null;
  }
}

function translateStatus(status) {
  switch (status) {
    case "confirmed":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    default:
      return "قيد الانتظار";
  }
}

function formatDate(dateString) {
  if (!dateString) return "غير محدد";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTimeArabic(time) {
  if (!time) return "غير محدد";

  if (typeof time === "string" && time.includes(":")) {
    const parts = time.split(":");
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    if (isNaN(hours)) return time;
    if (isNaN(minutes)) minutes = 0;

    const period = hours >= 12 ? "م" : "ص";
    let formattedHours = hours % 12;
    if (formattedHours === 0) formattedHours = 12;

    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  return time;
}

function renderPlayerAndAppointment() {
  playerName.textContent = currentPlayer?.name || "غير محدد";
  playerEmail.textContent = currentPlayer?.email || "غير محدد";
  playerPhone.textContent = currentPlayer?.phone || "غير محدد";

  appointmentDate.textContent = formatDate(currentAppointment?.date);
  appointmentTime.textContent = formatTimeArabic(currentAppointment?.time);
  appointmentStatus.textContent = translateStatus(currentAppointment?.status);
}

function renderPreviousInjuries() {
  if (!previousInjuries.length) {
    previousInjuriesContainer.innerHTML = `
      <div class="empty-box">
        <i class="fa-regular fa-file-lines"></i>
        <h4>لا توجد إصابات سابقة</h4>
        <p>لم يتم تسجيل أي إصابات سابقة لهذا اللاعب.</p>
      </div>
    `;
    return;
  }

  previousInjuriesContainer.innerHTML = previousInjuries
    .sort((a, b) => new Date(b.injury_date) - new Date(a.injury_date))
    .map(
      (injury) => `
      <div class="previous-injury-card">
        <div class="previous-injury-title">${injury.injury_type || "إصابة"}</div>
        <div class="previous-injury-text"><strong>التشخيص:</strong> ${injury.diagnosis || "غير محدد"}</div>
        <div class="previous-injury-text"><strong>تاريخ الإصابة:</strong> ${formatDate(injury.injury_date)}</div>
      </div>
    `
    )
    .join("");
}

async function loadData() {
  if (!hasSpecialistAccess()) return;

  if (!appointmentId) {
    showAccessMessage("لم يتم تحديد الموعد");
    return;
  }

  currentAppointment = await getAppointmentById(appointmentId);

  if (!currentAppointment) {
    showAccessMessage("تعذر تحميل بيانات الموعد");
    return;
  }

  currentPlayer = await getUserById(String(currentAppointment.player_id));

  if (!currentPlayer) {
    showAccessMessage("تعذر تحميل بيانات اللاعب");
    return;
  }

  previousInjuries = await getInjuriesByPlayer(String(currentAppointment.player_id));

  renderPlayerAndAppointment();
  renderPreviousInjuries();

  injuryDateInput.value =
    currentAppointment.date || new Date().toISOString().split("T")[0];
}

injuryForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (isSubmitting) return;
  if (!currentAppointment) return;

  const payload = {
    player_id: String(currentAppointment.player_id),
    specialist_id: String(currentAppointment.specialist_id),
    injury_type: injuryTypeInput.value.trim(),
    diagnosis: diagnosisInput.value.trim(),
    injury_date: injuryDateInput.value
  };

  if (!payload.injury_type || !payload.diagnosis || !payload.injury_date) {
    showToast("من فضلك أدخل جميع البيانات المطلوبة", "error");
    return;
  }

  isSubmitting = true;
  saveBtn.disabled = true;
  saveBtn.textContent = "جاري الحفظ...";

  try {
    const result = await addInjury(payload);

    if (!result.success) {
      showToast("فشل حفظ الإصابة", "error");
      return;
    }

    await updateAppointment(currentAppointment.id, {
      status: "completed"
    });

    showToast("تم حفظ الإصابة بنجاح", "success");

    setTimeout(() => {
      window.location.href = "../BookedAppointments/doctor_appointments.html";
    }, 1200);
  } catch (error) {
    console.error("Error saving injury:", error);
    showToast("حدث خطأ أثناء حفظ الإصابة", "error");
  } finally {
    isSubmitting = false;
    saveBtn.disabled = false;
    saveBtn.textContent = "حفظ الإصابة";
  }
});

backBtn.addEventListener("click", function () {
  window.location.href = "../BookedAppointments/doctor_appointments.html";
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
});