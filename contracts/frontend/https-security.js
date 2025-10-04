// SingulAI HTTPS Configuration & Security
// Força HTTPS e otimiza para Web3

// === HTTPS ENFORCEMENT ===
(function enforceHTTPS() {
    // Auto-redirect para HTTPS se não estiver
    if (location.protocol !== 'https:' && 
        location.hostname !== 'localhost' && 
        location.hostname !== '127.0.0.1') {
        location.replace('https:' + window.location.href.substring(window.location.protocol.length));
        return;
    }
})();

// === GLOBAL HTTPS CONFIG ===
window.SINGULAI_HTTPS_CONFIG = {
    API_BASE: 'https://singulai.live/api',
    WS_BASE: 'wss://singulai.live/ws',
    STATIC_BASE: 'https://singulai.live',
    
    // External HTTPS resources
    EXTERNAL: {
        WEB3_CDN: 'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js',
        FONTS: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    },
    
    // Security settings
    SECURITY: {
        FORCE_HTTPS: true,
        STRICT_TRANSPORT: true,
        SECURE_COOKIES: true
    }
};

// === WEB3 HTTPS OPTIMIZATION ===
if (typeof window.Web3 !== 'undefined') {
    // Ensure Web3 uses HTTPS endpoints
    const originalProvider = window.Web3.providers.HttpProvider;
    window.Web3.providers.HttpProvider = function(url, options) {
        // Force HTTPS for RPC endpoints
        if (url && url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
            console.log('SingulAI: Upgraded Web3 endpoint to HTTPS:', url);
        }
        return new originalProvider(url, options);
    };
}

// === FETCH WRAPPER FOR HTTPS ===
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Convert relative URLs to absolute HTTPS
    if (typeof url === 'string') {
        if (url.startsWith('/')) {
            url = 'https://singulai.live' + url;
        } else if (url.startsWith('http://') && !url.includes('localhost')) {
            url = url.replace('http://', 'https://');
        }
    }
    
    // Add HTTPS-specific headers
    options.headers = {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest'
    };
    
    return originalFetch(url, options);
};

// === SERVICE WORKER REGISTRATION ===
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('SingulAI: Service Worker registrado via HTTPS:', registration);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('SingulAI: Nova versão disponível via HTTPS');
                        // Optionally notify user of update
                    }
                });
            });
            
        } catch (error) {
            console.error('SingulAI: Erro ao registrar Service Worker:', error);
        }
    });
}

// === HTTPS SECURITY CHECKS ===
function checkHTTPSSupport() {
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window,
        geolocation: 'geolocation' in navigator,
        webcrypto: 'crypto' in window && 'subtle' in window.crypto,
        webgl: !!document.createElement('canvas').getContext('webgl'),
        webrtc: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection)
    };
    
    console.log('SingulAI: Recursos HTTPS disponíveis:', features);
    return features;
}

// === COOKIE SECURITY ===
function setSecureCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const cookieOptions = [
        `${name}=${value}`,
        `expires=${expires.toUTCString()}`,
        'path=/',
        'SameSite=Lax'
    ];
    
    // Add Secure flag for HTTPS
    if (location.protocol === 'https:') {
        cookieOptions.push('Secure');
    }
    
    document.cookie = cookieOptions.join('; ');
}

// === WEBSOCKET SECURITY ===
function createSecureWebSocket(path) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}${path}`;
    
    try {
        const ws = new WebSocket(wsUrl);
        console.log('SingulAI: WebSocket seguro conectado:', wsUrl);
        return ws;
    } catch (error) {
        console.error('SingulAI: Erro ao conectar WebSocket seguro:', error);
        return null;
    }
}

// === CONTENT SECURITY POLICY CHECK ===
function checkCSPCompliance() {
    // Check if we can execute inline scripts (CSP compliance)
    try {
        eval('1+1'); // This will fail if CSP blocks eval
        console.log('SingulAI: CSP permite eval (desenvolvimento)');
    } catch (e) {
        console.log('SingulAI: CSP ativo - eval bloqueado (produção)');
    }
    
    // Check for mixed content warnings
    if (location.protocol === 'https:') {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check for HTTP resources in HTTPS page
                        const httpSources = node.querySelectorAll ? 
                            node.querySelectorAll('[src^="http://"], [href^="http://"]') : [];
                        
                        if (httpSources.length > 0) {
                            console.warn('SingulAI: Recursos HTTP detectados em página HTTPS:', httpSources);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔒 SingulAI HTTPS Security iniciado');
    
    // Check HTTPS support
    const httpsFeatures = checkHTTPSSupport();
    
    // Initialize CSP monitoring
    checkCSPCompliance();
    
    // Set secure defaults
    if (location.protocol === 'https:') {
        console.log('✅ SingulAI: Executando em HTTPS seguro');
        
        // Enable additional security features
        if (httpsFeatures.webcrypto) {
            console.log('✅ SingulAI: Web Crypto API disponível');
        }
        
        if (httpsFeatures.serviceWorker) {
            console.log('✅ SingulAI: Service Worker disponível');
        }
    } else {
        console.warn('⚠️ SingulAI: Executando em HTTP - recursos limitados');
    }
});

// === EXPORT FOR MODULE USAGE ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enforceHTTPS,
        checkHTTPSSupport,
        setSecureCookie,
        createSecureWebSocket,
        checkCSPCompliance
    };
}

// Make functions globally available
window.SingulAIHTTPS = {
    checkSupport: checkHTTPSSupport,
    setSecureCookie,
    createSecureWebSocket,
    checkCSP: checkCSPCompliance
};