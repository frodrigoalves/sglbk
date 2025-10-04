#!/bin/bash

echo "🚀 SingulAI Backend Setup Script"
echo "================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
apt install -y nginx

# Extract backend files
echo "📁 Extracting backend files..."
mkdir -p /opt/singulai/backend
cd /opt/singulai/backend
tar -xzf /tmp/singulai-backend.tar.gz

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS singulai;" 2>/dev/null || true
sudo -u postgres psql -d singulai -f database/init.sql 2>/dev/null || true

# Create .env file
echo "⚙️ Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5432/singulai
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://singulai.live
EOF

# Configure nginx
echo "🌐 Configuring nginx..."
cat > /etc/nginx/sites-available/singulai << 'EOF'
server {
    listen 80;
    server_name singulai.live www.singulai.live;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
pm2 start server.js --name singulai-backend
pm2 save
pm2 startup

echo "🎉 SETUP COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /opt/singulai/backend/.env with real secrets"
echo "2. Test API: curl https://singulai.live/api/auth/test"
echo "3. Monitor logs: pm2 logs singulai-backend"
echo ""
echo "🌐 Your app is live at: https://singulai.live"