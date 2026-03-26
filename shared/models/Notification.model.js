export class Notification {
  constructor({
    id = "",
    user_id = "",
    title = "",
    message = "",
    date = "",
    read = false
  } = {}) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.message = message;
    this.date = date;
    this.read = read;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      message: this.message,
      date: this.date,
      read: this.read
    };
  }
}