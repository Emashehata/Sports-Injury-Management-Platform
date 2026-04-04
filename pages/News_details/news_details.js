import { getNewsById } from "../../../services/news_services.js";

const container = document.getElementById("newsDetailsContainer");

document.addEventListener("DOMContentLoaded", initNewsDetailsPage);

async function initNewsDetailsPage() {
  showLoading();

  try {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get("id");

    if (!newsId) {
      renderEmpty("لم يتم العثور على الخبر.");
      return;
    }

    const news = await getNewsById(newsId);

    if (!news) {
      renderEmpty("الخبر غير موجود.");
      return;
    }

    renderNewsDetails(news);
  } catch (error) {
    console.error("Failed to load news details:", error);
    renderEmpty("حدث خطأ أثناء تحميل تفاصيل الخبر.");
  }
}

function showLoading() {
  container.innerHTML = `
    <div class="details-loading">
      <i class="fa-solid fa-spinner fa-spin ms-2"></i>
      جاري تحميل تفاصيل الخبر...
    </div>
  `;
}

function renderNewsDetails(news) {
  container.innerHTML = `
    <div class="news-details-card">
      <img
        src="${news.image || "../../assets/images/image.png"}"
        alt="${escapeHtml(news.title)}"
        class="news-details-image"
      />

      <div class="news-details-body">
        <span class="news-details-date">
          <i class="fa-regular fa-calendar ms-2"></i>
          ${formatDate(news.date)}
        </span>

        <h2 class="news-details-title">${escapeHtml(news.title)}</h2>

        <div class="news-details-content">
          ${formatContent(news.content)}
        </div>

        <a href="../News/news.html" class="back-btn">
          <i class="fa-solid fa-arrow-right"></i>
          العودة إلى الأخبار
        </a>
      </div>
    </div>
  `;
}

function renderEmpty(message) {
  container.innerHTML = `
    <div class="details-empty">
      <i class="fa-regular fa-newspaper fa-2x mb-3"></i>
      <h5>${message}</h5>
      <a href="./news.html" class="back-btn mt-3">
        <i class="fa-solid fa-arrow-right"></i>
        العودة إلى الأخبار
      </a>
    </div>
  `;
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

function formatContent(content = "") {
  return escapeHtml(content).replace(/\n/g, "<br>");
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}