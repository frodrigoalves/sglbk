#!/bin/bash
#  Script de Deploy Rápido - SingulAI VPS
# Execute este script na sua VPS Hostinguer

set -e

echo ' Iniciando deploy do SingulAI...'

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "[INFO] "
}

warn() {
    echo -e "[WARN] "
}

error() {
    echo -e "[ERROR] "
}

# Verificar se está rodando como root
if [[  -ne 0 ]]; then
   error 'Este script deve ser executado como root'
   exit 1
fi

# Atualizar sistema
log 'Atualizando sistema...'
apt update && apt upgrade -y

# Instalar dependências
log 'Instalando dependências...'
apt install -y curl wget git ufw htop postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# Instalar Node.js 20
log 'Instalando Node.js 20...'
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PM2
log 'Instalando PM2...'
npm install -g pm2

# Configurar PostgreSQL
log 'Configurando PostgreSQL...'
sudo -u postgres psql -c 'CREATE DATABASE singulai;' 2>/dev/null || log 'Database já existe'
sudo -u postgres psql -c 'CREATE USER singulai_user WITH PASSWORD '\''singulai_pass_2024'\'';' 2>/dev/null || log 'User já existe'
sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE singulai TO singulai_user;'

# Criar estrutura de diretórios
log 'Criando estrutura de diretórios...'
mkdir -p /opt/singulai
cd /opt/singulai

# TODO: Baixar arquivos da aplicação
# Por enquanto, copie manualmente os arquivos do projeto
warn '  Copie os arquivos do projeto para /opt/singulai/'
warn 'Backend em: /opt/singulai/backend/'
warn 'Frontend em: /opt/singulai/frontend/'
read -p 'Pressione ENTER quando os arquivos estiverem copiados...'

# Configurar variáveis de ambiente
log 'Configurando variáveis de ambiente...'
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://singulai_user:singulai_pass_2024@localhost:5432/singulai

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)

# Email Configuration (CONFIGURE COM SUAS CREDENCIAIS)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-gmail
FROM_EMAIL=noreply@singulai.site
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
FRONTEND_URL=http://localhost:3000

# Ethereum Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF

# Instalar dependências do backend
log 'Instalando dependências do backend...'
cd backend
npm install --production

# Configurar Nginx
log 'Configurando Nginx...'
cat > /etc/nginx/sites-available/singulai << EOF
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/singulai_access.log;
    error_log /var/log/nginx/singulai_error.log;

    # Proxy para backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_cache_bypass \;
    }

    # Servir arquivos estáticos do frontend
    location / {
        root /opt/singulai/frontend;
        index index.html;
        try_files \ \/ /index.html;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/singulai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Configurar firewall
log 'Configurando firewall...'
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Iniciar serviços
log 'Iniciando serviços...'

# Nginx
systemctl enable nginx
systemctl restart nginx

# Aplicação
cd /opt/singulai/backend
pm2 start server.js --name "singulai-backend"
pm2 startup
pm2 save

# Configurar monitoramento
log 'Configurando monitoramento...'
cat > /opt/singulai/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Status do SingulAI - $(date) ==="
echo "Backend:"
curl -s http://localhost:3000/api/health || echo " Backend offline"
echo "
echo "Nginx:"
systemctl is-active nginx || echo " Nginx offline"
echo "
echo "PostgreSQL:"
systemctl is-active postgresql || echo " PostgreSQL offline"
echo "
echo "PM2:"
pm2 status
EOF

chmod +x /opt/singulai/monitor.sh

# Configurar cron para monitoramento
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/singulai/monitor.sh >> /opt/singulai/monitor.log 2>&1") | crontab -

log ' Deploy concluído!'
echo "
echo " SingulAI está rodando na sua VPS!"
echo "
echo " PRÓXIMOS PASSOS:"
echo "1. Configure seu domínio para apontar para o IP da VPS"
echo "2. Configure as credenciais de email no arquivo /opt/singulai/.env"
echo "3. Execute: certbot --nginx -d seu-dominio.com (para SSL)"
echo "
echo " Acesse:"
echo "   Frontend: http://SEU_IP_VPS"
echo "   API: http://SEU_IP_VPS/api/health"
echo "
echo " Comandos úteis:"
echo "   Status: pm2 status"
echo "   Logs: pm2 logs singulai-backend"
echo "   Monitor: /opt/singulai/monitor.sh"
echo "   Reiniciar: pm2 restart singulai-backend"
