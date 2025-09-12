Smart Grocery List & Expense Tracker (Full Stack)

Local full‑stack app with Express backend and a React (UMD) frontend. Data is stored locally in JSON files per authenticated user.

Quick Start
1) Prerequisites
- Node.js 18+ and npm

2) Install
```bash
npm install
```

3) Run locally (development)
```bash
npm run dev
```
Open `http://localhost:3000` and create an account on the login screen.

4) Run locally (production)
```bash
npm start
```

Features
- Auth (signup/login/logout) with cookie session
- Per‑user local storage in `data/users/<username>/`
- Grocery list with PDF export (invoice‑style)
- Expense tracker with totals

API
Base URL: `http://localhost:3000/api`

- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Expenses: `GET /expenses`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id`
- Groceries: `GET /groceries`, `POST /groceries`, `PUT /groceries/:id`, `DELETE /groceries/:id`

Data & Persistence
- User data is saved under `data/users/<username>/expenses.json` and `groceries.json`.
- The entire `data/` folder is git‑ignored; the app creates files automatically.

Troubleshooting
- If the app always shows login after refresh, ensure cookies are enabled and restart the server.
- If assets don’t load, hard refresh (Ctrl+F5) or restart: `npm run dev`.
- Ensure Node 18+: `node -v`.

Publish to GitHub
```bash
git init
git add .
git commit -m "Initial public release"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

