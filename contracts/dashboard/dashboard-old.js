// SingulAI MVP Dashboard - JavaScript

class SingulAIDashboard {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.contractAddresses = {
            avatarBase: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            avatarWalletLink: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
            timeCapsule: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            digitalLegacy: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
            mockToken: null // Will be loaded from token-info.json
        };
        
        // Contract ABIs (simplified for MVP)
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
            avatarWalletLink: [
                {
                    "inputs": [{"internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"internalType": "address", "name": "wallet", "type": "address"}],
                    "name": "link",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [{"indexed": true, "internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "wallet", "type": "address"}],
                    "name": "WalletLinked",
                    "type": "event"
                }
            ],
            timeCapsule: [
                {
                    "inputs": [{"internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"internalType": "uint256", "name": "unlockTime", "type": "uint256"}, {"internalType": "string", "name": "contentHash", "type": "string"}],
                    "name": "createCapsule",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [{"indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "unlockTime", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "contentHash", "type": "string"}],
                    "name": "CapsuleCreated",
                    "type": "event"
                }
            ],
            digitalLegacy: [
                {
                    "inputs": [{"internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"internalType": "string", "name": "cid", "type": "string"}, {"internalType": "string", "name": "rules", "type": "string"}],
                    "name": "createLegacy",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [{"indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32"}, {"indexed": false, "internalType": "uint256", "name": "avatarId", "type": "uint256"}, {"indexed": false, "internalType": "string", "name": "cid", "type": "string"}, {"indexed": false, "internalType": "string", "name": "rules", "type": "string"}],
                    "name": "LegacyCreated",
                    "type": "event"
                }
            ],
            mockToken: [
                {
                    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
                    "name": "transfer",
                    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
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
                }
            ]
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.log('Dashboard iniciado', 'info');
        await this.loadTokenInfo();
        await this.checkMetaMaskConnection();
    }

    async loadTokenInfo() {
        try {
            const response = await fetch('token-info.json');
            if (response.ok) {
                const tokenInfo = await response.json();
                this.contractAddresses.mockToken = tokenInfo.address;
                this.log(`Token carregado: ${tokenInfo.name} (${tokenInfo.symbol})`, 'success');
            }
        } catch (error) {
            this.log('Token info não encontrado - usando endereços padrão', 'warning');
        }
    }

    setupEventListeners() {
        // IDs corrigidos conforme HTML
        document.getElementById('connectBtn').addEventListener('click', () => this.connectWallet());
        document.getElementById('changeWalletBtn').addEventListener('click', () => this.changeWallet());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('createAvatarBtn').addEventListener('click', () => this.createAvatar());
        document.getElementById('linkWalletBtn').addEventListener('click', () => this.linkWallet());
        document.getElementById('createCapsuleBtn').addEventListener('click', () => this.createCapsule());
        document.getElementById('createLegacyBtn').addEventListener('click', () => this.createLegacy());
        document.getElementById('sendTokenBtn').addEventListener('click', () => this.sendTokens());
        document.getElementById('getTestTokensBtn').addEventListener('click', () => this.getTestTokens());
    }

    async checkMetaMaskConnection() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            this.log('MetaMask detectado', 'success');
            
            // Check if already connected
            const accounts = await this.web3.eth.getAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
                await this.updateWalletInfo();
                this.initializeContracts();
            }
        } else {
            this.log('MetaMask não encontrado. Por favor, instale o MetaMask.', 'error');
            this.updateConnectionStatus('MetaMask não encontrado', false);
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.account = accounts[0];
                this.web3 = new Web3(window.ethereum);
                
                await this.updateWalletInfo();
                this.initializeContracts();
                this.log(`Carteira conectada: ${this.account}`, 'success');
                
                // Setup account change listener
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length > 0) {
                        this.account = accounts[0];
                        this.updateWalletInfo();
                    } else {
                        this.disconnectWallet();
                    }
                });
                
            } else {
                this.log('MetaMask não encontrado', 'error');
            }
        } catch (error) {
            this.log(`Erro ao conectar carteira: ${error.message}`, 'error');
        }
    }

    async updateWalletInfo() {
        if (this.account && this.web3) {
            try {
                const balance = await this.web3.eth.getBalance(this.account);
                const balanceEth = this.web3.utils.fromWei(balance, 'ether');
                
                document.getElementById('walletAddress').textContent = this.account;
                document.getElementById('walletBalance').textContent = parseFloat(balanceEth).toFixed(4);
                document.getElementById('walletInfo').style.display = 'block';
                document.getElementById('connectBtn').textContent = 'Connected';
                document.getElementById('connectBtn').disabled = true;
                
                // Update token balance if contract is available
                await this.updateTokenBalance();
                
                this.updateConnectionStatus('Connected', true);
            } catch (error) {
                this.log(`Erro ao atualizar informações da carteira: ${error.message}`, 'error');
            }
        }
    }

    async updateTokenBalance() {
        if (this.contracts.mockToken && this.account) {
            try {
                const balance = await this.contracts.mockToken.methods.balanceOf(this.account).call();
                const balanceFormatted = this.web3.utils.fromWei(balance, 'ether');
                document.getElementById('tokenBalance').textContent = parseFloat(balanceFormatted).toFixed(2);
            } catch (error) {
                document.getElementById('tokenBalance').textContent = '0.00';
            }
        }
    }

    initializeContracts() {
        try {
            this.contracts.avatarBase = new this.web3.eth.Contract(
                this.contractABIs.avatarBase, 
                this.contractAddresses.avatarBase
            );
            
            this.contracts.avatarWalletLink = new this.web3.eth.Contract(
                this.contractABIs.avatarWalletLink, 
                this.contractAddresses.avatarWalletLink
            );
            
            this.contracts.timeCapsule = new this.web3.eth.Contract(
                this.contractABIs.timeCapsule, 
                this.contractAddresses.timeCapsule
            );
            
            this.contracts.digitalLegacy = new this.web3.eth.Contract(
                this.contractABIs.digitalLegacy, 
                this.contractAddresses.digitalLegacy
            );
            
            // Initialize MockToken if available
            if (this.contractAddresses.mockToken) {
                this.contracts.mockToken = new this.web3.eth.Contract(
                    this.contractABIs.mockToken, 
                    this.contractAddresses.mockToken
                );
            }
            
            this.log('Contratos inicializados com sucesso', 'success');
        } catch (error) {
            this.log(`Erro ao inicializar contratos: ${error.message}`, 'error');
        }
    }

    async changeWallet() {
        try {
            // Clear current connection
            this.account = null;
            this.contracts = {};
            
            // Reset UI
            document.getElementById('walletInfo').style.display = 'none';
            document.getElementById('connectBtn').textContent = 'Connect Wallet';
            document.getElementById('connectBtn').disabled = false;
            this.updateConnectionStatus('Disconnected', false);
            
            // Request new account selection
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });
            
            // Reconnect with new account
            await this.connectWallet();
            
        } catch (error) {
            this.log(`Erro ao alterar carteira: ${error.message}`, 'error');
        }
    }

