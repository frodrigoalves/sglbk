// SingulAI Minimal - Clean Neural Interface v1.0
// Minimalist design with neural-inspired interactions

class SingulAIMinimal {
    constructor() {
        this.web3 = null;
        this.userAccount = null;
        this.contracts = {};
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
        console.log('⚡ Initializing SingulAI Minimal Interface...');
        
        try {
            await this.checkWeb3();
            this.setupEventListeners();
            await this.updateConnectionStatus();
            this.initNeuralEffects();
            
            console.log('✅ SingulAI Minimal Interface ready');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showNotification('Interface initialization failed', 'error');
        }
    }

    // Web3 Connection Management
    async checkWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            return true;
        } else {
            throw new Error('MetaMask extension required. Please install MetaMask to continue.');
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
                
                this.showNotification('Wallet connected successfully', 'success');
                console.log('✅ Connected:', this.userAccount);
            }
        } catch (error) {
            console.error('❌ Connection error:', error);
            this.showNotification('Failed to connect wallet', 'error');
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
            console.error('❌ Network addition error:', error);
        }
    }

    async initContracts() {
        for (const [name, config] of Object.entries(this.contractConfigs)) {
            this.contracts[name] = new this.web3.eth.Contract(config.abi, config.address);
        }
        console.log('✅ Smart contracts initialized');
    }

    async updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        const accountInfo = document.getElementById('account-info');
        const connectBtn = document.getElementById('connect-wallet');

        if (this.isConnected && this.userAccount) {
            indicator.classList.add('connected');
            text.textContent = 'Connected to Sepolia';
            accountInfo.textContent = `${this.userAccount.substring(0, 8)}...${this.userAccount.substring(36)}`;
            connectBtn.textContent = 'Connected';
            connectBtn.disabled = true;
        } else {
            indicator.classList.remove('connected');
            text.textContent = 'Not Connected';
            accountInfo.textContent = '';
            connectBtn.textContent = 'Connect MetaMask';
            connectBtn.disabled = false;
        }
    }

    // Avatar Management
    async createAvatar() {
        if (!this.validateConnection()) return;

        const attrs = document.getElementById('avatar-attrs').value;
        if (!attrs.trim()) {
            this.showNotification('Please describe your avatar attributes', 'error');
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

            this.showResult('avatar', `
                <div class="result-success">
                    <h4>Avatar Created Successfully</h4>
                    <p><strong>Avatar ID:</strong> #${avatarId}</p>
                    <p><strong>Attributes:</strong> ${attrs}</p>
                    <p><strong>Transaction:</strong> ${tx.transactionHash}</p>
                </div>
            `);

            document.getElementById('avatar-attrs').value = '';
            
        } catch (error) {
            console.error('❌ Avatar creation error:', error);
            this.showError('avatar', `Avatar creation failed: ${error.message}`);
        } finally {
            this.showLoading('avatar', false);
        }
    }

    async checkNextAvatarId() {
        if (!this.validateConnection()) return;

        try {
            const contract = this.contracts.AVATAR_BASE;
            const nextId = await contract.methods.nextId().call();
            
            this.showNotification(`Next available ID: #${nextId}`, 'info');
        } catch (error) {
            console.error('❌ ID check error:', error);
            this.showNotification('Failed to check next ID', 'error');
        }
    }

    // Time Capsule Management
    async createTimeCapsule() {
        if (!this.validateConnection()) return;

        const avatarId = document.getElementById('capsule-avatar-id').value;
        const hours = document.getElementById('capsule-hours').value;
        const cid = document.getElementById('capsule-cid').value;

        if (!avatarId || !hours || !cid) {
            this.showNotification('Please fill all required fields', 'error');
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

            this.showResult('capsule', `
                <div class="result-success">
                    <h4>Time Capsule Created</h4>
                    <p><strong>Avatar ID:</strong> #${avatarId}</p>
                    <p><strong>Unlock Date:</strong> ${new Date(unlockDate * 1000).toLocaleString()}</p>
                    <p><strong>Content CID:</strong> ${cid}</p>
                    <p><strong>Transaction:</strong> ${tx.transactionHash}</p>
                </div>
            `);

            document.getElementById('capsule-cid').value = '';

        } catch (error) {
            console.error('❌ Time capsule error:', error);
            this.showError('capsule', `Time capsule creation failed: ${error.message}`);
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
            this.showNotification('Please fill all required fields', 'error');
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

            this.showResult('legacy', `
                <div class="result-success">
                    <h4>Digital Legacy Established</h4>
                    <p><strong>Avatar ID:</strong> #${avatarId}</p>
                    <p><strong>Content CID:</strong> ${cid}</p>
                    <p><strong>Rules:</strong> ${rules.substring(0, 100)}${rules.length > 100 ? '...' : ''}</p>
                    <p><strong>Transaction:</strong> ${tx.transactionHash}</p>
                </div>
            `);

            document.getElementById('legacy-cid').value = '';
            document.getElementById('legacy-rules').value = '';

        } catch (error) {
            console.error('❌ Digital legacy error:', error);
            this.showError('legacy', `Digital legacy creation failed: ${error.message}`);
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
            
            const isLinked = await contract.methods.isLinked(this.userAccount).call();
            
            if (isLinked) {
                const avatarId = await contract.methods.getLinkedAvatar(this.userAccount).call();
                
                this.showResult('wallet', `
                    <div class="result-success">
                        <h4>Wallet is Linked</h4>
                        <p><strong>Connected Avatar ID:</strong> #${avatarId}</p>
                        <p><strong>Address:</strong> ${this.userAccount}</p>
                        <p><strong>Status:</strong> Active</p>
                    </div>
                `);
            } else {
                this.showResult('wallet', `
                    <div class="result-info">
                        <h4>Wallet Not Linked</h4>
                        <p>This wallet is not currently linked to any avatar.</p>
                        <p>Create an avatar to establish the connection.</p>
                    </div>
                `);
            }

        } catch (error) {
            console.error('❌ Wallet link check error:', error);
            this.showError('wallet', `Wallet link check failed: ${error.message}`);
        } finally {
            this.showLoading('wallet', false);
        }
    }

    // SGL Token Balance Check
    async checkSGLBalance() {
        if (!this.userAccount) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        try {
            // Simulate SGL Token balance
            const mockBalance = (Math.random() * 5000 + 1000).toFixed(2);
            const ethBalance = await this.web3.eth.getBalance(this.userAccount);
            const ethFormatted = this.web3.utils.fromWei(ethBalance, 'ether');

            this.showNeuralModal({
                sglBalance: mockBalance,
                ethBalance: parseFloat(ethFormatted).toFixed(4),
                address: this.userAccount,
                network: 'Sepolia Testnet'
            });

        } catch (error) {
            console.error('❌ SGL balance error:', error);
            this.showNotification('Failed to check SGL Token balance', 'error');
        }
    }

    showNeuralModal(balanceInfo) {
        const modal = document.createElement('div');
        modal.className = 'neural-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div class="neural-icon">
                            <div class="icon-token-balance"></div>
                        </div>
                        <h3>SGL Token Dashboard</h3>
                        <button class="modal-close" onclick="this.closest('.neural-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="balance-grid">
                            <div class="balance-item">
                                <span class="balance-label">SGL Balance</span>
                                <span class="balance-value">${balanceInfo.sglBalance} SGL</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">ETH Balance</span>
                                <span class="balance-value">${balanceInfo.ethBalance} ETH</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Network</span>
                                <span class="balance-value">${balanceInfo.network}</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Address</span>
                                <span class="balance-value">${balanceInfo.address.substring(0, 10)}...${balanceInfo.address.substring(32)}</span>
                            </div>
                        </div>
                        <div class="modal-note">
                            <em>SGL balance simulated for MVP demonstration</em>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Modal styles
        const style = document.createElement('style');
        style.textContent = `
            .neural-modal {
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
                -webkit-backdrop-filter: blur(10px);
                backdrop-filter: blur(10px);
            }
            .modal-content {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                box-shadow: var(--shadow-subtle);
            }
            .modal-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }
            .neural-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-header h3 {
                color: var(--text-primary);
                font-size: 1.25rem;
                font-weight: 600;
                flex: 1;
            }
            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            .balance-grid {
                display: grid;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .balance-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .balance-item:last-child {
                border-bottom: none;
            }
            .balance-label {
                color: var(--text-secondary);
                font-weight: 500;
                font-size: 0.875rem;
            }
            .balance-value {
                color: var(--text-primary);
                font-weight: 600;
                font-family: 'SF Mono', Consolas, monospace;
                font-size: 0.875rem;
            }
            .modal-note {
                text-align: center;
                font-size: 0.8rem;
                color: var(--text-muted);
                font-style: italic;
            }
        `;
        modal.appendChild(style);
        document.body.appendChild(modal);
    }

    // UI Helper Methods
    validateConnection() {
        if (!this.isConnected || !this.userAccount) {
            this.showNotification('Please connect your wallet first', 'error');
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
        notification.className = `neural-notification notification-${type}`;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .neural-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                -webkit-backdrop-filter: blur(10px);
                backdrop-filter: blur(10px);
                box-shadow: var(--shadow-subtle);
                animation: slideInRight 0.3s ease-out;
                font-size: 0.875rem;
                max-width: 300px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .notification-success { 
                background: rgba(16, 185, 129, 0.9); 
                border-color: rgba(16, 185, 129, 0.3);
            }
            .notification-error { 
                background: rgba(239, 68, 68, 0.9); 
                border-color: rgba(239, 68, 68, 0.3);
            }
            .notification-info { 
                background: rgba(59, 130, 246, 0.9); 
                border-color: rgba(59, 130, 246, 0.3);
            }
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
        }, 4000);
    }

    initNeuralEffects() {
        // Add subtle neural pulse effects to connected indicators
        const neuralElements = document.querySelectorAll('.neural-dot, .avatar-core');
        neuralElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.1)';
            });
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
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

        console.log('✅ Event listeners configured');
    }
}

// Initialize the application
let singulaiMinimal;

document.addEventListener('DOMContentLoaded', async () => {
    singulaiMinimal = new SingulAIMinimal();
    await singulaiMinimal.init();
});

// Global access
window.SingulAIMinimal = singulaiMinimal;