// ../shared/models/Appointment.model.js
export class Appointment {
  constructor({
    id = null,  // Change from "" to null
    player_id = "",
    specialist_id = "",
    date = "",
    time = "",
    status = "pending",
    created_at = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.player_id = player_id;
    this.specialist_id = specialist_id;
    this.date = date;
    this.time = time;
    this.status = status;
    this.created_at = created_at;
  }

  toJSON() {
    // Create a clean object without undefined or null values
    const json = {
      player_id: this.player_id,
      specialist_id: this.specialist_id,
      date: this.date,
      time: this.time,
      status: this.status,
      created_at: this.created_at
    };
    
    // Only include id if it exists and is not null (for updates)
    if (this.id && this.id !== null) {
      json.id = this.id;
    }
    
    return json;
  }
}