# SingulAI MVP - Deploy Script para Windows PowerShell
param(
    [string]$Command = "help",
    [int]$Port = 8000
)

# Configurações
$ProjectDir = Get-Location
$FrontendDir = Join-Path $ProjectDir "frontend"

# Funções de output
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Banner
function Show-Banner {
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host "           🤖 SingulAI MVP v2.0               " -ForegroundColor Blue
    Write-Host "        O futuro registrado, codificado       " -ForegroundColor Blue
    Write-Host "===============================================" -ForegroundColor Blue
}

# Verificar dependências
function Test-Dependencies {
    Write-Info "Verificando dependências..."
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js não encontrado!"
        exit 1
    }
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm não encontrado!"
        exit 1
    }
    Write-Success "Dependências OK"
}

# Instalar
function Install-Project {
    Write-Info "Instalando projeto..."
    if (Test-Path "package.json") {
        npm install
        Write-Success "Dependências instaladas"
    }
    if (!(Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
        Write-Info "Arquivo .env criado"
    }
}

# Compilar contratos
function Invoke-CompileContracts {
    Write-Info "Compilando contratos..."
    npx hardhat compile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Contratos compilados"
        return $true
    } else {
        Write-Error "Erro na compilação"
        return $false
    }
}

# Deploy contratos
function Invoke-PublishContracts {
    $deploy = Read-Host "Deploy dos contratos? (y/N)"
    if ($deploy -eq "y") {
        $network = Read-Host "Rede (localhost/sepolia) [sepolia]"
        if (!$network) { $network = "sepolia" }
        
        Write-Info "Deploy na rede $network..."
        npx hardhat run scripts/deploy.js --network $network
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Deploy concluído"
        } else {
            Write-Error "Erro no deploy"
        }
    }
}

# Verificar frontend
function Test-Frontend {
    if (!(Test-Path $FrontendDir)) {
        New-Item -ItemType Directory -Path $FrontendDir -Force | Out-Null
    }
    
    $htmlFile = Join-Path $FrontendDir "singulai-complete.html"
    $jsFile = Join-Path $FrontendDir "singulai-advanced.js"
    
    if ((Test-Path $htmlFile) -and (Test-Path $jsFile)) {
        Write-Success "Frontend OK"
        return $true
    } else {
        Write-Error "Arquivos frontend não encontrados"
        return $false
    }
}

# Iniciar servidor
function Start-Server {
    param([int]$ServerPort = 8000)
    
    if (!(Test-Frontend)) { return $false }
    
    # Verificar porta
    $portCheck = netstat -an | Select-String ":$ServerPort"
    if ($portCheck) {
        Write-Warning "Porta $ServerPort em uso"
        $newPort = Read-Host "Nova porta [8001]"
        if (!$newPort) { $newPort = 8001 }
        $ServerPort = $newPort
    }
    
    Set-Location $FrontendDir
    
    Write-Info "Iniciando servidor na porta $ServerPort..."
    
    # Tentar Python primeiro
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Info "Usando servidor Python..."
        Start-Process python -ArgumentList "-m","http.server",$ServerPort -NoNewWindow
        Start-Sleep 3
        Write-Success "Servidor iniciado: http://localhost:$ServerPort/singulai-complete.html"
        $global:ServerPort = $ServerPort
        Set-Location $ProjectDir
        return $true
    }
    
    # Fallback para npx serve
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Info "Usando servidor Node.js..."
        Start-Process npx -ArgumentList "serve","-p",$ServerPort -NoNewWindow
        Start-Sleep 3
        Write-Success "Servidor iniciado: http://localhost:$ServerPort/singulai-complete.html"
        $global:ServerPort = $ServerPort
        Set-Location $ProjectDir
        return $true
    }
    
    Write-Error "Nenhum servidor disponível"
    Set-Location $ProjectDir
    return $false
}

# Parar servidor
function Stop-Server {
    Write-Info "Parando servidores..."
    Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Success "Servidores parados"
}

# Status
function Get-Status {
    Write-Info "Status do sistema:"
    
    # Servidor
    $pythonProc = Get-Process -Name python -ErrorAction SilentlyContinue
    $nodeProc = Get-Process -Name node -ErrorAction SilentlyContinue
    
    if ($pythonProc -or $nodeProc) {
        Write-Success "Servidor ativo"
    } else {
        Write-Info "Servidor parado"
    }
    
    # Frontend
    if (Test-Frontend) {
        Write-Success "Frontend disponível"
    } else {
        Write-Warning "Frontend não encontrado"
    }
    
    # Contratos
    if (Test-Path "artifacts") {
        Write-Success "Contratos compilados"
    } else {
        Write-Warning "Contratos não compilados"
    }
}

# Main
Show-Banner
Test-Dependencies

switch ($Command.ToLower()) {
    "install" {
        Install-Project
        Write-Success "Instalação concluída!"
    }
    "deploy" {
        Invoke-CompileContracts
        Invoke-PublishContracts
    }
    "start" {
        Start-Server -ServerPort $Port
        $open = Read-Host "Abrir navegador? (Y/n)"
        if ($open -ne "n") {
            Start-Process "http://localhost:$Port/singulai-complete.html"
        }
    }
    "stop" {
        Stop-Server
    }
    "status" {
        Get-Status
    }
    "full" {
        Write-Info "Deploy completo..."
        Install-Project
        Invoke-CompileContracts
        Invoke-PublishContracts
        Start-Server -ServerPort $Port
        $open = Read-Host "Abrir navegador? (Y/n)"
        if ($open -ne "n") {
            Start-Process "http://localhost:$Port/singulai-complete.html"
        }
        Write-Success "Deploy completo!"
    }
    default {
        Write-Host "SingulAI MVP - Deploy para Windows" -ForegroundColor Cyan
        Write-Host "Uso: .\deploy-simple.ps1 [comando] [porta]" -ForegroundColor White
        Write-Host ""
        Write-Host "Comandos:" -ForegroundColor Yellow
        Write-Host "  install  - Instalar dependências"
        Write-Host "  deploy   - Deploy dos contratos"
        Write-Host "  start    - Iniciar servidor [porta]"
        Write-Host "  stop     - Parar servidor"
        Write-Host "  status   - Ver status"
        Write-Host "  full     - Deploy completo"
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor Green
        Write-Host "  .\deploy-simple.ps1 full"
        Write-Host "  .\deploy-simple.ps1 start 3000"
    }
}