    showSettings() {
        const settings = `
=== CONFIGURAÇÕES DO DASHBOARD ===

Rede: Hardhat Local (Chain ID: 31337)
RPC URL: http://127.0.0.1:8545

Contratos Deployados:
- AvatarBase: ${this.contractAddresses.avatarBase}
- AvatarWalletLink: ${this.contractAddresses.avatarWalletLink}
- TimeCapsule: ${this.contractAddresses.timeCapsule}
- DigitalLegacy: ${this.contractAddresses.digitalLegacy}
- MockToken: ${this.contractAddresses.mockToken || 'Não deployado'}

Para usar o dashboard:
1. Conecte sua carteira MetaMask
2. Configure a rede Hardhat Local
3. Importe uma conta de teste
4. Obtenha tokens de teste (tSGL)

Chave privada de teste:
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
        `;
        
        alert(settings);
        this.log('Configurações exibidas', 'info');
    }

    async sendTokens() {
        try {
            if (!this.contracts.mockToken) {
                this.showResult('tokenResult', 'Token não disponível', 'error');
                return;
            }

            const recipient = document.getElementById('tokenRecipient').value;
            const amount = document.getElementById('tokenAmount').value;

            if (!recipient || !amount) {
                this.showResult('tokenResult', 'Preencha destinatário e quantidade', 'error');
                return;
            }

            if (!this.web3.utils.isAddress(recipient)) {
                this.showResult('tokenResult', 'Endereço inválido', 'error');
                return;
            }

            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            this.log('Enviando tokens...', 'info');
            
            const tx = await this.contracts.mockToken.methods
                .transfer(recipient, amountWei)
                .send({ from: this.account });
            
            this.log(`Tokens enviados! TX: ${tx.transactionHash}`, 'success');
            this.showResult('tokenResult', `${amount} tSGL enviados para ${recipient}`, 'success');
            
            // Update balance
            await this.updateTokenBalance();
            
            // Clear form
            document.getElementById('tokenRecipient').value = '';
            document.getElementById('tokenAmount').value = '';
            
        } catch (error) {
            this.log(`Erro ao enviar tokens: ${error.message}`, 'error');
            this.showResult('tokenResult', `Erro: ${error.message}`, 'error');
        }
    }

