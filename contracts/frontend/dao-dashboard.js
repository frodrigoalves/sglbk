// SingulDAO Dashboard JavaScript

// Translation system
const translations = {
    en: {
        title: 'SingulDAO',
        subtitle: 'Decentralized Governance Public Dashboard',
        loading: 'Loading DAO data...',
        error: 'Error loading data. Check blockchain connection.',
        tryAgain: 'Try Again',
        totalProposals: 'Total Proposals',
        activeProposals: 'Active Proposals', 
        totalVotes: 'Total Votes',
        participationRate: 'Participation Rate',
        proposalStatusChart: '📊 Proposal Status',
        participationChart: '📈 Participation Over Time',
        votesDistributionChart: '🗳️ Vote Distribution',
        votingPowerChart: '💰 Voting Power by Address',
        recentProposals: '📋 Recent Proposals',
        votesFor: 'Votes For',
        votesAgainst: 'Votes Against',
        start: 'Start',
        end: 'End',
        proposer: 'Proposer',
        quorum: 'Quorum',
        reached: 'Reached',
        notReached: 'Not Reached'
    },
    pt: {
        title: 'SingulDAO',
        subtitle: 'Painel Público de Governança Descentralizada',
        loading: 'Carregando dados do DAO...',
        error: 'Erro ao carregar dados. Verifique a conexão com a blockchain.',
        tryAgain: 'Tentar Novamente',
        totalProposals: 'Total de Propostas',
        activeProposals: 'Propostas Ativas',
        totalVotes: 'Total de Votos', 
        participationRate: 'Taxa de Participação',
        proposalStatusChart: '📊 Status das Propostas',
        participationChart: '📈 Participação ao Longo do Tempo',
        votesDistributionChart: '🗳️ Distribuição de Votos',
        votingPowerChart: '💰 Poder de Voto por Endereço',
        recentProposals: '📋 Propostas Recentes',
        votesFor: 'Votos A Favor',
        votesAgainst: 'Votos Contra',
        start: 'Início',
        end: 'Fim',
        proposer: 'Proponente',
        quorum: 'Quórum',
        reached: 'Atingido',
        notReached: 'Não atingido',
        proposal: 'Proposta',
        tryAgain: 'Tentar Novamente',
        loading: 'Carregando dados do DAO...',
        error: 'Erro ao carregar dados'
    }
};

let currentLanguage = 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update charts if they exist
    if (window.daoData && window.daoData.charts) {
        window.daoData.updateChartsLanguage();
    }
}

