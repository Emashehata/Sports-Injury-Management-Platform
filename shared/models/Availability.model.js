// ../shared/models/Availability.model.js
export class Availability {
  constructor({
    id = null,  // Change from "" to null
    specialist_id = "",
    day = "",
    start_time = "",
    end_time = "",
    session_duration = 30,
    is_active = true
  } = {}) {
    this.id = id;  // Can be null for new records
    this.specialist_id = specialist_id;
    this.day = day;
    this.start_time = start_time;
    this.end_time = end_time;
    this.session_duration = session_duration;
    this.is_active = is_active;
  }

  toJSON() {
    // Create a clean object without undefined values
    const json = {
      specialist_id: this.specialist_id,
      day: this.day,
      start_time: this.start_time,
      end_time: this.end_time,
      session_duration: this.session_duration,
      is_active: this.is_active
    };
    
    // Only include id if it exists and is not null
    if (this.id && this.id !== null) {
      json.id = this.id;
    }
    
    return json;
  }

  // Generate time slots based on availability
  generateTimeSlots() {
    const slots = [];
    const start = this.parseTime(this.start_time);
    const end = this.parseTime(this.end_time);
    const duration = this.session_duration;
    
    let current = start;
    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd <= end) {
        slots.push(this.formatTime(current));
      }
      current = slotEnd;
    }
    
    return slots;
  }

  parseTime(timeStr) {
    // Handle 24-hour format (from input type="time")
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      return date;
    }
    
    // Handle 12-hour format with AM/PM
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (modifier === 'م' || modifier === 'PM') {
      if (hours !== '12') hours = parseInt(hours) + 12;
    } else if (modifier === 'ص' || modifier === 'AM') {
      if (hours === '12') hours = '0';
    }
    
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date;
  }

  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'م' : 'ص';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}