#!/bin/bash

# Script de Deploy SingulDAO para VPS
# Updated: October 2, 2025

echo "🚀 Iniciando deploy do SingulDAO na VPS..."

# Verificar se está no diretório correto
if [ ! -f "dao-instructions.html" ]; then
    echo "❌ Erro: Execute este script no diretório frontend/"
    exit 1
fi

# Configurações do VPS
VPS_IP="72.60.147.56"
VPS_USER="root"
VPS_PATH="/var/www/singulao"
VPS_NGINX_CONFIG="/etc/nginx/sites-available/singulao"

echo "📦 Criando pacote de deploy..."

# Criar diretório temporário
mkdir -p deploy-temp
cd deploy-temp

# Copiar arquivos necessários
echo "📋 Copiando arquivos..."
cp ../dao-instructions.html .
cp ../dao-dashboard.html .
cp ../dashboard.html .
cp ../*.js .
cp ../*.css .

# Verificar arquivos críticos
if [ ! -f "dao-instructions.html" ]; then
    echo "❌ Erro: dao-instructions.html não encontrado"
    exit 1
fi

if [ ! -f "dashboard.html" ]; then
    echo "❌ Erro: dashboard.html não encontrado"
    exit 1
fi

echo "✅ Arquivos copiados com sucesso"

# Criar arquivo de configuração nginx
cat > nginx-singulao.conf << 'EOL'
server {
    listen 80;
    server_name singulao.com www.singulao.com;
    
    root /var/www/singulao;
    index dao-instructions.html index.html;
    
    # Logs
    access_log /var/log/nginx/singulao_access.log;
    error_log /var/log/nginx/singulao_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Main location
    location / {
        try_files $uri $uri/ =404;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS redirect (placeholder for SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name singulao.com www.singulao.com;
#     
#     ssl_certificate /path/to/cert.pem;
#     ssl_certificate_key /path/to/key.pem;
#     
#     root /var/www/singulao;
#     index dao-instructions.html index.html;
# }
EOL

echo "📤 Fazendo upload para VPS..."

# Upload dos arquivos
scp -i ~/.ssh/id_rsa *.html *.js *.css ${VPS_USER}@${VPS_IP}:${VPS_PATH}/ 2>/dev/null || {
    echo "⚠️ Tentando sem chave SSH..."
    scp *.html *.js *.css ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
}

# Upload da configuração nginx
scp -i ~/.ssh/id_rsa nginx-singulao.conf ${VPS_USER}@${VPS_IP}:/tmp/ 2>/dev/null || {
    echo "⚠️ Tentando upload nginx config sem chave SSH..."
    scp nginx-singulao.conf ${VPS_USER}@${VPS_IP}:/tmp/
}

echo "⚙️ Configurando servidor..."

# Executar comandos no servidor
ssh -i ~/.ssh/id_rsa ${VPS_USER}@${VPS_IP} << 'ENDSSH' 2>/dev/null || ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'

# Criar diretório se não existir
mkdir -p /var/www/singulao

# Configurar permissões
chown -R www-data:www-data /var/www/singulao
chmod -R 755 /var/www/singulao

# Instalar nginx se não estiver instalado
if ! command -v nginx &> /dev/null; then
    echo "Instalando nginx..."
    apt update
    apt install -y nginx
fi

# Configurar nginx
mv /tmp/nginx-singulao.conf /etc/nginx/sites-available/singulao
ln -sf /etc/nginx/sites-available/singulao /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração nginx
nginx -t

# Reiniciar nginx
systemctl reload nginx
systemctl enable nginx

echo "✅ Configuração do servidor concluída"

ENDSSH

echo "🧹 Limpando arquivos temporários..."
cd ..
rm -rf deploy-temp

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Informações do Deploy:"
echo "   🌐 URL Principal: http://72.60.147.56/"
echo "   📄 DAO Instructions: http://72.60.147.56/dao-instructions.html"
echo "   📊 Dashboard: http://72.60.147.56/dashboard.html"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Configure um domínio (singulao.com) apontando para ${VPS_IP}"
echo "   2. Configure SSL/HTTPS com Let's Encrypt"
echo "   3. Configure firewall (ufw) se necessário"
echo ""
echo "✅ SingulDAO está online!"