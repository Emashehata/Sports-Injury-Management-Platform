import { requireAdmin } from '../../services/user_services.js';
import { createSidebar, initSidebar, setupMobileSidebar } from '../../shared/js/sidebar.js';
import {
  getAllInjuries,
  addInjury,
  updateInjury,
  deleteInjury
} from '../../services/injury_services.js';
import { showToast } from '../../shared/js/toaster.js';

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

if (!requireAdmin()) {
  window.location.href = '../../index.html';
}

let allInjuries = [];
let currentInjuryId = null;
let currentPage = 1;
let searchTerm = '';
let pendingDeleteId = null;
const itemsPerPage = 10;
let usersMap = {};

document.getElementById('sidebar-container').innerHTML = createSidebar('injuries');
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

async function loadUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users.json`);
    const data = await res.json();

    if (!data) {
      usersMap = {};
      return;
    }

    usersMap = Object.entries(data).reduce((acc, [id, user]) => {
      acc[id] = { id, ...user };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error loading users:', error);
    usersMap = {};
  }
}

async function loadInjuries() {
  try {
    const result = await getAllInjuries();

    if (Array.isArray(result)) {
      allInjuries = result;
    } else if (result && result.data && Array.isArray(result.data)) {
      allInjuries = result.data;
    } else {
      allInjuries = [];
    }

    allInjuries = allInjuries.map(injury => ({
      ...injury,
      player_name: usersMap[String(injury.player_id)]?.name || 'غير محدد',
      specialist_name: usersMap[String(injury.specialist_id)]?.name || 'غير محدد'
    }));

    renderTable();
  } catch (error) {
    console.error('Error loading injuries:', error);
    showToast('حدث خطأ في تحميل الإصابات', 'error');
    allInjuries = [];
    renderTable();
  }
}

function renderTable() {
  const tbody = document.getElementById('injuryTableBody');

  let filteredInjuries = allInjuries;
  if (searchTerm) {
    filteredInjuries = allInjuries.filter(injury =>
      (injury.injury_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (injury.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (injury.player_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (injury.specialist_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredInjuries.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedInjuries = filteredInjuries.slice(start, start + itemsPerPage);

  renderPagination(totalPages);

  if (paginatedInjuries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-injury">
            <i class="fa-solid fa-notes-medical"></i>
            <p>لا توجد إصابات</p>
            <button class="btn-add-injury" id="emptyAddBtn" style="margin-top: 15px;">
              <i class="fa-solid fa-plus"></i> أضف أول إصابة
            </button>
          </div>
        </td>
      </tr>
    `;

    const emptyAddBtn = document.getElementById('emptyAddBtn');
    if (emptyAddBtn) emptyAddBtn.onclick = () => openAddModal();
    return;
  }

  tbody.innerHTML = paginatedInjuries.map(injury => `
    <tr>
      <td>
        <span class="injury-type-badge">${injury.injury_type || 'غير محدد'}</span>
      </td>
      <td>
        <span class="diagnosis-preview" title="${injury.diagnosis || ''}">
          ${(injury.diagnosis || '').substring(0, 90)}${(injury.diagnosis || '').length > 90 ? '...' : ''}
        </span>
      </td>
      <td>
        <span class="person-name">${injury.player_name}</span>
      </td>
      <td>
        <span class="person-name">${injury.specialist_name}</span>
      </td>
      <td>${injury.injury_date || 'غير محدد'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon btn-view" onclick="viewInjury('${injury.id}')">
            <i class="fa-solid fa-eye"></i> عرض
          </button>
          <button class="btn-icon btn-edit" onclick="editInjury('${injury.id}')">
            <i class="fa-solid fa-pen"></i> تعديل
          </button>
          <button class="btn-icon btn-delete" onclick="openDeleteModal('${injury.id}', '${(injury.injury_type || '').replace(/'/g, "\\'")}')">
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
    html += `<button class="page-btn-injury ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  paginationDiv.innerHTML = html;
}

window.goToPage = function (page) {
  currentPage = page;
  renderTable();
};

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  currentPage = 1;
  renderTable();
});

