# Sachivalayam Portal (Government Services & Grievance Redressal)

This version splits the app into two independent projects, the standard
architecture for full-stack web apps:

```
govportal-react/
├── backend/    Node.js + Express REST API (returns JSON only)
└── frontend/   React (Vite) single-page application
```

The **backend** has no knowledge of HTML/views — it's a pure REST API.
The **frontend** is a separate React app that calls that API over HTTP using `axios`,
and manages its own routing with `react-router-dom`.

## Tech Stack

**Backend (API):**
- Node.js + Express
- **MongoDB Atlas** via Mongoose (cloud-hosted database — no local DB server needed)
- JWT (`jsonwebtoken`) for stateless authentication
- bcrypt.js for password hashing
- Multer for file uploads (documents/attachments)
- Nodemailer for email notifications
- CORS enabled for the frontend's origin

**Frontend (SPA):**
- React 18 + Vite
- React Router for client-side routing
- Axios for API calls (with an interceptor that attaches the JWT token)
- Context API for global auth state
- Bootstrap 5 + Font Awesome (via CDN) for styling, including the Offcanvas sidebar/hamburger menu
- jsPDF for client-side PDF receipt/certificate downloads
- Recharts for the admin dashboard charts

## How Authentication Works Across Two Origins

Since the frontend (`localhost:5173`) and backend (`localhost:5000`) run on
different ports/origins, there's no shared session cookie. Instead:

1. On login/register, the backend returns a **JWT token**.
2. The frontend stores it in `localStorage`.
3. Every subsequent API request automatically attaches it as
   `Authorization: Bearer <token>` (see `frontend/src/api/axios.js`).
4. The backend verifies the token on protected routes (see `backend/middleware/auth.js`).

## Running the Project

You need **two terminal windows** — one for each app — plus a free MongoDB
Atlas cluster.

### 0. Set up MongoDB Atlas (one-time)

1. Create a free account/cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user with a username/password.
3. **Network Access** → add your current IP (or `0.0.0.0/0` for "allow from anywhere" while developing).
4. **Database** → your cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Add a database name to the path, e.g. `.../sachivalayam_portal?retryWrites=true&w=majority` — Mongo creates the database automatically on first write.

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
```

Open `.env` and paste your Atlas connection string into `MONGODB_URI`. The
`FRONTEND_URL` value is used to build the link inside password-reset emails
— keep it as `http://localhost:5173` for local development. Then:

```bash
npm start
```

Runs at **http://localhost:5000**. On first run it connects to your Atlas
cluster, seeds the 8 default services, 8 welfare schemes (each with its own
application form + document list), and creates a default admin account —
check your terminal for the generated admin email/password.

> If you're upgrading an existing database that was seeded before scheme
> applications were added, drop the `schemes` collection (or the whole
> database) once so it can reseed with the new `form_fields`/
> `required_documents` — otherwise old scheme documents won't have an
> application form to render.

