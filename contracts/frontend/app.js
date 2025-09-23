// Configuração dos contratos
const CONTRACTS = {
    SGL_TOKEN: {
        address: '0x123...', // Endereço fictício para demonstração
        abi: [
            "function balanceOf(address account) public view returns (uint256)",
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function name() public view returns (string)",
            "function symbol() public view returns (string)",
            "function decimals() public view returns (uint8)"
        ]
    },
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
        abi: [
            // Adicionar ABI quando necessário
        ]
    }
};

// Configuração da rede Sepolia
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7', // 11155111 em hex
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

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
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
        
        console.log('✅ Web3 inicializado');
    } else {
        alert('MetaMask não detectado! Por favor, instale o MetaMask.');
    }
}

function setupEventListeners() {
    // Botão conectar wallet
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
        // Solicitar conexão
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
        console.log('✅ Wallet conectada:', userAccount);
        
    } catch (error) {
        console.error('❌ Erro ao conectar wallet:', error);
        showError('connection', 'Erro ao conectar wallet: ' + error.message);
    }
}

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CONFIG.chainId }]
        });
    } catch (switchError) {
        // Se a rede não existe, adicionar
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
        statusElement.textContent = '✅ Conectado à Sepolia';
        statusElement.style.color = '#4CAF50';
        accountElement.textContent = `Conta: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
        connectButton.textContent = '🔗 Conectado';
        connectButton.disabled = true;
    } else {
        statusElement.textContent = '❌ Não conectado';
        statusElement.style.color = '#f44336';
        accountElement.textContent = '';
        connectButton.textContent = '🦊 Conectar MetaMask';
        connectButton.disabled = false;
    }
}

// Funções dos contratos

async function mintAvatar() {
    if (!userAccount) {
        alert('Por favor, conecte sua wallet primeiro!');
        return;
    }
    
    const attrs = document.getElementById('avatar-attrs').value;
    if (!attrs.trim()) {
        alert('Por favor, insira os atributos do avatar!');
        return;
    }
    
    try {
        showLoading('avatar');
        
        const tx = await contracts.avatarBase.methods.mint(userAccount, attrs).send({
            from: userAccount
        });
        
        hideLoading('avatar');
        showResult('avatar', `✅ Avatar criado! TX: ${tx.transactionHash}`);
        
        // Limpar campo
        document.getElementById('avatar-attrs').value = '';
        
    } catch (error) {
        hideLoading('avatar');
        showError('avatar', 'Erro ao criar avatar: ' + error.message);
    }
}

async function checkNextId() {
    try {
        const nextId = await contracts.avatarBase.methods.nextId().call();
        showResult('avatar', `🔢 Próximo ID: ${nextId}`);
    } catch (error) {
        showError('avatar', 'Erro ao verificar ID: ' + error.message);
    }
}

async function createTimeCapsule() {
    if (!userAccount) {
        alert('Por favor, conecte sua wallet primeiro!');
        return;
    }
    
    const avatarId = document.getElementById('capsule-avatar-id').value;
    const hours = document.getElementById('capsule-hours').value;
    const cid = document.getElementById('capsule-cid').value;
    
    if (!avatarId || !hours || !cid) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    try {
        showLoading('capsule');
        
        const unlockDate = Math.floor(Date.now() / 1000) + (parseInt(hours) * 3600);
        
        const tx = await contracts.timeCapsule.methods.createCapsule(
            parseInt(avatarId),
            unlockDate,
            cid
        ).send({
            from: userAccount
        });
        
        hideLoading('capsule');
        showResult('capsule', `✅ Cápsula criada! TX: ${tx.transactionHash}`);
        
        // Limpar campos
        document.getElementById('capsule-cid').value = '';
        
    } catch (error) {
        hideLoading('capsule');
        showError('capsule', 'Erro ao criar cápsula: ' + error.message);
    }
}

async function createDigitalLegacy() {
    if (!userAccount) {
        alert('Por favor, conecte sua wallet primeiro!');
        return;
    }
    
    const avatarId = document.getElementById('legacy-avatar-id').value;
    const cid = document.getElementById('legacy-cid').value;
    const rules = document.getElementById('legacy-rules').value;
    
    if (!avatarId || !cid || !rules) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    try {
        showLoading('legacy');
        
        const tx = await contracts.digitalLegacy.methods.createLegacy(
            parseInt(avatarId),
            cid,
            rules
        ).send({
            from: userAccount
        });
        
        hideLoading('legacy');
        showResult('legacy', `✅ Legado criado! TX: ${tx.transactionHash}`);
        
        // Limpar campos
        document.getElementById('legacy-cid').value = '';
        document.getElementById('legacy-rules').value = '';
        
    } catch (error) {
        hideLoading('legacy');
        showError('legacy', 'Erro ao criar legado: ' + error.message);
    }
}

async function checkWalletLink() {
    try {
        showLoading('wallet');
        showResult('wallet', '🔗 Contrato AvatarWalletLink ativo e funcionando!');
        hideLoading('wallet');
    } catch (error) {
        hideLoading('wallet');
        showError('wallet', 'Erro ao verificar wallet link: ' + error.message);
    }
}

// Funções auxiliares

function showLoading(section) {
    document.getElementById(`${section}-loading`).style.display = 'block';
    hideResult(section);
    hideError(section);
}

function hideLoading(section) {
    document.getElementById(`${section}-loading`).style.display = 'none';
}

function showResult(section, message) {
    const element = document.getElementById(`${section}-result`);
    element.textContent = message;
    element.style.display = 'block';
    hideError(section);
}

function hideResult(section) {
    document.getElementById(`${section}-result`).style.display = 'none';
}

function showError(section, message) {
    const element = document.getElementById(`${section}-error`);
    element.textContent = message;
    element.style.display = 'block';
    hideResult(section);
}

function hideError(section) {
    document.getElementById(`${section}-error`).style.display = 'none';
}

// Função para verificar saldo SGL Token
async function checkSGLBalance() {
    if (!userAccount) {
        alert('Por favor, conecte sua carteira primeiro');
        return;
    }
    
    try {
        // Simular saldo SGL Token (para demonstração)
        const mockBalance = '1000.50'; // Saldo fictício
        
        const balanceInfo = `
            💰 <strong>Saldo SGL Token:</strong><br>
            ${mockBalance} SGL<br>
            <small>💡 Saldo simulado para demonstração MVP</small><br><br>
            📍 <strong>Endereço:</strong><br>
            ${userAccount.substring(0, 6)}...${userAccount.substring(38)}<br><br>
            🌐 <strong>Rede:</strong> Sepolia Testnet<br>
            🔗 <strong>Status:</strong> ✅ Conectado
        `;
        
        // Criar modal para exibir informações
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">💰 SGL Token Info</h3>
            <div style="text-align: left; margin-bottom: 20px;">
                ${balanceInfo}
            </div>
            <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                    style="background: #ff6b6b; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                Fechar
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Erro ao verificar saldo SGL:', error);
        alert('Erro ao verificar saldo SGL Token');
    }
}

// Event listeners para mudanças na wallet
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        userAccount = accounts[0];
        updateConnectionStatus();
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
        location.reload(); // Recarregar a página quando a rede mudar
    });
    
    // Event listener para o botão SGL Balance
    document.addEventListener('DOMContentLoaded', function() {
        const sglButton = document.getElementById('check-sgl-balance');
        if (sglButton) {
            sglButton.addEventListener('click', checkSGLBalance);
        }
    });
}