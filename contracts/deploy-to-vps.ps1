# Script de Deploy SingulAI - Windows PowerShell
# Execute este script para fazer deploy na VPS

Write-Host "🚀 Fazendo deploy do SingulAI na VPS..." -ForegroundColor Green

# Configurações
$VPS_HOST = "72.60.147.56"
$VPS_USER = "root"
$LOCAL_DIR = "C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts\frontend"
$REMOTE_DIR = "/var/www/html"

# Arquivos para enviar
$FILES = @(
    "singulai-professional.html",
    "singulai-professional.css",
    "singulai-professional-app.js",
    "singulai-professional.js",
    "index.html",
    "mvp.html",
    "login.html",
    "register.html",
    "dashboard.html"
)

Write-Host "📤 Enviando arquivos atualizados..." -ForegroundColor Yellow

foreach ($file in $FILES) {
    $localPath = Join-Path $LOCAL_DIR $file
    if (Test-Path $localPath) {
        Write-Host "Enviando $file..." -ForegroundColor Cyan
        try {
            scp $localPath "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"
            Write-Host "✓ $file enviado com sucesso" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Erro ao enviar $file" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Arquivo $file não encontrado" -ForegroundColor Red
    }
}

Write-Host "🔄 Reiniciando serviços na VPS..." -ForegroundColor Yellow

# Reiniciar nginx
try {
    ssh ${VPS_USER}@${VPS_HOST} "systemctl reload nginx"
    Write-Host "✓ Nginx recarregado" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao recarregar nginx" -ForegroundColor Red
}

# Reiniciar backend
try {
    ssh ${VPS_USER}@${VPS_HOST} "cd /opt/singulai ; pm2 restart all"
    Write-Host "✓ Backend reiniciado" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao reiniciar backend" -ForegroundColor Red
}

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://singulai.live" -ForegroundColor Cyan