// SingulAI Professional - Tooltips & Help System
class SingulAIHelpSystem {
    constructor() {
        this.tooltips = {
            pt: {
                'connect-wallet-btn': 'Conecte sua carteira MetaMask para acessar recursos blockchain',
                'create-avatar-btn': 'Crie um avatar digital único como NFT na blockchain Ethereum',
                'create-capsule-btn': 'Crie uma cápsula do tempo que só pode ser aberta em data futura',
                'create-legacy-btn': 'Configure seu legado digital para herança automática',
                'open-chat-btn': 'Converse com nossa IA especializada em blockchain',
                'refresh-wallet': 'Atualize os saldos da sua carteira',
                'add-sgl-token-btn': 'Adicione o token SGL à sua carteira MetaMask',
                'view-on-etherscan-btn': 'Visualize sua carteira no explorador Etherscan',
                'eth-balance': 'Seu saldo atual de Ethereum (ETH)',
                'sgl-balance': 'Seu saldo atual de tokens SingulAI (SGL)',
                'total-avatars': 'Número total de avatares NFT que você possui',
                'active-capsules': 'Cápsulas do tempo ativas aguardando abertura',
                'legacy-items': 'Itens configurados em seu legado digital',
                'blockchain-interactions': 'Total de transações realizadas na blockchain',
                'nav-dashboard': 'Visão geral da sua conta e estatísticas',
                'nav-chat': 'Chat com assistente IA especializado',
                'nav-wallet': 'Gerencie seus fundos e tokens',
                'nav-avatars': 'Visualize e gerencie seus avatares NFT',
                'nav-create-avatar': 'Assistente para criação de novos avatares',
                'nav-time-capsules': 'Suas cápsulas do tempo e mensagens futuras',
                'nav-digital-legacy': 'Configure seu legado digital',
                'nav-inheritance': 'Gerencie herança e beneficiários',
                'nav-analytics': 'Análises e relatórios da sua atividade',
                'nav-history': 'Histórico completo de ações',
                'nav-transactions': 'Todas as transações blockchain',
                'nav-profile': 'Configurações do seu perfil',
                'nav-settings': 'Preferências e configurações',
                'nav-help': 'Documentação e suporte'
            },
            en: {
                'connect-wallet-btn': 'Connect your MetaMask wallet to access blockchain features',
                'create-avatar-btn': 'Create a unique digital avatar as NFT on Ethereum blockchain',
                'create-capsule-btn': 'Create a time capsule that can only be opened on future date',
                'create-legacy-btn': 'Set up your digital legacy for automatic inheritance',
                'open-chat-btn': 'Chat with our AI specialized in blockchain',
                'refresh-wallet': 'Refresh your wallet balances',
                'add-sgl-token-btn': 'Add SGL token to your MetaMask wallet',
                'view-on-etherscan-btn': 'View your wallet on Etherscan explorer',
                'eth-balance': 'Your current Ethereum (ETH) balance',
                'sgl-balance': 'Your current SingulAI (SGL) token balance',
                'total-avatars': 'Total number of avatar NFTs you own',
                'active-capsules': 'Active time capsules waiting to be opened',
                'legacy-items': 'Items configured in your digital legacy',
                'blockchain-interactions': 'Total transactions performed on blockchain',
                'nav-dashboard': 'Overview of your account and statistics',
                'nav-chat': 'Chat with specialized AI assistant',
                'nav-wallet': 'Manage your funds and tokens',
                'nav-avatars': 'View and manage your avatar NFTs',
                'nav-create-avatar': 'Assistant for creating new avatars',
                'nav-time-capsules': 'Your time capsules and future messages',
                'nav-digital-legacy': 'Configure your digital legacy',
                'nav-inheritance': 'Manage inheritance and beneficiaries',
                'nav-analytics': 'Analytics and reports of your activity',
                'nav-history': 'Complete history of actions',
                'nav-transactions': 'All blockchain transactions',
                'nav-profile': 'Your profile settings',
                'nav-settings': 'Preferences and settings',
                'nav-help': 'Documentation and support'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupTooltips();
        this.setupHelpModal();
        this.setupContextualHelp();
    }
    
    setupTooltips() {
        // Add tooltips to all elements with data-tooltip-key
        document.querySelectorAll('[data-tooltip-key]').forEach(element => {
            const key = element.dataset.tooltipKey;
            this.addTooltip(element, key);
        });
        
        // Add tooltips to navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.dataset.page;
            if (page) {
                this.addTooltip(item, `nav-${page}`);
            }
        });
        
        // Add tooltips to buttons with IDs
        ['connect-wallet-btn', 'create-avatar-btn', 'create-capsule-btn', 
         'create-legacy-btn', 'open-chat-btn', 'refresh-wallet', 
         'add-sgl-token-btn', 'view-on-etherscan-btn'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.addTooltip(element, id);
            }
        });
        
        // Add tooltips to stat elements
        ['total-avatars', 'active-capsules', 'legacy-items', 
         'blockchain-interactions'].forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentElement) {
                this.addTooltip(element.parentElement, id);
            }
        });
    }
    
    addTooltip(element, key) {
        const currentLang = window.singulAIProfessional?.currentLanguage || 'pt';
        const tooltipText = this.tooltips[currentLang]?.[key];
        
        if (tooltipText) {
            element.dataset.tooltip = tooltipText;
        }
    }
    
    updateTooltipsLanguage(lang) {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const key = element.dataset.tooltipKey || 
                      element.id || 
                      (element.classList.contains('nav-item') ? `nav-${element.dataset.page}` : null);
            
            if (key && this.tooltips[lang]?.[key]) {
                element.dataset.tooltip = this.tooltips[lang][key];
            }
        });
    }
    
    setupHelpModal() {
        // Create help modal structure
        const helpModal = document.createElement('div');
        helpModal.id = 'help-modal';
        helpModal.className = 'modal hidden';
        helpModal.innerHTML = `
            <div class="modal-overlay" id="help-modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎓 Guia SingulAI</h2>
                    <button class="modal-close" id="help-modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="help-sections">
                        <div class="help-section">
                            <h3>🚀 Primeiros Passos</h3>
                            <ol>
                                <li>Conecte sua carteira MetaMask</li>
                                <li>Adicione o token SGL à sua carteira</li>
                                <li>Crie seu primeiro avatar digital</li>
                                <li>Configure uma cápsula do tempo</li>
                            </ol>
                        </div>
                        <div class="help-section">
                            <h3>💰 Carteira</h3>
                            <p>Gerencie seus fundos ETH e tokens SGL. A carteira é sua interface com a blockchain Ethereum.</p>
                        </div>
                        <div class="help-section">
                            <h3>🎭 Avatares</h3>
                            <p>Crie avatares digitais únicos como NFTs. Cada avatar é um token não fungível exclusivo.</p>
                        </div>
                        <div class="help-section">
                            <h3>⏰ Cápsulas do Tempo</h3>
                            <p>Crie mensagens que só podem ser abertas em datas futuras específicas.</p>
                        </div>
                        <div class="help-section">
                            <h3>🤖 Chat IA</h3>
                            <p>Converse com nossa IA especializada para obter ajuda sobre blockchain e funcionalidades.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Setup modal events
        document.getElementById('help-modal-close').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        document.getElementById('help-modal-overlay').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        // Add help button to header if it doesn't exist
        const header = document.querySelector('.app-header');
        if (header && !document.getElementById('help-button')) {
            const helpButton = document.createElement('button');
            helpButton.id = 'help-button';
            helpButton.className = 'btn btn-secondary';
            helpButton.innerHTML = '❓ Ajuda';
            helpButton.addEventListener('click', () => this.showHelpModal());
            
            const headerActions = header.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(helpButton);
            }
        }
    }
    
    showHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    setupContextualHelp() {
        // Show contextual help based on current page
        this.showContextualHelp = (page) => {
            const tips = {
                dashboard: 'Bem-vindo! Este é seu painel principal onde você pode ver estatísticas e acessar todas as funcionalidades.',
                wallet: 'Aqui você gerencia seus fundos. Certifique-se de ter ETH para transações e tokens SGL para funcionalidades premium.',
                avatars: 'Seus avatares digitais são NFTs únicos na blockchain. Cada um tem propriedades especiais.',
                'time-capsules': 'Cápsulas do tempo são mensagens criptografadas que só podem ser abertas em datas específicas.',
                chat: 'Nossa IA pode ajudar com dúvidas sobre blockchain, smart contracts e funcionalidades da plataforma.'
            };
            
            const tip = tips[page];
            if (tip && window.singulAIProfessional) {
                setTimeout(() => {
                    window.singulAIProfessional.showNotification(tip, 'info', 5000);
                }, 1000);
            }
        };
    }
}

// Enhanced Modal Styles
const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in-out;
}

.modal.hidden {
    display: none;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background: var(--neutral-800);
    border: 1px solid var(--neutral-700);
    border-radius: var(--radius-lg);
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    margin: var(--space-4);
    box-shadow: var(--shadow-xl);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: between;
    padding: var(--space-6);
    border-bottom: 1px solid var(--neutral-700);
}

.modal-header h2 {
    margin: 0;
    color: var(--neutral-100);
    font-size: var(--text-xl);
}

.modal-close {
    background: none;
    border: none;
    color: var(--neutral-400);
    font-size: var(--text-xl);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    margin-left: auto;
}

.modal-close:hover {
    background: var(--neutral-700);
    color: var(--neutral-100);
}

.modal-body {
    padding: var(--space-6);
}

.help-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

.help-section h3 {
    color: var(--primary-400);
    margin-bottom: var(--space-3);
    font-size: var(--text-lg);
}

.help-section p {
    color: var(--neutral-300);
    line-height: 1.6;
    margin-bottom: var(--space-3);
}

.help-section ol {
    color: var(--neutral-300);
    padding-left: var(--space-4);
}

.help-section li {
    margin-bottom: var(--space-2);
    line-height: 1.5;
}
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Initialize help system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.singulAIHelp = new SingulAIHelpSystem();
    
    // Update tooltips when language changes
    if (window.singulAIProfessional) {
        const originalSwitchLanguage = window.singulAIProfessional.switchLanguage;
        window.singulAIProfessional.switchLanguage = function(lang) {
            originalSwitchLanguage.call(this, lang);
            if (window.singulAIHelp) {
                window.singulAIHelp.updateTooltipsLanguage(lang);
            }
        };
    }
});