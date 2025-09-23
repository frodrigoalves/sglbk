# Contributing to SingulAI MVP Backend

Obrigado por considerar contribuir para o SingulAI MVP Backend! 🚀

## 📋 Como Contribuir

### 🐛 Reportar Bugs

Se você encontrar um bug, por favor crie uma issue com:

- **Título descritivo** do problema
- **Descrição detalhada** do que aconteceu
- **Passos para reproduzir** o bug
- **Resultado esperado** vs **resultado atual**
- **Environment** (versão do Node, OS, etc.)
- **Logs de erro** se disponíveis

### 💡 Sugerir Melhorias

Para sugerir uma nova funcionalidade:

- **Verifique** se já não existe uma issue similar
- **Descreva** claramente a funcionalidade desejada
- **Explique** por que seria útil
- **Forneça** exemplos de uso se possível

### 🔧 Submeter Código

#### 1. Setup do Ambiente

```bash
# Fork e clone o repositório
git clone https://github.com/SEU_USERNAME/sglbk.git
cd sglbk/contracts

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com suas configurações
```

#### 2. Desenvolvimento

```bash
# Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# Compile e teste
npm run compile
npm test

# Desenvolva sua funcionalidade
# Adicione testes para novas funcionalidades
# Mantenha a cobertura de testes alta
```

#### 3. Guidelines de Código

- **Solidity Style Guide**: Siga o [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **Documentação**: Documente funções públicas com NatSpec
- **Testes**: Toda nova funcionalidade deve ter testes
- **Gas Optimization**: Otimize para eficiência de gas
- **Security**: Considere implicações de segurança

#### 4. Commit Messages

Use commits semânticos:

```
feat: adiciona funcionalidade de backup de avatar
fix: corrige bug na validação de timestamp
docs: atualiza README com novos exemplos
test: adiciona testes para TimeCapsule
refactor: otimiza gas usage no AvatarBase
```

#### 5. Pull Request

Antes de submeter:

```bash
# Certifique-se que tudo compila
npm run compile

# Execute todos os testes
npm test

# Verifique se não quebra nada
npm run coverage
```

Seu PR deve incluir:

- **Descrição clara** do que foi implementado
- **Testes** para novas funcionalidades
- **Documentação** atualizada se necessário
- **Breaking changes** claramente marcados

## 🧪 Executando Testes

```bash
# Testes básicos
npm test

# Testes com cobertura
npm run coverage

# Testes específicos
npx hardhat test test/AvatarBase.test.js

# Testes em rede específica
npx hardhat test --network sepolia
```

## 📝 Padrões de Código

### Solidity

```solidity
// ✅ Bom
contract ExampleContract {
    uint256 public constant MAX_SUPPLY = 10000;
    
    mapping(uint256 => address) private _owners;
    
    event TokenMinted(uint256 indexed tokenId, address indexed to);
    
    /**
     * @dev Mints a new token to the specified address
     * @param to Address to mint the token to
     * @param tokenId ID of the token to mint
     */
    function mint(address to, uint256 tokenId) external {
        require(to != address(0), "Cannot mint to zero address");
        require(_owners[tokenId] == address(0), "Token already exists");
        
        _owners[tokenId] = to;
        emit TokenMinted(tokenId, to);
    }
}
```

### JavaScript/Testing

```javascript
// ✅ Bom
describe("ExampleContract", function () {
  let contract;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const ExampleContract = await ethers.getContractFactory("ExampleContract");
    contract = await ExampleContract.deploy();
    await contract.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint token successfully", async function () {
      await expect(contract.mint(addr1.address, 1))
        .to.emit(contract, "TokenMinted")
        .withArgs(1, addr1.address);
      
      expect(await contract._owners(1)).to.equal(addr1.address);
    });
  });
});
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] **Reentrancy**: Protegido contra ataques de reentrância?
- [ ] **Integer Overflow**: Usando SafeMath ou Solidity 0.8+?
- [ ] **Access Control**: Permissões adequadamente implementadas?
- [ ] **Input Validation**: Todas as entradas são validadas?
- [ ] **Gas Limits**: Funções não consomem gas excessivo?
- [ ] **External Calls**: Chamadas externas são seguras?

### Ferramentas Recomendadas

- **Slither**: Análise estática de segurança
- **Mythril**: Análise de vulnerabilidades
- **Echidna**: Fuzzing para contratos
- **Hardhat Gas Reporter**: Otimização de gas

## 📚 Recursos Úteis

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Security Guidelines](https://consensys.github.io/smart-contract-best-practices/)

## 💬 Comunicação

- **Issues**: Para bugs e sugestões
- **Discussions**: Para perguntas e discussões gerais
- **Discord**: [SingulAI Community](https://discord.gg/singulai)

## 🏆 Reconhecimento

Contribuidores serão listados no README e receberão créditos apropriados. Grandes contribuições podem ser elegíveis para recompensas em tokens do projeto.

---

**Obrigado por contribuir para o futuro dos avatares digitais! 🌟**
