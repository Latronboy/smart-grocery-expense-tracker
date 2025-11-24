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

### 2. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account ([Sign up here](https://vercel.com/signup))
- Git repository pushed to GitHub/GitLab/Bitbucket
- Vercel CLI (optional, for command-line deployment)

#### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Connect Your Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Select the repository: `smart-grocery-expense-tracker`

2. **Configure Project**
   - **Framework Preset**: Other (or Node.js)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty or use `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `NODE_ENV` | `production` | Production, Preview, Development |
   | `JWT_SECRET` | `your-super-secure-random-secret-key-at-least-32-chars` | Production, Preview, Development |
   
   **Important**: Generate a strong JWT_SECRET using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

#### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   # First deployment
   vercel --prod
   
   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Which scope? Select your account
   # - Link to existing project? No
   # - Project name? smart-grocery-expense-tracker (or your preferred name)
   # - Directory? ./ (press Enter)
   # - Override settings? No
   ```

4. **Set Environment Variables via CLI**
   ```bash
   # Set JWT_SECRET
   vercel env add JWT_SECRET production
   # Paste your secret when prompted
   
   # Set NODE_ENV
   vercel env add NODE_ENV production
   # Enter: production
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

#### Post-Deployment Configuration

1. **Custom Domain (Optional)**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Verify Deployment**
   - Visit your deployment URL
   - Test authentication (signup/login)
   - Create test expenses and groceries
   - Check browser console for errors

3. **Monitor Logs**
   - Go to Vercel Dashboard > Your Project > Deployments
   - Click on latest deployment
   - View "Functions" tab for server logs

#### Important Notes for Vercel

⚠️ **File Storage Limitation**: Vercel serverless functions are stateless. The file-based storage in the `data/` directory will **not persist** between deployments or function invocations. 

**Solutions**:
1. **For Development/Testing**: Current file storage works fine
2. **For Production**: Consider migrating to a database:
   - **Vercel Postgres** (recommended, built-in)
   - **MongoDB Atlas** (free tier available)
   - **PlanetScale** (MySQL-compatible)
   - **Supabase** (PostgreSQL with real-time features)

#### Vercel-Specific Environment Variables

You can also set these optional variables:

| Name | Value | Description |
|------|-------|-------------|
| `VERCEL_URL` | Auto-set by Vercel | Your deployment URL |
| `CORS_ORIGIN` | `https://yourdomain.com` | Specific CORS origin (optional) |

#### Continuous Deployment

Once connected to Git:
- **Automatic deployments** on every push to `main` branch
- **Preview deployments** for pull requests
- **Rollback** to previous deployments anytime

#### Troubleshooting Vercel Deployment

1. **Build Fails**
   - Check Node.js version in `package.json` engines
   - Verify all dependencies are in `dependencies`, not `devDependencies`
   - Check build logs in Vercel dashboard

2. **Function Timeout**
   - Vercel free tier: 10s timeout
   - Optimize slow operations
   - Consider upgrading plan if needed

3. **Environment Variables Not Working**
   - Ensure variables are set for correct environment
   - Redeploy after adding variables
   - Check variable names match exactly (case-sensitive)

4. **CORS Errors**
   - Update CORS configuration in `server.js`
   - Add your Vercel domain to allowed origins

5. **Data Not Persisting**
   - This is expected with file storage on Vercel
   - Migrate to a database for production use

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
