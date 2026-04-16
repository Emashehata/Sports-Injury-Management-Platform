import {
  getAppointmentsByPlayer,
  getAppointmentsBySpecialist,
  updateAppointment,
  deleteAppointment,
  getAvailableTimeSlots
} from "../../../services/appointment_services.js";

import { getAllSpecialistsWithUsers } from "../../../services/specialist_services.js";
import { showToast } from "../../../shared/js/toaster.js";

const appointmentsContainer = document.getElementById("appointmentsContainer");
const accessMessage = document.getElementById("accessMessage");

const editAppointmentForm = document.getElementById("editAppointmentForm");
const editAppointmentId = document.getElementById("editAppointmentId");
const editDoctorId = document.getElementById("editDoctorId");
const editAppointmentDate = document.getElementById("editAppointmentDate");
const editAppointmentTime = document.getElementById("editAppointmentTime");
const editAppointmentStatus = document.getElementById("editAppointmentStatus");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let allAppointments = [];
let specialistsMap = {};
let editModal = null;

const deleteAppointmentModalEl = document.getElementById("deleteAppointmentModal");
const confirmDeleteAppointmentBtn = document.getElementById("confirmDeleteAppointmentBtn");
const deleteAppointmentModal = new bootstrap.Modal(deleteAppointmentModalEl);

let selectedAppointmentIdForDelete = null;

function showAccessMessage(message) {
  accessMessage.textContent = message;
}

function clearAccessMessage() {
  accessMessage.textContent = "";
}

