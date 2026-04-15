import { News } from "../shared/models/News.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

// جلب كل الأخبار - نسخة آمنة 100%
export async function getAllNews() {
  try {
    const res = await fetch(`${BASE_URL}/news.json`);
    const data = await res.json();
    
    // لو مفيش بيانات خالص
    if (!data || typeof data !== 'object') {
      return [];
    }
    
    const newsArray = [];
    
    // استخدام for...in بدل Object.entries عشان أمان أكتر
    for (const key in data) {
      // التأكد إن المفتاح خاص بالكائن مش من prototype
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // التأكد إن القيمة مش null
        if (value && typeof value === 'object') {
          newsArray.push(new News({
            id: key,
            title: value.title || "بدون عنوان",
            content: value.content || "",
            image: value.image || "",
            date: value.date || ""
          }));
        }
      }
    }
    
    console.log("Loaded news count:", newsArray.length);
    return newsArray;
    
  } catch (error) {
    console.error("Error in getAllNews:", error);
    return [];
  }
}

// باقي الدوال كما هي...
export async function addNews(data) {
  try {
    const news = new News(data);
    const newsData = {
      title: news.title || "",
      content: news.content || "",
      image: news.image || "",
      date: news.date || new Date().toISOString().split('T')[0]
    };
    
    const res = await fetch(`${BASE_URL}/news.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData)
    });

    const result = await res.json();

    return {
      success: true,
      data: new News({ id: result.name, ...newsData }),
      message: "News added successfully"
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to add news" };
  }
}

export async function updateNews(id, updatedData) {
  try {
    if (!id) {
      return { success: false, message: "No news id provided" };
    }
    
    const cleanData = {
      title: updatedData.title || "",
      content: updatedData.content || "",
      image: updatedData.image || "",
      date: updatedData.date || ""
    };
    
    const res = await fetch(`${BASE_URL}/news/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanData)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return { success: true, message: "News updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update news" };
  }
}

export async function deleteNews(id) {
  try {
    if (!id) {
      return { success: false, message: "No news id provided" };
    }
    
    const res = await fetch(`${BASE_URL}/news/${id}.json`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return { success: true, message: "News deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete news" };
  }
}

export async function getNewsById(id) {
  try {
    if (!id) return null;
    
    const res = await fetch(`${BASE_URL}/news/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new News({
      id: id,
      title: data.title || "",
      content: data.content || "",
      image: data.image || "",
      date: data.date || ""
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}