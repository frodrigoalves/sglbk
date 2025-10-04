@echo off
echo 🚀 Deploying SingulAI Backend to VPS...
echo.

echo 📦 Creating backend archive...
cd backend
tar -czf ../singulai-backend.tar.gz .
cd ..
echo ✅ Archive created
echo.

echo 📤 Uploading to VPS...
scp -i C:\Users\Lenga\.ssh\id_rsa singulai-backend.tar.gz root@72.60.147.56:/tmp/
if %errorlevel% neq 0 (
    echo ❌ Upload failed
    exit /b 1
)
echo ✅ Upload successful
echo.

echo 🔧 Installing dependencies on VPS...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "apt update && apt install -y nodejs npm postgresql postgresql-contrib pm2 nginx"
if %errorlevel% neq 0 (
    echo ❌ Dependency installation failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 📁 Extracting backend files...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "mkdir -p /opt/singulai/backend && cd /opt/singulai/backend && tar -xzf /tmp/singulai-backend.tar.gz"
if %errorlevel% neq 0 (
    echo ❌ Extraction failed
    exit /b 1
)
echo ✅ Files extracted
echo.

echo 📦 Installing Node.js dependencies...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "cd /opt/singulai/backend && npm install"
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🗄️ Setting up database...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "sudo -u postgres psql -c \"CREATE DATABASE IF NOT EXISTS singulai;\" && sudo -u postgres psql -d singulai -f /opt/singulai/backend/database/init.sql"
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    exit /b 1
)
echo ✅ Database ready
echo.

echo ⚙️ Creating .env file...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "cat > /opt/singulai/backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5432/singulai
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://singulai.live
EOF"
echo ✅ .env created (REMEMBER TO UPDATE SECRETS!)
echo.

echo 🌐 Configuring nginx...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "cat > /etc/nginx/sites-available/singulai << 'EOF'
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
EOF"
if %errorlevel% neq 0 (
    echo ❌ nginx config failed
    exit /b 1
)
echo ✅ nginx configured
echo.

echo 🔗 Enabling nginx site...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
if %errorlevel% neq 0 (
    echo ❌ nginx reload failed
    exit /b 1
)
echo ✅ nginx reloaded
echo.

echo 🚀 Starting backend with PM2...
ssh -i C:\Users\Lenga\.ssh\id_rsa -o StrictHostKeyChecking=no root@72.60.147.56 "cd /opt/singulai/backend && pm2 start server.js --name singulai-backend && pm2 save && pm2 startup"
if %errorlevel% neq 0 (
    echo ❌ PM2 start failed
    exit /b 1
)
echo ✅ Backend started with PM2
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo 📋 Next steps:
echo 1. Update the .env file with real secrets
echo 2. Configure SSL certificate (Let's Encrypt)
echo 3. Test the API endpoints
echo 4. Monitor logs with: pm2 logs singulai-backend
echo.
echo 🌐 Your app should be live at: https://singulai.live
echo API available at: https://singulai.live/api