#!/bin/bash

# Script de Deploy SingulDAO para VPS
# Execute este script na VPS como root

echo "🚀 Fazendo deploy do SingulDAO na VPS..."

# Diretório de destino
DEST_DIR="/var/www/html"
GITHUB_BASE="https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend"

# Criar diretório se não existir
mkdir -p $DEST_DIR
cd $DEST_DIR

echo "📥 Baixando arquivos do GitHub..."

# Baixar arquivos principais
wget -O dao-instructions.html "$GITHUB_BASE/dao-instructions.html"
wget -O dao-dashboard.html "$GITHUB_BASE/dao-dashboard.html" 
wget -O dashboard.html "$GITHUB_BASE/dashboard.html"
wget -O singulai-dao.js "$GITHUB_BASE/singulai-dao.js"
wget -O singulai-mvp.js "$GITHUB_BASE/singulai-mvp.js"
wget -O app.js "$GITHUB_BASE/app.js"

# Baixar arquivos CSS
wget -O singulai-mvp.css "$GITHUB_BASE/singulai-mvp.css" 2>/dev/null || echo "CSS não encontrado"
wget -O login.css "$GITHUB_BASE/login.css" 2>/dev/null || echo "login.css não encontrado"

echo "⚙️ Configurando permissões..."

# Configurar permissões
chown -R www-data:www-data $DEST_DIR
chmod -R 755 $DEST_DIR

# Recarregar nginx
systemctl reload nginx

echo "✅ Verificando arquivos baixados..."
ls -la $DEST_DIR/*.html $DEST_DIR/*.js 2>/dev/null

echo "🌐 Testando URLs..."
echo "Principal: http://$(curl -s ipinfo.io/ip)/dao-instructions.html"
echo "DAO Dashboard: http://$(curl -s ipinfo.io/ip)/dao-dashboard.html"
echo "SingulAI Dashboard: http://$(curl -s ipinfo.io/ip)/dashboard.html"

echo "🎉 Deploy concluído!"