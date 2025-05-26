
# 💼 SafeGain – Secure Investment Platform

SafeGain is a modern, full-stack investment platform designed for secure USDT-based investments with a fixed-cycle return system. The platform includes a powerful admin panel, real-time notifications, referral bonuses, and both web & mobile-ready interfaces.

---

## 🔗 Project Structure

```
SafeGain/
├── safegain-api/         # Node.js + MongoDB backend
├── safegain-frontend/    # React frontend
```

---

## 🚀 Live Features

- ✅ 6-hour fixed investment cycles with 10% return
- ✅ Manual deposit (USDT/TRC20) with admin approval
- ✅ Automated withdrawal cycle logic
- ✅ Dynamic user dashboard with countdowns
- ✅ Firebase-ready push notifications
- ✅ SendGrid-powered email system
- ✅ Role-based admin control (Users, Investments, Withdrawals, Packages)
- ✅ Referral system with bonus calculation

---

## 🧑‍💻 How to Run Locally

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/your-username/SafeGain.git
cd SafeGain
```

---

### 🔹 2. Run the Backend (`safegain-api`)

```bash
cd safegain-api
npm install
cp .env.example .env   # or create your own .env
npm run start
```

**Sample `.env` file for backend:**
```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=no-reply@safegain.com
FRONTEND_URL=http://localhost:5173
```

---

### 🔹 3. Run the Frontend (`safegain-frontend`)

```bash
cd ../safegain-frontend
npm install
npm run dev
```

---

## ⚙️ Technology Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React, Heroicons, Axios       |
| Backend    | Node.js, Express, MongoDB     |
| Email      | SendGrid (via Nodemailer)     |
| Auth       | JWT Tokens                    |
| Realtime   | Firebase Push (optional)      |
| Styling    | Custom CSS Modules            |

---

## 📁 Key Features for Admins

- Manage Users (CRUD)
- Approve/Reject Investments
- Auto-create Withdrawals
- Add/Edit/Delete Investment Packages
- Send Notifications (Email + Push)
- Full Activity Logs (Notifications, Investments)

---

## ✅ Credits

Built with ❤️ by [Your Name](https://your-portfolio.com)  
SendGrid, Firebase, Railway, MongoDB Atlas

---

## 📄 License

This project is licensed under the MIT License.
