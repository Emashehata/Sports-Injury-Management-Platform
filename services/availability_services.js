import { Availability } from "../shared/models/Availability.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addAvailability(data) {
  try {
    const availability = new Availability(data);
    const jsonData = availability.toJSON();

    if (jsonData.id === null || jsonData.id === undefined) {
      delete jsonData.id;
    }

    const res = await fetch(`${BASE_URL}/availability.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonData)
    });

    const result = await res.json();

    return {
      success: true,
      data: {
        id: result.name,
        ...jsonData
      }
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to add availability"
    };
  }
}

export async function getAllAvailability() {
  try {
    const res = await fetch(`${BASE_URL}/availability.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new Availability({
        id: key,
        ...value
      });
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAvailabilityBySpecialist(specialistId) {
  try {
    const all = await getAllAvailability();

    return all.filter(
      (availability) =>
        String(availability.specialist_id) === String(specialistId)
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAvailabilityByDay(specialistId, day) {
  try {
    const all = await getAllAvailability();

    return (
      all.find(
        (availability) =>
          String(availability.specialist_id) === String(specialistId) &&
          availability.day === day
      ) || null
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateAvailability(id, updatedData) {
  try {
    const { id: _, ...cleanData } = updatedData;

    const res = await fetch(`${BASE_URL}/availability/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cleanData)
    });

    const data = await res.json();

    return {
      success: true,
      data: {
        id,
        ...data
      }
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update availability"
    };
  }
}

export async function deleteAvailability(id) {
  try {
    await fetch(`${BASE_URL}/availability/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete availability"
    };
  }
}

export async function getAvailabilityById(id) {
  try {
    const res = await fetch(`${BASE_URL}/availability/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new Availability({
      id,
      ...data
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}