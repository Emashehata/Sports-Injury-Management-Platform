// shared/models/contact.model.js

export class ContactMessage {
  constructor({
    id = "",
    fullName = "",
    email = "",
    phone = "",
    subject = "",
    message = "",
    status = "unread",
    createdAt = null
  } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.subject = subject;
    this.message = message;
    this.status = status;
    this.createdAt = createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      subject: this.subject,
      message: this.message,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}