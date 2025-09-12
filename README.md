Smart Grocery List & Expense Tracker (Full Stack)

Java Spring Boot + MongoDB backend with React Native mobile app and web frontend.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3.3, MongoDB
- **Mobile**: React Native (Expo)
- **Web**: React (UMD) + Express (legacy)
- **Database**: MongoDB with Docker

## Quick Start

### 1) Prerequisites
- Java 17+
- Node.js 18+ and npm
- Docker (for MongoDB)
- Maven

### 2) Start MongoDB
```bash
docker compose up -d
```

### 3) Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### 4) Mobile App (React Native)
```bash
cd mobile
npm install
npx expo start
```
Scan QR code with Expo Go app on your phone.

### 5) Web App (Legacy)
```bash
npm install
npm run dev
```
Web app runs on `http://localhost:3000`

## Features
- **Auth**: JWT-based authentication
- **Grocery List**: Add, toggle, delete items with categories
- **Expense Tracker**: Track spending with totals
- **Mobile**: Native iOS/Android app
- **Web**: Browser-based interface

## API Endpoints
Base URL: `http://localhost:8080/api`

- **Auth**: `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- **Groceries**: `GET /groceries`, `POST /groceries`, `PUT /groceries/:id`, `DELETE /groceries/:id`
- **Expenses**: `GET /expenses`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id`

## Project Structure
```
├── backend/           # Spring Boot API
├── mobile/            # React Native app
├── data/             # MongoDB data (gitignored)
├── docker-compose.yml # MongoDB setup
└── README.md
```

## Troubleshooting
- **MongoDB**: Ensure Docker is running and `docker compose up -d` succeeded
- **Backend**: Check Java 17+ with `java -version`
- **Mobile**: Install Expo Go app, ensure phone and computer are on same network
- **Web**: Hard refresh (Ctrl+F5) if assets don't load

## Publish to GitHub
```bash
git init
git add .
git commit -m "Initial release: Spring Boot + React Native"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

