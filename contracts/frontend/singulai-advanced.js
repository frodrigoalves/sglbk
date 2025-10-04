// SingulAI MVP - Sistema Completo REAL
// Versão de produção conectada com VPS Hostinger

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
                address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
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
                address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
                abi: [
                    "function createCapsule(uint256 avatarId, uint256 unlockDate, string memory cid) external",
                    "function capsules(bytes32 id) public view returns (uint256 avatarId, uint256 unlockDate, string cid, bool unlocked)",
                    "function unlockIfReady(uint256 avatarId, string memory cid) external",
                    "event CapsuleCreated(bytes32 indexed id, uint256 avatarId, uint256 unlockDate, string cid)",
                    "event CapsuleUnlocked(bytes32 indexed id, uint256 avatarId, string cid)"
                ]
            },
            DIGITAL_LEGACY: {
                address: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
                abi: [
                    "function createLegacy(uint256 avatarId, string memory cid, string memory rules) external",
                    "function legacies(bytes32 id) public view returns (uint256 avatarId, string cid, string rules, bool unlocked)",
                    "function unlockLegacy(bytes32 id) external",
                    "event LegacyCreated(bytes32 indexed id, uint256 avatarId, string cid, string rules)",
                    "event LegacyUnlocked(bytes32 indexed id, uint256 avatarId)"
                ]
            },
            AVATAR_WALLET_LINK: {
                address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
                abi: []
            },
            MOCK_TOKEN: {
                address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
                abi: [
                    "function balanceOf(address account) external view returns (uint256)",
                    "function transfer(address to, uint256 amount) external returns (bool)",
                    "function decimals() external view returns (uint8)"
                ]
            }
        };

        // *** CONFIGURAÇÃO VPS REAL - HOSTINGER ***
        this.VPS_CONFIG = {
            ip: '72.60.147.56',
            hostname: 'srv993737.hstgr.cloud',
            baseUrl: 'http://72.60.147.56',
            endpoints: {
                backend: ':3000/api',
                ollama: ':11434/api/chat',
                chatwoot: ':3001', 
                health: ':3000/api/health',
                docker: ':2376'
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
        // Botões principais - Comentados para evitar conflito com singulai-complete.html
        // document.getElementById('connect-wallet')?.addEventListener('click', () => this.connectWallet());
        // document.getElementById('disconnect-wallet')?.addEventListener('click', () => this.disconnectWallet());
        
        // Avatar Base - Comentados para evitar conflito com singulai-complete.html
        // document.getElementById('mint-avatar')?.addEventListener('click', () => this.mintAvatar());
        document.getElementById('check-next-id')?.addEventListener('click', () => this.checkNextId());
        document.getElementById('check-my-avatars')?.addEventListener('click', () => this.checkMyAvatars());
        
        // Time Capsule - Comentados para evitar conflito com singulai-complete.html
        // document.getElementById('create-capsule')?.addEventListener('click', () => this.createTimeCapsule());
        document.getElementById('check-capsule')?.addEventListener('click', () => this.checkCapsule());
        
        // Digital Legacy - Comentados para evitar conflito com singulai-complete.html
        // document.getElementById('create-legacy')?.addEventListener('click', () => this.createDigitalLegacy());
        document.getElementById('check-legacy')?.addEventListener('click', () => this.checkLegacy());
        
        // Wallet Link - Comentados para evitar conflito com singulai-complete.html
        // document.getElementById('check-wallet-link')?.addEventListener('click', () => this.checkWalletLink());
        
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> Desbloqueio: ${unlockDateFormatted}<br>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="10" r="3"/><path d="M7 19.5a6 6 0 0 1 10 0"/></svg> Avatar: #${capsule.avatarId}<br>
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
                `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg> Legado encontrado!<br>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="10" r="3"/><path d="M7 19.5a6 6 0 0 1 10 0"/></svg> Avatar: #${legacy.avatarId}<br>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> CID: ${legacy.cid}<br>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" style="display:inline;margin-right:4px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Regras: ${legacy.rules.substring(0, 100)}...<br>
                ${legacy.unlocked ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="1.5" style="display:inline;margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Desbloqueado' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="1.5" style="display:inline;margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Bloqueado'}`
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
            avatar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="10" r="3"/><path d="M7 19.5a6 6 0 0 1 10 0"/></svg>',
            capsule: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
            legacy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
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

    // ===== WALLET CONNECTION METHODS =====
    async connectWallet() {
        try {
            this.showMessage('connection', 'loading', '🔄 Conectando à MetaMask...');

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAccount = accounts[0];

            // Ensure correct network
            await this.ensureCorrectNetwork();

            // Update UI
            this.updateConnectionStatus();
            this.loadUserData();
            this.refreshHeaderData();

            this.showMessage('connection', 'success', '✅ Carteira conectada com sucesso!');

            // Update header if UX improvements are loaded
            if (window.uxImprovements && window.uxImprovements.updateHeaderStatus) {
                window.uxImprovements.updateHeaderStatus(true, this.userAccount);
            }

        } catch (error) {
            console.error('❌ Erro ao conectar carteira:', error);
            if (error.code === 4001) {
                this.showMessage('connection', 'error', '❌ Conexão cancelada pelo usuário');
            } else {
                this.showMessage('connection', 'error', '❌ Erro ao conectar: ' + this.parseError(error));
            }

            // Update header status
            if (window.uxImprovements && window.uxImprovements.updateHeaderStatus) {
                window.uxImprovements.updateHeaderStatus(false);
            }
        }
    }

    async disconnectWallet() {
        this.userAccount = null;
        this.updateConnectionStatus();

        // Clear transaction history
        this.clearTransactionHistory();

        this.showMessage('connection', 'info', '🔌 Carteira desconectada');

        // Update header
        if (window.uxImprovements && window.uxImprovements.updateHeaderStatus) {
            window.uxImprovements.updateHeaderStatus(false);
        }
    }

    async updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        const accountElement = document.getElementById('account-info');
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');

        if (!statusElement) return;

        if (this.userAccount) {
            // Connected
            statusElement.innerHTML = `
                <span class="status-indicator status-connected"></span>
                Conectado à Sepolia
            `;
            accountElement.innerHTML = `
                <strong>Conta:</strong> ${this.userAccount.slice(0, 6)}...${this.userAccount.slice(-4)}<br>
                <small style="color: #888;">Clique para copiar</small>
            `;
            accountElement.style.cursor = 'pointer';
            accountElement.onclick = () => this.copyToClipboard(this.userAccount);

            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-block';

            // Update header
            if (window.uxImprovements && window.uxImprovements.updateHeaderStatus) {
                window.uxImprovements.updateHeaderStatus(true, this.userAccount);
            }
        } else {
            // Disconnected
            statusElement.innerHTML = `
                <span class="status-indicator status-disconnected"></span>
                Conecte sua carteira MetaMask
            `;
            accountElement.innerHTML = '';
            connectBtn.style.display = 'inline-block';
            disconnectBtn.style.display = 'none';

            // Update header
            if (window.uxImprovements && window.uxImprovements.updateHeaderStatus) {
                window.uxImprovements.updateHeaderStatus(false);
            }
        }
    }

    validateConnection() {
        if (!this.userAccount) {
            this.showMessage('system', 'error', '❌ Conecte sua carteira MetaMask primeiro!');
            return false;
        }
        return true;
    }

    // ===== HEADER INTEGRATION =====
    updateHeaderBalance() {
        // This will be updated when SGL token is implemented
        // For now, show placeholder
        const balance = '--'; // Will be replaced with actual SGL balance

        if (window.uxImprovements && window.uxImprovements.updateHeaderBalance) {
            window.uxImprovements.updateHeaderBalance(balance);
        }
    }

    // Call this when wallet connects or balance changes
    refreshHeaderData() {
        this.updateHeaderBalance();
    }

    // Utilitários
    showMessage(section, type, message) {
        // Use new UX improvements for better feedback
        if (window.uxImprovements) {
            if (type === 'loading') {
                window.showLoading(message.replace('🔄 ', ''));
            } else if (type === 'success') {
                window.hideLoading();
                window.showToast(message.replace('✅ ', ''), 'success');
            } else if (type === 'error') {
                window.hideLoading();
                window.showToast(message.replace('❌ ', ''), 'error');
            } else {
                window.showToast(message, 'info');
            }
        }

        // Fallback to original implementation
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

// === ENHANCED PROFESSIONAL CHAT SYSTEM ===
class ProfessionalChatSystem {
    constructor() {
        this.isInitialized = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.characterLimit = 4000;
        this.apiEndpoint = 'http://72.60.147.56:3000/api/chat';
        this.ollmaEndpoint = 'http://72.60.147.56:11434/api/generate';
        
        // Avatar system
        this.selectedAvatar = null;
        this.avatarConfig = {
            leticia: {
                name: 'Letícia',
                color: '#E91E63',
                specialty: 'Especialista em Criatividade',
                description: 'Criativa e emocional, focada em momentos especiais'
            },
            pedro: {
                name: 'Pedro', 
                color: '#2196F3',
                specialty: 'Especialista Técnico',
                description: 'Focado em blockchain e aspectos técnicos'
            },
            laura: {
                name: 'Laura',
                color: '#4CAF50', 
                specialty: 'Especialista em Legado',
                description: 'Especializada em herança digital e planejamento'
            }
        };
        
        // Initialize after DOM content is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.elements = {
            container: document.querySelector('.chat-container-enhanced'),
            messages: document.querySelector('.chat-messages-enhanced'),
            textarea: document.querySelector('.chat-textarea-enhanced'),
            sendBtn: document.querySelector('.send-btn-enhanced'),
            attachBtn: document.querySelector('.attachment-btn-enhanced'),
            charCount: document.querySelector('.character-count-enhanced'),
            typingIndicator: document.querySelector('.typing-indicator-enhanced'),
            statusIndicator: document.querySelector('.status-indicator-enhanced')
        };
        
        if (!this.elements.container) {
            console.log('💬 Chat container not found, skipping chat initialization');
            return;
        }
        
        this.bindEvents();
        this.initAvatarSelector();
        this.loadChatHistory();
        this.checkAPIStatus();
        this.isInitialized = true;
        
        console.log('💬 Professional Chat System initialized');
    }
    
    bindEvents() {
        // Textarea events
        this.elements.textarea?.addEventListener('input', (e) => this.handleTextareaInput(e));
        this.elements.textarea?.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.elements.textarea?.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Send button
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Attachment button
        this.elements.attachBtn?.addEventListener('click', () => this.handleAttachment());
        
        // Auto-resize textarea
        this.elements.textarea?.addEventListener('input', () => this.autoResizeTextarea());
    }
    
    handleTextareaInput(e) {
        const text = e.target.value;
        const length = text.length;
        
        // Update character count
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${length}/${this.characterLimit}`;
        }
        
        // Enable/disable send button
        const canSend = text.trim().length > 0 && length <= this.characterLimit && !this.isTyping;
        if (this.elements.sendBtn) {
            this.elements.sendBtn.disabled = !canSend;
        }
        
        // Show warning if approaching limit
        if (length > this.characterLimit * 0.9) {
            this.elements.charCount?.classList.add('text-warning');
        } else {
            this.elements.charCount?.classList.remove('text-warning');
        }
    }
    
    handleKeyDown(e) {
        // Send on Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        }
        
        // Tab for formatting (optional future enhancement)
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            e.target.value = value.substring(0, start) + '    ' + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
    }
    
    handlePaste(e) {
        setTimeout(() => {
            this.handleTextareaInput(e);
            this.autoResizeTextarea();
        }, 0);
    }
    
    autoResizeTextarea() {
        if (!this.elements.textarea) return;
        
        this.elements.textarea.style.height = 'auto';
        const scrollHeight = this.elements.textarea.scrollHeight;
        const maxHeight = 120; // Match CSS max-height
        
        this.elements.textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
    
    async sendMessage() {
        const text = this.elements.textarea?.value?.trim();
        if (!text || this.isTyping) return;
        
        // Add user message
        this.addMessage('user', text);
        
        // Clear textarea
        if (this.elements.textarea) {
            this.elements.textarea.value = '';
            this.elements.textarea.style.height = 'auto';
        }
        
        // Update UI
        this.updateCharacterCount(0);
        this.elements.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to API
            const response = await this.callChatAPI(text);
            this.hideTypingIndicator();
            this.addMessage('ai', response);
        } catch (error) {
            console.error('💬 Chat API Error:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.');
        }
    }
    
    async callChatAPI(message) {
        // Try local backend first, then fallback to VPS
        const endpoints = [this.apiEndpoint, this.ollmaEndpoint];
        
        for (const endpoint of endpoints) {
            try {
                // Create timeout controller
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        avatar: this.selectedAvatar,
                        history: this.messageHistory.slice(-10) // Last 10 messages for context
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data.response || data.message || 'Resposta vazia do servidor.';
                
            } catch (error) {
                console.warn(`Failed to connect to ${endpoint}:`, error.message);
                if (error.name === 'AbortError') {
                    console.warn('Request timed out for', endpoint);
                }
                continue;
            }
        }
        
        // All endpoints failed
        throw new Error('Todos os serviços de chat estão indisponíveis no momento.');
    }
    
    addMessage(sender, text) {
        if (!this.elements.messages) return;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Store in history
        this.messageHistory.push({ sender, text, timestamp });
        
        // Create message element
        const messageGroup = document.createElement('div');
        messageGroup.classList.add('message-group', `${sender}-message`);
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar', `${sender}-avatar`);
        
        if (sender === 'ai') {
            avatar.innerHTML = '🤖';
        } else {
            const userInitial = 'U'; // Could be dynamic based on user data
            avatar.textContent = userInitial;
        }
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.innerHTML = this.formatMessageText(text);
        
        const messageTimestamp = document.createElement('div');
        messageTimestamp.classList.add('message-timestamp');
        messageTimestamp.textContent = timestamp;
        
        content.appendChild(messageText);
        content.appendChild(messageTimestamp);
        
        messageGroup.appendChild(avatar);
        messageGroup.appendChild(content);
        
        this.elements.messages.appendChild(messageGroup);
        this.scrollToBottom();
        
        // Save to localStorage
        this.saveChatHistory();
    }
    
    formatMessageText(text) {
        // Basic markdown-like formatting
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.classList.add('show');
        }
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.classList.remove('show');
        }
    }
    
    scrollToBottom() {
        if (this.elements.messages) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    }
    
    updateCharacterCount(length) {
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${length}/${this.characterLimit}`;
        }
    }
    
    async checkAPIStatus() {
        try {
            const response = await fetch(this.apiEndpoint + '/health', { timeout: 5000 });
            if (response.ok) {
                this.updateStatusIndicator('online');
            } else {
                this.updateStatusIndicator('offline');
            }
        } catch (error) {
            this.updateStatusIndicator('offline');
        }
    }
    
    updateStatusIndicator(status) {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = `status-indicator-enhanced ${status}`;
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('singulai_chat_history');
            if (saved) {
                this.messageHistory = JSON.parse(saved);
                this.renderChatHistory();
            }
        } catch (error) {
            console.warn('💬 Failed to load chat history:', error);
        }
    }
    
    saveChatHistory() {
        try {
            // Keep only last 50 messages
            const toSave = this.messageHistory.slice(-50);
            localStorage.setItem('singulai_chat_history', JSON.stringify(toSave));
        } catch (error) {
            console.warn('💬 Failed to save chat history:', error);
        }
    }
    
    renderChatHistory() {
        if (!this.elements.messages) return;
        
        this.elements.messages.innerHTML = '';
        
        this.messageHistory.forEach(msg => {
            this.addMessageToDOM(msg.sender, msg.text, msg.timestamp);
        });
        
        this.scrollToBottom();
    }
    
    addMessageToDOM(sender, text, timestamp) {
        if (!this.elements.messages) return;
        
        const messageGroup = document.createElement('div');
        messageGroup.classList.add('message-group', `${sender}-message`);
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar', `${sender}-avatar`);
        
        if (sender === 'ai') {
            avatar.innerHTML = '🤖';
        } else {
            avatar.textContent = 'U';
        }
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.innerHTML = this.formatMessageText(text);
        
        const messageTimestamp = document.createElement('div');
        messageTimestamp.classList.add('message-timestamp');
        messageTimestamp.textContent = timestamp;
        
        content.appendChild(messageText);
        content.appendChild(messageTimestamp);
        
        messageGroup.appendChild(avatar);
        messageGroup.appendChild(content);
        
        this.elements.messages.appendChild(messageGroup);
    }
    
    handleAttachment() {
        // Future enhancement: file upload functionality
        console.log('💬 Attachment feature coming soon');
    }
    
    clearChat() {
        this.messageHistory = [];
        if (this.elements.messages) {
            this.elements.messages.innerHTML = '';
        }
        localStorage.removeItem('singulai_chat_history');
    }
    
    // === AVATAR SELECTION SYSTEM ===
    initAvatarSelector() {
        // Show avatar selector on first visit
        if (!localStorage.getItem('singulai_selected_avatar')) {
            this.showAvatarSelector();
        } else {
            this.selectedAvatar = localStorage.getItem('singulai_selected_avatar');
            this.updateChatHeader();
        }
        
        // Bind avatar card events
        document.querySelectorAll('.avatar-card').forEach(card => {
            card.addEventListener('click', () => this.selectAvatar(card.dataset.avatar));
        });
        
        // Global functions for buttons
        window.hideAvatarSelector = () => this.hideAvatarSelector();
        window.confirmAvatarSelection = () => this.confirmAvatarSelection();
        window.showAvatarSelector = () => this.showAvatarSelector();
    }
    
    showAvatarSelector() {
        const panel = document.getElementById('avatarSelectorPanel');
        if (panel) {
            panel.classList.add('show');
        }
    }
    
    hideAvatarSelector() {
        const panel = document.getElementById('avatarSelectorPanel');
        if (panel) {
            panel.classList.remove('show');
        }
    }
    
    selectAvatar(avatarKey) {
        // Remove previous selection
        document.querySelectorAll('.avatar-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-avatar="${avatarKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedAvatar = avatarKey;
            
            // Enable confirm button
            const confirmBtn = document.getElementById('confirmAvatarBtn');
            if (confirmBtn) {
                confirmBtn.disabled = false;
            }
        }
    }
    
    confirmAvatarSelection() {
        if (!this.selectedAvatar) return;
        
        // Save selection
        localStorage.setItem('singulai_selected_avatar', this.selectedAvatar);
        
        // Update chat header
        this.updateChatHeader();
        
        // Hide selector
        this.hideAvatarSelector();
        
        // Add welcome message from selected avatar
        this.addWelcomeMessage();
    }
    
    updateChatHeader() {
        if (!this.selectedAvatar) return;
        
        const config = this.avatarConfig[this.selectedAvatar];
        
        // Update elements with IDs (new)
        const titleElementById = document.getElementById('current-avatar-name');
        const statusElementById = document.getElementById('current-avatar-status');
        
        if (titleElementById) {
            titleElementById.textContent = `${config.name} - SingulAI`;
        }
        
        if (statusElementById) {
            statusElementById.textContent = `Online • ${config.specialty}`;
        }
        
        // Update elements with classes (fallback)
        const titleElement = document.querySelector('.chat-title-enhanced');
        const statusElement = document.querySelector('.status-text');
        
        if (titleElement) {
            titleElement.textContent = `${config.name} - SingulAI`;
        }
        
        if (statusElement) {
            statusElement.textContent = `Online • ${config.specialty}`;
        }
        
        // Update header color
        const headerElement = document.querySelector('.chat-header-enhanced');
        if (headerElement) {
            headerElement.style.borderColor = config.color;
        }
    }
    
    addWelcomeMessage() {
        if (!this.selectedAvatar) return;
        
        const config = this.avatarConfig[this.selectedAvatar];
        const welcomeMessages = {
            leticia: `Olá! Sou a ${config.name}, sua assistente criativa! 💖 Estou aqui para ajudar você a criar mensagens emocionais e momentos especiais no seu legado digital.`,
            pedro: `Oi! Eu sou o ${config.name}, especialista técnico da SingulAI. Posso ajudá-lo com blockchain, smart contracts e todos os aspectos técnicos da plataforma.`,
            laura: `Olá! Sou a ${config.name}, especialista em legado digital. Estou aqui para orientá-lo sobre herança digital e planejamento familiar.`
        };
        
        if (welcomeMessages[this.selectedAvatar]) {
            setTimeout(() => {
                this.addMessage('ai', welcomeMessages[this.selectedAvatar]);
            }, 1000);
        }
    }
    
    // Override sendMessage to include avatar selection
    async sendMessage() {
        if (!this.selectedAvatar) {
            this.showAvatarSelector();
            return;
        }
        
        const text = this.elements.textarea?.value?.trim();
        if (!text || this.isTyping) return;
        
        // Add user message
        this.addMessage('user', text);
        
        // Clear textarea
        if (this.elements.textarea) {
            this.elements.textarea.value = '';
            this.elements.textarea.style.height = 'auto';
        }
        
        // Update UI
        this.updateCharacterCount(0);
        this.elements.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to API with avatar selection
            const response = await this.callChatAPI(text);
            this.hideTypingIndicator();
            this.addMessage('ai', response);
        } catch (error) {
            console.error('Chat API Error:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.');
        }
    }
}

