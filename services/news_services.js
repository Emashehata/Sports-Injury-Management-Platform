import { News } from "../shared/models/News.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";


export async function addNews(data) {
  try {
    const news = new News(data);

    const res = await fetch(`${BASE_URL}/news.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(news.toJSON())
    });

    const result = await res.json();

    return {
      success: true,
      data: new News({
        id: result.name,
        ...news.toJSON()
      })
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to add news"
    };
  }
}

export async function getAllNews() {
  try {
    const res = await fetch(`${BASE_URL}/news.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new News({
        id: key,
        ...value
      });
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getNewsById(id) {
  try {
    const res = await fetch(`${BASE_URL}/news/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new News({
      id,
      ...data
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Update News
export async function updateNews(id, updatedData) {
  try {
    await fetch(`${BASE_URL}/news/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    return {
      success: true,
      message: "News updated successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update news"
    };
  }
}

export async function deleteNews(id) {
  try {
    await fetch(`${BASE_URL}/news/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true,
      message: "News deleted successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete news"
    };
  }
}