class DAODashboard {
    constructor() {
        this.web3 = null;
        this.daoContract = null;
        this.sglTokenContract = null;
        this.proposalData = [];
        this.charts = {};
        
        // Contract addresses (update these with deployed addresses)
        this.contracts = {
            DAO_ADDRESS: '0x67Ef5FFf1fb79e7479aF27163Adef1b42a3aFf16', // Deploy the DAO contract and update this
            SGL_TOKEN_ADDRESS: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357' // DAI for testing
        };
        
        // Contract ABIs (simplified)
        this.daoABI = [
            {
                "inputs": [],
                "name": "proposalCount",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "name": "proposals",
                "outputs": [
                    {"internalType": "address", "name": "proposer", "type": "address"},
                    {"internalType": "string", "name": "description", "type": "string"},
                    {"internalType": "uint256", "name": "startTime", "type": "uint256"},
                    {"internalType": "uint256", "name": "endTime", "type": "uint256"},
                    {"internalType": "address", "name": "target", "type": "address"},
                    {"internalType": "bytes", "name": "callData", "type": "bytes"},
                    {"internalType": "uint256", "name": "forVotes", "type": "uint256"},
                    {"internalType": "uint256", "name": "againstVotes", "type": "uint256"},
                    {"internalType": "bool", "name": "executed", "type": "bool"},
                    {"internalType": "bool", "name": "canceled", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_proposalId", "type": "uint256"}],
                "name": "getProposalStatus",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_proposalId", "type": "uint256"}],
                "name": "hasReachedQuorum",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        this.tokenABI = [
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupWeb3();
            await this.loadDAOData();
            this.setupCharts();
            
            // Auto-refresh every 30 seconds
            setInterval(() => this.loadDAOData(), 30000);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Error initializing dashboard. Check if MetaMask is connected to Sepolia network.');
        }
    }
    
    async setupWeb3() {
        // Try to connect to Web3
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
        } else if (window.web3) {
            this.web3 = new Web3(window.web3.currentProvider);
        } else {
            // Fallback to Infura for read-only access
            this.web3 = new Web3('https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
        }
        
        // Initialize contracts (mock data if DAO not deployed yet)
        if (this.contracts.DAO_ADDRESS !== '0x...') {
            this.daoContract = new this.web3.eth.Contract(this.daoABI, this.contracts.DAO_ADDRESS);
        }
        
        this.sglTokenContract = new this.web3.eth.Contract(this.tokenABI, this.contracts.SGL_TOKEN_ADDRESS);
    }
    
    async loadDAOData() {
        try {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('error').style.display = 'none';
            document.getElementById('dashboard').style.display = 'none';
            
            if (this.daoContract) {
                await this.loadRealData();
            } else {
                // Load mock data for demonstration
                this.loadMockData();
            }
            
            this.updateStatistics();
            this.updateCharts();
            this.renderProposals();
            
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            
        } catch (error) {
            console.error('Error loading DAO data:', error);
            this.showError('Error loading DAO data: ' + error.message);
        }
    }
    
    async loadRealData() {
        const proposalCount = await this.daoContract.methods.proposalCount().call();
        this.proposalData = [];
        
        for (let i = 0; i < proposalCount; i++) {
            const proposal = await this.daoContract.methods.proposals(i).call();
            const status = await this.daoContract.methods.getProposalStatus(i).call();
            const hasQuorum = await this.daoContract.methods.hasReachedQuorum(i).call();
            
            this.proposalData.push({
                id: i,
                proposer: proposal.proposer,
                description: proposal.description,
                startTime: parseInt(proposal.startTime) * 1000,
                endTime: parseInt(proposal.endTime) * 1000,
                forVotes: this.web3.utils.fromWei(proposal.forVotes, 'ether'),
                againstVotes: this.web3.utils.fromWei(proposal.againstVotes, 'ether'),
                executed: proposal.executed,
                canceled: proposal.canceled,
                status: this.getStatusName(parseInt(status)),
                hasQuorum: hasQuorum
            });
        }
    }
    
    loadMockData() {
        // Mock data for demonstration until DAO is deployed
        this.proposalData = [
            {
                id: 0,
                proposer: '0x1234...5678',
                description: 'Proposal to implement new reward system for digital avatar validators',
                startTime: Date.now() - 86400000, // 1 day ago
                endTime: Date.now() + 172800000, // 2 days from now
                forVotes: '15750',
                againstVotes: '8200',
                executed: false,
                canceled: false,
                status: 'Active',
                hasQuorum: true
            },
            {
                id: 1,
                proposer: '0xabcd...efgh',
                description: 'Proposal to create development fund for new time capsule features',
                startTime: Date.now() - 259200000, // 3 days ago
                endTime: Date.now() - 86400000, // 1 day ago
                forVotes: '22300',
                againstVotes: '5600',
                executed: true,
                canceled: false,
                status: 'Executed',
                hasQuorum: true
            },
            {
                id: 2,
                proposer: '0x9876...4321',
                description: 'Proposal to reduce avatar creation fee from 0.1 ETH to 0.05 ETH',
                startTime: Date.now() + 86400000, // 1 day from now
                endTime: Date.now() + 604800000, // 1 week from now
                forVotes: '0',
                againstVotes: '0',
                executed: false,
                canceled: false,
                status: 'Pending',
                hasQuorum: false
            },
            {
                id: 3,
                proposer: '0xdef0...1234',
                description: 'Proposal for integration with external NFT marketplaces',
                startTime: Date.now() - 432000000, // 5 days ago
                endTime: Date.now() - 172800000, // 2 days ago
                forVotes: '8900',
                againstVotes: '18400',
                executed: false,
                canceled: false,
                status: 'Defeated',
                hasQuorum: true
            }
        ];
    }
    
    updateChartsLanguage() {
        const lang = translations[currentLanguage];
        
        // Update chart labels if charts exist
        if (this.charts.status) {
            this.charts.status.data.labels = [
                lang.activeProposals || 'Active',
                lang.proposalStatusChart?.replace('📊 ', '') || 'Executed',
                'Defeated', 'Pending', 'Canceled'
            ];
            this.charts.status.update();
        }
        
        if (this.charts.votes) {
            this.charts.votes.data.datasets[0].label = lang.votesFor || 'Votes For';
            this.charts.votes.data.datasets[1].label = lang.votesAgainst || 'Votes Against';
            this.charts.votes.update();
        }
        
        if (this.charts.participation) {
            this.charts.participation.data.datasets[0].label = 'Votes per Proposal';
            this.charts.participation.update();
        }
    }
    
    getStatusName(statusCode) {
        const statuses = {
            0: 'Pending',
            1: 'Active',
            2: 'Canceled', 
            3: 'Defeated',
            4: 'Succeeded',
            5: 'Executed'
        };
        return statuses[statusCode] || 'Unknown';
    }
    
    updateStatistics() {
        const totalProposals = this.proposalData.length;
        const activeProposals = this.proposalData.filter(p => p.status === 'Active').length;
        const totalVotes = this.proposalData.reduce((sum, p) => 
            sum + parseInt(p.forVotes || 0) + parseInt(p.againstVotes || 0), 0);
        
        // Calculate participation rate (mock calculation)
        const participationRate = totalProposals > 0 ? 
            Math.round((totalVotes / (totalProposals * 50000)) * 100) : 0;
        
        document.getElementById('total-proposals').textContent = totalProposals;
        document.getElementById('active-proposals').textContent = activeProposals;
        document.getElementById('total-votes').textContent = totalVotes.toLocaleString();
        document.getElementById('participation-rate').textContent = participationRate + '%';
    }
    
    setupCharts() {
        // Proposal Status (Doughnut Chart)
        const statusCtx = document.getElementById('proposalStatusChart').getContext('2d');
        this.charts.status = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Executed', 'Defeated', 'Pending', 'Canceled'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#00ff88',
                        '#00d4ff', 
                        '#ff4757',
                        '#ffa502',
                        '#666666'
                    ],
                    borderWidth: 2,
                    borderColor: '#1a1a2e'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
        
        // Participation Over Time (Line Chart)
        const participationCtx = document.getElementById('participationChart').getContext('2d');
        this.charts.participation = new Chart(participationCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Votes per Proposal',
                    data: [],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
        
        // Vote Distribution (Bar Chart)
        const votesCtx = document.getElementById('votesDistributionChart').getContext('2d');
        this.charts.votes = new Chart(votesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Votes For',
                    data: [],
                    backgroundColor: '#00ff88'
                }, {
                    label: 'Votes Against',
                    data: [],
                    backgroundColor: '#ff4757'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
        
        // Voting Power Distribution (Pie Chart)
        const powerCtx = document.getElementById('votingPowerChart').getContext('2d');
        this.charts.power = new Chart(powerCtx, {
            type: 'pie',
            data: {
                labels: ['Top 10 Holders', 'Other Holders'],
                datasets: [{
                    data: [70, 30],
                    backgroundColor: ['#00d4ff', '#ffa502'],
                    borderWidth: 2,
                    borderColor: '#1a1a2e'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
    }
    
    updateCharts() {
        // Update Status Chart
        const statusCounts = {
            'Active': 0, 'Executed': 0, 'Defeated': 0, 'Pending': 0, 'Canceled': 0
        };
        
        this.proposalData.forEach(proposal => {
            statusCounts[proposal.status] = (statusCounts[proposal.status] || 0) + 1;
        });
        
        this.charts.status.data.datasets[0].data = [
            statusCounts['Active'],
            statusCounts['Executed'], 
            statusCounts['Defeated'],
            statusCounts['Pending'],
            statusCounts['Canceled']
        ];
        this.charts.status.update();
        
        // Update Participation Chart
        const participationData = this.proposalData.map(p => 
            parseInt(p.forVotes || 0) + parseInt(p.againstVotes || 0)
        );
        const participationLabels = this.proposalData.map(p => `Prop. ${p.id}`);
        
        this.charts.participation.data.labels = participationLabels;
        this.charts.participation.data.datasets[0].data = participationData;
        this.charts.participation.update();
        
        // Update Votes Distribution Chart
        const forVotes = this.proposalData.map(p => parseInt(p.forVotes || 0));
        const againstVotes = this.proposalData.map(p => parseInt(p.againstVotes || 0));
        const voteLabels = this.proposalData.map(p => `Prop. ${p.id}`);
        
        this.charts.votes.data.labels = voteLabels;
        this.charts.votes.data.datasets[0].data = forVotes;
        this.charts.votes.data.datasets[1].data = againstVotes;
        this.charts.votes.update();
    }
    
    renderProposals() {
        const container = document.getElementById('proposals-list');
        container.innerHTML = '';
        
        this.proposalData.forEach(proposal => {
            const proposalElement = this.createProposalCard(proposal);
            container.appendChild(proposalElement);
        });
    }
    
    createProposalCard(proposal) {
        const card = document.createElement('div');
        card.className = 'proposal-card';
        
        const totalVotes = parseInt(proposal.forVotes || 0) + parseInt(proposal.againstVotes || 0);
        const forPercentage = totalVotes > 0 ? (parseInt(proposal.forVotes || 0) / totalVotes * 100) : 0;
        
        const statusClass = this.getStatusClass(proposal.status);
        
        const lang = translations[currentLanguage];
        
        card.innerHTML = `
            <div class="proposal-header">
                <span class="proposal-id" data-translate="proposal">${lang.proposal} #${proposal.id}</span>
                <span class="proposal-status ${statusClass}">${proposal.status}</span>
            </div>
            
            <div class="proposal-description">
                ${proposal.description}
            </div>
            
            <div class="proposal-votes">
                <div class="vote-info">
                    <div class="vote-count votes-for">${parseInt(proposal.forVotes || 0).toLocaleString()}</div>
                    <div data-translate="votesFor">${lang.votesFor}</div>
                </div>
                <div class="vote-info">
                    <div class="vote-count votes-against">${parseInt(proposal.againstVotes || 0).toLocaleString()}</div>
                    <div data-translate="votesAgainst">${lang.votesAgainst}</div>
                </div>
            </div>
            
            <div class="proposal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${forPercentage}%"></div>
                </div>
                <div class="progress-text">${forPercentage.toFixed(1)}% ${lang.votesFor?.toLowerCase() || 'for'}</div>
            </div>
            
            <div class="proposal-meta">
                <div><span data-translate="proposer">${lang.proposer}:</span> ${proposal.proposer}</div>
                <div><span data-translate="quorum">${lang.quorum}:</span> ${proposal.hasQuorum ? '✅ ' + (lang.reached || 'Reached') : '❌ ' + (lang.notReached || 'Not reached')}</div>
            </div>
        `;
        
        return card;
    }
    
    getStatusClass(status) {
        const classes = {
            'Active': 'status-active',
            'Pending': 'status-pending',
            'Executed': 'status-executed',
            'Defeated': 'status-defeated',
            'Canceled': 'status-canceled'
        };
        return classes[status] || '';
    }
    
    showError(message) {
        const lang = translations[currentLanguage];
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML = `
            ❌ ${message}
            <button class="refresh-btn" onclick="daoData.loadDAOData()">🔄 ${lang.tryAgain || 'Try Again'}</button>
        `;
    }
}

// Initialize dashboard when page loads
let daoData;
document.addEventListener('DOMContentLoaded', () => {
    daoData = new DAODashboard();
});

// Global function for refresh button
function loadDAOData() {
    if (daoData) {
        daoData.loadDAOData();
    }
}