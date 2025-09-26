# Deployment Guide

## Deployment Options

### 1. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository
- Heroku account

#### Steps

1. **Install Heroku CLI**
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secure-secret-key
   heroku config:set PORT=3000
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

### 2. Vercel Deployment

#### Prerequisites
- Vercel account
- Vercel CLI (optional)

#### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `JWT_SECRET`, `NODE_ENV`

### 3. Railway Deployment

#### Steps

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Set `NODE_ENV=production`
   - Set `JWT_SECRET=your-secret`

3. **Deploy**
   - Railway will automatically deploy on git push

### 4. DigitalOcean App Platform

#### Steps

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure**
   - Select Node.js
   - Set build command: `npm install`
   - Set run command: `node server.js`

3. **Environment Variables**
   - Add in app settings
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret`

### 5. AWS EC2 Deployment

#### Prerequisites
- AWS account
- EC2 instance running Ubuntu/Amazon Linux

#### Steps

1. **Connect to EC2**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Git
   sudo apt install git -y
   ```

3. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd Expense
   npm install
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Create PM2 Config**
   ```bash
   # Create ecosystem.config.js
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'expense-tracker',
       script: 'server.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         JWT_SECRET: 'your-super-secure-secret-key'
       }
     }]
   }
   EOF
   ```

6. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx** (optional)
   ```bash
   sudo apt install nginx -y
   
   # Create nginx config
   sudo nano /etc/nginx/sites-available/expense-tracker
   
   # Add configuration:
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Environment Configuration

### Production Environment Variables

```bash
# Required
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key-here

# Optional
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Security Considerations

1. **JWT Secret**
   - Use a strong, random secret
   - At least 32 characters
   - Different for each environment

2. **CORS Configuration**
   - Set specific origins in production
   - Remove wildcard (*) origins

3. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates

4. **Database**
   - Consider using a proper database
   - File storage is not recommended for production

## Database Migration

### From File Storage to Database

1. **Choose Database**
   - PostgreSQL (recommended)
   - MongoDB
   - MySQL

2. **Update server.js**
   ```javascript
   // Add database connection
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

3. **Create Tables**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE groceries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id INTEGER REFERENCES users(id),
     name VARCHAR(255) NOT NULL,
     quantity INTEGER DEFAULT 1,
     completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE expenses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id INTEGER REFERENCES users(id),
     amount DECIMAL(10,2) NOT NULL,
     description VARCHAR(255),
     category VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart app
pm2 restart expense-tracker
```

### Health Checks
Add health check endpoint to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

## Backup Strategy

### File Storage Backup
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz data/
# Upload to cloud storage or send to backup server
EOF

chmod +x backup.sh
```

### Database Backup
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240101.sql
```

## Troubleshooting

### Common Deployment Issues

1. **Port Binding Issues**
   - Use `process.env.PORT || 3000`
   - Don't hardcode port numbers

2. **Environment Variables**
   - Check all required variables are set
   - Use different secrets for different environments

3. **CORS Issues**
   - Update CORS origins for production domain
   - Test with actual domain, not localhost

4. **File Permissions**
   - Ensure app has write permissions to data directory
   - Check file ownership

### Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

3. **Caching**
   ```javascript
   const cache = require('memory-cache');
   // Implement caching for frequently accessed data
   ```

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review logs for error messages
3. Test locally first
4. Create an issue with deployment details