// === MODAL AND NOTIFICATION SYSTEM ===
class ModalNotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadNotifications();
        this.updateNotificationBadge();
    }
    
    bindEvents() {
        // Notification bell
        const notificationBell = document.getElementById('notification-bell');
        const notificationModal = document.getElementById('notification-modal');
        const notificationModalClose = document.getElementById('notification-modal-close');
        const modalOverlay = document.getElementById('modal-overlay');
        
        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsModalClose = document.getElementById('settings-modal-close');
        const settingsCancel = document.getElementById('settings-cancel');
        
        // Help modal
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const helpModalClose = document.getElementById('help-modal-close');
        
        // Notification events
        notificationBell?.addEventListener('click', () => this.openNotificationModal());
        notificationModalClose?.addEventListener('click', () => this.closeNotificationModal());
        
        // Settings events
        settingsBtn?.addEventListener('click', () => this.openSettingsModal());
        settingsModalClose?.addEventListener('click', () => this.closeSettingsModal());
        settingsCancel?.addEventListener('click', () => this.closeSettingsModal());
        
        // Help events
        helpBtn?.addEventListener('click', () => this.openHelpModal());
        helpModalClose?.addEventListener('click', () => this.closeHelpModal());
        
        // Overlay events
        modalOverlay?.addEventListener('click', () => this.closeAllModals());
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.app-sidebar');
        
        mobileMenuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
            modalOverlay?.classList.toggle('open');
        });
    }
    
    openNotificationModal() {
        const modal = document.getElementById('notification-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.add('open');
        overlay?.classList.add('open');
        
        // Mark notifications as read
        this.markAllAsRead();
        this.updateNotificationBadge();
        
        document.body.style.overflow = 'hidden';
    }
    
    closeNotificationModal() {
        const modal = document.getElementById('notification-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.remove('open');
        overlay?.classList.remove('open');
        
        document.body.style.overflow = '';
    }
    
    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.add('open');
        overlay?.classList.add('open');
        
        document.body.style.overflow = 'hidden';
    }
    
    closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.remove('open');
        overlay?.classList.remove('open');
        
        document.body.style.overflow = '';
    }
    
    openHelpModal() {
        const modal = document.getElementById('help-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.add('open');
        overlay?.classList.add('open');
        
        document.body.style.overflow = '';
    }
    
    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        const overlay = document.getElementById('modal-overlay');
        
        modal?.classList.remove('open');
        overlay?.classList.remove('open');
        
        document.body.style.overflow = '';
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('.notification-modal, .sliding-modal');
        const overlay = document.getElementById('modal-overlay');
        const sidebar = document.querySelector('.app-sidebar');
        
        modals.forEach(modal => modal?.classList.remove('open'));
        overlay?.classList.remove('open');
        sidebar?.classList.remove('open');
        
        document.body.style.overflow = '';
    }
    
    addNotification(type, title, message) {
        const notification = {
            id: Date.now(),
            type: type, // success, info, warning, error
            title: title,
            message: message,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.unreadCount++;
        
        this.updateNotificationBadge();
        this.saveNotifications();
        
        // Show toast notification
        this.showToast(notification);
        
        return notification.id;
    }
    
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.unreadCount = 0;
        this.saveNotifications();
    }
    
    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    showToast(notification) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${this.getIconSVG(notification.type)}
                </div>
                <div class="toast-text">
                    <p class="toast-title">${notification.title}</p>
                    <p class="toast-message">${notification.message}</p>
                </div>
                <button class="toast-close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
    
    getIconSVG(type) {
        const icons = {
            success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
            info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };
        return icons[type] || icons.info;
    }
    
    loadNotifications() {
        try {
            const saved = localStorage.getItem('singulai_notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.unreadCount = this.notifications.filter(n => !n.read).length;
            }
        } catch (error) {
            console.warn('Failed to load notifications:', error);
        }
    }
    
    saveNotifications() {
        try {
            // Keep only last 50 notifications
            const toSave = this.notifications.slice(0, 50);
            localStorage.setItem('singulai_notifications', JSON.stringify(toSave));
        } catch (error) {
            console.warn('Failed to save notifications:', error);
        }
    }
}

