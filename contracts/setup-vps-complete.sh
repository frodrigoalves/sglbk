#!/bin/bash
set -e

echo "🚀 Iniciando setup completo do SingulAI na VPS..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências básicas
echo "🔧 Instalando dependências..."
apt install -y curl wget git ufw htop

# Instalar Node.js 20
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PostgreSQL
echo "🐘 Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL
echo "⚙️  Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE singulai;" 2>/dev/null || echo "Database já existe"
sudo -u postgres psql -c "CREATE USER singulai_user WITH PASSWORD 'singulai_pass_2024';" 2>/dev/null || echo "User já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE singulai TO singulai_user;"

# Instalar PM2 para gerenciamento de processos
echo "🔄 Instalando PM2..."
npm install -g pm2

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p /opt/singulai
cd /opt/singulai

# Clonar repositório (assumindo que será feito via git)
echo "📥 Baixando aplicação..."
# git clone https://github.com/frodrigoalves/contracts.git .  # Descomente quando o repo estiver pronto

# Copiar arquivos do projeto local (temporário)
cp -r /path/to/local/project/* . 2>/dev/null || echo "Copie os arquivos manualmente"

# Configurar variáveis de ambiente
echo "🔐 Configurando variáveis de ambiente..."
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://singulai_user:singulai_pass_2024@localhost:5432/singulai

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)

# Email Configuration (CONFIGURAR COM SUAS CREDENCIAIS)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-gmail
FROM_EMAIL=noreply@singulai.live
FROM_NAME=SingulAI

# Contract Addresses
AVATAR_BASE_ADDRESS=0x388D16b79fAff27A45F714838F029BC34aC60c48
AVATAR_WALLET_LINK_ADDRESS=0x803DE61049d1b192828A46e5952645C3f5b352B0
TIME_CAPSULE_ADDRESS=0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93
DIGITAL_LEGACY_ADDRESS=0x91E67E1592e66C347C3f615d71927c05a1951057
SGL_TOKEN_ADDRESS=0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://singulai.live

# Ethereum Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install --production

# Configurar Nginx
echo "🌐 Configurando Nginx..."
apt install -y nginx

# Backup do nginx.conf padrão
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Configurar site do SingulAI
cat > /etc/nginx/sites-available/singulai << EOF
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Logs
    access_log /var/log/nginx/singulai_access.log;
    error_log /var/log/nginx/singulai_error.log;

    # Proxy para backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Servir arquivos estáticos do frontend
    location / {
        root /opt/singulai/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Configuração para WebSocket (se necessário)
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
cd /opt/singulai/backend
pm2 start server.js --name "singulai-backend"
pm2 startup
pm2 save

# Configurar logrotate para logs da aplicação
echo "📝 Configurando logrotate..."
cat > /etc/logrotate.d/singulai << EOF
/opt/singulai/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Configurar monitoramento básico
echo "📊 Configurando monitoramento..."
cat > /opt/singulai/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Status do SingulAI - $(date) ==="
echo "Backend:"
curl -s http://localhost:3000/api/health || echo "❌ Backend offline"
echo ""
echo "Nginx:"
systemctl is-active nginx || echo "❌ Nginx offline"
echo ""
echo "PostgreSQL:"
systemctl is-active postgresql || echo "❌ PostgreSQL offline"
echo ""
echo "PM2:"
pm2 status
EOF

chmod +x /opt/singulai/monitor.sh

# Criar cron job para monitoramento
echo "⏰ Configurando monitoramento automático..."
(crontab -l ; echo "*/5 * * * * /opt/singulai/monitor.sh >> /opt/singulai/monitor.log 2>&1") | crontab -

echo "✅ Setup completo!"
echo ""
echo "🎉 SingulAI está rodando na sua VPS!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure o domínio DNS para apontar para o IP da VPS"
echo "2. Configure as credenciais de email no arquivo .env"
echo "3. Instale certificado SSL: certbot --nginx -d seu-dominio.com"
echo "4. Teste a aplicação: https://seu-dominio.com"
echo ""
echo "🔧 Comandos úteis:"
echo "- Ver status: pm2 status"
echo "- Ver logs: pm2 logs singulai-backend"
echo "- Monitoramento: /opt/singulai/monitor.sh"
echo "- Reiniciar: pm2 restart singulai-backend"
echo ""
echo "📞 Suporte: Em caso de problemas, verifique os logs em /var/log/nginx/"