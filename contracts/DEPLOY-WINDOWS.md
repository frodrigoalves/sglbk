# 🚀 SingulAI MVP - Guia de Deploy para Windows

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração Manual](#configuração-manual)
4. [Deploy dos Contratos](#deploy-dos-contratos)
5. [Frontend](#frontend)
6. [Comandos Úteis](#comandos-úteis)
7. [Solução de Problemas](#solução-de-problemas)

## 🔧 Pré-requisitos

### Softwares Necessários
- **Node.js v18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/download/win)
- **PowerShell 5.1+** (já incluído no Windows)
- **MetaMask** - [Extensão do navegador](https://metamask.io/)

### Opcional
- **Python 3.8+** - Para servidor alternativo
- **VS Code** - Editor recomendado

## ⚡ Instalação Rápida

### 1. Abrir PowerShell
```powershell
# Abrir PowerShell como Administrador
# Permitir execução de scripts (apenas uma vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Configurar Projeto
```powershell
# Navegar para a pasta do projeto
cd "C:\Users\Lenga\Desktop\vps\singulai-mvp-backend-starter\contracts"

# Executar instalação completa
.\deploy.ps1 full
```

### 3. Acessar Aplicação
- Aguardar mensagem "Servidor iniciado"
- Acessar: http://localhost:8000/singulai-complete.html
- Conectar MetaMask quando solicitado

## 🔨 Configuração Manual

### 1. Configurar Ambiente
```powershell
# Instalar dependências
.\deploy.ps1 install
```

### 2. Configurar Variáveis de Ambiente
```powershell
# Copiar arquivo de exemplo
copy .env.example .env

# Editar arquivo .env
notepad .env
```

Configurar as seguintes variáveis:
```env
INFURA_PROJECT_ID=seu_project_id_aqui
SEPOLIA_PRIVATE_KEY=sua_private_key_aqui
ETHERSCAN_API_KEY=sua_api_key_aqui
```

### 3. Obter Chaves de API

#### Infura (RPC Provider)
1. Acessar [infura.io](https://infura.io/)
2. Criar conta gratuita
3. Criar projeto Ethereum
4. Copiar Project ID

#### Etherscan (Verificação de contratos)
1. Acessar [etherscan.io](https://etherscan.io/)
2. Criar conta
3. Ir em API Keys
4. Gerar nova chave

#### MetaMask (Private Key)
1. Abrir MetaMask
2. Clicar nos 3 pontos → Detalhes da conta
3. Exportar chave privada
4. **⚠️ NUNCA compartilhe esta chave!**

## 📦 Deploy dos Contratos

### Deploy Local (Teste)
```powershell
# Compilar contratos
.\deploy.ps1 deploy

# Escolher 'localhost' quando perguntado
```

### Deploy Sepolia (Testnet)
```powershell
# Compilar contratos
.\deploy.ps1 deploy

# Escolher 'sepolia' quando perguntado
```

### Verificar Deploy
```powershell
# Verificar status
.\deploy.ps1 status
```

## 🌐 Frontend

### Iniciar Servidor
```powershell
# Servidor padrão (porta 8000)
.\deploy.ps1 start

# Servidor em porta específica
.\deploy.ps1 start 3000
```

### Parar Servidor
```powershell
# Parar servidor
.\deploy.ps1 stop
```

### Arquivos do Frontend
```
frontend/
├── singulai-complete.html    # Interface principal
├── singulai-advanced.js      # Lógica da aplicação
├── styles/                   # Estilos CSS
└── assets/                   # Imagens e recursos
```

## 🛠 Comandos Úteis

### Scripts de Deploy
```powershell
# Ajuda
.\deploy.ps1 help

# Instalação completa
.\deploy.ps1 install

# Deploy apenas contratos
.\deploy.ps1 deploy

# Iniciar frontend
.\deploy.ps1 start [porta]

# Parar servidor
.\deploy.ps1 stop

# Verificar status
.\deploy.ps1 status

# Criar backup
.\deploy.ps1 backup

# Limpar cache
.\deploy.ps1 clean

# Deploy completo (all-in-one)
.\deploy.ps1 full
```

### Comandos Hardhat
```powershell
# Compilar contratos
npx hardhat compile

# Executar testes
npx hardhat test

# Iniciar rede local
npx hardhat node

# Deploy em rede específica
npx hardhat run scripts/deploy.js --network sepolia
```

### Comandos de Sistema
```powershell
# Verificar porta em uso
netstat -an | findstr :8000

# Matar processo por porta
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Verificar conectividade
Test-Connection google.com -Count 1
```

## 🔍 Solução de Problemas

### Erro: "Execution Policy"
```powershell
# Solução: Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Node.js não encontrado"
1. Baixar Node.js do site oficial
2. Instalar versão LTS
3. Reiniciar PowerShell
4. Verificar: `node --version`

### Erro: "Porta já em uso"
```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :8000

# Matar processo (substitua PID)
taskkill /PID 1234 /F

# Ou usar porta diferente
.\deploy.ps1 start 3000
```

### Erro: "MetaMask não conecta"
1. Verificar se MetaMask está instalado
2. Verificar se está na rede correta (Sepolia)
3. Recarregar página
4. Verificar console do navegador (F12)

### Erro: "Contratos não encontrados"
1. Verificar se compilação foi bem-sucedida
2. Verificar arquivo de endereços dos contratos
3. Fazer deploy novamente

### Erro: "Sem fundos para transação"
1. Obter ETH de teste em [faucet](https://sepoliafaucet.com/)
2. Verificar saldo na MetaMask
3. Aguardar confirmação da transação

### Erro: "RPC Error"
1. Verificar conexão com internet
2. Verificar Infura Project ID
3. Verificar status da rede Sepolia

## 📈 Monitoramento

### Logs do Sistema
```powershell
# Verificar logs do Hardhat
ls artifacts/

# Verificar backups
ls backups/

# Verificar status dos processos
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Verificação de Contratos
1. Acessar [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Buscar endereços dos contratos
3. Verificar transações e eventos

## 🔒 Segurança

### Boas Práticas
- ✅ Nunca compartilhar chaves privadas
- ✅ Usar apenas testnet para desenvolvimento
- ✅ Manter backups dos arquivos importantes
- ✅ Verificar endereços dos contratos
- ✅ Usar MetaMask com cuidado

### Variáveis Sensíveis
```env
# ⚠️ NUNCA commitar estas informações
SEPOLIA_PRIVATE_KEY=0x...
INFURA_PROJECT_ID=...
ETHERSCAN_API_KEY=...
```

## 📞 Suporte

### Recursos Úteis
- [Documentação Hardhat](https://hardhat.org/docs)
- [MetaMask Help](https://metamask.io/support/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

### Informações do Sistema
```powershell
# Versão do Node.js
node --version

# Versão do npm
npm --version

# Informações do Windows
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

---

**🤖 SingulAI MVP - O futuro registrado, codificado**

*Versão: 2.0 | Data: 22/09/2025*