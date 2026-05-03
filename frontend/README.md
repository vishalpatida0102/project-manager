# Stride — Frontend

React 18 + Vite + Tailwind app for the Stride task manager.

## Quick start

```bash
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

Build for production:

```bash
npm run build                 # outputs dist/
npm run preview               # preview locally
```

See the [top-level README](../README.md) for the full setup guide and deployment instructions (Vercel).

## Stack

- **React 18** with React Router v6 (route guards, nested layouts)
- **Tailwind CSS** with HSL CSS-variable theme tokens (light + dark)
- **Zustand** for auth & theme state (auth state is persisted)
- **Axios** with request/response interceptors (auto-attaches token, handles 401)
- **Recharts** for the dashboard area + donut charts
- **Framer Motion** for page/card animations
- **`@hello-pangea/dnd`** for the Kanban board
- **react-hot-toast** for notifications
- **lucide-react** icons

## Path aliases

`@/*` resolves to `./src/*` (configured in `vite.config.js`).

## Key files

| Path                                  | Purpose                                  |
|---------------------------------------|------------------------------------------|
| `src/App.jsx`                         | Router + auth guards                     |
| `src/lib/api.js`                      | Axios client with interceptors           |
| `src/store/auth.js`                   | Auth store (login/register/me/logout)    |
| `src/store/theme.js`                  | Light/dark theme store                   |
| `src/components/ui/*`                 | ShadCN-style primitives                  |
| `src/components/layout/*`             | App shell (Sidebar, Topbar, layouts)     |
| `src/pages/*`                         | One file per route                       |
| `src/index.css`                       | Tailwind layers + theme tokens           |
