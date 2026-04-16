
        import { requireAdmin } from '../../services/user_services.js';
        import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
        import { showToast } from '../../shared/js/toaster.js';
        import { 
            getAllContactMessages,
            updateContactMessageStatus,
            deleteContactMessage
        } from '../../services/contact_services.js';

        if (!requireAdmin()) {
            window.location.href = '../../index.html';
        }
        
        let allMessages = [];
        let currentPage = 1;
        let searchTerm = '';
        let statusFilter = '';
        let currentMessageId = null;
        const itemsPerPage = 10;
        
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = createSidebar('contact_messages');
            initSidebar();
            setupMobileSidebar();
        }
        
        const now = new Date();
        const currentDateElem = document.getElementById('currentDate');
        if (currentDateElem) {
            currentDateElem.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        
        function loadStats() {
            const unreadCount = allMessages.filter(m => m.status === 'unread').length;
            const statsCards = document.getElementById('statsCards');
            
            statsCards.innerHTML = `
                <div class="stat-card unread">
                    <i class="fa-regular fa-envelope"></i>
                    <div class="stat-number">${unreadCount}</div>
                    <div class="stat-label">رسائل غير مقروءة</div>
                </div>
                <div class="stat-card total">
                    <i class="fa-regular fa-envelope-open"></i>
                    <div class="stat-number">${allMessages.length}</div>
                    <div class="stat-label">إجمالي الرسائل</div>
                </div>
                <div class="stat-card replied">
                    <i class="fa-regular fa-check-circle"></i>
                    <div class="stat-number">${allMessages.filter(m => m.status === 'read').length}</div>
                    <div class="stat-label">تمت قراءتها</div>
                </div>
            `;
        }
        
        async function loadMessages() {
            try {
                const result = await getAllContactMessages();
                if (result.success) {
                    allMessages = result.data;
                    console.log('الرسائل:', allMessages);
                    loadStats();
                    renderTable();
                } else {
                    showToast('حدث خطأ في تحميل الرسائل', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('حدث خطأ في تحميل البيانات', 'error');
            }
        }
        
        async function markAsRead(id) {
            const message = allMessages.find(m => m.id === id);
            if (message && message.status === 'unread') {
                await updateContactMessageStatus(id, 'read');
                message.status = 'read';
                loadStats();
                renderTable();
            }
        }
        
        window.viewMessage = async (id) => {
            currentMessageId = id;
            
            const message = allMessages.find(m => m.id === id);
            if (!message) {
                showToast('حدث خطأ في عرض الرسالة', 'error');
                return;
            }
            
            await markAsRead(id);
            
            const messageDetails = document.getElementById('messageDetails');
            messageDetails.innerHTML = `
                <div class="message-detail">
                    <strong><i class="fa-regular fa-user"></i> الاسم:</strong>
                    <span>${escapeHtml(message.fullName)}</span>
                </div>
                <div class="message-detail">
                    <strong><i class="fa-regular fa-envelope"></i> البريد:</strong>
                    <span>${escapeHtml(message.email)}</span>
                </div>
                <div class="message-detail">
                    <strong><i class="fa-regular fa-phone"></i> الهاتف:</strong>
                    <span>${message.phone || 'غير متوفر'}</span>
                </div>
                <div class="message-detail">
                    <strong><i class="fa-regular fa-tag"></i> الموضوع:</strong>
                    <span>${escapeHtml(message.subject)}</span>
                </div>
                <div class="message-detail">
                    <strong><i class="fa-regular fa-calendar"></i> التاريخ:</strong>
                    <span>${new Date(message.createdAt).toLocaleString('ar-EG')}</span>
                </div>
                <div class="message-content">
                    <strong>نص الرسالة:</strong><br>
                    ${escapeHtml(message.message)}
                </div>
            `;
            
            document.getElementById('modalTitle').textContent = `رسالة من ${message.fullName}`;
            document.getElementById('messageModal').classList.add('open');
        };
        
        window.deleteMessage = async (id) => {
            if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                const result = await deleteContactMessage(id);
                if (result.success) {
                    showToast('تم حذف الرسالة بنجاح', 'success');
                    await loadMessages();
                } else {
                    showToast(result.message || 'حدث خطأ في الحذف', 'error');
                }
            }
        };
        
        function renderTable() {
            const tbody = document.getElementById('messagesTableBody');
            if (!tbody) return;
            
            let filtered = [...allMessages];
            
            if (searchTerm) {
                filtered = filtered.filter(m => 
                    (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            if (statusFilter) {
                filtered = filtered.filter(m => m.status === statusFilter);
            }
            
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = filtered.slice(start, start + itemsPerPage);
            
            renderPagination(totalPages);
            
            if (paginated.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="7">
                        <div class="empty-state">
                            <i class="fa-regular fa-envelope"></i>
                            <p>لا توجد رسائل</p>
                        </div>
                    </td></tr>
                `;
                return;
            }
            
            tbody.innerHTML = paginated.map(m => {
                let statusClass = '';
                let statusText = '';
                
                switch(m.status) {
                    case 'unread':
                        statusClass = 'status-unread';
                        statusText = 'غير مقروءة';
                        break;
                    case 'read':
                        statusClass = 'status-read';
                        statusText = 'مقروءة';
                        break;
                    default:
                        statusClass = 'status-read';
                        statusText = 'مقروءة';
                }
                
                return `
                    <tr style="${m.status === 'unread' ? 'font-weight: bold; background: rgba(231, 76, 60, 0.05);' : ''}">
                        <td><strong>${escapeHtml(m.fullName)}</strong></td>
                        <td>${escapeHtml(m.email)}</td>
                        <td>${escapeHtml(m.subject)}</td>
                        <td class="message-preview">${escapeHtml(m.message.substring(0, 50))}${m.message.length > 50 ? '...' : ''}</td>
                        <td>${new Date(m.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon btn-view" onclick="window.viewMessage('${m.id}')">
                                    <i class="fa-regular fa-eye"></i> عرض
                                </button>
                                <button class="btn-icon btn-delete" onclick="window.deleteMessage('${m.id}')">
                                    <i class="fa-regular fa-trash-alt"></i> حذف
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        
        function renderPagination(totalPages) {
            const paginationDiv = document.getElementById('pagination');
            if (!paginationDiv) return;
            
            if (totalPages <= 1) {
                paginationDiv.innerHTML = '';
                return;
            }
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.goToPage(${i})">${i}</button>`;
            }
            paginationDiv.innerHTML = html;
        }
        
        window.goToPage = (page) => { 
            currentPage = page; 
            renderTable(); 
        };
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderTable();
            });
        }

        const statusFilterSelect = document.getElementById('statusFilter');
        if (statusFilterSelect) {
            statusFilterSelect.addEventListener('change', (e) => {
                statusFilter = e.target.value;
                currentPage = 1;
                renderTable();
            });
        }
        
        window.closeModal = () => {
            document.getElementById('messageModal').classList.remove('open');
            currentMessageId = null;
        };
        
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        loadMessages();
        
        window.viewMessage = window.viewMessage;
        window.deleteMessage = window.deleteMessage;
        window.closeModal = window.closeModal;
        window.goToPage = window.goToPage;
