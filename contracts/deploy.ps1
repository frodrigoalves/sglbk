# SingulAI MVP - Script de Deploy Automático para Windows
# Versão: 2.0
# Data: 22/09/2025

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [int]$Port = 8000
)

# Configurações
$ErrorActionPreference = "Stop"
$ProjectDir = Get-Location
$FrontendDir = Join-Path $ProjectDir "frontend"
$DeployDir = Join-Path $ProjectDir "deploy"
$BackupDir = Join-Path $ProjectDir "backups"

# Funções auxiliares para output colorido
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Banner
function Show-Banner {
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║              🤖 SingulAI MVP                 ║" -ForegroundColor Blue
    Write-Host "║           Deploy Automático v2.0            ║" -ForegroundColor Blue
    Write-Host "║        O futuro registrado, codificado       ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Blue
}

# Verificar dependências
function Test-Dependencies {
    Write-Info "Verificando dependências..."
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js não encontrado. Por favor, instale Node.js."
        exit 1
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm não encontrado. Por favor, instale npm."
        exit 1
    }
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Warning "Git não encontrado. Algumas funcionalidades podem não funcionar."
    }
    
    Write-Success "Dependências verificadas"
}

# Verificar conectividade
function Test-Network {
    Write-Info "Verificando conectividade..."
    try {
        $ping = Test-Connection -ComputerName "8.8.8.8" -Count 1 -Quiet
        if ($ping) {
            Write-Success "Conectividade OK"
        } else {
            Write-Error "Sem conectividade com a internet"
            exit 1
        }
    } catch {
        Write-Error "Erro ao verificar conectividade"
        exit 1
    }
}

# Criar backup
function New-Backup {
    Write-Info "Criando backup..."
    $BackupName = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    if (Test-Path $FrontendDir) {
        $BackupPath = Join-Path $BackupDir $BackupName
        Copy-Item -Path $FrontendDir -Destination $BackupPath -Recurse -Force
        Write-Success "Backup criado: $BackupPath"
    }
}

# Configurar ambiente
function Initialize-Environment {
    Write-Info "Configurando ambiente..."
    
    # Instalar dependências
    if (Test-Path "package.json") {
        Write-Info "Instalando dependências do projeto..."
        npm install
        Write-Success "Dependências instaladas"
    }
    
    # Verificar arquivo .env
    if (-not (Test-Path ".env")) {
        Write-Warning "Arquivo .env não encontrado"
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Info "Arquivo .env criado a partir do .env.example"
            Write-Warning "Por favor, configure as variáveis de ambiente no arquivo .env"
        }
    } else {
        Write-Success "Arquivo .env encontrado"
    }
}

# Compilar contratos
function Build-Contracts {
    Write-Info "Compilando contratos..."
    
    try {
        npx hardhat compile
        Write-Success "Contratos compilados"
    } catch {
        Write-Error "Erro ao compilar contratos: $($_.Exception.Message)"
        return $false
    }
    return $true
}

# Deploy dos contratos
function Deploy-Contracts {
    $response = Read-Host "Deseja fazer deploy dos contratos? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Info "Fazendo deploy dos contratos..."
        
        $network = Read-Host "Rede de deploy (localhost/sepolia) [sepolia]"
        if ([string]::IsNullOrEmpty($network)) { $network = "sepolia" }
        
        if ($network -eq "localhost") {
            Write-Info "Iniciando rede local..."
            $hardhatProcess = Start-Process -FilePath "npx" -ArgumentList "hardhat", "node" -PassThru -NoNewWindow
            Start-Sleep -Seconds 5
        }
        
        try {
            npx hardhat run scripts/deploy.js --network $network
            Write-Success "Deploy dos contratos concluído"
        } catch {
            Write-Error "Erro no deploy: $($_.Exception.Message)"
        }
        
        if ($network -eq "localhost" -and $hardhatProcess) {
            Stop-Process -Id $hardhatProcess.Id -Force
        }
    }
}

# Configurar frontend
function Initialize-Frontend {
    Write-Info "Configurando frontend..."
    
    if (-not (Test-Path $FrontendDir)) {
        New-Item -ItemType Directory -Path $FrontendDir -Force | Out-Null
    }
    
    $requiredFiles = @(
        Join-Path $FrontendDir "singulai-complete.html",
        Join-Path $FrontendDir "singulai-advanced.js"
    )
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Error "Arquivo necessário não encontrado: $file"
            return $false
        }
    }
    
    Write-Success "Frontend configurado"
    return $true
}

