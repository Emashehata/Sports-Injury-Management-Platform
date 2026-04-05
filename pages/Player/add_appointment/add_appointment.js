import { getDoctorById } from "../../../services/specialist_services.js";
import {
  getAvailableTimeSlots,
  addAppointment
} from "../../../services/appointment_services.js";
import { showToast } from "../../../shared/js/toaster.js";

const doctorImage = document.getElementById("doctorImage");
const doctorName = document.getElementById("doctorName");
const doctorSpecialization = document.getElementById("doctorSpecialization");
const doctorQualification = document.getElementById("doctorQualification");
const doctorClinic = document.getElementById("doctorClinic");

const daysContainer = document.getElementById("daysContainer");
const timesContainer = document.getElementById("timesContainer");
const bookBtn = document.getElementById("bookBtn");

const params = new URLSearchParams(window.location.search);
const doctorId = params.get("doctorId");

let selectedTime = null;
let selectedDate = null;
let currentDoctor = null;

init();

async function init() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    showToast("يجب تسجيل الدخول أولاً", "error");
    setTimeout(() => {
      window.location.href = "../../auth/Login/login.html";
    }, 1200);
    return;
  }

  if (currentUser.user_type !== "player") {
    showToast("هذه الصفحة مخصصة للاعب فقط", "error");
    setTimeout(() => {
      window.location.href = "../../../index.html";
    }, 1200);
    return;
  }

  if (!doctorId) {
    showToast("لم يتم تحديد الطبيب", "error");
    return;
  }

  currentDoctor = await getDoctorById(doctorId);

  if (!currentDoctor) {
    showToast("تعذر تحميل بيانات الطبيب", "error");
    return;
  }

  renderDoctorData(currentDoctor);
  renderDays();

  bookBtn.addEventListener("click", handleBooking);
}

function renderDoctorData(doctor) {
  doctorImage.src =
    doctor.imgPath && doctor.imgPath.trim() !== ""
      ? doctor.imgPath
      : "../../../assets/images/Doctor.png";

  doctorName.textContent = doctor.name || "اسم الطبيب";
  doctorSpecialization.textContent = doctor.specialization || "غير محدد";
  doctorQualification.textContent = doctor.qualification || "غير محدد";
  doctorClinic.textContent = doctor.clinic_address || "غير محدد";
}

function renderDays() {
  daysContainer.innerHTML = "";

  const days = generateNext7Days();

  days.forEach((dateObj, index) => {
    const { dayName, textDate } = formatArabicDate(dateObj);
    const dateValue = formatDateForDB(dateObj);

    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.type = "button";
    btn.innerHTML = `
      <span class="day-name">${dayName}</span>
      <span class="day-date">${textDate}</span>
    `;

    btn.addEventListener("click", async () => {
      document.querySelectorAll(".day-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      selectedDate = dateValue;
      selectedTime = null;
      bookBtn.disabled = true;

      await loadAvailableTimes();
    });

    daysContainer.appendChild(btn);

    if (index === 0) {
      btn.click();
    }
  });
}

async function loadAvailableTimes() {
  if (!selectedDate) return;

  timesContainer.innerHTML = `<p class="loading-text">جاري تحميل المواعيد...</p>`;

  try {
    const result = await getAvailableTimeSlots(String(doctorId), selectedDate);
    
    console.log("Available times result:", result);

    if (!result.success || !result.availableSlots || result.availableSlots.length === 0) {
      timesContainer.innerHTML = `
        <p class="empty-times">لا توجد مواعيد متاحة في هذا اليوم</p>
      `;
      return;
    }

    timesContainer.innerHTML = "";

    result.availableSlots.forEach((time) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time-btn";
      btn.textContent = formatTimeArabic(time);
      btn.dataset.time = time;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".time-btn").forEach((item) => {
          item.classList.remove("active");
        });

        btn.classList.add("active");
        selectedTime = time;
        bookBtn.disabled = false;
      });

      timesContainer.appendChild(btn);
    });
  } catch (error) {
    console.error("Error loading times:", error);
    timesContainer.innerHTML = `
      <p class="empty-times">حدث خطأ في تحميل المواعيد</p>
    `;
  }
}

async function handleBooking() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!selectedDate || !selectedTime) {
    showToast("اختار اليوم والوقت أولاً", "warning");
    return;
  }

  // Disable button and change text (like the availability page pattern)
  bookBtn.disabled = true;
  const originalBtnText = bookBtn.textContent;
  bookBtn.textContent = "جاري الحجز...";

  try {
    const result = await addAppointment({
      player_id: String(currentUser.id),
      specialist_id: String(doctorId),
      date: selectedDate,
      time: selectedTime,
      status: "pending"
    });

    if (!result.success) {
      showToast(result.message || "فشل في حجز الموعد", "error");
      bookBtn.disabled = false;
      bookBtn.textContent = originalBtnText;
      return;
    }

    // Show success toast (same pattern as availability page)
    showToast("تم حجز الموعد بنجاح", "success");

    // Reset form (optional)
    selectedTime = null;
    selectedDate = null;
    bookBtn.disabled = true;
    
    // Remove active class from time buttons
    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    
    // Remove active class from day buttons
    document.querySelectorAll(".day-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Redirect after showing toast (same as availability page)
    setTimeout(() => {
      window.location.href = "../Players_appointment/player_appointment.html";
    }, 1400);
    
  } catch (error) {
    console.error("Error in handleBooking:", error);
    showToast("حدث خطأ في حجز الموعد", "error");
    bookBtn.disabled = false;
    bookBtn.textContent = originalBtnText;
  }
}

function generateNext7Days() {
  const days = [];
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  return days;
}

function formatArabicDate(dateObj) {
  const dayName = dateObj.toLocaleDateString("ar-EG", { weekday: "long" });
  const dayNumber = dateObj.toLocaleDateString("ar-EG", { day: "numeric" });
  const monthName = dateObj.toLocaleDateString("ar-EG", { month: "long" });

  return {
    dayName,
    textDate: `${dayNumber} ${monthName}`
  };
}

function formatDateForDB(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeArabic(time) {
  if (!time) return "";
  
  // Format: "10:00" or "10:00:00"
  if (typeof time === 'string' && time.includes(':')) {
    let parts = time.split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours)) {
      return time;
    }
    
    if (isNaN(minutes)) {
      minutes = 0;
    }
    
    const period = hours >= 12 ? "م" : "ص";
    let formattedHours = hours % 12;
    if (formattedHours === 0) formattedHours = 12;
    
    const minutesStr = String(minutes).padStart(2, '0');
    
    return `${formattedHours}:${minutesStr} ${period}`;
  }
  
  return time;
}