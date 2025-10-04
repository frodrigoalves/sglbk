# Script de Deploy SingulAI para VPS Hostinger
# Execute este script no Windows PowerShell

Write-Host "🚀 Fazendo deploy do SingulAI na VPS Hostinger..." -ForegroundColor Green

# Configurações da VPS
$VPS_HOST = "72.60.147.56"
$VPS_USER = "root"
$LOCAL_FRONTEND = "C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts\frontend"
$REMOTE_DIR = "/var/www/html"

# Arquivos essenciais para deploy
$FILES_TO_DEPLOY = @(
    "index.html",
    "mvp.html",
    "dao.html",
    "docs.html",
    "login.html",
    "register.html",
    "confirm-email.html",
    "dashboard.html",
    "singulai-mvp.js",
    "singulai-advanced.js",
    "singulai-professional-app.js",
    "app.js",
    "singulai-mvp.css",
    "login.css",
    "index.css",
    "ux-improvements.css",
    "ux-improvements.js"
)

Write-Host "📁 Arquivos a serem enviados:" -ForegroundColor Yellow
foreach ($file in $FILES_TO_DEPLOY) {
    $localPath = Join-Path $LOCAL_FRONTEND $file
    if (Test-Path $localPath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (não encontrado)" -ForegroundColor Red
    }
}

Write-Host "`n📤 Enviando arquivos via SCP..." -ForegroundColor Cyan

# Enviar arquivos via SCP
foreach ($file in $FILES_TO_DEPLOY) {
    $localPath = Join-Path $LOCAL_FRONTEND $file
    if (Test-Path $localPath) {
        Write-Host "Enviando $file..." -ForegroundColor Gray
        & scp.exe $localPath "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $file enviado com sucesso" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Erro ao enviar $file" -ForegroundColor Red
        }
    }
}

Write-Host "`n⚙️ Configurando servidor na VPS..." -ForegroundColor Cyan

# Configurar nginx na VPS
$nginxConfig = @"
server {
    listen 80;
    server_name singulai.live www.singulai.live;

    root /var/www/html;
    index index.html;

    # Configuração para SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API backend
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

    # Arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"@

# Enviar configuração nginx
$nginxConfig | Out-File -FilePath "nginx-singulai.conf" -Encoding UTF8
& scp.exe "nginx-singulai.conf" "${VPS_USER}@${VPS_HOST}:/etc/nginx/sites-available/singulai.live"

# Comandos para configurar nginx na VPS
$nginxCommands = @"
#!/bin/bash
echo "Configurando nginx..."

# Criar link simbólico se não existir
if [ ! -L /etc/nginx/sites-enabled/singulai.live ]; then
    ln -s /etc/nginx/sites-available/singulai.live /etc/nginx/sites-enabled/
fi

# Remover configuração default se existir
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Testar configuração
nginx -t

if [ \$? -eq 0 ]; then
    # Recarregar nginx
    systemctl reload nginx
    echo "✅ Nginx configurado com sucesso!"
else
    echo "❌ Erro na configuração do nginx"
    exit 1
fi

# Configurar permissões
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

echo "✅ Deploy concluído!"
echo "🌐 Teste o site: http://singulai.live"
"@

# Enviar e executar comandos na VPS
$nginxCommands | Out-File -FilePath "configure-nginx.sh" -Encoding UTF8
& scp.exe "configure-nginx.sh" "${VPS_USER}@${VPS_HOST}:/root/"

# Executar configuração na VPS
Write-Host "Executando configuração na VPS..." -ForegroundColor Cyan
& ssh.exe "${VPS_USER}@${VPS_HOST}" "chmod +x /root/configure-nginx.sh && /root/configure-nginx.sh"

Write-Host "`n🎉 Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 URLs para testar:" -ForegroundColor Cyan
Write-Host "  Página inicial: http://singulai.live" -ForegroundColor White
Write-Host "  MVP Dashboard: http://singulai.live/mvp.html" -ForegroundColor White
Write-Host "  DAO: http://singulai.live/dao.html" -ForegroundColor White
Write-Host "  Documentação: http://singulai.live/docs.html" -ForegroundColor White

# Limpar arquivos temporários
Remove-Item "nginx-singulai.conf" -ErrorAction SilentlyContinue
Remove-Item "configure-nginx.sh" -ErrorAction SilentlyContinue

Write-Host "`n✅ Script concluído!" -ForegroundColor Green