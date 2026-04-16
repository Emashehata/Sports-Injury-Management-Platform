import { Specialist } from "../shared/models/specialist.model.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addSpecialist(data) {
  try {
    const specialist = new Specialist(data);

    if (!specialist.id) {
      return {
        success: false,
        data: null,
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
      data: specialist,
      message: "Specialist created successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Failed to create specialist"
    };
  }
}

// ========== جلب كل الأخصائيين (مطابق لطريقة getAllPlayers) ==========
export async function getAllSpecialists() {
  try {
    const res = await fetch(`${BASE_URL}/specialists.json`);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: "Error fetching specialists"
      };
    }

    const data = await res.json();

    if (!data) {
      return {
        success: true,
        data: [],
        message: "No specialists found"
      };
    }

    const specialists = Object.entries(data).map(([key, value]) => {
      return new Specialist({
        id: key,
        ...value
      });
    });

    return {
      success: true,
      data: specialists,
      message: "Specialists fetched successfully"
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

export async function getSpecialistById(id) {
  try {
    const res = await fetch(`${BASE_URL}/specialists/${id}.json`);
    const data = await res.json();

    if (!data) {
      return {
        success: false,
        data: null,
        message: "Specialist not found"
      };
    }

    return {
      success: true,
      data: new Specialist({
        id,
        ...data
      }),
      message: "Specialist found"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Error fetching specialist"
    };
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
        data: null,
        message: "Update failed"
      };
    }

    return {
      success: true,
      data: { id, ...updatedData },
      message: "Specialist updated successfully"
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: "Error updating specialist"
    };
  }
}
export async function deleteSpecialist(id) {
  try {
    const res = await fetch(`${BASE_URL}/specialists/${id}.json`, {
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
      message: "Specialist deleted successfully"
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

export async function getAllSpecialistsWithUsers() {
  try {
    const specialistsResult = await getAllSpecialists();
    if (!specialistsResult.success) {
      return { success: false, data: [] };
    }
    const specialists = specialistsResult.data;

    const usersRes = await fetch(`${BASE_URL}/users.json`);
    const usersData = await usersRes.json();
    
    let users = [];
    if (usersData) {
      users = Object.entries(usersData).map(([key, value]) => ({
        id: key,
        ...value
      }));
    }

    const combinedData = specialists.map(specialist => {
      const user = users.find(u => u.id === specialist.id);
      return {
        specialistId: specialist.id,
        userId: specialist.id,
        name: user?.name || 'غير محدد',
        email: user?.email || '',
        phone: user?.phone || '',
        imgPath: user?.imgPath || '',
        specialization: specialist.specialization || 'غير محدد',
        experience: specialist.experience || '0',
        qualification: specialist.qualification || 'غير محدد',
        clinic_address: specialist.clinic_address || '',
        user_type: user?.user_type || 'specialist'
      };
    });

    return { success: true, data: combinedData };

  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}