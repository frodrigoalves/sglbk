@echo off
setlocal enabledelayedexpansion
title SingulAI MVP - Deploy Automatico

:: Configuracoes
set PROJECT_DIR=%cd%
set FRONTEND_DIR=%PROJECT_DIR%\frontend
set PORT=8000

:: Cores para output
:: Nao ha cores nativas no batch, mas podemos usar echo com formatacao

:main
call :banner
if "%~1"=="" goto help
if /i "%~1"=="help" goto help
if /i "%~1"=="install" goto install
if /i "%~1"=="setup" goto install
if /i "%~1"=="deploy" goto deploy
if /i "%~1"=="start" goto start
if /i "%~1"=="serve" goto start
if /i "%~1"=="stop" goto stop
if /i "%~1"=="status" goto status
if /i "%~1"=="backup" goto backup
if /i "%~1"=="clean" goto clean
if /i "%~1"=="full" goto full
goto help

:banner
echo.
echo ===============================================
echo           🤖 SingulAI MVP
echo         Deploy Automatico v2.0
echo      O futuro registrado, codificado
echo ===============================================
echo.
goto :eof

:check_deps
echo [INFO] Verificando dependencias...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js nao encontrado. Por favor, instale Node.js.
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm nao encontrado. Por favor, instale npm.
    exit /b 1
)
echo [SUCCESS] Dependencias verificadas
goto :eof

:install
call :check_deps
echo [INFO] Configurando ambiente...
if exist package.json (
    echo [INFO] Instalando dependencias do projeto...
    npm install
    if errorlevel 1 (
        echo [ERROR] Falha ao instalar dependencias
        exit /b 1
    )
    echo [SUCCESS] Dependencias instaladas
)
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [INFO] Arquivo .env criado a partir do .env.example
        echo [WARNING] Configure as variaveis de ambiente no arquivo .env
    )
) else (
    echo [SUCCESS] Arquivo .env encontrado
)
echo [SUCCESS] Ambiente configurado
goto :eof

:deploy
call :check_deps
echo [INFO] Compilando contratos...
npx hardhat compile
if errorlevel 1 (
    echo [ERROR] Erro ao compilar contratos
    exit /b 1
)
echo [SUCCESS] Contratos compilados

set /p DEPLOY_CHOICE="Deseja fazer deploy dos contratos? (y/N): "
if /i "!DEPLOY_CHOICE!"=="y" (
    set /p NETWORK="Rede de deploy (localhost/sepolia) [sepolia]: "
    if "!NETWORK!"=="" set NETWORK=sepolia
    
    echo [INFO] Fazendo deploy na rede !NETWORK!...
    npx hardhat run scripts/deploy.js --network !NETWORK!
    if errorlevel 1 (
        echo [ERROR] Erro no deploy
        exit /b 1
    )
    echo [SUCCESS] Deploy dos contratos concluido
)
goto :eof

:start
if "%~2" neq "" set PORT=%~2
call :check_deps
echo [INFO] Configurando frontend...

if not exist "%FRONTEND_DIR%" mkdir "%FRONTEND_DIR%"

if not exist "%FRONTEND_DIR%\singulai-complete.html" (
    echo [ERROR] Arquivo frontend nao encontrado: singulai-complete.html
    exit /b 1
)

echo [INFO] Iniciando servidor local na porta %PORT%...
netstat -an | find ":%PORT%" >nul
if not errorlevel 1 (
    echo [WARNING] Porta %PORT% ja esta em uso
    set /p NEW_PORT="Usar porta diferente? [8001]: "
    if "!NEW_PORT!"=="" set NEW_PORT=8001
    set PORT=!NEW_PORT!
)

cd /d "%FRONTEND_DIR%"

:: Tentar iniciar servidor Python primeiro
where python >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Iniciando servidor Python...
    start /b python -m http.server %PORT%
    set SERVER_TYPE=python
) else (
    :: Fallback para servidor Node.js
    where npx >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] Iniciando servidor Node.js...
        start /b npx serve -p %PORT%
        set SERVER_TYPE=node
    ) else (
        echo [ERROR] Nenhum servidor disponivel (Python ou Node.js)
        cd /d "%PROJECT_DIR%"
        exit /b 1
    )
)

timeout /t 3 >nul
echo [SUCCESS] Servidor iniciado na porta %PORT%
echo [SUCCESS] Acesse: http://localhost:%PORT%/singulai-complete.html

set /p OPEN_BROWSER="Abrir no navegador? (Y/n): "
if /i not "!OPEN_BROWSER!"=="n" (
    start http://localhost:%PORT%/singulai-complete.html
)

cd /d "%PROJECT_DIR%"
goto :eof

:stop
echo [INFO] Parando servidor...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo [SUCCESS] Servidor parado
goto :eof

:status
echo [INFO] Verificando status do sistema...

:: Verificar se servidor esta rodando
netstat -an | find ":8000" >nul
if not errorlevel 1 (
    echo [SUCCESS] Servidor ativo na porta 8000
) else (
    echo [INFO] Servidor nao esta rodando
)

:: Verificar arquivos frontend
if exist "%FRONTEND_DIR%\singulai-complete.html" (
    echo [SUCCESS] Frontend disponivel
) else (
    echo [ERROR] Frontend nao encontrado
)

:: Verificar contratos compilados
if exist artifacts (
    echo [SUCCESS] Contratos compilados
) else (
    echo [WARNING] Contratos nao compilados
)
goto :eof

:backup
echo [INFO] Criando backup...
set BACKUP_NAME=backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_NAME=%BACKUP_NAME: =0%

if not exist backups mkdir backups

if exist "%FRONTEND_DIR%" (
    xcopy "%FRONTEND_DIR%" "backups\%BACKUP_NAME%" /E /I /Q >nul
    echo [SUCCESS] Backup criado: backups\%BACKUP_NAME%
) else (
    echo [WARNING] Pasta frontend nao encontrada
)
goto :eof

:clean
echo [INFO] Limpando arquivos temporarios...
call :stop

if exist cache (
    rmdir /s /q cache
    echo [SUCCESS] Cache do Hardhat limpo
)

set /p CLEAN_NODE="Limpar node_modules? (y/N): "
if /i "!CLEAN_NODE!"=="y" (
    if exist node_modules (
        rmdir /s /q node_modules
        echo [SUCCESS] node_modules removido
    )
)
goto :eof

:full
echo [INFO] Deploy completo iniciado...
call :install
if errorlevel 1 exit /b 1

call :deploy
if errorlevel 1 exit /b 1

call :start
if errorlevel 1 exit /b 1

echo [SUCCESS] Deploy completo finalizado!
goto :eof

:help
echo SingulAI MVP - Script de Deploy para Windows
echo Uso: deploy.bat [comando] [porta]
echo.
echo Comandos disponiveis:
echo   install, setup    - Instalar e configurar ambiente
echo   deploy           - Deploy dos contratos
echo   start, serve     - Iniciar servidor frontend [porta]
echo   stop             - Parar servidor
echo   status           - Verificar status do sistema
echo   backup           - Criar backup dos arquivos
echo   clean            - Limpar arquivos temporarios
echo   full             - Deploy completo (all-in-one)
echo   help             - Mostrar esta ajuda
echo.
echo Exemplos:
echo   deploy.bat full                    # Deploy completo
echo   deploy.bat start 3000             # Iniciar na porta 3000
echo   deploy.bat deploy                 # Apenas deploy contratos
echo.
goto :eof

:eof
endlocal