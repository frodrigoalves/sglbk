# =================================================================
# SingulAI Mobile-Optimized Deployment Script (PowerShell)
# Deploy dos arquivos otimizados para mobile para o VPS
# =================================================================

Write-Host "🚀 Iniciando deploy dos arquivos mobile-optimized..." -ForegroundColor Green

# Configurações do servidor
$VPS_HOST = "72.60.147.56"
$VPS_USER = "root"
$VPS_PATH = "/var/www/singulai"
$LOCAL_FRONTEND = "./frontend"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  SingulAI Mobile Deployment v2.0" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Função para verificar se o arquivo existe
function Test-RequiredFile {
    param($FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $FilePath" -ForegroundColor Red
        return $false
    }
}

# Verificar arquivos obrigatórios
Write-Host "🔍 Verificando arquivos..." -ForegroundColor Yellow

$RequiredFiles = @(
    "frontend/mvp-mobile-optimized.html",
    "frontend/singulai-mobile-optimized.css",
    "frontend/singulai-mobile-optimized.js"
)

$AllFilesExist = $true
foreach ($file in $RequiredFiles) {
    if (!(Test-RequiredFile $file)) {
        $AllFilesExist = $false
    }
}

if (!$AllFilesExist) {
    Write-Host "❌ Deploy cancelado: arquivos obrigatórios ausentes" -ForegroundColor Red
    exit 1
}

# Função para executar comando SSH
function Invoke-SSHCommand {
    param($Command)
    $sshArgs = @("-i", "$env:USERPROFILE\.ssh\id_rsa", "$VPS_USER@$VPS_HOST", $Command)
    & ssh $sshArgs
}

# Função para fazer SCP
function Invoke-SCPUpload {
    param($LocalFile, $RemoteFile)
    $scpArgs = @("-i", "$env:USERPROFILE\.ssh\id_rsa", $LocalFile, "$VPS_USER@$VPS_HOST`:$RemoteFile")
    & scp $scpArgs
}

# Criar backup dos arquivos atuais
Write-Host "📦 Criando backup..." -ForegroundColor Yellow
$backupCommand = @"
if [ -d $VPS_PATH ]; then
    cp -r $VPS_PATH $VPS_PATH.backup.`$(date +%Y%m%d_%H%M%S)
    echo 'Backup criado com sucesso'
fi
"@
Invoke-SSHCommand $backupCommand

# Upload dos arquivos otimizados
Write-Host "📤 Enviando arquivos otimizados..." -ForegroundColor Yellow

# Arquivo HTML principal
Write-Host "📄 Atualizando HTML..." -ForegroundColor Blue
Invoke-SCPUpload "frontend/mvp-mobile-optimized.html" "$VPS_PATH/index.html"

# CSS otimizado
Write-Host "🎨 Atualizando CSS..." -ForegroundColor Blue
Invoke-SCPUpload "frontend/singulai-mobile-optimized.css" "$VPS_PATH/singulai-mobile-optimized.css"

# JavaScript otimizado
Write-Host "⚡ Atualizando JavaScript..." -ForegroundColor Blue
Invoke-SCPUpload "frontend/singulai-mobile-optimized.js" "$VPS_PATH/singulai-mobile-optimized.js"

# Criar arquivo de service worker para PWA
Write-Host "🔧 Criando Service Worker..." -ForegroundColor Blue
$swCommand = @"
cat > $VPS_PATH/sw.js << 'EOF'
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
EOF
"@
Invoke-SSHCommand $swCommand

# Criar manifest.json para PWA
Write-Host "📱 Criando PWA Manifest..." -ForegroundColor Blue
$manifestCommand = @"
cat > $VPS_PATH/manifest.json << 'EOF'
{
    "name": "SingulAI - Legado Digital",
    "short_name": "SingulAI",
    "description": "Plataforma de Legado Digital com IA",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#f8fafc",
    "theme_color": "#0ea5e9",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='50' font-size='50'%3e🤖%3c/text%3e%3c/svg%3e",
            "sizes": "192x192",
            "type": "image/svg+xml"
        },
        {
            "src": "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='50' font-size='50'%3e🤖%3c/text%3e%3c/svg%3e",
            "sizes": "512x512",
            "type": "image/svg+xml"
        }
    ]
}
EOF
"@
Invoke-SSHCommand $manifestCommand

# Atualizar configuração do nginx
Write-Host "🌐 Atualizando Nginx..." -ForegroundColor Blue
$nginxCommand = @"
cat > /etc/nginx/sites-available/singulai << 'EOF'
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # PWA headers
    add_header Service-Worker-Allowed "/" always;
    
    # MIME types for PWA
    location ~* \.(webmanifest|json)`$ {
        add_header Content-Type application/manifest+json;
        add_header Cache-Control "public, max-age=86400";
    }
    
    location / {
        root $VPS_PATH;
        index index.html;
        try_files `$uri `$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # No cache for HTML
        location ~* \.(html)`$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
    
    # API proxy para backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        
        if (`$request_method = 'OPTIONS') {
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
"@
Invoke-SSHCommand $nginxCommand

# Verificar se os serviços estão rodando
Write-Host "🔍 Verificando serviços..." -ForegroundColor Yellow
$statusCommand = @"
echo '=== Status dos Containers ==='
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

echo ''
echo '=== Status do Nginx ==='
systemctl status nginx --no-pager -l

echo ''
echo '=== Últimos logs do backend ==='
docker logs singulai-backend --tail 10
"@
Invoke-SSHCommand $statusCommand

# Teste de conectividade
Write-Host "🌐 Testando conectividade..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://singulai.live" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site principal: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Site principal: ERRO (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Site principal: ERRO de conexão" -ForegroundColor Red
}

try {
    $apiResponse = Invoke-WebRequest -Uri "http://singulai.live/api/health" -Method GET -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API Backend: OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API Backend: Status $($apiResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ API Backend: Verificar logs" -ForegroundColor Yellow
}

# Verificar arquivos específicos
Write-Host "📁 Verificando arquivos específicos..." -ForegroundColor Yellow
$verifyCommand = @"
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
"@
Invoke-SSHCommand $verifyCommand

Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Deploy Mobile-Optimized Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Acesse: " -NoNewline -ForegroundColor Blue
Write-Host "http://singulai.live" -ForegroundColor Yellow
Write-Host "🔧 Admin: " -NoNewline -ForegroundColor Blue  
Write-Host "http://singulai.live:3000/api/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Teste o site em dispositivos móveis" -ForegroundColor Yellow
Write-Host "2. Verifique a conectividade Web3" -ForegroundColor Yellow
Write-Host "3. Teste o chat com IA" -ForegroundColor Yellow
Write-Host "4. Verifique os saldos SGL" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛠️  Para debug:" -ForegroundColor Blue
Write-Host "   docker logs singulai-backend -f" -ForegroundColor Blue
Write-Host "   tail -f /var/log/nginx/error.log" -ForegroundColor Blue

# Opcional: Abrir automaticamente no navegador
Write-Host "🌐 Abrindo site no navegador..." -ForegroundColor Yellow
Start-Process "http://singulai.live"

Write-Host "✨ Deploy finalizado com sucesso!" -ForegroundColor Green