### 2. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
npm run dev
```

Runs at **http://localhost:5173**. Open that URL in your browser — this is
the app you interact with. It talks to the backend API automatically.

> Both servers must be running at the same time for the app to work.

## API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Create a citizen account |
| POST | `/api/login` | Log in, returns JWT |
| GET | `/api/me` | Get current authenticated user |
| PUT | `/api/me` | Update own name/phone (auth required) |
| PUT | `/api/me/password` | Change own password (auth required) |
| POST | `/api/forgot-password` | Request a password-reset email |
| POST | `/api/reset-password` | Complete a password reset using the emailed token |
| GET | `/api/services` | List/search/filter services |
| GET | `/api/services/:id` | Service detail |
| POST | `/api/services/:id/apply` | Submit application + documents (auth required) |
| GET | `/api/applications/mine` | Citizen's own applications (auth required) |
| GET | `/api/applications/track/:applicationNumber` | Public status tracking |
| GET | `/api/complaints/categories` | List complaint categories |
| POST | `/api/complaints` | File a complaint + attachment (auth required) |
| GET | `/api/complaints/mine` | Citizen's own complaints (auth required) |
| GET | `/api/complaints/track/:complaintNumber` | Public status tracking |
| GET | `/api/schemes` | List/search/filter government welfare schemes |
| GET | `/api/schemes/:id` | Scheme detail (used by the apply form) |
| POST | `/api/schemes/:id/apply` | Submit scheme application + documents (auth required) |
| GET | `/api/scheme-applications/mine` | Citizen's own scheme applications (auth required) |
| GET | `/api/scheme-applications/track/:applicationNumber` | Public status tracking |
| GET | `/api/notifications/mine` | Citizen's own in-app notifications (auth required) |
| PUT | `/api/notifications/:id/read` / `/mark-all-read` | Mark notification(s) as read (auth required) |
| POST | `/api/contact` | Submit a contact-us message |
| GET | `/api/admin/dashboard` | Admin stats + charts data (admin only) |
| GET/PUT | `/api/admin/applications` ... `/:id/status` | Manage applications (admin only) |
| GET/PUT | `/api/admin/scheme-applications` ... `/:id/status` | Manage scheme applications (admin only) |
| GET/PUT | `/api/admin/complaints` ... `/:id/status` | Manage complaints (admin only) |
| GET/PUT | `/api/admin/services` ... `/:id/toggle` | Manage services (admin only) |
| GET/PUT | `/api/admin/schemes` ... `/:id/toggle` | Manage schemes (admin only) |
| GET/PUT | `/api/admin/users` ... `/:id/role` / `/:id/toggle` | Manage citizen/admin accounts (admin only) |
| GET/PUT | `/api/admin/contact-messages` ... `/:id/read` | View contact-us submissions (admin only) |

## Frontend Pages

- **Home** — project intro, quick links, popular services
- **About** — what Sachivalayam is, project purpose, citizen benefits
- **Contact** — support email/phone + contact form
- **Services & Schemes** (`/services`) — tabs for Browse Services, Government Schemes (now with an online Apply flow), and Track Application (auto-detects service vs. scheme application numbers)
- **Complaint Portal** (`/complaints`) — tabs for Register Complaint and Track Complaint
- **My Profile** (`/profile`) — edit name/phone, change password
- **Forgot/Reset Password** (`/forgot-password`, `/reset-password`) — email-based password recovery
- **My Applications / My Scheme Applications / My Complaints** — citizen's own records with PDF receipt/certificate downloads
- **Notification bell** (navbar) — surfaces the citizen's own in-app notifications with an unread-count badge
- **Admin Dashboard** — stats, pie/bar charts, and management of applications, scheme applications, complaints, services, schemes, users, and contact messages

A hamburger icon in the navbar opens a slide-out sidebar with the full site
navigation (Home, About, Services, Schemes, Track Application, File/Track
Complaint, My Account, Admin, Contact) — this keeps the top navbar
uncluttered while still surfacing the tracking tools from anywhere.

## Notes for Presentation

- This is a **decoupled / client-server architecture**: the frontend and
  backend can be deployed independently (e.g. frontend on Vercel/Netlify,
  backend on Render/Railway), and could be swapped out — the backend could
  serve a mobile app instead of a web app, with zero changes.
- Authentication is **stateless** (JWT), which scales better across multiple
  backend instances than server-side sessions.
- Because data now lives in **MongoDB Atlas** (a managed cloud database)
  instead of a local SQLite file, your data persists properly even on hosts
  with an ephemeral filesystem (Render free tier, serverless platforms,
  container restarts, etc.) — only the locally-stored uploaded files
  (`backend/uploads/`) still need a persistent disk or cloud storage (S3) in
  production.
- For production: move `JWT_SECRET` to a strong secret, restrict `CORS_ORIGIN`
  to your real frontend domain, restrict MongoDB Atlas Network Access to
  your server's IP instead of "allow from anywhere", and consider storing
  uploaded files in cloud storage (S3, etc.) instead of local disk.
