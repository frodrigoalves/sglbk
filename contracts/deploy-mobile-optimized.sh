#!/bin/bash

# =================================================================
# SingulAI Mobile-Optimized Deployment Script
# Deploy dos arquivos otimizados para mobile para o VPS
# =================================================================

echo "🚀 Iniciando deploy dos arquivos mobile-optimized..."

# Configurações do servidor
VPS_HOST="72.60.147.56"
VPS_USER="root"
VPS_PATH="/var/www/singulai"
LOCAL_FRONTEND="./frontend"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SingulAI Mobile Deployment v2.0${NC}"
echo -e "${BLUE}========================================${NC}"

# Função para verificar se o arquivo existe
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ Arquivo não encontrado: $1${NC}"
        return 1
    fi
    return 0
}

# Verificar arquivos obrigatórios
echo -e "${YELLOW}🔍 Verificando arquivos...${NC}"

REQUIRED_FILES=(
    "frontend/mvp-mobile-optimized.html"
    "frontend/singulai-mobile-optimized.css"
    "frontend/singulai-mobile-optimized.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if check_file "$file"; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Deploy cancelado: arquivo obrigatório ausente${NC}"
        exit 1
    fi
done

# Criar backup dos arquivos atuais
echo -e "${YELLOW}📦 Criando backup...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
    if [ -d $VPS_PATH ]; then
        cp -r $VPS_PATH $VPS_PATH.backup.\$(date +%Y%m%d_%H%M%S)
        echo 'Backup criado com sucesso'
    fi
"

# Upload dos arquivos otimizados
echo -e "${YELLOW}📤 Enviando arquivos otimizados...${NC}"

# Arquivo HTML principal
echo -e "${BLUE}📄 Atualizando HTML...${NC}"
scp -i ~/.ssh/id_rsa frontend/mvp-mobile-optimized.html $VPS_USER@$VPS_HOST:$VPS_PATH/index.html

# CSS otimizado
echo -e "${BLUE}🎨 Atualizando CSS...${NC}"
scp -i ~/.ssh/id_rsa frontend/singulai-mobile-optimized.css $VPS_USER@$VPS_HOST:$VPS_PATH/singulai-mobile-optimized.css

# JavaScript otimizado
echo -e "${BLUE}⚡ Atualizando JavaScript...${NC}"
scp -i ~/.ssh/id_rsa frontend/singulai-mobile-optimized.js $VPS_USER@$VPS_HOST:$VPS_PATH/singulai-mobile-optimized.js

# Criar arquivo de service worker para PWA
echo -e "${BLUE}🔧 Criando Service Worker...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "cat > $VPS_PATH/sw.js << 'EOF'
const CACHE_NAME = 'singulai-v2.0';
const urlsToCache = [
    '/',
    '/singulai-mobile-optimized.css',
    '/singulai-mobile-optimized.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
EOF"

# Criar manifest.json para PWA
echo -e "${BLUE}📱 Criando PWA Manifest...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "cat > $VPS_PATH/manifest.json << 'EOF'
{
    \"name\": \"SingulAI - Legado Digital\",
    \"short_name\": \"SingulAI\",
    \"description\": \"Plataforma de Legado Digital com IA\",
    \"start_url\": \"/\",
    \"display\": \"standalone\",
    \"background_color\": \"#f8fafc\",
    \"theme_color\": \"#0ea5e9\",
    \"orientation\": \"portrait-primary\",
    \"icons\": [
        {
            \"src\": \"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='50' font-size='50'%3e🤖%3c/text%3e%3c/svg%3e\",
            \"sizes\": \"192x192\",
            \"type\": \"image/svg+xml\"
        },
        {
            \"src\": \"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='50' font-size='50'%3e🤖%3c/text%3e%3c/svg%3e\",
            \"sizes\": \"512x512\",
            \"type\": \"image/svg+xml\"
        }
    ]
}
EOF"

# Atualizar configuração do nginx para PWA
echo -e "${BLUE}🌐 Atualizando Nginx...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
# Adicionar headers para PWA
cat > /etc/nginx/sites-available/singulai << 'EOF'
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
    
    # PWA headers
    add_header Service-Worker-Allowed \"/\" always;
    
    # MIME types for PWA
    location ~* \.(webmanifest|json)$ {
        add_header Content-Type application/manifest+json;
        add_header Cache-Control \"public, max-age=86400\";
    }
    
    location / {
        root $VPS_PATH;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
        
        # No cache for HTML
        location ~* \.(html)$ {
            add_header Cache-Control \"no-cache, no-store, must-revalidate\";
            add_header Pragma \"no-cache\";
            add_header Expires \"0\";
        }
    }
    
    # API proxy para backend
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
        
        # CORS headers
        add_header Access-Control-Allow-Origin \"*\" always;
        add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS\" always;
        add_header Access-Control-Allow-Headers \"Origin, X-Requested-With, Content-Type, Accept, Authorization\" always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Recarregar nginx
nginx -t && systemctl reload nginx
echo 'Nginx recarregado com sucesso'
"

# Verificar se os serviços estão rodando
echo -e "${YELLOW}🔍 Verificando serviços...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
echo '=== Status dos Containers ==='
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

echo ''
echo '=== Status do Nginx ==='
systemctl status nginx --no-pager -l

echo ''
echo '=== Últimos logs do backend ==='
docker logs singulai-backend --tail 10
"

# Teste de conectividade
echo -e "${YELLOW}🌐 Testando conectividade...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://singulai.live | grep -q "200"; then
    echo -e "${GREEN}✅ Site principal: OK${NC}"
else
    echo -e "${RED}❌ Site principal: ERRO${NC}"
fi

if curl -s -o /dev/null -w "%{http_code}" http://singulai.live/api/health | grep -q "200"; then
    echo -e "${GREEN}✅ API Backend: OK${NC}"
else
    echo -e "${YELLOW}⚠️  API Backend: Verificar logs${NC}"
fi

# Verificar arquivos específicos
echo -e "${YELLOW}📁 Verificando arquivos específicos...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
if [ -f $VPS_PATH/singulai-mobile-optimized.css ]; then
    echo '✅ CSS otimizado: OK'
else
    echo '❌ CSS otimizado: ERRO'
fi

if [ -f $VPS_PATH/singulai-mobile-optimized.js ]; then
    echo '✅ JS otimizado: OK'  
else
    echo '❌ JS otimizado: ERRO'
fi

if [ -f $VPS_PATH/manifest.json ]; then
    echo '✅ PWA Manifest: OK'
else
    echo '❌ PWA Manifest: ERRO'
fi

if [ -f $VPS_PATH/sw.js ]; then
    echo '✅ Service Worker: OK'
else
    echo '❌ Service Worker: ERRO'
fi
"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deploy Mobile-Optimized Concluído!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📱 Acesse: ${YELLOW}http://singulai.live${NC}"
echo -e "${BLUE}🔧 Admin: ${YELLOW}http://singulai.live:3000/api/health${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo -e "${YELLOW}1.${NC} Teste o site em dispositivos móveis"  
echo -e "${YELLOW}2.${NC} Verifique a conectividade Web3"
echo -e "${YELLOW}3.${NC} Teste o chat com IA"
echo -e "${YELLOW}4.${NC} Verifique os saldos SGL"
echo ""
echo -e "${BLUE}🛠️  Para debug:${NC}"
echo -e "${BLUE}   docker logs singulai-backend -f${NC}"
echo -e "${BLUE}   tail -f /var/log/nginx/error.log${NC}"

# Opcional: Abrir automaticamente no navegador
if command -v xdg-open &> /dev/null; then
    echo -e "${YELLOW}🌐 Abrindo site no navegador...${NC}"
    xdg-open http://singulai.live
elif command -v open &> /dev/null; then
    echo -e "${YELLOW}🌐 Abrindo site no navegador...${NC}"  
    open http://singulai.live
fi

echo -e "${GREEN}✨ Deploy finalizado com sucesso!${NC}"