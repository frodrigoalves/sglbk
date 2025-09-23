#!/bin/bash

# SingulAI MVP - Script de Deploy Automático
# Versão: 2.0
# Data: 22/09/2025

set -e  # Parar em qualquer erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║              🤖 SingulAI MVP                 ║"
echo "║           Deploy Automático v2.0            ║"
echo "║        O futuro registrado, codificado       ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Configurações
PROJECT_DIR="$(pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
CONTRACTS_DIR="$PROJECT_DIR"
DEPLOY_DIR="$PROJECT_DIR/deploy"
BACKUP_DIR="$PROJECT_DIR/backups"

# Verificar dependências
log_info "Verificando dependências..."

if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Por favor, instale Node.js."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado. Por favor, instale npm."
    exit 1
fi

if ! command -v git &> /dev/null; then
    log_warning "Git não encontrado. Algumas funcionalidades podem não funcionar."
fi

log_success "Dependências verificadas"

# Função para verificar rede
check_network() {
    log_info "Verificando conectividade..."
    if ping -c 1 google.com &> /dev/null; then
        log_success "Conectividade OK"
    else
        log_error "Sem conectividade com a internet"
        exit 1
    fi
}

# Função para backup
create_backup() {
    log_info "Criando backup..."
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "$FRONTEND_DIR" ]; then
        cp -r "$FRONTEND_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        log_success "Backup criado: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Função para setup do ambiente
setup_environment() {
    log_info "Configurando ambiente..."
    
    # Verificar/instalar dependências do projeto
    if [ -f "package.json" ]; then
        log_info "Instalando dependências do projeto..."
        npm install
        log_success "Dependências instaladas"
    fi
    
    # Verificar arquivo .env
    if [ ! -f ".env" ]; then
        log_warning "Arquivo .env não encontrado"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Arquivo .env criado a partir do .env.example"
            log_warning "Por favor, configure as variáveis de ambiente no arquivo .env"
        fi
    else
        log_success "Arquivo .env encontrado"
    fi
}

# Função para compilar contratos
compile_contracts() {
    log_info "Compilando contratos..."
    
    if command -v npx &> /dev/null; then
        npx hardhat compile
        log_success "Contratos compilados"
    else
        log_error "npx não encontrado. Não foi possível compilar contratos."
        return 1
    fi
}

# Função para deploy dos contratos (opcional)
deploy_contracts() {
    read -p "Deseja fazer deploy dos contratos? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Fazendo deploy dos contratos..."
        
        # Verificar rede
        read -p "Rede de deploy (localhost/sepolia): " NETWORK
        NETWORK=${NETWORK:-sepolia}
        
        if [ "$NETWORK" = "localhost" ]; then
            log_info "Iniciando rede local..."
            npx hardhat node &
            HARDHAT_PID=$!
            sleep 5
        fi
        
        npx hardhat run scripts/deploy.js --network $NETWORK
        
        if [ "$NETWORK" = "localhost" ] && [ ! -z "$HARDHAT_PID" ]; then
            kill $HARDHAT_PID
        fi
        
        log_success "Deploy dos contratos concluído"
    fi
}

