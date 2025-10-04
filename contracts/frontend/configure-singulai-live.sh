#!/bin/bash

# Script de Configuração do Domínio singulai.live
# Execute este script na VPS como root

echo "🌐 Configurando domínio singulai.live para SingulDAO..."
echo "VPS IP: $(curl -s ipinfo.io/ip)"
echo "Data: $(date)"
echo ""

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root"
    echo "Execute: sudo bash configure-singulai-live.sh"
    exit 1
fi

# Backup da configuração atual
echo "📋 Fazendo backup das configurações..."
mkdir -p /opt/backups/nginx/$(date +%Y%m%d_%H%M%S)
cp -r /etc/nginx/sites-available /opt/backups/nginx/$(date +%Y%m%d_%H%M%S)/
cp -r /etc/nginx/sites-enabled /opt/backups/nginx/$(date +%Y%m%d_%H%M%S)/

# Criar configuração do Nginx para singulai.live
echo "⚙️ Criando configuração do Nginx..."

cat > /etc/nginx/sites-available/singulai.live << 'EOF'
# Configuração para singulai.live
# Generated automatically on $(date)

server {
    listen 80;
    listen [::]:80;
    server_name singulai.live www.singulai.live;
    
    # Diretório dos arquivos
    root /var/www/html;
    index dao-instructions.html index.html;
    
    # Logs específicos
    access_log /var/log/nginx/singulai_access.log;
    error_log /var/log/nginx/singulai_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: wss: ws:; connect-src 'self' https: wss: ws: https://sepolia.infura.io https://eth-sepolia.public.blastapi.io;" always;
    
    # Página principal - redireciona para DAO instructions
    location = / {
        return 301 $scheme://$server_name/dao-instructions.html;
    }
    
    # Servir arquivos estáticos
    location / {
        try_files $uri $uri/ =404;
        
        # Headers para arquivos HTML
        location ~ \.html$ {
            add_header Cache-Control "no-cache, must-revalidate";
            expires -1;
        }
    }
    
    # Proxy para API backend
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
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files $uri =404;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Subdomínio API (api.singulai.live)
server {
    listen 80;
    listen [::]:80;
    server_name api.singulai.live;
    
    # Logs específicos da API
    access_log /var/log/nginx/api_singulai_access.log;
    error_log /var/log/nginx/api_singulai_error.log;
    
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
    }
}
EOF

# Ativar a nova configuração
echo "🔗 Ativando configuração do Nginx..."

# Criar link simbólico
ln -sf /etc/nginx/sites-available/singulai.live /etc/nginx/sites-enabled/

# Remover configuração padrão se existir
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️ Removendo configuração padrão..."
    rm -f /etc/nginx/sites-enabled/default
fi

# Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração do Nginx válida!"
    
    # Recarregar Nginx
    echo "🔄 Recarregando Nginx..."
    systemctl reload nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx recarregado com sucesso!"
    else
        echo "❌ Erro ao recarregar Nginx"
        systemctl status nginx
        exit 1
    fi
else
    echo "❌ Erro na configuração do Nginx!"
    nginx -t
    exit 1
fi

# Verificar se PM2 está rodando
echo "🔍 Verificando backend..."
if pm2 describe singulai-backend > /dev/null 2>&1; then
    echo "✅ Backend está rodando"
else
    echo "⚠️ Backend não encontrado, tentando iniciar..."
    if [ -f "/opt/singulai/backend/server.js" ]; then
        cd /opt/singulai/backend
        pm2 start server.js --name singulai-backend
    else
        echo "⚠️ Arquivo do backend não encontrado em /opt/singulai/backend/"
    fi
fi

# Exibir status
echo ""
echo "📊 Status dos serviços:"
echo "Nginx: $(systemctl is-active nginx)"
echo "Backend: $(pm2 describe singulai-backend 2>/dev/null | grep -o 'online\|stopped' | head -1)"

# Testar URLs localmente
echo ""
echo "🧪 Testando conectividade local..."

# Testar HTTP
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo "✅ HTTP local: OK"
else
    echo "⚠️ HTTP local: Erro"
fi

# Testar API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    echo "✅ API local: OK"
else
    echo "⚠️ API local: Erro"
fi

# Instruções finais
echo ""
echo "🎉 Configuração do servidor concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o DNS do domínio singulai.live:"
echo "   - Registro A: singulai.live → $(curl -s ipinfo.io/ip)"
echo "   - Registro A: www.singulai.live → $(curl -s ipinfo.io/ip)"
echo "   - Registro A: api.singulai.live → $(curl -s ipinfo.io/ip)"
echo ""
echo "2. Aguarde a propagação DNS (15-30 minutos)"
echo ""
echo "3. Para configurar SSL/HTTPS:"
echo "   certbot --nginx -d singulai.live -d www.singulai.live -d api.singulai.live"
echo ""
echo "🌐 URLs que estarão disponíveis:"
echo "   Principal: http://singulai.live"
echo "   DAO: http://singulai.live/dao-instructions.html"
echo "   Dashboard: http://singulai.live/dao-dashboard.html"
echo "   API: http://api.singulai.live/api/health"
echo ""
echo "📋 Para verificar logs:"
echo "   tail -f /var/log/nginx/singulai_access.log"
echo "   pm2 logs singulai-backend"
echo ""

# Criar arquivo de monitoramento
cat > /opt/singulai/check-domain.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando status do domínio singulai.live"
echo "Data: $(date)"
echo ""

# DNS Check
echo "📡 DNS Resolution:"
nslookup singulai.live | grep -A 2 "Name:"
echo ""

# HTTP Check
echo "🌐 HTTP Status:"
curl -s -o /dev/null -w "singulai.live: %{http_code} (Time: %{time_total}s)\n" http://singulai.live
curl -s -o /dev/null -w "api.singulai.live: %{http_code} (Time: %{time_total}s)\n" http://api.singulai.live/api/health
echo ""

# Service Status
echo "⚙️ Services:"
echo "Nginx: $(systemctl is-active nginx)"
echo "Backend: $(pm2 describe singulai-backend 2>/dev/null | grep -o 'online\|stopped' | head -1)"
EOF

chmod +x /opt/singulai/check-domain.sh

echo "✅ Script de configuração concluído!"
echo "Execute '/opt/singulai/check-domain.sh' para verificar o status"