    async getTestTokens() {
        try {
            // This is a demo function - in a real scenario, you'd have a faucet contract
            const testAmount = '1000'; // 1000 tSGL
            
            this.showResult('tokenResult', 
                `Para obter tokens de teste:\n
1. Use o deployer account que tem 1M tokens
2. Ou execute: npx hardhat run scripts/deploy-token.js --network localhost
3. Tokens serão distribuídos automaticamente para contas de teste
4. Endereço do deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, 
                'success'
            );
            
            this.log('Instruções de tokens de teste exibidas', 'info');
            
        } catch (error) {
            this.log(`Erro: ${error.message}`, 'error');
            this.showResult('tokenResult', `Erro: ${error.message}`, 'error');
        }
    }

    async createAvatar() {
        try {
            const attributes = document.getElementById('avatarAttributes').value;

            if (!attributes) {
                this.showResult('avatarResult', 'Por favor, preencha os atributos do avatar', 'error');
                return;
            }

            // Validate JSON
            try {
                JSON.parse(attributes);
            } catch {
                this.showResult('avatarResult', 'Atributos devem estar em formato JSON válido', 'error');
                return;
            }
            
            this.log('Criando avatar...', 'info');
            
            const tx = await this.contracts.avatarBase.methods
                .mint(this.account, attributes)
                .send({ from: this.account });
            
            // Get token ID from transaction receipt
            const receipt = await this.web3.eth.getTransactionReceipt(tx.transactionHash);
            const tokenId = this.web3.utils.hexToNumber(receipt.logs[0].topics[3]);
            
            this.log(`Avatar criado! TX: ${tx.transactionHash}`, 'success');
            document.getElementById('avatarTokenId').textContent = tokenId;
            this.showResult('avatarResult', `Avatar criado com sucesso! Token ID: ${tokenId}`, 'success');
            
            // Clear form
            document.getElementById('avatarAttributes').value = '';
            
        } catch (error) {
            this.log(`Erro ao criar avatar: ${error.message}`, 'error');
            this.showResult('avatarResult', `Erro: ${error.message}`, 'error');
        }
    }

    async linkWallet() {
        try {
            const avatarId = document.getElementById('linkAvatarId').value;
            const walletAddress = document.getElementById('linkWalletAddress').value;

            if (!avatarId || !walletAddress) {
                this.showResult('linkResult', 'Por favor, preencha o ID do avatar e endereço da carteira', 'error');
                return;
            }

            if (!this.web3.utils.isAddress(walletAddress)) {
                this.showResult('linkResult', 'Endereço de carteira inválido', 'error');
                return;
            }

            this.log('Vinculando carteira ao avatar...', 'info');
            
            const tx = await this.contracts.avatarWalletLink.methods
                .link(parseInt(avatarId), walletAddress)
                .send({ from: this.account });
            
            this.log(`Carteira vinculada! TX: ${tx.transactionHash}`, 'success');
            this.showResult('linkResult', `Carteira vinculada com sucesso! TX: ${tx.transactionHash}`, 'success');
            
            // Clear form
            document.getElementById('linkAvatarId').value = '';
            document.getElementById('linkWalletAddress').value = '';
            
        } catch (error) {
            this.log(`Erro ao vincular carteira: ${error.message}`, 'error');
            this.showResult('linkResult', `Erro: ${error.message}`, 'error');
        }
    }

    async createCapsule() {
        try {
            const message = document.getElementById('capsuleMessage').value;
            const releaseTime = document.getElementById('capsuleReleaseTime').value;
            const value = document.getElementById('capsuleValue').value;

            if (!message || !releaseTime) {
                this.showResult('capsuleResult', 'Por favor, preencha a mensagem e data de liberação', 'error');
                return;
            }

            const unlockTime = Math.floor(new Date(releaseTime).getTime() / 1000);
            
            if (unlockTime <= Math.floor(Date.now() / 1000)) {
                this.showResult('capsuleResult', 'A data de liberação deve ser no futuro', 'error');
                return;
            }

            this.log('Criando cápsula do tempo...', 'info');
            
            const txOptions = { from: this.account };
            if (value && parseFloat(value) > 0) {
                txOptions.value = this.web3.utils.toWei(value, 'ether');
            }
            
            // For MVP, we'll use a simple hash of the message
            const contentHash = this.web3.utils.keccak256(message);
            
            const tx = await this.contracts.timeCapsule.methods
                .createCapsule(1, unlockTime, contentHash) // Using avatar ID 1 for demo
                .send(txOptions);
            
            this.log(`Cápsula criada! TX: ${tx.transactionHash}`, 'success');
            this.log(`Liberação em: ${new Date(unlockTime * 1000).toLocaleString()}`, 'info');
            this.showResult('capsuleResult', `Cápsula criada! Liberação: ${new Date(unlockTime * 1000).toLocaleString()}`, 'success');
            
            // Clear form
            document.getElementById('capsuleMessage').value = '';
            document.getElementById('capsuleReleaseTime').value = '';
            document.getElementById('capsuleValue').value = '';
            
        } catch (error) {
            this.log(`Erro ao criar cápsula: ${error.message}`, 'error');
            this.showResult('capsuleResult', `Erro: ${error.message}`, 'error');
        }
    }

    async createLegacy() {
        try {
            const beneficiary = document.getElementById('legacyBeneficiary').value;
            const trigger = document.getElementById('legacyTrigger').value;
            const value = document.getElementById('legacyValue').value;

            if (!beneficiary) {
                this.showResult('legacyResult', 'Por favor, insira o endereço do beneficiário', 'error');
                return;
            }

            if (!this.web3.utils.isAddress(beneficiary)) {
                this.showResult('legacyResult', 'Endereço do beneficiário inválido', 'error');
                return;
            }

            this.log('Criando legado digital...', 'info');
            
            const txOptions = { from: this.account };
            if (value && parseFloat(value) > 0) {
                txOptions.value = this.web3.utils.toWei(value, 'ether');
            }
            
            // Create rules based on trigger
            const rules = JSON.stringify({
                beneficiary: beneficiary,
                trigger: trigger,
                value: value || '0',
                created: Date.now()
            });
            
            // Simple content hash for demo
            const contentHash = this.web3.utils.keccak256(JSON.stringify({beneficiary, trigger}));
            
            const tx = await this.contracts.digitalLegacy.methods
                .createLegacy(1, contentHash, rules) // Using avatar ID 1 for demo
                .send(txOptions);
            
            this.log(`Legado criado! TX: ${tx.transactionHash}`, 'success');
            this.showResult('legacyResult', `Legado criado! Beneficiário: ${beneficiary}`, 'success');
            
            // Clear form
            document.getElementById('legacyBeneficiary').value = '';
            document.getElementById('legacyTrigger').value = 'time';
            document.getElementById('legacyValue').value = '';
            
        } catch (error) {
            this.log(`Erro ao criar legado: ${error.message}`, 'error');
            this.showResult('legacyResult', `Erro: ${error.message}`, 'error');
        }
    }

    disconnectWallet() {
        this.account = null;
        this.contracts = {};
        document.getElementById('walletInfo').style.display = 'none';
        document.getElementById('connectBtn').textContent = 'Connect Wallet';
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('tokenBalance').textContent = '0';
        this.updateConnectionStatus('Disconnected', false);
        this.log('Carteira desconectada', 'warning');
    }

    updateConnectionStatus(message, isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        const statusSpan = statusElement.querySelector('span');
        const statusIcon = statusElement.querySelector('i');
        
        if (statusSpan) statusSpan.textContent = message;
        
        if (isConnected) {
            statusElement.className = 'connection-status status-connected';
            if (statusIcon) {
                statusIcon.className = 'fas fa-circle-check';
            }
        } else {
            statusElement.className = 'connection-status status-disconnected';
            if (statusIcon) {
                statusIcon.className = 'fas fa-circle-xmark';
            }
        }
    }

    showResult(elementId, message, type) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.style.display = 'block';
            resultElement.className = `mt-3 alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
            resultElement.innerHTML = message;
        }
    }

    log(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Add to console for debugging since we don't have a log container in the HTML
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SingulAIDashboard();
});