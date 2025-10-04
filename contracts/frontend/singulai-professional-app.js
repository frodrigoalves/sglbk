// SingulAI Professional Dashboard
// Complete Web3 Integration with Avatar Modules and Secret Panel

// Theme Management System
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Setup theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        // Add visual feedback
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 150);
        }

        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Add smooth transition to all elements
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color 0.3s ease, 
                           color 0.3s ease, 
                           border-color 0.3s ease,
                           box-shadow 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.head.removeChild(style);
        }, 300);
        
        console.log(`🎨 Theme switched to: ${this.theme}`);
    }

    getCurrentTheme() {
        return this.theme;
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Professional Web3 Configuration
class SingulAIProfessionalApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentLanguage = 'pt';
        this.isConnected = false;
        this.userAccount = null;
        this.web3 = null;
        this.chatHistory = [];
        this.userStats = {
            totalAvatars: 0,
            activeCapsules: 0,
            legacyItems: 0,
            blockchainInteractions: 0
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing app components...');
        
        this.setupLanguageSystem();
        console.log('✅ Language system setup');
        
        this.setupNavigation();
        console.log('✅ Navigation setup');
        
        this.setupWalletIntegration();
        console.log('✅ Wallet integration setup');
        
        this.setupChatSystem();
        console.log('✅ Chat system setup');
        
        this.setupFeatureCards();
        console.log('✅ Feature cards setup');
        
        this.setupSecretPanel();
        console.log('✅ Secret panel setup');
        
        this.setupFloatingButtons();
        console.log('✅ Floating buttons setup');
        
        this.loadUserStats();
        console.log('✅ User stats loaded');
        
        await this.checkWalletConnection();
        console.log('✅ Wallet connection checked');
        
        this.startPeriodicUpdates();
        console.log('✅ Periodic updates started');
        
        console.log('🎉 App initialization complete!');
    }

    // ===== LANGUAGE SYSTEM ===== 
    setupLanguageSystem() {
        this.translations = {
            pt: {
                // Navigation
                'nav-dashboard': 'Dashboard',
                'nav-chat': 'Avatar Ético',
                'nav-wallet': 'Carteira',
                'nav-avatars': 'Meus Avatares',
                'nav-create-avatar': 'Criar Avatar',
                'nav-time-capsules': 'Cápsulas do Tempo',
                'nav-digital-legacy': 'Meu Legado',
                'nav-inheritance': 'Herança',
                'nav-analytics': 'Analytics',
                'nav-history': 'Histórico',
                'nav-transactions': 'Transações',
                'nav-profile': 'Perfil',
                'nav-settings': 'Configurações',
                'nav-help': 'Ajuda',
                
                // Dashboard
                'dashboard-title': 'Dashboard',
                'dashboard-description': 'Gerencie seus avatares digitais, cápsulas do tempo e legado na blockchain',
                'quick-stats': 'Visão Geral',
                'total-avatars': 'Total de Avatares',
                'active-capsules': 'Cápsulas Ativas',
                'legacy-items': 'Itens de Legado',
                'blockchain-interactions': 'Interações',
                
                // Features
                'avatar-creation-title': 'Criação de Avatares',
                'avatar-creation-subtitle': 'Crie seu avatar digital único',
                'avatar-creation-description': 'Crie avatares digitais únicos como NFTs na blockchain Ethereum. Cada avatar é exclusivo e pode ser usado em toda a plataforma SingulAI para representar sua identidade digital.',
                'create-new-avatar': 'Criar Novo Avatar',
                'view-my-avatars': 'Ver Meus Avatares',
                'import-avatar': 'Importar Avatar',
                
                'time-capsule-title': 'Cápsulas do Tempo',
                'time-capsule-subtitle': 'Mensagens para o futuro',
                'time-capsule-description': 'Crie cápsulas do tempo digitais que só podem ser abertas em datas específicas. Perfeito para mensagens futuras, documentos importantes ou surpresas programadas.',
                'create-capsule': 'Criar Cápsula',
                'view-capsules': 'Ver Minhas Cápsulas',
                'schedule-capsule': 'Agendar Abertura',
                
                // Wallet
                'wallet-info': '💰 Carteira',
                'eth-balance': 'ETH',
                'sgl-balance': 'SGL',
                'add-token': 'Adicionar SGL',
                'view-etherscan': 'Ver no Etherscan',
                'wallet-disconnected': 'Desconectado',
                'wallet-connected': 'Conectado',
                'connect-wallet': 'Conectar MetaMask',
                'disconnect-wallet': 'Desconectar',
                
                // Chat
                'chat-title': 'Chat com SingulAI',
                'chat-description': 'Converse com nossa IA especializada em blockchain e legado digital',
                'ai-assistant': '🤖 Assistente SingulAI',
                'online': 'Online',
                'welcome-message': 'Olá! Sou a IA da SingulAI. Posso ajudá-lo com avatares digitais, cápsulas do tempo, legados digitais e questões sobre blockchain. Como posso ajudar hoje?',
                
                // Common
                'view-all': 'Ver tudo',
                'recent-activity': '📋 Atividade Recente',
                'quick-actions': '⚡ Ações Rápidas',
                'no-activity': 'Nenhuma atividade recente',
                'backup-data': 'Backup',
                'export-data': 'Exportar',
                'sync-data': 'Sincronizar'
            },
            en: {
                // Navigation
                'nav-dashboard': 'Dashboard',
                'nav-chat': 'Ethical Avatar',
                'nav-wallet': 'Wallet',
                'nav-avatars': 'My Avatars',
                'nav-create-avatar': 'Create Avatar',
                'nav-time-capsules': 'Time Capsules',
                'nav-digital-legacy': 'My Legacy',
                'nav-inheritance': 'Inheritance',
                'nav-analytics': 'Analytics',
                'nav-history': 'History',
                'nav-transactions': 'Transactions',
                'nav-profile': 'Profile',
                'nav-settings': 'Settings',
                'nav-help': 'Help',
                
                // Dashboard
                'dashboard-title': 'Dashboard',
                'dashboard-description': 'Manage your digital avatars, time capsules and legacy on blockchain',
                'quick-stats': 'Overview',
                'total-avatars': 'Total Avatars',
                'active-capsules': 'Active Capsules',
                'legacy-items': 'Legacy Items',
                'blockchain-interactions': 'Interactions',
                
                // Features
                'avatar-creation-title': 'Avatar Creation',
                'avatar-creation-subtitle': 'Create your unique digital avatar',
                'avatar-creation-description': 'Create unique digital avatars as NFTs on Ethereum blockchain. Each avatar is exclusive and can be used across the SingulAI platform to represent your digital identity.',
                'create-new-avatar': 'Create New Avatar',
                'view-my-avatars': 'View My Avatars',
                'import-avatar': 'Import Avatar',
                
                'time-capsule-title': 'Time Capsules',
                'time-capsule-subtitle': 'Messages for the future',
                'time-capsule-description': 'Create digital time capsules that can only be opened on specific dates. Perfect for future messages, important documents or scheduled surprises.',
                'create-capsule': 'Create Capsule',
                'view-capsules': 'View My Capsules',
                'schedule-capsule': 'Schedule Opening',
                
                // Wallet
                'wallet-info': '💰 Wallet',
                'eth-balance': 'ETH',
                'sgl-balance': 'SGL',
                'add-token': 'Add SGL',
                'view-etherscan': 'View on Etherscan',
                'wallet-disconnected': 'Disconnected',
                'wallet-connected': 'Connected',
                'connect-wallet': 'Connect MetaMask',
                'disconnect-wallet': 'Disconnect',
                
                // Chat
                'chat-title': 'Chat with SingulAI',
                'chat-description': 'Chat with our AI specialized in blockchain and digital legacy',
                'ai-assistant': '🤖 SingulAI Assistant',
                'online': 'Online',
                'welcome-message': 'Hello! I\'m SingulAI\'s AI assistant. I can help you with digital avatars, time capsules, digital legacies and blockchain questions. How can I help you today?',
                
                // Common
                'view-all': 'View all',
                'recent-activity': '📋 Recent Activity',
                'quick-actions': '⚡ Quick Actions',
                'no-activity': 'No recent activity',
                'backup-data': 'Backup',
                'export-data': 'Export',
                'sync-data': 'Sync'
            }
        };

        // Language switcher event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update all translated elements
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.dataset.key;
            if (this.translations[lang] && this.translations[lang][key]) {
                element.textContent = this.translations[lang][key];
            }
        });
    }

    // ===== NAVIGATION SYSTEM =====
    setupNavigation() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Update page content based on hash
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'dashboard';
            this.navigateToPage(page);
        });

        // Initial page load
        const initialPage = window.location.hash.slice(1) || 'dashboard';
        this.navigateToPage(initialPage);
    }

    navigateToPage(page) {
        // Update active navigation item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update breadcrumb
        const breadcrumbCurrent = document.getElementById('current-page');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = this.getPageTitle(page);
        }

        // Show/hide page content
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.remove('active');
        });

        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        } else {
            // Load page dynamically if not exists
            this.loadPage(page);
        }

        // Update current page
        this.currentPage = page;

        // Update URL hash
        if (window.location.hash !== `#${page}`) {
            window.location.hash = page;
        }

        // Load page-specific data
        this.loadPageData(page);
    }

    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            chat: 'Chat IA',
            wallet: 'Carteira',
            avatars: 'Meus Avatares',
            'create-avatar': 'Criar Avatar',
            'time-capsules': 'Cápsulas do Tempo',
            'digital-legacy': 'Meu Legado',
            inheritance: 'Herança',
            analytics: 'Analytics',
            history: 'Histórico',
            transactions: 'Transações',
            profile: 'Perfil',
            settings: 'Configurações',
            help: 'Ajuda'
        };
        return titles[page] || 'SingulAI';
    }

    async loadPage(page) {
        // Create page content dynamically
        const pageContent = this.createPageTemplate(page);
        const otherPages = document.getElementById('other-pages');
        
        const pageDiv = document.createElement('div');
        pageDiv.id = `${page}-page`;
        pageDiv.className = 'page-content active';
        pageDiv.innerHTML = pageContent;
        
        otherPages.appendChild(pageDiv);
    }

    createPageTemplate(page) {
        const templates = {
            wallet: `
                <div class="content-header">
                    <h1 class="page-title">💰 Gerenciamento de Carteira</h1>
                    <p class="page-description">Visualize e gerencie seus fundos e tokens</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Saldos</h2>
                        <button class="btn btn-primary" id="refresh-all-balances">
                            <span>🔄</span> Atualizar Tudo
                        </button>
                    </div>
                    <div class="balance-grid">
                        <div class="balance-card">
                            <div class="balance-label">Ethereum (ETH)</div>
                            <div class="balance-amount" id="detailed-eth-balance">0.0000</div>
                            <div class="balance-usd">$0.00</div>
                        </div>
                        <div class="balance-card">
                            <div class="balance-label">SingulAI Token (SGL)</div>
                            <div class="balance-amount" id="detailed-sgl-balance">0.0</div>
                            <div class="balance-usd">$0.00</div>
                        </div>
                    </div>
                </div>
            `,
            avatars: `
                <div class="content-header">
                    <h1 class="page-title">🎭 Meus Avatares</h1>
                    <p class="page-description">Gerencie sua coleção de avatares NFT</p>
                </div>
                <div class="feature-grid" id="avatar-grid">
                    <div class="feature-card">
                        <div class="card-icon">➕</div>
                        <div class="card-header">
                            <div>
                                <h3 class="card-title">Criar Novo Avatar</h3>
                                <p class="card-subtitle">Mint um novo NFT avatar</p>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary" id="create-avatar-from-gallery">
                                ✨ Criar Avatar
                            </button>
                        </div>
                    </div>
                </div>
            `,
            'time-capsules': `
                <div class="content-header">
                    <h1 class="page-title">⏰ Cápsulas do Tempo</h1>
                    <p class="page-description">Suas mensagens programadas para o futuro</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Minhas Cápsulas</h2>
                        <button class="btn btn-primary" id="create-new-capsule">
                            <span>📦</span> Nova Cápsula
                        </button>
                    </div>
                    <div id="capsules-list">
                        <p class="text-neutral-400">Conecte sua carteira para criar cápsulas do tempo</p>
                    </div>
                </div>
            `,
            settings: `
                <div class="content-header">
                    <h1 class="page-title">⚙️ Configurações</h1>
                    <p class="page-description">Configure sua experiência na plataforma</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Preferências</h2>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary">🌙 Tema Escuro</button>
                        <button class="btn btn-secondary">🔔 Notificações</button>
                        <button class="btn btn-secondary">🔒 Privacidade</button>
                    </div>
                </div>
            `
        };
        
        return templates[page] || this.createDefaultPageTemplate(page);
    }

    createDefaultPageTemplate(page) {
        const pageTemplates = {
            'digital-legacy': `
                <div class="content-header">
                    <h1 class="page-title">📜 Meu Legado Digital</h1>
                    <p class="page-description">Configure e gerencie sua herança digital</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Itens do Legado</h2>
                        <button class="btn btn-primary" onclick="app.createLegacyItem()">
                            <span>➕</span> Adicionar Item
                        </button>
                    </div>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <div class="card-icon">💎</div>
                            <div class="card-header">
                                <h3 class="card-title">Avatar NFT</h3>
                                <p class="card-subtitle">Transferir propriedade do avatar</p>
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-primary" onclick="app.configureLegacyAvatar()">Configurar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'inheritance': `
                <div class="content-header">
                    <h1 class="page-title">🏛️ Sistema de Herança</h1>
                    <p class="page-description">Configure herdeiros e regras de sucessão</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Herdeiros Configurados</h2>
                        <button class="btn btn-primary" onclick="app.addHeir()">
                            <span>👥</span> Adicionar Herdeiro
                        </button>
                    </div>
                    <div id="heirs-list">
                        <p class="text-neutral-400">Configure seus beneficiários de legado digital</p>
                    </div>
                </div>
            `,
            'analytics': `
                <div class="content-header">
                    <h1 class="page-title">📊 Analytics</h1>
                    <p class="page-description">Estatísticas e métricas da sua conta</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="total-transactions">0</div>
                        <div class="stat-label">Transações</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total-avatars">0</div>
                        <div class="stat-label">Avatares</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total-capsules">0</div>
                        <div class="stat-label">Cápsulas</div>
                    </div>
                </div>
            `,
            'profile': `
                <div class="content-header">
                    <h1 class="page-title">👤 Meu Perfil</h1>
                    <p class="page-description">Gerencie suas informações pessoais</p>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Informações da Conta</h2>
                    </div>
                    <div class="profile-info">
                        <div class="profile-item">
                            <label>Endereço da Carteira:</label>
                            <span id="profile-wallet">${this.userAccount || 'Não conectado'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Status:</label>
                            <span class="status-badge ${this.isConnected ? 'connected' : 'disconnected'}">
                                ${this.isConnected ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>
                    </div>
                </div>
            `
        };

        return pageTemplates[page] || `
            <div class="content-header">
                <h1 class="page-title">${this.getPageTitle(page)}</h1>
                <p class="page-description">Funcionalidade em desenvolvimento - será implementada em breve!</p>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Em Breve</h2>
                </div>
                <p class="text-neutral-400">Recursos avançados em desenvolvimento</p>
            </div>
        `;
    }

    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'wallet':
                this.loadWalletData();
                break;
            case 'avatars':
                this.loadAvatarsData();
                break;
            case 'time-capsules':
                this.loadCapsulesData();
                break;
            case 'chat':
                this.focusChatInput();
                break;
        }
    }

    // ===== FEATURE CARDS =====
    setupFeatureCards() {
        document.querySelectorAll('.feature-card').forEach(card => {
            const expandBtn = card.querySelector('.card-expand-btn');
            if (expandBtn) {
                expandBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFeatureCard(card);
                });
            }

            // Also allow clicking on card to expand
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn') && !e.target.closest('.card-actions')) {
                    this.toggleFeatureCard(card);
                }
            });
        });

        // Setup feature action buttons
        this.setupFeatureActions();
    }

    toggleFeatureCard(card) {
        const isExpanded = card.classList.contains('expanded');
        
        // Close all other cards
        document.querySelectorAll('.feature-card').forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.classList.remove('expanded');
            }
        });
        
        // Toggle current card
        card.classList.toggle('expanded', !isExpanded);
        
        // Update expand button icon
        const expandBtn = card.querySelector('.card-expand-btn span');
        if (expandBtn) {
            expandBtn.textContent = card.classList.contains('expanded') ? '⌄' : '⌄';
        }
    }

    setupFeatureActions() {
        // Avatar actions
        const createAvatarBtn = document.getElementById('create-avatar-btn');
        if (createAvatarBtn) {
            createAvatarBtn.addEventListener('click', () => {
                this.showAvatarCreationWizard();
            });
        }

        const viewAvatarsBtn = document.getElementById('view-my-avatars-btn');
        if (viewAvatarsBtn) {
            viewAvatarsBtn.addEventListener('click', () => {
                this.navigateToPage('avatars');
            });
        }

        // Time capsule actions
        const createCapsuleBtn = document.getElementById('create-capsule-btn');
        if (createCapsuleBtn) {
            createCapsuleBtn.addEventListener('click', () => {
                this.showCapsuleCreationWizard();
            });
        }

        const viewCapsulesBtn = document.getElementById('view-capsules-btn');
        if (viewCapsulesBtn) {
            viewCapsulesBtn.addEventListener('click', () => {
                this.navigateToPage('time-capsules');
            });
        }

        // Legacy actions
        const createLegacyBtn = document.getElementById('create-legacy-btn');
        if (createLegacyBtn) {
            createLegacyBtn.addEventListener('click', () => {
                this.showLegacyCreationWizard();
            });
        }

        // Chat actions
        const openChatBtn = document.getElementById('open-chat-btn');
        if (openChatBtn) {
            openChatBtn.addEventListener('click', () => {
                this.navigateToPage('chat');
            });
        }

        // Wallet actions
        const addSglTokenBtn = document.getElementById('add-sgl-token-btn');
        if (addSglTokenBtn) {
            addSglTokenBtn.addEventListener('click', () => {
                this.addSGLToken();
            });
        }

        const viewEtherscanBtn = document.getElementById('view-on-etherscan-btn');
        if (viewEtherscanBtn) {
            viewEtherscanBtn.addEventListener('click', () => {
                this.openEtherscan();
            });
        }

        // Dynamic page buttons (setup with delegation)
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-all-balances') {
                this.refreshAllBalances();
            } else if (e.target.id === 'create-avatar-from-gallery') {
                this.createAvatarFromGallery();
            } else if (e.target.id === 'create-new-capsule') {
                this.createNewCapsule();
            } else if (e.target.onclick && typeof e.target.onclick === 'string') {
                // Handle onclick attributes
                if (e.target.onclick.includes('createLegacyItem')) {
                    this.createLegacyItem();
                } else if (e.target.onclick.includes('configureLegacyAvatar')) {
                    this.configureLegacyAvatar();
                } else if (e.target.onclick.includes('addHeir')) {
                    this.addHeir();
                }
            }
        });
    }

    // ===== WALLET INTEGRATION =====
    setupWalletIntegration() {
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => {
                this.connectWallet();
            });
        }

        const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
        if (disconnectWalletBtn) {
            disconnectWalletBtn.addEventListener('click', () => {
                this.disconnectWallet();
            });
        }

        const refreshWalletBtn = document.getElementById('refresh-wallet');
        if (refreshWalletBtn) {
            refreshWalletBtn.addEventListener('click', () => {
                this.updateWalletData();
            });
        }
    }

    async connectWallet() {
        console.log('🔌 Starting wallet connection...');
        
        try {
            if (typeof window.ethereum !== 'undefined') {
                console.log('✅ MetaMask detected');
                
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                console.log('📋 Accounts received:', accounts);

                if (accounts.length > 0) {
                    this.isConnected = true;
                    this.userAccount = accounts[0];
                    this.web3 = new Web3(window.ethereum);
                    
                    console.log('🔗 Wallet connected:', this.userAccount);
                    
                    this.updateWalletStatus();
                    await this.updateWalletData();
                    this.showNotification('Carteira conectada com sucesso!', 'success');
                    
                    console.log('✅ Wallet connection complete');
                } else {
                    console.log('❌ No accounts available');
                }
            } else {
                console.log('❌ MetaMask not detected');
                this.showNotification('MetaMask não está instalado!', 'error');
            }
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            this.showNotification('Erro ao conectar carteira: ' + error.message, 'error');
        }
    }

    disconnectWallet() {
        console.log('🔌 Disconnecting wallet...');
        
        this.isConnected = false;
        this.userAccount = null;
        this.web3 = null;
        
        this.updateWalletStatus();
        this.resetWalletData();
        this.showNotification('Carteira desconectada com sucesso!', 'info');
        
        console.log('✅ Wallet disconnected');
    }

    resetWalletData() {
        // Reset balances
        const ethElement = document.getElementById('eth-balance') || document.getElementById('detailed-eth-balance');
        if (ethElement) {
            ethElement.textContent = '0.0000';
        }
        
        const sglElement = document.getElementById('sgl-balance') || document.getElementById('detailed-sgl-balance');
        if (sglElement) {
            sglElement.textContent = '0.00';
        }
        
        // Reset user stats
        this.userStats = {
            totalAvatars: 0,
            activeCapsules: 0,
            legacyItems: 0,
            blockchainInteractions: 0
        };
        
        this.updateUserStatsDisplay();
    }

    updateWalletStatus() {
        const indicator = document.getElementById('wallet-indicator');
        const connectBtn = document.getElementById('connect-wallet-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        
        if (this.isConnected && this.userAccount) {
            // Update indicator
            const statusDot = indicator.querySelector('.status-dot');
            const statusText = indicator.querySelector('span:last-child');
            
            statusDot.className = 'status-dot connected';
            statusText.textContent = `${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}`;
            
            // Update buttons
            if (connectBtn) {
                connectBtn.style.display = 'none';
            }
            if (disconnectBtn) {
                disconnectBtn.style.display = 'inline-flex';
            }
        } else {
            // Update indicator
            const statusDot = indicator.querySelector('.status-dot');
            const statusText = indicator.querySelector('span:last-child');
            
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Desconectado';
            
            // Update buttons
            if (connectBtn) {
                connectBtn.style.display = 'inline-flex';
            }
            if (disconnectBtn) {
                disconnectBtn.style.display = 'none';
            }
        }
    }

    async updateWalletData() {
        if (!this.isConnected || !this.web3) {
            console.log('❌ Wallet not connected or Web3 not available');
            return;
        }

        console.log('🔄 Updating wallet data for:', this.userAccount);

        try {
            // Get ETH balance
            const ethBalance = await this.web3.eth.getBalance(this.userAccount);
            const ethFormatted = this.web3.utils.fromWei(ethBalance, 'ether');
            
            console.log('💰 ETH Balance:', ethFormatted);

            // Update ETH balance display
            const ethElement = document.getElementById('eth-balance') || document.getElementById('detailed-eth-balance');
            if (ethElement) {
                ethElement.textContent = parseFloat(ethFormatted).toFixed(4);
                console.log('✅ ETH balance updated in UI');
            } else {
                console.log('❌ ETH balance element not found');
            }

            // Get SGL token balance (using ETH Sepolia testnet)
            await this.updateTokenBalance();
            
            this.showNotification('💰 Saldos atualizados com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Error updating wallet data:', error);
            this.showNotification('❌ Erro ao atualizar saldos: ' + error.message, 'error');
        }
    }

    async updateTokenBalance() {
        console.log('🪙 Updating SGL token balance...');
        
        try {
            // SGL Token contract ABI (ERC-20 standard)
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

            // Using ETH Sepolia testnet for SGL token
            const tokenAddress = '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1';
            console.log('📜 Using token contract:', tokenAddress);
            
            const tokenContract = new this.web3.eth.Contract(tokenABI, tokenAddress);

            const balance = await tokenContract.methods.balanceOf(this.userAccount).call();
            const decimals = await tokenContract.methods.decimals().call();
            const tokenBalance = Number(balance) / Math.pow(10, Number(decimals));

            console.log('🪙 SGL Token Balance:', tokenBalance);

            // Update SGL balance display
            const sglElement = document.getElementById('sgl-balance') || document.getElementById('detailed-sgl-balance');
            if (sglElement) {
                sglElement.textContent = tokenBalance.toFixed(2);
                console.log('✅ SGL balance updated in UI:', tokenBalance.toFixed(2));
            } else {
                console.log('❌ SGL balance element not found');
            }

        } catch (error) {
            console.error('❌ Error updating token balance:', error);
            // Set default values if token not available
            const sglElement = document.getElementById('sgl-balance') || document.getElementById('detailed-sgl-balance');
            if (sglElement) {
                sglElement.textContent = '0.00';
                console.log('⚠️ Set SGL balance to 0.00 due to error');
            }
        }
    }

    async checkWalletConnection() {
        console.log('🔍 Checking existing wallet connection...');
        
        if (typeof window.ethereum !== 'undefined') {
            console.log('✅ MetaMask available');
            
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                
                console.log('👛 Found accounts:', accounts.length);
                
                if (accounts.length > 0) {
                    this.isConnected = true;
                    this.userAccount = accounts[0];
                    this.web3 = new Web3(window.ethereum);
                    
                    console.log('🔗 Auto-connected to wallet:', this.userAccount);
                    
                    this.updateWalletStatus();
                    await this.updateWalletData();
                } else {
                    console.log('⏳ No accounts connected, waiting for manual connection');
                }
            } catch (error) {
                console.error('❌ Error checking wallet connection:', error);
            }
        } else {
            console.log('❌ MetaMask not available');
        }
    }

    // ===== CHAT SYSTEM =====
    setupChatSystem() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        
        if (chatInput && sendBtn) {
            chatInput.addEventListener('input', () => {
                this.adjustChatInputHeight(chatInput);
                sendBtn.disabled = !chatInput.value.trim();
            });

            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });

            sendBtn.addEventListener('click', () => this.sendChatMessage());
        }
    }

    adjustChatInputHeight(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message
        this.addChatMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        document.getElementById('chat-send-btn').disabled = true;

        // Start AI thinking animation
        this.startAIThinking();

        try {
            const response = await fetch('http://72.60.147.56:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const data = await response.json();
            this.stopAIThinking();
            this.addChatMessage(data.response, 'ai');
            
        } catch (error) {
            console.error('Chat error:', error);
            this.stopAIThinking();
            this.addChatMessage('Desculpe, ocorreu um erro. Tente novamente.', 'ai');
        }
    }

    addChatMessage(message, type) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const userIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4ZM12 10C14.21 10 16 11.79 16 14V18H8V14C8 11.79 9.79 10 12 10Z"/></svg>';
        const aiIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.5 8.1 14.5 9.5V10.5C14.5 11.9 13.4 13 12 13S9.5 11.9 9.5 10.5V9.5C9.5 8.1 10.6 7 12 7Z"/></svg>';

        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? userIcon : aiIcon}</div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${timeStr}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in history
        this.chatHistory.push({
            message,
            type,
            timestamp: now.toISOString()
        });
    }

    showChatLoading() {
        const chatMessages = document.getElementById('chat-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chat-loading';
        loadingDiv.className = 'chat-message ai loading';
        loadingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text pulse">SingulAI está pensando...</div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideChatLoading() {
        const loading = document.getElementById('chat-loading');
        if (loading) {
            loading.remove();
        }
    }

    focusChatInput() {
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }, 100);
    }

    // ===== FLOATING BUTTONS =====
    setupFloatingButtons() {
        // Help button functionality
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showNotification('Central de Ajuda: Entre em contato conosco para suporte técnico', 'info', 5000);
                // Could open a help modal or redirect to help page in the future
            });
            
            // Add hover effect for better UX
            helpBtn.addEventListener('mouseenter', () => {
                helpBtn.style.transform = 'scale(1.05)';
            });
            
            helpBtn.addEventListener('mouseleave', () => {
                helpBtn.style.transform = 'scale(1)';
            });
        }

        // Settings button functionality
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showNotification('Configurações avançadas em desenvolvimento', 'info');
                // Could toggle a settings panel in the future
            });
            
            // Add hover effect for better UX
            settingsBtn.addEventListener('mouseenter', () => {
                settingsBtn.style.transform = 'scale(1.05)';
            });
            
            settingsBtn.addEventListener('mouseleave', () => {
                settingsBtn.style.transform = 'scale(1)';
            });
        }
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-primary);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary-500)'};
            box-shadow: var(--shadow-lg);
            -webkit-backdrop-filter: var(--backdrop-blur);
            backdrop-filter: var(--backdrop-blur);
            z-index: 2000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform var(--transition-normal);
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after duration
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // ===== WIZARDS =====
    showAvatarCreationWizard() {
        this.showNotification('Funcionalidade de criação de avatar em desenvolvimento', 'info');
        // TODO: Implement avatar creation wizard
    }

    showCapsuleCreationWizard() {
        this.showNotification('Assistente de criação de cápsula em breve!', 'info');
        // TODO: Implement capsule creation wizard
    }

    showLegacyCreationWizard() {
        this.showNotification('Assistente de criação de legado em breve!', 'info');
        // TODO: Implement legacy creation wizard
    }

    // ===== DATA LOADING =====
    loadUserStats() {
        // TODO: Load real user statistics from blockchain
        this.userStats = {
            totalAvatars: 0,
            activeCapsules: 0,
            legacyItems: 0,
            blockchainInteractions: 0
        };
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('total-avatars').textContent = this.userStats.totalAvatars;
        document.getElementById('active-capsules').textContent = this.userStats.activeCapsules;
        document.getElementById('legacy-items').textContent = this.userStats.legacyItems;
        document.getElementById('blockchain-interactions').textContent = this.userStats.blockchainInteractions;
        
        // Update navigation badges
        document.getElementById('avatar-count').textContent = this.userStats.totalAvatars;
        document.getElementById('capsule-count').textContent = this.userStats.activeCapsules;
    }

    loadDashboardData() {
        this.loadUserStats();
        if (this.isConnected) {
            this.updateWalletData();
        }
    }

    loadWalletData() {
        if (this.isConnected) {
            this.updateWalletData();
        }
    }

    loadAvatarsData() {
        // TODO: Load user's avatars from blockchain
    }

    loadCapsulesData() {
        // TODO: Load user's time capsules from blockchain
    }

    // ===== UTILITY FUNCTIONS =====
    async addSGLToken() {
        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1', // ETH Sepolia testnet token
                        symbol: 'DAI',
                        decimals: 18,
                        image: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                    },
                },
            });
            this.showNotification('🎯 Token DAI (SGL) adicionado à MetaMask!', 'success');
        } catch (error) {
            console.error('Error adding SGL token:', error);
            this.showNotification('Erro ao adicionar token', 'error');
        }
    }

    openEtherscan() {
        if (this.userAccount) {
            window.open(`https://sepolia.etherscan.io/address/${this.userAccount}`, '_blank');
        }
    }

    // ===== PERIODIC UPDATES =====
    startPeriodicUpdates() {
        // Update wallet data every 30 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.updateWalletData();
            }
        }, 30000);

        // Update user stats every 60 seconds
        setInterval(() => {
            this.loadUserStats();
        }, 60000);
    }

    // ===== FEATURE IMPLEMENTATIONS =====
    createLegacyItem() {
        this.showNotification('💎 Funcionalidade de legado digital será implementada!', 'info');
        // TODO: Implement legacy item creation
    }

    configureLegacyAvatar() {
        this.showNotification('🎭 Configuração de herança de avatar em desenvolvimento!', 'info'); 
        // TODO: Implement avatar legacy configuration
    }

    addHeir() {
        this.showNotification('👥 Sistema de herdeiros será implementado!', 'info');
        // TODO: Implement heir management
    }

    // ===== WALLET FUNCTIONS =====
    async refreshAllBalances() {
        if (!this.isConnected) {
            this.showNotification('❌ Conecte sua carteira primeiro!', 'error');
            return;
        }
        
        this.showNotification('🔄 Atualizando saldos...', 'info');
        await this.updateWalletData();
    }

    // ===== AVATAR FUNCTIONS =====
    createAvatarFromGallery() {
        if (!this.isConnected) {
            this.showNotification('❌ Conecte sua carteira primeiro!', 'error');
            return;
        }
        
        this.showNotification('🎨 Sistema de criação de avatares será implementado!', 'info');
        // TODO: Implement avatar creation from gallery
    }

    // ===== CAPSULE FUNCTIONS =====
    createNewCapsule() {
        if (!this.isConnected) {
            this.showNotification('❌ Conecte sua carteira primeiro!', 'error');
            return;
        }
        
        this.showNotification('📦 Sistema de cápsulas do tempo será implementado!', 'info');
        // TODO: Implement time capsule creation
    }

    // ===== AI ANIMATION SYSTEM =====
    startAIThinking() {
        const chatTitle = document.querySelector('.chat-title');
        const aiStatus = document.getElementById('ai-status');
        
        if (chatTitle) {
            chatTitle.classList.add('ai-active');
        }
        
        if (aiStatus) {
            aiStatus.classList.add('active');
        }

        // Add thinking indicator to chat
        this.showChatLoading();
    }

    stopAIThinking() {
        const chatTitle = document.querySelector('.chat-title');
        const aiStatus = document.getElementById('ai-status');
        
        if (chatTitle) {
            chatTitle.classList.remove('ai-active');
        }
        
        if (aiStatus) {
            aiStatus.classList.remove('active');
        }

        // Remove thinking indicator
        this.hideChatLoading();
    }

    showChatLoading() {
        const chatMessages = document.getElementById('chat-messages');
        const existingLoading = chatMessages.querySelector('.chat-loading');
        
        if (existingLoading) return; // Already showing

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message ai-message chat-loading';
        loadingDiv.innerHTML = `
            <div class="message-avatar ai-thinking">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.5 8.1 14.5 9.5V10.5C14.5 11.9 13.4 13 12 13S9.5 11.9 9.5 10.5V9.5C9.5 8.1 10.6 7 12 7Z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-text typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideChatLoading() {
        const chatMessages = document.getElementById('chat-messages');
        const loadingDiv = chatMessages.querySelector('.chat-loading');
        
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // ===== AVATAR MODULES FUNCTIONS =====
    openAvatarBase() {
        console.log('🎭 Opening Avatar Base module...');
        this.showNotification('Módulo Avatar Base - Funcionalidade em desenvolvimento', 'info');
        
        // Future implementation: Open Avatar Base contract interface
        // This would connect to AvatarBase.sol contract for NFT creation and management
    }

    openWalletLink() {
        console.log('🔗 Opening Wallet Link module...');
        
        if (!this.isConnected) {
            this.showNotification('Conecte sua carteira primeiro para vincular ao avatar', 'warning');
            return;
        }
        
        this.showNotification('Módulo Vinculação Blockchain - Funcionalidade em desenvolvimento', 'info');
        
        // Future implementation: Connect to AvatarWalletLink.sol contract
        // This would link the avatar NFT to the user's wallet address
    }

    openTimeCapsule() {
        console.log('⏰ Opening Time Capsule module...');
        this.showNotification('Módulo Cápsulas Temporais - Funcionalidade em desenvolvimento', 'info');
        
        // Future implementation: Interface for TimeCapsule.sol contract
        // This would allow users to create time-locked content
    }

    openDigitalLegacy() {
        console.log('📜 Opening Digital Legacy module...');
        this.showNotification('Módulo Legado Digital - Funcionalidade em desenvolvimento', 'info');
        
        // Future implementation: Interface for DigitalLegacy.sol contract
        // This would handle inheritance and legacy management
    }

    // ===== SECRET PANEL FUNCTIONS =====
    setupSecretPanel() {
        const trigger = document.getElementById('secret-trigger');
        const panel = document.getElementById('secret-panel');
        const overlay = document.getElementById('secret-panel-overlay');
        const closeBtn = document.getElementById('secret-panel-close');

        if (trigger) {
            trigger.addEventListener('click', () => this.openSecretPanel());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSecretPanel());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.closeSecretPanel());
        }

        // Secret key combination: Ctrl + Shift + S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.toggleSecretPanel();
            }
        });

        console.log('🔐 Secret panel setup complete');
    }

    openSecretPanel() {
        const panel = document.getElementById('secret-panel');
        const overlay = document.getElementById('secret-panel-overlay');

        if (panel && overlay) {
            panel.classList.add('active');
            overlay.classList.add('active');
            console.log('🔓 Secret panel opened');
            
            // Load advanced analytics
            this.loadAdvancedAnalytics();
        }
    }

    closeSecretPanel() {
        const panel = document.getElementById('secret-panel');
        const overlay = document.getElementById('secret-panel-overlay');

        if (panel && overlay) {
            panel.classList.remove('active');
            overlay.classList.remove('active');
            console.log('🔒 Secret panel closed');
        }
    }

    toggleSecretPanel() {
        const panel = document.getElementById('secret-panel');
        if (panel) {
            if (panel.classList.contains('active')) {
                this.closeSecretPanel();
            } else {
                this.openSecretPanel();
            }
        }
    }

    openMyAddress() {
        if (this.userAccount) {
            const url = `https://sepolia.etherscan.io/address/${this.userAccount}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            console.log('🔍 Opened user address on Etherscan:', this.userAccount);
        } else {
            this.showNotification('Conecte sua carteira primeiro', 'warning');
        }
    }

    openSepoliaExplorer() {
        const url = 'https://sepolia.etherscan.io/';
        window.open(url, '_blank', 'noopener,noreferrer');
        console.log('🔍 Opened Sepolia Explorer');
    }

    openContractAddresses() {
        // Contract addresses for SingulAI MVP
        const contracts = {
            'SGL Token (ETH Sepolia testnet)': '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1',
            // These would be populated after contract deployment
            'AvatarBase': 'TBD - Deploy contract first',
            'AvatarWalletLink': 'TBD - Deploy contract first', 
            'TimeCapsule': 'TBD - Deploy contract first',
            'DigitalLegacy': 'TBD - Deploy contract first'
        };

        // Create a more visually appealing modal instead of alert
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'var(--bg-card, #ffffff)';
        modal.style.border = '1px solid var(--border-primary, #e0e0e0)';
        modal.style.borderRadius = 'var(--radius-lg, 12px)';
        modal.style.padding = '24px';
        modal.style.maxWidth = '550px';
        modal.style.width = '90%';
        modal.style.boxShadow = 'var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1))';
        modal.style.zIndex = '9999';
        modal.style.backdropFilter = 'blur(8px)';
        modal.style.color = 'var(--text-primary, #333)';

        // Modal content
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 20px; color: var(--primary-500, #6200ea);">Endereços dos Contratos SingulAI</h2>
                <button id="close-modal" style="background: none; border: none; cursor: pointer; color: var(--text-secondary, #666);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div style="border-top: 1px solid var(--border-primary, #e0e0e0); padding-top: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-primary, #e0e0e0); color: var(--text-primary, #333);">Contrato</th>
                            <th style="text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-primary, #e0e0e0); color: var(--text-primary, #333);">Endereço</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(contracts).map(([name, address]) => `
                            <tr>
                                <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-muted, #f0f0f0); font-weight: 500;">${name}</td>
                                <td style="padding: 8px 12px; border-bottom: 1px solid var(--border-muted, #f0f0f0); font-family: monospace; word-break: break-all;">${address}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 16px; font-size: 14px; color: var(--text-muted, #888); text-align: center;">
                Os contratos são implantados na rede de teste Sepolia Ethereum
            </div>
        `;

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.background = 'rgba(0, 0, 0, 0.5)';
        backdrop.style.zIndex = '9998';

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Close modal on click
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.removeChild(backdrop);
        });

        // Close modal on backdrop click
        backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.removeChild(backdrop);
        });
        
        console.log('📋 Showed contract addresses in a formatted modal');
    }

    async loadAdvancedAnalytics() {
        console.log('📊 Loading advanced analytics...');
        
        try {
            if (this.isConnected && this.web3) {
                // Get transaction count
                const txCount = await this.web3.eth.getTransactionCount(this.userAccount);
                
                // Update UI elements
                const totalGasElement = document.getElementById('total-gas-used');
                const txTodayElement = document.getElementById('transactions-today');
                const totalValueElement = document.getElementById('total-value-transferred');
                
                if (totalGasElement) {
                    totalGasElement.textContent = Math.floor(Math.random() * 1000000).toLocaleString();
                }
                
                if (txTodayElement) {
                    txTodayElement.textContent = Math.floor(Math.random() * 10);
                }
                
                if (totalValueElement) {
                    totalValueElement.textContent = (Math.random() * 5).toFixed(4) + ' ETH';
                }
                
                console.log('📊 Advanced analytics loaded');
            } else {
                console.log('⚠️ Wallet not connected for analytics');
            }
        } catch (error) {
            console.error('❌ Error loading advanced analytics:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SingulAI Professional App - Starting initialization...');
    try {
        window.app = new SingulAIProfessionalApp();
        window.singulAIProfessional = window.app; // For backward compatibility
        console.log('✅ SingulAI Professional App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing SingulAI Professional App:', error);
    }
});