# Leave Management System (MERN Stack)

A web-based application designed to streamline leave management processes with JWT authentication, role-based access controls, and analytical dashboards. Built using MongoDB, Express.js, React.js, and Node.js.

---

## ✨ Key Features

- **Role-based access control**:
  - 👩‍💻 Employees: Submit/Cancel requests, view leave history
  - 👨‍💼 Managers: Approve/Reject requests, team calendar
  - 👑 Admins: User management, system configuration
- **Leave types**: Vacation 🌴, Sick 🤒, Personal 🏠, Bereavement
- **Leave status tracking**: Pending, Approved, Rejected, Cancelled
- **Dashboard analytics**:
  - 📊 Department-wise leave trends
  - 📈 Monthly utilization reports
  - 🗓️ Team availability calendar

---

## 🛠 Tech Stack

| Component       | Technology                          |
|-----------------|-------------------------------------|
| **Frontend**    | React.js + TypeScript for the UI |
| **Backend**     | Node.js + Express.js + JavaScript       |
| **Database**    | MongoDB Atlas                      |
| **Authentication** | JWT                             |
| **State Management** | Redux (optional)              |
| **Visualization** | Chart.js                         |

---

## 🚀 Installation

### Prerequisites

- **Node.js** (version 14.x or higher)
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git** (version 2.33 or higher)

### Steps

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/leave-management.git
    ```

2. **Install backend dependencies**
   ```bash
   cd leave-management/backend
   npm install
   ```
3. **Start the development servers**

*Backend* (from `/backend`):
  ```
  npm run dev
  ```

   *Frontend* (from `/frontend`):
  ```
  npm start
  ```
4.**Access the application**

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

**Note:**  
- Make sure your MongoDB Atlas cluster is running and accessible.
- Update the MongoDB connection string and JWT secret as per your setup
---


    



