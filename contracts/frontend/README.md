# 🤖 SingulAI Frontend MVP

Frontend simples para interagir com os contratos inteligentes do SingulAI na testnet Sepolia.

## 🚀 Como Usar

### 1. Pré-requisitos
- **MetaMask** instalado no navegador
- **SepoliaETH** para pagar gas (use um faucet: https://faucets.chain.link/sepolia)

### 2. Executar o Frontend
```bash
# Navegar para a pasta do frontend
cd frontend

# Abrir o arquivo HTML no navegador
# Ou usar um servidor local simples:
python -m http.server 8000
# Depois acessar: http://localhost:8000
```

### 3. Configurar MetaMask
1. **Conectar à rede Sepolia**
2. **Importar rede** (caso não esteja disponível):
   - Nome: Sepolia Test Network
   - RPC: https://sepolia.infura.io/v3/
   - Chain ID: 11155111
   - Symbol: SepoliaETH
   - Explorer: https://sepolia.etherscan.io/

### 4. Funcionalidades Disponíveis

#### 🎭 Avatar Base
- **Criar Avatar**: Mint um novo NFT avatar com atributos personalizados
- **Verificar ID**: Ver qual será o próximo ID de avatar

#### ⏰ Time Capsule
- **Criar Cápsula**: Criar uma cápsula do tempo que será desbloqueada no futuro
- **Configurar tempo**: Definir quantas horas até o desbloqueio

#### 🏛️ Digital Legacy
- **Criar Legado**: Criar um legado digital com regras de desbloqueio
- **Definir regras**: Especificar condições para acessar o legado

#### 💼 Wallet Link
- **Verificar Status**: Confirmar que o contrato está ativo

## 📋 Contratos Deployados (Sepolia)

| Contrato | Endereço | Etherscan |
|----------|----------|-----------|
| AvatarBase | `0x388D16b79fAff27A45F714838F029BC34aC60c48` | [Ver](https://sepolia.etherscan.io/address/0x388D16b79fAff27A45F714838F029BC34aC60c48) |
| AvatarWalletLink | `0x803DE61049d1b192828A46e5952645C3f5b352B0` | [Ver](https://sepolia.etherscan.io/address/0x803DE61049d1b192828A46e5952645C3f5b352B0) |
| TimeCapsule | `0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93` | [Ver](https://sepolia.etherscan.io/address/0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93) |
| DigitalLegacy | `0x91E67E1592e66C347C3f615d71927c05a1951057` | [Ver](https://sepolia.etherscan.io/address/0x91E67E1592e66C347C3f615d71927c05a1951057) |

## 🛠️ Tecnologias

- **HTML5 + CSS3**: Interface responsiva
- **Web3.js**: Interação com blockchain
- **MetaMask**: Conexão com carteira
- **Sepolia Testnet**: Rede de teste

## 🔧 Personalização

Para modificar o frontend:

1. **Estilos**: Editar CSS no `index.html`
2. **Funcionalidades**: Modificar `app.js`
3. **Contratos**: Atualizar endereços e ABIs em `app.js`

## 🐛 Solução de Problemas

### MetaMask não conecta
- Verificar se está na rede Sepolia
- Atualizar a página
- Verificar se tem SepoliaETH para gas

### Transação falha
- Verificar saldo de SepoliaETH
- Aumentar gas limit
- Verificar se os parâmetros estão corretos

### Contrato não responde
- Verificar se o endereço está correto
- Confirmar que está na rede Sepolia
- Verificar no Etherscan se o contrato existe

## 📞 Suporte

Em caso de problemas, verificar:
1. Console do navegador para erros
2. Status da rede Sepolia
3. Saldo da carteira MetaMask

---

**🎉 Pronto para testar o SingulAI MVP!**