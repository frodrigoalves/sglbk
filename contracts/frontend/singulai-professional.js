// SingulAI MVP - Sistema Profissional v3.0
// Dashboard UX/UI de Alta Performance

class SingulAIProfessional {
    constructor() {
        this.web3 = null;
        this.userAccount = null;
        this.contracts = {};
        this.transactionHistory = [];
        this.isConnected = false;
        this.networkId = 11155111; // Sepolia
        
        // Contract configurations
        this.contractConfigs = {
            AVATAR_BASE: {
                address: '0x388D16b79fAff27A45F714838F029BC34aC60c48',
                abi: [
                    "function mint(address to, string memory attrs) external returns (uint256 tokenId)",
                    "function nextId() public view returns (uint256)",
                    "function balanceOf(address owner) public view returns (uint256)",
                    "function ownerOf(uint256 tokenId) public view returns (address)",
                    "function attributes(uint256 tokenId) public view returns (string)"
                ]
            },
            TIME_CAPSULE: {
                address: '0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93',
                abi: [
                    "function createCapsule(uint256 avatarId, uint256 unlockDate, string memory cid) external",
                    "function capsules(bytes32 id) public view returns (uint256 avatarId, uint256 unlockDate, string cid, bool unlocked)",
                    "event CapsuleCreated(bytes32 indexed id, uint256 avatarId, uint256 unlockDate, string cid)"
                ]
            },
            DIGITAL_LEGACY: {
                address: '0x91E67E1592e66C347C3f615d71927c05a1951057',
                abi: [
                    "function createLegacy(uint256 avatarId, string memory cid, string memory rules) external",
                    "function legacies(bytes32 id) public view returns (uint256 avatarId, string cid, string rules, bool unlocked)",
                    "event LegacyCreated(bytes32 indexed id, uint256 avatarId, string cid, string rules)"
                ]
            },
            AVATAR_WALLET_LINK: {
                address: '0x803DE61049d1b192828A46e5952645C3f5b352B0',
                abi: [
                    "function linkWallet(uint256 avatarId) external",
                    "function getLinkedAvatar(address wallet) external view returns (uint256)",
                    "function isLinked(address wallet) external view returns (bool)"
                ]
            }
        };
    }

