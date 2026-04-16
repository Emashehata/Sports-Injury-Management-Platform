export function createSidebar(activePage = 'dashboard') {
  return `
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <img src="../../assets/images/logosport.png" alt="Logo" class="sidebar-logo" onerror="this.src='https://via.placeholder.com/40'">
        <h3>لوحة التحكم</h3>
      </div>
      
      <nav class="sidebar-nav">
        <a href="../Home/home.html" class="sidebar-link ${activePage === 'home' ? 'active' : ''}">
          <i class="fa-solid fa-chart-line"></i>
          <span>الرئيسية</span>
        </a>
        
        <a href="../News/news-manager.html" class="sidebar-link ${activePage === 'news' ? 'active' : ''}">
          <i class="fa-solid fa-newspaper"></i>
          <span>إدارة الأخبار</span>
        </a>
        
        <a href="../Injuries/injuries-manager.html" class="sidebar-link ${activePage === 'injuries' ? 'active' : ''}">
          <i class="fa-solid fa-futbol"></i>
          <span>إدارة الإصابات</span>
        </a>
        
        <a href="../Players/players-manager.html" class="sidebar-link ${activePage === 'players' ? 'active' : ''}">
          <i class="fa-solid fa-users"></i> 
          <span>اللاعبين</span>
        </a>
        
        <a href="../Specialists/specialists-manager.html" class="sidebar-link ${activePage === 'specialists' ? 'active' : ''}">
          <i class="fa-solid fa-user-md"></i>
          <span>الأخصائيين</span>
        </a>
        
        <a href="../Contact/contact_messages.html" class="sidebar-link ${activePage === 'contact_messages' ? 'active' : ''}">
          <i class="fa-regular fa-envelope"></i>
          <span>رسائل التواصل</span>
          <span class="messages-badge" id="unreadMessagesBadge" style="display: none;">0</span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <button class="sidebar-logout-btn" id="sidebarLogoutBtn">
          <i class="fa-solid fa-sign-out-alt"></i>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  `;
}

export function initSidebar() {
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      window.location.href = '../../index.html';
    });
  }
}

// دالة لتحديث عدد الرسائل غير المقروءة في الـ sidebar
export async function updateUnreadMessagesCount() {
  try {
    const { getUnreadCount } = await import('../../services/contact_services.js');
    const unreadCount = await getUnreadCount();
    
    const badge = document.getElementById('unreadMessagesBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('خطأ في جلب عدد الرسائل غير المقروءة:', error);
  }
}

// For mobile responsive
export function setupMobileSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (toggleBtn && sidebar) {
    const checkWidth = () => {
      if (window.innerWidth <= 992) {
        toggleBtn.style.display = 'block';
      } else {
        toggleBtn.style.display = 'none';
        sidebar.classList.remove('open');
      }
    };
    
    checkWidth();
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    window.addEventListener('resize', checkWidth);
  }
}