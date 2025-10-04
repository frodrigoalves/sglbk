// SingulAI Backend Integration
// Versão 1.0.0

class BackendIntegration {
    constructor() {
        this.baseUrl = 'https://singulai.live/api';
        this.web3 = null;
        this.contracts = {};
        this.account = null;
        this.initialized = false;
    }
    
    /**
     * Inicializa a integração
     */
    async init() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    await this.setupContracts();
                }
            }
            this.initialized = true;
            console.log('SingulAI Backend: Inicializado com sucesso');
        } catch (error) {
            console.error('SingulAI Backend: Erro na inicialização', error);
            throw error;
        }
    }
    
    /**
     * Configura os contratos
     */
    async setupContracts() {
        try {
            // Carregar ABIs
            const response = await fetch('/contracts/abis.json');
            const abis = await response.json();
            
            // Setup Token Contract
            this.contracts.token = new this.web3.eth.Contract(
                abis.TokenContract,
                window.CONTRACTS.TOKEN_ADDRESS
            );
            
            // Setup Avatar Contract
            this.contracts.avatar = new this.web3.eth.Contract(
                abis.AvatarContract,
                window.CONTRACTS.AVATAR_ADDRESS
            );
            
            console.log('SingulAI Backend: Contratos configurados');
        } catch (error) {
            console.error('SingulAI Backend: Erro ao configurar contratos', error);
            throw error;
        }
    }
    
    /**
     * Busca saldo de tokens
     */
    async getTokenBalance() {
        try {
            if (!this.account) throw new Error('Carteira não conectada');
            
            const balance = await this.contracts.token.methods
                .balanceOf(this.account)
                .call();
                
            return this.web3.utils.fromWei(balance);
        } catch (error) {
            console.error('SingulAI Backend: Erro ao buscar saldo', error);
            throw error;
        }
    }
    
    /**
     * Interage com IA
     */
    async chatWithAI(message) {
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) throw new Error('Erro na comunicação com IA');
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('SingulAI Backend: Erro na interação com IA', error);
            throw error;
        }
    }
    
    /**
     * Atualiza informações do usuário
     */
    async updateUserInfo() {
        try {
            if (!this.account) return null;
            
            const [balance, avatar] = await Promise.all([
                this.getTokenBalance(),
                this.contracts.avatar.methods.getAvatar(this.account).call()
            ]);
            
            return {
                address: this.account,
                balance,
                avatar
            };
        } catch (error) {
            console.error('SingulAI Backend: Erro ao atualizar info', error);
            throw error;
        }
    }
    
    /**
     * Monitora eventos da carteira
     */
    setupWalletEvents() {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', async (accounts) => {
                this.account = accounts[0] || null;
                await this.updateUserInfo();
                // Disparar evento personalizado
                window.dispatchEvent(new CustomEvent('walletUpdate', {
                    detail: { account: this.account }
                }));
            });
            
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }
    
    /**
     * Desconecta da carteira
     */
    async disconnect() {
        this.account = null;
        this.contracts = {};
        localStorage.removeItem('token');
        // Disparar evento de desconexão
        window.dispatchEvent(new CustomEvent('walletDisconnect'));
    }
}

// Exportar instância
window.backendIntegration = new BackendIntegration();