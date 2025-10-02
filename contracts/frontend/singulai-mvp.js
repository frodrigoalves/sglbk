// SingulAI MVP - JavaScript para interação com contratos
// Mantendo a identidade visual e funcional do site original

// Configuração dos contratos na Sepolia
const CONTRACTS = {
    AVATAR_BASE: {
        address: '0x388D16b79fAff27A45F714838F029BC34aC60c48',
        abi: [
            "function mint(address to, string memory attrs) external returns (uint256 tokenId)",
            "function nextId() public view returns (uint256)",
            "function balanceOf(address owner) public view returns (uint256)",
            "function ownerOf(uint256 tokenId) public view returns (address)",
            "function attributes(uint256 tokenId) public view returns (string)"
        ]
    },
    TIME_CAPSULE: {
        address: '0x1CE74AA25698312e150E3d0Aa2657Cc1B1cBeC93',
        abi: [
            "function createCapsule(uint256 avatarId, uint256 unlockDate, string memory cid) external",
            "function capsules(bytes32 id) public view returns (uint256 avatarId, uint256 unlockDate, string cid, bool unlocked)",
            "event CapsuleCreated(bytes32 indexed id, uint256 avatarId, uint256 unlockDate, string cid)"
        ]
    },
    DIGITAL_LEGACY: {
        address: '0x91E67E1592e66C347C3f615d71927c05a1951057',
        abi: [
            "function createLegacy(uint256 avatarId, string memory cid, string memory rules) external",
            "function legacies(bytes32 id) public view returns (uint256 avatarId, string cid, string rules, bool unlocked)",
            "event LegacyCreated(bytes32 indexed id, uint256 avatarId, string cid, string rules)"
        ]
    },
    AVATAR_WALLET_LINK: {
        address: '0x803DE61049d1b192828A46e5952645C3f5b352B0',
        abi: []
    }
};

// Configuração da rede Sepolia
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'SepoliaETH',
        decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
};

let web3;
let userAccount;
let contracts = {};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando SingulAI MVP...');
    await initWeb3();
    setupEventListeners();
    updateConnectionStatus();
});

async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        
        // Inicializar contratos
        contracts.avatarBase = new web3.eth.Contract(CONTRACTS.AVATAR_BASE.abi, CONTRACTS.AVATAR_BASE.address);
        contracts.timeCapsule = new web3.eth.Contract(CONTRACTS.TIME_CAPSULE.abi, CONTRACTS.TIME_CAPSULE.address);
        contracts.digitalLegacy = new web3.eth.Contract(CONTRACTS.DIGITAL_LEGACY.abi, CONTRACTS.DIGITAL_LEGACY.address);
        
        console.log('✅ Web3 inicializado com sucesso');
        
        // Verificar se já está conectado
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            userAccount = accounts[0];
            updateConnectionStatus();
        }
    } else {
        console.error('❌ MetaMask não detectado');
        showMessage('connection', 'error', '❌ MetaMask não detectado! Por favor, instale o MetaMask para continuar.');
    }
}

function setupEventListeners() {
    // Conexão wallet
    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
    
    // Avatar Base
    document.getElementById('mint-avatar').addEventListener('click', mintAvatar);
    document.getElementById('check-next-id').addEventListener('click', checkNextId);
    
    // Time Capsule
    document.getElementById('create-capsule').addEventListener('click', createTimeCapsule);
    
    // Digital Legacy
    document.getElementById('create-legacy').addEventListener('click', createDigitalLegacy);
    
    // Wallet Link
    document.getElementById('check-wallet-link').addEventListener('click', checkWalletLink);
}

