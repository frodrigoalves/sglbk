# 🚀 SingulAI MVP - Configuração Rápida para Windows

## ⚡ Início Rápido (3 minutos)

### 1. Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (versão 18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/download/win)

### 2. Configuração Automática

#### Opção A: PowerShell (Recomendado)
```powershell
# Abrir PowerShell como Administrador
# Executar uma única vez:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navegar para o projeto
cd "C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts"

# Deploy completo automatizado
.\deploy.ps1 full
```

#### Opção B: Prompt de Comando (Alternativa)
```cmd
# Abrir Prompt de Comando
cd "C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts"

# Deploy completo automatizado
deploy.bat full
```

### 3. Acesso
- **URL:** http://localhost:8000/singulai-complete.html
- **MetaMask:** Conecte sua carteira quando solicitado
- **Rede:** Sepolia Testnet (ou localhost para testes)

## 🔧 Configuração Manual (5 minutos)

### 1. Instalar Dependências
```powershell
# PowerShell
.\deploy.ps1 install

# OU Prompt de Comando
deploy.bat install
```

### 2. Configurar Variáveis de Ambiente
```powershell
# Copiar arquivo de exemplo
copy .env.example .env

# Editar no Notepad
notepad .env
```

Configurar no arquivo `.env`:
```env
# Obter em https://infura.io/
INFURA_PROJECT_ID=seu_project_id_aqui

# Private Key da MetaMask (sem 0x)
SEPOLIA_PRIVATE_KEY=sua_private_key_aqui

# Obter em https://etherscan.io/apis
ETHERSCAN_API_KEY=sua_api_key_aqui
```

### 3. Deploy dos Contratos
```powershell
# PowerShell
.\deploy.ps1 deploy

# OU Prompt de Comando
deploy.bat deploy
```

### 4. Iniciar Frontend
```powershell
# PowerShell
.\deploy.ps1 start

# OU Prompt de Comando
deploy.bat start
```

## 🌐 Acesso Rápido

### URLs Importantes
- **Aplicação:** http://localhost:8000/singulai-complete.html
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Sepolia Explorer:** https://sepolia.etherscan.io/

### MetaMask Setup
1. Instalar extensão MetaMask
2. Adicionar rede Sepolia Testnet
3. Obter ETH de teste no faucet
4. Conectar à aplicação

## ⚙️ Comandos Essenciais

### Scripts de Deploy
```powershell
# Ajuda
.\deploy.ps1 help

# Instalação completa
.\deploy.ps1 install

# Iniciar servidor
.\deploy.ps1 start

# Deploy completo
.\deploy.ps1 full

# Verificar status
.\deploy.ps1 status

# Parar servidor
.\deploy.ps1 stop
```

### Comandos Úteis
```powershell
# Verificar versão Node.js
node --version

# Verificar versão npm
npm --version

# Compilar contratos
npx hardhat compile

# Executar testes
npx hardhat test

# Verificar porta em uso
netstat -an | findstr :8000
```

## 🔍 Solução Rápida de Problemas

### Erro: "Execution Policy"
```powershell
# Solução (executar como Administrador)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Porta em uso"
```powershell
# Usar porta diferente
.\deploy.ps1 start 3000
```

### Erro: "Node.js não encontrado"
1. Baixar e instalar Node.js do site oficial
2. Reiniciar terminal
3. Verificar: `node --version`

### Erro: "MetaMask não conecta"
1. Verificar se MetaMask está instalado
2. Verificar rede (Sepolia)
3. Recarregar página (F5)

## 📱 Funcionalidades da Aplicação

### Avatar Digital
- ✅ Criar avatar personalizado
- ✅ Vincular carteira MetaMask
- ✅ Gerenciar perfil digital

### Legado Digital
- ✅ Criar herança digital
- ✅ Definir herdeiros
- ✅ Configurar condições

### Cápsula do Tempo
- ✅ Criar mensagens futuras
- ✅ Agendar revelação
- ✅ Gerenciar conteúdo

### Link Carteira-Avatar
- ✅ Conectar identidade
- ✅ Sincronizar dados
- ✅ Manter privacidade

## 🎯 Próximos Passos

### Desenvolvimento
1. Testar todas as funcionalidades
2. Personalizar interface
3. Adicionar novos recursos
4. Integrar com site principal

### Produção
1. Deploy em mainnet
2. Configurar domínio
3. Implementar segurança
4. Monitoramento

## 📞 Ajuda

### Comandos de Diagnóstico
```powershell
# Status completo
.\deploy.ps1 status

# Verificar logs
Get-EventLog -LogName Application -Newest 10

# Processos Node.js ativos
Get-Process -Name node*
```

### Backup e Recuperação
```powershell
# Criar backup
.\deploy.ps1 backup

# Limpar cache
.\deploy.ps1 clean

# Reinstalação limpa
.\deploy.ps1 clean
.\deploy.ps1 install
```

---

**🤖 SingulAI MVP - Configuração Rápida para Windows**

*Para mais detalhes, consulte DEPLOY-WINDOWS.md*