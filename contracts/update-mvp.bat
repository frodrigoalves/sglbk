@echo off
echo Atualizando mvp.html na VPS...
echo.

set VPS_HOST=72.60.147.56
set VPS_USER=root
set LOCAL_FILE=C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts\frontend\mvp.html
set REMOTE_DIR=/var/www/html

echo Enviando mvp.html atualizado com chat GPT-style...
scp "%LOCAL_FILE%" "%VPS_USER%@%VPS_HOST%:%REMOTE_DIR%/"
if %errorlevel% neq 0 echo Erro ao enviar mvp.html

echo.
echo Reiniciando nginx...
ssh "%VPS_USER%@%VPS_HOST%" "systemctl reload nginx"
if %errorlevel% neq 0 echo Erro ao recarregar nginx

echo.
echo Atualizacao concluida!
echo Acesse: https://singulai.live/mvp.html
pause