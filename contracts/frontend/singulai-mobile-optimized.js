/**
 * SingulAI MVP - Mobile-First Web3 & Chat Integration
 * Otimizado para responsividade e UX móvel
 */

// === CONFIGURAÇÃO GLOBAL ===
const SINGULAI_CONFIG = {
    // Contratos Ethereum Sepolia (CORRETOS)
    SGL_TOKEN_ADDRESS: '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1',
    SGL_TOKEN_ABI: [
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
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
    ],
    
    // API Endpoints
    API_BASE: 'http://localhost:3000/api',
    CHAT_ENDPOINT: '/chat/message',
    
    // Chat settings
    CHAT_TYPING_DELAY: 1500,
    CHAT_MAX_MESSAGES: 50,
    
    // Mobile settings
    MOBILE_BREAKPOINT: 768,
    TOAST_DURATION: 4000,
    ANIMATION_DURATION: 300
};

// === ESTADO GLOBAL ===
class SingulAIState {
    constructor() {
        this.web3 = null;
        this.userAccount = null;
        this.sglBalance = '0';
        this.ethBalance = '0';
        this.isConnected = false;
        this.isMobile = this.detectMobile();
        this.activeModal = null;
        this.chatHistory = [];
        this.isTyping = false;
        
        // Event listeners
        this.setupEventListeners();
    }
    
    detectMobile() {
        return window.innerWidth <= SINGULAI_CONFIG.MOBILE_BREAKPOINT || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupEventListeners() {
        // Resize handling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isMobile = this.detectMobile();
                this.handleResponsiveChanges();
            }, 100);
        });
        
        // Escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
        
        // Click outside modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }
    
    handleResponsiveChanges() {
        // Reposition elements based on screen size
        this.repositionWalletButton();
        this.adjustModalLayout();
    }
    
    repositionWalletButton() {
        const walletBtn = document.querySelector('.wallet-button');
        if (walletBtn) {
            if (this.isMobile) {
                walletBtn.style.position = 'fixed';
                walletBtn.style.bottom = '1rem';
                walletBtn.style.left = '1rem';
                walletBtn.style.right = '1rem';
                walletBtn.style.top = 'auto';
                walletBtn.style.width = 'calc(100vw - 2rem)';
            } else {
                walletBtn.style.position = 'fixed';
                walletBtn.style.top = '1rem';
                walletBtn.style.right = '1rem';
                walletBtn.style.bottom = 'auto';
                walletBtn.style.left = 'auto';
                walletBtn.style.width = 'auto';
            }
        }
    }
    
    adjustModalLayout() {
        const modal = document.querySelector('.modal-overlay.active .modal-container');
        if (modal) {
            if (this.isMobile) {
                modal.style.borderRadius = '1.5rem 1.5rem 0 0';
                modal.style.maxHeight = '90vh';
            } else {
                modal.style.borderRadius = '1.5rem';
                modal.style.maxHeight = '80vh';
            }
        }
    }
    
    // Modal management
    openModal(modalId) {
        this.closeModal(); // Close any existing modal first
        
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        this.activeModal = modalId;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            const container = modal.querySelector('.modal-container');
            if (container) {
                container.style.transform = this.isMobile ? 'translateY(0)' : 'scale(1) translateY(0)';
            }
        }, 10);
    }
    
    closeModal() {
        if (!this.activeModal) return;
        
        const modal = document.getElementById(this.activeModal);
        if (modal) {
            const container = modal.querySelector('.modal-container');
            if (container) {
                container.style.transform = this.isMobile ? 'translateY(100%)' : 'scale(0.9) translateY(20px)';
            }
            
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                this.activeModal = null;
            }, SINGULAI_CONFIG.ANIMATION_DURATION);
        }
    }
}

// === WEB3 INTEGRATION ===
class Web3Manager {
    constructor(state) {
        this.state = state;
    }
    
