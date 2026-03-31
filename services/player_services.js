import { Player } from "../shared/models/player.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addPlayer(data) {
  try {
    const player = new Player(data);

    if (!player.id) {
      return {
        success: false,
        data: null,
        message: "Player id (user id) is required"
      };
    }

    await fetch(`${BASE_URL}/players/${player.id}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(player.toJSON())
    });

    return {
      success: true,
      data: player,
      message: "Player created successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Failed to create player"
    };
  }
}
export async function getAllPlayers() {
  try {
    const res = await fetch(`${BASE_URL}/players.json`);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: "Error fetching players"
      };
    }

    const data = await res.json();

    if (!data) {
      return {
        success: true,
        data: [],
        message: "No players found"
      };
    }

    const players = Object.entries(data).map(([key, value]) => {
      return new Player({
        id: key,
        ...value
      });
    });

    return {
      success: true,
      data: players,
      message: "Players fetched successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: [],
      message: "Unexpected error"
    };
  }
}

export async function getPlayerById(id) {
  try {
    const res = await fetch(`${BASE_URL}/players/${id}.json`);
    const data = await res.json();

    if (!data) {
      return {
        success: false,
        data: null,
        message: "Player not found"
      };
    }

    return {
      success: true,
      data: new Player({
        id,
        ...data
      }),
      message: "Player found"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Error fetching player"
    };
  }
}

export async function updatePlayer(id, updatedData) {
  try {
    const res = await fetch(`${BASE_URL}/players/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      return {
        success: false,
        data: null,
        message: "Update failed"
      };
    }

    return {
      success: true,
      data: { id, ...updatedData },
      message: "Player updated successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Error updating player"
    };
  }
}

export async function deletePlayer(id) {
  try {
    const res = await fetch(`${BASE_URL}/players/${id}.json`, {
      method: "DELETE"
    });

    if (!res.ok) {
      return {
        success: false,
        data: null,
        message: "Delete failed"
      };
    }

    return {
      success: true,
      data: null,
      message: "Player deleted successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Delete failed"
    };
  }
}

export async function searchPlayers(keyword) {
  try {
    const res = await getAllPlayers();

    if (!res.success) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch players"
      };
    }

    const players = res.data;

    if (!keyword) {
      return {
        success: true,
        data: players,
        message: "All players returned"
      };
    }

    const filtered = players.filter(p =>
      p.sport?.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      success: true,
      data: filtered,
      message: "Search completed"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: [],
      message: "Search failed"
    };
  }
}