# Função para setup do frontend
setup_frontend() {
    log_info "Configurando frontend..."
    
    # Criar diretório se não existir
    mkdir -p "$FRONTEND_DIR"
    
    # Verificar se os arquivos principais existem
    REQUIRED_FILES=(
        "$FRONTEND_DIR/singulai-complete.html"
        "$FRONTEND_DIR/singulai-advanced.js"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Arquivo necessário não encontrado: $file"
            return 1
        fi
    done
    
    log_success "Frontend configurado"
}

# Função para iniciar servidor
start_server() {
    log_info "Iniciando servidor local..."
    
    PORT=${1:-8000}
    
    cd "$FRONTEND_DIR"
    
    # Verificar se a porta está disponível
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
        log_warning "Porta $PORT já está em uso"
        read -p "Usar porta diferente? (8001): " NEW_PORT
        PORT=${NEW_PORT:-8001}
    fi
    
    # Iniciar servidor Python ou Node.js
    if command -v python3 &> /dev/null; then
        log_info "Iniciando servidor Python na porta $PORT..."
        python3 -m http.server $PORT &
        SERVER_PID=$!
    elif command -v python &> /dev/null; then
        log_info "Iniciando servidor Python na porta $PORT..."
        python -m http.server $PORT &
        SERVER_PID=$!
    elif command -v npx &> /dev/null; then
        log_info "Iniciando servidor Node.js na porta $PORT..."
        npx serve -p $PORT &
        SERVER_PID=$!
    else
        log_error "Nenhum servidor disponível (Python ou Node.js)"
        return 1
    fi
    
    sleep 2
    
    if ps -p $SERVER_PID > /dev/null; then
        log_success "Servidor iniciado na porta $PORT (PID: $SERVER_PID)"
        log_success "Acesse: http://localhost:$PORT/singulai-complete.html"
        
        # Salvar PID para cleanup posterior
        echo $SERVER_PID > "$PROJECT_DIR/.server_pid"
        
        # Abrir no navegador (opcional)
        read -p "Abrir no navegador? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:$PORT/singulai-complete.html"
            elif command -v open &> /dev/null; then
                open "http://localhost:$PORT/singulai-complete.html"
            elif command -v start &> /dev/null; then
                start "http://localhost:$PORT/singulai-complete.html"
            else
                log_info "Abra manualmente: http://localhost:$PORT/singulai-complete.html"
            fi
        fi
    else
        log_error "Falha ao iniciar servidor"
        return 1
    fi
}

# Função para parar servidor
stop_server() {
    if [ -f "$PROJECT_DIR/.server_pid" ]; then
        SERVER_PID=$(cat "$PROJECT_DIR/.server_pid")
        if ps -p $SERVER_PID > /dev/null; then
            kill $SERVER_PID
            log_success "Servidor parado (PID: $SERVER_PID)"
        fi
        rm -f "$PROJECT_DIR/.server_pid"
    else
        log_info "Nenhum servidor ativo encontrado"
    fi
}

# Função para verificar status
check_status() {
    log_info "Verificando status do sistema..."
    
    # Verificar se o servidor está rodando
    if [ -f "$PROJECT_DIR/.server_pid" ]; then
        SERVER_PID=$(cat "$PROJECT_DIR/.server_pid")
        if ps -p $SERVER_PID > /dev/null; then
            log_success "Servidor ativo (PID: $SERVER_PID)"
        else
            log_warning "Servidor não está rodando"
            rm -f "$PROJECT_DIR/.server_pid"
        fi
    else
        log_info "Servidor não iniciado"
    fi
    
    # Verificar arquivos
    if [ -f "$FRONTEND_DIR/singulai-complete.html" ]; then
        log_success "Frontend disponível"
    else
        log_error "Frontend não encontrado"
    fi
    
    # Verificar contratos compilados
    if [ -d "artifacts" ]; then
        log_success "Contratos compilados"
    else
        log_warning "Contratos não compilados"
    fi
}

# Função para limpeza
cleanup() {
    log_info "Limpando arquivos temporários..."
    
    # Parar servidor se estiver rodando
    stop_server
    
    # Limpar cache do Hardhat
    if [ -d "cache" ]; then
        rm -rf cache
        log_success "Cache do Hardhat limpo"
    fi
    
    # Limpar node_modules (opcional)
    read -p "Limpar node_modules? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf node_modules
        log_success "node_modules removido"
    fi
}

# Função principal
main() {
    case "${1:-help}" in
        "install"|"setup")
            check_network
            setup_environment
            compile_contracts
            setup_frontend
            log_success "Instalação concluída!"
            ;;
        "deploy")
            compile_contracts
            deploy_contracts
            ;;
        "start"|"serve")
            setup_frontend
            start_server ${2:-8000}
            ;;
        "stop")
            stop_server
            ;;
        "status")
            check_status
            ;;
        "backup")
            create_backup
            ;;
        "clean")
            cleanup
            ;;
        "full")
            log_info "Deploy completo iniciado..."
            check_network
            create_backup
            setup_environment
            compile_contracts
            deploy_contracts
            setup_frontend
            start_server ${2:-8000}
            log_success "Deploy completo finalizado!"
            ;;
        "help"|*)
            echo "SingulAI MVP - Script de Deploy"
            echo "Uso: $0 [comando] [opções]"
            echo ""
            echo "Comandos disponíveis:"
            echo "  install, setup    - Instalar e configurar ambiente"
            echo "  deploy           - Deploy dos contratos"
            echo "  start, serve     - Iniciar servidor frontend [porta]"
            echo "  stop             - Parar servidor"
            echo "  status           - Verificar status do sistema"
            echo "  backup           - Criar backup dos arquivos"
            echo "  clean            - Limpar arquivos temporários"
            echo "  full             - Deploy completo (all-in-one)"
            echo "  help             - Mostrar esta ajuda"
            echo ""
            echo "Exemplos:"
            echo "  $0 full                    # Deploy completo"
            echo "  $0 start 3000             # Iniciar na porta 3000"
            echo "  $0 deploy                 # Apenas deploy contratos"
            ;;
    esac
}

# Trap para limpeza em caso de interrupção
trap 'log_warning "Script interrompido"; stop_server; exit 1' INT TERM

# Executar função principal
main "$@"