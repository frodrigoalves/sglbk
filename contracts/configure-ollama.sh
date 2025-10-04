#!/bin/bash

echo "🔧 CONFIGURANDO OLLAMA NO BACKEND SINGULAI"
echo "=========================================="

# Verificar se o diretório do backend existe
if [ ! -d "/opt/singulai/backend" ]; then
    echo "❌ Diretório /opt/singulai/backend não encontrado"
    exit 1
fi

cd /opt/singulai/backend

# Backup do .env atual se existir
if [ -f ".env" ]; then
    echo "📋 Fazendo backup do .env atual..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Criar/atualizar .env com configurações do Ollama
echo "⚙️ Configurando variáveis de ambiente..."

cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://singulai_user:singulai_password@localhost:5432/singulai_db

# JWT Configuration
JWT_SECRET=sua_chave_super_secreta_aqui_change_this_in_production

# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://72.60.147.56

# Email Configuration (configure se necessário)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Ollama Configuration
OLLAMA_ENABLED=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Contract Addresses (Sepolia)
AVATAR_BASE_ADDRESS=0x123...
AVATAR_WALLET_LINK_ADDRESS=0x456...
TIME_CAPSULE_ADDRESS=0x789...
DIGITAL_LEGACY_ADDRESS=0xABC...
SGL_TOKEN_ADDRESS=0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357

# Web3 Configuration
INFURA_PROJECT_ID=
PRIVATE_KEY=
EOF

echo "✅ Arquivo .env configurado com sucesso!"
echo ""
echo "📝 Configurações aplicadas:"
echo "   OLLAMA_ENABLED=true"
echo "   OLLAMA_URL=http://localhost:11434"
echo "   OLLAMA_MODEL=llama2"
echo ""

# Verificar se PM2 está instalado
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando backend com PM2..."
    pm2 restart singulai-backend
    echo "✅ Backend reiniciado!"
else
    echo "⚠️ PM2 não encontrado. Reinicie o backend manualmente."
fi

echo ""
echo "🧪 Para testar a configuração:"
echo "curl -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' -d '{\"message\":\"Teste de conexão\"}'"
echo ""
echo "✅ Configuração concluída!"