function getBasePath() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("/pages/")) {
    return "../../";
  }

  return "./";
}

function normalizePath(path) {
  return path.toLowerCase().replace(/\/+$/, "");
}

function renderNavbar() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const base = getBasePath();

  nav.className = "main-navbar";

  nav.innerHTML = `
    <div class="container">
      <div class="navbar-box">

        <a href="${base}pages/Home/home.html" class="navbar-brand">
          <img src="${base}assets/images/logosport.png" alt="شعار المنصة" class="navbar-logo">
          <div class="navbar-brand-text">
            <span class="brand-title">SportCare</span>
            <span class="brand-subtitle">إدارة الإصابات الرياضية</span>
          </div>
        </a>

        <button class="navbar-toggle" aria-label="فتح القائمة">
          <i class="fa-solid fa-bars"></i>
        </button>

        <div class="navbar-links-wrapper">
          <ul class="navbar-links">
            <li><a href="${base}pages/Home/home.html">الرئيسية</a></li>
            <li><a href="${base}pages/About_us/about_us.html">من نحن</a></li>
            <li><a href="${base}pages/services/services.html">الخدمات</a></li>
            <li><a href="${base}pages/injuries/injuries.html">الإصابات</a></li>
            <li><a href="${base}pages/doctors/doctors.html">الفريق الطبي</a></li>
            <li><a href="${base}pages/contact_us/contact_us.html">تواصل معنا</a></li>
          </ul>

          <a href="${base}pages/contact_us/contact_us.html" class="navbar-btn">احجز استشارة</a>
        </div>
      </div>
    </div>
  `;

  const toggleBtn = nav.querySelector(".navbar-toggle");
  const linksWrapper = nav.querySelector(".navbar-links-wrapper");

  toggleBtn?.addEventListener("click", () => {
    linksWrapper.classList.toggle("show");
  });

  setActiveLink(nav);
}

function setActiveLink(nav) {
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = nav.querySelectorAll(".navbar-links a");

  navLinks.forEach(link => {
    const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);

    if (currentPath === linkPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

renderNavbar();