// === ENHANCED NAVIGATION SYSTEM ===
class NavigationSystem {
    constructor() {
        this.currentPage = 'dashboard';
        this.disabledPages = ['analytics', 'transactions', 'inheritance'];
        this.init();
    }
    
    init() {
        this.bindNavigation();
        this.updateActiveStates();
    }
    
    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const page = link.getAttribute('data-page');
                
                // Check if page is disabled
                if (link.classList.contains('disabled')) {
                    modalSystem.addNotification('info', 'Funcionalidade em desenvolvimento', 
                        'Esta funcionalidade estará disponível em breve.');
                    return;
                }
                
                this.navigateToPage(page);
            });
        });
    }
    
    navigateToPage(page) {
        if (this.disabledPages.includes(page)) {
            modalSystem.addNotification('warning', 'Funcionalidade não disponível', 
                'Esta funcionalidade ainda não foi implementada.');
            return;
        }
        
        // Hide all pages
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => p.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Update breadcrumb
            const breadcrumb = document.getElementById('current-page');
            if (breadcrumb) {
                breadcrumb.textContent = this.getPageTitle(page);
            }
            
            // Update active nav link
            this.updateActiveStates();
        }
    }
    
    updateActiveStates() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    getPageTitle(page) {
        const titles = {
            'dashboard': 'Dashboard',
            'chat': 'Avatar Ético',
            'wallet': 'Carteira',
            'avatars': 'Meus Avatares',
            'create-avatar': 'Criar Avatar',
            'time-capsules': 'Cápsulas do Tempo',
            'digital-legacy': 'Meu Legado',
            'inheritance': 'Herança',
            'analytics': 'Analytics',
            'transactions': 'Transações'
        };
        return titles[page] || 'SingulAI';
    }
}

