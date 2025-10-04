#!/bin/bash

# Script simples de deploy para SingulAI
echo "🚀 Fazendo deploy do SingulAI na VPS..."

# Arquivos para enviar
FILES=(
    "index.html"
    "mvp.html"
    "dao.html"
    "docs.html"
    "login.html"
    "register.html"
    "confirm-email.html"
    "dashboard.html"
    "singulai-mvp.js"
    "singulai-advanced.js"
    "singulai-professional-app.js"
    "app.js"
    "singulai-mvp.css"
    "login.css"
    "index.css"
    "ux-improvements.css"
    "ux-improvements.js"
)

# Diretórios
LOCAL_DIR="/c/Users/Lenga/Desktop/vps/singulai-mvp-backend-starter/contracts/frontend"
REMOTE_DIR="/var/www/html"
VPS_HOST="72.60.147.56"
VPS_USER="root"

echo "📤 Enviando arquivos..."

for file in "${FILES[@]}"; do
    if [ -f "$LOCAL_DIR/$file" ]; then
        echo "Enviando $file..."
        scp "$LOCAL_DIR/$file" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"
        if [ $? -eq 0 ]; then
            echo "✓ $file enviado"
        else
            echo "✗ Erro ao enviar $file"
        fi
    else
        echo "✗ $file não encontrado"
    fi
done

echo "⚙️ Configurando nginx..."

# Configuração nginx
NGINX_CONFIG="server {
    listen 80;
    server_name singulai.live www.singulai.live;

    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}"

# Enviar configuração
echo "$NGINX_CONFIG" | ssh "$VPS_USER@$VPS_HOST" "cat > /etc/nginx/sites-available/singulai.live"

# Configurar nginx na VPS
ssh "$VPS_USER@$VPS_HOST" << 'EOF'
#!/bin/bash

echo "Configurando nginx na VPS..."

# Criar link simbólico
if [ ! -L /etc/nginx/sites-enabled/singulai.live ]; then
    ln -s /etc/nginx/sites-available/singulai.live /etc/nginx/sites-enabled/
fi

# Remover default
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Testar configuração
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx configurado!"
else
    echo "❌ Erro no nginx"
    exit 1
fi

# Permissões
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

echo "✅ Deploy concluído!"
echo "🌐 Teste: http://singulai.live"
EOF

echo "🎉 Deploy finalizado!"