# 🚀 Guia Rápido de Deploy - SingulAI VPS

## 📋 Pré-requisitos
- VPS Ubuntu/Debian na Hostinguer
- Acesso SSH como root
- Arquivos do projeto SingulAI

## ⚡ Deploy Automático (Recomendado)

### 1. Conectar na VPS
```bash
ssh root@SEU_IP_VPS
```

### 2. Baixar e executar o script
```bash
wget https://raw.githubusercontent.com/SEU_REPO/singulai-mvp-backend-starter/main/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### 3. Copiar arquivos do projeto
Durante a execução, o script irá pausar para você copiar os arquivos:
- Backend: `/opt/singulai/backend/`
- Frontend: `/opt/singulai/frontend/`

Use SCP ou SFTP para transferir os arquivos.

## 🔧 Configuração Pós-Deploy

### 1. Configurar Email
Edite o arquivo `/opt/singulai/.env`:
```bash
nano /opt/singulai/.env
```

Configure as credenciais SMTP:
```
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-gmail
```

### 2. Configurar Domínio
```bash
# Instalar SSL
certbot --nginx -d seu-dominio.com

# Verificar renovação automática
certbot renew --dry-run
```

### 3. Configurar Ethereum
No arquivo `.env`, configure:
```
RPC_URL=https://sepolia.infura.io/v3/SEU_PROJECT_ID_INFURA
PRIVATE_KEY=sua_private_key_wallet
ETHERSCAN_API_KEY=sua_api_key_etherscan
```

## 📊 Verificar Deploy

### Status dos Serviços
```bash
# Verificar todos os serviços
/opt/singulai/monitor.sh

# Status PM2
pm2 status

# Status Nginx
systemctl status nginx

# Status PostgreSQL
systemctl status postgresql
```

### Logs
```bash
# Logs da aplicação
pm2 logs singulai-backend

# Logs do Nginx
tail -f /var/log/nginx/singulai_access.log
tail -f /var/log/nginx/singulai_error.log
```

## 🌐 Acesso à Aplicação

- **Frontend**: `http://SEU_IP_VPS` ou `https://seu-dominio.com`
- **API Health**: `http://SEU_IP_VPS/api/health`
- **API Docs**: `http://SEU_IP_VPS/api/docs` (se configurado)

## 🔧 Comandos de Manutenção

### Reiniciar Serviços
```bash
# Aplicação
pm2 restart singulai-backend

# Nginx
systemctl restart nginx

# PostgreSQL
systemctl restart postgresql
```

### Backup do Banco
```bash
# Criar backup
pg_dump -U singulai_user -h localhost singulai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -U singulai_user -h localhost singulai < backup.sql
```

### Atualizar Aplicação
```bash
cd /opt/singulai/backend
git pull origin main
npm install --production
pm2 restart singulai-backend
```

## 🚨 Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs singulai-backend --lines 100

# Verificar variáveis de ambiente
cat /opt/singulai/.env

# Testar conexão com banco
psql -U singulai_user -h localhost singulai -c "SELECT 1;"
```

### Nginx erro 502
```bash
# Verificar se backend está rodando
curl http://localhost:3000/api/health

# Verificar configuração Nginx
nginx -t
systemctl restart nginx
```

### Problemas de Permissões
```bash
# Ajustar permissões
chown -R www-data:www-data /opt/singulai/frontend
chmod -R 755 /opt/singulai/frontend
```

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs primeiro
2. Teste conectividade: `curl -I http://localhost:3000`
3. Verifique status dos serviços: `systemctl status nginx postgresql`

---

**🎉 Deploy concluído!** Sua aplicação SingulAI está pronta para produção.