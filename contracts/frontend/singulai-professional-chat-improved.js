/* SingulAI Professional Chat Improved - JavaScript */

class SingulAIChatProfessional {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages-professional');
        this.chatInput = document.getElementById('chat-input-professional');
        this.sendBtn = document.getElementById('send-btn-professional');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.charCount = document.getElementById('char-count');
        
        this.isTyping = false;
        this.chatHistory = [];
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.adjustTextareaHeight();
        this.loadChatHistory();
        this.detectUser();
    }

    setupEventListeners() {
        // Send button click
        this.sendBtn?.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key handling
        this.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        // Input changes
        this.chatInput?.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.updateCharCount();
            this.updateSendButton();
        });
        
        // Focus handling
        this.chatInput?.addEventListener('focus', () => {
            this.chatInput.parentElement.classList.add('focused');
        });
        
        this.chatInput?.addEventListener('blur', () => {
            this.chatInput.parentElement.classList.remove('focused');
        });
        
        // Header actions
        document.querySelector('.header-action-btn[title="Novo Chat"]')?.addEventListener('click', () => {
            this.clearChat();
        });
        
        document.querySelector('.header-action-btn[title="Histórico"]')?.addEventListener('click', () => {
            this.showChatHistory();
        });
        
        document.querySelector('.header-action-btn[title="Configurações"]')?.addEventListener('click', () => {
            this.showSettings();
        });
    }

    adjustTextareaHeight() {
        if (!this.chatInput) return;
        
        this.chatInput.style.height = 'auto';
        const scrollHeight = this.chatInput.scrollHeight;
        const maxHeight = 120; // 6 linhas aproximadamente
        
        if (scrollHeight <= maxHeight) {
            this.chatInput.style.height = scrollHeight + 'px';
        } else {
            this.chatInput.style.height = maxHeight + 'px';
        }
    }

    updateCharCount() {
        if (!this.chatInput || !this.charCount) return;
        
        const currentLength = this.chatInput.value.length;
        this.charCount.textContent = currentLength;
        
        // Visual feedback para limite
        if (currentLength > 1800) {
            this.charCount.style.color = '#ef4444';
        } else if (currentLength > 1500) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = 'var(--text-tertiary, rgba(255, 255, 255, 0.5))';
        }
    }

    updateSendButton() {
        if (!this.sendBtn || !this.chatInput) return;
        
        const hasText = this.chatInput.value.trim().length > 0;
        
        if (hasText && !this.isTyping) {
            this.sendBtn.disabled = false;
            this.sendBtn.title = 'Enviar mensagem';
        } else {
            this.sendBtn.disabled = true;
            this.sendBtn.title = this.isTyping ? 'Aguarde...' : 'Digite uma mensagem';
        }
    }

    async handleSendMessage() {
        if (!this.chatInput || this.isTyping) return;
        
        const messageText = this.chatInput.value.trim();
        if (!messageText) return;
        
        // Limpar input
        this.chatInput.value = '';
        this.adjustTextareaHeight();
        this.updateCharCount();
        this.updateSendButton();
        
        // Adicionar mensagem do usuário
        this.addMessage(messageText, 'user');
        
        // Mostrar indicador de digitação
        this.showTypingIndicator();
        
        try {
            // Simular processamento da IA (integração com Ollama)
            const response = await this.sendToAI(messageText);
            
            // Esconder indicador de digitação
            this.hideTypingIndicator();
            
            // Adicionar resposta da IA
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.hideTypingIndicator();
            this.addMessage(
                'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                'ai',
                true
            );
        }
    }

    addMessage(text, sender, isError = false) {
        if (!this.chatMessages) return;
        
        const messageGroup = document.createElement('div');
        messageGroup.className = `message-group ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender}-avatar`;
        
        if (sender === 'ai') {
            avatar.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m21 12-6-3-6-3-6 3 6 3 6 3 6-3Z"/>
                </svg>
            `;
        } else {
            avatar.textContent = this.currentUser?.name?.charAt(0).toUpperCase() || 'U';
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        if (isError) {
            messageText.style.borderColor = '#ef4444';
            messageText.style.background = 'rgba(239, 68, 68, 0.1)';
        }
        
        // Processar markdown básico
        messageText.innerHTML = this.processMarkdown(text);
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTimestamp(new Date());
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(timestamp);
        
        messageGroup.appendChild(avatar);
        messageGroup.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageGroup);
        
        // Scroll para a última mensagem
        this.scrollToBottom();
        
        // Salvar no histórico
        this.saveChatMessage({ text, sender, timestamp: new Date().toISOString() });
    }

    processMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/🎭|⏰|🏛️|⛓️|👋|✨|🚀|💡|🔒|📱|💎|🌟/g, '<span class="emoji">$&</span>');
    }

    formatTimestamp(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showTypingIndicator() {
        if (!this.typingIndicator) return;
        
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
        this.updateSendButton();
    }

    hideTypingIndicator() {
        if (!this.typingIndicator) return;
        
        this.isTyping = false;
        this.typingIndicator.classList.remove('show');
        
        setTimeout(() => {
            this.typingIndicator.style.display = 'none';
        }, 300);
        
        this.updateSendButton();
    }

    scrollToBottom() {
        if (!this.chatMessages) return;
        
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    async sendToAI(message) {
        // Primeiro tentar Ollama local/VPS
        try {
            const ollamaResponse = await this.sendToOllama(message);
            if (ollamaResponse) return ollamaResponse;
        } catch (error) {
            console.warn('Ollama não disponível, usando resposta padrão:', error);
        }
        
        // Fallback para respostas inteligentes baseadas no contexto
        return this.generateContextualResponse(message);
    }

    async sendToOllama(message) {
        const ollamaEndpoints = [
            'http://localhost:11434/api/generate',
            'https://singulai.live/api/ollama/generate',
            'http://72.60.147.56:11434/api/generate'
        ];
        
        for (const endpoint of ollamaEndpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama3.1:8b',
                        prompt: this.buildPrompt(message),
                        stream: false,
                        options: {
                            temperature: 0.7,
                            max_tokens: 1000
                        }
                    }),
                    timeout: 10000
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.response || data.content;
                }
            } catch (error) {
                console.warn(`Tentativa falhou para ${endpoint}:`, error);
                continue;
            }
        }
        
        throw new Error('Nenhum endpoint Ollama disponível');
    }

    buildPrompt(message) {
        const context = `Você é o assistente IA da SingulAI, uma plataforma de legado digital baseada em blockchain. 

Características da SingulAI:
- 🎭 Avatares Digitais: NFTs ERC721 que representam identidades digitais
- ⏰ Cápsulas do Tempo: Armazenamento temporal de conteúdo com smart contracts
- 🏛️ Legado Digital: Sistema de herança inteligente para ativos digitais
- ⛓️ Blockchain: Integração com Ethereum e Sepolia testnet

Instruções:
- Responda em português brasileiro
- Seja técnico mas acessível
- Foque em blockchain, NFTs, smart contracts e legado digital
- Use emojis relevantes: 🎭⏰🏛️⛓️✨🚀💎
- Mantenha respostas concisas (máximo 200 palavras)

Pergunta do usuário: ${message}`;

        return context;
    }

    generateContextualResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Respostas contextuais baseadas em palavras-chave
        const responses = {
            avatar: "🎭 Os **Avatares Digitais** da SingulAI são NFTs únicos que representam sua identidade no mundo digital. Cada avatar é um token ERC721 registrado na blockchain, garantindo propriedade e autenticidade.\n\n✨ **Características principais:**\n- Propriedade verificável on-chain\n- Metadados IPFS descentralizados\n- Integração com carteiras Ethereum\n- Transferência e herança programáveis",
            
            'capsula|tempo|time': "⏰ As **Cápsulas do Tempo** permitem armazenar conteúdo digital com liberação programada. Usando smart contracts, você pode:\n\n🔒 **Funcionalidades:**\n- Definir datas futuras para abertura\n- Armazenar mensagens, fotos, documentos\n- Criar heranças digitais automáticas\n- Garantir imutabilidade blockchain",
            
            'legado|herança|heritage': "🏛️ O **Sistema de Legado Digital** automatiza a transferência de ativos digitais. Com smart contracts inteligentes:\n\n💎 **Benefícios:**\n- Herança automática de NFTs e tokens\n- Definição de beneficiários múltiplos\n- Condições personalizáveis de liberação\n- Execução descentralizada e transparente",
            
            'blockchain|ethereum|web3': "⛓️ A SingulAI utiliza **tecnologia blockchain** de ponta para garantir segurança e descentralização:\n\n🚀 **Stack tecnológico:**\n- Smart contracts Solidity\n- Rede Ethereum (Sepolia para testes)\n- Web3.js para integração frontend\n- IPFS para armazenamento distribuído\n- MetaMask para autenticação",
            
            'como|help|ajuda': "✨ **Como posso ajudá-lo com a SingulAI?**\n\n🎯 **Principais tópicos:**\n- 🎭 Criação e gerenciamento de avatares\n- ⏰ Configuração de cápsulas do tempo\n- 🏛️ Planejamento de legado digital\n- ⛓️ Integração blockchain e Web3\n- 💎 Compra e uso de tokens SGL\n\nPergunte sobre qualquer funcionalidade específica!"
        };
        
        for (const [keywords, response] of Object.entries(responses)) {
            if (new RegExp(keywords).test(lowerMessage)) {
                return response;
            }
        }
        
        // Resposta padrão
        return "🤖 Olá! Sou o assistente da SingulAI, especializado em **legado digital** e **blockchain**.\n\n✨ Posso ajudá-lo com:\n- 🎭 Avatares NFT\n- ⏰ Cápsulas do Tempo\n- 🏛️ Herança Digital\n- ⛓️ Smart Contracts\n\nSobre o que gostaria de saber?";
    }

    clearChat() {
        if (!this.chatMessages) return;
        
        // Manter apenas a mensagem de boas-vindas
        const welcomeMessage = this.chatMessages.querySelector('.message-group.ai-message');
        this.chatMessages.innerHTML = '';
        
        if (welcomeMessage) {
            this.chatMessages.appendChild(welcomeMessage);
        }
        
        this.chatHistory = [];
        this.saveChatHistory();
    }

    showChatHistory() {
        console.log('Histórico do chat:', this.chatHistory);
        // Implementar modal de histórico
    }

    showSettings() {
        console.log('Configurações do chat');
        // Implementar modal de configurações
    }

    detectUser() {
        // Detectar usuário conectado (integração com sistema de auth)
        try {
            const userData = localStorage.getItem('singulai_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            } else {
                this.currentUser = { name: 'Usuário', email: 'user@singulai.com' };
            }
        } catch (error) {
            console.warn('Erro ao detectar usuário:', error);
            this.currentUser = { name: 'Usuário', email: 'user@singulai.com' };
        }
    }

    saveChatMessage(message) {
        this.chatHistory.push(message);
        this.saveChatHistory();
    }

    saveChatHistory() {
        try {
            localStorage.setItem('singulai_chat_history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.warn('Erro ao salvar histórico:', error);
        }
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('singulai_chat_history');
            if (history) {
                this.chatHistory = JSON.parse(history);
            }
        } catch (error) {
            console.warn('Erro ao carregar histórico:', error);
            this.chatHistory = [];
        }
    }
}

// Navegação entre páginas
class NavigationManager {
    constructor() {
        this.currentPage = 'chat';
        this.init();
    }

    init() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Set initial active page
        this.updateActiveNavigation();
    }

    navigateToPage(page) {
        // Update current page
        this.currentPage = page;

        // Update navigation
        this.updateActiveNavigation();

        // Show appropriate page content
        this.showPageContent(page);
    }

    updateActiveNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    showPageContent(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(pageElement => {
            pageElement.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
}

// Initialize quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SingulAI Professional Chat iniciando...');
    
    // Initialize navigation
    const navigation = new NavigationManager();
    
    // Initialize chat
    const chat = new SingulAIChatProfessional();
    
    console.log('✅ SingulAI Professional Chat carregado com sucesso!');
    
    // Global error handling
    window.addEventListener('error', (e) => {
        console.error('Erro global capturado:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promise rejeitada:', e.reason);
    });
});

// Export para uso externo
window.SingulAIChatProfessional = SingulAIChatProfessional;
window.NavigationManager = NavigationManager;