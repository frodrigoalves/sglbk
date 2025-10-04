/**
 * SingulAI Security Manager - Enhanced HTTPS
 * Versão 1.0.0
 * 
 * Gerencia segurança Web3 e HTTPS para SingulAI
 * Otimizado para MetaMask e operações blockchain
 */

class SingulAISecurityManager {
    constructor() {
        // Configurações globais
        this.config = {
            FORCE_HTTPS: true,
            SECURE_WEB3: true,
            CHECK_SSL: true
        };
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicialização do Security Manager
     * @private
     */
    init() {
        // Forçar HTTPS
        this.enforceHTTPS();
        
        // Configurar Security Headers
        this.setupSecurityHeaders();
        
        // Otimizar Web3
        if (this.config.SECURE_WEB3) {
            this.setupSecureWeb3();
        }
        
        // Verificar certificado SSL
        if (this.config.CHECK_SSL) {
            this.validateSSL();
        }
    }
    
    /**
     * Força redirecionamento para HTTPS
     * @private
     */
    enforceHTTPS() {
        if (this.config.FORCE_HTTPS && 
            location.protocol !== 'https:' && 
            !['localhost', '127.0.0.1'].includes(location.hostname)) {
            location.replace('https:' + window.location.href.substring(window.location.protocol.length));
        }
    }
    
    /**
     * Configura headers de segurança
     * @private 
     */
    setupSecurityHeaders() {
        // Content Security Policy para Web3
        const meta = document.createElement('meta');
        meta.httpEquiv = "Content-Security-Policy";
        meta.content = "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; " +
                      "connect-src 'self' https: wss: ws: data: blob:; " +
                      "img-src 'self' https: data: blob:; " +
                      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; " +
                      "style-src 'self' 'unsafe-inline' https:;";
        document.head.appendChild(meta);
        
        // Strict Transport Security
        const hsts = document.createElement('meta');
        hsts.httpEquiv = "Strict-Transport-Security";
        hsts.content = "max-age=31536000; includeSubDomains";
        document.head.appendChild(hsts);
    }
    
    /**
     * Configura Web3 com segurança aprimorada
     * @private
     */
    setupSecureWeb3() {
        // Wrapper para Web3
        if (typeof window.Web3 !== 'undefined') {
            const originalProvider = window.Web3.providers.HttpProvider;
            window.Web3.providers.HttpProvider = function(url, options) {
                if (url && url.startsWith('http://')) {
                    url = url.replace('http://', 'https://');
                    console.log('SingulAI Security: Upgraded Web3 RPC to HTTPS');
                }
                return new originalProvider(url, options);
            };
        }
        
        // Wrapper para fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (typeof url === 'string') {
                if (url.startsWith('/')) {
                    url = 'https://singulai.live' + url;
                } else if (url.startsWith('http://') && !url.includes('localhost')) {
                    url = url.replace('http://', 'https://');
                }
            }
            return originalFetch(url, options);
        };
    }
    
    /**
     * Valida certificado SSL
     * @private
     */
    async validateSSL() {
        try {
            const response = await fetch('https://singulai.live/api/health');
            if (response.ok) {
                console.log('SingulAI Security: SSL válido');
            }
        } catch (error) {
            console.error('SingulAI Security: Erro SSL:', error);
        }
    }
    
    /**
     * Verifica se recursos críticos estão disponíveis via HTTPS
     * @returns {Object} Status dos recursos
     * @public
     */
    checkHTTPSSupport() {
        return {
            ssl: location.protocol === 'https:',
            serviceWorker: 'serviceWorker' in navigator,
            web3: typeof window.Web3 !== 'undefined',
            crypto: 'crypto' in window && 'subtle' in window.crypto,
            secureContext: window.isSecureContext
        };
    }
    
    /**
     * Define cookie com flags de segurança
     * @param {string} name Nome do cookie
     * @param {string} value Valor do cookie
     * @param {number} days Dias para expirar
     * @public
     */
    setSecureCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=Strict`;
    }
    
    /**
     * Cria WebSocket seguro (WSS)
     * @param {string} path Caminho do WebSocket
     * @returns {WebSocket} WebSocket seguro
     * @public
     */
    createSecureWebSocket(path) {
        const wsUrl = `wss://singulai.live${path}`;
        return new WebSocket(wsUrl);
    }
    
    /**
     * Monitora CSP e mixed content
     * @public
     */
    monitorSecurityPolicy() {
        // Verificar CSP
        try {
            eval('1+1');
            console.log('SingulAI Security: CSP allows eval (development mode)');
        } catch {
            console.log('SingulAI Security: CSP blocks eval (production mode)');
        }
        
        // Monitor mixed content
        if (location.protocol === 'https:') {
            new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const httpResources = node.querySelectorAll('[src^="http://"], [href^="http://"]');
                            if (httpResources.length > 0) {
                                console.warn('SingulAI Security: HTTP resources in HTTPS page:', httpResources);
                            }
                        }
                    });
                });
            }).observe(document.body, { childList: true, subtree: true });
        }
    }
}

// Inicializar Security Manager
window.singulaiSecurity = new SingulAISecurityManager();

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SingulAISecurityManager;
}