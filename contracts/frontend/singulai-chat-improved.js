// SingulAI Chat Interface Profissional
// Sistema de chat melhorado com design profissional e funcionalidades avançadas

class SingulAIChatInterface {
    constructor() {
        this.chatContainer = null;
        this.messagesContainer = null;
        this.chatInput = null;
        this.sendButton = null;
        this.isInitialized = false;
        this.messageQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        console.log('🗨️ Inicializando Chat Interface...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get DOM elements
        this.chatContainer = document.querySelector('.chat-section');
        this.messagesContainer = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send-btn');

        if (!this.chatContainer || !this.messagesContainer || !this.chatInput || !this.sendButton) {
            console.log('⚠️ Elementos de chat não encontrados, aguardando...');
            setTimeout(() => this.setup(), 1000);
            return;
        }

        this.setupEventListeners();
        this.setupAutoResize();
        this.isInitialized = true;

        console.log('✅ Chat Interface inicializado');
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Enter key to send (Shift+Enter for new line)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input change to update send button state
        this.chatInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });

        // Focus management
        this.chatInput.addEventListener('focus', () => {
            this.chatContainer.classList.add('chat-focused');
        });

        this.chatInput.addEventListener('blur', () => {
            this.chatContainer.classList.remove('chat-focused');
        });
    }

    setupAutoResize() {
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            const newHeight = Math.min(this.chatInput.scrollHeight, 120);
            this.chatInput.style.height = newHeight + 'px';
        });
    }

    updateSendButtonState() {
        const hasText = this.chatInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isProcessing;
        
        if (hasText && !this.isProcessing) {
            this.sendButton.classList.add('active');
        } else {
            this.sendButton.classList.remove('active');
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isProcessing) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        this.updateSendButtonState();

        // Set processing state
        this.isProcessing = true;
        this.updateSendButtonState();

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            // Try to get AI response
            const response = await this.getAIResponse(message);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Add AI response
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('❌ Erro no chat:', error);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Add error message
            this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.', 'ai', true);
        } finally {
            this.isProcessing = false;
            this.updateSendButtonState();
        }
    }

    addMessage(text, type = 'ai', isError = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        if (isError) bubble.classList.add('error');
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-time';
        timestamp.textContent = this.formatTime(new Date());
        
        bubble.appendChild(messageText);
        bubble.appendChild(timestamp);
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(bubble);
        
        // Animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        this.messagesContainer.appendChild(messageElement);
        
        // Trigger animation
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
        // Scroll to bottom
        this.scrollToBottom();
        
        return messageElement;
    }

    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chat-message ai typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-bubble typing">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
        
        return indicator;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.remove();
        }
    }

    async getAIResponse(message) {
        console.log('🤖 Enviando mensagem para IA:', message);
        
        try {
            // Try local backend first
            let response = await this.tryBackend('http://localhost:3000/api/chat', message);
            if (response) return response;
            
            // Fallback to VPS
            response = await this.tryBackend('http://72.60.147.56/api/chat', message);
            if (response) return response;
            
            // Final fallback
            return this.getFallbackResponse(message);
            
        } catch (error) {
            console.error('❌ Erro ao obter resposta da IA:', error);
            return this.getFallbackResponse(message);
        }
    }

    async tryBackend(url, message) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.response || data.message;
            
        } catch (error) {
            console.log(`⚠️ Backend ${url} não disponível:`, error.message);
            return null;
        }
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Specific responses based on message content
        if (lowerMessage.includes('avatar') || lowerMessage.includes('digital')) {
            return '🤖 Avatar SingulAI: Os avatares digitais são representações NFT únicas que preservam sua identidade na blockchain. Posso ajudá-lo a criar e gerenciar seus avatares digitais!';
        }
        
        if (lowerMessage.includes('wallet') || lowerMessage.includes('carteira') || lowerMessage.includes('metamask')) {
            return '🤖 Avatar SingulAI: Para usar a SingulAI, você precisa conectar sua carteira MetaMask. Clique no botão "Conectar MetaMask" e certifique-se de estar na rede Sepolia testnet.';
        }
        
        if (lowerMessage.includes('token') || lowerMessage.includes('sgl') || lowerMessage.includes('saldo')) {
            return '🤖 Avatar SingulAI: O token SGL é usado na plataforma SingulAI. Você pode visualizar seu saldo após conectar sua carteira. Na testnet Sepolia, você pode obter tokens de teste.';
        }
        
        if (lowerMessage.includes('capsula') || lowerMessage.includes('time capsule') || lowerMessage.includes('tempo')) {
            return '🤖 Avatar SingulAI: As cápsulas do tempo permitem armazenar conteúdo que será liberado em datas específicas. É uma forma de preservar memórias e mensagens para o futuro!';
        }
        
        if (lowerMessage.includes('legado') || lowerMessage.includes('herança') || lowerMessage.includes('legacy')) {
            return '🤖 Avatar SingulAI: O sistema de legado digital permite configurar heranças automáticas de seus ativos digitais. Defina beneficiários e condições de liberação através de smart contracts.';
        }
        
        if (lowerMessage.includes('blockchain') || lowerMessage.includes('ethereum') || lowerMessage.includes('sepolia')) {
            return '🤖 Avatar SingulAI: Utilizamos a blockchain Ethereum (testnet Sepolia) para garantir segurança e transparência. Todos os contratos são verificados e auditáveis.';
        }
        
        if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('hello') || lowerMessage.includes('oi')) {
            return '🤖 Avatar SingulAI: Olá! Sou o Avatar Ético da SingulAI, especializado em blockchain e legado digital. Como posso ajudá-lo hoje? Posso explicar sobre avatares digitais, cápsulas do tempo, ou como usar nossa plataforma!';
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('ajuda') || lowerMessage.includes('como usar')) {
            return '🤖 Avatar SingulAI: Posso ajudá-lo com:\n• Conectar sua carteira MetaMask\n• Criar avatares digitais\n• Configurar cápsulas do tempo\n• Gerenciar legados digitais\n• Entender nossa tecnologia blockchain\n\nO que você gostaria de saber?';
        }
        
        // Default response
        return '🤖 Avatar SingulAI: Obrigado por sua mensagem! Sou especializado em blockchain, avatares digitais, cápsulas do tempo e legados digitais. Como posso ajudá-lo especificamente com a plataforma SingulAI?';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Public methods for external use
    clearChat() {
        this.messagesContainer.innerHTML = '';
        this.addMessage('Olá! Sou o Avatar Ético da SingulAI. Como posso ajudá-lo hoje?', 'ai');
    }

    addExternalMessage(message, type = 'ai') {
        this.addMessage(message, type);
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        this.updateSendButtonState();
    }
}

