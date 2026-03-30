import { Injury } from "../shared/models/Injury.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addInjury(data) {
  try {
    const injury = new Injury(data);

    const res = await fetch(`${BASE_URL}/injuries.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(injury.toJSON())
    });

    const result = await res.json();

    return {
      success: true,
      data: {
        id: result.name,
        ...injury.toJSON()
      }
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to add injury"
    };
  }
}

export async function getAllInjuries() {
  try {
    const res = await fetch(`${BASE_URL}/injuries.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new Injury({
        id: key,
        ...value
      });
    });

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function getInjuriesByPlayer(playerId) {
  try {
    const all = await getAllInjuries();

    return all.filter(
      (injury) => injury.player_id === playerId
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function getInjuriesBySpecialist(specialistId) {
  try {
    const all = await getAllInjuries();

    return all.filter(
      (injury) => injury.specialist_id === specialistId
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function updateInjury(id, updatedData) {
  try {
    const res = await fetch(`${BASE_URL}/injuries/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update injury"
    };
  }
}
export async function deleteInjury(id) {
  try {
    await fetch(`${BASE_URL}/injuries/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete injury"
    };
  }
}