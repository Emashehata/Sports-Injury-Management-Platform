export class Availability {
  constructor({
    id = "",
    specialist_id = "",
    day = "",
    start_time = "",
    end_time = "",
    session_duration = 0
  } = {}) {
    this.id = id;
    this.specialist_id = specialist_id;
    this.day = day;
    this.start_time = start_time;
    this.end_time = end_time;
    this.session_duration = session_duration;
  }

  toJSON() {
    return {
      id: this.id,
      specialist_id: this.specialist_id,
      day: this.day,
      start_time: this.start_time,
      end_time: this.end_time,
      session_duration: this.session_duration
    };
  }
}