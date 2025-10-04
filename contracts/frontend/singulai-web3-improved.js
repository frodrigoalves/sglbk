// SingulAI MVP - Conexão Web3 Melhorada
// Correções para problemas de conectividade e exibição de saldos

class SingulAIWebsocketConnection {
    constructor() {
        this.isConnected = false;
        this.userAccount = null;
        this.web3 = null;
        this.currentNetwork = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando SingulAI Web3 Connection...');
        
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            this.showError('MetaMask não está instalado. Por favor, instale MetaMask primeiro.');
            return;
        }

        // Check if already connected
        await this.checkExistingConnection();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup UI elements
        this.setupUI();
        
        console.log('✅ Web3 Connection inicializado');
    }

    async checkExistingConnection() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                console.log('🔄 Conexão existente encontrada, reconectando...');
                await this.connectWallet(false);
            }
        } catch (error) {
            console.log('ℹ️ Nenhuma conexão existente encontrada');
        }
    }

    setupEventListeners() {
        // Account change
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('👤 Contas alteradas:', accounts);
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else {
                this.userAccount = accounts[0];
                this.updateWalletStatus();
                this.updateWalletData();
            }
        });

        // Network change
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('🌐 Rede alterada:', chainId);
            this.currentNetwork = chainId;
            this.checkNetwork();
            if (this.isConnected) {
                this.updateWalletData();
            }
        });

        // Connection
        window.ethereum.on('connect', (connectInfo) => {
            console.log('🔗 MetaMask conectado:', connectInfo);
        });

        // Disconnection
        window.ethereum.on('disconnect', (error) => {
            console.log('❌ MetaMask desconectado:', error);
            this.disconnectWallet();
        });
    }

    setupUI() {
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        const refreshBtn = document.getElementById('refresh-wallet');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet(true));
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateWalletData());
        }
    }

    async connectWallet(requestPermission = true) {
        console.log('🔌 Conectando carteira...');
        
        try {
            let accounts;
            
            if (requestPermission) {
                // Request permission
                accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
            } else {
                // Just get existing accounts
                accounts = await window.ethereum.request({ method: 'eth_accounts' });
            }

            if (accounts.length === 0) {
                throw new Error('Nenhuma conta disponível');
            }

            // Initialize Web3
            this.web3 = new Web3(window.ethereum);
            this.userAccount = accounts[0];
            this.isConnected = true;

            // Get network info
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.currentNetwork = chainId;

            console.log('✅ Carteira conectada:', this.userAccount);
            console.log('🌐 Rede:', this.currentNetwork);

            // Check if on correct network
            await this.checkNetwork();

            // Update UI
            this.updateWalletStatus();
            await this.updateWalletData();

            this.showSuccess('Carteira conectada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao conectar carteira:', error);
            this.showError('Erro ao conectar: ' + error.message);
            this.disconnectWallet();
        }
    }

    disconnectWallet() {
        console.log('🔌 Desconectando carteira...');
        
        this.isConnected = false;
        this.userAccount = null;
        this.web3 = null;
        this.currentNetwork = null;
        
        this.updateWalletStatus();
        this.resetWalletData();
        
        this.showInfo('Carteira desconectada');
    }

    async checkNetwork() {
        const sepoliaChainId = '0xaa36a7'; // Sepolia testnet
        
        if (this.currentNetwork !== sepoliaChainId) {
            console.log('⚠️ Rede incorreta detectada');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    // Network not added to MetaMask
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: sepoliaChainId,
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }]
                        });
                    } catch (addError) {
                        this.showError('Erro ao adicionar rede Sepolia');
                    }
                } else {
                    this.showError('Por favor, mude para a rede Sepolia testnet');
                }
            }
        }
    }

    updateWalletStatus() {
        const indicator = document.getElementById('wallet-indicator');
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        
        if (!indicator) return;

        const statusDot = indicator.querySelector('.status-dot');
        const statusText = indicator.querySelector('span:last-child');
        
        if (this.isConnected && this.userAccount) {
            if (statusDot) {
                statusDot.className = 'status-dot connected';
            }
            if (statusText) {
                statusText.textContent = `${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}`;
            }
            
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
        } else {
            if (statusDot) {
                statusDot.className = 'status-dot disconnected';
            }
            if (statusText) {
                statusText.textContent = 'Desconectado';
            }
            
            if (connectBtn) connectBtn.style.display = 'inline-flex';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
        }
    }

    async updateWalletData() {
        if (!this.isConnected || !this.web3 || !this.userAccount) {
            console.log('❌ Carteira não conectada');
            return;
        }

        console.log('🔄 Atualizando dados da carteira...');

        try {
            // Show loading
            this.showLoading('Atualizando saldos...');

            // Get ETH balance
            const ethBalance = await this.web3.eth.getBalance(this.userAccount);
            const ethFormatted = this.web3.utils.fromWei(ethBalance, 'ether');
            
            console.log('💰 Saldo ETH:', ethFormatted);

            // Update ETH balance in UI
            const ethElements = [
                document.getElementById('eth-balance'),
                document.getElementById('detailed-eth-balance')
            ];

            ethElements.forEach(element => {
                if (element) {
                    element.textContent = parseFloat(ethFormatted).toFixed(4);
                }
            });

            // Get SGL token balance
            await this.updateSGLBalance();

            this.hideLoading();
            this.showSuccess('Saldos atualizados!');

        } catch (error) {
            console.error('❌ Erro ao atualizar dados:', error);
            this.hideLoading();
            this.showError('Erro ao atualizar saldos: ' + error.message);
        }
    }

    async updateSGLBalance() {
        try {
            // SGL Token contract address (Sepolia testnet - SingulAI Token)
            const tokenAddress = '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1';
            console.log('🔧 Iniciando atualização do saldo SGL...');
            console.log('📍 SGL Token Address:', tokenAddress);
            console.log('👤 User Account:', this.userAccount);
            
            // Standard ERC-20 ABI for balanceOf
            const tokenABI = [
                {
                    "inputs": [{"name": "account", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];

            const tokenContract = new this.web3.eth.Contract(tokenABI, tokenAddress);
            
            // Get balance and decimals
            const [balance, decimals] = await Promise.all([
                tokenContract.methods.balanceOf(this.userAccount).call(),
                tokenContract.methods.decimals().call()
            ]);

            const tokenBalance = balance / Math.pow(10, decimals);
            
            console.log('📊 Raw Balance:', balance);
            console.log('🔢 Decimals:', decimals);
            console.log('🪙 Saldo SGL Final:', tokenBalance);

            // Update SGL balance in UI
            const sglElements = [
                document.getElementById('sgl-balance')
            ];

            sglElements.forEach(element => {
                if (element) {
                    const formattedBalance = tokenBalance.toFixed(2);
                    element.textContent = formattedBalance;
                    console.log('✅ Updated element:', element.id, 'with value:', formattedBalance);
                } else {
                    console.warn('⚠️ Element not found: sgl-balance');
                }
            });

        } catch (error) {
            console.error('❌ Erro ao obter saldo SGL:', error);
            
            // Set default values if error
            const sglElements = [
                document.getElementById('sgl-balance')
            ];

            sglElements.forEach(element => {
                if (element) {
                    element.textContent = '0.00';
                }
            });
        }
    }

    resetWalletData() {
        // Reset ETH balance
        const ethElements = [
            document.getElementById('eth-balance'),
            document.getElementById('detailed-eth-balance')
        ];

        ethElements.forEach(element => {
            if (element) {
                element.textContent = '0.0000';
            }
        });

        // Reset SGL balance
        const sglElements = [
            document.getElementById('sgl-balance')
        ];

        sglElements.forEach(element => {
            if (element) {
                element.textContent = '0.00';
            }
        });
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showLoading(message) {
        this.showNotification(message, 'loading');
    }

    hideLoading() {
        // Remove loading notifications
        const notifications = document.querySelectorAll('.notification.loading');
        notifications.forEach(notification => {
            notification.remove();
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications of the same type
        const existing = document.querySelectorAll(`.notification.${type}`);
        existing.forEach(notification => {
            notification.remove();
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                ${type !== 'loading' ? '<button class="notification-close">&times;</button>' : ''}
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }

        // Auto remove (except loading)
        if (type !== 'loading') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, type === 'error' ? 7000 : 4000);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            loading: '⏳'
        };
        return icons[type] || 'ℹ️';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            loading: '#f59e0b'
        };
        return colors[type] || '#3b82f6';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.8;
    }

    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.singulaiWeb3 = new SingulAIWebsocketConnection();
});