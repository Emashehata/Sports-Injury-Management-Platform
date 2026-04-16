import {
  getAppointmentsBySpecialist,
  updateAppointment
} from "../../../services/appointment_services.js";

import { showToast } from "../../../shared/js/toaster.js";

const appointmentsContainer = document.getElementById("appointmentsContainer");
const accessMessage = document.getElementById("accessMessage");

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let allAppointments = [];
let usersMap = {};

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

async function getAllUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users.json`);
    const data = await res.json();

    if (!data) return {};

    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[String(key)] = {
        id: key,
        ...value
      };
      return acc;
    }, {});
  } catch (error) {
    console.error("Error loading users:", error);
    return {};
  }
}

function getPlayerName(playerId) {
  return usersMap[String(playerId)]?.name || `اللاعب رقم ${playerId}`;
}

function getPlayerEmail(playerId) {
  return usersMap[String(playerId)]?.email || "غير محدد";
}

function getPlayerPhone(playerId) {
  return usersMap[String(playerId)]?.phone || "غير محدد";
}

function getStatusClass(status) {
  switch (status) {
    case "confirmed":
      return "status-confirmed";
    case "completed":
      return "status-completed";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-pending";
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

function isUpcomingAppointment(item) {
  if (!item.date) return false;

  const appointmentDateTime = new Date(`${item.date}T${item.time || "00:00"}:00`);
  const now = new Date();

  return appointmentDateTime >= now && item.status !== "cancelled";
}

function renderAppointments(data) {
  if (!appointmentsContainer) return;

  if (!data.length) {
    appointmentsContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-box">
          <i class="fa-regular fa-calendar-xmark"></i>
          <h4>لا توجد مواعيد</h4>
          <p>لا توجد مواعيد محجوزة لهذا الأخصائي حالياً.</p>
        </div>
      </div>
    `;
    return;
  }

   appointmentsContainer.innerHTML = data
  .map((item) => {
    const playerName = getPlayerName(item.player_id);
    const playerEmail = getPlayerEmail(item.player_id);
    const playerPhone = getPlayerPhone(item.player_id);

    return `
      <div class="col-md-6 col-xl-6">
        <div class="appointment-card">
          <div class="appointment-top">
            <div>
              <div class="appointment-player">${playerName}</div>

              <div class="contact-info">
                <div class="contact-item">
                  <i class="fa-regular fa-envelope"></i>
                  <span>${playerEmail}</span>
                </div>

                <div class="contact-item">
                  <i class="fa-solid fa-phone"></i>
                  <span>${playerPhone}</span>
                </div>
              </div>
            </div>

            <span class="status-badge ${getStatusClass(item.status)}">
              ${translateStatus(item.status)}
            </span>
          </div>

          <div class="appointment-details">
            <div class="appointment-detail-item">
              <i class="fa-regular fa-calendar"></i>
              <span>التاريخ: ${formatDate(item.date)}</span>
            </div>

            <div class="appointment-detail-item">
              <i class="fa-regular fa-clock"></i>
              <span>الوقت: ${formatTimeArabic(item.time)}</span>
            </div>
          </div>

          <div class="appointment-actions">
            <button class="action-btn examine-btn" onclick="startExamination('${item.id}')">
              بدء الكشف
            </button>

            ${
              item.status === "pending"
                ? `
                  <button class="action-btn confirm-btn" onclick="confirmAppointmentItem('${item.id}')">
                    تأكيد
                  </button>
                `
                : ""
            }

            ${
              item.status !== "cancelled" && item.status !== "completed"
                ? `
                  <button class="action-btn cancel-btn" onclick="cancelAppointmentItem('${item.id}')">
                    إلغاء
                  </button>
                `
                : ""
            }
          </div>
        </div>
      </div>
    `;
  })
  .join("");
}

async function loadAppointments() {
  if (!hasSpecialistAccess()) return;

  appointmentsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  `;

  usersMap = await getAllUsers();

  const specialistId = String(currentUser.id);
  const appointments = await getAppointmentsBySpecialist(specialistId);

  allAppointments = appointments
    .filter(item => item.id !== "date" && item.id !== "time")
    .filter(isUpcomingAppointment)
    .sort((a, b) => {
      const first = new Date(`${a.date}T${a.time || "00:00"}:00`);
      const second = new Date(`${b.date}T${b.time || "00:00"}:00`);
      return first - second;
    });

  renderAppointments(allAppointments);
}

window.startExamination = function (appointmentId) {
  window.location.href = `../Doctor Examination/doctor_examination.html?appointmentId=${appointmentId}`;
};

window.confirmAppointmentItem = async function (appointmentId) {
  const result = await updateAppointment(appointmentId, { status: "confirmed" });

  if (result.success) {
    showToast("تم تأكيد الموعد", "success");
    await loadAppointments();
  } else {
    showToast(result.message || "فشل تأكيد الموعد", "error");
  }
};

window.cancelAppointmentItem = async function (appointmentId) {
  const result = await updateAppointment(appointmentId, { status: "cancelled" });

  if (result.success) {
    showToast("تم إلغاء الموعد", "success");
    await loadAppointments();
  } else {
    showToast(result.message || "فشل إلغاء الموعد", "error");
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  await loadAppointments();
});