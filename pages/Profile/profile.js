import { getCurrentUser, updateUser, getUserById } from '../../../services/user_services.js';
import { getPlayerById, updatePlayer } from '../../../services/player_services.js';
import { getSpecialistById, updateSpecialist } from '../../../services/specialist_services.js';
import { showToast } from '../../../shared/js/toaster.js';

let currentUser = null;
let isEditing = false;
let userSpecificData = null;
let selectedImageFile = null;
let removeImage = false;

// تحويل الصورة إلى Base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function loadProfile() {
    // إظهار شاشة التحميل
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'flex';
    
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        setTimeout(() => window.location.href = '/index.html', 1500);
        return;
    }
    
    await loadFullUserData();
    
    // إخفاء شاشة التحميل وإظهار المحتوى بعد ما البيانات تتحمل
    if (loadingState) loadingState.style.display = 'none';
    const profileContent = document.getElementById('profileContent');
    if (profileContent) profileContent.style.display = 'block';
}

async function loadFullUserData() {
    try {
        // جلب بيانات المستخدم
        const userResult = await getUserById(currentUser.id);
        
        if (userResult.success) {
            currentUser = userResult.data;
            displayUserInfo(currentUser);
        }
        
        const userType = currentUser.user_type || currentUser.userType;
        
        // جلب بيانات اللاعب
        if (userType === 'player') {
            const playerResult = await getPlayerById(currentUser.id);
            if (playerResult.success) {
                userSpecificData = playerResult.data;
            } else {
                userSpecificData = { sport: '', age: '', height: '', weight: '' };
            }
            displayPlayerInfo(userSpecificData);
            const playerSection = document.getElementById('playerSection');
            if (playerSection) playerSection.style.display = 'block';
        }
        
        // جلب بيانات الأخصائي
        else if (userType === 'specialist') {
            const specialistResult = await getSpecialistById(currentUser.id);
            if (specialistResult.success) {
                userSpecificData = specialistResult.data;
            } else {
                userSpecificData = { 
                    specialization: '', 
                    experience: '', 
                    qualification: '', 
                    clinic_address: '' 
                };
            }
            displaySpecialistInfo(userSpecificData);
            const specialistSection = document.getElementById('specialistSection');
            if (specialistSection) specialistSection.style.display = 'block';
        }
        
    } catch (error) {
        console.error(error);
        showToast('حدث خطأ في تحميل البيانات', 'error');
    }
}

