#!/bin/bash
set -e

echo "🚀 Iniciando setup do SingulAI..."

# Criar estrutura de diretórios e arquivos
mkdir -p /root/singulai
cd /root/singulai

# Criar docker-compose.yml
echo "📝 Criando docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:15
    container_name: singulai-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: singulai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: singulai-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/singulai
      JWT_SECRET: ${JWT_SECRET}
      AVATAR_BASE_ADDRESS: ${AVATAR_BASE_ADDRESS}
      AVATAR_WALLET_LINK_ADDRESS: ${AVATAR_WALLET_LINK_ADDRESS}
      TIME_CAPSULE_ADDRESS: ${TIME_CAPSULE_ADDRESS}
      DIGITAL_LEGACY_ADDRESS: ${DIGITAL_LEGACY_ADDRESS}
      CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  n8n:
    image: n8nio/n8n
    container_name: singulai-n8n
    environment:
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=${N8N_PROTOCOL:-http}
      - NODE_ENV=production
      - WEBHOOK_URL=${N8N_WEBHOOK_URL:-http://localhost:5678/}
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n

  nginx:
    image: nginx:alpine
    container_name: singulai-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - n8n

volumes:
  postgres_data:
  n8n_data:
EOF

# Criar nginx.conf
echo "📝 Criando nginx.conf..."
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name singulai.netlify.app www.singulai.netlify.app;

    location / {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name n8n.singulai.netlify.app;

    location / {
        proxy_pass http://n8n:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Setup do backend
echo "🔧 Configurando backend..."
mkdir -p backend
cat > backend/Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Configurar variáveis de ambiente
echo "🔐 Gerando variáveis de ambiente..."
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << EOF
# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Contract Addresses
AVATAR_BASE_ADDRESS=0x95F531cafca627A447C0F1119B8b6aCC730163E5
AVATAR_WALLET_LINK_ADDRESS=0x9F475e5D174577f2FB17a9D94a8093e2D8c9ED41
TIME_CAPSULE_ADDRESS=0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172
DIGITAL_LEGACY_ADDRESS=0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757
CONTRACT_ADDRESS=0x91ac15bCB70Aa9004FbFBE52e8420fa6b7d960Cb

# N8N Configuration
N8N_HOST=n8n.singulai.netlify.app
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://n8n.singulai.netlify.app/
EOF

# Instalar Docker se necessário
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Instalar Docker Compose se necessário
if ! command -v docker-compose &> /dev/null; then
    echo "Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Criar diretórios SSL
mkdir -p certbot/conf certbot/www

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d

echo "⏳ Aguardando serviços iniciarem..."
sleep 10

echo "📊 Status dos serviços:"
docker-compose ps

echo "✅ Setup completo!"
echo "Backend: http://singulai.netlify.app"
echo "N8N: http://n8n.singulai.netlify.app"