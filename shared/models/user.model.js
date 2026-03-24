export class User {
  constructor({
    id = "",
    name = "",
    email = "",
    password = "",
    phone = "",
    imgPath = "",
    user_type = "player"
  } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.imgPath = imgPath;
    this.user_type = user_type;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      imgPath: this.imgPath,
      user_type: this.user_type
    };
  }
}