// SingulAI MVP Dashboard - JavaScript

class SingulAIDashboard {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.contractAddresses = {};
        
        // ABIs simplificados
        this.contractABIs = {
            avatarBase: [
                {
                    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "string", "name": "attrs", "type": "string"}],
                    "name": "mint",
                    "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ],
            mockToken: [
                {
                    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "name",
                    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
                    "name": "transfer",
                    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ]
        };
        
        this.init();
    }

    async init() {
        await this.loadContractAddresses();
        this.setupEventListeners();
        this.initializeNavigation();
        await this.checkWallet();
    }

    async loadContractAddresses() {
        try {
            const response = await fetch('./contract-addresses.json');
            this.contractAddresses = await response.json();
            console.log('Contract addresses loaded:', this.contractAddresses);
        } catch (error) {
            console.error('Erro ao carregar endereços dos contratos:', error);
        }
    }

    setupEventListeners() {
        // Botões de conexão
        document.getElementById('connect-wallet-btn').addEventListener('click', () => this.connectWallet());
        document.getElementById('disconnect-wallet-btn').addEventListener('click', () => this.disconnectWallet());
        document.getElementById('change-wallet-btn').addEventListener('click', () => this.changeWallet());
        
        // Botões de ação
        document.getElementById('mint-avatar-btn').addEventListener('click', () => this.mintAvatar());
        document.getElementById('create-capsule-btn').addEventListener('click', () => this.createTimeCapsule());
        document.getElementById('create-legacy-btn').addEventListener('click', () => this.createLegacy());
        
        // Monitorar mudanças de conta no MetaMask
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.account = accounts[0];
                    this.updateWalletInfo();
                    this.updateTokenBalance();
                }
            });
        }
    }

    initializeNavigation() {
        // Configurar navegação das tabs
        const navLinks = document.querySelectorAll('.nav-pills .nav-link');
        const tabPanes = document.querySelectorAll('.tab-pane');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover classes ativas
                navLinks.forEach(l => l.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('show', 'active'));
                
                // Adicionar classe ativa ao link clicado
                link.classList.add('active');
                
                // Mostrar tab correspondente
                const target = link.getAttribute('data-bs-target');
                const targetPane = document.querySelector(target);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
            });
        });
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                // Requisitar acesso à conta
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                this.web3 = new Web3(window.ethereum);
                this.account = accounts[0];
                
                await this.initializeContracts();
                this.updateWalletInfo();
                await this.updateTokenBalance();
                
                console.log('Wallet conectada:', this.account);
                this.showNotification('Carteira conectada com sucesso!', 'success');
                
            } else {
                this.showNotification('MetaMask não encontrado. Por favor, instale o MetaMask.', 'error');
            }
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            this.showNotification('Erro ao conectar carteira: ' + error.message, 'error');
        }
    }

    async changeWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                // Solicitar mudança de conta
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{
                        eth_accounts: {}
                    }]
                });
                
                // Reconectar com nova conta
                await this.connectWallet();
                this.showNotification('Carteira alterada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao alterar carteira:', error);
            this.showNotification('Erro ao alterar carteira: ' + error.message, 'error');
        }
    }

    disconnectWallet() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.updateWalletInfo();
        this.showNotification('Carteira desconectada', 'info');
    }

    async initializeContracts() {
        if (!this.web3 || !this.contractAddresses) return;
        
        try {
            this.contracts.avatarBase = new this.web3.eth.Contract(
                this.contractABIs.avatarBase,
                this.contractAddresses.avatarBase
            );
            
            this.contracts.mockToken = new this.web3.eth.Contract(
                this.contractABIs.mockToken,
                this.contractAddresses.mockToken
            );
            
            console.log('Contratos inicializados');
        } catch (error) {
            console.error('Erro ao inicializar contratos:', error);
        }
    }

    updateWalletInfo() {
        const walletInfoDiv = document.getElementById('wallet-info');
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        const changeBtn = document.getElementById('change-wallet-btn');
        
        if (this.account) {
            walletInfoDiv.innerHTML = `
                <div class="connected-wallet">
                    <i class="fas fa-wallet me-2"></i>
                    <strong>Conectado:</strong> ${this.account.substring(0, 8)}...${this.account.substring(36)}
                </div>
            `;
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-block';
            changeBtn.style.display = 'inline-block';
        } else {
            walletInfoDiv.innerHTML = `
                <div class="disconnected-wallet">
                    <i class="fas fa-wallet me-2"></i>
                    <span>Carteira não conectada</span>
                </div>
            `;
            connectBtn.style.display = 'inline-block';
            disconnectBtn.style.display = 'none';
            changeBtn.style.display = 'none';
        }
    }

    async updateTokenBalance() {
        if (!this.account || !this.contracts.mockToken) return;
        
        try {
            const balance = await this.contracts.mockToken.methods.balanceOf(this.account).call();
            const balanceFormatted = this.web3.utils.fromWei(balance, 'ether');
            
            const tokenInfo = document.getElementById('token-info');
            tokenInfo.innerHTML = `
                <div class="token-balance">
                    <i class="fas fa-coins me-2"></i>
                    <strong>Saldo tSGL:</strong> ${parseFloat(balanceFormatted).toFixed(2)}
                </div>
            `;
        } catch (error) {
            console.error('Erro ao buscar saldo do token:', error);
        }
    }

    async checkWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.web3 = new Web3(window.ethereum);
                    this.account = accounts[0];
                    await this.initializeContracts();
                    this.updateWalletInfo();
                    await this.updateTokenBalance();
                }
            } catch (error) {
                console.error('Erro ao verificar carteira:', error);
            }
        }
    }

    async mintAvatar() {
        if (!this.account || !this.contracts.avatarBase) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        try {
            const attributes = document.getElementById('avatar-attributes').value;
            if (!attributes.trim()) {
                this.showNotification('Digite os atributos do avatar', 'error');
                return;
            }

            this.showNotification('Criando avatar...', 'info');
            
            const tx = await this.contracts.avatarBase.methods
                .mint(this.account, attributes)
                .send({ from: this.account });

            this.showNotification('Avatar criado com sucesso!', 'success');
            this.addToHistory('Avatar criado', `Atributos: ${attributes}`);
            document.getElementById('avatar-attributes').value = '';
            
        } catch (error) {
            console.error('Erro ao criar avatar:', error);
            this.showNotification('Erro ao criar avatar: ' + error.message, 'error');
        }
    }

    async createTimeCapsule() {
        if (!this.account) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        const content = document.getElementById('capsule-content').value;
        const unlockTime = document.getElementById('unlock-time').value;
        
        if (!content.trim() || !unlockTime) {
            this.showNotification('Preencha o conteúdo e data de desbloqueio', 'error');
            return;
        }

        this.showNotification('Criando cápsula do tempo...', 'info');
        
        // Simular criação da cápsula
        setTimeout(() => {
            this.showNotification('Cápsula do tempo criada!', 'success');
            this.addToHistory('Cápsula criada', `Desbloqueio: ${unlockTime}`);
            document.getElementById('capsule-content').value = '';
            document.getElementById('unlock-time').value = '';
        }, 2000);
    }

    async createLegacy() {
        if (!this.account) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        const beneficiary = document.getElementById('legacy-beneficiary').value;
        const content = document.getElementById('legacy-content').value;
        
        if (!beneficiary.trim() || !content.trim()) {
            this.showNotification('Preencha o beneficiário e conteúdo', 'error');
            return;
        }

        this.showNotification('Criando legado digital...', 'info');
        
        // Simular criação do legado
        setTimeout(() => {
            this.showNotification('Legado digital criado!', 'success');
            this.addToHistory('Legado criado', `Beneficiário: ${beneficiary.substring(0, 8)}...`);
            document.getElementById('legacy-beneficiary').value = '';
            document.getElementById('legacy-content').value = '';
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    addToHistory(action, details) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const historyItem = document.createElement('div');
        historyItem.className = 'alert alert-light';
        historyItem.innerHTML = `
            <div class="d-flex justify-content-between">
                <div>
                    <strong>${action}</strong><br>
                    <small class="text-muted">${details}</small>
                </div>
                <small class="text-muted">${new Date().toLocaleString()}</small>
            </div>
        `;
        
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Manter apenas os últimos 10 itens
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SingulAIDashboard();
});