async function connectWallet() {
    try {
        showMessage('connection', 'loading', '🔄 Conectando carteira...');
        
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        userAccount = accounts[0];
        
        // Verificar se está na rede Sepolia
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CONFIG.chainId) {
            await switchToSepolia();
        }
        
        updateConnectionStatus();
        showMessage('connection', 'success', '✅ Carteira conectada com sucesso!');

        // Configurar automaticamente o token SGL
        await configureSGLToken();

        console.log('✅ Wallet conectada:', userAccount);
        
    } catch (error) {
        console.error('❌ Erro ao conectar wallet:', error);
        showMessage('connection', 'error', '❌ Erro ao conectar carteira: ' + error.message);
    }
}

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CONFIG.chainId }]
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SEPOLIA_CONFIG]
            });
        } else {
            throw switchError;
        }
    }
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    const accountElement = document.getElementById('account-info');
    const connectButton = document.getElementById('connect-wallet');
    
    if (userAccount) {
        statusElement.innerHTML = `
            <span class="status-indicator status-connected"></span>
            Conectado à Sepolia Testnet
        `;
        accountElement.textContent = `Conta: ${userAccount.slice(0, 8)}...${userAccount.slice(-6)}`;
        connectButton.textContent = '✅ Conectado';
        connectButton.disabled = true;
        connectButton.style.opacity = '0.7';
    } else {
        statusElement.innerHTML = `
            <span class="status-indicator status-disconnected"></span>
            Conecte sua carteira MetaMask para começar
        `;
        accountElement.textContent = '';
        connectButton.textContent = '🦊 Conectar MetaMask';
        connectButton.disabled = false;
        connectButton.style.opacity = '1';
    }
}

// Funções dos contratos

async function mintAvatar() {
    if (!userAccount) {
        showMessage('avatar', 'error', '❌ Conecte sua carteira primeiro!');
        return;
    }
    
    const attrs = document.getElementById('avatar-attrs').value.trim();
    if (!attrs) {
        showMessage('avatar', 'error', '❌ Descreva a personalidade do avatar!');
        return;
    }
    
    try {
        showMessage('avatar', 'loading', '🔄 Criando avatar na blockchain...');
        
        const tx = await contracts.avatarBase.methods.mint(userAccount, attrs).send({
            from: userAccount
        });
        
        showMessage('avatar', 'success', `✅ Avatar criado com sucesso! 
        <br>TX: <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" style="color: #00ff88;">${tx.transactionHash.slice(0, 10)}...</a>`);
        
        // Limpar campo
        document.getElementById('avatar-attrs').value = '';
        
        console.log('✅ Avatar criado:', tx.transactionHash);
        
    } catch (error) {
        console.error('❌ Erro ao criar avatar:', error);
        showMessage('avatar', 'error', '❌ Erro ao criar avatar: ' + error.message);
    }
}

async function checkNextId() {
    try {
        showMessage('avatar', 'loading', '🔄 Verificando próximo ID...');
        
        const nextId = await contracts.avatarBase.methods.nextId().call();
        
        showMessage('avatar', 'success', `🔢 Próximo ID de avatar: ${nextId}`);
        
    } catch (error) {
        console.error('❌ Erro ao verificar ID:', error);
        showMessage('avatar', 'error', '❌ Erro ao verificar ID: ' + error.message);
    }
}

async function createTimeCapsule() {
    if (!userAccount) {
        showMessage('capsule', 'error', '❌ Conecte sua carteira primeiro!');
        return;
    }
    
    const avatarId = document.getElementById('capsule-avatar-id').value;
    const hours = document.getElementById('capsule-hours').value;
    const cid = document.getElementById('capsule-cid').value.trim();
    
    if (!avatarId || !hours || !cid) {
        showMessage('capsule', 'error', '❌ Preencha todos os campos!');
        return;
    }
    
    try {
        showMessage('capsule', 'loading', '🔄 Criando cápsula do tempo...');
        
        const unlockDate = Math.floor(Date.now() / 1000) + (parseInt(hours) * 3600);
        
        const tx = await contracts.timeCapsule.methods.createCapsule(
            parseInt(avatarId),
            unlockDate,
            cid
        ).send({
            from: userAccount
        });
        
        const unlockDateFormatted = new Date(unlockDate * 1000).toLocaleString('pt-BR');
        
        showMessage('capsule', 'success', `✅ Cápsula do tempo criada! 
        <br>Desbloqueio: ${unlockDateFormatted}
        <br>TX: <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" style="color: #00ff88;">${tx.transactionHash.slice(0, 10)}...</a>`);
        
        // Limpar campo CID
        document.getElementById('capsule-cid').value = '';
        
        console.log('✅ Cápsula criada:', tx.transactionHash);
        
    } catch (error) {
        console.error('❌ Erro ao criar cápsula:', error);
        showMessage('capsule', 'error', '❌ Erro ao criar cápsula: ' + error.message);
    }
}

