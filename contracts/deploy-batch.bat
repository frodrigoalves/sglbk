@echo off
echo Fazendo deploy do SingulAI na VPS...
echo.

set VPS_HOST=72.60.147.56
set VPS_USER=root
set LOCAL_DIR=C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts\frontend
set REMOTE_DIR=/var/www/html

echo Enviando arquivos atualizados...

echo Enviando singulai-professional.html...
scp "%LOCAL_DIR%\singulai-professional.html" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo Erro ao enviar singulai-professional.html

echo Enviando singulai-professional.css...
scp "%LOCAL_DIR%\singulai-professional.css" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo Erro ao enviar singulai-professional.css

echo Enviando singulai-professional-app.js...
scp "%LOCAL_DIR%\singulai-professional-app.js" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo Erro ao enviar singulai-professional-app.js

echo Enviando singulai-professional.js...
scp "%LOCAL_DIR%\singulai-professional.js" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo Erro ao enviar singulai-professional.js

echo.
echo Reiniciando servicos na VPS...

echo Reiniciando nginx...
ssh "%VPS_USER%@%VPS_HOST%" "systemctl reload nginx"
if %errorlevel% neq 0 echo Erro ao recarregar nginx

echo Reiniciando backend...
ssh "%VPS_USER%@%VPS_HOST%" "cd /opt/singulai && pm2 restart all"
if %errorlevel% neq 0 echo Erro ao reiniciar backend

echo.
echo Deploy concluido!
echo Acesse: https://singulai.live
pause