// Instanciar e inicializar quando a página carregar
let singulaiApp;
let professionalChat;
let modalSystem;
let navigationSystem;

// Global app object for HTML functions
window.app = {
    showAvatarSelector: () => {
        if (professionalChat) {
            professionalChat.showAvatarSelector();
        }
    },
    showChatSettings: () => {
        if (modalSystem) {
            modalSystem.openSettingsModal();  
        }
    },
    hideAvatarSelector: () => {
        if (professionalChat) {
            professionalChat.hideAvatarSelector();
        }
    },
    confirmAvatarSelection: () => {
        if (professionalChat) {
            professionalChat.confirmAvatarSelection();
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize core systems
    modalSystem = new ModalNotificationSystem();
    navigationSystem = new NavigationSystem();
    
    // Initialize SingulAI app
    singulaiApp = new SingulAIApp();
    await singulaiApp.init();
    
    // Initialize professional chat system
    professionalChat = new ProfessionalChatSystem();
    
    // Initialize functional buttons
    initializeFunctionalButtons();
    
    // Initialize real VPS connection
    await initializeVPSConnection();
    
async function initializeVPSConnection() {
        console.log('🌐 Conectando com VPS Hostinger (72.60.147.56)...');
        try {
            // Testar backend primeiro
            const backendHealth = await fetch(`http://72.60.147.56:3000/api/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (backendHealth.ok) {
                console.log('✅ Backend VPS conectado!');
                
                // Testar Ollama
                try {
                    const ollamaCheck = await fetch(`http://72.60.147.56:11434/api/tags`);
                    if (ollamaCheck.ok) {
                        console.log('✅ Ollama VPS conectado!');
                        console.log('✅ VPS Hostinger CONECTADA - Todos os serviços funcionando!');
                    }
                } catch (ollamaError) {
                    console.log('⚠️ Ollama não detectado, mas backend funciona');
                }
                
                return true;
            } else {
                throw new Error('Backend VPS indisponível');
            }
        } catch (error) {
            console.error('❌ Erro VPS:', error);
            console.error('❌ VPS Offline: ' + error.message);
            return false;
        }
    }
});

