@echo off
echo ========================================
echo   SingulAI Full Stack Startup Script
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado
    echo 📥 Baixe e instale Node.js de: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado

REM Instalar dependências do backend se necessário
if not exist "backend\node_modules" (
    echo 🔄 Instalando dependências do backend...
    cd backend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do backend
        pause
        exit /b 1
    )
    cd ..
)

REM Verificar se PostgreSQL está rodando (opcional)
echo 🔍 Verificando PostgreSQL...
net start | find "postgresql" >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL pode não estar rodando
    echo 📝 Certifique-se de que o PostgreSQL está iniciado
    echo    Execute: net start postgresql-x64-15 (ou similar)
    echo.
)

echo.
echo 🚀 Iniciando serviços...
echo.

REM Iniciar backend em background
start "SingulAI Backend" cmd /c "cd backend && npm run dev"

REM Aguardar backend iniciar
timeout /t 3 /nobreak >nul

REM Iniciar frontend
start "SingulAI Frontend" cmd /c "cd frontend && python -m http.server 8000"

echo.
echo ✅ Serviços iniciados!
echo.
echo 🌐 Frontend: http://localhost:8000/login.html
echo 🔧 Backend:  http://localhost:3000
echo 📊 Health:   http://localhost:3000/api/health
echo.
echo 📝 Para parar os serviços:
echo    Feche as janelas do terminal ou pressione Ctrl+C
echo.
pause