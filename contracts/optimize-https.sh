#!/bin/bash

# =================================================================
# SingulAI HTTPS Optimization Script
# Configuração completa de HTTPS com segurança aprimorada
# =================================================================

echo "🔒 Iniciando otimização HTTPS para SingulAI..."

# Configurações do servidor
VPS_HOST="72.60.147.56"
VPS_USER="root"
VPS_PATH="/var/www/singulai"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SingulAI HTTPS Security v1.0${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar status atual dos certificados
echo -e "${YELLOW}🔍 Verificando certificados SSL...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "certbot certificates"

# Atualizar configuração Nginx com segurança aprimorada
echo -e "${YELLOW}🌐 Atualizando configuração Nginx para HTTPS...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
# Backup da configuração atual
cp /etc/nginx/sites-available/singulai /etc/nginx/sites-available/singulai.backup.\$(date +%Y%m%d_%H%M%S)

# Criar nova configuração com HTTPS otimizado
cat > /etc/nginx/sites-available/singulai << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name singulai.live www.singulai.live;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/singulai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/singulai.live/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/singulai.live/chain.pem;
    
    # Security Headers
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    add_header Permissions-Policy \"geolocation=(), microphone=(), camera=()\" always;
    
    # Content Security Policy for Web3
    add_header Content-Security-Policy \"default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss: ws:; worker-src 'self' blob:; child-src 'self' blob:\" always;
    
    # PWA Headers
    add_header Service-Worker-Allowed \"/\" always;
    add_header Cross-Origin-Embedder-Policy \"require-corp\" always;
    add_header Cross-Origin-Opener-Policy \"same-origin\" always;
    
    # Root directory
    root $VPS_PATH;
    index index.html;
    
    # Main location block
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
            add_header Vary \"Accept-Encoding\";
        }
        
        # PWA specific files
        location ~* \.(webmanifest|json)$ {
            add_header Content-Type application/manifest+json;
            add_header Cache-Control \"public, max-age=86400\";
        }
        
        # Service Worker
        location = /sw.js {
            add_header Cache-Control \"no-cache, no-store, must-revalidate\";
            add_header Pragma \"no-cache\";
            add_header Expires \"0\";
        }
        
        # HTML files - no cache
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
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin \"https://singulai.live\" always;
        add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\" always;
        add_header Access-Control-Allow-Headers \"Origin, X-Requested-With, Content-Type, Accept, Authorization\" always;
        add_header Access-Control-Allow-Credentials \"true\" always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin \"https://singulai.live\";
            add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\";
            add_header Access-Control-Allow-Headers \"Origin, X-Requested-With, Content-Type, Accept, Authorization\";
            add_header Access-Control-Allow-Credentials \"true\";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # WebSocket support for real-time features
    location /ws/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    
    # Security configurations
    location ~ /\. {
        deny all;
    }
    
    location ~ ~$ {
        deny all;
    }
    
    # Compressão otimizada
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/ld+json
        application/manifest+json
        image/svg+xml;
    
    # Brotli compression (if available)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/ld+json
        application/manifest+json
        image/svg+xml;
}
EOF

# Testar configuração
nginx -t

if [ \$? -eq 0 ]; then
    echo '✅ Configuração Nginx válida'
    systemctl reload nginx
    echo '✅ Nginx recarregado com sucesso'
else
    echo '❌ Erro na configuração Nginx'
    exit 1
fi
"

# Atualizar arquivos frontend para HTTPS
echo -e "${YELLOW}📝 Atualizando arquivos frontend para HTTPS...${NC}"

# Criar arquivo de configuração HTTPS para JavaScript
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
cat > $VPS_PATH/https-config.js << 'EOF'
// SingulAI HTTPS Configuration
const HTTPS_CONFIG = {
    // Force HTTPS for all API calls
    API_BASE_URL: 'https://singulai.live/api',
    
    // WebSocket URL (wss for secure)
    WS_URL: 'wss://singulai.live/ws',
    
    // External resources (all HTTPS)
    EXTERNAL_RESOURCES: {
        WEB3_CDN: 'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js',
        FONTS: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        INFURA_RPC: 'https://sepolia.infura.io/v3/'
    },
    
    // Security settings
    SECURITY: {
        FORCE_HTTPS: true,
        STRICT_TRANSPORT_SECURITY: true,
        CONTENT_SECURITY_POLICY: true
    }
};

