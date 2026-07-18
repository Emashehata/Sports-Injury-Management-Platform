import { requireAdmin } from '../../services/user_services.js';
import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
import { showToast } from '../../shared/js/toaster.js';
import { 
    getAllSpecialists, 
    addSpecialist, 
    updateSpecialist, 
    deleteSpecialist,
    getSpecialistById
} from '../../services/specialist_services.js';
import { getAllUsers, addUser, updateUser, deleteUser } from '../../services/user_services.js';

if (!requireAdmin()) {
    window.location.href = '../../index.html';
}

let allSpecialistsData = [];
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

const sidebarContainer = document.getElementById('sidebar-container');
if (sidebarContainer) {
    sidebarContainer.innerHTML = createSidebar('specialists');
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

async function loadSpecialists() {
    try {
        const usersResult = await getAllUsers();
        let users = [];
        if (usersResult.success && usersResult.data) {
            users = usersResult.data;
        }
        
        const specialistsResult = await getAllSpecialists();
        let specialists = [];
        if (specialistsResult.success && specialistsResult.data) {
            specialists = specialistsResult.data;
        }
        
        const combinedData = specialists.map(specialist => {
            const user = users.find(u => u.id === specialist.id);
            return {
                id: specialist.id,
                name: user?.name || 'غير محدد',
                email: user?.email || 'غير محدد',
                phone: user?.phone || '',
                imgPath: user?.imgPath || '',
                specialization: specialist.specialization || 'غير محدد',
                experience: specialist.experience || 0,
                qualification: specialist.qualification || 'غير محدد',
                clinic_address: specialist.clinic_address || ''
            };
        });
        
        allSpecialistsData = combinedData;
        console.log('البيانات المدمجة:', allSpecialistsData);
        renderTable();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showToast('حدث خطأ في تحميل البيانات', 'error');
    }
}

async function saveSpecialist() {
    const specialistId = document.getElementById('specialistId').value;
    const isEdit = !!specialistId;
    
    const preview = document.getElementById('imagePreview');
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();
    const phoneInput = document.getElementById('phone').value.trim();
    
    const userData = {
        name: nameInput,
        email: emailInput,
        phone: phoneInput,
        user_type: 'specialist'
    };
    
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
        showToast('الرجاء إدخال كلمة المرور للأخصائي الجديد', 'warning');
        return;
    }
    if (password) {
        userData.password = password;
    }
    
    const specialistData = {
        qualification: document.getElementById('qualification').value.trim(),
        experience: parseInt(document.getElementById('experience').value) || 0,
        specialization: document.getElementById('specialization').value,
        clinic_address: document.getElementById('clinic_address').value.trim()
    };
    
    if (!userData.name || !userData.email || !specialistData.specialization) {
        showToast('الرجاء ملء جميع الحقول المطلوبة (*)', 'warning');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showToast('الرجاء إدخال بريد إلكتروني صحيح', 'warning');
        return;
    }
    
    try {
        if (!isEdit) {
            const userResult = await addUser(userData);
            if (!userResult.success) {
                showToast(userResult.message || 'خطأ في إضافة المستخدم', 'error');
                return;
            }
            const newUserId = userResult.id;
            
            specialistData.id = newUserId;
            const specialistResult = await addSpecialist(specialistData);
            
            if (specialistResult.success) {
                showToast('تم إضافة الأخصائي بنجاح', 'success');
                closeModal();
                await loadSpecialists();
            } else {
                showToast(specialistResult.message || 'خطأ في إضافة بيانات الأخصائي', 'error');
            }
        } else {
            const updateUserData = { ...userData };
            if (!password) {
                delete updateUserData.password;
            }
            
            const userResult = await updateUser(specialistId, updateUserData);
            if (!userResult.success) {
                showToast(userResult.message || 'خطأ في تحديث المستخدم', 'error');
                return;
            }
            
            const specialistResult = await updateSpecialist(specialistId, specialistData);
            if (specialistResult.success) {
                showToast('تم تحديث الأخصائي بنجاح', 'success');
                closeModal();
                await loadSpecialists();
            } else {
                showToast(specialistResult.message || 'خطأ في تحديث بيانات الأخصائي', 'error');
            }
        }
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        showToast('حدث خطأ غير متوقع', 'error');
    }
}

async function confirmDelete() {
    if (!pendingDeleteId) return;
    
    try {
        await deleteSpecialist(pendingDeleteId);
        await deleteUser(pendingDeleteId);
        
        showToast('تم حذف الأخصائي بنجاح', 'success');
        closeDeleteModal();
        await loadSpecialists();
    } catch (error) {
        console.error('خطأ في الحذف:', error);
        showToast('حدث خطأ في حذف الأخصائي', 'error');
    }
}

