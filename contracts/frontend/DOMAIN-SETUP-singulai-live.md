# 🌐 Configuração do Domínio singulai.live

**Data:** 2 de Outubro de 2025  
**Domínio:** singulai.live  
**VPS IP:** 72.60.147.56

---

## 📋 **Passo 1: Configuração DNS**

### **A. No seu provedor de domínio (Registrar):**

Acesse o painel de controle do seu domínio `singulai.live` e configure os seguintes registros DNS:

```dns
# Registros A (IPv4)
@           A       72.60.147.56    (domínio principal)
www         A       72.60.147.56    (subdomínio www)
api         A       72.60.147.56    (subdomínio api)

# Opcional: Registro AAAA (IPv6) se disponível
@           AAAA    2a02:4780:66:b26e::1
www         AAAA    2a02:4780:66:b26e::1
api         AAAA    2a02:4780:66:b26e::1
```

### **B. Verificação DNS:**
Após configurar, aguarde a propagação (pode levar até 48h, mas geralmente 15-30 minutos):

```bash
# Testar propagação DNS
nslookup singulai.live
nslookup www.singulai.live
nslookup api.singulai.live
```

---

## 🔧 **Passo 2: Configuração do Servidor (VPS)**

### **A. Configurar Nginx para o domínio:**

Execute na VPS:

```bash
ssh root@72.60.147.56
```

Crie o arquivo de configuração do Nginx:

```bash
cat > /etc/nginx/sites-available/singulai.live << 'EOF'
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    
    # Diretório dos arquivos estáticos
    root /var/www/html;
    index dao-instructions.html index.html;
    
    # Logs
    access_log /var/log/nginx/singulai_access.log;
    error_log /var/log/nginx/singulai_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; connect-src 'self' https: wss: ws:;" always;
    
    # Página principal
    location / {
        try_files $uri $uri/ /dao-instructions.html;
    }
    
    # Proxy para API backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
    
    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # Arquivos HTML específicos da DAO
    location ~ \.(html)$ {
        add_header Cache-Control "no-cache, must-revalidate";
        try_files $uri =404;
    }
}

# Subdomínio para API (opcional)
server {
    listen 80;
    server_name api.singulai.live;
    
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### **B. Ativar a configuração:**

```bash
# Criar link simbólico
ln -sf /etc/nginx/sites-available/singulai.live /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

---

## 🔐 **Passo 3: Configurar SSL/HTTPS (Recomendado)**

### **A. Instalar Certbot:**

```bash
# Instalar Certbot
apt update
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d singulai.live -d www.singulai.live -d api.singulai.live

# Configurar renovação automática
crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### **B. Verificar SSL:**
Após configurar SSL, o Nginx será automaticamente atualizado para:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name singulai.live www.singulai.live;
    
    ssl_certificate /etc/letsencrypt/live/singulai.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/singulai.live/privkey.pem;
    # ... resto da configuração
}
```

---

## 🧪 **Passo 4: Testes e Verificação**

### **A. Testes de conectividade:**

```bash
# Testar HTTP
curl -I http://singulai.live
curl -I http://www.singulai.live
curl -I http://api.singulai.live/api/health

# Testar HTTPS (após SSL configurado)
curl -I https://singulai.live
curl -I https://www.singulai.live
curl -I https://api.singulai.live/api/health
```

### **B. URLs finais:**

- **🏠 Principal:** https://singulai.live
- **📖 DAO Instructions:** https://singulai.live/dao-instructions.html
- **📊 DAO Dashboard:** https://singulai.live/dao-dashboard.html
- **🔧 API Health:** https://api.singulai.live/api/health
- **🌐 Com www:** https://www.singulai.live

---

## 📋 **Script Automatizado de Configuração**

Para facilitar, aqui está um script que automatiza todo o processo:

```bash
#!/bin/bash
# configure-domain.sh

echo "🌐 Configurando domínio singulai.live..."

# Backup da configuração atual
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Criar nova configuração
cat > /etc/nginx/sites-available/singulai.live << 'EOF'
server {
    listen 80;
    server_name singulai.live www.singulai.live;
    root /var/www/html;
    index dao-instructions.html index.html;
    
    location / {
        try_files $uri $uri/ /dao-instructions.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.singulai.live;
    
    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar configuração
ln -sf /etc/nginx/sites-available/singulai.live /etc/nginx/sites-enabled/

# Remover configuração padrão se existir
rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar
nginx -t && systemctl reload nginx

echo "✅ Configuração do Nginx concluída!"
echo "🔐 Para SSL, execute: certbot --nginx -d singulai.live -d www.singulai.live -d api.singulai.live"
```

---

## ⚡ **Comandos Rápidos**

### **Verificar status:**
```bash
# Status dos serviços
systemctl status nginx
pm2 status

# Testar URLs
curl -I singulai.live
curl -I singulai.live/api/health
```

### **Logs em tempo real:**
```bash
# Logs Nginx
tail -f /var/log/nginx/singulai_access.log
tail -f /var/log/nginx/singulai_error.log

# Logs Backend
pm2 logs singulai-backend
```

---

## 🎯 **Próximos Passos:**

1. **Configure o DNS** no seu provedor de domínio
2. **Execute os comandos** na VPS
3. **Teste as URLs** após propagação DNS
4. **Configure SSL** com Certbot
5. **Monitore os logs** para verificar funcionamento

---

**🎉 Após completar estes passos, o SingulDAO estará acessível em:**
- **https://singulai.live**
- **https://www.singulai.live** 
- **https://api.singulai.live**