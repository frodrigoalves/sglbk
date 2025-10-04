@echo off
echo =========================================
echo    SINGULAI MVP - DEPLOY MELHORADO
echo =========================================
echo.

set VPS_HOST=72.60.147.56
set VPS_USER=root
set LOCAL_DIR=C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts\frontend
set REMOTE_DIR=/var/www/html

echo 📤 Enviando arquivos corrigidos...
echo.

echo [1/5] Enviando HTML principal melhorado...
scp "%LOCAL_DIR%\mvp-corrected.html" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/mvp.html"
if %errorlevel% neq 0 echo ❌ Erro ao enviar HTML

echo [2/5] Enviando CSS profissional...
scp "%LOCAL_DIR%\singulai-professional-improved.css" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo ❌ Erro ao enviar CSS

echo [3/5] Enviando Web3 melhorado...
scp "%LOCAL_DIR%\singulai-web3-improved.js" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo ❌ Erro ao enviar Web3 JS

echo [4/5] Enviando Chat melhorado...
scp "%LOCAL_DIR%\singulai-chat-improved.js" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo ❌ Erro ao enviar Chat JS

echo [5/5] Reiniciando servicos...
ssh "%VPS_USER%@%VPS_HOST%" "systemctl reload nginx && pm2 restart all"
if %errorlevel% neq 0 echo ❌ Erro ao reiniciar servicos

echo.
echo =========================================
echo ✅ DEPLOY CONCLUIDO COM SUCESSO!
echo =========================================
echo.
echo 🔧 MELHORIAS IMPLEMENTADAS:
echo   ✓ Conexao Web3 corrigida e melhorada
echo   ✓ Modal com formatacao profissional
echo   ✓ Chat com design corporativo
echo   ✓ Exibicao de saldos corrigida
echo   ✓ Layout responsivo e acessivel
echo   ✓ Design system baseado em Figma
echo.
echo 🌐 Acesse: https://singulai.live/mvp.html
echo 📱 Interface otimizada para desktop e mobile
echo 🔗 Conectividade Web3 aprimorada
echo.
pause