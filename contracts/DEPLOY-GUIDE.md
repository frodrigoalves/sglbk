# Guia de Implantação dos Contratos SingulAI

Este guia apresenta os passos para implantar e verificar os contratos inteligentes da SingulAI na rede Ethereum Sepolia.

## Pré-requisitos

- Node.js e npm instalados
- Hardhat configurado
- Arquivo `.env` configurado com:
  - `PRIVATE_KEY` - Chave privada da carteira Ethereum
  - `RPC_URL` - URL do nó Infura/Alchemy para Sepolia
  - `ETHERSCAN_API_KEY` - Chave da API do Etherscan

## 1. Instalação

```bash
npm install
```

## 2. Compilação

```bash
npx hardhat compile
```

## 3. Implantação do Token SGL

```bash
npx hardhat run scripts/deploy-token.js --network sepolia
```

Após a execução, você verá o endereço do contrato implantado. Salve este endereço pois será necessário para atualizar os arquivos de configuração.

## 4. Implantação dos Contratos Principais

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 5. Verificação dos Contratos no Etherscan

### Verificar Token SGL

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_TOKEN_SGL> "1000000000000000000000000"
```

### Verificar AvatarBase

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_AVATAR_BASE>
```

### Verificar AvatarWalletLink

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_WALLET_LINK> <ENDEREÇO_DO_AVATAR_BASE>
```

### Verificar TimeCapsule

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_TIME_CAPSULE> <ENDEREÇO_DO_AVATAR_BASE>
```

### Verificar DigitalLegacy

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_DIGITAL_LEGACY> <ENDEREÇO_DO_AVATAR_BASE>
```

## 6. Atualização das Configurações

### Atualizar .env no Backend

Adicione ou atualize as seguintes variáveis no arquivo `.env`:

```
MOCK_TOKEN_ADDRESS=<ENDEREÇO_DO_TOKEN_SGL>
AVATAR_BASE_ADDRESS=<ENDEREÇO_DO_AVATAR_BASE>
AVATAR_WALLET_LINK_ADDRESS=<ENDEREÇO_DO_WALLET_LINK>
TIME_CAPSULE_ADDRESS=<ENDEREÇO_DO_TIME_CAPSULE>
DIGITAL_LEGACY_ADDRESS=<ENDEREÇO_DO_DIGITAL_LEGACY>
```

### Atualizar Frontend (singulai-mvp.js)

Atualize o objeto `CONTRACTS` no arquivo `frontend/singulai-mvp.js` com os novos endereços dos contratos.

## 7. Teste de Integração

1. Inicie o servidor backend: `cd backend && npm run dev`
2. Inicie o servidor frontend: `cd frontend && python -m http.server 8000`
3. Acesse http://localhost:8000/login.html no navegador
4. Conecte-se com MetaMask na rede Sepolia

## Solução de Problemas

- **Erro de Transação**: Verifique se você tem ETH suficiente na rede Sepolia
- **Erro de Verificação**: Aguarde alguns minutos após a implantação antes de verificar
- **Erro de Conexão**: Verifique se a URL RPC está correta no `.env`