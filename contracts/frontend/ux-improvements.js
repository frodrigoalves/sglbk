// SingulAI MVP - UX Improvements
// Melhorias na experiência do usuário

class UXImprovements {
    constructor() {
        this.init();
    }

    init() {
        this.createOnboardingWizard();
        this.addLoadingStates();
        this.improveButtons();
        this.addTooltips();
        this.addMicroInteractions();
        this.enhanceFeedback();
        this.checkFirstVisit();
    }

    // ===== ONBOARDING WIZARD =====
    createOnboardingWizard() {
        const wizardHTML = `
            <div id="onboarding-overlay" class="onboarding-overlay">
                <div class="onboarding-modal">
                    <div id="onboarding-step-1" class="onboarding-step active">
                        <div class="onboarding-icon">🚀</div>
                        <h2 class="onboarding-title" data-i18n="welcome">Bem-vindo ao SingulAI!</h2>
                        <p class="onboarding-description" data-i18n="welcome_desc">
                            Vamos criar seu avatar digital e explorar as funcionalidades do futuro.
                            Este assistente irá guiá-lo pelos primeiros passos.
                        </p>
                        <div class="onboarding-progress">
                            <div class="progress-dot active"></div>
                            <div class="progress-dot"></div>
                            <div class="progress-dot"></div>
                            <div class="progress-dot"></div>
                        </div>
                        <div class="onboarding-buttons">
                            <button class="btn-onboarding btn-secondary" onclick="uxImprovements.skipOnboarding()" data-i18n="skip">Pular</button>
                            <button class="btn-onboarding btn-primary" onclick="uxImprovements.nextStep()" data-i18n="start">Começar</button>
                        </div>
                    </div>

                    <div id="onboarding-step-2" class="onboarding-step">
                        <div class="onboarding-icon">🔗</div>
                        <h2 class="onboarding-title" data-i18n="connect_wallet">Conecte sua Carteira</h2>
                        <p class="onboarding-description" data-i18n="connect_desc">
                            Para interagir com os contratos inteligentes, você precisa conectar sua carteira MetaMask.
                            Clique no botão "Conectar MetaMask" quando estiver pronto.
                        </p>
                        <div class="onboarding-progress">
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                            <div class="progress-dot"></div>
                            <div class="progress-dot"></div>
                        </div>
                        <div class="onboarding-buttons">
                            <button class="btn-onboarding btn-secondary" onclick="uxImprovements.prevStep()">Voltar</button>
                            <button class="btn-onboarding btn-primary" onclick="uxImprovements.nextStep()">Entendi</button>
                        </div>
                    </div>

                    <div id="onboarding-step-3" class="onboarding-step">
                        <div class="onboarding-icon">👤</div>
                        <h2 class="onboarding-title">Crie seu Avatar</h2>
                        <p class="onboarding-description">
                            Seu avatar digital é único e representa sua identidade na blockchain.
                            Escolha atributos especiais que definam sua personalidade digital.
                        </p>
                        <div class="onboarding-progress">
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                            <div class="progress-dot"></div>
                        </div>
                        <div class="onboarding-buttons">
                            <button class="btn-onboarding btn-secondary" onclick="uxImprovements.prevStep()">Voltar</button>
                            <button class="btn-onboarding btn-primary" onclick="uxImprovements.nextStep()">Próximo</button>
                        </div>
                    </div>

                    <div id="onboarding-step-4" class="onboarding-step">
                        <div class="onboarding-icon">✨</div>
                        <h2 class="onboarding-title">Explore as Funcionalidades</h2>
                        <p class="onboarding-description">
                            Agora você pode criar cápsulas do tempo, configurar seu legado digital
                            e muito mais. O futuro está em suas mãos!
                        </p>
                        <div class="onboarding-progress">
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                            <div class="progress-dot active"></div>
                        </div>
                        <div class="onboarding-buttons">
                            <button class="btn-onboarding btn-secondary" onclick="uxImprovements.prevStep()">Voltar</button>
                            <button class="btn-onboarding btn-primary" onclick="uxImprovements.finishOnboarding()">Começar a Explorar!</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', wizardHTML);
        this.currentStep = 1;
        this.totalSteps = 4;
    }

    showOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            this.showToast('Bem-vindo! Vamos começar sua jornada no SingulAI.', 'info');
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    goToStep(step) {
        // Hide current step
        const currentStepEl = document.getElementById(`onboarding-step-${this.currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }

        // Show new step
        this.currentStep = step;
        const newStepEl = document.getElementById(`onboarding-step-${this.currentStep}`);
        if (newStepEl) {
            newStepEl.classList.add('active');
        }

        // Update progress dots
        this.updateProgressDots();
    }

