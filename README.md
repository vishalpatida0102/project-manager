# Stride — Team Task Manager (Full-Stack SaaS)

A production-ready, full-stack team task management application with role-based access, drag-and-drop Kanban boards, real-time-style activity feed, and a polished dashboard. Built with the modern JS stack and ready to deploy to Railway + Vercel.

> **One-liner:** _Plan less. Ship more._ A calm command center for projects, tasks, and team momentum.

---

## ✨ Highlights

- **JWT auth** with bcrypt-hashed passwords, role-based access (`admin` / `member`)
- **Projects** — create, edit, archive, color-tag, manage members
- **Tasks** — title, description, assignee, status, priority, due date, ordering
- **Kanban board** — drag-and-drop between columns (`@hello-pangea/dnd`), with optimistic updates
- **Dashboard** — KPI cards, 7-day completion area chart, status donut, upcoming tasks, activity feed
- **Search, filter, paginate** tasks across the workspace
- **Activity log** — every meaningful action recorded and surfaced
- **Dark / Light theme** with no flash of unstyled content
- **Beautiful UX** — Framer Motion animations, skeleton loaders, empty states, toast notifications
- **Responsive** — mobile drawer nav + desktop sidebar
- **Secure** — Helmet, rate-limited auth, validated inputs, CORS allowlist
- **Seedable** — `npm run seed` populates demo users and tasks

---

## 🧱 Tech Stack

**Frontend:** React 18 (Vite), Tailwind CSS, ShadCN-style components, Zustand, React Router, Framer Motion, Recharts, `@hello-pangea/dnd`, Axios, react-hot-toast, lucide-react.

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Helmet, express-validator, express-rate-limit, Morgan.

**Architecture:** MVC backend (routes → controllers → models), feature-organized frontend with shared `ui/` primitives.

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── app.js                # Express app + middleware pipeline
│   │   ├── server.js             # Entrypoint (loads env, connects DB, listens)
│   │   ├── config/db.js          # Mongo connection
│   │   ├── controllers/          # auth, project, task, dashboard, user
│   │   ├── middleware/           # auth (JWT/role), validate, error
│   │   ├── models/               # User, Project, Task, Activity
│   │   ├── routes/               # /auth, /users, /projects, /tasks, /dashboard
│   │   └── utils/                # ApiError, activity logger, seed script
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/               # Button, Card, Input, Modal, Avatar, Badge, …
    │   │   ├── layout/           # AppLayout, AuthLayout, Sidebar, Topbar
    │   │   ├── projects/         # ProjectFormModal
    │   │   └── tasks/            # TaskCard, TaskFormModal
    │   ├── hooks/useAsync.js
    │   ├── lib/                  # api (axios), cn (clsx+twMerge), format helpers
    │   ├── pages/                # Login, Register, Dashboard, Projects, Tasks, Members, Settings, NotFound
    │   ├── store/                # auth (zustand+persist), theme
    │   ├── App.jsx               # Router + guards
    │   ├── main.jsx
    │   └── index.css             # Tailwind layers + ShadCN-style CSS variables
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js ≥ 18**
- **MongoDB** running locally (default `mongodb://127.0.0.1:27017`) or a free **MongoDB Atlas** cluster

### 1. Backend

```bash
cd backend
cp .env.example .env       # then edit .env (set MONGO_URI + JWT_SECRET)
npm install
npm run seed               # optional — creates demo users + projects + tasks
npm run dev                # starts on http://localhost:5000
```