window.openAddModal = function () {
  currentInjuryId = null;
  document.getElementById('modalTitle').textContent = 'إضافة إصابة جديدة';
  document.getElementById('injuryForm').reset();
  document.getElementById('injuryId').value = '';
  document.getElementById('injuryDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('injuryModal').classList.add('open');
};

window.editInjury = function (id) {
  const injury = allInjuries.find(i => i.id === id);
  if (injury) {
    currentInjuryId = id;
    document.getElementById('modalTitle').textContent = 'تعديل الإصابة';
    document.getElementById('injuryId').value = injury.id;
    document.getElementById('playerId').value = injury.player_id || '';
    document.getElementById('specialistId').value = injury.specialist_id || '';
    document.getElementById('injuryType').value = injury.injury_type || '';
    document.getElementById('diagnosis').value = injury.diagnosis || '';
    document.getElementById('injuryDate').value = injury.injury_date || '';
    document.getElementById('injuryModal').classList.add('open');
  }
};

window.viewInjury = function (id) {
  const injury = allInjuries.find(i => i.id === id);
  if (!injury) return;

  showToast(
    `الإصابة: ${injury.injury_type || 'غير محدد'} | اللاعب: ${injury.player_name || 'غير محدد'}`,
    'info'
  );
};

async function saveInjury() {
  const id = document.getElementById('injuryId').value;

  const injuryData = {
    player_id: document.getElementById('playerId').value.trim(),
    specialist_id: document.getElementById('specialistId').value.trim(),
    injury_type: document.getElementById('injuryType').value.trim(),
    diagnosis: document.getElementById('diagnosis').value.trim(),
    injury_date: document.getElementById('injuryDate').value
  };

  if (
    !injuryData.player_id ||
    !injuryData.specialist_id ||
    !injuryData.injury_type ||
    !injuryData.diagnosis ||
    !injuryData.injury_date
  ) {
    showToast('الرجاء ملء جميع الحقول المطلوبة', 'warning');
    return;
  }

  try {
    let result;

    if (id) {
      result = await updateInjury(id, injuryData);
      if (result && result.success) {
        showToast('تم تحديث الإصابة بنجاح', 'success');
        closeModal();
        await loadInjuries();
      } else {
        showToast(result?.message || 'حدث خطأ في التحديث', 'error');
      }
    } else {
      result = await addInjury(injuryData);
      if (result && result.success) {
        showToast('تم إضافة الإصابة بنجاح', 'success');
        closeModal();
        await loadInjuries();
      } else {
        showToast(result?.message || 'حدث خطأ في الإضافة', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    showToast('حدث خطأ في حفظ الإصابة', 'error');
  }
}

window.openDeleteModal = function (id, title) {
  pendingDeleteId = id;
  document.getElementById('deleteInjuryTitle').textContent = `"${title}"`;
  document.getElementById('deleteModal').classList.add('open');
};

async function confirmDelete() {
  if (!pendingDeleteId) return;

  try {
    const result = await deleteInjury(pendingDeleteId);
    if (result && result.success) {
      showToast('تم حذف الإصابة بنجاح', 'success');
      closeDeleteModal();
      await loadInjuries();
    } else {
      showToast(result?.message || 'حدث خطأ في الحذف', 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('حدث خطأ في حذف الإصابة', 'error');
  }
}

window.closeDeleteModal = function () {
  document.getElementById('deleteModal').classList.remove('open');
  pendingDeleteId = null;
};

document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

window.closeModal = function () {
  document.getElementById('injuryModal').classList.remove('open');
  currentInjuryId = null;
};

document.getElementById('injuryModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('injuryModal')) closeModal();
});

document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});

document.getElementById('saveInjuryBtn').addEventListener('click', saveInjury);
document.getElementById('openAddModalBtn').addEventListener('click', openAddModal);

(async function init() {
  await loadUsers();
  await loadInjuries();
})();

window.editInjury = editInjury;
window.viewInjury = viewInjury;
window.openDeleteModal = openDeleteModal;
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;