    async connectWallet() {
        try {
            // Show connecting toast
            this.showToast('Conectando carteira...', 'info');
            
            if (!window.ethereum) {
                this.showToast('MetaMask não encontrado. Por favor, instale o MetaMask.', 'error');
                return false;
            }
            
            // Initialize Web3
            this.state.web3 = new Web3(window.ethereum);
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                this.showToast('Nenhuma conta selecionada.', 'warning');
                return false;
            }
            
            this.state.userAccount = accounts[0];
            this.state.isConnected = true;
            
            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0xaa36a7') { // Sepolia chain ID
                await this.switchToSepolia();
            }
            
            // Update balances
            await this.updateBalances();
            
            // Update UI
            this.updateWalletUI();
            
            this.showToast('Carteira conectada com sucesso!', 'success');
            return true;
            
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            
            if (error.code === 4001) {
                this.showToast('Conexão rejeitada pelo usuário.', 'warning');
            } else {
                this.showToast('Erro ao conectar carteira. Tente novamente.', 'error');
            }
            
            return false;
        }
    }
    
    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                // Network not added, add it
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: {
                                name: 'Sepolia ETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                        }],
                    });
                } catch (addError) {
                    throw new Error('Erro ao adicionar rede Sepolia');
                }
            } else {
                throw switchError;
            }
        }
    }
    
    async updateBalances() {
        if (!this.state.isConnected || !this.state.userAccount) return;
        
        try {
            // ETH Balance
            const ethBalanceWei = await this.state.web3.eth.getBalance(this.state.userAccount);
            this.state.ethBalance = this.state.web3.utils.fromWei(ethBalanceWei, 'ether');
            
            // SGL Token Balance  
            const contract = new this.state.web3.eth.Contract(
                SINGULAI_CONFIG.SGL_TOKEN_ABI,
                SINGULAI_CONFIG.SGL_TOKEN_ADDRESS
            );
            
            const sglBalanceWei = await contract.methods.balanceOf(this.state.userAccount).call();
            const decimals = await contract.methods.decimals().call();
            this.state.sglBalance = (sglBalanceWei / Math.pow(10, decimals)).toFixed(2);
            
            // Update UI
            this.updateBalanceDisplay();
            
        } catch (error) {
            console.error('Erro ao atualizar saldos:', error);
            this.showToast('Erro ao carregar saldos.', 'error');
        }
    }
    
    updateWalletUI() {
        const walletBtn = document.querySelector('.wallet-button');
        if (walletBtn) {
            if (this.state.isConnected) {
                const shortAddress = `${this.state.userAccount.slice(0, 6)}...${this.state.userAccount.slice(-4)}`;
                walletBtn.innerHTML = `
                    <span class="wallet-icon">🔗</span>
                    <span class="wallet-text">${shortAddress}</span>
                `;
                walletBtn.classList.add('connected');
            } else {
                walletBtn.innerHTML = `
                    <span class="wallet-icon">🔗</span>
                    <span class="wallet-text">Conectar Carteira</span>
                `;
                walletBtn.classList.remove('connected');
            }
        }
    }
    
    updateBalanceDisplay() {
        // ETH Balance
        const ethElement = document.querySelector('.eth-balance');
        if (ethElement) {
            ethElement.textContent = `${parseFloat(this.state.ethBalance).toFixed(4)} ETH`;
        }
        
        // SGL Balance
        const sglElement = document.querySelector('.sgl-balance');
        if (sglElement) {
            sglElement.textContent = `${this.state.sglBalance} SGL`;
        }
        
        // Update balance items
        const balanceItems = document.querySelectorAll('.balance-item');
        balanceItems.forEach(item => {
            const label = item.querySelector('.balance-label')?.textContent;
            const amount = item.querySelector('.balance-amount');
            
            if (label && amount) {
                if (label.includes('ETH')) {
                    amount.textContent = `${parseFloat(this.state.ethBalance).toFixed(4)}`;
                } else if (label.includes('SGL')) {
                    amount.textContent = this.state.sglBalance;
                }
            }
        });
    }
    
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        // Position toast
        toast.style.cssText = `
            position: fixed;
            ${this.state.isMobile ? 'bottom: 80px; left: 1rem; right: 1rem;' : 'top: 5rem; right: 1rem;'}
            background: white;
            border: 1px solid var(--neutral-200);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            padding: var(--space-4);
            z-index: var(--z-tooltip);
            transform: translateX(${this.state.isMobile ? '0' : '100%'});
            opacity: 0;
            transition: all var(--animation-normal);
            max-width: ${this.state.isMobile ? 'none' : '320px'};
        `;
        
        // Add styles based on type
        const colors = {
            success: { border: 'var(--success-500)', bg: 'var(--success-50)' },
            error: { border: 'var(--error-500)', bg: 'var(--error-50)' },
            warning: { border: 'var(--warning-500)', bg: 'var(--warning-50)' },
            info: { border: 'var(--primary-500)', bg: 'var(--primary-50)' }
        };
        
        const color = colors[type] || colors.info;
        toast.style.borderColor = color.border;
        toast.style.backgroundColor = color.bg;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = `translateX(${this.state.isMobile ? '0' : '100%'})`;
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), SINGULAI_CONFIG.ANIMATION_DURATION);
        }, SINGULAI_CONFIG.TOAST_DURATION);
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// === CHAT MANAGER ===
class ChatManager {
    constructor(state) {
        this.state = state;
        this.messageContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.typingIndicator = null;
    }
    
