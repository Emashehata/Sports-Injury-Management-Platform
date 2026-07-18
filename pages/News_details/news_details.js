import { getNewsById } from "../../../services/news_services.js";

const container = document.getElementById("newsDetailsContainer");

document.addEventListener("DOMContentLoaded", initNewsDetailsPage);

// دالة لتحويل النص إلى HTML مع دعم الروابط القابلة للنقر
function convertToHTMLWithLinks(text) {
    if (!text) return '';
    
    // escape HTML entities أولاً
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    // تحويل الروابط إلى عناصر <a> قابلة للنقر
    // الرابط بصيغة: http://example.com أو https://example.com أو www.example.com
    html = html.replace(
        /(https?:\/\/[^\s]+|www\.[^\s]+)/g,
        function(url) {
            let fullUrl = url;
            // إضافة https:// إذا كان الرابط يبدأ بـ www
            if (url.startsWith('www.')) {
                fullUrl = 'https://' + url;
            }
            return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; font-weight: 600;">${url}</a>`;
        }
    );
    
    // تحويل البريد الإلكتروني إلى رابط mailto:
    html = html.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        function(email) {
            return `<a href="mailto:${email}" style="color: var(--primary); text-decoration: underline;">${email}</a>`;
        }
    );
    
    // تحويل الأسطر الجديدة إلى <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

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
    // تحويل المحتوى إلى HTML مع روابط قابلة للنقر
    const contentHTML = convertToHTMLWithLinks(news.content);
    
    container.innerHTML = `
        <div class="row g-5">

            <!-- Image -->
            <div class="col-lg-6">
                <div class="news-image-box">
                    <img
                        src="${news.image || "../../assets/images/image.png"}"
                        alt="${escapeHtml(news.title)}"
                        class="news-details-image"
                    />
                </div>
            </div>

            <!-- Content -->
            <div class="col-lg-6">
                <div class="news-details-content">
                    <h2 class="news-title">
                        ${escapeHtml(news.title)}
                    </h2>

                    <span class="news-date">
                        <i class="fa-regular fa-calendar ms-2"></i>
                        ${formatDate(news.date)}
                    </span>

                    <!-- عرض المحتوى مع الروابط القابلة للنقر -->
                    <div class="news-description">
                        ${contentHTML}
                    </div>

                    <div class="news-actions w-100">
                        <a href="../News/news.html" class="back-btn">
                            <i class="fa-solid fa-arrow-right"></i>
                            الرجوع للأخبار
                        </a>
                    </div>

                </div>
            </div>

        </div>
    `;
}

function renderEmpty(message) {
    container.innerHTML = `
        <div class="details-empty">
            <i class="fa-regular fa-newspaper fa-2x mb-3"></i>
            <h5>${message}</h5>
            <a href="../News/news.html" class="back-btn mt-3">
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

function escapeHtml(text = "") {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}