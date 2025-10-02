@echo off
echo ========================================
echo   SingulAI Database Setup Script
echo ========================================
echo.

REM Verificar se PostgreSQL está instalado
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado no PATH
    echo 📥 Baixe e instale PostgreSQL de: https://www.postgresql.org/download/windows/
    echo.
    echo Após instalar, execute este script novamente.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado

REM Solicitar credenciais do banco
echo.
echo 🔐 Configuração do banco de dados:
set /p DB_USER="Digite o nome do usuário PostgreSQL (padrão: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASS="Digite a senha do usuário PostgreSQL: "
if "%DB_PASS%"=="" (
    echo ❌ Senha é obrigatória
    pause
    exit /b 1
)

set /p DB_NAME="Digite o nome do banco (padrão: singulai_db): "
if "%DB_NAME%"=="" set DB_NAME=singulai_db

echo.
echo 🔄 Criando banco de dados...

REM Criar banco de dados
createdb -U %DB_USER% -W %DB_PASS% %DB_NAME% 2>nul
if %errorlevel% neq 0 (
    echo ❌ Erro ao criar banco de dados
    echo Verifique se o usuário tem permissões adequadas
    pause
    exit /b 1
)

echo ✅ Banco de dados '%DB_NAME%' criado

REM Executar script de inicialização
echo.
echo 🔄 Executando script de inicialização...
psql -U %DB_USER% -d %DB_NAME% -f database\init.sql
if %errorlevel% neq 0 (
    echo ❌ Erro ao executar script de inicialização
    pause
    exit /b 1
)

echo.
echo ✅ Banco de dados configurado com sucesso!
echo.
echo 📝 Atualize seu arquivo .env com:
echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASS%@localhost:5432/%DB_NAME%
echo.
echo 🚀 Agora você pode iniciar o servidor backend:
echo cd backend
echo npm install
echo npm start
echo.
pause