function displayUserInfo(user) {
    const userName = document.getElementById('userName');
    const nameDisplay = document.getElementById('nameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const userTypeSpan = document.getElementById('userType');
    
    if (userName) userName.textContent = user.name || 'مستخدم';
    if (nameDisplay) nameDisplay.textContent = user.name || '';
    if (emailDisplay) emailDisplay.textContent = user.email || '';
    if (phoneDisplay) phoneDisplay.textContent = user.phone || '';
    
    const userType = user.user_type || user.userType;
    const typeText = {
        'admin': 'مدير النظام',
        'player': 'لاعب',
        'specialist': 'أخصائي'
    }[userType] || 'مستخدم';
    
    if (userTypeSpan) userTypeSpan.textContent = typeText;
    
    // عرض الصورة
    const avatarContainer = document.getElementById('avatarContainer');
    if (avatarContainer) {
        if (user.imgPath && user.imgPath !== '' && user.imgPath !== 'null' && user.imgPath !== 'undefined') {
            avatarContainer.innerHTML = `<img src="${user.imgPath}" alt="صورة المستخدم" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            avatarContainer.innerHTML = '<i class="fa-regular fa-user fa-3x"></i>';
        }
    }
}

function displayPlayerInfo(player) {
    const sportDisplay = document.getElementById('sportDisplay');
    const ageDisplay = document.getElementById('ageDisplay');
    const heightDisplay = document.getElementById('heightDisplay');
    const weightDisplay = document.getElementById('weightDisplay');
    
    if (sportDisplay) sportDisplay.textContent = player.sport || 'غير محدد';
    if (ageDisplay) ageDisplay.textContent = player.age || 'غير محدد';
    if (heightDisplay) heightDisplay.textContent = player.height || 'غير محدد';
    if (weightDisplay) weightDisplay.textContent = player.weight || 'غير محدد';
    
    const sportInput = document.getElementById('sportInput');
    const ageInput = document.getElementById('ageInput');
    const heightInput = document.getElementById('heightInput');
    const weightInput = document.getElementById('weightInput');
    
    if (sportInput) sportInput.value = player.sport || '';
    if (ageInput) ageInput.value = player.age || '';
    if (heightInput) heightInput.value = player.height || '';
    if (weightInput) weightInput.value = player.weight || '';
}

function displaySpecialistInfo(specialist) {
    const specializationDisplay = document.getElementById('specializationDisplay');
    const experienceDisplay = document.getElementById('experienceDisplay');
    const qualificationDisplay = document.getElementById('qualificationDisplay');
    const clinicAddressDisplay = document.getElementById('clinicAddressDisplay');
    
    if (specializationDisplay) specializationDisplay.textContent = specialist.specialization || 'غير محدد';
    if (experienceDisplay) experienceDisplay.textContent = specialist.experience || 'غير محدد';
    if (qualificationDisplay) qualificationDisplay.textContent = specialist.qualification || 'غير محدد';
    if (clinicAddressDisplay) clinicAddressDisplay.textContent = specialist.clinic_address || 'غير محدد';
    
    const specializationInput = document.getElementById('specializationInput');
    const experienceInput = document.getElementById('experienceInput');
    const qualificationInput = document.getElementById('qualificationInput');
    const clinicAddressInput = document.getElementById('clinicAddressInput');
    
    if (specializationInput) specializationInput.value = specialist.specialization || '';
    if (experienceInput) experienceInput.value = specialist.experience || '';
    if (qualificationInput) qualificationInput.value = specialist.qualification || '';
    if (clinicAddressInput) clinicAddressInput.value = specialist.clinic_address || '';
}

// دالة مساعدة لجلب القيمة الحالية من البيانات
function getCurrentFieldValue(field) {
    switch(field) {
        case 'name': return currentUser?.name || '';
        case 'email': return currentUser?.email || '';
        case 'phone': return currentUser?.phone || '';
        case 'sport': return userSpecificData?.sport || '';
        case 'age': return userSpecificData?.age || '';
        case 'height': return userSpecificData?.height || '';
        case 'weight': return userSpecificData?.weight || '';
        case 'specialization': return userSpecificData?.specialization || '';
        case 'experience': return userSpecificData?.experience || '';
        case 'qualification': return userSpecificData?.qualification || '';
        case 'clinicAddress': return userSpecificData?.clinic_address || '';
        default: return '';
    }
}

// دالة toggleField المعدلة - دي أهم حاجة
function toggleField(field, isEditingMode) {
    const displayElem = document.getElementById(`${field}Display`);
    const inputElem = document.getElementById(`${field}Input`);
    
    if (displayElem && inputElem) {
        if (isEditingMode) {
            displayElem.style.display = 'none';
            inputElem.style.display = 'block';
            // هنا بنحط القيمة الحالية في الـ input
            const currentValue = getCurrentFieldValue(field);
            inputElem.value = currentValue;
        } else {
            displayElem.style.display = 'block';
            inputElem.style.display = 'none';
            // بنحدث القيمة المعروضة من الـ input
            if (inputElem.value && inputElem.value.trim() !== '') {
                displayElem.textContent = inputElem.value;
            }
        }
    }
}

function enableEditing() {
    isEditing = true;
    
    // إظهار أزرار الصورة
    const avatarActions = document.getElementById('avatarActions');
    if (avatarActions) avatarActions.style.display = 'flex';
    
    // تبديل الحقول الأساسية - دلوقتي الحقول هتظهر وفيها القيم
    toggleField('name', true);
    toggleField('email', true);
    toggleField('phone', true);
    
    const passwordField = document.getElementById('passwordField');
    if (passwordField) passwordField.style.display = 'block';
    
    const userType = currentUser.user_type || currentUser.userType;
    
    if (userType === 'player') {
        toggleField('sport', true);
        toggleField('age', true);
        toggleField('height', true);
        toggleField('weight', true);
    }
    
    if (userType === 'specialist') {
        toggleField('specialization', true);
        toggleField('experience', true);
        toggleField('qualification', true);
        toggleField('clinicAddress', true);
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editToggleBtn = document.getElementById('editToggleBtn');
    
    if (saveBtn) saveBtn.style.display = 'flex';
    if (cancelBtn) cancelBtn.style.display = 'flex';
    if (editToggleBtn) editToggleBtn.innerHTML = '<i class="fa-regular fa-eye"></i> عرض الملف';
}

function disableEditing() {
    isEditing = false;
    
    // إخفاء أزرار الصورة
    const avatarActions = document.getElementById('avatarActions');
    if (avatarActions) avatarActions.style.display = 'none';
    selectedImageFile = null;
    removeImage = false;
    
    // إعادة عرض الحقول الأساسية
    toggleField('name', false);
    toggleField('email', false);
    toggleField('phone', false);
    
    const passwordField = document.getElementById('passwordField');
    if (passwordField) passwordField.style.display = 'none';
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) passwordInput.value = '';
    
    const userType = currentUser.user_type || currentUser.userType;
    
    if (userType === 'player') {
        toggleField('sport', false);
        toggleField('age', false);
        toggleField('height', false);
        toggleField('weight', false);
    }
    
    if (userType === 'specialist') {
        toggleField('specialization', false);
        toggleField('experience', false);
        toggleField('qualification', false);
        toggleField('clinicAddress', false);
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editToggleBtn = document.getElementById('editToggleBtn');
    
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (editToggleBtn) editToggleBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> تعديل الملف الشخصي';
    
    // إعادة عرض الصورة الأصلية
    displayUserInfo(currentUser);
}

async function saveChanges() {
    if (!navigator.onLine) {
        showToast('لا يوجد اتصال بالإنترنت', 'error');
        return;
    }
    
    showToast('جاري حفظ التغييرات...', 'info', 1500);
    
    try {
        // جمع البيانات من الـ inputs
        const nameInput = document.getElementById('nameInput');
        const emailInput = document.getElementById('emailInput');
        const phoneInput = document.getElementById('phoneInput');
        const passwordInput = document.getElementById('passwordInput');
        
        const userUpdates = {
            name: nameInput ? nameInput.value : currentUser.name,
            email: emailInput ? emailInput.value : currentUser.email,
            phone: phoneInput ? phoneInput.value : currentUser.phone
        };
        
        if (userUpdates.email && !userUpdates.email.includes('@')) {
            showToast('البريد الإلكتروني غير صحيح', 'error');
            return;
        }
        
        const newPassword = passwordInput ? passwordInput.value : '';
        if (newPassword && newPassword.length < 6) {
            showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        if (newPassword) {
            userUpdates.password = newPassword;
        }
        
        // معالجة الصورة
        if (removeImage) {
            userUpdates.imgPath = '';
        } else if (selectedImageFile) {
            const base64Image = await imageToBase64(selectedImageFile);
            userUpdates.imgPath = base64Image;
        }
        
        const userResult = await updateUser(currentUser.id, userUpdates);
        if (!userResult.success) {
            showToast(userResult.message || 'فشل حفظ البيانات', 'error');
            return;
        }
        
        const userType = currentUser.user_type || currentUser.userType;
        let specificResult = null;
        
        if (userType === 'player') {
            const sportInput = document.getElementById('sportInput');
            const ageInput = document.getElementById('ageInput');
            const heightInput = document.getElementById('heightInput');
            const weightInput = document.getElementById('weightInput');
            
            const playerUpdates = {
                sport: sportInput ? sportInput.value : (userSpecificData?.sport || ''),
                age: parseInt(ageInput?.value) || (userSpecificData?.age || 0),
                height: parseInt(heightInput?.value) || (userSpecificData?.height || 0),
                weight: parseInt(weightInput?.value) || (userSpecificData?.weight || 0)
            };
            specificResult = await updatePlayer(currentUser.id, playerUpdates);
            if (specificResult.success && userSpecificData) {
                userSpecificData = { ...userSpecificData, ...playerUpdates };
            }
        } 
        else if (userType === 'specialist') {
            const specializationInput = document.getElementById('specializationInput');
            const experienceInput = document.getElementById('experienceInput');
            const qualificationInput = document.getElementById('qualificationInput');
            const clinicAddressInput = document.getElementById('clinicAddressInput');
            
            const specialistUpdates = {
                specialization: specializationInput ? specializationInput.value : (userSpecificData?.specialization || ''),
                experience: experienceInput ? experienceInput.value : (userSpecificData?.experience || ''),
                qualification: qualificationInput ? qualificationInput.value : (userSpecificData?.qualification || ''),
                clinic_address: clinicAddressInput ? clinicAddressInput.value : (userSpecificData?.clinic_address || '')
            };
            specificResult = await updateSpecialist(currentUser.id, specialistUpdates);
            if (specificResult.success && userSpecificData) {
                userSpecificData = { ...userSpecificData, ...specialistUpdates };
            }
        }
        
        if (specificResult && !specificResult.success) {
            showToast(specificResult.message || 'فشل حفظ البيانات الإضافية', 'error');
            return;
        }
        
        // تحديث currentUser
        const updatedUser = userResult.data;
        updatedUser.user_type = userType;
        if (userUpdates.imgPath !== undefined) {
            updatedUser.imgPath = userUpdates.imgPath;
        }
        currentUser = updatedUser;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // تحديث العرض
        displayUserInfo(currentUser);
        if (userType === 'player' && userSpecificData) {
            displayPlayerInfo(userSpecificData);
        } else if (userType === 'specialist' && userSpecificData) {
            displaySpecialistInfo(userSpecificData);
        }
        
        showToast('تم حفظ التغييرات بنجاح!', 'success');
        
        disableEditing();
        
        selectedImageFile = null;
        removeImage = false;
        
    } catch (error) {
        console.error(error);
        showToast('حدث خطأ أثناء حفظ التغييرات', 'error');
    }
}

function logout() {
    showToast('جاري تسجيل الخروج...', 'info');
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    }, 1000);
}

// ربط الأحداث
document.addEventListener('DOMContentLoaded', () => {
    const editToggleBtn = document.getElementById('editToggleBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', () => {
            if (isEditing) disableEditing();
            else enableEditing();
        });
    }
    
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);
    if (cancelBtn) cancelBtn.addEventListener('click', disableEditing);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // أحداث الصورة
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
                selectedImageFile = file;
                removeImage = false;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const avatarContainer = document.getElementById('avatarContainer');
                    if (avatarContainer) {
                        avatarContainer.innerHTML = `<img src="${event.target.result}" alt="صورة المستخدم" style="width:100%; height:100%; object-fit:cover;">`;
                    }
                };
                reader.readAsDataURL(file);
                showToast('تم اختيار الصورة، اضغط حفظ لتحديثها', 'success');
            } else {
                showToast('يرجى اختيار صورة بصيغة JPG أو PNG', 'error');
            }
        });
    }
    
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            removeImage = true;
            selectedImageFile = null;
            const avatarContainer = document.getElementById('avatarContainer');
            if (avatarContainer) {
                avatarContainer.innerHTML = '<i class="fa-regular fa-user fa-3x"></i>';
            }
            showToast('تم حذف الصورة، اضغط حفظ لتأكيد الحذف', 'info');
        });
    }
    
    loadProfile();
});