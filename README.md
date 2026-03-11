# 💰 RupeeRadar — Personal Finance Tracker & Budget Analyzer

A full-stack personal finance management app that helps you track income & expenses, set category-wise budgets, get budget alerts, and visualize your spending patterns.

## Features

- **Authentication** — Register, login, and forgot/reset password via email
- **Transaction Management** — Add, edit, delete income & expense transactions with pagination
- **Budget Limits** — Set per-category budget limits (food, transport, shopping, etc.)
- **Budget Alerts** — Warnings when nearing or exceeding budget limits
- **Monthly Insights** — Month-over-month spending comparisons in ₹ with top category analysis
- **Charts & Visualizations** — Spending pie chart and monthly bar chart (Recharts)
- **CSV Export** — Download transactions as a CSV file
- **Toast Notifications** — Real-time feedback on all actions
- **Password Reset** — Email-based reset flow using Nodemailer
- **Rate Limiting** — Brute-force protection on auth endpoints
- **Loading States** — Spinner while dashboard data loads

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router, Axios, Recharts |
| **Backend** | Node.js, Express 5, Mongoose, JWT, Bcrypt |
| **Database** | MongoDB (Atlas) |
| **Email** | Nodemailer (Gmail) |
| **Deployment** | Vercel (frontend) + Render (backend) |

## Project Structure

```
finance-tracker/
├── backend/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── mailer.js        # Nodemailer transport
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── models/
│   │   ├── User.js          # User schema (with budgets)
│   │   └── Transaction.js   # Transaction schema
│   ├── routes/
│   │   ├── auth.js          # Register, login, forgot/reset password
│   │   ├── transactions.js  # CRUD + pagination
│   │   └── summary.js       # Monthly summary, CSV export, budget update
│   └── server.js            # Express app entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── BudgetAlert.jsx
│       │   ├── BudgetSettings.jsx
│       │   ├── Insights.jsx
│       │   ├── TransactionForm.jsx
│       │   ├── TransactionList.jsx
│       │   └── Charts/
│       │       ├── MonthlyBarChart.jsx
│       │       └── SpendingPieChart.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPassword.jsx
│       │   └── ResetPassword.jsx
│       └── utils/
│           └── api.js        # Axios instance with auth interceptor
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) (for email features)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/financetracker
JWT_SECRET=your_random_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Optionally create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/transactions?page=1&limit=10` | Get paginated transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/summary/monthly` | Get monthly summary + alerts |
| GET | `/api/summary/export` | Export transactions as CSV |
| PUT | `/api/summary/budgets` | Update budget limits |

## Deployment

- **Frontend** — Deployed on [Vercel](https://vercel.com) with SPA rewrites
- **Backend** — Deployed on [Render](https://render.com) as a web service
- **Database** — MongoDB Atlas (free tier)

## License

MIT