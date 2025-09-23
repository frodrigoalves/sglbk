// SingulAI MVP Dashboard - Professional JavaScript

class SingulAIDashboard {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.contractAddresses = {};
        this.isConnecting = false;
        
        // ABIs completos dos contratos
        this.contractABIs = {
            avatarBase: [
                {
                    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "string", "name": "attrs", "type": "string"}],
                    "name": "mint",
                    "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "name": "attributes",
                    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [{"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "string", "name": "attrs", "type": "string"}],
                    "name": "AvatarMinted",
                    "type": "event"
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
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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
        try {
            await this.loadContractAddresses();
            this.setupEventListeners();
            this.initializeNavigation();
            await this.checkWallet();
            this.updateStats();
            console.log('Dashboard inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            this.showNotification('Erro ao inicializar dashboard', 'error');
        }
    }

    async loadContractAddresses() {
        try {
            const response = await fetch('./contract-addresses.json');
            if (!response.ok) {
                throw new Error('Falha ao carregar endereços dos contratos');
            }
            this.contractAddresses = await response.json();
            console.log('Endereços dos contratos carregados:', this.contractAddresses);
        } catch (error) {
            console.error('Erro ao carregar endereços dos contratos:', error);
            this.showNotification('Erro ao carregar configurações do blockchain', 'error');
        }
    }

    setupEventListeners() {
        // Elementos podem não existir ainda
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        const changeBtn = document.getElementById('change-wallet-btn');
        const mintBtn = document.getElementById('mint-avatar-btn');
        const capsuleBtn = document.getElementById('create-capsule-btn');
        const legacyBtn = document.getElementById('create-legacy-btn');

        if (connectBtn) connectBtn.addEventListener('click', () => this.connectWallet());
        if (disconnectBtn) disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        if (changeBtn) changeBtn.addEventListener('click', () => this.changeWallet());
        if (mintBtn) mintBtn.addEventListener('click', () => this.mintAvatar());
        if (capsuleBtn) capsuleBtn.addEventListener('click', () => this.createTimeCapsule());
        if (legacyBtn) legacyBtn.addEventListener('click', () => this.createLegacy());

        // Monitorar mudanças de conta no MetaMask
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else if (accounts[0] !== this.account) {
                    this.account = accounts[0];
                    this.updateWalletInfo();
                    this.updateTokenBalance();
                    this.showNotification('Conta alterada com sucesso!', 'success');
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    initializeNavigation() {
        // Configurar navegação das tabs do Bootstrap
        const navLinks = document.querySelectorAll('.nav-pills .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Remover indicador ativo de todos os links
                navLinks.forEach(l => l.classList.remove('active'));
                // Adicionar ao link clicado
                link.classList.add('active');
            });
        });
    }

    async connectWallet() {
        if (this.isConnecting) return;
        
        try {
            this.isConnecting = true;
            
            if (typeof window.ethereum === 'undefined') {
                this.showNotification('MetaMask não encontrado. Por favor, instale o MetaMask.', 'error');
                return;
            }

            this.showNotification('Conectando carteira...', 'info');

            // Requisitar acesso à conta
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                throw new Error('Nenhuma conta encontrada');
            }

            this.web3 = new Web3(window.ethereum);
            this.account = accounts[0];
            
            // Verificar se estamos na rede correta
            const networkId = await this.web3.eth.net.getId();
            console.log('Network ID:', networkId);
            
            await this.initializeContracts();
            this.updateWalletInfo();
            await this.updateTokenBalance();
            
            console.log('Wallet conectada:', this.account);
            this.showNotification('Carteira conectada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            this.showNotification('Erro ao conectar carteira: ' + error.message, 'error');
        } finally {
            this.isConnecting = false;
        }
    }

    async changeWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showNotification('MetaMask não encontrado', 'error');
                return;
            }

            this.showNotification('Solicitando mudança de carteira...', 'info');

            // Solicitar mudança de conta
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{
                    eth_accounts: {}
                }]
            });
            
            // Reconectar com nova conta
            await this.connectWallet();
            
        } catch (error) {
            console.error('Erro ao alterar carteira:', error);
            if (error.code !== 4001) { // User rejected request
                this.showNotification('Erro ao alterar carteira: ' + error.message, 'error');
            }
        }
    }

    disconnectWallet() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.updateWalletInfo();
        this.updateTokenBalance();
        this.showNotification('Carteira desconectada', 'info');
    }

    async initializeContracts() {
        if (!this.web3 || !this.contractAddresses) {
            console.log('Web3 ou endereços dos contratos não disponíveis');
            return;
        }
        
        try {
            // Inicializar AvatarBase
            if (this.contractAddresses.avatarBase) {
                this.contracts.avatarBase = new this.web3.eth.Contract(
                    this.contractABIs.avatarBase,
                    this.contractAddresses.avatarBase
                );
            }
            
            // Inicializar MockToken
            if (this.contractAddresses.mockToken) {
                this.contracts.mockToken = new this.web3.eth.Contract(
                    this.contractABIs.mockToken,
                    this.contractAddresses.mockToken
                );
            }
            
            console.log('Contratos inicializados:', Object.keys(this.contracts));
        } catch (error) {
            console.error('Erro ao inicializar contratos:', error);
            this.showNotification('Erro ao conectar com os contratos', 'error');
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('wallet-info');
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        const changeBtn = document.getElementById('change-wallet-btn');
        
        if (!walletInfo) return;

        if (this.account) {
            walletInfo.innerHTML = `
                <div class="status-badge connected">
                    <i class="fas fa-check-circle"></i>
                    <span>Conectado: ${this.account.substring(0, 8)}...${this.account.substring(36)}</span>
                </div>
            `;
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (changeBtn) changeBtn.style.display = 'inline-block';
        } else {
            walletInfo.innerHTML = `
                <div class="status-badge disconnected">
                    <i class="fas fa-wallet"></i>
                    <span>Carteira Desconectada</span>
                </div>
            `;
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (changeBtn) changeBtn.style.display = 'none';
        }
    }

    async updateTokenBalance() {
        const tokenInfo = document.getElementById('token-info');
        const tokenBalance = document.getElementById('token-balance');
        
        if (!this.account || !this.contracts.mockToken) {
            if (tokenInfo) tokenInfo.innerHTML = '';
            if (tokenBalance) tokenBalance.textContent = '0';
            return;
        }
        
        try {
            const balance = await this.contracts.mockToken.methods.balanceOf(this.account).call();
            const balanceFormatted = this.web3.utils.fromWei(balance, 'ether');
            const balanceNum = parseFloat(balanceFormatted);
            
            if (tokenInfo) {
                tokenInfo.innerHTML = `
                    <div class="status-badge connected">
                        <i class="fas fa-coins"></i>
                        <span>Saldo: ${balanceNum.toFixed(2)} tSGL</span>
                    </div>
                `;
            }
            
            if (tokenBalance) {
                tokenBalance.textContent = balanceNum.toFixed(2);
            }
            
        } catch (error) {
            console.error('Erro ao buscar saldo do token:', error);
            if (tokenInfo) {
                tokenInfo.innerHTML = `
                    <div class="status-badge disconnected">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Erro ao carregar saldo</span>
                    </div>
                `;
            }
        }
    }

    async checkWallet() {
        if (typeof window.ethereum === 'undefined') {
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.web3 = new Web3(window.ethereum);
                this.account = accounts[0];
                await this.initializeContracts();
                this.updateWalletInfo();
                await this.updateTokenBalance();
                console.log('Carteira reconectada automaticamente:', this.account);
            }
        } catch (error) {
            console.error('Erro ao verificar carteira:', error);
        }
    }

    async mintAvatar() {
        if (!this.account || !this.contracts.avatarBase) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        const attributesInput = document.getElementById('avatar-attributes');
        if (!attributesInput) {
            this.showNotification('Elemento de atributos não encontrado', 'error');
            return;
        }

        const attributes = attributesInput.value.trim();
        if (!attributes) {
            this.showNotification('Digite os atributos do avatar', 'error');
            return;
        }

        try {
            this.showNotification('Criando avatar...', 'info');
            
            // Estimar gas
            const gasEstimate = await this.contracts.avatarBase.methods
                .mint(this.account, attributes)
                .estimateGas({ from: this.account });

            // Executar transação
            const tx = await this.contracts.avatarBase.methods
                .mint(this.account, attributes)
                .send({ 
                    from: this.account,
                    gas: Math.floor(gasEstimate * 1.2) // 20% buffer
                });

            this.showNotification('Avatar criado com sucesso!', 'success');
            console.log('Avatar criado, TX:', tx.transactionHash);
            
            // Limpar campo
            attributesInput.value = '';
            
            // Atualizar estatísticas
            this.updateStats();
            
        } catch (error) {
            console.error('Erro ao criar avatar:', error);
            this.showNotification('Erro ao criar avatar: ' + (error.message || error), 'error');
        }
    }

    async createTimeCapsule() {
        if (!this.account) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        const contentInput = document.getElementById('capsule-content');
        const timeInput = document.getElementById('unlock-time');
        
        if (!contentInput || !timeInput) {
            this.showNotification('Elementos do formulário não encontrados', 'error');
            return;
        }

        const content = contentInput.value.trim();
        const unlockTime = timeInput.value;
        
        if (!content || !unlockTime) {
            this.showNotification('Preencha o conteúdo e data de desbloqueio', 'error');
            return;
        }

        try {
            this.showNotification('Criando cápsula do tempo...', 'info');
            
            // Simular criação da cápsula (implementar contrato específico depois)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Cápsula do tempo criada!', 'success');
            
            // Limpar campos
            contentInput.value = '';
            timeInput.value = '';
            
            // Atualizar estatísticas
            this.updateStats();
            
        } catch (error) {
            console.error('Erro ao criar cápsula:', error);
            this.showNotification('Erro ao criar cápsula: ' + error.message, 'error');
        }
    }

    async createLegacy() {
        if (!this.account) {
            this.showNotification('Conecte sua carteira primeiro', 'error');
            return;
        }

        const beneficiaryInput = document.getElementById('legacy-beneficiary');
        const contentInput = document.getElementById('legacy-content');
        
        if (!beneficiaryInput || !contentInput) {
            this.showNotification('Elementos do formulário não encontrados', 'error');
            return;
        }

        const beneficiary = beneficiaryInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!beneficiary || !content) {
            this.showNotification('Preencha o beneficiário e conteúdo', 'error');
            return;
        }

        // Validar endereço
        if (!this.web3.utils.isAddress(beneficiary)) {
            this.showNotification('Endereço do beneficiário inválido', 'error');
            return;
        }

        try {
            this.showNotification('Criando legado digital...', 'info');
            
            // Simular criação do legado (implementar contrato específico depois)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Legado digital criado!', 'success');
            
            // Limpar campos
            beneficiaryInput.value = '';
            contentInput.value = '';
            
            // Atualizar estatísticas
            this.updateStats();
            
        } catch (error) {
            console.error('Erro ao criar legado:', error);
            this.showNotification('Erro ao criar legado: ' + error.message, 'error');
        }
    }

    updateStats() {
        // Simular atualização de estatísticas
        const totalAvatars = document.getElementById('total-avatars');
        const totalCapsules = document.getElementById('total-capsules');
        
        if (totalAvatars) {
            const current = parseInt(totalAvatars.textContent) || 0;
            totalAvatars.textContent = current + 1;
        }
        
        if (totalCapsules) {
            const current = parseInt(totalCapsules.textContent) || 0;
            totalCapsules.textContent = current + 1;
        }
    }

    showNotification(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: type === 'error' ? 8000 : 5000
        });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando SingulAI Dashboard...');
    window.dashboard = new SingulAIDashboard();
});