    initialize() {
        this.messageContainer = document.querySelector('.chat-messages');
        this.messageInput = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.chat-send-btn');
        
        if (!this.messageContainer || !this.messageInput || !this.sendButton) {
            console.warn('Elementos do chat não encontrados');
            return;
        }
        
        // Setup event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
        
        // Load chat history
        this.loadChatHistory();
        
        // Add welcome message
        if (this.state.chatHistory.length === 0) {
            this.addMessage('Olá! Sou sua IA assistente do SingulAI. Como posso ajudá-lo hoje?', 'ai');
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.state.isTyping) return;
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            setTimeout(() => {
                this.addMessage(response, 'ai');
            }, 300);
            
        } catch (error) {
            console.error('Erro no chat:', error);
            this.hideTypingIndicator();
            
            setTimeout(() => {
                this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'ai');
            }, 300);
        }
    }
    
    addMessage(text, sender) {
        if (!this.messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        messageElement.setAttribute('data-timestamp', timestamp);
        
        this.messageContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Save to history
        this.state.chatHistory.push({ text, sender, timestamp });
        
        // Limit history
        if (this.state.chatHistory.length > SINGULAI_CONFIG.CHAT_MAX_MESSAGES) {
            this.state.chatHistory.shift();
        }
        
        // Save to localStorage
        this.saveChatHistory();
    }
    
    showTypingIndicator() {
        if (this.typingIndicator) return;
        
        this.state.isTyping = true;
        this.sendButton.disabled = true;
        
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message ai typing-indicator';
        this.typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        // Add typing animation CSS
        const style = document.createElement('style');
        style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .typing-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--neutral-400);
                animation: typing 1.5s infinite;
            }
            
            .typing-dots span:nth-child(1) { animation-delay: 0ms; }
            .typing-dots span:nth-child(2) { animation-delay: 300ms; }
            .typing-dots span:nth-child(3) { animation-delay: 600ms; }
            
            @keyframes typing {
                0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
                30% { opacity: 1; transform: scale(1); }
            }
        `;
        
        if (!document.querySelector('#typing-animation-styles')) {
            style.id = 'typing-animation-styles';
            document.head.appendChild(style);
        }
        
        this.messageContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
        
        this.state.isTyping = false;
        this.sendButton.disabled = false;
    }
    
    async getAIResponse(message) {
        try {
            const response = await fetch(`${SINGULAI_CONFIG.API_BASE}${SINGULAI_CONFIG.CHAT_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: message,
                    context: {
                        userAccount: this.state.userAccount,
                        sglBalance: this.state.sglBalance,
                        ethBalance: this.state.ethBalance
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.response || 'Desculpe, não consegui processar sua mensagem.';
            
        } catch (error) {
            console.error('Erro na API do chat:', error);
            
            // Fallback responses
            const fallbacks = [
                'Interessante pergunta! Como assistente do SingulAI, posso ajudá-lo com informações sobre a plataforma.',
                'Entendo sua questão. O SingulAI oferece diversas funcionalidades para gerenciar seu legado digital.',
                'Ótima pergunta! Posso fornecer mais informações sobre os recursos disponíveis.',
                'Vou ajudá-lo com isso! O SingulAI é uma plataforma inovadora para preservação digital.'
            ];
            
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    }
    
    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('singulai_chat_history');
            if (saved) {
                this.state.chatHistory = JSON.parse(saved);
                
                // Rebuild messages
                this.state.chatHistory.forEach(({ text, sender }) => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${sender}`;
                    messageElement.textContent = text;
                    this.messageContainer.appendChild(messageElement);
                });
                
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Erro ao carregar histórico do chat:', error);
        }
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem('singulai_chat_history', JSON.stringify(this.state.chatHistory));
        } catch (error) {
            console.error('Erro ao salvar histórico do chat:', error);
        }
    }
    
    clearHistory() {
        this.state.chatHistory = [];
        localStorage.removeItem('singulai_chat_history');
        
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '';
        }
        
        // Add welcome message
        this.addMessage('Histórico limpo! Como posso ajudá-lo?', 'ai');
    }
}

// === INICIALIZAÇÃO ===
class SingulAIApp {
    constructor() {
        this.state = new SingulAIState();
        this.web3Manager = new Web3Manager(this.state);
        this.chatManager = new ChatManager(this.state);
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Inicializando SingulAI MVP...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Initialize managers
        this.chatManager.initialize();
        
        // Setup wallet button
        this.setupWalletButton();
        
        // Setup modals
        this.setupModals();
        
        // Check for existing wallet connection
        this.checkExistingConnection();
        
        // Position elements for mobile
        this.state.repositionWalletButton();
        
        console.log('✅ SingulAI MVP inicializado com sucesso!');
    }
    
    setupWalletButton() {
        const walletBtn = document.querySelector('.wallet-button');
        if (walletBtn) {
            walletBtn.addEventListener('click', async () => {
                if (!this.state.isConnected) {
                    await this.web3Manager.connectWallet();
                } else {
                    // Show account details
                    this.state.openModal('wallet-modal');
                }
            });
        }
    }
    
    setupModals() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.state.closeModal());
        });
        
        // Modal specific actions
        this.setupModalActions();
    }
    
    setupModalActions() {
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        
        // Clear chat history
        const clearChatBtn = document.querySelector('#clear-chat');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.chatManager.clearHistory();
                this.state.closeModal();
            });
        }
    }
    
    async checkExistingConnection() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.state.userAccount = accounts[0];
                    this.state.isConnected = true;
                    this.state.web3 = new Web3(window.ethereum);
                    
                    await this.web3Manager.updateBalances();
                    this.web3Manager.updateWalletUI();
                }
            } catch (error) {
                console.error('Erro ao verificar conexão existente:', error);
            }
        }
    }
}

// === GLOBAL FUNCTIONS (para compatibilidade) ===
window.connectWallet = async function() {
    if (window.singulaiApp) {
        return await window.singulaiApp.web3Manager.connectWallet();
    }
};

window.openModal = function(modalId) {
    if (window.singulaiApp) {
        window.singulaiApp.state.openModal(modalId);
    }
};

window.closeModal = function() {
    if (window.singulaiApp) {
        window.singulaiApp.state.closeModal();
    }
};

// === AUTO-INICIALIZAÇÃO ===
window.singulaiApp = new SingulAIApp();

// === SERVICE WORKER (PWA) ===
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrado:', registration))
            .catch(error => console.log('SW erro:', error));
    });
}

// === EXPORT (para módulos) ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SingulAIApp, SingulAIState, Web3Manager, ChatManager };
}