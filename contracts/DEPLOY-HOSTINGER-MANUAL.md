# 🚀 DEPLOY MANUAL SINGULAI - HOSTINGER TERMINAL

## 📋 ARQUIVOS PRONTOS PARA UPLOAD
Todos os arquivos foram atualizados com as URLs corretas da VPS (72.60.147.56:3000).

## 🛠️ INSTRUÇÕES PARA DEPLOY VIA TERMINAL HOSTINGER

### 1. Acesse o Terminal da Hostinger
- Entre no painel da Hostinger
- Vá para "Files" > "File Manager"
- Clique em "Terminal" ou "SSH Access"

### 2. Conecte via SSH (se disponível)
```bash
ssh seu_usuario@seu_dominio.com
# ou use o terminal web da Hostinger
```

### 3. Navegue para o diretório público
```bash
cd public_html
# ou
cd /home/seu_usuario/public_html
```

### 4. Baixe os arquivos do GitHub
```bash
# Criar diretório temporário
mkdir temp_deploy
cd temp_deploy

# Baixar arquivos essenciais
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/index.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/mvp.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/dao.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/docs.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/login.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/register.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/confirm-email.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/dashboard.html
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/singulai-mvp.js
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/singulai-advanced.js
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/singulai-professional-app.js
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/app.js
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/singulai-mvp.css
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/login.css
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/index.css
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/ux-improvements.css
wget https://raw.githubusercontent.com/frodrigoalves/sglbk/main/contracts/frontend/ux-improvements.js
```

### 5. Mover arquivos para o diretório raiz
```bash
# Voltar para public_html
cd ..

# Mover arquivos
mv temp_deploy/* ./

# Remover diretório temporário
rmdir temp_deploy
```

### 6. Configurar permissões
```bash
chmod 644 *.html *.js *.css
chmod 755 .
```

### 7. Criar arquivo .htaccess (se necessário)
```bash
# Criar .htaccess para SPA routing
cat > .htaccess << 'EOF'
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF
```

### 8. Verificar arquivos
```bash
ls -la *.html *.js *.css
```

## 🧪 TESTE O DEPLOY

### URLs para testar:
- **Página Inicial**: https://singulai.live
- **MVP Dashboard**: https://singulai.live/mvp.html
- **DAO**: https://singulai.live/dao.html
- **Documentação**: https://singulai.live/docs.html
- **Login**: https://singulai.live/login.html

### Verificar se o backend está respondendo:
```bash
curl -I http://72.60.147.56:3000/api/health
```

## ✅ VERIFICAÇÃO FINAL

Após o deploy, teste:
1. ✅ Página inicial carrega
2. ✅ Navegação funciona
3. ✅ MetaMask conecta
4. ✅ Backend responde (se aplicável)

## 🔧 SUPORTE

Se houver problemas:
1. Verifique se todos os arquivos foram enviados
2. Confirme as permissões dos arquivos
3. Teste o .htaccess (se aplicável)
4. Verifique logs de erro no painel da Hostinger

---
**Status**: Arquivos prontos no GitHub
**Última atualização**: $(date)
**Backend**: 72.60.147.56:3000 ✅