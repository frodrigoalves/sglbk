#!/bin/bash

# Otimização de Segurança HTTPS SingulAI
# Versão 1.0.0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funções de Utilidade
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar dependências
check_dependencies() {
    echo "Verificando dependências..."
    
    local deps=(curl openssl nginx certbot)
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Dependências faltando: ${missing[*]}"
        echo "Instale com: sudo apt install ${missing[*]}"
        exit 1
    fi
    
    log_success "Todas dependências encontradas"
}

# Verificar certificado SSL atual
check_ssl() {
    echo "Verificando certificado SSL..."
    
    if [ -f "/etc/letsencrypt/live/singulai.live/fullchain.pem" ]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/singulai.live/fullchain.pem" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local current_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))
        
        if [ $days_left -lt 30 ]; then
            log_warning "Certificado expira em $days_left dias"
            renew_certificate
        else
            log_success "Certificado válido por mais $days_left dias"
        fi
    else
        log_error "Certificado não encontrado"
        create_certificate
    fi
}

# Criar novo certificado
create_certificate() {
    echo "Criando novo certificado..."
    
    # Parar nginx temporariamente
    systemctl stop nginx
    
    # Solicitar certificado
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email admin@singulai.live \
        --domains singulai.live,www.singulai.live
    
    if [ $? -eq 0 ]; then
        log_success "Certificado criado com sucesso"
    else
        log_error "Falha ao criar certificado"
        exit 1
    fi
    
    # Reiniciar nginx
    systemctl start nginx
}

# Renovar certificado existente
renew_certificate() {
    echo "Renovando certificado..."
    
    certbot renew --quiet
    
    if [ $? -eq 0 ]; then
        log_success "Certificado renovado com sucesso"
        systemctl reload nginx
    else
        log_error "Falha ao renovar certificado"
        exit 1
    fi
}

# Otimizar configuração NGINX
optimize_nginx() {
    echo "Otimizando NGINX..."
    
    # Backup da configuração atual
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    
    # Aplicar configurações otimizadas
    cat > /etc/nginx/conf.d/security-headers.conf << EOF
# Headers de Segurança Globais
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss: ws: data: blob:; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:;" always;
add_header Strict-Transport-Security "max-age=63072000" always;
EOF
    
    # Testar configuração
    nginx -t
    
    if [ $? -eq 0 ]; then
        log_success "Configuração NGINX atualizada"
        systemctl reload nginx
    else
        log_error "Erro na configuração NGINX"
        mv /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
        exit 1
    fi
}

# Verificar configuração Web3
check_web3() {
    echo "Verificando configuração Web3..."
    
    # Testar conectividade com Sepolia
    local sepolia_status=$(curl -s -o /dev/null -w "%{http_code}" https://rpc.sepolia.org)
    
    if [ "$sepolia_status" = "200" ]; then
        log_success "Conectividade Sepolia OK"
    else
        log_warning "Problema com conexão Sepolia"
    fi
    
    # Verificar portas WSS
    if netstat -tuln | grep ":443.*LISTEN" > /dev/null; then
        log_success "Porta WSS (443) aberta"
    else
        log_warning "Porta WSS (443) fechada"
    fi
}

# Função principal
main() {
    echo "=== SingulAI HTTPS Security Optimizer ==="
    echo "Iniciando otimização..."
    
    # Verificar se é root
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script precisa ser executado como root"
        exit 1
    fi
    
    # Executar verificações
    check_dependencies
    check_ssl
    optimize_nginx
    check_web3
    
    echo "=== Otimização Concluída ==="
    
    # Status final
    echo -e "\nStatus do Sistema:"
    curl -s -I https://singulai.live | head -n 1
    openssl s_client -connect singulai.live:443 -servername singulai.live 2>/dev/null | openssl x509 -noout -dates
}

# Executar script
main "$@"