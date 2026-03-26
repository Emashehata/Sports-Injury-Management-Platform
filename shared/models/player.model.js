export class Player {
  constructor({
    id = "",
    user_id = "",
    age = 0,
    sport = "",
    club_id = ""
  } = {}) {
    this.id = id;
    this.user_id = user_id;
    this.age = age;
    this.sport = sport;
    this.club_id = club_id;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      age: this.age,
      sport: this.sport,
      club_id: this.club_id
    };
  }
}