// === FUNCTIONAL BUTTONS INITIALIZATION ===
function initializeFunctionalButtons() {
    // Avatar creation button
    const createAvatarBtn = document.getElementById('create-avatar-btn');
    createAvatarBtn?.addEventListener('click', () => {
        if (singulaiApp && singulaiApp.web3 && singulaiApp.account) {
            navigationSystem.navigateToPage('create-avatar');
            modalSystem.addNotification('info', 'Funcionalidade Ativa', 
                'Você será direcionado para a criação de avatar.');
        } else {
            modalSystem.addNotification('warning', 'Conecte sua carteira', 
                'Você precisa conectar o MetaMask para criar avatares.');
        }
    });
    
    // View avatars button
    const viewAvatarsBtn = document.getElementById('view-my-avatars-btn');
    viewAvatarsBtn?.addEventListener('click', () => {
        if (singulaiApp && singulaiApp.web3 && singulaiApp.account) {
            navigationSystem.navigateToPage('avatars');
            modalSystem.addNotification('info', 'Carregando Avatares', 
                'Buscando seus avatares na blockchain...');
        } else {
            modalSystem.addNotification('warning', 'Conecte sua carteira', 
                'Você precisa conectar o MetaMask para ver seus avatares.');
        }
    });
    
    // Create time capsule button
    const createCapsuleBtn = document.getElementById('create-capsule-btn');
    createCapsuleBtn?.addEventListener('click', () => {
        if (singulaiApp && singulaiApp.web3 && singulaiApp.account) {
            navigationSystem.navigateToPage('time-capsules');
            modalSystem.addNotification('info', 'Funcionalidade Ativa', 
                'Você pode criar uma nova cápsula do tempo.');
        } else {
            modalSystem.addNotification('warning', 'Conecte sua carteira', 
                'Você precisa conectar o MetaMask para criar cápsulas do tempo.');
        }
    });
    
    // Digital legacy button
    const digitalLegacyBtn = document.getElementById('setup-legacy-btn');
    digitalLegacyBtn?.addEventListener('click', () => {
        if (singulaiApp && singulaiApp.web3 && singulaiApp.account) {
            navigationSystem.navigateToPage('digital-legacy');
            modalSystem.addNotification('info', 'Funcionalidade Ativa', 
                'Configure seu legado digital.');
        } else {
            modalSystem.addNotification('warning', 'Conecte sua carteira', 
                'Você precisa conectar o MetaMask para configurar seu legado digital.');
        }
    });
    
    // Chat IA button
    const chatBtn = document.getElementById('open-chat-btn');
    chatBtn?.addEventListener('click', () => {
        navigationSystem.navigateToPage('chat');
        modalSystem.addNotification('info', 'Chat IA Ativo', 
            'Converse com o assistente inteligente da SingulAI.');
    });
    
    // Connect wallet button
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    connectWalletBtn?.addEventListener('click', async () => {
        if (singulaiApp) {
            modalSystem.addNotification('info', 'Conectando carteira', 
                'Aguarde enquanto conectamos com o MetaMask...');
            
            try {
                await singulaiApp.connectWallet();
                modalSystem.addNotification('success', 'Carteira conectada', 
                    'MetaMask conectado com sucesso!');
            } catch (error) {
                modalSystem.addNotification('error', 'Erro na conexão', 
                    'Não foi possível conectar com o MetaMask. Verifique se está instalado.');
            }
        }
    });
    
    // Disconnect wallet button
    const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
    disconnectWalletBtn?.addEventListener('click', () => {
        if (singulaiApp) {
            singulaiApp.disconnectWallet();
            modalSystem.addNotification('info', 'Carteira desconectada', 
                'MetaMask foi desconectado com sucesso.');
        }
    });
    
    // Disabled buttons - show coming soon message
    const disabledButtons = [
        'import-avatar-btn',
        'view-capsules-btn',
        'manage-beneficiaries-btn'
    ];
    
    disabledButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        button?.addEventListener('click', () => {
            modalSystem.addNotification('info', 'Em desenvolvimento', 
                'Esta funcionalidade estará disponível em breve.');
        });
    });
    
    // Stats refresh buttons
    const refreshButtons = document.querySelectorAll('[id*="refresh"]');
    refreshButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                button.style.transform = '';
            }, 500);
            
            modalSystem.addNotification('info', 'Atualizando dados', 
                'Buscando informações mais recentes...');
        });
    });
}

