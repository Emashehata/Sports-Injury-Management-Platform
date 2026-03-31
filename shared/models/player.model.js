export class Player {
  constructor({
    id = "",
    age = 0,
    sport = "",
    height = 0,
    weight = 0

  } = {}) {
    this.id = id; 
    this.age = age;
    this.sport = sport;
    this.height = height;
    this.weight = weight;
  }

  toJSON() {
    return {
      age: this.age,
      sport: this.sport,
      height: this.height,
      weight: this.weight
    };
  }

  isValid() {
    return this.id !== "" && this.age > 0;
  }
}