# 🚀 DEPLOYMENT MANUAL - SingulAI Backend

## Status Atual
- ✅ Frontend já está funcionando em https://singulai.live
- ✅ Arquivo `singulai-backend.tar.gz` já foi enviado para o VPS
- ❌ Backend ainda não foi instalado no VPS

## 📋 Instruções para Deploy Manual

### 1. Conecte no VPS via SSH
```bash
ssh -i ~/.ssh/id_rsa root@72.60.147.56
```

### 2. Execute estes comandos um por um:

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Instalar PM2 globalmente
npm install -g pm2

# Instalar nginx
apt install -y nginx

# Extrair backend
mkdir -p /opt/singulai/backend
cd /opt/singulai/backend
tar -xzf /tmp/singulai-backend.tar.gz
ls -la

# Instalar dependências
npm install

# Configurar banco de dados
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS singulai;"
sudo -u postgres psql -d singulai -f database/init.sql

# Criar arquivo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5432/singulai
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://singulai.live
EOF

# Configurar nginx
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

# Habilitar site nginx
ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Iniciar backend com PM2
pm2 start server.js --name singulai-backend
pm2 save
pm2 startup

# Verificar status
pm2 status
pm2 logs singulai-backend --lines 10
```

### 3. Teste a API
```bash
curl https://singulai.live/api/auth/test
```

### 4. Configure SSL (Opcional)
```bash
# Instalar certbot
apt install -y certbot python3-certbot-nginx
certbot --nginx -d singulai.live -d www.singulai.live
```

## 🔧 Troubleshooting

### Se PM2 não iniciar:
```bash
cd /opt/singulai/backend
pm2 delete singulai-backend
pm2 start server.js --name singulai-backend
```

### Ver logs:
```bash
pm2 logs singulai-backend
```

### Reiniciar serviços:
```bash
systemctl restart nginx
pm2 restart singulai-backend
```

## ✅ Verificação Final

Após completar todos os passos:

1. ✅ Frontend: https://singulai.live (já funcionando)
2. ✅ API: https://singulai.live/api/auth/test
3. ✅ Registro deve funcionar no frontend
4. ✅ Login deve funcionar no frontend

## 📞 Suporte

Se algo der errado, verifique:
- Logs do PM2: `pm2 logs singulai-backend`
- Logs do nginx: `tail -f /var/log/nginx/error.log`
- Status dos serviços: `systemctl status nginx && pm2 status`