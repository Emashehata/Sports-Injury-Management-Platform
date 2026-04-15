
        import { requireAdmin, getCurrentUser } from '../../services/user_services.js';
        import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
        
        if (!requireAdmin()) {
            window.location.href = '../../index.html';
        }
        
        import { getAllNews, addNews, updateNews, deleteNews } from '../../services/news_services.js';
        import { showToast } from '../../shared/js/toaster.js';
        
        let allNews = [];
        let currentNewsId = null;
        let currentPage = 1;
        let searchTerm = '';
        let pendingDeleteId = null;
        const itemsPerPage = 10;
        
        function uploadImageToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        document.getElementById('sidebar-container').innerHTML = createSidebar('news');
        initSidebar();
        setupMobileSidebar();

        const now = new Date();
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        async function loadNews() {
            try {
                const result = await getAllNews();
                
                if (Array.isArray(result)) {
                    allNews = result;
                } else if (result && result.data && Array.isArray(result.data)) {
                    allNews = result.data;
                } else {
                    allNews = [];
                }
                
                renderTable();
            } catch (error) {
                console.error('Error loading news:', error);
                showToast('حدث خطأ في تحميل الأخبار', 'error');
                allNews = [];
                renderTable();
            }
        }
        
        function renderTable() {
            const tbody = document.getElementById('newsTableBody');
            
            let filteredNews = allNews;
            if (searchTerm) {
                filteredNews = allNews.filter(news => 
                    (news.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (news.content || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const paginatedNews = filteredNews.slice(start, start + itemsPerPage);
            
            renderPagination(totalPages);
            
            if (paginatedNews.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="5">
                        <div class="empty-news">
                            <i class="fa-regular fa-newspaper"></i>
                            <p>لا توجد أخبار</p>
                            <button class="btn-add-news" id="emptyAddBtn" style="margin-top: 15px;">
                                <i class="fa-solid fa-plus"></i> أضف أول خبر
                            </button>
                        </div>
                    </td></tr>
                `;
                const emptyAddBtn = document.getElementById('emptyAddBtn');
                if (emptyAddBtn) emptyAddBtn.onclick = () => openAddModal();
                return;
            }
            
            tbody.innerHTML = paginatedNews.map(news => `
                <tr>
                    <td class="news-image-cell">
                        ${news.image ? `<img src="${news.image}" class="news-image" alt="${news.title || 'خبر'}">` : '<div class="news-image" style="background: var(--gray-200); display: flex; align-items: center; justify-content: center;"><i class="fa-regular fa-image" style="color: var(--gray-500);"></i></div>'}
                    </td>
                    <td class="news-title-cell">
                        <span class="news-title-text" title="${news.title || ''}">${news.title || 'بدون عنوان'}</span>
                    </td>
                    <td>
                        <span class="news-content-preview" title="${news.content || ''}">${(news.content || '').substring(0, 80)}${(news.content || '').length > 80 ? '...' : ''}</span>
                    </td>
                    <td>${news.date || 'غير محدد'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="editNews('${news.id}')">
                                <i class="fa-solid fa-pen"></i> تعديل
                            </button>
                            <button class="btn-icon btn-delete" onclick="openDeleteModal('${news.id}', '${(news.title || '').replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-trash"></i> حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        function renderPagination(totalPages) {
            const paginationDiv = document.getElementById('pagination');
            if (totalPages <= 1) {
                paginationDiv.innerHTML = '';
                return;
            }
            
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="page-btn-news ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            paginationDiv.innerHTML = html;
        }
        
        window.goToPage = function(page) {
            currentPage = page;
            renderTable();
        };
        
        document.getElementById('searchInput').addEventListener('input', (e) => {
            searchTerm = e.target.value;
            currentPage = 1;
            renderTable();
        });
        
        window.openAddModal = function() {
            currentNewsId = null;
            document.getElementById('modalTitle').textContent = 'إضافة خبر جديد';
            document.getElementById('newsForm').reset();
            document.getElementById('newsId').value = '';
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            document.getElementById('imagePreview').classList.remove('show');
            document.getElementById('imagePreview').src = '';
            document.getElementById('newsModal').classList.add('open');
        };
        
        window.editNews = function(id) {
            const news = allNews.find(n => n.id === id);
            if (news) {
                currentNewsId = id;
                document.getElementById('modalTitle').textContent = 'تعديل الخبر';
                document.getElementById('newsId').value = news.id;
                document.getElementById('title').value = news.title || '';
                document.getElementById('content').value = news.content || '';
                document.getElementById('date').value = news.date || '';
                
                if (news.image) {
                    const preview = document.getElementById('imagePreview');
                    preview.src = news.image;
                    preview.classList.add('show');
                }
                
                document.getElementById('newsModal').classList.add('open');
            }
        };
        
        document.getElementById('imageFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const base64 = await uploadImageToBase64(file);
                    const preview = document.getElementById('imagePreview');
                    preview.src = base64;
                    preview.classList.add('show');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    showToast('حدث خطأ في رفع الصورة', 'error');
                }
            }
        });
        
        async function saveNews() {
            const id = document.getElementById('newsId').value;
            const imageFile = document.getElementById('imageFile').files[0];
            
            let imageUrl = document.getElementById('imagePreview').src;
            if (imageFile && imageUrl && imageUrl.startsWith('data:image')) {
                imageUrl = imageUrl;
            }
            
            const newsData = {
                title: document.getElementById('title').value.trim(),
                content: document.getElementById('content').value.trim(),
                image: imageUrl || '',
                date: document.getElementById('date').value
            };
            
            if (!newsData.title || !newsData.content || !newsData.date) {
                showToast('الرجاء ملء جميع الحقول المطلوبة', 'warning');
                return;
            }
            
            try {
                let result;
                if (id) {
                    result = await updateNews(id, newsData);
                    if (result && result.success) {
                        showToast('تم تحديث الخبر بنجاح', 'success');
                        closeModal();
                        await loadNews();
                    } else {
                        showToast(result?.message || 'حدث خطأ في التحديث', 'error');
                    }
                } else {
                    result = await addNews(newsData);
                    if (result && result.success) {
                        showToast('تم إضافة الخبر بنجاح', 'success');
                        closeModal();
                        await loadNews();
                    } else {
                        showToast(result?.message || 'حدث خطأ في الإضافة', 'error');
                    }
                }
            } catch (error) {
                console.error(error);
                showToast('حدث خطأ في حفظ الخبر', 'error');
            }
        }

        window.openDeleteModal = function(id, title) {
            pendingDeleteId = id;
            document.getElementById('deleteNewsTitle').textContent = `"${title}"`;
            document.getElementById('deleteModal').classList.add('open');
        };
        
        async function confirmDelete() {
            if (!pendingDeleteId) return;
            
            try {
                const result = await deleteNews(pendingDeleteId);
                if (result && result.success) {
                    showToast('تم حذف الخبر بنجاح', 'success');
                    closeDeleteModal();
                    await loadNews();
                } else {
                    showToast(result?.message || 'حدث خطأ في الحذف', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('حدث خطأ في حذف الخبر', 'error');
            }
        }
        
        window.closeDeleteModal = function() {
            document.getElementById('deleteModal').classList.remove('open');
            pendingDeleteId = null;
        };
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
        
        window.closeModal = function() {
            document.getElementById('newsModal').classList.remove('open');
            currentNewsId = null;
            document.getElementById('imageFile').value = '';
        };
        
        document.getElementById('newsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('newsModal')) closeModal();
        });
        
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
        });
        
        document.getElementById('saveNewsBtn').addEventListener('click', saveNews);
        document.getElementById('openAddModalBtn').addEventListener('click', openAddModal);
        
        loadNews();
        
        window.editNews = editNews;
        window.openDeleteModal = openDeleteModal;
        window.openAddModal = openAddModal;
        window.closeModal = closeModal;
        window.closeDeleteModal = closeDeleteModal;