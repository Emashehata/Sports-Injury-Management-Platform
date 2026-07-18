const BASE_PATH = "/";

const STORAGE_KEYS = {
  CURRENT_USER: "currentUser"
};

function buildPath(relativePath = "") {
  return `${BASE_PATH}${relativePath}`.replace(/([^:]\/)\/+/g, "$1");
}

function normalizePath(path) {
  return path.toLowerCase().replace(/\/+$/, "");
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = buildPath("pages/auth/Login/login.html");
}

function getUserType(user) {
  return (user?.userType || user?.user_type || "").toLowerCase();
}

function getRoleBasedLink(user) {
  const userType = getUserType(user);

  if (userType === "player") {
    return `
      <li>
        <a href="${buildPath("pages/Player/Players_appointment/player_appointment.html")}">
          مواعيدي
        </a>
      </li>
      <li>
        <a href="${buildPath("pages/Player/medical_record/medical_record.html")}">
          السجل الطبي
        </a>
      </li>
    `;
  }

  if (userType === "specialist" || userType === "specilist") {
    return `
      <li>
        <a href="${buildPath("pages/Specialists/Doctor_appointments/doctor_appointments.html")}">
          مواعيدي
        </a>
      </li>
      <li>
        <a href="${buildPath("pages/Specialists/BookedAppointments/doctor_appointments.html")}">
          الحجوزات
        </a>
      </li>
    `;
  }

  return "";
}

function getProfilePath(user) {
  const userType = getUserType(user);

  if (userType === "player") {
    return buildPath("pages/Profile/profile.html");
  }

  if (userType === "specialist" || userType === "specilist") {
    return buildPath("pages/Profile/profile.html");
  }

  return buildPath("pages/Home/home.html");
}

function getAuthSection(user) {
  if (user) {
    return `
      <div class="navbar-auth-dropdown">
        <button class="navbar-user-trigger" id="userMenuBtn" type="button" aria-label="قائمة المستخدم">
          <i class="fa-solid fa-circle-user"></i>
          <span class="navbar-user-name">${user.name || "User"}</span>
          <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
        </button>

        <div class="navbar-dropdown-menu" id="userDropdownMenu">
          <a href="${getProfilePath(user)}" class="dropdown-item">
            <i class="fa-regular fa-user"></i>
            <span>الملف الشخصي</span>
          </a>
          <button class="dropdown-item dropdown-logout" id="logoutBtn" type="button">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="navbar-auth-dropdown">
      <button class="navbar-user-trigger" id="userMenuBtn" type="button" aria-label="قائمة الحساب">
        <i class="fa-solid fa-circle-user"></i>
        <span class="navbar-user-name">حسابي</span>
        <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
      </button>

      <div class="navbar-dropdown-menu" id="userDropdownMenu">
        <a href="${buildPath("pages/auth/Login/login.html")}" class="dropdown-item">
          <i class="fa-solid fa-right-to-bracket"></i>
          <span>تسجيل الدخول</span>
        </a>
        <a href="${buildPath("pages/auth/Register/register.html")}" class="dropdown-item">
          <i class="fa-solid fa-user-plus"></i>
          <span>إنشاء حساب</span>
        </a>
      </div>
    </div>
  `;
}

function renderNavbar() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const currentUser = getCurrentUser();
  const roleLink = getRoleBasedLink(currentUser);
  const authSection = getAuthSection(currentUser);

  nav.className = "main-navbar";

  nav.innerHTML = `
    <div class="container">
      <div class="navbar-box">

        <a href="${buildPath("pages/Home/home.html")}" class="navbar-brand">
        <img src="${buildPath("assets/images/logosport.png")}" alt="شعار المنصة" class="navbar-logo">  
        <div class="navbar-brand-text">
            <span class="brand-title">SportCare</span>
            <span class="brand-subtitle">تأهيل حركي مصر</span>
          </div>
        </a>

        <button class="navbar-toggle" aria-label="فتح القائمة">
          <i class="fa-solid fa-bars"></i>
        </button>

        <div class="navbar-links-wrapper">
          <ul class="navbar-links">
            <li><a href="${buildPath("pages/Home/home.html")}">الرئيسية</a></li>
            <li><a href="${buildPath("pages/News/news.html")}">الأخبار</a></li>
            <li><a href="${buildPath("pages/Specialists/specialist.html")}">الاخصائيين</a></li>
            ${roleLink}
            <li><a href="${buildPath("pages/About_us/about_us.html")}">من نحن</a></li>
            <li><a href="${buildPath("pages/Contact_us/contact_us.html")}">تواصل معنا</a></li>
          </ul>
        </div>

        <div class="navbar-actions">
          ${authSection}
        </div>

      </div>
    </div>
  `;

  // Toggle menu for mobile
  const toggleBtn = nav.querySelector(".navbar-toggle");
  const linksWrapper = nav.querySelector(".navbar-links-wrapper");
  const actions = nav.querySelector(".navbar-actions");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      linksWrapper?.classList.toggle("show");
      actions?.classList.toggle("show");
    });
  }

  // User dropdown menu
  const userMenuBtn = nav.querySelector("#userMenuBtn");
  const userDropdownMenu = nav.querySelector("#userDropdownMenu");
  const logoutBtn = nav.querySelector("#logoutBtn");

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdownMenu?.classList.toggle("show");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      userDropdownMenu &&
      userMenuBtn &&
      !userMenuBtn.contains(e.target) &&
      !userDropdownMenu.contains(e.target)
    ) {
      userDropdownMenu.classList.remove("show");
    }
  });

  setActiveLink(nav);
}

function setActiveLink(nav) {
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = nav.querySelectorAll(".navbar-links a");

  navLinks.forEach(link => {
    const linkPath = normalizePath(new URL(link.href).pathname);

    if (currentPath === linkPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

renderNavbar();