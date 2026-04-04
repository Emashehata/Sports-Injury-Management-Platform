import { getAllNews } from "../.././services/news_services.js";

const featuredNewsContainer = document.getElementById("featuredNewsContainer");
const newsContainer = document.getElementById("newsContainer");

document.addEventListener("DOMContentLoaded", initNewsPage);

async function initNewsPage() {
  showLoading();

  try {
    let newsList = await getAllNews();

    if (!newsList || newsList.length === 0) {
      renderEmptyState();
      return;
    }

    newsList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const [featuredNews, ...otherNews] = newsList;

    renderFeaturedNews(featuredNews);
    renderNewsCards(otherNews);
  } catch (error) {
    console.error("Failed to load news page:", error);
    renderEmptyState("حدث خطأ أثناء تحميل الأخبار");
  }
}

function showLoading() {
  featuredNewsContainer.innerHTML = `
    <div class="loading-news">
      <i class="fa-solid fa-spinner fa-spin ms-2"></i>
      جاري تحميل الخبر المميز...
    </div>
  `;

  newsContainer.innerHTML = `
    <div class="col-12">
      <div class="loading-news">
        <i class="fa-solid fa-spinner fa-spin ms-2"></i>
        جاري تحميل الأخبار...
      </div>
    </div>
  `;
}

function renderFeaturedNews(news) {
  featuredNewsContainer.innerHTML = `
    <div class="featured-news">
      <div class="row g-0 align-items-center">
        <div class="col-lg-6">
          <img
            src="${news.image || "../../assets/images/image.png"}"
            alt="${escapeHtml(news.title)}"
          />
        </div>
        <div class="col-lg-6">
          <div class="featured-content">
            <span class="news-date">
              <i class="fa-regular fa-calendar ms-2"></i>${formatDate(news.date)}
            </span>
            <h3>${escapeHtml(news.title)}</h3>
            <p>${truncateText(news.content, 220)}</p>
            <a href="../News_details/news_details.html?id=${news.id}" class="btn-green">اقرأ المزيد</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNewsCards(newsList) {
  if (!newsList.length) {
    newsContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-news">
          <i class="fa-regular fa-newspaper fa-2x mb-3"></i>
          <h5>لا توجد أخبار أخرى حالياً</h5>
          <p class="mb-0">تابعنا لاحقًا لمعرفة المزيد من التحديثات.</p>
        </div>
      </div>
    `;
    return;
  }

  newsContainer.innerHTML = newsList.map(news => `
    <div class="col-md-6 col-lg-4">
      <div class="news-card">
        <img
          src="${news.image || "../../assets/images/image.png"}"
          alt="${escapeHtml(news.title)}"
        />
        <div class="news-card-body">
          <span class="news-date">
            <i class="fa-regular fa-calendar ms-2"></i>${formatDate(news.date)}
          </span>
          <h5>${escapeHtml(news.title)}</h5>
          <p>${truncateText(news.content, 120)}</p>
          <a href="../News_details/news_details.html?id=${news.id}" class="read-link">
            اقرأ المزيد <i class="fa-solid fa-arrow-left me-1"></i>
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

function renderEmptyState(message = "لا توجد أخبار حالياً.") {
  featuredNewsContainer.innerHTML = `
    <div class="empty-news">
      <i class="fa-regular fa-newspaper fa-2x mb-3"></i>
      <h5>${message}</h5>
      <p class="mb-0">قومي بإضافة أخبار من لوحة التحكم ثم جربي مرة أخرى.</p>
    </div>
  `;

  newsContainer.innerHTML = "";
}

function truncateText(text = "", maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

function formatDate(dateString) {
  if (!dateString) return "بدون تاريخ";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}