function hasPlayerAccess() {
  if (!currentUser) {
    showAccessMessage("يجب تسجيل الدخول أولًا");
    return false;
  }

  if ((currentUser.userType || currentUser.user_type) !== "player") {
    showAccessMessage("هذه الصفحة مخصصة للاعب فقط");
    return false;
  }

  clearAccessMessage();
  return true;
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

function formatDateOption(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("ar-EG", {
    weekday: "long",
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

function getDoctorDisplayName(item) {
  return specialistsMap[String(item.specialist_id)] || "الطبيب";
}

async function loadSpecialistsNames() {
  try {
    const result = await getAllSpecialistsWithUsers();
    console.log("Specialists result:", result);

    if (!result.success || !Array.isArray(result.data)) {
      specialistsMap = {};
      return;
    }

    specialistsMap = result.data.reduce((acc, specialist) => {
      const key = String(specialist.specialistId);
      acc[key] = specialist.name || "الطبيب";
      return acc;
    }, {});

    console.log("specialistsMap:", specialistsMap);
  } catch (error) {
    console.error("Error loading specialists names:", error);
    specialistsMap = {};
  }
}

function renderAppointments(data) {
  if (!data.length) {
    appointmentsContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-box">
          <i class="fa-regular fa-calendar-xmark"></i>
          <h4>لا توجد مواعيد</h4>
          <p>لم تقم بحجز أي موعد حتى الآن</p>
        </div>
      </div>
    `;
    return;
  }

  appointmentsContainer.innerHTML = data
    .map(
      (item) => `
      <div class="col-md-6 col-xl-4">
        <div class="appointment-card">
          <div class="appointment-top">
            <div>
              <div class="appointment-doctor">د/ ${getDoctorDisplayName(item)}</div>
              <div class="appointment-time">${formatTimeArabic(item.time)}</div>
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

            <div class="appointment-detail-item">
              <i class="fa-solid fa-user-doctor"></i>
              <span>الطبيب: ${getDoctorDisplayName(item)}</span>
            </div>
          </div>

          <div class="appointment-actions">
            <button class="icon-action-btn edit-btn" onclick="openEditModal('${item.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="icon-action-btn delete-btn" onclick="deleteAppointmentItem('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadAppointments() {
  if (!hasPlayerAccess()) return;

  appointmentsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  `;

  allAppointments = await getAppointmentsByPlayer(String(currentUser.id));
  console.log("Player appointments:", allAppointments);
  renderAppointments(allAppointments);
}

async function loadAvailableDatesForEdit(doctorId, currentDate = "") {
  editAppointmentDate.innerHTML = `<option value="">جارٍ تحميل التواريخ...</option>`;

  if (!doctorId) {
    editAppointmentDate.innerHTML = `<option value="">اختر التاريخ</option>`;
    return [];
  }

  const doctorAppointments = await getAppointmentsBySpecialist(String(doctorId));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let validDates = doctorAppointments
    .filter(item => item.status !== "cancelled" && item.date)
    .map(item => item.date)
    .filter(date => {
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    });

  validDates = [...new Set(validDates)].sort();

  if (!validDates.length) {
    editAppointmentDate.innerHTML = `<option value="">لا توجد تواريخ قادمة متاحة لهذا الطبيب</option>`;
    return [];
  }

  editAppointmentDate.innerHTML = `
    <option value="">اختر التاريخ</option>
    ${validDates
      .map(
        (date) => `
          <option value="${date}" ${date === currentDate ? "selected" : ""}>
            ${formatDateOption(date)}
          </option>
        `
      )
      .join("")}
  `;

  return validDates;
}

async function loadAvailableTimesForEdit(doctorId, date, currentTime = "") {
  editAppointmentTime.innerHTML = `<option value="">جارٍ تحميل الأوقات...</option>`;

  if (!doctorId || !date) {
    editAppointmentTime.innerHTML = `<option value="">اختر الوقت</option>`;
    return;
  }

  const result = await getAvailableTimeSlots(String(doctorId), date);
  let slots = result?.availableSlots || [];

  if (currentTime && !slots.includes(currentTime)) {
    slots = [currentTime, ...slots];
  }

  if (!slots.length) {
    editAppointmentTime.innerHTML = `<option value="">لا توجد أوقات متاحة</option>`;
    return;
  }

  editAppointmentTime.innerHTML = `
    <option value="">اختر الوقت</option>
    ${slots
      .map(
        (slot) =>
          `<option value="${slot}" ${slot === currentTime ? "selected" : ""}>${formatTimeArabic(slot)}</option>`
      )
      .join("")}
  `;
}

window.openEditModal = async function (id) {
  const item = allAppointments.find(
    (appointment) => String(appointment.id) === String(id)
  );

  if (!item) return;

  editAppointmentId.value = item.id;
  editDoctorId.value = item.specialist_id || "";
  editAppointmentStatus.value = translateStatus(item.status || "pending");

  const validDates = await loadAvailableDatesForEdit(item.specialist_id, item.date);

  if (validDates.includes(item.date)) {
    editAppointmentDate.value = item.date;
    await loadAvailableTimesForEdit(item.specialist_id, item.date, item.time);
  } else {
    editAppointmentDate.value = "";
    editAppointmentTime.innerHTML = `<option value="">اختر التاريخ أولاً</option>`;
    showToast("اليوم الحالي لم يعد ضمن التواريخ القادمة المتاحة للطبيب", "warning");
  }

  editModal.show();
};

editAppointmentDate.addEventListener("change", async function () {
  const doctorId = editDoctorId.value;
  const selectedDate = editAppointmentDate.value;

  await loadAvailableTimesForEdit(doctorId, selectedDate);
});

editAppointmentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = editAppointmentId.value;
  const doctorId = editDoctorId.value;

  const updatedData = {
    date: editAppointmentDate.value,
    time: editAppointmentTime.value
  };

  if (!updatedData.date || !updatedData.time) {
    showToast("من فضلك اختَر التاريخ والوقت", "error");
    return;
  }

  const validDateOptions = Array.from(editAppointmentDate.options)
    .map((option) => option.value)
    .filter(Boolean);

  if (!validDateOptions.includes(updatedData.date)) {
    showToast("هذا التاريخ غير متاح لهذا الطبيب", "error");
    return;
  }

  const sameBookedByAnother = allAppointments.some((item) => {
    return (
      String(item.id) !== String(id) &&
      String(item.specialist_id) === String(doctorId) &&
      item.date === updatedData.date &&
      item.time === updatedData.time &&
      item.status !== "cancelled"
    );
  });

  if (sameBookedByAnother) {
    showToast("هذا الوقت محجوز بالفعل", "error");
    return;
  }

  const result = await updateAppointment(id, updatedData);

  if (result.success) {
    editModal.hide();
    showToast("تم تعديل الموعد بنجاح", "success");
    await loadAppointments();
  } else {
    showToast(result.message || "فشل تعديل الموعد", "error");
  }
});

window.deleteAppointmentItem = function (id) {
  selectedAppointmentIdForDelete = id;
  deleteAppointmentModal.show();
};

confirmDeleteAppointmentBtn.addEventListener("click", async () => {
  if (!selectedAppointmentIdForDelete) return;

  const result = await deleteAppointment(selectedAppointmentIdForDelete);

  if (result.success) {
    deleteAppointmentModal.hide();
    showToast("تم حذف الموعد بنجاح", "success");
    selectedAppointmentIdForDelete = null;
    await loadAppointments();
  } else {
    showToast(result.message || "فشل حذف الموعد", "error");
  }
});

deleteAppointmentModalEl.addEventListener("hidden.bs.modal", () => {
  selectedAppointmentIdForDelete = null;
});

window.addEventListener("DOMContentLoaded", async () => {
  const modalElement = document.getElementById("editAppointmentModal");
  editModal = new bootstrap.Modal(modalElement);

  await loadSpecialistsNames();
  await loadAppointments();
});