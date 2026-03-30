function getBasePath() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("/pages/")) {
    return "../../";
  }

  return "./";
}

function renderFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const base = getBasePath();
  const year = new Date().getFullYear();

  footer.className = "main-footer";

  footer.innerHTML = `
    <img src="${base}assets/images/footer_bg.png" alt="" class="footer-bg-circles">

    <div class="container">
      <div class="footer-top">

        <div class="footer-brand-col">
          <a href="${base}pages/Home/home.html" class="footer-brand">
            <img src="${base}assets/images/logosport.png" alt="SportCare Logo" class="footer-logo">
            <span class="footer-brand-name">SportCare</span>
          </a>

          <div class="footer-contact-list">
            <div class="footer-contact-item">
              <span class="footer-contact-icon">
                <i class="fa-regular fa-envelope"></i>
              </span>
              <span class="footer-contact-text">info@sportcare.com</span>
            </div>

            <div class="footer-contact-item">
              <span class="footer-contact-icon">
                <i class="fa-solid fa-phone-volume"></i>
              </span>
              <span class="footer-contact-text">+20 100 000 0000</span>
            </div>

            <div class="footer-contact-item footer-contact-item-address">
              <span class="footer-contact-icon">
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <span class="footer-contact-text">
                Cairo, Egypt <br>
                Sports Injury Management Platform
              </span>
            </div>
          </div>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-title">نظرة عامة</h4>
          <ul class="footer-links">
            <li><a href="${base}pages/Home/home.html">الرئيسية</a></li>
            <li><a href="${base}pages/About_us/about_us.html">من نحن</a></li>
            <li><a href="${base}pages/services/services.html">الخدمات</a></li>
            <li><a href="${base}pages/injuries/injuries.html">الإصابات</a></li>
            <li><a href="${base}pages/contact_us/contact_us.html">تواصل معنا</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-title">الخدمات</h4>
          <ul class="footer-links">
            <li><a href="#">تسجيل الإصابات</a></li>
            <li><a href="#">متابعة الحالة الطبية</a></li>
            <li><a href="#">برامج التأهيل</a></li>
            <li><a href="#">تقارير الأداء الطبي</a></li>
            <li><a href="#">تقييم العودة للملاعب</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-title">السياسات</h4>
          <ul class="footer-links">
            <li><a href="#">سياسة الخصوصية</a></li>
            <li><a href="#">شروط الاستخدام</a></li>
            <li><a href="#">سياسة الدعم</a></li>
            <li><a href="#">سياسة الإلغاء</a></li>
            <li><a href="#">سياسة الإحالة</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
         
        <p class="footer-copy">جميع الحقوق محفوظة لمنصة © ${year} SportCare</p>

        <div class="footer-social">
          <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i class="fa-brands fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
        </div>
      </div>
    </div>
  `;
}

renderFooter();

export { renderFooter };