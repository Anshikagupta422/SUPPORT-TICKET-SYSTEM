# Mini Customer Support Portal (MERN Stack)

A support ticket system where users can raise tickets, admins can triage and resolve
them, and both sides can converse via comments — with a full activity timeline per ticket.

**Stack:** MongoDB + Express.js + React.js (Vite) + Node.js, JWT-based auth with
user/admin roles.

## Features

- **Auth** — register/login, JWT-protected routes, `user` and `admin` roles.
- **Create tickets** — title, description, category, priority.
- **Statuses** — Open → In Progress → Resolved → Closed.
- **Admin management** — view *all* tickets, update status, priority, category, assignment.
- **Search & filters** — full-text search on title/description, filter by status, priority, category, with pagination.
- **Comments** — users and admins reply on a ticket; conversation shown chronologically.
- **Activity timeline (bonus)** — every important event (created, status/priority/category changed, comment added, assigned) is logged and shown per ticket.

## Project Structure

```
support-ticket-system/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # authController, ticketController, commentController
│   ├── middleware/         # auth (JWT + role guard), errorHandler
│   ├── models/              # User, Ticket, Comment, Activity
│   ├── routes/               # authRoutes, ticketRoutes
│   ├── utils/                # validators, generateToken, logActivity, seed.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js       # axios instance + JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/        # Navbar, TicketCard, TicketFilters, CommentSection,
    │   │                       # ActivityTimeline, StatusBadge, PriorityBadge, Pagination, ProtectedRoute
    │   ├── pages/              # Login, Register, TicketList, NewTicket, TicketDetail, AdminDashboard
    │   └── styles.css
    └── .env.example
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

## Setup & Run (local development)

### 1. Backend

```bash
cd backend
cp .env.example .env       # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev                 # starts on http://localhost:5000 (nodemon)
```

Optional: seed a demo admin + user account:

```bash
npm run seed
# creates admin@example.com / admin123  (role: admin)
# creates user@example.com  / user1234  (role: user)
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL should point at the backend, e.g. http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a user (or log in with the seeded accounts), and start creating tickets.

### 3. Creating an admin account

For safety, the public `/api/auth/register` endpoint only ever creates `user` accounts
unless the request includes `adminSecret` matching `ADMIN_SIGNUP_SECRET` in the backend
`.env`. The simplest path is `npm run seed` (see above), or set `ADMIN_SIGNUP_SECRET`
in `.env` and register with `role: "admin"` + the matching `adminSecret` field via the API.

## Environment Variables

**backend/.env**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port the API listens on (default 5000) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated |

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

## API Overview

All ticket/comment routes require `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Private | Current user profile |
| POST | `/api/tickets` | Private | Create a ticket |
| GET | `/api/tickets` | Private | List tickets (own for users, all for admins). Query: `search, status, priority, category, page, limit` |
| GET | `/api/tickets/:id` | Private | Get a single ticket |
| PATCH | `/api/tickets/:id/status` | Admin | Update ticket status |
| PATCH | `/api/tickets/:id` | Admin | Update priority/category/assignment |
| DELETE | `/api/tickets/:id` | Admin | Delete a ticket |
| GET | `/api/tickets/:id/comments` | Private | List comments, chronological |
| POST | `/api/tickets/:id/comments` | Private | Add a comment |
| GET | `/api/tickets/:id/activity` | Private | Get the activity timeline (bonus feature) |

## Design Notes

- **Validation & error handling**: `express-validator` on every write route, plus a
  centralized `errorHandler` that normalizes Mongoose cast/validation/duplicate-key
  errors into consistent JSON responses.
- **Authorization**: regular users can only see/comment on their own tickets; only
  admins can change status/priority/category or view the full ticket list.
- **Activity log**: a dedicated `Activity` collection is written to on every
  meaningful mutation (ticket created, status/priority/category changed, comment
  added, assignment changed) and rendered as a timeline in the ticket detail view.

## Deployment

- **Backend**: deploy to Render / Railway / Fly.io — set the env vars above, point
  `MONGO_URI` at an Atlas cluster, and set `CLIENT_URL` to your deployed frontend URL.
- **Frontend**: deploy to Vercel / Netlify — set `VITE_API_URL` to your deployed
  backend's `/api` URL, build command `npm run build`, output dir `dist`.

*(Deployed URL and GitHub repo link to be added here once pushed/hosted.)*