**Demo login (after seeding):**
- Admin: `ada@example.com` / `password123`
- Member: `grace@example.com` / `password123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173 — sign in with the seeded credentials, or register a fresh account (the **first** user created becomes the admin automatically).

---

## 🗃 Database Schema

All collections live in MongoDB; relationships are by `ObjectId` reference.

### `users`
| Field          | Type                    | Notes                                      |
|----------------|-------------------------|--------------------------------------------|
| `_id`          | ObjectId                |                                            |
| `name`         | String                  | required, 2–80 chars                       |
| `email`        | String                  | required, unique, lowercase, indexed       |
| `password`     | String (hashed)         | bcrypt cost 12, `select: false`            |
| `role`         | `admin` \| `member`     | default `member`, indexed                  |
| `avatarColor`  | String (hex)            | UI accent                                  |
| `title`        | String                  | optional                                   |
| `createdAt`    | Date                    |                                            |

### `projects`
| Field         | Type                        | Notes                                  |
|---------------|-----------------------------|----------------------------------------|
| `name`        | String                      | required                               |
| `description` | String                      |                                        |
| `color`       | String (hex)                |                                        |
| `owner`       | ObjectId → User             | required, indexed                      |
| `members`     | ObjectId[] → User           | indexed                                |
| `archived`    | Boolean                     | default `false`                        |

Virtual `taskCount` for counted population.

### `tasks`
| Field         | Type                                       | Notes                              |
|---------------|--------------------------------------------|------------------------------------|
| `title`       | String                                     | required                           |
| `description` | String                                     |                                    |
| `project`     | ObjectId → Project                         | required, indexed                  |
| `assignee`    | ObjectId → User                            | nullable, indexed                  |
| `createdBy`   | ObjectId → User                            | required                           |
| `status`      | `todo` \| `in_progress` \| `completed`     | default `todo`, indexed            |
| `priority`    | `low` \| `medium` \| `high`                | default `medium`, indexed          |
| `dueDate`     | Date                                       | nullable, indexed                  |
| `order`       | Number                                     | column position (Kanban)           |
| `completedAt` | Date                                       | auto-set when `status` = completed |

Compound index `{ project, status, order }` and a text index on `title + description` for search.

### `activities`
| Field   | Type                                             |
|---------|--------------------------------------------------|
| `actor` | ObjectId → User (required)                       |
| `action`| Enum (`project.created`, `task.status_changed`…) |
| `project`, `task`, `target` | ObjectId references               |
| `meta`  | Mixed                                            |

### Relationships
- **User ↔ Project** — many-to-many via `Project.owner` + `Project.members`
- **Project → Task** — one-to-many via `Task.project`
- **Task → User** — many-to-one via `Task.assignee`

---

## 📡 REST API

All `/api/*` routes return JSON. Authenticated routes require either:
- `Authorization: Bearer <token>` header, or
- `token` cookie (sent automatically with `withCredentials: true`)

### Auth
| Method | Path                       | Auth | Description                         |
|--------|----------------------------|------|-------------------------------------|
| POST   | `/api/auth/register`       | —    | Create account; returns `{token,user}` |
| POST   | `/api/auth/login`          | —    | Sign in                              |
| GET    | `/api/auth/me`             | ✅   | Current user                         |
| PATCH  | `/api/auth/me`             | ✅   | Update name/title/avatarColor        |
| POST   | `/api/auth/change-password`| ✅   | Update password                      |

### Users
| Method | Path                     | Auth      | Description                |
|--------|--------------------------|-----------|----------------------------|
| GET    | `/api/users`             | ✅        | List users (search, role)  |
| PATCH  | `/api/users/:id/role`    | admin     | Promote / demote           |
| DELETE | `/api/users/:id`         | admin     | Remove user                |

### Projects
| Method | Path                                     | Auth   | Description              |
|--------|------------------------------------------|--------|--------------------------|
| GET    | `/api/projects`                          | ✅     | List visible projects    |
| GET    | `/api/projects/:id`                      | ✅     | Get one                  |
| POST   | `/api/projects`                          | admin  | Create                   |
| PUT    | `/api/projects/:id`                      | owner/admin | Update              |
| DELETE | `/api/projects/:id`                      | owner/admin | Delete              |
| POST   | `/api/projects/:id/members`              | admin  | Add member               |
| DELETE | `/api/projects/:id/members/:userId`      | admin  | Remove member            |

### Tasks
| Method | Path                       | Auth | Description                                            |
|--------|----------------------------|------|--------------------------------------------------------|
| GET    | `/api/tasks`               | ✅   | List with filters: `project,status,priority,assignee,search,mine,overdue,page,limit,sort` |
| GET    | `/api/tasks/:id`           | ✅   | Get one                                                |
| POST   | `/api/tasks`               | ✅   | Create                                                 |
| PUT    | `/api/tasks/:id`           | ✅   | Update (members can change status/order on own tasks)  |
| PATCH  | `/api/tasks/reorder`       | ✅   | Bulk reorder for Kanban                                |
| DELETE | `/api/tasks/:id`           | owner/admin | Delete                                          |

### Dashboard
| Method | Path                          | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/dashboard`              | KPIs + 7-day trend + upcoming + mine |
| GET    | `/api/dashboard/activity`     | Latest 25 activity entries           |

### Health
| GET `/api/health` → `{status:'ok',uptime,timestamp}`

---

## 🔐 Role-based Permissions

| Action                                     | Member | Admin |
|--------------------------------------------|:------:|:-----:|
| View projects/tasks they belong to         | ✅     | ✅    |
| View **all** projects/tasks                | —      | ✅    |
| Create project                             | —      | ✅    |
| Edit / delete project (as owner)           | ✅*    | ✅    |
| Add / remove project members               | —      | ✅    |
| Create task in a project they belong to    | ✅     | ✅    |
| Edit any task in a project                 | —      | ✅    |
| Update **status / order** of own task      | ✅     | ✅    |
| Delete task                                | —      | ✅ / owner |
| Promote / demote / remove users            | —      | ✅    |

`*` Project owners can edit/delete projects they own even as `member`.

---

## 🎨 Screen Design Inspiration

| Screen | Reference vibe |
|--------|----------------|
| **Auth** | Linear / Vercel — split layout, gradient brand panel left, focused form right |
| **Dashboard** | Notion + Plane — KPI cards, area chart, vertical activity timeline |
| **Projects grid** | Linear — color-spined cards, progress bar, avatar stack, hover-to-elevate |
| **Project board** | Trello + Plane — three-column Kanban, drag handles, optimistic moves |
| **Tasks list** | Asana — filter bar with chips, in-row status select, due-date badges with tone |
| **Members** | GitHub Teams — avatar / role / join date with admin controls |
| **Settings** | Stripe Dashboard — sectioned cards with sticky save buttons |

Color system uses HSL CSS variables (light + dark token sets) so the entire app retunes via two theme blocks in `index.css`.

---

## 🚢 Deployment

### Backend → Railway

1. Push this repo to GitHub.
2. **Create a Railway project** → "Deploy from GitHub repo" → select the repo.
3. Railway will detect the `backend/` folder. Set the **Root Directory** to `backend`.
4. Add a **MongoDB plugin** (or use MongoDB Atlas — recommended for production).
5. Set environment variables (Project → Variables):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<your mongo connection string>
   JWT_SECRET=<long random string, 64+ chars>
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGINS=https://your-frontend.vercel.app
   ```
6. Set the **Start Command** to `npm start`.
7. Generate a public domain. Note the URL — e.g. `https://stride-api.up.railway.app`.

> Tip: After the frontend is live on Vercel, update `CLIENT_ORIGINS` to include the exact origin (no trailing slash). Multiple values are comma-separated.

### Frontend → Vercel

1. **New Project** → import the same repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (Build command `npm run build`, output `dist`).
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
5. Deploy.

### Post-deploy checklist
- [ ] Sign up the first admin
- [ ] Create a project
- [ ] Invite teammates and assign tasks
- [ ] Update `CLIENT_ORIGINS` on Railway to include the Vercel domain (preview + production)
- [ ] Rotate `JWT_SECRET` if it was ever committed
- [ ] Add a custom domain in Vercel (optional)

---

## 🧰 Useful npm scripts

### Backend (`/backend`)
- `npm run dev` — auto-reload via `nodemon`
- `npm start` — production start (used by Railway)
- `npm run seed` — wipe + seed sample data

### Frontend (`/frontend`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build locally

---

## 🧪 Manual smoke test

1. `cd backend && npm install && npm run seed && npm run dev`
2. `cd frontend && npm install && npm run dev`
3. Visit http://localhost:5173 → log in as `ada@example.com / password123`
4. Click **Projects** → open _Website Relaunch_ → drag a card across columns
5. Visit **Dashboard** → KPIs, charts, and activity update
6. Toggle dark/light from the topbar — full app retints in <16ms

---

## 🛡 Security notes

- Passwords hashed with bcrypt (cost 12) and `select: false` on the schema.
- JWT signed with a strong secret; expires in 7 days by default.
- `helmet`, CORS allowlist, JSON body limit, `express-rate-limit` on `/api/auth/*`.
- `express-validator` schema on all mutating endpoints, central error handler normalizes responses.
- No secrets ever logged; production stack traces hidden from clients.

---

## 📜 License

MIT — go build something great with it.
