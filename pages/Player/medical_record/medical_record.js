import { getInjuriesByPlayer } from "../../../services/injury_services.js";
import { getAllSpecialistsWithUsers } from "../../../services/specialist_services.js";

const injuriesContainer = document.getElementById("injuriesContainer");
const accessMessage = document.getElementById("accessMessage");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let specialistsMap = {};

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

function hasPlayerAccess() {
  if (!currentUser) {
    showAccessMessage("يجب تسجيل الدخول أولًا");
    return false;
  }

  const userType = (currentUser.userType || currentUser.user_type || "").toLowerCase();

  if (userType !== "player") {
    showAccessMessage("هذه الصفحة مخصصة للاعب فقط");
    return false;
  }

  clearAccessMessage();
  return true;
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
      const key = String(specialist.specialistId || specialist.id || specialist.userId);
      acc[key] = {
        name: specialist.name || "أخصائي",
        email: specialist.email || "",
        phone: specialist.phone || ""
      };
      return acc;
    }, {});

    console.log("specialistsMap:", specialistsMap);
  } catch (error) {
    console.error("Error loading specialists:", error);
    specialistsMap = {};
  }
}

function getSpecialistName(specialistId) {
  const specialist = specialistsMap[String(specialistId)];

  if (specialist?.name) {
    return specialist.name;
  }

  console.warn("Specialist not found for ID:", specialistId);
  return `أخصائي (${specialistId})`;
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

function renderInjuries(data) {
  if (!injuriesContainer) return;

  if (!data.length) {
    injuriesContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-box">
          <i class="fa-regular fa-file-medical"></i>
          <h4>لا يوجد سجل طبي</h4>
          <p>لم يتم تسجيل أي إصابات لك حتى الآن.</p>
        </div>
      </div>
    `;
    return;
  }

  injuriesContainer.innerHTML = data
    .sort((a, b) => new Date(b.injury_date) - new Date(a.injury_date))
    .map((injury) => {
      const specialistName = getSpecialistName(injury.specialist_id);

      return `
        <div class="col-md-6 col-xl-6">
          <div class="record-card">
            <div class="record-top">
              <div>
                <div class="record-title">${injury.injury_type || "إصابة"}</div>
                <div class="record-date">${formatDate(injury.injury_date)}</div>
              </div>

              <span class="record-badge-small">سجل طبي</span>
            </div>

            <div class="record-details">
              <div class="record-detail-item">
                <i class="fa-solid fa-stethoscope"></i>
                <span><strong>التشخيص:</strong> ${injury.diagnosis || "غير محدد"}</span>
              </div>

              <div class="record-detail-item">
                <i class="fa-solid fa-user-doctor"></i>
                <span><strong>الأخصائي:</strong> ${specialistName}</span>
              </div>

              <div class="record-detail-item">
                <i class="fa-regular fa-calendar"></i>
                <span><strong>تاريخ الإصابة:</strong> ${formatDate(injury.injury_date)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function loadMedicalRecord() {
  if (!hasPlayerAccess()) return;

  injuriesContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  `;

  await loadSpecialistsNames();

  const injuries = await getInjuriesByPlayer(String(currentUser.id));
  console.log("Player injuries:", injuries);

  renderInjuries(injuries);
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadMedicalRecord();
});