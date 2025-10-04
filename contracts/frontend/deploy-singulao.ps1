# Script de Deploy PowerShell para SingulDAO
# Updated: October 2, 2025

Write-Host "🚀 Iniciando deploy do SingulDAO na VPS..." -ForegroundColor Green

$VPS_IP = "72.60.147.56"
$VPS_USER = "root"
$VPS_PATH = "/var/www/singulao"

# Verificar se os arquivos existem
$requiredFiles = @(
    "dao-instructions.html",
    "dao-dashboard.html", 
    "dashboard.html",
    "singulai-dao.js"
)

Write-Host "📋 Verificando arquivos necessários..." -ForegroundColor Yellow

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não encontrado" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📤 Fazendo upload dos arquivos..." -ForegroundColor Yellow

# Usar PSCP se estiver disponível (PuTTY)
if (Get-Command pscp -ErrorAction SilentlyContinue) {
    Write-Host "Usando PSCP (PuTTY)..." -ForegroundColor Cyan
    
    # Upload dos arquivos principais
    pscp -batch dao-instructions.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
    pscp -batch dao-dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
    pscp -batch dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
    pscp -batch singulai-dao.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
    
    # Upload de todos os arquivos CSS
    Get-ChildItem -Filter "*.css" | ForEach-Object {
        pscp -batch $_.Name ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
    }
    
} else {
    Write-Host "⚠️ PSCP não encontrado. Usando SCP nativo..." -ForegroundColor Yellow
    
    # Tentar com SCP nativo
    try {
        scp dao-instructions.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
        scp dao-dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
        scp dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
        scp singulai-dao.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
        
        # Upload CSS files
        Get-ChildItem -Filter "*.css" | ForEach-Object {
            scp $_.Name ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
        }
        
    } catch {
        Write-Host "❌ Erro no upload: $_" -ForegroundColor Red
        Write-Host "💡 Dica: Instale PuTTY para usar PSCP ou configure chaves SSH" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n⚙️ Configurando permissões no servidor..." -ForegroundColor Yellow

# Configurar permissões via SSH
try {
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        plink -batch ${VPS_USER}@${VPS_IP} "mkdir -p ${VPS_PATH}; chown -R www-data:www-data ${VPS_PATH}; chmod -R 755 ${VPS_PATH}"
    } else {
        ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${VPS_PATH}; chown -R www-data:www-data ${VPS_PATH}; chmod -R 755 ${VPS_PATH}"
    }
} catch {
    Write-Host "⚠️ Não foi possível configurar permissões automaticamente" -ForegroundColor Yellow
    Write-Host "Execute manualmente no servidor:" -ForegroundColor Cyan
    Write-Host "  mkdir -p ${VPS_PATH}" -ForegroundColor White
    Write-Host "  chown -R www-data:www-data ${VPS_PATH}" -ForegroundColor White
    Write-Host "  chmod -R 755 ${VPS_PATH}" -ForegroundColor White
}

Write-Host "`n🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs de acesso:" -ForegroundColor Yellow
Write-Host "   🌐 Principal: http://${VPS_IP}/dao-instructions.html" -ForegroundColor Cyan
Write-Host "   📊 Dashboard DAO: http://${VPS_IP}/dao-dashboard.html" -ForegroundColor Cyan
Write-Host "   📈 Dashboard SingulAI: http://${VPS_IP}/dashboard.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Teste os links acima" -ForegroundColor White
Write-Host "   2. Configure domínio personalizado se necessário" -ForegroundColor White
Write-Host "   3. Configure SSL/HTTPS" -ForegroundColor White
Write-Host ""
Write-Host "✅ SingulDAO está online!" -ForegroundColor Green