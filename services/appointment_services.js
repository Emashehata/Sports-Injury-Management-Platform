// services/appointment_services.js
import { Appointment } from "../shared/models/Appointment.model.js";
import { getAvailabilityByDay } from "./availability_services.js";

const BASE_URL = "https://medical-cca8b-default-rtdb.firebaseio.com";

export async function addAppointment(data) {
  try {
    // First check if the time slot is available
    const isAvailable = await checkTimeSlotAvailability(
      data.specialist_id,
      data.date,
      data.time
    );

    if (!isAvailable) {
      return {
        success: false,
        message: "هذا الوقت غير متاح أو محجوز بالفعل"
      };
    }

    // Create appointment instance WITHOUT id (let Firebase generate it)
    const appointment = new Appointment(data);
    
    // Get the JSON and remove id if it's null
    const jsonData = appointment.toJSON();
    
    // Make sure id is not sent to Firebase for new appointments
    delete jsonData.id;

    console.log("Sending to Firebase:", jsonData); // Debug log

    const res = await fetch(`${BASE_URL}/appointments.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonData)
    });

    const result = await res.json();
    console.log("Firebase response:", result); // Debug log

    // Firebase returns the generated ID as 'name'
    return {
      success: true,
      data: {
        id: result.name,  // This is the Firebase-generated ID
        ...jsonData
      }
    };

  } catch (error) {
    console.error("Error adding appointment:", error);
    return {
      success: false,
      message: "فشل في حجز الموعد"
    };
  }
}

export async function getAllAppointments() {
  try {
    const res = await fetch(`${BASE_URL}/appointments.json`);
    const data = await res.json();

    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      return new Appointment({
        id: key,  // Use Firebase key as ID
        ...value
      });
    });

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentsByPlayer(playerId) {
  try {
    const all = await getAllAppointments();
    console.log("All appointments:", all); // Debug log
    console.log("Filtering for player:", playerId); // Debug log

    const filtered = all.filter(
      (appointment) => String(appointment.player_id) === String(playerId)
    );
    
    console.log("Filtered appointments:", filtered); // Debug log
    
    return filtered;

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentsBySpecialist(specialistId) {
  try {
    const all = await getAllAppointments();

    return all.filter(
      (appointment) => String(appointment.specialist_id) === String(specialistId)
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentsByDate(date) {
  try {
    const all = await getAllAppointments();

    return all.filter(
      (appointment) => appointment.date === date
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentsByStatus(status) {
  try {
    const all = await getAllAppointments();

    return all.filter(
      (appointment) => appointment.status === status
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentById(id) {
  try {
    const res = await fetch(`${BASE_URL}/appointments/${id}.json`);
    const data = await res.json();

    if (!data) return null;

    return new Appointment({
      id: id,
      ...data
    });

  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get booked time slots for a specific specialist on a specific date
export async function getBookedTimeSlots(specialistId, date) {
  try {
    const all = await getAllAppointments();
    
    const bookedSlots = all
      .filter(
        (appointment) => 
          String(appointment.specialist_id) === String(specialistId) &&
          appointment.date === date &&
          appointment.status !== "cancelled"
      )
      .map((appointment) => appointment.time);
    
    return bookedSlots;
    
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Get available time slots based on specialist's availability and existing bookings
export async function getAvailableTimeSlots(specialistId, date) {
  try {
    // Get the day of week from the date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    console.log("Day of week:", dayOfWeek);
    
    // Get specialist's availability for that day
    const availability = await getAvailabilityByDay(specialistId, dayOfWeek);
    console.log("Availability found:", availability);
    
    if (!availability) {
      return {
        success: false,
        message: "No availability found for this specialist on this day",
        availableSlots: []
      };
    }
    
    // Generate all possible time slots from availability
    const allTimeSlots = availability.generateTimeSlots();
    console.log("All time slots:", allTimeSlots);
    
    // Get already booked slots
    const bookedSlots = await getBookedTimeSlots(specialistId, date);
    console.log("Booked slots:", bookedSlots);
    
    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    console.log("Available slots:", availableSlots);
    
    return {
      success: true,
      availability: availability,
      allSlots: allTimeSlots,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots
    };
    
  } catch (error) {
    console.error("Error in getAvailableTimeSlots:", error);
    return {
      success: false,
      message: "Failed to get available time slots",
      availableSlots: []
    };
  }
}

// Check if a specific time slot is available
export async function checkTimeSlotAvailability(specialistId, date, time) {
  try {
    const bookedSlots = await getBookedTimeSlots(specialistId, date);
    
    if (bookedSlots.includes(time)) {
      return false;
    }
    
    // Also check if the time is within the specialist's availability
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = await getAvailabilityByDay(specialistId, dayOfWeek);
    
    if (!availability) {
      return false;
    }
    
    const availableSlots = availability.generateTimeSlots();
    
    return availableSlots.includes(time);
    
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateAppointment(id, updatedData) {
  try {
    // For update, don't send the id in the body
    const { id: _, ...cleanData } = updatedData;
    
    const res = await fetch(`${BASE_URL}/appointments/${id}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cleanData)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return {
      success: true,
      data: {
        id: id,
        ...data
      }
    };

  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      message: "فشل تعديل الموعد"
    };
  }
}

export async function deleteAppointment(id) {
  try {
    const res = await fetch(`${BASE_URL}/appointments/${id}.json`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return {
      success: true,
      message: "تم حذف الموعد بنجاح"
    };

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return {
      success: false,
      message: "فشل حذف الموعد"
    };
  }
}

export async function cancelAppointment(id) {
  return await updateAppointment(id, { status: "cancelled" });
}

export async function confirmAppointment(id) {
  return await updateAppointment(id, { status: "confirmed" });
}

export async function completeAppointment(id) {
  return await updateAppointment(id, { status: "completed" });
}