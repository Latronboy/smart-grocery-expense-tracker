Contributing

Local setup
1. Install Node 18+
2. Install deps: `npm install`
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`

Project structure
- `server.js`: Express backend (serves static site and JSON APIs)
- `index.html`, `script.js`, `style.css`: Frontend
- `data/`: Local persistence (gitignored). User data under `data/users/<username>/`

APIs
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Groceries: `GET/POST /api/groceries`, `PUT/DELETE /api/groceries/:id`
- Expenses: `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/:id`

Publishing to GitHub
```bash
git init
git add .
git commit -m "Initial public release"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Guidelines
- Prefer small PRs with clear descriptions
- Keep code formatting consistent
- Avoid committing files under `data/`

