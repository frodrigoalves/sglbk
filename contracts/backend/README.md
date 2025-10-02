# SingulAI Backend API

Backend API para o MVP do SingulAI - Gerenciamento de usuários e integração com blockchain.

## 🚀 Funcionalidades

- ✅ **Autenticação de usuários** com JWT
- ✅ **Geração automática de carteiras** usando BIP39
- ✅ **Integração com MetaMask** e carteiras externas
- ✅ **Banco de dados PostgreSQL** para persistência
- ✅ **API RESTful** com documentação
- ✅ **Rate limiting** e segurança
- ✅ **Logs de atividades** do usuário

## 📋 Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

### 1. Clonar e instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar banco de dados

#### Opção A: Script automático (Windows)
```bash
# Execute o script de configuração
setup-database.bat
```

#### Opção B: Configuração manual

```bash
# Criar banco de dados
createdb singulai_db

# Executar script de inicialização
psql -d singulai_db -f database/init.sql
```

### 3. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

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

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor iniciará na porta 3000 (ou PORT definida no .env).

## 📚 API Endpoints

### Autenticação

#### `POST /api/auth/signup`
Cria uma nova conta com carteira automática.

**Request:**
```json
{
  "fullName": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Conta criada com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "walletAddress": "0x..."
  },
  "token": "jwt_token_aqui",
  "wallet": {
    "address": "0x...",
    "mnemonic": "palavras da seed..."
  }
}
```

#### `POST /api/auth/login`
Faz login na conta existente.

**Request:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### `POST /api/auth/import-wallet`
Importa carteira existente (MetaMask ou chave privada).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "privateKey": "0x...",
  "walletType": "imported"
}
```

#### `POST /api/auth/connect-metamask`
Conecta carteira MetaMask.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "address": "0x...",
  "signature": "assinatura_opcional"
}
```

### Usuário

#### `GET /api/user/profile`
Obtém perfil do usuário logado.

**Headers:** `Authorization: Bearer <token>`

### Carteira

#### `GET /api/wallet/balance/:address`
Obtém saldo da carteira.

**Headers:** `Authorization: Bearer <token>`

## 🔒 Segurança

- **JWT Authentication** com expiração de 7 dias
- **Bcrypt** para hash de senhas (12 rounds)
- **Rate limiting** (100 requests/15min por IP)
- **Helmet** para headers de segurança
- **CORS** configurado para frontend
- **Row Level Security** no PostgreSQL

## 🗄️ Estrutura do Banco

### Tabelas

- `users` - Dados dos usuários e carteiras
- `sessions` - Sessões ativas
- `wallet_transactions` - Histórico de transações
- `user_activities` - Logs de atividades

### Índices

Otimizados para consultas frequentes:
- Email e endereço da carteira
- Tokens de sessão
- Transações por usuário

## 🧪 Testes

```bash
npm test
```

## 📊 Health Check

```
GET /api/health
```

Retorna status do servidor e versão.

## 🚀 Deploy

### Docker

```bash
# Build
docker build -t singulai-backend .

# Run
docker run -p 3000:3000 --env-file .env singulai-backend
```

### VPS Setup

Para deploy em VPS, use o script `setup-vps.sh` na raiz do projeto.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

MIT - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.