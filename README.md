# BookLeaf Support Portal

A support portal for BookLeaf authors and support administrators. Authors can review their books, create tickets, and read public replies. Admins can triage tickets, add internal notes, and prepare editable AI reply drafts.

## Use the hosted portal

Open the [BookLeaf login page](https://client-git-main-nitin01924s-projects.vercel.app/login) and sign in with an account provided by the service administrator. The repository does not list a public backend address or confirm which accounts are enabled on the hosted service, so the local demo accounts below may not work on the hosted portal.

After signing in:

- **Authors:** open **Books** to view your titles, **New ticket** to ask for help, and **Tickets** to review ticket status and public replies.
- **Admins:** open the ticket queue to filter and assign requests, update ticket fields, add a public reply or private internal note, or generate an editable reply draft.

An AI draft is only a starting point. Review it before submitting. Submitting a public reply saves it to the ticket conversation; this app does not send email.

## Run it on your computer

You’ll need Node.js 20.19+ (or 22.12+) and a local MongoDB database or MongoDB Atlas account.

```sh
git clone https://github.com/nitin01924/bookleaf-support-portal.git
cd bookleaf-support-portal

cd server
npm ci
cp .env.example .env
```

Edit `server/.env`: set `MONGO_URI` to your database and set `JWT_SECRET` to a long, private value. The example file uses a local MongoDB address. Gemini is optional; without a `GEMINI_API_KEY`, the server returns a rule-based reply draft.

Seed the development sample data and start the API:

```sh
npm run seed
npm run dev
```

Open a second terminal at the cloned repository's root, then install and start the frontend:

```sh
cd client
npm ci
cp .env.example .env
npm run dev
```

Open the local address shown by Vite (usually [http://localhost:5173/login](http://localhost:5173/login)). The frontend's development proxy sends API requests to `http://localhost:5000`. If your server uses another address or port, update `VITE_API_PROXY_TARGET` in `client/.env`.

The seed script creates sample authors and books plus these **local demo-only** sign-ins:

| Role | Email | Password |
|---|---|---|
| Author | `priya.sharma@email.com` | `Author@12345` |
| Admin | `admin@bookleaf.local` | `Admin@12345` |

Do not use the seed script or demo passwords for production accounts. It updates matching sample books/authors and creates demo users; it does not delete unrelated database records.

## Host your own copy

The project can be run as a web service with a frontend on Vercel, an API on Render, and MongoDB Atlas. Configure:

1. **Vercel:** set the project root to `client`, build with `npm run build`, output `dist`, and set `VITE_API_URL` to your Render API origin.
2. **Render:** set the service root to `server`, build with `npm ci`, start with `npm start`, and add `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` in the service environment. Add `GEMINI_API_KEY` only if you want live Gemini drafts.
3. **Atlas:** create a database user and allow access from the Render service. Keep credentials in provider settings, not in the repository.

Set `FRONTEND_URL` to the frontend origin only (for example, `https://your-site.vercel.app`, without `/login`). Set Vercel's `VITE_API_URL` to the API origin only; the client adds its `/api/...` paths. The deployed backend URL is not published in this repository, so you must use the address from your own Render service. The app has no dedicated health endpoint; `GET /` is a basic reachability check.

## Project details

- **Sign-in:** JWT authentication with author/admin role checks.
- **Privacy:** author API responses are scoped to the signed-in author; internal admin notes are removed from author ticket responses.
- **AI:** classification code exists but is not automatically called when an author creates a ticket. Admins can request an on-demand Gemini reply draft. Missing keys or model failures use a rule-based fallback, which is identified separately from a Gemini result.
- **Limitations:** ticket lists are capped at 200 for admins; there is no email delivery, file upload endpoint, author reply endpoint, or dedicated health route.

Repository: [BookLeaf Support Portal on GitHub](https://github.com/nitin01924/bookleaf-support-portal) · Hosted frontend: [BookLeaf login](https://client-git-main-nitin01924s-projects.vercel.app/login)
