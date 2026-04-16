import {
  getAvailabilityBySpecialist,
  updateAvailability,
  deleteAvailability
} from "../../../services/availability_services.js";

import { showToast } from "../../../shared/js/toaster.js";

const appointmentsContainer = document.getElementById("appointmentsContainer");
const accessMessage = document.getElementById("accessMessage");

const editAvailabilityForm = document.getElementById("editAvailabilityForm");
const editAvailabilityId = document.getElementById("editAvailabilityId");
const editDay = document.getElementById("editDay");
const editStartTime = document.getElementById("editStartTime");
const editEndTime = document.getElementById("editEndTime");
const editSessionDuration = document.getElementById("editSessionDuration");
const editIsActive = document.getElementById("editIsActive");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let allAvailability = [];
let editModal = null;

const deleteAvailabilityModalEl = document.getElementById("deleteAvailabilityModal");
const confirmDeleteAvailabilityBtn = document.getElementById("confirmDeleteAvailabilityBtn");

const deleteAvailabilityModal = new bootstrap.Modal(deleteAvailabilityModalEl);

let selectedAvailabilityIdForDelete = null;

function showAccessMessage(message) {
  accessMessage.textContent = message;
}

function clearAccessMessage() {
  accessMessage.textContent = "";
}

function hasSpecialistAccess() {
  if (!currentUser) {
    showAccessMessage("يجب تسجيل الدخول أولًا");
    return false;
  }

  if (currentUser.userType !== "specialist") {
    showAccessMessage("هذه الصفحة مخصصة للطبيب فقط");
    return false;
  }

  clearAccessMessage();
  return true;
}

function translateDay(day) {
  switch (day) {
    case "Saturday":
      return "السبت";
    case "Sunday":
      return "الأحد";
    case "Monday":
      return "الإثنين";
    case "Tuesday":
      return "الثلاثاء";
    case "Wednesday":
      return "الأربعاء";
    case "Thursday":
      return "الخميس";
    case "Friday":
      return "الجمعة";
    default:
      return day || "غير محدد";
  }
}

function renderAvailability(data) {
  if (!data.length) {
    appointmentsContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-box">
          <i class="fa-regular fa-calendar-xmark"></i>
          <h4>لا توجد أوقات متاحة</h4>
          <p>ابدأ بإضافة وقت متاح جديد</p>
        </div>
      </div>
    `;
    return;
  }

  appointmentsContainer.innerHTML = data
    .map(
      (item) => `
      <div class="col-md-6 col-xl-4">
        <div class="availability-card">
          <div class="availability-top">
            <div>
              <div class="availability-day">${translateDay(item.day)}</div>
              <div class="availability-time">${item.start_time} - ${item.end_time}</div>
            </div>

            <span class="${item.is_active ? "active-badge" : "inactive-badge"}">
              ${item.is_active ? "نشط" : "غير نشط"}
            </span>
          </div>

          <div class="availability-details">
            <div class="availability-detail-item">
              <i class="fa-regular fa-clock"></i>
              <span>مدة الجلسة: ${item.session_duration} دقيقة</span>
            </div>
 
          </div>

          <div class="availability-actions">
            <button  class="icon-action-btn edit-btn" onclick="openEditModal('${item.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="icon-action-btn delete-btn" onclick="deleteAvailabilityItem('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadAvailability() {
  if (!hasSpecialistAccess()) return;

  appointmentsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  `;

  allAvailability = await getAvailabilityBySpecialist(currentUser.id);
  renderAvailability(allAvailability);
}

window.deleteAvailabilityItem = function (id) {
  selectedAvailabilityIdForDelete = id;
  deleteAvailabilityModal.show();
};
confirmDeleteAvailabilityBtn.addEventListener("click", async () => {
  if (!selectedAvailabilityIdForDelete) return;

  const result = await deleteAvailability(selectedAvailabilityIdForDelete);

  if (result.success) {
    deleteAvailabilityModal.hide();
    showToast("تم حذف الوقت المتاح بنجاح", "success");
    selectedAvailabilityIdForDelete = null;
    await loadAvailability();
  } else {
    showToast(result.message || "فشل حذف الوقت المتاح", "error");
  }
});


deleteAvailabilityModalEl.addEventListener("hidden.bs.modal", () => {
  selectedAvailabilityIdForDelete = null;
});
window.openEditModal = function (id) {
  const item = allAvailability.find((availability) => availability.id === id);
  if (!item) return;

  editAvailabilityId.value = item.id;
  editDay.value = item.day || "";
  editStartTime.value = item.start_time || "";
  editEndTime.value = item.end_time || "";
  editSessionDuration.value = item.session_duration || "";
  editIsActive.checked = !!item.is_active;

  editModal.show();
};

editAvailabilityForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = editAvailabilityId.value;

  const updatedData = {
    day: editDay.value,
    start_time: editStartTime.value,
    end_time: editEndTime.value,
    session_duration: Number(editSessionDuration.value),
    is_active: editIsActive.checked
  };

  if (!updatedData.day || !updatedData.start_time || !updatedData.end_time || !updatedData.session_duration) {
    showToast("من فضلك املأ كل البيانات", "error");
    return;
  }

  if (updatedData.start_time >= updatedData.end_time) {
    showToast("وقت البداية يجب أن يكون أقل من وقت النهاية", "error");
    return;
  }

  // check duplicate availability for same specialist except current item
  const hasConflict = allAvailability.some((item) => {
    return (
      String(item.id) !== String(id) &&
      String(item.specialist_id) === String(currentUser.id) &&
      item.day === updatedData.day &&
      item.start_time === updatedData.start_time &&
      item.end_time === updatedData.end_time &&
      item.is_active
    );
  });

  if (hasConflict) {
    showToast("يوجد وقت متاح بنفس اليوم ونفس الميعاد بالفعل", "error");
    return;
  }

  const result = await updateAvailability(id, updatedData);

  if (result.success) {
    editModal.hide();
    showToast("تم تعديل الوقت المتاح بنجاح", "success");
    await loadAvailability();
  } else {
    showToast(result.message || "فشل تعديل الوقت المتاح", "error");
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  const modalElement = document.getElementById("editAvailabilityModal");
  editModal = new bootstrap.Modal(modalElement);

  const toastMessage = sessionStorage.getItem("toastMessage");
  const toastType = sessionStorage.getItem("toastType");

  if (toastMessage) {
    showToast(toastMessage, toastType || "success");
    sessionStorage.removeItem("toastMessage");
    sessionStorage.removeItem("toastType");
  }

  await loadAvailability();
});