    async init() {
        console.log('🚀 Inicializando SingulAI Professional Dashboard...');
        
        try {
            await this.checkWeb3();
            this.setupEventListeners();
            this.loadTransactionHistory();
            await this.updateConnectionStatus();
            this.startAnimations();
            
            console.log('✅ SingulAI Professional Dashboard inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showNotification('Erro na inicialização do dashboard', 'error');
        }
    }

    // Web3 and Connection Management
    async checkWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            console.log('✅ MetaMask detectado');
            return true;
        } else {
            throw new Error('MetaMask não encontrado. Por favor, instale a extensão MetaMask.');
        }
    }

    async connectWallet() {
        try {
            this.showLoading('connection', true);
            
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0) {
                this.userAccount = accounts[0];
                this.isConnected = true;
                
                await this.checkNetwork();
                await this.initContracts();
                await this.updateConnectionStatus();
                
                this.showNotification('Carteira conectada com sucesso!', 'success');
                console.log('✅ Carteira conectada:', this.userAccount);
            }
        } catch (error) {
            console.error('❌ Erro ao conectar carteira:', error);
            this.showNotification('Erro ao conectar carteira', 'error');
        } finally {
            this.showLoading('connection', false);
        }
    }

    async checkNetwork() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        
        if (currentChainId !== this.networkId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // Sepolia
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await this.addSepoliaNetwork();
                }
            }
        }
    }

    async addSepoliaNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    nativeCurrency: {
                        name: 'SepoliaETH',
                        symbol: 'SepoliaETH',
                        decimals: 18
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io/']
                }]
            });
        } catch (error) {
            console.error('❌ Erro ao adicionar rede Sepolia:', error);
        }
    }

    async initContracts() {
        for (const [name, config] of Object.entries(this.contractConfigs)) {
            this.contracts[name] = new this.web3.eth.Contract(config.abi, config.address);
        }
        console.log('✅ Contratos inicializados');
    }

    async updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        const accountInfo = document.getElementById('account-info');
        const connectBtn = document.getElementById('connect-wallet');

        if (this.isConnected && this.userAccount) {
            indicator.classList.add('connected');
            text.textContent = 'Conectado à Sepolia Testnet';
            accountInfo.textContent = `Endereço: ${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}`;
            connectBtn.textContent = 'Conectado ✅';
            connectBtn.disabled = true;
        } else {
            indicator.classList.remove('connected');
            text.textContent = 'Não conectado';
            accountInfo.textContent = '';
            connectBtn.textContent = 'Conectar MetaMask';
            connectBtn.disabled = false;
        }
    }

    // Avatar Management
    async createAvatar() {
        if (!this.validateConnection()) return;

        const attrs = document.getElementById('avatar-attrs').value;
        if (!attrs.trim()) {
            this.showNotification('Por favor, descreva os atributos do avatar', 'error');
            return;
        }

        try {
            this.showLoading('avatar', true);
            this.hideResults('avatar');

            const contract = this.contracts.AVATAR_BASE;
            const gasEstimate = await contract.methods.mint(this.userAccount, attrs).estimateGas({
                from: this.userAccount
            });

            const tx = await contract.methods.mint(this.userAccount, attrs).send({
                from: this.userAccount,
                gas: Math.floor(gasEstimate * 1.2)
            });

            const nextId = await contract.methods.nextId().call();
            const avatarId = parseInt(nextId) - 1;

            this.addTransaction({
                type: 'Avatar Creation',
                hash: tx.transactionHash,
                avatarId: avatarId,
                timestamp: new Date().toISOString()
            });

            this.showResult('avatar', `
                <div class="success-message">
                    <h4>Avatar criado com sucesso! 🎉</h4>
                    <p><strong>ID do Avatar:</strong> #${avatarId}</p>
                    <p><strong>Atributos:</strong> ${attrs}</p>
                    <p><strong>Hash da Transação:</strong></p>
                    <code>${tx.transactionHash}</code>
                </div>
            `);

            // Clear form
            document.getElementById('avatar-attrs').value = '';
            
            // Update avatar previews
            this.updateAvatarPreviews(avatarId, attrs);
            
        } catch (error) {
            console.error('❌ Erro ao criar avatar:', error);
            this.showError('avatar', `Erro ao criar avatar: ${error.message}`);
        } finally {
            this.showLoading('avatar', false);
        }
    }

    async checkNextAvatarId() {
        if (!this.validateConnection()) return;

        try {
            const contract = this.contracts.AVATAR_BASE;
            const nextId = await contract.methods.nextId().call();
            
            this.showNotification(`Próximo ID disponível: #${nextId}`, 'info');
        } catch (error) {
            console.error('❌ Erro ao verificar próximo ID:', error);
            this.showNotification('Erro ao verificar próximo ID', 'error');
        }
    }

    // Time Capsule Management
    async createTimeCapsule() {
        if (!this.validateConnection()) return;

        const avatarId = document.getElementById('capsule-avatar-id').value;
        const hours = document.getElementById('capsule-hours').value;
        const cid = document.getElementById('capsule-cid').value;

        if (!avatarId || !hours || !cid) {
            this.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            this.showLoading('capsule', true);
            this.hideResults('capsule');

            const unlockDate = Math.floor(Date.now() / 1000) + (parseInt(hours) * 3600);
            const contract = this.contracts.TIME_CAPSULE;

            const gasEstimate = await contract.methods.createCapsule(avatarId, unlockDate, cid).estimateGas({
                from: this.userAccount
            });

            const tx = await contract.methods.createCapsule(avatarId, unlockDate, cid).send({
                from: this.userAccount,
                gas: Math.floor(gasEstimate * 1.2)
            });

            this.addTransaction({
                type: 'Time Capsule',
                hash: tx.transactionHash,
                avatarId: avatarId,
                unlockDate: new Date(unlockDate * 1000).toLocaleString(),
                timestamp: new Date().toISOString()
            });

            this.showResult('capsule', `
                <div class="success-message">
                    <h4>Cápsula temporal criada! ⏳</h4>
                    <p><strong>Avatar ID:</strong> #${avatarId}</p>
                    <p><strong>Desbloqueio:</strong> ${new Date(unlockDate * 1000).toLocaleString()}</p>
                    <p><strong>Conteúdo CID:</strong> ${cid}</p>
                    <p><strong>Hash da Transação:</strong></p>
                    <code>${tx.transactionHash}</code>
                </div>
            `);

            // Clear form
            document.getElementById('capsule-cid').value = '';

        } catch (error) {
            console.error('❌ Erro ao criar cápsula temporal:', error);
            this.showError('capsule', `Erro ao criar cápsula: ${error.message}`);
        } finally {
            this.showLoading('capsule', false);
        }
    }

    // Digital Legacy Management
    async createDigitalLegacy() {
        if (!this.validateConnection()) return;

        const avatarId = document.getElementById('legacy-avatar-id').value;
        const cid = document.getElementById('legacy-cid').value;
        const rules = document.getElementById('legacy-rules').value;

        if (!avatarId || !cid || !rules) {
            this.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            this.showLoading('legacy', true);
            this.hideResults('legacy');

            const contract = this.contracts.DIGITAL_LEGACY;

            const gasEstimate = await contract.methods.createLegacy(avatarId, cid, rules).estimateGas({
                from: this.userAccount
            });

            const tx = await contract.methods.createLegacy(avatarId, cid, rules).send({
                from: this.userAccount,
                gas: Math.floor(gasEstimate * 1.2)
            });

            this.addTransaction({
                type: 'Digital Legacy',
                hash: tx.transactionHash,
                avatarId: avatarId,
                timestamp: new Date().toISOString()
            });

            this.showResult('legacy', `
                <div class="success-message">
                    <h4>Legado digital estabelecido! 🏛️</h4>
                    <p><strong>Avatar ID:</strong> #${avatarId}</p>
                    <p><strong>Conteúdo CID:</strong> ${cid}</p>
                    <p><strong>Regras:</strong> ${rules.substring(0, 100)}...</p>
                    <p><strong>Hash da Transação:</strong></p>
                    <code>${tx.transactionHash}</code>
                </div>
            `);

            // Clear form
            document.getElementById('legacy-cid').value = '';
            document.getElementById('legacy-rules').value = '';

        } catch (error) {
            console.error('❌ Erro ao criar legado digital:', error);
            this.showError('legacy', `Erro ao criar legado: ${error.message}`);
        } finally {
            this.showLoading('legacy', false);
        }
    }

    // Wallet Link Management
    async checkWalletLink() {
        if (!this.validateConnection()) return;

        try {
            this.showLoading('wallet', true);
            this.hideResults('wallet');

            const contract = this.contracts.AVATAR_WALLET_LINK;
            
            // Check if wallet is linked
            const isLinked = await contract.methods.isLinked(this.userAccount).call();
            
            if (isLinked) {
                const avatarId = await contract.methods.getLinkedAvatar(this.userAccount).call();
                
                this.showResult('wallet', `
                    <div class="success-message">
                        <h4>Carteira vinculada! 🔗</h4>
                        <p><strong>Avatar ID vinculado:</strong> #${avatarId}</p>
                        <p><strong>Endereço:</strong> ${this.userAccount}</p>
                        <p><strong>Status:</strong> Ativo ✅</p>
                    </div>
                `);
            } else {
                this.showResult('wallet', `
                    <div class="info-message">
                        <h4>Carteira não vinculada</h4>
                        <p>Esta carteira ainda não está vinculada a nenhum avatar.</p>
                        <p>Crie um avatar primeiro para estabelecer a vinculação.</p>
                    </div>
                `);
            }

        } catch (error) {
            console.error('❌ Erro ao verificar vinculação:', error);
            this.showError('wallet', `Erro ao verificar vinculação: ${error.message}`);
        } finally {
            this.showLoading('wallet', false);
        }
    }

    // SGL Token Balance Check
    async checkSGLBalance() {
        if (!this.userAccount) {
            this.showNotification('Por favor, conecte sua carteira primeiro', 'error');
            return;
        }

        try {
            // Simulate SGL Token balance (for demo purposes)
            const mockBalance = (Math.random() * 5000 + 1000).toFixed(2);
            const ethBalance = await this.web3.eth.getBalance(this.userAccount);
            const ethFormatted = this.web3.utils.fromWei(ethBalance, 'ether');

            this.showSGLModal({
                sglBalance: mockBalance,
                ethBalance: parseFloat(ethFormatted).toFixed(4),
                address: this.userAccount,
                network: 'Sepolia Testnet'
            });

        } catch (error) {
            console.error('❌ Erro ao verificar saldo SGL:', error);
            this.showNotification('Erro ao verificar saldo SGL Token', 'error');
        }
    }

    showSGLModal(balanceInfo) {
        const modal = document.createElement('div');
        modal.className = 'sgl-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>💰 SGL Token Dashboard</h3>
                        <button class="modal-close" onclick="this.closest('.sgl-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="balance-card">
                            <div class="balance-item">
                                <span class="balance-label">Saldo SGL</span>
                                <span class="balance-value">${balanceInfo.sglBalance} SGL</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Saldo ETH</span>
                                <span class="balance-value">${balanceInfo.ethBalance} ETH</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Endereço</span>
                                <span class="balance-value">${balanceInfo.address.substring(0, 10)}...${balanceInfo.address.substring(32)}</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Rede</span>
                                <span class="balance-value">${balanceInfo.network} ✅</span>
                            </div>
                        </div>
                        <div class="modal-disclaimer">
                            💡 <em>Saldo SGL simulado para demonstração do MVP</em>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .sgl-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .modal-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            .modal-content {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                box-shadow: var(--shadow-xl);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            .modal-header h3 {
                background: var(--accent-gradient);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 1.5rem;
                font-weight: 700;
            }
            .modal-close {
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 8px;
                transition: background 0.3s ease;
            }
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .balance-card {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }
            .balance-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            .balance-item:last-child {
                margin-bottom: 0;
            }
            .balance-label {
                color: var(--text-secondary);
                font-weight: 500;
            }
            .balance-value {
                color: var(--text-primary);
                font-weight: 600;
                font-family: 'SF Mono', Consolas, monospace;
            }
            .modal-disclaimer {
                text-align: center;
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.6);
                font-style: italic;
            }
        `;
        modal.appendChild(style);
        document.body.appendChild(modal);
    }

    // UI Helper Methods
    validateConnection() {
        if (!this.isConnected || !this.userAccount) {
            this.showNotification('Por favor, conecte sua carteira primeiro', 'error');
            return false;
        }
        return true;
    }

    showLoading(section, show) {
        const element = document.getElementById(`${section}-loading`);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    showResult(section, html) {
        const element = document.getElementById(`${section}-result`);
        if (element) {
            element.innerHTML = html;
            element.style.display = 'block';
        }
    }

    showError(section, message) {
        const element = document.getElementById(`${section}-error`);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    hideResults(section) {
        const result = document.getElementById(`${section}-result`);
        const error = document.getElementById(`${section}-error`);
        if (result) result.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                box-shadow: var(--shadow-lg);
                animation: slideInRight 0.3s ease-out;
            }
            .notification-success { background: rgba(16, 185, 129, 0.9); }
            .notification-error { background: rgba(239, 68, 68, 0.9); }
            .notification-info { background: rgba(59, 130, 246, 0.9); }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        notification.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateAvatarPreviews(avatarId, attrs) {
        const previews = document.querySelectorAll('.avatar-preview');
        if (previews.length > 0) {
            previews[0].textContent = `#${avatarId}`;
            previews[0].title = attrs;
        }
    }

    addTransaction(transaction) {
        this.transactionHistory.unshift(transaction);
        this.saveTransactionHistory();
    }

    saveTransactionHistory() {
        localStorage.setItem('singulai_professional_transactions', JSON.stringify(this.transactionHistory));
    }

    loadTransactionHistory() {
        const stored = localStorage.getItem('singulai_professional_transactions');
        if (stored) {
            this.transactionHistory = JSON.parse(stored);
        }
    }

    startAnimations() {
        // Add subtle animations to enhance UX
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupEventListeners() {
        // Connection
        document.getElementById('connect-wallet')?.addEventListener('click', () => this.connectWallet());

        // Avatar functions
        document.getElementById('mint-avatar')?.addEventListener('click', () => this.createAvatar());
        document.getElementById('check-next-id')?.addEventListener('click', () => this.checkNextAvatarId());

        // Time Capsule functions
        document.getElementById('create-capsule')?.addEventListener('click', () => this.createTimeCapsule());

        // Digital Legacy functions
        document.getElementById('create-legacy')?.addEventListener('click', () => this.createDigitalLegacy());

        // Wallet Link functions
        document.getElementById('check-wallet-link')?.addEventListener('click', () => this.checkWalletLink());

        // SGL Token
        document.getElementById('check-sgl-balance')?.addEventListener('click', () => this.checkSGLBalance());

        // MetaMask event listeners
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.userAccount = accounts[0] || null;
                this.isConnected = !!this.userAccount;
                this.updateConnectionStatus();
            });

            window.ethereum.on('chainChanged', () => {
                location.reload();
            });
        }

        console.log('✅ Event listeners configurados');
    }
}

// Initialize the application
let singulaiApp;

document.addEventListener('DOMContentLoaded', async () => {
    singulaiApp = new SingulAIProfessional();
    await singulaiApp.init();
});

// Global access
window.SingulAI = singulaiApp;
