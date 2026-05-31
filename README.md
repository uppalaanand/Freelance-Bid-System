# StudentBid Portal

StudentBid is a professional localized freelance bidding marketplace designed for college students and local business owners (clients). It allows clients to post projects, students to submit bids, and facilitates secure escrow payments, real-time messaging, and profile management.

---

## Tech Stack

### Frontend
* **Core**: React 19 (JavaScript), Vite 6 (stable build configuration)
* **Styling**: Vanilla CSS with Tailwind CSS v4
* **State Management**: Redux Toolkit (auth, projects, bids, payments slices)
* **Routing**: React Router DOM v7 (with protected and role-specific routes)
* **Network & Real-time**: Axios (configured with credentials for HTTP-only cookies) & Socket.io-client

### Backend
* **Runtime**: Node.js & Express
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JWT stored in secure HTTP-only cookies
* **Integrations**: Razorpay Payment Gateway & Cloudinary Media Uploads
* **Real-time communication**: Socket.io for messaging and status triggers

---

## Directory Structure

```text
Freelance-Bid/
├── backend/
│   ├── config/          # DB connection & Razorpay setup
│   ├── controllers/     # Route handler controllers (auth, projects, bids, payments)
│   ├── middleware/      # Authentication, role authorization & validations
│   ├── models/          # Mongoose database schemas (User, Bid, Payment, Project, Profiles)
│   ├── routes/          # Express API route endpoints
│   ├── utils/           # Helper utilities (notifications, tokens, Cloudinary)
│   ├── server.js        # Main entry point for Express & Socket.io
│   └── .env             # Environment variables configuration
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI elements (Navbar, Button, PaymentComponents)
    │   ├── context/     # React contexts (SocketContext)
    │   ├── hooks/       # Custom React hooks (useAuth)
    │   ├── layouts/     # Layout templates (Main, Auth, Dashboard Layouts)
    │   ├── pages/       # Page components (Landing, Login, Dashboard, Profiles, Payments)
    │   ├── redux/       # Store configurations and slices (authSlice, paymentSlice)
    │   ├── services/    # Axios API client handlers (authService, paymentService)
    │   └── utils/       # Utility helpers (formatting currency)
    └── package.json
```

---

## Environment Variables Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file inside the `backend/` folder and populate it with the following configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Integration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Installation & Setup

### 1. Clone the repository and install dependencies
```bash
# Navigate to backend and install packages
cd backend
npm install

# Navigate to frontend and install packages
cd ../frontend
npm install
```

### 2. Run the Servers

#### Running Backend
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

#### Running Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173 (Vite dev server)
```

---

## Key Features & Workflow

1. **Role-Based Authentication**:
   - Register as either a **Student** or **Client**.
   - Sessions are maintained securely via HTTP-only cookies.
   - Login automatically forwards users to their respective dashboards.

2. **Project Bidding Lifecycle**:
   - Clients create project requirements.
   - Students bid on open projects with their bid details and cover letters.
   - Clients review bids, accept one bid, which transitions the project status to **Assigned**.

3. **Secure Escrow Payments (Razorpay)**:
   - When a project is assigned, the client deposits the **Advance Payment** into the system.
   - Razorpay checkout verifies signatures, holding payments in escrow (`paid` status).
   - Once milestones are completed, the client releases the payment (`released` status), updating the student's earnings and client's expenditures.

4. **Real-time Messaging**:
   - Interactive chat room automatically created upon project assignment.
   - Instant message sockets, typing indicators, and real-time portal notifications.

5. **Profile Hub**:
   - Easily manage and showcase professional bio, credentials, posted projects (client) or skills, resume, portfolios, and reviews (student).
