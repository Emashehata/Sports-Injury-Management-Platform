// services/appointment.service.js
import { Appointment } from "../shared/models/Appointment.model.js";
import { getAvailabilityByDay } from "./availability.service.js";

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
        message: "This time slot is not available or already booked"
      };
    }

    const appointment = new Appointment(data);

    const res = await fetch(`${BASE_URL}/appointments.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment.toJSON())
    });

    const result = await res.json();

    return {
      success: true,
      data: {
        id: result.name,
        ...appointment.toJSON()
      }
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to add appointment"
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
        id: key,
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

    return all.filter(
      (appointment) => appointment.player_id === playerId
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAppointmentsBySpecialist(specialistId) {
  try {
    const all = await getAllAppointments();

    return all.filter(
      (appointment) => appointment.specialist_id === specialistId
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

// Get booked time slots for a specific specialist on a specific date
export async function getBookedTimeSlots(specialistId, date) {
  try {
    const all = await getAllAppointments();
    
    const bookedSlots = all
      .filter(
        (appointment) => 
          appointment.specialist_id === specialistId &&
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
    
    // Get specialist's availability for that day
    const availability = await getAvailabilityByDay(specialistId, dayOfWeek);
    
    if (!availability) {
      return {
        success: false,
        message: "No availability found for this specialist on this day",
        slots: []
      };
    }
    
    // Generate all possible time slots from availability
    const allTimeSlots = availability.generateTimeSlots();
    
    // Get already booked slots
    const bookedSlots = await getBookedTimeSlots(specialistId, date);
    
    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    return {
      success: true,
      availability: availability,
      allSlots: allTimeSlots,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots
    };
    
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to get available time slots",
      slots: []
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
    const res = await fetch(`${BASE_URL}/appointments/${id}.json`, {
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
      message: "Failed to update appointment"
    };
  }
}

export async function deleteAppointment(id) {
  try {
    await fetch(`${BASE_URL}/appointments/${id}.json`, {
      method: "DELETE"
    });

    return {
      success: true
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete appointment"
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