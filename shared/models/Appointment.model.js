// ../shared/models/Appointment.model.js
export class Appointment {
  constructor({
    id = "",
    player_id = "",
    specialist_id = "",
    date = "",
    time = "",
    status = "pending", // pending, confirmed, completed, cancelled
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
    return {
      id: this.id,
      player_id: this.player_id,
      specialist_id: this.specialist_id,
      date: this.date,
      time: this.time,
      status: this.status,
      created_at: this.created_at
    };
  }
}