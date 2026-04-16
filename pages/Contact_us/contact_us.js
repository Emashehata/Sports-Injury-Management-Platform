// pages/ContactUs/contact_us.js

import { addContactMessage } from '../../services/contact_services.js';
import { showToast } from '../../shared/js/toaster.js';

const contactForm = document.getElementById("arabicContactForm");
const submitBtn = document.getElementById("submitBtn");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true;
  const phoneRegex = /^[\+]?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    if (!fullName) {
      showToast("الرجاء إدخال الاسم الكامل", "error");
      return;
    }
    
    if (!email) {
      showToast("الرجاء إدخال البريد الإلكتروني", "error");
      return;
    }
    
    if (!isValidEmail(email)) {
      showToast("الرجاء إدخال بريد إلكتروني صحيح", "error");
      return;
    }
    
    if (!subject) {
      showToast("الرجاء اختيار الموضوع", "error");
      return;
    }
    
    if (!message) {
      showToast("الرجاء إدخال نص الرسالة", "error");
      return;
    }
    
    if (phone && !isValidPhone(phone)) {
      showToast("الرجاء إدخال رقم هاتف صحيح (10-15 رقم)", "error");
      return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري الإرسال...';
    
    try {
      const result = await addContactMessage({
        fullName,
        email,
        phone,
        subject,
        message,
        status: "unread",
        createdAt: new Date().toISOString()
      });
      
      if (result.success) {
        showToast("✓ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.", "success");
        contactForm.reset();
      } else {
        showToast(result.message || "حدث خطأ أثناء إرسال الرسالة", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ غير متوقع، حاول مرة أخرى لاحقاً", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}