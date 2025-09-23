// SingulAI MVP - Sistema Completo de Demonstração
// Versão avançada com funcionalidades completas

class SingulAIApp {
    constructor() {
        this.web3 = null;
        this.userAccount = null;
        this.contracts = {};
        this.transactionHistory = [];
        this.isInitialized = false;
        
        // Configuração dos contratos
        this.CONTRACTS = {
            AVATAR_BASE: {
                address: '0x388D16b79fAff27A45F714838F029BC34aC60c48',
                abi: [
                    "function mint(address to, string memory attrs) external returns (uint256 tokenId)",
                    "function nextId() public view returns (uint256)",
                    "function balanceOf(address owner) public view returns (uint256)",
                    "function ownerOf(uint256 tokenId) public view returns (address)",
                    "function attributes(uint256 tokenId) public view returns (string)",
                    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
                ]
            },
            TIME_CAPSULE: {
                address: '0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93',
                abi: [
                    "function createCapsule(uint256 avatarId, uint256 unlockDate, string memory cid) external",
                    "function capsules(bytes32 id) public view returns (uint256 avatarId, uint256 unlockDate, string cid, bool unlocked)",
                    "function unlockIfReady(uint256 avatarId, string memory cid) external",
                    "event CapsuleCreated(bytes32 indexed id, uint256 avatarId, uint256 unlockDate, string cid)",
                    "event CapsuleUnlocked(bytes32 indexed id, uint256 avatarId, string cid)"
                ]
            },
            DIGITAL_LEGACY: {
                address: '0x91E67E1592e66C347C3f615d71927c05a1951057',
                abi: [
                    "function createLegacy(uint256 avatarId, string memory cid, string memory rules) external",
                    "function legacies(bytes32 id) public view returns (uint256 avatarId, string cid, string rules, bool unlocked)",
                    "function unlockLegacy(bytes32 id) external",
                    "event LegacyCreated(bytes32 indexed id, uint256 avatarId, string cid, string rules)",
                    "event LegacyUnlocked(bytes32 indexed id, uint256 avatarId)"
                ]
            },
            AVATAR_WALLET_LINK: {
                address: '0x803DE61049d1b192828A46e5952645C3f5b352B0',
                abi: []
            }
        };
        
        this.SEPOLIA_CONFIG = {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SepoliaETH',
                decimals: 18
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
        };
    }

    // Inicialização completa
    async init() {
        console.log('🚀 Inicializando SingulAI MVP Completo...');
        
        try {
            await this.initWeb3();
            this.setupEventListeners();
            await this.checkExistingConnection();
            this.loadTransactionHistory();
            this.updateConnectionStatus();
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('✅ SingulAI MVP inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showMessage('system', 'error', '❌ Erro ao inicializar sistema: ' + error.message);
        }
    }

    async initWeb3() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask não detectado! Por favor, instale o MetaMask.');
        }
        
        this.web3 = new Web3(window.ethereum);
        
        // Inicializar contratos
        this.contracts.avatarBase = new this.web3.eth.Contract(
            this.CONTRACTS.AVATAR_BASE.abi, 
            this.CONTRACTS.AVATAR_BASE.address
        );
        this.contracts.timeCapsule = new this.web3.eth.Contract(
            this.CONTRACTS.TIME_CAPSULE.abi, 
            this.CONTRACTS.TIME_CAPSULE.address
        );
        this.contracts.digitalLegacy = new this.web3.eth.Contract(
            this.CONTRACTS.DIGITAL_LEGACY.abi, 
            this.CONTRACTS.DIGITAL_LEGACY.address
        );
        
