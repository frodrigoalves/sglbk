#!/bin/bash
# 🔍 Script de Verificação - SingulAI VPS
# Execute este script para verificar se o deploy foi bem-sucedido

echo "🔍 Verificando status do SingulAI..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local service=$1
    local status=$(systemctl is-active $service 2>/dev/null)
    if [ "$status" = "active" ]; then
        echo -e "${GREEN}✅${NC} $service: ATIVO"
        return 0
    else
        echo -e "${RED}❌${NC} $service: INATIVO"
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✅${NC} Porta $port ($service): ABERTA"
        return 0
    else
        echo -e "${RED}❌${NC} Porta $port ($service): FECHADA"
        return 1
    fi
}

check_http() {
    local url=$1
    local name=$2
    if curl -s --max-time 5 $url > /dev/null; then
        echo -e "${GREEN}✅${NC} $name: ACESSÍVEL"
        return 0
    else
        echo -e "${RED}❌${NC} $name: INACESSÍVEL"
        return 1
    fi
}

echo ""
echo "=== VERIFICAÇÃO DE SERVIÇOS ==="
check_service nginx
check_service postgresql

echo ""
echo "=== VERIFICAÇÃO DE PORTAS ==="
check_port 80 "Nginx HTTP"
check_port 5432 "PostgreSQL"
check_port 3000 "SingulAI Backend"

echo ""
echo "=== VERIFICAÇÃO DE CONECTIVIDADE ==="
check_http "http://localhost:3000/api/health" "API Health"
check_http "http://localhost" "Frontend"

echo ""
echo "=== VERIFICAÇÃO PM2 ==="
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 list --json 2>/dev/null | jq -r '.[] | select(.name=="singulai-backend") | .pm2_env.status' 2>/dev/null)
    if [ "$pm2_status" = "online" ]; then
        echo -e "${GREEN}✅${NC} PM2 singulai-backend: ONLINE"
    else
        echo -e "${RED}❌${NC} PM2 singulai-backend: OFFLINE"
    fi
else
    echo -e "${RED}❌${NC} PM2: NÃO INSTALADO"
fi

echo ""
echo "=== VERIFICAÇÃO DO BANCO DE DADOS ==="
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw singulai; then
    echo -e "${GREEN}✅${NC} Database 'singulai': EXISTE"
else
    echo -e "${RED}❌${NC} Database 'singulai': NÃO ENCONTRADO"
fi

echo ""
echo "=== VERIFICAÇÃO DE ARQUIVOS ==="
if [ -f "/opt/singulai/.env" ]; then
    echo -e "${GREEN}✅${NC} Arquivo .env: PRESENTE"
else
    echo -e "${RED}❌${NC} Arquivo .env: AUSENTE"
fi

if [ -d "/opt/singulai/backend" ]; then
    echo -e "${GREEN}✅${NC} Diretório backend: PRESENTE"
else
    echo -e "${RED}❌${NC} Diretório backend: AUSENTE"
fi

if [ -d "/opt/singulai/frontend" ]; then
    echo -e "${GREEN}✅${NC} Diretório frontend: PRESENTE"
else
    echo -e "${RED}❌${NC} Diretório frontend: AUSENTE"
fi

echo ""
echo "=== INFORMAÇÕES DO SISTEMA ==="
echo "Uptime: $(uptime -p)"
echo "Memória: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disco: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"

echo ""
echo "🔗 URLs de acesso:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   API: http://$(curl -s ifconfig.me)/api/health"

echo ""
echo "📋 Para mais detalhes, execute:"
echo "   pm2 logs singulai-backend"
echo "   tail -f /var/log/nginx/singulai_access.log"