# Iniciar servidor
function Start-Server {
    param([int]$ServerPort = 8000)
    
    Write-Info "Iniciando servidor local..."
    
    # Verificar se a porta está disponível
    $portInUse = Get-NetTCPConnection -LocalPort $ServerPort -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warning "Porta $ServerPort já está em uso"
        $newPort = Read-Host "Usar porta diferente? [8001]"
        if ([string]::IsNullOrEmpty($newPort)) { $newPort = 8001 }
        $ServerPort = [int]$newPort
    }
    
    Set-Location $FrontendDir
    
    # Iniciar servidor Python ou Node.js
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Info "Iniciando servidor Python na porta $ServerPort..."
        $serverProcess = Start-Process -FilePath "python" -ArgumentList "-m", "http.server", $ServerPort -PassThru -NoNewWindow
    } elseif (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Info "Iniciando servidor Node.js na porta $ServerPort..."
        $serverProcess = Start-Process -FilePath "npx" -ArgumentList "serve", "-p", $ServerPort -PassThru -NoNewWindow
    } else {
        Write-Error "Nenhum servidor disponível (Python ou Node.js)"
        Set-Location $ProjectDir
        return $false
    }
    
    Start-Sleep -Seconds 3
    
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Write-Success "Servidor iniciado na porta $ServerPort (PID: $($serverProcess.Id))"
        $url = "http://localhost:$ServerPort/singulai-complete.html"
        Write-Success "Acesse: $url"
        
        # Salvar PID para cleanup posterior
        $serverProcess.Id | Out-File -FilePath (Join-Path $ProjectDir ".server_pid") -Encoding ASCII
        
        # Abrir no navegador
        $openBrowser = Read-Host "Abrir no navegador? (Y/n)"
        if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
            Start-Process $url
        }
        
        Set-Location $ProjectDir
        return $true
    } else {
        Write-Error "Falha ao iniciar servidor"
        Set-Location $ProjectDir
        return $false
    }
}

# Parar servidor
function Stop-Server {
    $pidFile = Join-Path $ProjectDir ".server_pid"
    if (Test-Path $pidFile) {
        $serverPid = Get-Content $pidFile
        try {
            $process = Get-Process -Id $serverPid -ErrorAction Stop
            Stop-Process -Id $serverPid -Force
            Write-Success "Servidor parado (PID: $serverPid)"
        } catch {
            Write-Info "Processo do servidor não encontrado"
        }
        Remove-Item $pidFile -Force
    } else {
        Write-Info "Nenhum servidor ativo encontrado"
    }
}

# Verificar status
function Get-Status {
    Write-Info "Verificando status do sistema..."
    
    # Verificar servidor
    $pidFile = Join-Path $ProjectDir ".server_pid"
    if (Test-Path $pidFile) {
        $serverPid = Get-Content $pidFile
        try {
            $process = Get-Process -Id $serverPid -ErrorAction Stop
            Write-Success "Servidor ativo (PID: $serverPid)"
        } catch {
            Write-Warning "Servidor não está rodando"
            Remove-Item $pidFile -Force
        }
    } else {
        Write-Info "Servidor não iniciado"
    }
    
    # Verificar arquivos
    if (Test-Path (Join-Path $FrontendDir "singulai-complete.html")) {
        Write-Success "Frontend disponível"
    } else {
        Write-Error "Frontend não encontrado"
    }
    
    # Verificar contratos compilados
    if (Test-Path "artifacts") {
        Write-Success "Contratos compilados"
    } else {
        Write-Warning "Contratos não compilados"
    }
}

# Limpeza
function Clear-Temp {
    Write-Info "Limpando arquivos temporários..."
    
    Stop-Server
    
    if (Test-Path "cache") {
        Remove-Item "cache" -Recurse -Force
        Write-Success "Cache do Hardhat limpo"
    }
    
    $cleanNodeModules = Read-Host "Limpar node_modules? (y/N)"
    if ($cleanNodeModules -eq "y" -or $cleanNodeModules -eq "Y") {
        Remove-Item "node_modules" -Recurse -Force
        Write-Success "node_modules removido"
    }
}

# Função principal
function Invoke-Main {
    Show-Banner
    
    switch ($Command.ToLower()) {
        { $_ -in @("install", "setup") } {
            Test-Network
            Initialize-Environment
            Build-Contracts
            Initialize-Frontend
            Write-Success "Instalação concluída!"
        }
        "deploy" {
            Build-Contracts
            Deploy-Contracts
        }
        { $_ -in @("start", "serve") } {
            Initialize-Frontend
            Start-Server -ServerPort $Port
        }
        "stop" {
            Stop-Server
        }
        "status" {
            Get-Status
        }
        "backup" {
            New-Backup
        }
        "clean" {
            Clear-Temp
        }
        "full" {
            Write-Info "Deploy completo iniciado..."
            Test-Network
            New-Backup
            Initialize-Environment
            Build-Contracts
            Deploy-Contracts
            Initialize-Frontend
            Start-Server -ServerPort $Port
            Write-Success "Deploy completo finalizado!"
        }
        default {
            Write-Host "SingulAI MVP - Script de Deploy para Windows" -ForegroundColor Cyan
            Write-Host "Uso: .\deploy.ps1 [comando] [porta]" -ForegroundColor White
            Write-Host ""
            Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
            Write-Host "  install, setup    - Instalar e configurar ambiente"
            Write-Host "  deploy           - Deploy dos contratos"
            Write-Host "  start, serve     - Iniciar servidor frontend [porta]"
            Write-Host "  stop             - Parar servidor"
            Write-Host "  status           - Verificar status do sistema"
            Write-Host "  backup           - Criar backup dos arquivos"
            Write-Host "  clean            - Limpar arquivos temporários"
            Write-Host "  full             - Deploy completo (all-in-one)"
            Write-Host "  help             - Mostrar esta ajuda"
            Write-Host ""
            Write-Host "Exemplos:" -ForegroundColor Green
            Write-Host "  .\deploy.ps1 full                    # Deploy completo"
            Write-Host "  .\deploy.ps1 start 3000             # Iniciar na porta 3000"
            Write-Host "  .\deploy.ps1 deploy                 # Apenas deploy contratos"
        }
    }

# Executar
try {
    Test-Dependencies
    Invoke-Main
} catch {
    Write-Error "Erro durante execução: $($_.Exception.Message)"
    exit 1
}