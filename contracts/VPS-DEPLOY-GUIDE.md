# 🚀 Guia de Deploy - SingulAI na VPS Hostinguer

## 📋 Pré-requisitos

- VPS Ubuntu/Debian na Hostinguer
- Acesso SSH root ou sudo
- Domínio configurado (opcional, mas recomendado)

## ⚡ Deploy Rápido (Automático)

### 1. Conectar na VPS via SSH
```bash
ssh root@SEU_IP_VPS
# ou
ssh usuario@SEU_IP_VPS
```

### 2. Baixar e executar o script de setup
```bash
# Baixar o script
wget https://raw.githubusercontent.com/frodrigoalves/contracts/main/setup-vps-complete.sh

# Dar permissão de execução
chmod +x setup-vps-complete.sh

# Executar o setup (leva alguns minutos)
./setup-vps-complete.sh
```

### 3. Configurar domínio (opcional)
Se você tem um domínio, configure no DNS para apontar para o IP da VPS.

### 4. Configurar SSL (recomendado)
```bash
# Instalar certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado SSL
certbot --nginx -d seu-dominio.com
```

## 🔧 Configurações Manuais (se necessário)

### Configurar Email SMTP
Edite o arquivo `/opt/singulai/.env`:
```bash
nano /opt/singulai/.env
```

Configure as variáveis de email:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-gmail
FROM_EMAIL=noreply@singulai.live
```

### Verificar Status dos Serviços
```bash
# Status da aplicação
pm2 status

# Status do Nginx
systemctl status nginx

# Status do PostgreSQL
systemctl status postgresql

# Logs da aplicação
pm2 logs singulai-backend

# Logs do Nginx
tail -f /var/log/nginx/singulai_access.log
tail -f /var/log/nginx/singulai_error.log
```

## 🌐 Acessar a Aplicação

Após o deploy:
- **Frontend**: `http://SEU_IP_VPS` ou `https://seu-dominio.com`
- **API**: `http://SEU_IP_VPS/api/health`
- **Admin**: `http://SEU_IP_VPS/admin` (se configurado)

## 🔧 Comandos de Manutenção

### Reiniciar serviços
```bash
# Aplicação
pm2 restart singulai-backend

# Nginx
systemctl restart nginx

# PostgreSQL
systemctl restart postgresql
```

### Backup do banco
```bash
# Criar backup
pg_dump -U singulai_user -h localhost singulai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -U singulai_user -h localhost singulai < backup.sql
```

### Atualizar aplicação
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
pm2 logs singulai-backend

# Verificar se porta 3000 está livre
netstat -tlnp | grep :3000

# Reiniciar aplicação
pm2 restart singulai-backend
```

### Nginx não funciona
```bash
# Testar configuração
nginx -t

# Verificar status
systemctl status nginx

# Reiniciar
systemctl restart nginx
```

### Banco de dados offline
```bash
# Verificar status
systemctl status postgresql

# Verificar logs
tail -f /var/log/postgresql/postgresql-*.log

# Reiniciar
systemctl restart postgresql
```

### Firewall bloqueando
```bash
# Verificar regras
ufw status

# Permitir portas necessárias
ufw allow 80
ufw allow 443
ufw allow 22
```

## 📊 Monitoramento

### Script de monitoramento automático
```bash
# Executar manualmente
/opt/singulai/monitor.sh

# Ver logs de monitoramento
tail -f /opt/singulai/monitor.log
```

### Métricas do sistema
```bash
# Uso de CPU/Memória
htop

# Espaço em disco
df -h

# Conexões de rede
netstat -tlnp
```

## 🔒 Segurança

### Configurações básicas já aplicadas:
- ✅ Firewall UFW configurado
- ✅ Nginx com headers de segurança
- ✅ PostgreSQL com usuário dedicado
- ✅ PM2 gerenciando processos

### Configurações adicionais recomendadas:
```bash
# Desabilitar login root via SSH
nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PermitRootLogin no

# Instalar fail2ban
apt install fail2ban

# Configurar backups automáticos
# (implementar conforme necessidade)
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs dos serviços
2. Execute o script de monitoramento
3. Verifique conectividade de rede
4. Reinicie serviços individualmente

**Logs importantes:**
- `/var/log/nginx/singulai_*.log`
- `/opt/singulai/backend/logs/`
- `/opt/singulai/monitor.log`

---

**🎉 Deploy concluído! Sua aplicação SingulAI está rodando na VPS!**