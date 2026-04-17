# 🏥 SportCare - Sports Injury Management Platform

## 📌 Overview

SportCare is a **web-based sports injury management system** that connects **players** with **medical specialists**.

The platform helps in:
- Managing sports injuries
- Booking medical appointments
- Tracking player injury history
- Improving communication between players and specialists

---

## 🎯 System Roles

### 👤 Player
- Register & Login
- Book appointments
- View injury history
- Track medical records

### 🧑‍⚕️ Specialist
- Set availability schedule
- View appointments
- Start examination sessions
- Add injury diagnosis

### 🛠️ Admin
- Manage players
- Manage specialists
- Manage injuries
- Manage news
- View contact messages

---

## 🔄 System Workflow

1. Player registers & logs in  
2. Player books appointment with specialist  
3. Specialist views appointment  
4. Specialist starts examination  
5. Specialist adds injury diagnosis  
6. Injury is saved in player history  

---

## 🧠 Project Architecture

The project follows a **modular structure**:

- **Pages Layer** → UI (HTML)
- **Services Layer** → API handling (Firebase)
- **Models Layer** → Data structure
- **Shared Components** → Navbar, Sidebar, Footer

---

## 🛠️ Technologies Used

| Technology | Usage |
|----------|------|
| HTML5 | Structure |
| CSS3 | Styling |
| Bootstrap 5 | Responsive Design |
| JavaScript | Logic |
| Firebase Realtime DB | Backend |
| Font Awesome | Icons |

---

## 🔥 Database (Firebase)

We use **Firebase Realtime Database (NOT Firestore)**

### 📦 Collections Structure

```json
users/
players/
specialists/
injuries/
appointments/
availability/
contact_messages/
```
---
## 📂 Project Structure
 project-root/
│
├── pages/
│ ├── Home/
│ ├── Players/
│ ├── Specialists/
│ ├── Injuries/
│ ├── News/
│ └── Contact/
│
├── services/
│ ├── user_services.js
│ ├── injury_services.js
│ ├── appointment_services.js
│ └── availability_services.js
│
├── shared/
│ ├── js/
│ │ ├── navbar.js
│ │ ├── sidebar.js
│ │ └── toaster.js
│ │
│ ├── models/
│ └── components/
│
├── css/
│
└── index.html

---
## 📬 Contact

For any inquiries, collaboration, or feedback, feel free to reach out:

- 👩‍💻 Alyaa Shahin  
  📧 Email: alyaa.shahin@example.com  
  🔗 LinkedIn: https://www.linkedin.com/in/alyaa-shahin  

- 👩‍💻 Eman Shehata  
  📧 Email: eman.shehata@example.com  
  🔗 LinkedIn: https://www.linkedin.com/in/eman-shehata
---