    updateProgressDots() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index < this.currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    skipOnboarding() {
        this.hideOnboarding();
        localStorage.setItem('singulai-onboarding-completed', 'true');
        this.showToast('Onboarding pulado. Você pode acessá-lo novamente clicando em "Ajuda".', 'info');
    }

    finishOnboarding() {
        this.hideOnboarding();
        localStorage.setItem('singulai-onboarding-completed', 'true');
        this.showToast('Onboarding concluído! Explore todas as funcionalidades.', 'success');
    }

    hideOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    checkFirstVisit() {
        const completed = localStorage.getItem('singulai-onboarding-completed');
        if (!completed) {
            setTimeout(() => {
                this.showOnboarding();
            }, 2000); // Show after 2 seconds
        }
    }

    // ===== LOADING STATES =====
    addLoadingStates() {
        const loadingHTML = `
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Processando...</div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    showLoading(message = 'Processando...') {
        const overlay = document.getElementById('loading-overlay');
        const text = document.querySelector('.loading-text');

        if (overlay && text) {
            text.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // ===== TOAST MESSAGES =====
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `message-toast message-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    // ===== IMPROVED BUTTONS =====
    improveButtons() {
        const buttons = document.querySelectorAll('button:not(.btn-onboarding)');
        buttons.forEach(button => {
            if (!button.classList.contains('btn-improved')) {
                button.classList.add('btn-improved');

                if (button.classList.contains('btn-primary') || button.textContent.toLowerCase().includes('conectar')) {
                    button.classList.add('btn-primary-improved');
                } else {
                    button.classList.add('btn-secondary-improved');
                }
            }
        });
    }

    // ===== TOOLTIPS =====
    addTooltips() {
        // Add tooltips to complex elements
        const tooltipElements = [
            { selector: '.contract-card', text: 'Clique para interagir com este contrato inteligente' },
            { selector: '.balance-info', text: 'Seu saldo atual na carteira conectada' },
            { selector: '.status-card', text: 'Status da sua conexão com a blockchain' },
            { selector: 'input[placeholder*="endereço"]', text: 'Endereço da carteira Ethereum (0x...)' },
            { selector: 'input[placeholder*="atributos"]', text: 'Descreva as características do seu avatar' },
            { selector: 'input[placeholder*="CID"]', text: 'Identificador único do conteúdo (IPFS ou similar)' },
            { selector: 'input[placeholder*="regras"]', text: 'Condições para liberar o legado digital' },
            { selector: 'input[placeholder*="unlock date"]', text: 'Data futura para liberar a cápsula do tempo' },
            { selector: 'button[id*="connect"]', text: 'Conectar com MetaMask para usar a blockchain' },
            { selector: 'button[id*="mint"]', text: 'Criar um novo token único na blockchain' },
            { selector: 'button[id*="create"]', text: 'Registrar informação permanentemente na blockchain' },
            { selector: 'button[id*="check"]', text: 'Consultar dados existentes na blockchain' },
            { selector: '#mode-toggle', text: 'Alternar entre modo simplificado e avançado' }
        ];

        tooltipElements.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(element => {
                if (!element.classList.contains('tooltip')) {
                    element.classList.add('tooltip');
                    element.setAttribute('data-tooltip', item.text);

                    const tooltip = document.createElement('span');
                    tooltip.className = 'tooltip-text';
                    tooltip.textContent = item.text;
                    element.appendChild(tooltip);
                }
            });
        });

