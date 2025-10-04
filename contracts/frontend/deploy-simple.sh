#!/bin/bash

echo "🚀 Iniciando deploy do SingulDAO na VPS..."

VPS_IP="72.60.147.56"
VPS_USER="root"
VPS_PATH="/var/www/singulao"

echo "📤 Fazendo upload dos arquivos..."

# Upload dos arquivos HTML principais
scp dao-instructions.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp dao-dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp dashboard.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp index.html ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# Upload dos arquivos JS
scp *.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# Upload dos arquivos CSS
scp *.css ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

echo "⚙️ Configurando permissões..."

ssh ${VPS_USER}@${VPS_IP} "chown -R www-data:www-data ${VPS_PATH}; chmod -R 755 ${VPS_PATH}"

echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://${VPS_IP}/dao-instructions.html"