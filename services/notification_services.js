import { Notification } from "../shared/models/Notification.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addNotification(data) {
  try {
    const notification = new Notification(data);

    const res = await fetch(`${BASE_URL}/notifications.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notification.toJSON())
    });

    const result = await res.json();

    return {
      success: true,
      data: {
        id: result.name,
        ...notification
      }
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to add notification"
    };
  }
}

export async function getAllNotifications() {
  try {
    const res = await fetch(`${BASE_URL}/notifications.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new Notification({
        id: key,
        ...value
      });
    });

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function getUserNotifications(userId) {
  try {
    const allNotifications = await getAllNotifications();

    return allNotifications.filter(
      (n) => n.user_id === userId
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function markAsRead(id) {
  try {
    await fetch(`${BASE_URL}/notifications/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ read: true })
    });

    return {
      success: true
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to mark as read"
    };
  }
}

export async function deleteNotification(id) {
  try {
    await fetch(`${BASE_URL}/notifications/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Delete failed"
    };
  }
}
export async function clearUserNotifications(userId) {
  try {
    const allNotifications = await getAllNotifications();

    const userNotifications = allNotifications.filter(
      (n) => n.user_id === userId
    );

    for (const n of userNotifications) {
      await deleteNotification(n.id);
    }

    return {
      success: true
    };

  } catch (error) {
    console.error(error);
    return {
      success: false
    };
  }
}