        // Add contextual help buttons
        this.addContextualHelp();
    }

    addContextualHelp() {
        const helpSections = [
            {
                selector: '.connection-status',
                title: 'Como conectar sua carteira',
                content: '1. Instale o MetaMask<br>2. Clique em "Conectar Carteira"<br>3. Aprove as permissões<br>4. Selecione a rede Sepolia'
            },
            {
                selector: '#avatar-section',
                title: 'Sobre Avatares Digitais',
                content: 'Avatares são NFTs únicos que representam sua identidade digital. Cada avatar tem atributos personalizados e pode ser usado para interagir com outros contratos.'
            },
            {
                selector: '#capsule-section',
                title: 'Cápsulas do Tempo',
                content: 'Envie mensagens ou arquivos para o futuro. As cápsulas são armazenadas na blockchain e só podem ser abertas na data especificada.'
            },
            {
                selector: '#legacy-section',
                title: 'Legado Digital',
                content: 'Configure herança digital para seus bens virtuais. Defina beneficiários e condições para liberar os ativos automaticamente.'
            }
        ];

        helpSections.forEach(section => {
            const element = document.querySelector(section.selector);
            if (element) {
                const helpButton = document.createElement('button');
                helpButton.className = 'help-button';
                helpButton.innerHTML = '❓';
                helpButton.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,204,255,0.2); border: 1px solid #00ccff; color: #00ccff; border-radius: 50%; width: 30px; height: 30px; cursor: help; font-size: 14px;';
                helpButton.onclick = () => this.showHelpModal(section.title, section.content);

                element.style.position = 'relative';
                element.appendChild(helpButton);
            }
        });
    }

    showHelpModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'help-modal-overlay';
        modal.innerHTML = `
            <div class="help-modal">
                <h3>${title}</h3>
                <div class="help-content">${content}</div>
                <button class="btn-improved btn-primary-improved" onclick="this.closest('.help-modal-overlay').remove()">Entendi</button>
            </div>
        `;

        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
            align-items: center; justify-content: center;
        `;

        const modalContent = modal.querySelector('.help-modal');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid #333; border-radius: 20px; padding: 30px;
            max-width: 400px; width: 90%; text-align: center;
        `;

        document.body.appendChild(modal);
    }

    // ===== MICRO-INTERACTIONS =====
    addMicroInteractions() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.status-card, .contract-card');
        cards.forEach(card => {
            card.classList.add('card-hover');
        });

        // Add fade-in animation to sections
        const sections = document.querySelectorAll('.mvp-section, .contracts-grid');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            section.classList.add('fade-in');
        });

        // Add pulse effect to important buttons
        const importantButtons = document.querySelectorAll('button[id*="connect"], button[id*="mint"]');
        importantButtons.forEach(button => {
            button.classList.add('btn-pulse');
        });

        // Add ripple effect to buttons
        this.addRippleEffect();

        // Add smooth scrolling
        this.addSmoothScrolling();

        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.btn-improved, .btn-onboarding');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.left = `${e.offsetX}px`;
                ripple.style.top = `${e.offsetY}px`;

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    addSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + H for help
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.showOnboarding();
            }

            // Ctrl/Cmd + M for mode toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleMode();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const overlays = document.querySelectorAll('.onboarding-overlay, .help-modal-overlay, .loading-overlay');
                overlays.forEach(overlay => {
                    if (overlay.style.display !== 'none') {
                        overlay.style.display = 'none';
                    }
                });
            }
        });
    }

    // ===== SIMPLIFIED MODE =====
    addSimplifiedMode() {
        // Removido - funcionalidade complexa
    }

    toggleMode() {
        // Removido - funcionalidade complexa
    }

    enableSimplifiedMode() {
        // Removido - funcionalidade complexa
    }

    disableSimplifiedMode() {
        // Removido - funcionalidade complexa
    }

    addGuidedSteps() {
        // Removido - funcionalidade complexa
    }

    removeGuidedSteps() {
        // Removido - funcionalidade complexa
    }

    addClickFeedback() {
        // Removido - funcionalidade complexa
    }

    addFormValidation() {
        // Removido - funcionalidade complexa
    }

    addProgressIndicators() {
        // Removido - funcionalidade complexa
    }

    showProgressBar(button) {
        // Removido - funcionalidade complexa
    }

    // ===== THEME & LANGUAGE SYSTEM =====
    getTranslations() {
        return {
            pt: {
                'welcome': 'Bem-vindo ao SingulAI!',
                'welcome_desc': 'Vamos criar seu avatar digital e explorar as funcionalidades do futuro.',
                'start': 'Começar',
                'skip': 'Pular',
                'connect_wallet': 'Conecte sua Carteira',
                'connect_desc': 'Para interagir com os contratos inteligentes, você precisa conectar sua carteira MetaMask.',
                'connect': 'Conectar',
                'connected': 'Conectado'
            },
            en: {
                'welcome': 'Welcome to SingulAI!',
                'welcome_desc': 'Let\'s create your digital avatar and explore future functionalities.',
                'start': 'Get Started',
                'skip': 'Skip',
                'connect_wallet': 'Connect Your Wallet',
                'connect_desc': 'To interact with smart contracts, you need to connect your MetaMask wallet.',
                'connect': 'Connect',
                'connected': 'Connected'
            }
        };
    }

    setupThemeToggle() {
        // Removido - funcionalidade complexa
    }

    setupLanguageToggle() {
        // Removido - funcionalidade complexa
    }

    createHeaderControls() {
        // Removido - funcionalidade complexa
    }

    toggleTheme() {
        // Removido - funcionalidade complexa
    }

    toggleLanguage() {
        // Removido - funcionalidade complexa
    }

    applyTheme() {
        // Removido - funcionalidade complexa
    }

    applyLanguage() {
        // Removido - funcionalidade complexa
    }

    // ===== MODERN HEADER =====
    setupModernHeader() {
        // Removido - funcionalidade complexa
    }

    setupNavigation() {
        // Removido - funcionalidade complexa
    }

    setupMobileMenu() {
        // Removido - funcionalidade complexa
    }

    createMobileNav() {
        // Removido - funcionalidade complexa
    }

    toggleMobileMenu() {
        // Removido - funcionalidade complexa
    }

    closeMobileMenu() {
        // Removido - funcionalidade complexa
    }

    scrollToSection(sectionId) {
        // Removido - funcionalidade complexa
    }

    highlightElement(selector, duration = 2000) {
        // Removido - funcionalidade complexa
    }

    updateHeaderBalance() {
        // Removido - funcionalidade complexa
    }

    updateHeaderConnection() {
        // Removido - funcionalidade complexa
    }

    // Method to update header from main app
    updateHeaderStatus(connected, address = null) {
        // Removido - funcionalidade complexa
    }

    updateHeaderBalance(balance) {
        // Removido - funcionalidade complexa
    }

    // ===== AVATAR QUICK OPTIONS =====
    setupAvatarQuickOptions() {
        // Removido - funcionalidade complexa
    }
}

// Initialize UX improvements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uxImprovements = new UXImprovements();
});

// Make methods available globally for onclick handlers
window.showOnboarding = () => window.uxImprovements.showOnboarding();
window.showLoading = (message) => window.uxImprovements.showLoading(message);
window.hideLoading = () => window.uxImprovements.hideLoading();
window.showToast = (message, type) => window.uxImprovements.showToast(message, type);