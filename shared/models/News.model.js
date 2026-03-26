export class News {
  constructor({
    id = "",
    title = "",
    content = "",
    image = "",
    date = ""
  } = {}) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.image = image;
    this.date = date;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      image: this.image,
      date: this.date
    };
  }
}