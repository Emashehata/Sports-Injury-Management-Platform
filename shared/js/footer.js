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
    <div class="container">
      <div class="footer-content">

        <!-- About -->
        <div class="footer-about">
          <h3>SportCare</h3>
          <p>
            منصة متكاملة لإدارة الإصابات الرياضية وتقديم أفضل رعاية طبية للرياضيين
            بأحدث الأساليب الحديثة.
          </p>

          <!-- Social Icons -->
          <div class="footer-social">
            <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
            <a href="#"><i class="fa-solid fa-envelope"></i></a>
          </div>
        </div>

        <!-- Links -->
        <div class="footer-links">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="${base}pages/Home/home.html">الرئيسية</a></li>
            <li><a href="${base}pages/About_us/about_us.html">من نحن</a></li>
            <li><a href="${base}pages/services/services.html">الخدمات</a></li>
            <li><a href="${base}pages/injuries/injuries.html">الإصابات</a></li>
            <li><a href="${base}pages/contact_us/contact_us.html">تواصل معنا</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-contact">
          <h4>تواصل معنا</h4>
          <p><i class="fa-solid fa-phone"></i> 01000000000</p>
          <p><i class="fa-solid fa-envelope"></i> info@sportcare.com</p>
          <p><i class="fa-solid fa-location-dot"></i> Cairo, Egypt</p>
        </div>

      </div>

      <!-- Bottom -->
      <div class="footer-bottom">
        <p>© ${year} جميع الحقوق محفوظة - SportCare</p>
      </div>
    </div>
  `;
}

renderFooter();