// Additional CSS for typing indicator and improvements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .chat-focused {
        box-shadow: var(--shadow-xl);
        transform: translateY(-2px);
        transition: all var(--animation-normal);
    }

    .typing-indicator .message-bubble {
        background: var(--neutral-100) !important;
        border: 1px solid var(--neutral-200) !important;
        padding: var(--space-3) var(--space-4) !important;
    }

    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .typing-dots span {
        width: 6px;
        height: 6px;
        background: var(--neutral-500);
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
        0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% { 
            transform: scale(1);
            opacity: 1;
        }
    }

    .message-bubble.error {
        background: rgba(239, 68, 68, 0.1) !important;
        border-color: var(--error-500) !important;
        color: var(--error-500) !important;
    }

    .chat-send-button.active {
        background: linear-gradient(135deg, var(--primary-600), var(--primary-700)) !important;
        transform: translateY(-50%) scale(1.02);
    }

    .chat-section {
        transition: all var(--animation-normal);
    }

    /* Melhorias responsivas */
    @media (max-width: 768px) {
        .chat-header-content {
            gap: var(--space-3);
        }
        
        .chat-avatar-indicator {
            width: 36px;
            height: 36px;
            font-size: 16px;
        }
        
        .chat-header-info h3 {
            font-size: var(--text-base);
        }
        
        .chat-header-info p {
            font-size: var(--text-xs);
        }
    }
`;
document.head.appendChild(additionalStyles);

// Initialize chat interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.singulaiChat = new SingulAIChatInterface();
    console.log('✅ SingulAI Chat Interface carregado');
});