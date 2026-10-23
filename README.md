# BookLeaf Support Portal

A React and Vite frontend for the existing Express and MongoDB support API. The portal has separate author and admin workspaces and uses the backend's JWT and role checks for access control.

## Run locally

Requirements: Node.js 20.19 or newer and a MongoDB database.

1. Copy `server/.env.example` to `server/.env`, then configure `MONGO_URI` and a strong `JWT_SECRET`. `GEMINI_API_KEY` is optional; keep it only on the server. `GEMINI_MODEL` can select the model used by the server-side classification and draft endpoints.
2. Start the backend:

   ```sh
   cd server
   npm install
   npm run seed
   npm run dev
   ```

   The API listens on port 5000 by default. The seed script creates demo users and sample books and prints local demo credentials in the backend terminal. Use `admin@bookleaf.local` for the admin demo or `priya.sharma@email.com` for the author demo. Do not reuse seeded demo accounts outside local development.

3. In a second terminal, start the frontend:

   ```sh
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite development proxy forwards `/api` requests to `http://localhost:5000`. Leave `VITE_API_URL` blank for this local setup. If your backend uses another port or host, update `VITE_API_PROXY_TARGET`. For a deployed API, set `VITE_API_URL` to its origin and configure the hosting setup to serve the frontend and API on compatible origins; the current Express app does not enable cross-origin requests.

## Frontend behavior

- Login posts to `POST /api/auth/login`, stores the returned JWT in local storage, and sends it as a bearer token. On startup, `GET /api/auth/me` validates an existing session. A 401 clears the stored token and returns the user to login.
- Authors load their own books from `GET /api/author/books`, create tickets with `POST /api/author/tickets`, and read tickets and public conversation messages from `GET /api/author/tickets`. The backend scopes these routes to the authenticated author's `authorId` and removes internal messages from the author ticket response.
- Admins load and filter tickets through `GET /api/admin/tickets`, update category, priority, and status with `PATCH /api/admin/tickets/:ticketId`, assign tickets with `PATCH /api/admin/tickets/:ticketId/assign`, and store public replies or internal notes with `POST /api/admin/tickets/:ticketId/messages`.
- The admin AI draft button calls `POST /api/admin/tickets/:ticketId/draft-reply`. It fills an editable composer only; it does not send or save the draft. Sending a public reply stores it in the ticket conversation; the backend does not send email.
- The API does not have a per-ticket detail endpoint. Detail pages find a ticket in the existing author or admin list response. The admin list is limited to 200 tickets, so an older ticket outside that response cannot be opened directly from the detail page. The API also has no author reply endpoint; authors can read public replies but cannot post a reply from this frontend.

## Security and limitations

- Do not put `GEMINI_API_KEY`, `JWT_SECRET`, or database credentials in `client` or any `VITE_*` variable. Vite variables are bundled into browser code.
- The frontend does not log credentials or ticket contents and does not render ticket content as HTML. Backend authorization remains authoritative; client-side route guards are only a navigation aid.
- Seed demo credentials are for local assignment use only. Do not deploy the seeded accounts as production users.
- The backend currently has no CORS middleware. The local Vite proxy avoids CORS during development. For separate production origins, configure a reverse proxy or add a specific allowed frontend origin to the backend.
- Ticket creation uses the backend's current defaults (`General Inquiry`, `Medium`); the current author controller does not invoke AI classification. AI reply drafting is a separate admin action and may return a rule-based fallback when server AI is unavailable.

## Build

```sh
cd client
npm run build
```
