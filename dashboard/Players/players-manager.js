
        import { requireAdmin } from '../../services/user_services.js';
        import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
        import { showToast } from '../../shared/js/toaster.js';
        import { getAllUsers, addUser, updateUser, deleteUser } from '../../services/user_services.js';
        
        import { 
            getAllPlayers, 
            addPlayer, 
            updatePlayer, 
            deletePlayer,
            getPlayerById
        } from '../../services/player_services.js';
        
        if (!requireAdmin()) {
            window.location.href = '../../index.html';
        }
        
        let allPlayersData = [];
        let currentPage = 1;
        let searchTerm = '';
        let sportFilter = '';
        let pendingDeleteId = null;
        let currentStatsPlayerId = null;
        const itemsPerPage = 10;
        
        // رفع الصورة إلى Base64
        function uploadImageToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        // Initialize sidebar
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = createSidebar('players');
            initSidebar();
            setupMobileSidebar();
        }
        
        // Set current date
        const now = new Date();
        const currentDateElem = document.getElementById('currentDate');
        if (currentDateElem) {
            currentDateElem.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        
        // جلب جميع المستخدمين واللاعبين ودمجهم
        async function loadPlayers() {
            try {
                const usersResult = await getAllUsers();
                let users = [];
                if (usersResult.success && usersResult.data) {
                    users = usersResult.data.filter(u => u.user_type === 'player');
                    console.log('اللاعبين (من المستخدمين):', users);
                }
                
                const playersResult = await getAllPlayers();
                let players = [];
                if (playersResult.success && playersResult.data) {
                    players = playersResult.data;
                    console.log('بيانات اللاعبين الرياضية:', players);
                }
                
                const combinedData = users.map(user => {
                    const playerData = players.find(p => p.id === user.id);
                    return {
                        id: user.id,
                        name: user.name || 'غير محدد',
                        email: user.email || 'غير محدد',
                        phone: user.phone || '',
                        imgPath: user.imgPath || '',
                        age: playerData?.age || 0,
                        height: playerData?.height || 0,
                        weight: playerData?.weight || 0,
                        sport: playerData?.sport || 'غير محدد'
                    };
                });
                
                allPlayersData = combinedData;
                console.log('البيانات المدمجة:', allPlayersData);
                renderTable();
            } catch (error) {
                console.error('خطأ في تحميل البيانات:', error);
                showToast('حدث خطأ في تحميل البيانات', 'error');
            }
        }
        
        // حفظ اللاعب (إضافة أو تعديل)
        async function savePlayer() {
            const playerId = document.getElementById('playerId').value;
            const isEdit = !!playerId;
            
            const preview = document.getElementById('imagePreview');
            
            // بناء بيانات المستخدم
            const userData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                user_type: 'player'
            };
            
            // معالجة الصورة
            const hasNewImage = preview.src && 
                                preview.classList.contains('show') && 
                                preview.src !== '' &&
                                !preview.src.includes(window.location.hostname);
            
            const hasOldImage = isEdit && document.getElementById('oldImagePath').value;
            
            if (hasNewImage) {
                userData.imgPath = preview.src;
            } else if (hasOldImage && !hasNewImage) {
                userData.imgPath = document.getElementById('oldImagePath').value;
            }
            
            const password = document.getElementById('password').value;
            if (!isEdit && !password) {
                showToast('الرجاء إدخال كلمة المرور للاعب الجديد', 'warning');
                return;
            }
            if (password) {
                userData.password = password;
            }
            
            // بناء بيانات اللاعب الرياضية
            const playerData = {
                age: parseInt(document.getElementById('age').value) || 0,
                height: parseInt(document.getElementById('height').value) || 0,
                weight: parseFloat(document.getElementById('weight').value) || 0,
                sport: document.getElementById('sport').value
            };
            
            // التحقق من الحقول المطلوبة
            if (!userData.name || !userData.email) {
                showToast('الرجاء ملء الاسم والبريد الإلكتروني', 'warning');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                showToast('الرجاء إدخال بريد إلكتروني صحيح', 'warning');
                return;
            }
            
            try {
                if (!isEdit) {
                    // إضافة جديدة
                    const userResult = await addUser(userData);
                    if (!userResult.success) {
                        showToast(userResult.message || 'خطأ في إضافة المستخدم', 'error');
                        return;
                    }
                    const newUserId = userResult.id;
                    
                    playerData.id = newUserId;
                    const playerResult = await addPlayer(playerData);
                    
                    if (playerResult.success) {
                        showToast('تم إضافة اللاعب بنجاح', 'success');
                        closeModal();
                        await loadPlayers();
                    } else {
                        showToast(playerResult.message || 'خطأ في إضافة بيانات اللاعب', 'error');
                    }
                } else {
                    // تعديل بيانات
                    const updateUserData = { ...userData };
                    if (!password) {
                        delete updateUserData.password;
                    }
                    
                    const userResult = await updateUser(playerId, updateUserData);
                    if (!userResult.success) {
                        showToast(userResult.message || 'خطأ في تحديث المستخدم', 'error');
                        return;
                    }
                    
                    const playerResult = await updatePlayer(playerId, playerData);
                    if (playerResult.success) {
                        showToast('تم تحديث اللاعب بنجاح', 'success');
                        closeModal();
                        await loadPlayers();
                    } else {
                        showToast(playerResult.message || 'خطأ في تحديث بيانات اللاعب', 'error');
                    }
                }
            } catch (error) {
                console.error('خطأ في الحفظ:', error);
                showToast('حدث خطأ غير متوقع', 'error');
            }
        }
        
        // عرض إحصائيات اللاعب
        async function showPlayerStats(id, name) {
            currentStatsPlayerId = id;
            document.getElementById('statsModalTitle').textContent = `إحصائيات - ${name}`;
            
            const statsContainer = document.getElementById('statsContainer');
            statsContainer.innerHTML = '<div class="text-center"><i class="fa-solid fa-spinner fa-pulse"></i> جاري التحميل...</div>';
            
            try {
                // هنا يمكنك جلب الإحصائيات من خدمات مختلفة
                // مثلاً: عدد المواعيد، عدد الإصابات، إلخ.
                
                // مؤقتاً نعرض إحصائيات وهمية
                statsContainer.innerHTML = `
                    <div class="stat-card">
                        <i class="fa-regular fa-calendar-check"></i>
                        <div class="stat-number">0</div>
                        <div class="stat-label">عدد المواعيد السابقة</div>
                    </div>
                    <div class="stat-card">
                        <i class="fa-solid fa-notes-medical"></i>
                        <div class="stat-number">0</div>
                        <div class="stat-label">عدد الإصابات المسجلة</div>
                    </div>
                    <div class="stat-card">
                        <i class="fa-solid fa-chart-line"></i>
                        <div class="stat-number">0</div>
                        <div class="stat-label">خطط التأهيل النشطة</div>
                    </div>
                    <div class="stat-card">
                        <i class="fa-regular fa-clock"></i>
                        <div class="stat-number">0</div>
                        <div class="stat-label">مواعيد قادمة</div>
                    </div>
                `;
                
                document.getElementById('statsModal').classList.add('open');
            } catch (error) {
                console.error('خطأ في تحميل الإحصائيات:', error);
                showToast('حدث خطأ في تحميل الإحصائيات', 'error');
            }
        }
        
        // حذف اللاعب
        async function confirmDelete() {
            if (!pendingDeleteId) return;
            
            try {
                await deletePlayer(pendingDeleteId);
                await deleteUser(pendingDeleteId);
                
                showToast('تم حذف اللاعب بنجاح', 'success');
                closeDeleteModal();
                await loadPlayers();
            } catch (error) {
                console.error('خطأ في الحذف:', error);
                showToast('حدث خطأ في حذف اللاعب', 'error');
            }
        }
        
        function renderTable() {
            const tbody = document.getElementById('playersTableBody');
            if (!tbody) return;
            
            let filtered = allPlayersData;
            
            // بحث
            if (searchTerm) {
                filtered = filtered.filter(p => 
                    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // فلتر حسب الرياضة
            if (sportFilter) {
                filtered = filtered.filter(p => p.sport === sportFilter);
            }
            
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = filtered.slice(start, start + itemsPerPage);
            
            renderPagination(totalPages);
            
            if (paginated.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="8">
                        <div class="empty-state">
                            <i class="fa-regular fa-user"></i>
                            <p>لا يوجد لاعبين</p>
                            <button class="btn-add" id="emptyAddBtn" style="margin-top: 15px;">
                                <i class="fa-solid fa-plus"></i> أضف أول لاعب
                            </button>
                        </div>
                    </td></tr>
                `;
                const emptyAddBtn = document.getElementById('emptyAddBtn');
                if (emptyAddBtn) emptyAddBtn.onclick = () => openAddModal();
                return;
            }
            
            tbody.innerHTML = paginated.map(p => {
                const isValidImage = p.imgPath && 
                                    p.imgPath !== '' && 
                                    !p.imgPath.includes(window.location.hostname) && 
                                    p.imgPath.startsWith('data:image');
                
                return `
                    <tr>
                        <td>
                            ${isValidImage ? 
                                `<img src="${p.imgPath}" class="player-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                                `<div class="player-image" style="background: var(--gray-200); display: flex; align-items: center; justify-content: center;"><i class="fa-regular fa-user" style="color: var(--gray-500);"></i></div>`
                            }
                        </td>
                        <td><strong>${escapeHtml(p.name)}</strong></td>
                        <td>${escapeHtml(p.email)}</td>
                        <td>${p.phone || '-'}</td>
                        <td><span class="badge badge-player">${escapeHtml(p.sport)}</span></td>
                        <td>${p.age || '-'} سنة</td>
                        <td>${p.height || '-'} سم / ${p.weight || '-'} كجم</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon btn-stats" onclick="window.showPlayerStats('${p.id}', '${escapeHtml(p.name).replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-chart-simple"></i> إحصائيات
                                </button>
                                <button class="btn-icon btn-edit" onclick="window.editPlayer('${p.id}')">
                                    <i class="fa-solid fa-pen"></i> تعديل
                                </button>
                                <button class="btn-icon btn-delete" onclick="window.openDeleteModal('${p.id}', '${escapeHtml(p.name).replace(/'/g, "\\'")}')">
                                    <i class="fa-solid fa-trash"></i> حذف
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
        
        // البحث
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderTable();
            });
        }
        
        // فلتر الرياضة
        const sportFilterSelect = document.getElementById('sportFilter');
        if (sportFilterSelect) {
            sportFilterSelect.addEventListener('change', (e) => {
                sportFilter = e.target.value;
                currentPage = 1;
                renderTable();
            });
        }
        
        // فتح مودال الإضافة
        window.openAddModal = () => {
            document.getElementById('modalTitle').textContent = 'إضافة لاعب جديد';
            document.getElementById('playerForm').reset();
            document.getElementById('playerId').value = '';
            document.getElementById('oldImagePath').value = '';
            document.getElementById('password').required = true;
            document.getElementById('password').placeholder = 'أدخل كلمة المرور';
            document.getElementById('passwordRequired').style.display = 'inline';
            document.getElementById('age').value = '0';
            document.getElementById('height').value = '0';
            document.getElementById('weight').value = '0';
            document.getElementById('imagePreview').classList.remove('show');
            document.getElementById('imagePreview').src = '';
            document.getElementById('playerModal').classList.add('open');
        };
        
        // تعديل لاعب
        window.editPlayer = async (id) => {
            try {
                // التحقق من وجود العنصر oldImagePath
                let oldImagePathInput = document.getElementById('oldImagePath');
                if (!oldImagePathInput) {
                    const form = document.getElementById('playerForm');
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = 'oldImagePath';
                    form.appendChild(hiddenInput);
                    oldImagePathInput = hiddenInput;
                }
                
                const playerResult = await getPlayerById(id);
                if (!playerResult.success || !playerResult.data) {
                    showToast('حدث خطأ في تحميل بيانات اللاعب', 'error');
                    return;
                }
                
                const player = playerResult.data;
                
                const usersResult = await getAllUsers();
                let userData = null;
                if (usersResult.success && usersResult.data) {
                    userData = usersResult.data.find(u => u.id === id);
                }
                
                document.getElementById('modalTitle').textContent = 'تعديل بيانات اللاعب';
                document.getElementById('playerId').value = player.id;
                document.getElementById('name').value = userData?.name || '';
                document.getElementById('email').value = userData?.email || '';
                document.getElementById('phone').value = userData?.phone || '';
                document.getElementById('age').value = player.age || 0;
                document.getElementById('height').value = player.height || 0;
                document.getElementById('weight').value = player.weight || 0;
                document.getElementById('sport').value = player.sport || '';
                document.getElementById('password').required = false;
                document.getElementById('password').value = '';
                document.getElementById('password').placeholder = 'اتركها فارغة للحفاظ على كلمة المرور الحالية';
                document.getElementById('passwordRequired').style.display = 'none';
                
                // حفظ مسار الصورة القديمة
                if (userData?.imgPath && userData.imgPath !== '') {
                    oldImagePathInput.value = userData.imgPath;
                    const preview = document.getElementById('imagePreview');
                    preview.src = userData.imgPath;
                    preview.classList.add('show');
                } else {
                    oldImagePathInput.value = '';
                    document.getElementById('imagePreview').classList.remove('show');
                    document.getElementById('imagePreview').src = '';
                }
                
                document.getElementById('playerModal').classList.add('open');
            } catch (error) {
                console.error('خطأ في تحميل بيانات اللاعب:', error);
                showToast('حدث خطأ في تحميل بيانات اللاعب', 'error');
            }
        };
        
        // رفع الصورة
        const imageFileInput = document.getElementById('imageFile');
        if (imageFileInput) {
            imageFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        showToast('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning');
                        return;
                    }
                    try {
                        const base64 = await uploadImageToBase64(file);
                        const preview = document.getElementById('imagePreview');
                        preview.src = base64;
                        preview.classList.add('show');
                    } catch (error) {
                        showToast('حدث خطأ في رفع الصورة', 'error');
                    }
                }
            });
        }
        
        // فتح مودال الحذف
        window.openDeleteModal = (id, name) => {
            pendingDeleteId = id;
            document.getElementById('deletePlayerName').textContent = `"${name}"`;
            document.getElementById('deleteModal').classList.add('open');
        };
        
        window.closeModal = () => {
            document.getElementById('playerModal').classList.remove('open');
            document.getElementById('oldImagePath').value = '';
            if (imageFileInput) imageFileInput.value = '';
        };
        
        window.closeDeleteModal = () => {
            document.getElementById('deleteModal').classList.remove('open');
            pendingDeleteId = null;
        };
        
        window.closeStatsModal = () => {
            document.getElementById('statsModal').classList.remove('open');
            currentStatsPlayerId = null;
        };
        
        // جعل الدوال متاحة في النطاق العام
        window.showPlayerStats = showPlayerStats;
        window.editPlayer = window.editPlayer;
        window.openDeleteModal = window.openDeleteModal;
        window.openAddModal = window.openAddModal;
        window.closeModal = window.closeModal;
        window.closeDeleteModal = window.closeDeleteModal;
        window.closeStatsModal = window.closeStatsModal;
        window.goToPage = window.goToPage;
        
        // إضافة مستمعي الأحداث
        const modal = document.getElementById('playerModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        const statsModal = document.getElementById('statsModal');
        if (statsModal) {
            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) closeStatsModal();
            });
        }
        
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) closeDeleteModal();
            });
        }
        
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) saveBtn.addEventListener('click', savePlayer);
        
        const openAddBtn = document.getElementById('openAddModalBtn');
        if (openAddBtn) openAddBtn.addEventListener('click', () => window.openAddModal());
        
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);
        
        // تحميل اللاعبين عند بدء التشغيل
        loadPlayers();
