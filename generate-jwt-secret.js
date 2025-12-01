// Generate a secure JWT secret for production use
// Run this with: node generate-jwt-secret.js

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n==============================================');
console.log('🔐 Generated JWT Secret for Vercel Deployment');
console.log('==============================================\n');
console.log('Copy this secret and use it as your JWT_SECRET environment variable:\n');
console.log(secret);
console.log('\n==============================================');
console.log('⚠️  IMPORTANT: Keep this secret secure!');
console.log('   - Never commit it to Git');
console.log('   - Only use in environment variables');
console.log('   - Use different secrets for different environments');
console.log('==============================================\n');
