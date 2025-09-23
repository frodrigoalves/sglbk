#!/bin/bash

# Configurações
VPS_IP="72.60.147.56"
SSH_KEY="~/.ssh/id_rsa"
SSH_USER="root"

# Função para verificar serviço
check_service() {
    echo "🔍 Verificando $1..."
    ssh -i $SSH_KEY $SSH_USER@$VPS_IP "docker ps | grep $1" || echo "⚠️ Serviço $1 não encontrado"
}

# Verificar conexão SSH
echo "🔑 Testando conexão SSH..."
ssh -i $SSH_KEY -q $SSH_USER@$VPS_IP exit
if [ $? -eq 0 ]; then
    echo "✅ Conexão SSH OK"
else
    echo "❌ Falha na conexão SSH"
    exit 1
fi

# Verificar serviços
check_service "singulai-backend"
check_service "singulai-postgres"
check_service "singulai-n8n"

# Verificar logs
echo "📋 Últimos logs do backend..."
ssh -i $SSH_KEY $SSH_USER@$VPS_IP "docker logs --tail 50 singulai-backend"

# Verificar portas
echo "🌐 Verificando portas..."
ssh -i $SSH_KEY $SSH_USER@$VPS_IP "netstat -tlpn | grep -E ':(80|443|3000|5432|5678)'"