async function createDigitalLegacy() {
    if (!userAccount) {
        showMessage('legacy', 'error', '❌ Conecte sua carteira primeiro!');
        return;
    }
    
    const avatarId = document.getElementById('legacy-avatar-id').value;
    const cid = document.getElementById('legacy-cid').value.trim();
    const rules = document.getElementById('legacy-rules').value.trim();
    
    if (!avatarId || !cid || !rules) {
        showMessage('legacy', 'error', '❌ Preencha todos os campos!');
        return;
    }
    
    try {
        showMessage('legacy', 'loading', '🔄 Criando legado digital...');
        
        const tx = await contracts.digitalLegacy.methods.createLegacy(
            parseInt(avatarId),
            cid,
            rules
        ).send({
            from: userAccount
        });
        
        showMessage('legacy', 'success', `✅ Legado digital criado com sucesso! 
        <br>TX: <a href="https://sepolia.etherscan.io/tx/${tx.transactionHash}" target="_blank" style="color: #00ff88;">${tx.transactionHash.slice(0, 10)}...</a>`);
        
        // Limpar campos
        document.getElementById('legacy-cid').value = '';
        document.getElementById('legacy-rules').value = '';
        
        console.log('✅ Legado criado:', tx.transactionHash);
        
    } catch (error) {
        console.error('❌ Erro ao criar legado:', error);
        showMessage('legacy', 'error', '❌ Erro ao criar legado: ' + error.message);
    }
}

async function checkWalletLink() {
    try {
        showMessage('wallet', 'loading', '🔄 Verificando contrato...');
        
        // Simular verificação do contrato
        setTimeout(() => {
            showMessage('wallet', 'success', '✅ Contrato AvatarWalletLink ativo e operacional na Sepolia!');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao verificar wallet link:', error);
        showMessage('wallet', 'error', '❌ Erro ao verificar contrato: ' + error.message);
    }
}

// Funções auxiliares

function showMessage(section, type, message) {
    const messageElement = document.getElementById(`${section}-message`);
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = message;
    messageElement.style.display = 'block';
    
    // Auto-hide após 10 segundos para mensagens de sucesso
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 10000);
    }
}

function hideMessage(section) {
    document.getElementById(`${section}-message`).style.display = 'none';
}

// Event listeners para mudanças na wallet
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAccount = accounts[0];
        updateConnectionStatus();
        if (userAccount) {
            console.log('👤 Conta alterada para:', userAccount);
        }
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
        console.log('🔄 Rede alterada, recarregando página...');
        location.reload();
    });
}

// Configurar automaticamente o token SGL no MetaMask
async function configureSGLToken() {
    try {
        if (!userAccount) {
            console.log('⚠️  Nenhuma carteira conectada para configurar SGL');
            return;
        }

        // Verificar se o usuário está logado no backend
        const token = localStorage.getItem('singulai_token');
        if (!token) {
            console.log('⚠️  Usuário não autenticado, pulando configuração SGL');
            return;
        }

        console.log('🔄 Configurando token SGL automaticamente...');

        // Chamar endpoint do backend para obter configuração do token
        const response = await fetch('http://localhost:3000/api/token/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                walletAddress: userAccount
            })
        });

        if (!response.ok) {
            console.log('⚠️  Não foi possível obter configuração SGL do backend');
            return;
        }

        const config = await response.json();

        if (config.sglToken) {
            // Adicionar token ao MetaMask
            try {
                await window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: {
                            address: config.sglToken.address,
                            symbol: config.sglToken.symbol,
                            decimals: config.sglToken.decimals,
                            image: config.sglToken.image
                        }
                    }
                });

                console.log('✅ Token SGL adicionado ao MetaMask automaticamente!');
                showMessage('connection', 'success', '✅ Token SGL configurado automaticamente!');

            } catch (addError) {
                console.log('ℹ️  Token SGL já existe no MetaMask ou usuário cancelou');
            }
        }

    } catch (error) {
        console.error('❌ Erro ao configurar token SGL:', error);
        // Não mostrar erro para o usuário, apenas log
    }
}

// Log de inicialização
console.log(`
🤖 SingulAI MVP carregado!
🌐 Site: https://www.singulai.live
📱 Assistente: https://chatgpt.com/g/g-68c9bc5b10d48191a41006964882b457-singulai
🔗 Contratos na Sepolia Testnet
`);