// === ENHANCED WALLET CONNECTION FEEDBACK ===
function updateWalletUI(connected, account = null) {
    const walletIndicator = document.getElementById('wallet-indicator');
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-wallet-btn');
    
    if (connected && account) {
        // Update indicator
        if (walletIndicator) {
            const statusDot = walletIndicator.querySelector('.status-dot');
            const statusText = walletIndicator.querySelector('span:last-child');
            
            statusDot?.classList.remove('disconnected');
            statusDot?.classList.add('connected');
            
            if (statusText) {
                statusText.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
            }
        }
        
        // Update buttons
        if (connectBtn) connectBtn.style.display = 'none';
        if (disconnectBtn) disconnectBtn.style.display = 'block';
        
        // Enable functional buttons
        const functionalButtons = [
            'create-avatar-btn',
            'view-my-avatars-btn',
            'create-capsule-btn',
            'setup-legacy-btn'
        ];
        
        functionalButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button?.classList.remove('disabled');
        });
        
    } else {
        // Update indicator
        if (walletIndicator) {
            const statusDot = walletIndicator.querySelector('.status-dot');
            const statusText = walletIndicator.querySelector('span:last-child');
            
            statusDot?.classList.remove('connected');
            statusDot?.classList.add('disconnected');
            
            if (statusText) {
                statusText.textContent = 'Desconectado';
            }
        }
        
        // Update buttons
        if (connectBtn) connectBtn.style.display = 'block';
        if (disconnectBtn) disconnectBtn.style.display = 'none';
        
        // Disable functional buttons
        const functionalButtons = [
            'create-avatar-btn',
            'view-my-avatars-btn',
            'create-capsule-btn',
            'setup-legacy-btn'
        ];
        
        functionalButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button?.classList.add('disabled');
        });
    }
}

// Expor globalmente para debugging
window.SingulAI = singulaiApp;
window.ProfessionalChat = professionalChat;
window.ModalSystem = modalSystem;
window.NavigationSystem = navigationSystem;
window.updateWalletUI = updateWalletUI;
