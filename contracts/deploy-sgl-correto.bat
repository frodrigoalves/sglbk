@echo off
echo.
echo ========================================
echo   🔄 CORREÇÃO ENDEREÇO SGL TOKEN  
echo ========================================
echo.

echo ✅ Corrigindo endereço do SGL Token:
echo    ❌ ANTERIOR: 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357 (DAI)
echo    ✅ CORRETO:  0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1 (SGL)
echo.

echo 📡 Enviando arquivos corrigidos...

scp frontend/singulai-web3-improved.js root@72.60.147.56:/var/www/html/
if errorlevel 1 (
    echo ❌ Erro no upload do Web3 JS
    pause
    exit /b 1
)

scp backend-env-production root@72.60.147.56:/opt/singulai/backend/.env
if errorlevel 1 (
    echo ❌ Erro no upload do .env
    pause
    exit /b 1
)

echo.
echo 🔄 Reiniciando serviços...
ssh root@72.60.147.56 "pkill -f 'node.*index.js' && cd /opt/singulai/backend && nohup node index.js > backend.log 2>&1 & nginx -s reload"
if errorlevel 1 (
    echo ❌ Erro ao reiniciar serviços
    pause
    exit /b 1
)

echo.
echo ✅ CORREÇÃO APLICADA COM SUCESSO!
echo.
echo 🎯 TOKEN SGL CONFIGURADO:
echo    📍 Endereço: 0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
echo    🏷️ Nome: SingulAI Token
echo    🔤 Símbolo: SGL  
echo    📊 Decimais: 18
echo.
echo 🧪 COMO TESTAR:
echo    1. Acesse: https://singulai.live/mvp-corrected.html
echo    2. Conecte MetaMask (rede Sepolia)
echo    3. Adicione token SGL:
echo       📍 0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
echo       🔤 SGL
echo       📊 18 decimais
echo    4. Verifique saldo SGL no dashboard
echo.
pause