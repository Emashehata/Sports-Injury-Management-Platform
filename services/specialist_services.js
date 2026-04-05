import { Specialist } from "../shared/models/specialist.model.js";
import { getUserById } from "./user_services.js";

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
// services/specialist_services.js - Fix getSpecialistById
export async function getSpecialistById(id) {
  try {
    console.log("Fetching specialist from Firebase:", `${BASE_URL}/specialists/${id}.json`);
    
    const res = await fetch(`${BASE_URL}/specialists/${id}.json`);
    
    if (!res.ok) {
      console.log("Response not OK:", res.status);
      return null;
    }
    
    const data = await res.json();
    console.log("Specialist data from Firebase:", data);

    if (!data) {
      console.log("No data found for specialist ID:", id);
      return null;
    }

    return new Specialist({
      id,
      ...data
    });

  } catch (error) {
    console.error("Error in getSpecialistById:", error);
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

export async function getAllDoctors() {
  try {
    const specialists = await getAllSpecialists();
    
    if (!specialists || specialists.length === 0) {
      return [];
    }

    const doctorsWithDetails = await Promise.all(
      specialists.map(async (specialist) => {

        const userResponse = await getUserById(specialist.id);
        
        if (!userResponse.success || userResponse.data?.user_type !== "specialist") {
          return null; 
        }
        
        const user = userResponse.data;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          imgPath: user.imgPath,
          user_type: user.user_type,
          specialization: specialist.specialization,
          experience: specialist.experience,
          qualification: specialist.qualification,
          clinic_address: specialist.clinic_address
        };
      })
    );
    
    return doctorsWithDetails.filter(specialist => specialist !== null);
    
  } catch (error) {
    console.error("خطأ في جلب بيانات الأخصائيين:", error);
    return [];
  }
}

// services/specialist_services.js - Fix getDoctorById
export async function getDoctorById(id) {
  try {
    console.log("Fetching doctor with ID:", id);
    
    // First get the specialist data
    const specialist = await getSpecialistById(id);
    console.log("Specialist data:", specialist);
    
    if (!specialist) {
      console.log("No specialist found for ID:", id);
      return null;
    }
    
    // Then get the user data
    const userResponse = await getUserById(id);
    console.log("User response:", userResponse);
    
    if (!userResponse.success || userResponse.data?.user_type !== "specialist") {
      console.log("User not found or not a specialist");
      return null;
    }
    
    const user = userResponse.data;
    
    const doctorData = {
      id: user.id,
      name: user.name || "غير محدد",
      email: user.email || "",
      phone: user.phone || "",
      imgPath: user.imgPath || "",
      user_type: user.user_type,
      specialization: specialist.specialization || "غير محدد",
      experience: specialist.experience || "",
      qualification: specialist.qualification || "غير محدد",
      clinic_address: specialist.clinic_address || "غير محدد"
    };
    
    console.log("Final doctor data:", doctorData);
    return doctorData;
    
  } catch (error) {
    console.error("Error in getDoctorById:", error);
    return null;
  }
}
  
export async function getDoctorsBySpecialization(specialization) {
  try {
    const allDoctors = await getAllDoctors();
    
    if (!specialization) return allDoctors;
    
    return allDoctors.filter(doctor => 
      doctor.specialization?.toLowerCase() === specialization.toLowerCase()
    );
    
  } catch (error) {
    console.error(error);
    return [];
  }
}