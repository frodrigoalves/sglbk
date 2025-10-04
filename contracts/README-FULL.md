# 🚀 SingulAI MVP - Full Stack Platform

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22.5-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> Plataforma completa de avatares digitais, herança digital e cápsulas do tempo na blockchain Ethereum, com sistema de autenticação e gerenciamento de usuários.

## 📋 Visão Geral

O SingulAI MVP é uma plataforma inovadora que oferece:

### 🎭 **Frontend - Interface do Usuário**
- **Onboarding intuitivo** para usuários não-técnicos
- **Criação automática de carteiras** com BIP39
- **Integração com MetaMask** (opcional)
- **Importação via QR Code** ou chave privada
- **Dashboard responsivo** com tema moderno

### 🔧 **Backend - API RESTful**
- **Autenticação JWT** com bcrypt
- **Geração automática de carteiras** HD
- **PostgreSQL** com Row Level Security
- **Rate limiting** e segurança avançada
- **Logs de atividades** do usuário

### 🏗️ **Smart Contracts - Blockchain**
- **AvatarBase**: Tokens ERC721 para avatares digitais
- **AvatarWalletLink**: Vinculação avatar-carteira
- **TimeCapsule**: Cápsulas do tempo com unlock temporal
- **DigitalLegacy**: Sistema de herança digital

## 🏛️ Arquitetura Completa

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Smart Contracts│
│   (HTML/CSS/JS) │◄──►│  (Node.js API)  │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • Login System  │    │ • Auth & Users  │    │ • ERC721 Tokens │
│ • Wallet Mgmt   │    │ • JWT Tokens    │    │ • Time Capsules │
│ • Dashboard     │    │ • PostgreSQL    │    │ • Digital Legacy│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos
- **Node.js 16+** e **npm**
- **PostgreSQL 12+**
- **Python 3+** (para servidor local)
- **Git**

### 1. Clone e Setup
```bash
git clone <repository-url>
cd singulai-mvp-backend-starter/contracts
```

### 2. Configurar Banco de Dados
```bash
# Executar script de configuração do banco
setup-database.bat
```

### 3. Instalar Dependências
```bash
# Backend
cd backend
npm install

# Voltar para raiz
cd ..
```

### 4. Configurar Variáveis de Ambiente
Edite o arquivo `.env`:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/singulai_db

# JWT Secret (mude para produção!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Web3/Blockchain
INFURA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
```

### 5. Inicializar Banco
```bash
# Executar script de inicialização
psql -d singulai_db -f database/init.sql
```

### 6. Iniciar Serviços
```bash
# Script automático (recomendado)
start-services.bat

# Ou manualmente:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && python -m http.server 8000
```

### 7. Acessar a Plataforma
- **Login/Onboarding**: http://localhost:8000/login.html
- **Dashboard**: http://localhost:8000/index.html
- **API Health Check**: http://localhost:3000/api/health

## 📱 Como Usar

### 👤 Para Novos Usuários
1. Acesse http://localhost:8000/login.html
2. Clique em **"Novo por aqui?"**
3. Preencha nome, email e senha
4. **Carteira é criada automaticamente!**
5. Anote a frase de recuperação em local seguro
6. Continue para o dashboard

### 🔑 Para Usuários Existentes
1. **Login**: Use email/senha
2. **MetaMask**: Conecte carteira existente
3. **Importar**: Use chave privada ou QR code

### 🏠 Dashboard
- Visualize saldo da carteira
- Gerencie avatares digitais
- Crie cápsulas do tempo
- Configure herança digital

## 🔧 API Endpoints

### Autenticação
```http
POST /api/auth/signup          # Criar conta
POST /api/auth/login           # Fazer login
POST /api/auth/import-wallet   # Importar carteira
POST /api/auth/connect-metamask # Conectar MetaMask
```

### Usuário
```http
GET  /api/user/profile         # Perfil do usuário
GET  /api/wallet/balance/:addr # Saldo da carteira
```

### Sistema
```http
GET  /api/health              # Health check
```

## 🗄️ Estrutura do Banco

```sql
users              # Dados dos usuários
sessions           # Sessões ativas
wallet_transactions # Histórico blockchain
user_activities    # Logs de atividades
```

## 🧪 Testes

### Smart Contracts
```bash
npx hardhat test
```

### API Backend
```bash
cd backend
npm test
```

## 🚀 Deploy

### Desenvolvimento Local
```bash
# Iniciar tudo
start-services.bat
```

### Produção (VPS)
```bash
# Usar scripts de deploy
./deploy.sh
```

### Docker
```bash
# Build e run
docker-compose up --build
```

## 🔒 Segurança

- **JWT Authentication** com expiração
- **Bcrypt** para senhas (12 rounds)
- **Rate Limiting** (100 req/15min)
- **Helmet** para headers seguros
- **CORS** configurado
- **Row Level Security** no PostgreSQL

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra Pull Request

## 📝 Scripts Disponíveis

```bash
# Setup
setup-database.bat     # Configurar PostgreSQL
start-services.bat     # Iniciar frontend + backend

# Desenvolvimento
npm run dev           # Backend com nodemon
python -m http.server 8000  # Frontend local

# Deploy
deploy.bat            # Deploy Windows
./deploy.sh           # Deploy Linux
```

## 🆘 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
net start postgresql-x64-15

# Testar conexão
psql -U postgres -d singulai_db
```

### Porta Já em Uso
```bash
# Matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MetaMask Não Conecta
- Verifique se está na rede Sepolia
- Certifique-se de que a extensão está atualizada
- Tente recarregar a página

## 📊 Status do Projeto

- ✅ **Frontend**: Login/onboarding completo
- ✅ **Backend**: API RESTful com auth
- ✅ **Database**: PostgreSQL com RLS
- ✅ **Smart Contracts**: ERC721 + funcionalidades
- ✅ **Integração**: Frontend ↔ Backend ↔ Blockchain
- 🚧 **Testes**: Cobertura básica implementada
- 🚧 **Documentação**: Em andamento

## 📄 Licença

MIT - veja [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Rodrigo Alves** - Desenvolvimento Full Stack
- **SingulAI Team** - Design e Estratégia

## 📞 Suporte

- 📧 **Email**: suporte@singulai.live
- 🌐 **Site**: https://www.singulai.live
- 📱 **Discord**: [Link em breve]

---

**🎉 Bem-vindo ao futuro da identidade digital!**
