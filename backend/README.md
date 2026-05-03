# Stride API — Backend

Express + MongoDB REST API for the Stride task manager.

## Quick start

```bash
cp .env.example .env          # set MONGO_URI + JWT_SECRET
npm install
npm run seed                  # optional: load demo data
npm run dev                   # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

See the [top-level README](../README.md) for the full API reference, schema, and deployment guide (Railway).

## Environment variables

| Var              | Required | Default                                         |
|------------------|----------|-------------------------------------------------|
| `NODE_ENV`       | no       | `development`                                    |
| `PORT`           | no       | `5000`                                           |
| `MONGO_URI`      | **yes**  | —                                                |
| `JWT_SECRET`     | **yes**  | —                                                |
| `JWT_EXPIRES_IN` | no       | `7d`                                             |
| `CLIENT_ORIGINS` | no       | empty (allow all). CSV list of allowed origins.  |

## Layout

```
src/
├── app.js                     # Express app config (middleware, routes, errors)
├── server.js                  # bootstrap
├── config/db.js               # Mongo connection
├── controllers/               # business logic per resource
├── middleware/                # auth, validate, error
├── models/                    # Mongoose schemas
├── routes/                    # express.Router exports
└── utils/                     # ApiError, activity logger, seed
```
