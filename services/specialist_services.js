import { Specialist } from "../shared/models/specialist.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addSpecialist(data) {
  try {
    const specialist = new Specialist(data);

    if (!specialist.id) {
      return {
        success: false,
        message: "Specialist id (user id) is required"
      };
    }

    await fetch(`${BASE_URL}/specialists/${specialist.id}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(specialist.toJSON())
    });

    return {
      success: true,
      data: specialist
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create specialist"
    };
  }
}
export async function getAllSpecialists() {
  try {
    const res = await fetch(`${BASE_URL}/specialists.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new Specialist({
        id: key,
        ...value
      });
    });

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function getSpecialistById(id) {
  try {
    const res = await fetch(`${BASE_URL}/specialists/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new Specialist({
      id,
      ...data
    });

  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function updateSpecialist(id, updatedData) {
  try {
    const res = await fetch(`${BASE_URL}/specialists/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Update failed"
      };
    }

    return {
      success: true,
      data: { id, ...updatedData }
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error updating specialist"
    };
  }
}
export async function deleteSpecialist(id) {
  try {
    await fetch(`${BASE_URL}/specialists/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true,
      message: "Specialist deleted successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Delete failed"
    };
  }
}
export async function searchSpecialists(keyword) {
  try {
    const specialists = await getAllSpecialists();

    return specialists.filter(s =>
      s.specialization.toLowerCase().includes(keyword.toLowerCase())
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}