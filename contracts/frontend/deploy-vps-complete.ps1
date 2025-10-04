# Deploy Script para SingulDAO na VPS
# Script otimizado para Windows PowerShell
param(
    [string]$VpsIp = "72.60.147.56",
    [string]$VpsUser = "root",
    [string]$VpsPath = "/var/www/html"
)

Write-Host "🚀 Iniciando deploy do SingulDAO na VPS $VpsIp" -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "dao-instructions.html")) {
    Write-Host "❌ Erro: Execute este script no diretório frontend/" -ForegroundColor Red
    exit 1
}

# Lista de arquivos para upload
$filesToUpload = @(
    "dao-instructions.html",
    "dao-dashboard.html", 
    "dashboard.html",
    "singulai-dao.js",
    "singulai-mvp.js",
    "app.js"
)

# Verificar arquivos
Write-Host "📋 Verificando arquivos..." -ForegroundColor Yellow
foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $file ($([math]::Round($size/1KB, 1))KB)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $file - não encontrado" -ForegroundColor Yellow
    }
}

# Método 1: Tentar com scp usando senha
Write-Host "`n📤 Tentando upload com SCP..." -ForegroundColor Yellow

$uploadSuccess = $false

# Criar script temporário para upload
$uploadScript = @"
@echo off
echo Fazendo upload dos arquivos...
"@

# Adicionar comandos scp para cada arquivo
foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        $uploadScript += "`nscp `"$file`" ${VpsUser}@${VpsIp}:${VpsPath}/"
    }
}

# Salvar script
$uploadScript | Out-File -FilePath "upload-temp.bat" -Encoding ASCII

try {
    # Executar upload
    cmd /c "upload-temp.bat"
    
    # Testar se upload funcionou
    $response = Invoke-WebRequest -Uri "http://$VpsIp/dao-instructions.html" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $uploadSuccess = $true
        Write-Host "✅ Upload realizado com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Upload via SCP falhou: $_" -ForegroundColor Yellow
}

# Método 2: Se SCP falhar, tentar via HTTP/API
if (-not $uploadSuccess) {
    Write-Host "`n🔄 Tentando método alternativo..." -ForegroundColor Yellow
    
    # Criar um servidor temporário para servir os arquivos
    $serverJob = Start-Job -ScriptBlock {
        param($port)
        cd $using:PWD
        python -m http.server $port
    } -ArgumentList 8081
    
    Start-Sleep 3
    
    try {
        # Instruir o usuário sobre upload manual
        Write-Host "`n📋 Upload manual necessário:" -ForegroundColor Cyan
        Write-Host "1. Acesse o servidor VPS via SSH" -ForegroundColor White
        Write-Host "2. Execute os seguintes comandos:" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        
        foreach ($file in $filesToUpload) {
            if (Test-Path $file) {
                Write-Host "wget http://YOUR_IP:8081/$file -O ${VpsPath}/$file" -ForegroundColor Cyan
            }
        }
        
        Write-Host "`n📱 Ou use este método direto:" -ForegroundColor Yellow
        Write-Host "ssh ${VpsUser}@${VpsIp}" -ForegroundColor Cyan
        Write-Host "cd ${VpsPath}" -ForegroundColor Cyan
        
        foreach ($file in $filesToUpload) {
            if (Test-Path $file) {
                Write-Host "wget https://frodrigoalves.github.io/sglbk/contracts/frontend/$file" -ForegroundColor Cyan
            }
        }
        
    } finally {
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -ErrorAction SilentlyContinue
    }
}

# Limpeza
if (Test-Path "upload-temp.bat") {
    Remove-Item "upload-temp.bat"
}

# Configurar permissões via SSH
Write-Host "`n⚙️ Configurando permissões..." -ForegroundColor Yellow

$sshCommands = @"
mkdir -p ${VpsPath}
chown -R www-data:www-data ${VpsPath}
chmod -R 755 ${VpsPath}
systemctl reload nginx
"@

Write-Host "Execute no servidor VPS:" -ForegroundColor Cyan
Write-Host $sshCommands -ForegroundColor White

# URLs finais
Write-Host "`n🎉 Deploy configurado!" -ForegroundColor Green
Write-Host "`n📋 URLs de teste:" -ForegroundColor Yellow
Write-Host "🌐 Principal: http://$VpsIp/dao-instructions.html" -ForegroundColor Cyan
Write-Host "📊 DAO Dashboard: http://$VpsIp/dao-dashboard.html" -ForegroundColor Cyan
Write-Host "📈 SingulAI Dashboard: http://$VpsIp/dashboard.html" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://$VpsIp:3000/api/health" -ForegroundColor Cyan

Write-Host "`n✅ Script concluído!" -ForegroundColor Green