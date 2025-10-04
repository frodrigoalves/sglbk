# Script para corrigir VPS com arquivo profissional correto
Write-Host "🔧 CORREÇÃO URGENTE DO VPS - Deploy do Dashboard Profissional" -ForegroundColor Red

# Fazer backup do index atual
Write-Host "1. Fazendo backup do index.html atual..." -ForegroundColor Yellow
ssh root@72.60.147.56 "cp /var/www/html/index.html /var/www/html/index-backup-$(date +%Y%m%d-%H%M).html"

# Substituir pelo singulai-professional.html que já existe no VPS e tem as atualizações
Write-Host "2. Substituindo pelo arquivo profissional correto..." -ForegroundColor Yellow
ssh root@72.60.147.56 "cp /var/www/html/singulai-professional.html /var/www/html/index.html"

# Verificar se a correção funcionou
Write-Host "3. Verificando correção..." -ForegroundColor Yellow
ssh root@72.60.147.56 "grep -c 'trocar.*avatar\|Trocar Avatar' /var/www/html/index.html"

Write-Host "✅ CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "🌐 Teste em: http://72.60.147.56" -ForegroundColor Cyan