        console.log('✅ Contratos inicializados');
    }

    setupEventListeners() {
        // Botões principais
        document.getElementById('connect-wallet')?.addEventListener('click', () => this.connectWallet());
        document.getElementById('disconnect-wallet')?.addEventListener('click', () => this.disconnectWallet());
        
        // Avatar Base
        document.getElementById('mint-avatar')?.addEventListener('click', () => this.mintAvatar());
        document.getElementById('check-next-id')?.addEventListener('click', () => this.checkNextId());
        document.getElementById('check-my-avatars')?.addEventListener('click', () => this.checkMyAvatars());
        
        // Time Capsule
        document.getElementById('create-capsule')?.addEventListener('click', () => this.createTimeCapsule());
        document.getElementById('check-capsule')?.addEventListener('click', () => this.checkCapsule());
        
        // Digital Legacy
        document.getElementById('create-legacy')?.addEventListener('click', () => this.createDigitalLegacy());
        document.getElementById('check-legacy')?.addEventListener('click', () => this.checkLegacy());
        
        // Wallet Link
        document.getElementById('check-wallet-link')?.addEventListener('click', () => this.checkWalletLink());
        
        // Transaction History
        document.getElementById('clear-history')?.addEventListener('click', () => this.clearTransactionHistory());
        document.getElementById('refresh-data')?.addEventListener('click', () => this.refreshAllData());
        
        // Event listeners para mudanças na wallet
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));
            window.ethereum.on('chainChanged', (chainId) => this.handleChainChanged(chainId));
        }
    }

    async checkExistingConnection() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.userAccount = accounts[0];
                await this.ensureCorrectNetwork();
            }
        } catch (error) {
            console.error('Erro ao verificar conexão existente:', error);
        }
    }

    async connectWallet() {
        try {
            this.showMessage('connection', 'loading', '🔄 Conectando carteira...');
            
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            this.userAccount = accounts[0];
            await this.ensureCorrectNetwork();
            this.updateConnectionStatus();
            await this.loadUserData();
            
            this.showMessage('connection', 'success', '✅ Carteira conectada com sucesso!');
            this.addTransaction('connection', 'Carteira conectada', '');
            
        } catch (error) {
            console.error('❌ Erro ao conectar wallet:', error);
            this.showMessage('connection', 'error', '❌ Erro ao conectar carteira: ' + error.message);
        }
    }

    async disconnectWallet() {
        this.userAccount = null;
        this.updateConnectionStatus();
        this.clearUserData();
        this.showMessage('connection', 'success', '🔌 Carteira desconectada');
    }

    async ensureCorrectNetwork() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== this.SEPOLIA_CONFIG.chainId) {
            await this.switchToSepolia();
        }
    }

    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.SEPOLIA_CONFIG.chainId }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [this.SEPOLIA_CONFIG]
                });
            } else {
                throw switchError;
            }
        }
    }

    // Funcionalidades dos contratos com melhorias

    async mintAvatar() {
        if (!this.validateConnection()) return;
        
        const attrs = document.getElementById('avatar-attrs')?.value.trim();
        if (!attrs) {
            this.showMessage('avatar', 'error', '❌ Descreva a personalidade do avatar!');
            return;
        }
        
        try {
            this.showMessage('avatar', 'loading', '🔄 Criando avatar na blockchain...');
            
            // Estimativa de gas
            const gasEstimate = await this.contracts.avatarBase.methods
                .mint(this.userAccount, attrs)
                .estimateGas({ from: this.userAccount });
            
            const tx = await this.contracts.avatarBase.methods
                .mint(this.userAccount, attrs)
                .send({
                    from: this.userAccount,
                    gas: Math.floor(gasEstimate * 1.2) // 20% de buffer
                });
            
            const nextId = await this.contracts.avatarBase.methods.nextId().call();
            const avatarId = parseInt(nextId) - 1;
            
            this.showMessage('avatar', 'success', 
                `✅ Avatar #${avatarId} criado com sucesso!<br>
                <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" rel="noopener" style="color: #00ff88;">Ver transação</a>`
            );
            
            this.addTransaction('avatar', `Avatar #${avatarId} criado`, tx.transactionHash);
            document.getElementById('avatar-attrs').value = '';
            
            // Atualizar dados do usuário
            setTimeout(() => this.loadUserData(), 2000);
            
        } catch (error) {
            console.error('❌ Erro ao criar avatar:', error);
            this.showMessage('avatar', 'error', '❌ Erro ao criar avatar: ' + this.parseError(error));
        }
    }

    async checkMyAvatars() {
        if (!this.validateConnection()) return;
        
        try {
            this.showMessage('avatar', 'loading', '🔄 Verificando seus avatares...');
            
            const balance = await this.contracts.avatarBase.methods.balanceOf(this.userAccount).call();
            const nextId = await this.contracts.avatarBase.methods.nextId().call();
            
            this.showMessage('avatar', 'success', 
                `👤 Você possui ${balance} avatar(es)<br>
                🔢 Total de avatares criados: ${parseInt(nextId) - 1}`
            );
            
        } catch (error) {
            console.error('❌ Erro ao verificar avatares:', error);
            this.showMessage('avatar', 'error', '❌ Erro ao verificar avatares: ' + this.parseError(error));
        }
    }

    async createTimeCapsule() {
        if (!this.validateConnection()) return;
        
        const avatarId = document.getElementById('capsule-avatar-id')?.value;
        const hours = document.getElementById('capsule-hours')?.value;
        const cid = document.getElementById('capsule-cid')?.value.trim();
        
        if (!avatarId || !hours || !cid) {
            this.showMessage('capsule', 'error', '❌ Preencha todos os campos!');
            return;
        }
        
        try {
            this.showMessage('capsule', 'loading', '🔄 Criando cápsula do tempo...');
            
            const unlockDate = Math.floor(Date.now() / 1000) + (parseInt(hours) * 3600);
            
            const gasEstimate = await this.contracts.timeCapsule.methods
                .createCapsule(parseInt(avatarId), unlockDate, cid)
                .estimateGas({ from: this.userAccount });
            
            const tx = await this.contracts.timeCapsule.methods
                .createCapsule(parseInt(avatarId), unlockDate, cid)
                .send({
                    from: this.userAccount,
                    gas: Math.floor(gasEstimate * 1.2)
                });
            
            const unlockDateFormatted = new Date(unlockDate * 1000).toLocaleString('pt-BR');
            
            this.showMessage('capsule', 'success', 
                `✅ Cápsula criada para Avatar #${avatarId}!<br>
                ⏰ Desbloqueio: ${unlockDateFormatted}<br>
                <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" rel="noopener" style="color: #00ff88;">Ver transação</a>`
            );
            
            this.addTransaction('capsule', `Cápsula criada (Avatar #${avatarId})`, tx.transactionHash);
            document.getElementById('capsule-cid').value = '';
            
        } catch (error) {
            console.error('❌ Erro ao criar cápsula:', error);
            this.showMessage('capsule', 'error', '❌ Erro ao criar cápsula: ' + this.parseError(error));
        }
    }

    async checkCapsule() {
        const avatarId = document.getElementById('capsule-avatar-id')?.value;
        const cid = document.getElementById('capsule-cid')?.value.trim();
        
        if (!avatarId || !cid) {
            this.showMessage('capsule', 'error', '❌ Informe Avatar ID e CID para verificar!');
            return;
        }
        
        try {
            this.showMessage('capsule', 'loading', '🔄 Verificando cápsula...');
            
            const capsuleId = this.web3.utils.keccak256(
                this.web3.utils.encodePacked(avatarId, cid)
            );
            
            const capsule = await this.contracts.timeCapsule.methods.capsules(capsuleId).call();
            
            if (capsule.avatarId == 0) {
                this.showMessage('capsule', 'error', '❌ Cápsula não encontrada!');
                return;
            }
            
            const unlockDate = new Date(parseInt(capsule.unlockDate) * 1000);
            const now = new Date();
            const isUnlocked = now >= unlockDate;
            
            this.showMessage('capsule', 'success', 
                `📦 Cápsula encontrada!<br>
                🎭 Avatar: #${capsule.avatarId}<br>
                📅 Desbloqueio: ${unlockDate.toLocaleString('pt-BR')}<br>
                ${isUnlocked ? '🔓 Disponível para desbloqueio!' : '🔒 Ainda bloqueada'}<br>
                📁 CID: ${capsule.cid}`
            );
            
        } catch (error) {
            console.error('❌ Erro ao verificar cápsula:', error);
            this.showMessage('capsule', 'error', '❌ Erro ao verificar cápsula: ' + this.parseError(error));
        }
    }

    async createDigitalLegacy() {
        if (!this.validateConnection()) return;
        
        const avatarId = document.getElementById('legacy-avatar-id')?.value;
        const cid = document.getElementById('legacy-cid')?.value.trim();
        const rules = document.getElementById('legacy-rules')?.value.trim();
        
        if (!avatarId || !cid || !rules) {
            this.showMessage('legacy', 'error', '❌ Preencha todos os campos!');
            return;
        }
        
        try {
            this.showMessage('legacy', 'loading', '🔄 Criando legado digital...');
            
            const gasEstimate = await this.contracts.digitalLegacy.methods
                .createLegacy(parseInt(avatarId), cid, rules)
                .estimateGas({ from: this.userAccount });
            
            const tx = await this.contracts.digitalLegacy.methods
                .createLegacy(parseInt(avatarId), cid, rules)
                .send({
                    from: this.userAccount,
                    gas: Math.floor(gasEstimate * 1.2)
                });
            
            this.showMessage('legacy', 'success', 
                `✅ Legado digital criado para Avatar #${avatarId}!<br>
                <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" rel="noopener" style="color: #00ff88;">Ver transação</a>`
            );
            
            this.addTransaction('legacy', `Legado criado (Avatar #${avatarId})`, tx.transactionHash);
            document.getElementById('legacy-cid').value = '';
            document.getElementById('legacy-rules').value = '';
            
        } catch (error) {
            console.error('❌ Erro ao criar legado:', error);
            this.showMessage('legacy', 'error', '❌ Erro ao criar legado: ' + this.parseError(error));
        }
    }

    async checkLegacy() {
        const avatarId = document.getElementById('legacy-avatar-id')?.value;
        const cid = document.getElementById('legacy-cid')?.value.trim();
        
        if (!avatarId || !cid) {
            this.showMessage('legacy', 'error', '❌ Informe Avatar ID e CID para verificar!');
            return;
        }
        
        try {
            this.showMessage('legacy', 'loading', '🔄 Verificando legado...');
            
            const legacyId = this.web3.utils.keccak256(
                this.web3.utils.encodePacked(avatarId, cid)
            );
            
            const legacy = await this.contracts.digitalLegacy.methods.legacies(legacyId).call();
            
            if (legacy.avatarId == 0) {
                this.showMessage('legacy', 'error', '❌ Legado não encontrado!');
                return;
            }
            
            this.showMessage('legacy', 'success', 
                `🏛️ Legado encontrado!<br>
                🎭 Avatar: #${legacy.avatarId}<br>
                📁 CID: ${legacy.cid}<br>
                📋 Regras: ${legacy.rules.substring(0, 100)}...<br>
                ${legacy.unlocked ? '🔓 Desbloqueado' : '🔒 Bloqueado'}`
            );
            
        } catch (error) {
            console.error('❌ Erro ao verificar legado:', error);
            this.showMessage('legacy', 'error', '❌ Erro ao verificar legado: ' + this.parseError(error));
        }
    }

    async checkWalletLink() {
        try {
            this.showMessage('wallet', 'loading', '🔄 Verificando contrato...');
            
            // Verificar se o contrato existe
            const code = await this.web3.eth.getCode(this.CONTRACTS.AVATAR_WALLET_LINK.address);
            const contractExists = code !== '0x';
            
            if (contractExists) {
                this.showMessage('wallet', 'success', 
                    `✅ Contrato AvatarWalletLink ativo!<br>
                    📍 Endereço: ${this.CONTRACTS.AVATAR_WALLET_LINK.address}<br>
                    🔗 <a href="https://sepolia.etherscan.io/address/${this.CONTRACTS.AVATAR_WALLET_LINK.address}" target="_blank" rel="noopener" style="color: #00ff88;">Ver no Etherscan</a>`
                );
            } else {
                this.showMessage('wallet', 'error', '❌ Contrato não encontrado!');
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar wallet link:', error);
            this.showMessage('wallet', 'error', '❌ Erro ao verificar contrato: ' + this.parseError(error));
        }
    }

    // Funcionalidades auxiliares

    validateConnection() {
        if (!this.userAccount) {
            this.showMessage('system', 'error', '❌ Conecte sua carteira primeiro!');
            return false;
        }
        return true;
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        const accountElement = document.getElementById('account-info');
        const connectButton = document.getElementById('connect-wallet');
        const disconnectButton = document.getElementById('disconnect-wallet');
        
        if (this.userAccount) {
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="status-indicator status-connected"></span>
                    Conectado à Sepolia Testnet
                `;
            }
            if (accountElement) {
                accountElement.textContent = `Conta: ${this.userAccount.slice(0, 8)}...${this.userAccount.slice(-6)}`;
            }
            if (connectButton) {
                connectButton.style.display = 'none';
            }
            if (disconnectButton) {
                disconnectButton.style.display = 'inline-block';
            }
        } else {
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="status-indicator status-disconnected"></span>
                    Conecte sua carteira MetaMask para começar
                `;
            }
            if (accountElement) {
                accountElement.textContent = '';
            }
            if (connectButton) {
                connectButton.style.display = 'inline-block';
            }
            if (disconnectButton) {
                disconnectButton.style.display = 'none';
            }
        }
    }

    async loadUserData() {
        if (!this.userAccount) return;
        
        try {
            // Carregar saldo ETH
            const balance = await this.web3.eth.getBalance(this.userAccount);
            const ethBalance = this.web3.utils.fromWei(balance, 'ether');
            
            // Carregar avatares
            const avatarBalance = await this.contracts.avatarBase.methods.balanceOf(this.userAccount).call();
            
            // Atualizar interface com dados do usuário
            const balanceElement = document.getElementById('eth-balance');
            if (balanceElement) {
                balanceElement.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`;
            }
            
            const avatarBalanceElement = document.getElementById('avatar-balance');
            if (avatarBalanceElement) {
                avatarBalanceElement.textContent = `${avatarBalance} Avatar(es)`;
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    clearUserData() {
        const balanceElement = document.getElementById('eth-balance');
        if (balanceElement) balanceElement.textContent = '0.0000 ETH';
        
        const avatarBalanceElement = document.getElementById('avatar-balance');
        if (avatarBalanceElement) avatarBalanceElement.textContent = '0 Avatar(es)';
    }

    // Sistema de transações

    addTransaction(type, description, txHash) {
        const transaction = {
            id: Date.now(),
            timestamp: new Date(),
            type,
            description,
            txHash,
            account: this.userAccount
        };
        
        this.transactionHistory.unshift(transaction);
        this.transactionHistory = this.transactionHistory.slice(0, 50); // Manter apenas 50
        
        this.saveTransactionHistory();
        this.updateTransactionHistory();
    }

    saveTransactionHistory() {
        try {
            localStorage.setItem('singulai_transactions', JSON.stringify(this.transactionHistory));
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
        }
    }

    loadTransactionHistory() {
        try {
            const stored = localStorage.getItem('singulai_transactions');
            if (stored) {
                this.transactionHistory = JSON.parse(stored);
                this.updateTransactionHistory();
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            this.transactionHistory = [];
        }
    }

    updateTransactionHistory() {
        const historyElement = document.getElementById('transaction-history');
        if (!historyElement) return;
        
        if (this.transactionHistory.length === 0) {
            historyElement.innerHTML = '<p style="color: #666; text-align: center;">Nenhuma transação ainda</p>';
            return;
        }
        
        const historyHTML = this.transactionHistory
            .filter(tx => tx.account === this.userAccount)
            .slice(0, 10)
            .map(tx => `
                <div class="transaction-item">
                    <div class="tx-type">${this.getTransactionTypeIcon(tx.type)} ${tx.description}</div>
                    <div class="tx-time">${tx.timestamp.toLocaleString ? tx.timestamp.toLocaleString('pt-BR') : new Date(tx.timestamp).toLocaleString('pt-BR')}</div>
                    ${tx.txHash ? `<div class="tx-hash"><a href="https://sepolia.etherscan.io/tx/${tx.txHash}" target="_blank" rel="noopener">${tx.txHash.slice(0, 10)}...</a></div>` : ''}
                </div>
            `).join('');
        
        historyElement.innerHTML = historyHTML;
    }

    getTransactionTypeIcon(type) {
        const icons = {
            avatar: '🎭',
            capsule: '⏰',
            legacy: '🏛️',
            wallet: '💼',
            connection: '🔗'
        };
        return icons[type] || '📝';
    }

    clearTransactionHistory() {
        this.transactionHistory = [];
        this.saveTransactionHistory();
        this.updateTransactionHistory();
        this.showMessage('system', 'success', '🗑️ Histórico limpo!');
    }

    async refreshAllData() {
        if (!this.userAccount) return;
        
        this.showMessage('system', 'loading', '🔄 Atualizando dados...');
        
        try {
            await this.loadUserData();
            this.updateTransactionHistory();
            this.showMessage('system', 'success', '✅ Dados atualizados!');
        } catch (error) {
            this.showMessage('system', 'error', '❌ Erro ao atualizar: ' + error.message);
        }
    }

    // Atualizações periódicas
    startPeriodicUpdates() {
        setInterval(() => {
            if (this.userAccount && this.isInitialized) {
                this.loadUserData();
            }
        }, 30000); // A cada 30 segundos
    }

    // Event handlers
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.disconnectWallet();
        } else if (accounts[0] !== this.userAccount) {
            this.userAccount = accounts[0];
            this.updateConnectionStatus();
            this.loadUserData();
            this.updateTransactionHistory();
            console.log('👤 Conta alterada para:', this.userAccount);
        }
    }

    handleChainChanged(chainId) {
        console.log('🔄 Rede alterada para:', chainId);
        if (chainId !== this.SEPOLIA_CONFIG.chainId) {
            this.showMessage('system', 'error', '❌ Por favor, conecte-se à rede Sepolia!');
        }
        setTimeout(() => location.reload(), 1000);
    }

    // Utilitários
    showMessage(section, type, message) {
        const messageElement = document.getElementById(`${section}-message`);
        if (!messageElement) return;
        
        messageElement.className = `message ${type}`;
        messageElement.innerHTML = message;
        messageElement.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.style.display === 'block') {
                    messageElement.style.display = 'none';
                }
            }, 8000);
        }
    }

    parseError(error) {
        if (error.message) {
            if (error.message.includes('User denied')) {
                return 'Transação cancelada pelo usuário';
            }
            if (error.message.includes('insufficient funds')) {
                return 'Saldo insuficiente para gas';
            }
            if (error.message.includes('execution reverted')) {
                return 'Erro na execução do contrato';
            }
            return error.message;
        }
        return error.toString();
    }

    // Utilitários públicos
    async checkNextId() {
        try {
            this.showMessage('avatar', 'loading', '🔄 Verificando próximo ID...');
            const nextId = await this.contracts.avatarBase.methods.nextId().call();
            this.showMessage('avatar', 'success', `🔢 Próximo ID de avatar: ${nextId}`);
        } catch (error) {
            console.error('❌ Erro ao verificar ID:', error);
            this.showMessage('avatar', 'error', '❌ Erro ao verificar ID: ' + this.parseError(error));
        }
    }
}

// Instanciar e inicializar quando a página carregar
let singulaiApp;

document.addEventListener('DOMContentLoaded', async () => {
    singulaiApp = new SingulAIApp();
    await singulaiApp.init();
});

// Expor globalmente para debugging
window.SingulAI = singulaiApp;