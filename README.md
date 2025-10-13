# Smart Grocery List & Expense Tracker

A full-stack application for managing grocery lists and tracking expenses with both web and mobile interfaces.

## Features

- 🔐 **User Authentication** - Secure login/signup with JWT tokens
- 🛒 **Grocery List Management** - Add, edit, delete grocery items
- 💰 **Expense Tracking** - Track and categorize expenses
- 📱 **Mobile App** - React Native mobile application
- 🌐 **Web Interface** - Responsive web application
- 📊 **Data Visualization** - Charts and analytics
- 🔄 **Real-time Sync** - Data syncs between web and mobile

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Web interface
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Native Paper** - UI components

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git**
- For mobile development: **Expo CLI**

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Latronboy/smart-grocery-expense-tracker
   cd Expense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install mobile dependencies** (if using mobile app)
   ```bash
   cd mobile
   npm install
   cd ..
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### IP Address Configuration

For mobile app development, update the IP address in:
- `mobile/src/screens/LoginScreen.js`
- `mobile/App.js`

Replace `192.168.35.194` with your computer's IP address.

## Running the Application

### Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Or run directly
node server.js
```

The server will start on `http://localhost:3000`

### Web Application

1. Open your browser
2. Navigate to `http://localhost:3000`
3. Use the default credentials:
   - **Username**: `admin`
   - **Password**: `password123`

### Mobile Application

1. Install Expo CLI globally:
   ```bash
   npm install -g @expo/cli
   ```

2. Start the mobile app:
   ```bash
   cd mobile
   npx expo start
   ```

3. Scan the QR code with Expo Go app on your phone

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Groceries
- `GET /api/groceries` - Get user's grocery list
- `POST /api/groceries` - Add new grocery item
- `PUT /api/groceries/:id` - Update grocery item
- `DELETE /api/groceries/:id` - Delete grocery item

### Expenses
- `GET /api/expenses` - Get user's expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Project Structure

```
Expense/
├── backend/                 # Java Spring Boot backend (legacy)
├── mobile/                  # React Native mobile app
│   ├── src/
│   │   └── screens/        # Mobile screens
│   ├── App.js              # Mobile app entry point
│   └── package.json
├── data/                   # Data storage
│   ├── auth/              # User authentication data
│   └── users/             # User-specific data
├── public/                 # Static web assets
├── server.js              # Node.js server
├── index.html             # Web application
├── script.js              # Web application logic
├── style.css              # Web application styles
├── package.json           # Dependencies
└── README.md              # This file
```

## Data Storage

The application uses file-based storage:
- User data: `data/auth/users.json`
- User-specific data: `data/users/{username}/`

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Secure cookie handling

## Development

### Adding New Features

1. **Backend**: Add routes in `server.js`
2. **Web Frontend**: Update `script.js` and `index.html`
3. **Mobile**: Update screens in `mobile/src/screens/`

### Database Migration

To clear all data and start fresh:
```bash
# Remove all user data
rm -rf data/users/*
rm -f data/auth/users.json
```

## Troubleshooting

### Common Issues

1. **"Failed to fetch" error in mobile app**
   - Check IP address configuration
   - Ensure server is running
   - Verify CORS settings

2. **Port already in use**
   ```bash
   # Kill existing process
   taskkill /F /IM node.exe
   # Or change port in .env file
   ```

3. **Authentication not working**
   - Clear browser storage
   - Check JWT secret configuration
   - Verify API endpoints

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email abudhahir.h2004@gmail.com or create an issue in the repository.

## Changelog

### v1.0.0
- Initial release
- User authentication
- Grocery list management
- Expense tracking
- Mobile app support
- Web interface
