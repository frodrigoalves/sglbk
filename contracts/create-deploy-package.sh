#!/bin/bash
# 📦 SingulDAO Package Creator
# Creates a deployment package with all necessary files

set -e

echo "📦 Creating SingulDAO deployment package..."

# Create package directory
PACKAGE_DIR="singulao-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$PACKAGE_DIR"

echo "📂 Copying frontend files..."
mkdir -p "$PACKAGE_DIR/frontend"
cp -r frontend/* "$PACKAGE_DIR/frontend/" 2>/dev/null || echo "⚠️  No frontend files found"

echo "📂 Copying backend files..." 
mkdir -p "$PACKAGE_DIR/backend"
cp -r backend/* "$PACKAGE_DIR/backend/" 2>/dev/null || echo "⚠️  No backend files found"

echo "📂 Copying configuration files..."
cp nginx-singulao.conf "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  nginx config not found"
cp deploy-singulao-vps.sh "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  deploy script not found"
cp contract-addresses.json "$PACKAGE_DIR/" 2>/dev/null || echo "⚠️  contract addresses not found"

# Copy environment files
cp backend/.env.example "$PACKAGE_DIR/backend/" 2>/dev/null || echo "⚠️  .env.example not found"

echo "📝 Creating deployment instructions..."
cat > "$PACKAGE_DIR/DEPLOY_INSTRUCTIONS.md" << 'EOF'
# 🚀 SingulDAO Deployment Instructions

## Prerequisites
- Ubuntu/Debian VPS with root access
- Domain name pointing to your VPS IP
- Email credentials for SMTP

## Deployment Steps

### 1. Upload Files to VPS
```bash
scp -r singulao-deploy-* root@your-vps-ip:/root/
```

### 2. Run Setup Script on VPS
```bash
cd /root/singulao-deploy-*
chmod +x deploy-singulao-vps.sh
./deploy-singulao-vps.sh
```

### 3. Upload Application Files
```bash
# Copy frontend files
cp -r frontend/* /opt/singulai/frontend/

# Copy backend files  
cp -r backend/* /opt/singulai/backend/
```

### 4. Configure Environment
```bash
cd /opt/singulai/backend
# Edit .env file with your settings
nano .env
```

### 5. Install Backend Dependencies
```bash
cd /opt/singulai/backend
npm install --production
```

### 6. Setup SSL Certificate
```bash
certbot --nginx -d singulai.live -d www.singulai.live
```

### 7. Start Backend Service
```bash
cd /opt/singulai/backend
pm2 start server.js --name singulai-backend
pm2 save
pm2 startup
```

### 8. Configure Nginx (Final)
```bash
cp nginx-singulao.conf /etc/nginx/sites-available/singulai
nginx -t && systemctl reload nginx
```

## Verification
- Visit https://singulai.live
- Check that DAO dashboard loads
- Test language switching (EN/PT-BR)
- Verify all charts and data display correctly

## Troubleshooting
- Check logs: `pm2 logs singulai-backend`
- Check nginx: `nginx -t && systemctl status nginx`
- Check SSL: `certbot certificates`

## Support
For issues, check the logs and configuration files.
EOF

echo "🗜️  Creating compressed package..."
tar -czf "${PACKAGE_DIR}.tar.gz" "$PACKAGE_DIR"

echo "🧹 Cleaning up..."
rm -rf "$PACKAGE_DIR"

echo "✅ Package created: ${PACKAGE_DIR}.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Transfer ${PACKAGE_DIR}.tar.gz to your VPS"
echo "2. Extract: tar -xzf ${PACKAGE_DIR}.tar.gz"
echo "3. Follow instructions in DEPLOY_INSTRUCTIONS.md"
echo ""
echo "🎉 Package ready for deployment!"