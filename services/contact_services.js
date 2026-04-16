// services/contact_services.js

import { ContactMessage } from "../shared/models/contact.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

// ✅ إضافة رسالة جديدة - معدلة
export async function addContactMessage(data) {
  try {
    const contactMessage = new ContactMessage(data);
    
    // استخدام POST عشان Firebase يولد ID تلقائي
    const response = await fetch(`${BASE_URL}/contact_messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: contactMessage.fullName,
        email: contactMessage.email,
        phone: contactMessage.phone,
        subject: contactMessage.subject,
        message: contactMessage.message,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt
      })
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: "فشل إرسال الرسالة"
      };
    }

    const result = await response.json();
    console.log('نتيجة الحفظ في Firebase:', result);
    
    // ✅ result.name هو الـ ID اللي تولد من Firebase
    const newId = result.name;
    
    console.log('الـ ID الجديد للرسالة:', newId);

    return {
      success: true,
      data: {
        id: newId,
        ...contactMessage.toJSON()
      },
      message: "تم إرسال الرسالة بنجاح"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "حدث خطأ غير متوقع"
    };
  }
}

// جلب جميع الرسائل
export async function getAllContactMessages() {
  try {
    const response = await fetch(`${BASE_URL}/contact_messages.json`);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "فشل جلب الرسائل"
      };
    }

    const data = await response.json();
    console.log('البيانات الخام من Firebase:', data);

    if (!data) {
      return {
        success: true,
        data: [],
        message: "لا توجد رسائل"
      };
    }

    // تحويل البيانات إلى مصفوفة مع الحفاظ على الـ ID
    const messages = Object.entries(data).map(([key, value]) => {
      console.log(`الرسالة ${key}:`, value);
      return new ContactMessage({
        id: key,  // ✅ المفتاح هو الـ ID
        fullName: value.fullName || '',
        email: value.email || '',
        phone: value.phone || '',
        subject: value.subject || '',
        message: value.message || '',
        status: value.status || 'unread',
        createdAt: value.createdAt || new Date().toISOString()
      });
    });

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('الرسائل بعد المعالجة:', messages.map(m => ({ id: m.id, name: m.fullName })));

    return {
      success: true,
      data: messages,
      message: "تم جلب الرسائل بنجاح"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: [],
      message: "حدث خطأ غير متوقع"
    };
  }
}

// تحديث حالة الرسالة
export async function updateContactMessageStatus(id, status) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        message: "معرف الرسالة مطلوب"
      };
    }
    
    const response = await fetch(`${BASE_URL}/contact_messages/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: "فشل تحديث الحالة"
      };
    }

    return {
      success: true,
      data: { id, status },
      message: "تم تحديث الحالة بنجاح"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "حدث خطأ غير متوقع"
    };
  }
}

// ✅ حذف رسالة واحدة - معدلة
export async function deleteContactMessage(id) {
  try {
    if (!id) {
      console.error('لا يوجد ID للحذف');
      return {
        success: false,
        data: null,
        message: "معرف الرسالة مطلوب"
      };
    }

    console.log('جاري حذف الرسالة بالمعرف:', id);
    console.log('مسار الحذف:', `${BASE_URL}/contact_messages/${id}.json`);
    
    const response = await fetch(`${BASE_URL}/contact_messages/${id}.json`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('خطأ في الحذف:', errorText);
      return {
        success: false,
        data: null,
        message: `فشل حذف الرسالة: ${response.status}`
      };
    }

    console.log('تم حذف الرسالة بنجاح:', id);

    return {
      success: true,
      data: null,
      message: "تم حذف الرسالة بنجاح"
    };

  } catch (error) {
    console.error('خطأ في الحذف:', error);
    return {
      success: false,
      data: null,
      message: "حدث خطأ غير متوقع: " + error.message
    };
  }
}

// جلب عدد الرسائل غير المقروءة
export async function getUnreadCount() {
  try {
    const result = await getAllContactMessages();
    if (!result.success) return 0;
    
    const unreadCount = result.data.filter(msg => msg.status === "unread").length;
    return unreadCount;
    
  } catch (error) {
    console.error(error);
    return 0;
  }
}