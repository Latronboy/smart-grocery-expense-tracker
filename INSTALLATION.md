# Installation Guide

## Quick Start

### 1. Prerequisites

Make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

For mobile development:
- **Expo CLI** - `npm install -g @expo/cli`

### 2. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Expense

# Install dependencies
npm install

# Install mobile dependencies (optional)
cd mobile
npm install
cd ..
```

### 3. Configuration

#### Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings
# Default values should work for local development
```

#### Mobile App IP Configuration
If you plan to use the mobile app, update the IP address:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # Mac/Linux
   ifconfig | grep "inet "
   ```

2. Update these files with your IP:
   - `mobile/src/screens/LoginScreen.js` (line 6)
   - `mobile/App.js` (line 28)

### 4. Run the Application

#### Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Or run directly
node server.js
```

#### Access the Web App
1. Open browser
2. Go to `http://localhost:3000`
3. Login with default credentials:
   - Username: `admin`
   - Password: `password123`

#### Run Mobile App
```bash
cd mobile
npx expo start
```

## Detailed Installation

### Windows

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer
   - Verify: `node --version` and `npm --version`

2. **Install Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Use default settings

3. **Clone Repository**
   ```cmd
   git clone <your-repo-url>
   cd Expense
   ```

4. **Install Dependencies**
   ```cmd
   npm install
   ```

5. **Run Application**
   ```cmd
   npm run dev
   ```

### macOS

1. **Install Homebrew** (if not installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**
   ```bash
   brew install node
   ```

3. **Install Git**
   ```bash
   brew install git
   ```

4. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd Expense
   npm install
   npm run dev
   ```

### Linux (Ubuntu/Debian)

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Git**
   ```bash
   sudo apt-get install git
   ```

3. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd Expense
   npm install
   npm run dev
   ```

## Mobile App Setup

### Prerequisites
- Node.js installed
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone

### Setup Steps

1. **Install Mobile Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure IP Address**
   - Find your computer's IP address
   - Update `mobile/src/screens/LoginScreen.js` and `mobile/App.js`
   - Replace `192.168.35.194` with your IP

3. **Start Mobile App**
   ```bash
   npx expo start
   ```

4. **Run on Device**
   - Install Expo Go app on your phone
   - Scan the QR code from terminal
   - Or use an emulator

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <process-id> /F

# Or change port in .env file
PORT=3001
```

#### "Failed to fetch" in Mobile App
1. Check IP address configuration
2. Ensure server is running
3. Check firewall settings
4. Verify both devices are on same network

#### Permission Errors
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

#### Node Version Issues
```bash
# Use Node Version Manager
# Install nvm first, then:
nvm install 18
nvm use 18
```

### Getting Help

1. Check the logs in terminal
2. Verify all dependencies are installed
3. Ensure correct IP address configuration
4. Check firewall/antivirus settings
5. Create an issue in the repository

## Production Deployment

### Environment Variables
```bash
# Set production environment
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key
PORT=3000
```

### Security Considerations
- Change default JWT secret
- Use HTTPS in production
- Set up proper CORS origins
- Use environment variables for secrets
- Consider using a database instead of file storage

### Database Setup (Optional)
The app currently uses file storage. For production, consider:
- PostgreSQL
- MongoDB
- MySQL

Update the database configuration in `server.js` if needed.

## Support

If you encounter issues:
1. Check this installation guide
2. Review the main README.md
3. Check existing issues in the repository
4. Create a new issue with detailed error information
