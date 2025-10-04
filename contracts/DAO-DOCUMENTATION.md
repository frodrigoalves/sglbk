# SingulAI DAO - Documentação

## Visão Geral

O SingulAI DAO é um sistema de governança descentralizada integrado à plataforma SingulAI. Ele permite que os detentores do token SGL participem da tomada de decisões sobre o futuro do projeto através de propostas e votações realizadas na blockchain.

## Contratos Implementados

### 1. SingulAIDAO.sol

O contrato principal de governança que gerencia propostas e votações.

**Funcionalidades principais:**
- Criação de propostas
- Votação em propostas (a favor/contra)
- Execução de propostas aprovadas
- Cancelamento de propostas
- Verificação de status de propostas
- Delegação de votos

**Parâmetros de Governança:**
- **Threshold de Proposta:** Quantidade mínima de tokens SGL que um usuário deve possuir para criar uma proposta.
- **Quórum:** Porcentagem mínima de tokens que devem participar de uma votação para que ela seja válida.
- **Período Mínimo de Votação:** Tempo mínimo que uma proposta deve permanecer aberta para votação.

### 2. SingulAITreasury.sol

Um contrato de tesouraria que gerencia os fundos controlados pelo DAO.

**Funcionalidades principais:**
- Recebimento e armazenamento de ETH e tokens SGL
- Transferência de ETH e tokens SGL mediante aprovação de proposta
- Visualização de saldos de ETH e tokens

## Integração com Frontend

A interface de usuário do DAO está integrada ao frontend do SingulAI e oferece as seguintes funcionalidades:

### Páginas e Visualizações

1. **Página Principal do DAO** (`dao.html`)
   - Visão geral do DAO
   - Estatísticas de governança
   - Lista de propostas recentes

2. **Seção de Propostas**
   - Listar todas as propostas
   - Filtrar por status (ativa, executada, derrotada, etc.)
   - Visualizar detalhes de uma proposta específica
   - Votar em propostas ativas

3. **Seção de Criação de Propostas**
   - Formulário para criar novas propostas
   - Opções para diferentes tipos de ações (transferência de tokens, transferência de ETH)
   - Validação de parâmetros de proposta

4. **Seção de Tesouro**
   - Visualizar saldos de ETH e tokens SGL
   - Depositar tokens SGL na tesouraria
   - Histórico de transações

### Classes e Componentes JavaScript

1. **SingulAIDAOManager**
   - Gerencia a interação com os contratos de DAO
   - Lida com transações e chamadas de contrato
   - Converte dados entre os formatos de blockchain e frontend

### Fluxo de Criação de Proposta

1. Usuário conecta sua carteira (MetaMask)
2. Usuário navega para a seção "Criar Proposta"
3. Usuário preenche os detalhes da proposta:
   - Título e descrição
   - Tipo de ação (transferir tokens ou ETH)
   - Endereço do destinatário e quantidade
   - Período de votação
4. Sistema verifica se o usuário possui tokens SGL suficientes
5. Proposta é criada na blockchain e aparece na lista de propostas ativas

### Fluxo de Votação

1. Usuário conecta sua carteira
2. Usuário navega para a lista de propostas ativas
3. Usuário seleciona uma proposta para ver detalhes
4. Usuário vota a favor ou contra
5. Sistema registra o voto na blockchain
6. Barra de progresso de votação é atualizada em tempo real

### Fluxo de Execução de Proposta

1. Após o período de votação terminar, o sistema verifica se a proposta foi aprovada
2. Se aprovada, qualquer usuário pode executar a proposta
3. A execução aciona a ação especificada na proposta (ex: transferência de fundos)
4. O status da proposta é atualizado para "Executada"

## Configuração do DAO

Para configurar o DAO em um novo ambiente, siga os passos abaixo:

### 1. Implantação dos Contratos

1. Deploy do contrato SingulAIDAO:
   ```
   npx hardhat run scripts/deploy-dao.js --network sepolia
   ```

2. Deploy do contrato SingulAITreasury:
   ```
   npx hardhat run scripts/deploy-treasury.js --network sepolia
   ```

3. Verificação dos contratos no Etherscan:
   ```
   npx hardhat verify --network sepolia <DAO_CONTRACT_ADDRESS> <TOKEN_ADDRESS> <TREASURY_ADDRESS>
   npx hardhat verify --network sepolia <TREASURY_CONTRACT_ADDRESS> <TOKEN_ADDRESS> <DAO_CONTRACT_ADDRESS>
   ```

### 2. Configuração do Frontend

1. Atualize os endereços dos contratos no arquivo `singulai-dao.js`:
   ```javascript
   const DAO_CONTRACTS = {
       SINGULAI_DAO: {
           address: '<DAO_CONTRACT_ADDRESS>',
           ...
       },
       SINGULAI_TREASURY: {
           address: '<TREASURY_CONTRACT_ADDRESS>',
           ...
       }
   };
   ```

2. Integre a página `dao.html` ao menu principal do SingulAI.

3. Teste a funcionalidade completa do DAO em um ambiente de teste antes de implantar em produção.

## Melhores Práticas para Desenvolvimento

1. **Segurança:**
   - Sempre use `onlyOwner` ou mecanismos RBAC para funções administrativas
   - Implemente limites de gastos para propostas
   - Considere períodos de atraso para execução de propostas sensíveis

2. **Usabilidade:**
   - Forneça feedback claro sobre transações em andamento
   - Explique os parâmetros de governança para os usuários
   - Ofereça estimativas de gas para as transações

3. **Escalabilidade:**
   - Implemente paginação para listas de propostas
   - Otimize chamadas de contrato para reduzir custos de gas
   - Considere soluções Layer 2 para reduzir custos de transação

## Testes

Os contratos do DAO incluem testes abrangentes:

1. **Testes Unitários:** Testam funções individuais dos contratos.
2. **Testes de Integração:** Testam a interação entre os contratos de DAO e Tesouraria.
3. **Testes de Cenário:** Testam fluxos completos de criação, votação e execução de propostas.

Para executar os testes:
```
npx hardhat test test/dao-tests.js
```

## Próximos Passos e Melhorias Futuras

1. **Implementação de Votação Quadrática:**
   - Permite que o poder de voto seja proporcional à raiz quadrada dos tokens detidos
   - Aumenta a descentralização da tomada de decisão

2. **Múltiplas Ações por Proposta:**
   - Permite que uma única proposta contenha múltiplas ações
   - Simplifica propostas complexas

3. **Timelock para Propostas Críticas:**
   - Adiciona um período de espera antes da execução de propostas críticas
   - Aumenta a segurança para operações sensíveis

4. **Interface de Usuário Aprimorada:**
   - Gráficos de participação em votações
   - Notificações para novas propostas e resultados
   - Perfis de membros do DAO

5. **Integração com Análises On-Chain:**
   - Visualização de métricas de governança
   - Análise de padrões de votação
   - Rastreamento de participação dos membros

## Contato e Suporte

Para questões relacionadas ao DAO do SingulAI, entre em contato com:
- Email: suporte@singulai.com
- Discord: discord.gg/singulai
- Twitter: @SingulAI_DAO

---

*Este documento foi atualizado pela última vez em: 24 de julho de 2023*