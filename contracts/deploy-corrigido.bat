@echo off
echo.
echo ========================================
echo   🚀 SINGULAI - DEPLOY COM CORREÇÕES
echo ========================================
echo.

echo ✅ Fixando problemas identificados:
echo    - Endereço do token SGL correto (DAI Sepolia)
echo    - Remoção de elemento inexistente
echo    - Correção de CSS duplicado
echo.

echo 📡 Conectando ao servidor VPS...
scp frontend/mvp-corrected.html root@72.60.147.56:/var/www/html/
if errorlevel 1 (
    echo ❌ Erro no upload do HTML
    pause
    exit /b 1
)

scp frontend/singulai-professional-improved.css root@72.60.147.56:/var/www/html/
if errorlevel 1 (
    echo ❌ Erro no upload do CSS
    pause
    exit /b 1
)

scp frontend/singulai-web3-improved.js root@72.60.147.56:/var/www/html/
if errorlevel 1 (
    echo ❌ Erro no upload do Web3 JS (com correções)
    pause
    exit /b 1
)

scp frontend/singulai-chat-improved.js root@72.60.147.56:/var/www/html/
if errorlevel 1 (
    echo ❌ Erro no upload do Chat JS
    pause
    exit /b 1
)

echo.
echo 🔄 Reiniciando serviços no servidor...
ssh root@72.60.147.56 "pm2 restart singulai-mvp singulai-backend && nginx -s reload"
if errorlevel 1 (
    echo ❌ Erro ao reiniciar serviços
    pause
    exit /b 1
)

echo.
echo ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo.
echo 🔧 CORREÇÕES APLICADAS:
echo    ✓ Token SGL: Endereço DAI Sepolia correto
echo    ✓ Elemento: Removido referência inexistente
echo    ✓ CSS: Corrigido carregamento duplicado
echo    ✓ Modal: Integração CSS corrigida
echo.
echo 🧪 COMO TESTAR:
echo    1. Acesse: http://72.60.147.56/mvp-corrected.html
echo    2. Conecte MetaMask na rede Sepolia
echo    3. Adicione token DAI:
echo       📍 Endereço: 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357
echo       📍 Símbolo: DAI
echo       📍 Decimais: 18
echo    4. Verifique se saldo SGL aparece
echo    5. Teste modais e interface chat
echo.
echo 📊 DEBUG LOGS: Verifique console do navegador
echo.
pause