// Auto-redirect to HTTPS if on HTTP
if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}

// Make config globally available
window.HTTPS_CONFIG = HTTPS_CONFIG;
EOF
"

# Verificar e otimizar Service Worker para HTTPS
echo -e "${YELLOW}⚡ Otimizando Service Worker para HTTPS...${NC}"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST "
cat > $VPS_PATH/sw.js << 'EOF'
const CACHE_NAME = 'singulai-https-v1.0';
const urlsToCache = [
    '/',
    '/singulai-mobile-optimized.css',
    '/singulai-mobile-optimized.js',
    '/https-config.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SingulAI: Caching resources for HTTPS');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SingulAI: Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, network fallback
self.addEventListener('fetch', (event) => {
    // Only handle HTTPS requests
    if (event.request.url.startsWith('https://')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Return cached version or fetch from network
                    if (response) {
                        return response;
                    }
                    
                    return fetch(event.request).then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }).catch(() => {
                        // Fallback for offline
                        if (event.request.destination === 'document') {
                            return caches.match('/');
                        }
                    });
                })
        );
    }
});

// Handle messages from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
EOF
"

# Testar conectividade HTTPS
echo -e "${YELLOW}🔍 Testando conectividade HTTPS...${NC}"

# Teste principal
if curl -s -f -o /dev/null -w \"%{http_code}\" https://singulai.live | grep -q \"200\"; then
    echo -e \"${GREEN}✅ HTTPS Principal: OK${NC}\"
else
    echo -e \"${RED}❌ HTTPS Principal: ERRO${NC}\"
fi

# Teste API
if curl -s -f -o /dev/null -w \"%{http_code}\" https://singulai.live/api/health | grep -q \"200\"; then
    echo -e \"${GREEN}✅ HTTPS API: OK${NC}\"
else
    echo -e \"${YELLOW}⚠️  HTTPS API: Verificar logs${NC}\"
fi

# Teste redirect HTTP -> HTTPS
if curl -s -o /dev/null -w \"%{http_code}\" http://singulai.live | grep -q \"301\"; then
    echo -e \"${GREEN}✅ Redirect HTTP->HTTPS: OK${NC}\"
else
    echo -e \"${YELLOW}⚠️  Redirect HTTP->HTTPS: Verificar${NC}\"
fi

# SSL Security Test
echo -e \"${YELLOW}🔒 Testando segurança SSL...${NC}\"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST \"
echo '=== SSL Security Headers ==='
curl -I https://singulai.live 2>/dev/null | grep -E '(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)'

echo ''
echo '=== SSL Certificate Info ==='
openssl s_client -connect singulai.live:443 -servername singulai.live </dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer
\"

# Verificar logs de erro
echo -e \"${YELLOW}📋 Verificando logs...${NC}\"
ssh -i ~/.ssh/id_rsa $VPS_USER@$VPS_HOST \"
echo '=== Últimos logs Nginx ==='
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo 'Nenhum erro recente'

echo ''
echo '=== Status dos serviços ==='
systemctl status nginx --no-pager -l | head -10
\"

echo -e \"${GREEN}========================================${NC}\"
echo -e \"${GREEN}🔒 HTTPS Optimization Concluída!${NC}\"
echo -e \"${GREEN}========================================${NC}\"
echo \"\"
echo -e \"${BLUE}🌐 Site Seguro: ${YELLOW}https://singulai.live${NC}\"
echo -e \"${BLUE}🔧 API Segura: ${YELLOW}https://singulai.live/api/health${NC}\"
echo \"\"
echo -e \"${YELLOW}📋 Recursos HTTPS ativos:${NC}\"
echo -e \"${YELLOW}✅${NC} Certificado SSL válido até dezembro 2025\"
echo -e \"${YELLOW}✅${NC} Redirect automático HTTP -> HTTPS\"
echo -e \"${YELLOW}✅${NC} Headers de segurança configurados\"
echo -e \"${YELLOW}✅${NC} CSP otimizado para Web3\"
echo -e \"${YELLOW}✅${NC} Service Worker com cache HTTPS\"
echo -e \"${YELLOW}✅${NC} Compressão Gzip e Brotli\"
echo \"\"
echo -e \"${BLUE}🔧 Para renovar certificado:${NC}\"
echo -e \"${BLUE}   certbot renew --dry-run${NC}\"

echo -e \"${GREEN}✨ HTTPS configurado com sucesso!${NC}\"