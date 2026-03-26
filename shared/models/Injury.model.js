export class Injury {
  constructor({
    id = "",
    player_id = "",
    specialist_id = "",
    injury_type = "",
    diagnosis = "",
    injury_date = ""
  } = {}) {
    this.id = id;
    this.player_id = player_id;
    this.specialist_id = specialist_id;
    this.injury_type = injury_type;
    this.diagnosis = diagnosis;
    this.injury_date = injury_date;
  }

  toJSON() {
    return {
      id: this.id,
      player_id: this.player_id,
      specialist_id: this.specialist_id,
      injury_type: this.injury_type,
      diagnosis: this.diagnosis,
      injury_date: this.injury_date
    };
  }
}