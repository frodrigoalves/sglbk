#!/bin/bash
# 🚀 SingulDAO VPS Deployment Script
# Run this script on your VPS server

set -e

echo "🚀 Starting SingulDAO deployment..."

# Colors for output  
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   error 'This script must be run as root'
   exit 1
fi

log "Updating system packages..."
apt update && apt upgrade -y

log "Installing dependencies..."
apt install -y curl wget git ufw htop nginx certbot python3-certbot-nginx

# Install Node.js 20
log "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
log "Installing PM2..."
npm install -g pm2

# Configure firewall
log "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Create application directory
log "Creating application directory..."
mkdir -p /opt/singulai
cd /opt/singulai

# Remove existing files (backup first if they exist)
if [ -d "frontend" ]; then
    log "Backing up existing installation..."
    mv frontend frontend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

if [ -d "backend" ]; then
    mv backend backend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

# Create directories
mkdir -p frontend backend

log "Please upload your files to /opt/singulai/"
log "Frontend files should go to: /opt/singulai/frontend/"
log "Backend files should go to: /opt/singulai/backend/"

# Create environment file template
log "Creating environment configuration..."
cat > backend/.env << EOF
# SingulDAO Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://singulai_user:singulai_secure_2024@localhost:5432/singulai

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)

# Email Configuration (UPDATE WITH YOUR CREDENTIALS)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@singulai.live
FROM_NAME=SingulDAO

# Frontend URL
FRONTEND_URL=https://singulai.live

# Contract Addresses (UPDATE WITH YOUR DEPLOYED CONTRACTS)
AVATAR_BASE_ADDRESS=0x388D16b79fAff27A45F714838F029BC34aC60c48
AVATAR_WALLET_LINK_ADDRESS=0x803DE61049d1b192828A46e5952645C3f5b352B0
TIME_CAPSULE_ADDRESS=0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93
DIGITAL_LEGACY_ADDRESS=0x91E67E1592e66C347C3f615d71927c05a1951057
SGL_TOKEN_ADDRESS=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
DAO_ADDRESS=0x67Ef5FFf1fb79e7479aF27163Adef1b42a3aFf16
DAO_TREASURY_ADDRESS=0x8599Fc17B7F8eA439D79692645B65D512E7aC626

# Ethereum Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF

# Configure Nginx
log "Configuring Nginx..."
rm -f /etc/nginx/sites-enabled/default

# Create nginx configuration
cat > /etc/nginx/sites-available/singulai << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name singulai.live www.singulai.live;
    
    # Redirect HTTP to HTTPS (will be configured after SSL)
    location / {
        root /opt/singulai/frontend;
        index dao-dashboard.html index.html;
        try_files $uri $uri/ =404;
    }
    
    # API proxy
    location /api/ {
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
    
    # Dashboard redirect
    location = / {
        return 301 http://singulai.live/dao-dashboard.html;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

success "Nginx configured successfully!"

# PostgreSQL setup
log "Setting up PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE singulai;
CREATE USER singulai_user WITH PASSWORD 'singulai_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE singulai TO singulai_user;
ALTER USER singulai_user CREATEDB;
\q
EOF

success "PostgreSQL configured successfully!"

# Set permissions
log "Setting up permissions..."
chown -R www-data:www-data /opt/singulai/frontend
chmod -R 755 /opt/singulai/frontend

success "Basic VPS setup completed!"

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Upload your frontend files to: /opt/singulai/frontend/"
echo "2. Upload your backend files to: /opt/singulai/backend/"
echo "3. Update the .env file in /opt/singulai/backend/ with your credentials"
echo "4. Install backend dependencies: cd /opt/singulai/backend && npm install"
echo "5. Setup SSL certificate: certbot --nginx -d singulai.live -d www.singulai.live"
echo "6. Start the backend: pm2 start /opt/singulai/backend/server.js --name singulai-backend"
echo "7. Save PM2 configuration: pm2 save && pm2 startup"
echo ""
echo "🌐 Your SingulDAO will be available at: https://singulai.live"
echo ""
success "Setup completed! 🎉"