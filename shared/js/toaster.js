let toastContainer = null;

function createToastContainer() {
  const existing = document.getElementById("toastContainerCustom");

  if (existing) {
    toastContainer = existing;
    return;
  }

  toastContainer = document.createElement("div");
  toastContainer.id = "toastContainerCustom";
  toastContainer.className = "toast-container-custom";
  document.body.appendChild(toastContainer);
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "fa-solid fa-check";
    case "error":
      return "fa-solid fa-xmark";
    case "warning":
      return "fa-solid fa-exclamation";
    default:
      return "fa-solid fa-info";
  }
}

function getToastTitle(type) {
  switch (type) {
    case "success":
      return "نجاح";
    case "error":
      return "خطأ";
    case "warning":
      return "تنبيه";
    default:
      return "معلومة";
  }
}

export function showToast(message, type = "info", duration = 3000) {
  if (!document.body) return;

  if (!toastContainer) {
    createToastContainer();
  }

  const toast = document.createElement("div");
  toast.className = `toast-item-custom ${type}`;

  toast.innerHTML = `
    <div class="toast-icon-custom">
      <i class="${getToastIcon(type)}"></i>
    </div>

    <div class="toast-content-custom">
      <h6 class="toast-title-custom">${getToastTitle(type)}</h6>
      <p class="toast-message-custom">${message}</p>
    </div>

    <button class="toast-close-custom" aria-label="close">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <span class="toast-progress-custom" style="animation-duration: ${duration}ms;"></span>
  `;

  const closeBtn = toast.querySelector(".toast-close-custom");

  const removeToast = () => {
    toast.classList.add("removing");
    setTimeout(() => {
      toast.remove();
    }, 280);
  };

  closeBtn.addEventListener("click", removeToast);

  toastContainer.appendChild(toast);

  setTimeout(removeToast, duration);
}

window.addEventListener("DOMContentLoaded", () => {
  createToastContainer();
});