function renderTable() {
    const tbody = document.getElementById('specialistsTableBody');
    if (!tbody) return;
    
    let filtered = allSpecialistsData;
    if (searchTerm) {
        filtered = allSpecialistsData.filter(s => 
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
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
                    <p>لا توجد أخصائيين</p>
                    <button class="btn-add" id="emptyAddBtn" style="margin-top: 15px;">
                        <i class="fa-solid fa-plus"></i> أضف أول أخصائي
                    </button>
                </div>
            </td>
            </tr>
        `;
        const emptyAddBtn = document.getElementById('emptyAddBtn');
        if (emptyAddBtn) emptyAddBtn.onclick = () => openAddModal();
        return;
    }
    
    tbody.innerHTML = paginated.map(s => {
        const isValidImage = s.imgPath && 
                            s.imgPath !== '' && 
                            !s.imgPath.includes(window.location.hostname) && 
                            s.imgPath.startsWith('data:image');
        
        return `
            <tr>
                <td>
                    ${isValidImage ? 
                        `<img src="${s.imgPath}" class="specialist-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                        `<div class="specialist-image" style="background: var(--gray-200); display: flex; align-items: center; justify-content: center;"><i class="fa-regular fa-user" style="color: var(--gray-500);"></i></div>`
                    }
                </td>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.phone)}</td>
                <td><span class="badge badge-specialist">${escapeHtml(s.specialization)}</span></td>
                <td>${s.experience} سنة</td>
                <td>${escapeHtml(s.qualification)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="window.editSpecialist('${s.id}')">
                            <i class="fa-solid fa-pen"></i> تعديل
                        </button>
                        <button class="btn-icon btn-delete" onclick="window.openDeleteModal('${s.id}', '${escapeHtml(s.name).replace(/'/g, "\\'")}')">
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

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        currentPage = 1;
        renderTable();
    });
}

window.openAddModal = () => {
    document.getElementById('modalTitle').textContent = 'إضافة أخصائي جديد';
    document.getElementById('specialistForm').reset();
    document.getElementById('specialistId').value = '';
    document.getElementById('oldImagePath').value = '';
    document.getElementById('password').required = true;
    document.getElementById('password').placeholder = 'أدخل كلمة المرور';
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('experience').value = '0';
    document.getElementById('imagePreview').classList.remove('show');
    document.getElementById('imagePreview').src = '';
    document.getElementById('specialistModal').classList.add('open');
};

window.editSpecialist = async (id) => {
    try {
        const specialistResult = await getSpecialistById(id);
        if (!specialistResult.success || !specialistResult.data) {
            showToast('حدث خطأ في تحميل بيانات الأخصائي', 'error');
            return;
        }
        
        const specialist = specialistResult.data;
        
        const usersResult = await getAllUsers();
        let userData = null;
        if (usersResult.success && usersResult.data) {
            userData = usersResult.data.find(u => u.id === id);
        }
        
        document.getElementById('modalTitle').textContent = 'تعديل بيانات الأخصائي';
        document.getElementById('specialistId').value = specialist.id;
        document.getElementById('name').value = userData?.name || '';
        document.getElementById('email').value = userData?.email || '';
        document.getElementById('phone').value = userData?.phone || '';
        document.getElementById('specialization').value = specialist.specialization || '';
        document.getElementById('experience').value = specialist.experience || 0;
        document.getElementById('qualification').value = specialist.qualification || '';
        document.getElementById('clinic_address').value = specialist.clinic_address || '';
        document.getElementById('password').required = false;
        document.getElementById('password').value = '';
        document.getElementById('password').placeholder = 'اتركها فارغة للحفاظ على كلمة المرور الحالية';
        document.getElementById('passwordRequired').style.display = 'none';
        
        const oldImagePathInput = document.getElementById('oldImagePath');
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
        
        document.getElementById('specialistModal').classList.add('open');
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأخصائي:', error);
        showToast('حدث خطأ في تحميل بيانات الأخصائي', 'error');
    }
};

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

window.openDeleteModal = (id, name) => {
    pendingDeleteId = id;
    document.getElementById('deleteSpecialistName').textContent = `"${name}"`;
    document.getElementById('deleteModal').classList.add('open');
};

window.closeModal = () => {
    document.getElementById('specialistModal').classList.remove('open');
    document.getElementById('oldImagePath').value = '';
    if (imageFileInput) imageFileInput.value = '';
};

window.closeDeleteModal = () => {
    document.getElementById('deleteModal').classList.remove('open');
    pendingDeleteId = null;
};

const modal = document.getElementById('specialistModal');
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

const deleteModal = document.getElementById('deleteModal');
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) saveBtn.addEventListener('click', saveSpecialist);

const openAddBtn = document.getElementById('openAddModalBtn');
if (openAddBtn) openAddBtn.addEventListener('click', () => window.openAddModal());

const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);

loadSpecialists();