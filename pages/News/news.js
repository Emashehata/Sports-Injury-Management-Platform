import { getAllNews } from "../.././services/news_services.js";

const featuredNewsContainer = document.getElementById("featuredNewsContainer");
const newsContainer = document.getElementById("newsContainer");

document.addEventListener("DOMContentLoaded", initNewsPage);

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

// دالة لاستخراج النص العادي من HTML للعرض
function stripHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

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
    // تحويل المحتوى إلى HTML مع روابط قابلة للنقر
    const contentHTML = convertToHTMLWithLinks(news.content);
    // استخراج النص العادي للمعاينة
    const plainContent = stripHTML(news.content);
    const truncatedPlain = truncateText(plainContent, 220);
    
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
                        <!-- عرض المحتوى مع الروابط -->
                        <div class="featured-content-text" style="color: var(--text-muted); line-height: 1.9; margin-bottom: 22px;">
                            ${contentHTML}
                        </div>
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

    newsContainer.innerHTML = newsList.map(news => {
        // تحويل المحتوى إلى HTML مع روابط قابلة للنقر
        const contentHTML = convertToHTMLWithLinks(news.content);
        // استخراج النص العادي للمعاينة
        const plainContent = stripHTML(news.content);
        const truncatedPlain = truncateText(plainContent, 120);
        
        return `
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
                        <!-- عرض المحتوى المختصر مع الروابط -->
                        <div class="news-card-content" style="color: var(--text-muted); font-size: 15px; line-height: 1.8; margin-bottom: 18px;">
                            ${truncatedPlain}
                            ${plainContent.length > 120 ? '...' : ''}
                        </div>
                        <a href="../News_details/news_details.html?id=${news.id}" class="read-link">
                            اقرأ المزيد <i class="fa-solid fa-arrow-left me-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join("");
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
    return text.substring(0, maxLength).trim();
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