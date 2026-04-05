// services/availability_services.js
import { Availability } from "../shared/models/Availability.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addAvailability(data) {
  try {
    // Create availability instance WITHOUT id (let Firebase generate it)
    const availability = new Availability(data);
    
    // Make sure id is null/undefined for new records
    const jsonData = availability.toJSON();
    
    // Remove id if it's null or undefined
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

    // Firebase returns the generated ID as 'name'
    return {
      success: true,
      data: {
        id: result.name,  // This is the Firebase-generated ID
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
        id: key,  // Use Firebase key as ID
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
      (availability) => availability.specialist_id === String(specialistId) && availability.is_active
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAvailabilityByDay(specialistId, day) {
  try {
    const all = await getAllAvailability();
    
    const result = all.find(
      (availability) => 
        String(availability.specialist_id) === String(specialistId) && 
        availability.day === day &&
        availability.is_active === true
    );
    
    return result || null;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateAvailability(id, updatedData) {
  try {
    // For update, create a clean object without id
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
        id: id,
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

// Get availability by ID
export async function getAvailabilityById(id) {
  try {
    const res = await fetch(`${BASE_URL}/availability/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new Availability({
      id: id,
      ...data
    });

  } catch (error) {
    console.error(error);
    return null;
  }
}