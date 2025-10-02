const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Web3 = require('web3');
const bip39 = require('bip39');
const hdkey = require('hdkey');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Web3 setup - Desabilitado temporariamente para desenvolvimento
let web3 = null;
console.log('Web3 desabilitado para desenvolvimento local');

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(403).json({ error: 'Token inválido' });
    }
};

// Função para gerar carteira (simplificada sem Web3)
async function generateWallet() {
    try {
        // Gera mnemonic
        const mnemonic = bip39.generateMnemonic();

        // Deriva chave privada da mnemonic
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const hdkeyInstance = hdkey.fromMasterSeed(seed);
        const child = hdkeyInstance.derive("m/44'/60'/0'/0/0");
        const privateKey = '0x' + child.privateKey.toString('hex');

        // Gera endereço Ethereum simples (para desenvolvimento)
        // Em produção, use Web3 ou ethers.js
        const address = '0x' + child.publicKey.toString('hex').slice(-40);

        return {
            address: address,
            privateKey: privateKey,
            mnemonic: mnemonic
        };
    } catch (error) {
        console.error('Erro ao gerar carteira:', error);
        throw new Error('Falha ao gerar carteira');
    }
}

// Função para enviar email de confirmação
async function sendConfirmationEmail(email, name, confirmationToken) {
    try {
        const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/confirm-email.html?token=${confirmationToken}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Confirme sua conta - SingulAI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #06b6d4;">Bem-vindo ao SingulAI, ${name}!</h2>
                    <p>Para ativar sua conta e começar a usar nossa plataforma, confirme seu email clicando no botão abaixo:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmationUrl}"
                           style="background: linear-gradient(45deg, #06b6d4, #3b82f6);
                                  color: white;
                                  padding: 15px 30px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  font-weight: bold;
                                  display: inline-block;">
                            Confirmar Email
                        </a>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                        <a href="${confirmationUrl}" style="color: #06b6d4;">${confirmationUrl}</a>
                    </p>

                    <p style="color: #666; font-size: 14px;">
                        Este link expira em 24 horas.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">
                        SingulAI - O futuro registrado<br>
                        Se você não solicitou esta conta, ignore este email.
                    </p>
                </div>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`Email de confirmação enviado para ${email}`);
    } catch (error) {
        console.error('Erro ao enviar email de confirmação:', error);
        // Não falha a operação se o email não puder ser enviado
    }
}

// Rotas de Autenticação (com fallback para desenvolvimento)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validações
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
        }

        // Tenta usar banco de dados, se falhar usa mock
        try {
            // Verifica se email já existe
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 12);

            // Gera carteira
            const wallet = await generateWallet();

            // Gera token de confirmação de email
            const emailConfirmationToken = crypto.randomBytes(32).toString('hex');

            // Insere usuário no banco (não confirmado ainda)
            const result = await pool.query(
                `INSERT INTO users (name, email, password_hash, wallet_address, wallet_private_key, wallet_mnemonic, email_confirmation_token, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 RETURNING id, name, email, wallet_address, created_at`,
                [fullName, email, hashedPassword, wallet.address, wallet.privateKey, wallet.mnemonic, emailConfirmationToken]
            );

            const user = result.rows[0];

            // Envia email de confirmação
            await sendConfirmationEmail(email, fullName, emailConfirmationToken);

            // Gera token JWT temporário (válido por 24h para confirmação)
            const token = jwt.sign(
                { userId: user.id, email: user.email, emailConfirmed: false },
                process.env.JWT_SECRET || 'dev-secret-key',
                { expiresIn: '24h' }
            );

            return res.status(201).json({
                message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    walletAddress: user.wallet_address,
                    emailConfirmed: false
                },
                token,
                wallet: {
                    address: wallet.address,
                    mnemonic: wallet.mnemonic
                },
                requiresEmailConfirmation: true
            });

        } catch (dbError) {
            // Fallback para desenvolvimento sem banco
            console.log('Usando modo desenvolvimento (sem banco)');

            const wallet = await generateWallet();
            const token = jwt.sign(
                { userId: 1, email: email },
                process.env.JWT_SECRET || 'dev-secret-key',
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                message: 'Conta criada com sucesso (modo dev)',
                user: {
                    id: 1,
                    name: fullName,
                    email: email,
                    walletAddress: wallet.address
                },
                token,
                wallet: {
                    address: wallet.address,
                    mnemonic: wallet.mnemonic
                }
            });
        }

    } catch (error) {
        console.error('Erro no signup:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para confirmar email
app.get('/api/auth/confirm-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token de confirmação necessário' });
        }

        // Busca usuário pelo token
        const result = await pool.query(
            'SELECT id, name, email FROM users WHERE email_confirmation_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        const user = result.rows[0];

        // Confirma o email
        await pool.query(
            'UPDATE users SET email_confirmed = true, email_confirmation_token = null, updated_at = NOW() WHERE id = $1',
            [user.id]
        );

        // Gera novo token JWT com email confirmado
        const jwtToken = jwt.sign(
            { userId: user.id, email: user.email, emailConfirmed: true },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Email confirmado com sucesso!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailConfirmed: true
            },
            token: jwtToken
        });

    } catch (error) {
        console.error('Erro na confirmação de email:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter configurações do token SGL
app.get('/api/token/config', (req, res) => {
    res.json({
        token: {
            name: 'SingulAI Token',
            symbol: 'SGL',
            decimals: 18,
            contractAddress: process.env.SGL_TOKEN_ADDRESS || '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
            network: 'Sepolia',
            chainId: 11155111
        },
        features: {
            autoAddToWallet: true,
            displayInDashboard: true,
            enableTransfers: true,
            enableStaking: false
        }
    });
});

// Rota para configurar token SGL para uma wallet específica
app.post('/api/token/config', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Endereço da wallet é obrigatório' });
        }

        // Validar formato do endereço
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ error: 'Endereço da wallet inválido' });
        }

        // Retornar configuração completa para MetaMask
        res.json({
            sglToken: {
                address: process.env.SGL_TOKEN_ADDRESS || '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
                symbol: 'SGL',
                decimals: 18,
                image: 'https://www.singulai.live/assets/sgl-token.png', // URL do ícone do token
                name: 'SingulAI Token'
            },
            walletAddress: walletAddress,
            configured: true,
            message: 'Token SGL configurado para esta wallet'
        });

    } catch (error) {
        console.error('Erro na configuração do token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        try {
            // Busca usuário no banco
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const user = result.rows[0];

            // Verifica senha
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Gera token JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'dev-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    walletAddress: user.wallet_address
                },
                token
            });

        } catch (dbError) {
            // Fallback para desenvolvimento
            console.log('Usando modo desenvolvimento (sem banco)');

            if (email === 'admin@singulai.com' && password === 'admin123') {
                const token = jwt.sign(
                    { userId: 1, email: email },
                    process.env.JWT_SECRET || 'dev-secret-key',
                    { expiresIn: '7d' }
                );

                return res.json({
                    message: 'Login realizado com sucesso (modo dev)',
                    user: {
                        id: 1,
                        name: 'Admin',
                        email: email,
                        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    },
                    token
                });
            }

            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para importar carteira existente (simplificada sem Web3)
app.post('/api/auth/import-wallet', authenticateToken, async (req, res) => {
    try {
        const { privateKey, walletType = 'imported' } = req.body;

        if (!privateKey) {
            return res.status(400).json({ error: 'Chave privada é obrigatória' });
        }

        // Validação básica da chave privada (formato hexadecimal)
        if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
            return res.status(400).json({ error: 'Chave privada deve ser um hexadecimal válido de 64 caracteres' });
        }

        // Gera endereço simples da chave privada (para desenvolvimento)
        // Em produção, use Web3 ou ethers.js para validação completa
        const address = '0x' + privateKey.slice(-40);

        // Atualiza usuário com nova carteira
        await pool.query(
            `UPDATE users
             SET wallet_address = $1, wallet_private_key = $2, wallet_type = $3, updated_at = NOW()
             WHERE id = $4`,
            [address, privateKey, walletType, req.user.id]
        );

        res.json({
            message: 'Carteira importada com sucesso',
            wallet: {
                address: address,
                type: walletType
            }
        });

    } catch (error) {
        console.error('Erro ao importar carteira:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para conectar MetaMask (automatizada)
app.post('/api/auth/connect-metamask', async (req, res) => {
    try {
        const { address, signature, createAccount = false } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Endereço da carteira é obrigatório' });
        }

        // Valida formato do endereço
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Endereço da carteira inválido' });
        }

        try {
            // Verifica se já existe usuário com este endereço
            const existingUser = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [address]);

            if (existingUser.rows.length > 0) {
                // Usuário existente - faz login automático
                const user = existingUser.rows[0];

                // Gera token JWT
                const token = jwt.sign(
                    { userId: user.id, email: user.email, emailConfirmed: user.email_confirmed },
                    process.env.JWT_SECRET || 'dev-secret-key',
                    { expiresIn: '7d' }
                );

                return res.json({
                    message: 'Login realizado com MetaMask',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        walletAddress: user.wallet_address,
                        emailConfirmed: user.email_verified
                    },
                    token,
                    action: 'login'
                });
            } else if (createAccount) {
                // Criar nova conta automaticamente
                const tempName = `Wallet User ${address.slice(-6)}`;
                const tempEmail = `wallet_${address.slice(-8)}@temp.singulai.local`;

                // Hash de senha temporária (não será usada)
                const hashedPassword = await bcrypt.hash('temp_password_' + Date.now(), 12);

                // Insere usuário com carteira MetaMask
                const result = await pool.query(
                    `INSERT INTO users (name, email, password_hash, wallet_address, wallet_type, email_confirmed, created_at)
                     VALUES ($1, $2, $3, $4, 'metamask', true, NOW())
                     RETURNING id, name, email, wallet_address, created_at`,
                    [tempName, tempEmail, hashedPassword, address]
                );

                const user = result.rows[0];

                // Gera token JWT
                const token = jwt.sign(
                    { userId: user.id, email: user.email, emailConfirmed: true },
                    process.env.JWT_SECRET || 'dev-secret-key',
                    { expiresIn: '7d' }
                );

                return res.status(201).json({
                    message: 'Conta criada automaticamente com MetaMask',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        walletAddress: user.wallet_address,
                        emailConfirmed: true
                    },
                    token,
                    action: 'signup',
                    requiresProfileUpdate: true // Indica que o usuário deve completar o perfil
                });
            } else {
                // Oferece opções para o usuário
                return res.json({
                    message: 'Carteira não encontrada',
                    action: 'options',
                    options: {
                        createAccount: 'Criar nova conta automaticamente',
                        connectExisting: 'Conectar a conta existente',
                        importWallet: 'Importar carteira existente'
                    },
                    wallet: {
                        address: address,
                        type: 'metamask'
                    }
                });
            }

        } catch (dbError) {
            // Fallback para desenvolvimento
            console.log('Usando modo desenvolvimento (sem banco)');

            // Simula criação/login automático
            const token = jwt.sign(
                { userId: 1, email: `metamask_${address.slice(-6)}@temp.local` },
                process.env.JWT_SECRET || 'dev-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                message: 'MetaMask conectada (modo dev)',
                user: {
                    id: 1,
                    name: 'MetaMask User',
                    email: `metamask_${address.slice(-6)}@temp.local`,
                    walletAddress: address
                },
                token,
                action: 'login'
            });
        }

    } catch (error) {
        console.error('Erro ao conectar MetaMask:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter perfil do usuário
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, wallet_address, wallet_type, created_at
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                walletAddress: user.wallet_address,
                walletType: user.wallet_type,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter saldo da carteira (mockado para desenvolvimento)
app.get('/api/wallet/balance/:address', authenticateToken, async (req, res) => {
    try {
        const { address } = req.params;

        // Verifica se o endereço pertence ao usuário
        if (req.user.wallet_address !== address) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        // Saldo mockado para desenvolvimento (sem Web3)
        const mockBalance = (Math.random() * 10).toFixed(4); // Saldo aleatório entre 0-10 ETH

        res.json({
            address: address,
            balance: mockBalance,
            balanceWei: (parseFloat(mockBalance) * 1e18).toString(),
            note: 'Saldo mockado para desenvolvimento'
        });

    } catch (error) {
        console.error('Erro ao obter saldo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
async function initDatabase() {
    try {
        // Testa conexão com o banco
        await pool.query('SELECT 1');

        // Cria tabela de usuários se não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                wallet_address VARCHAR(255),
                wallet_private_key TEXT,
                wallet_mnemonic TEXT,
                wallet_type VARCHAR(50) DEFAULT 'generated',
                email_confirmed BOOLEAN DEFAULT FALSE,
                email_confirmation_token VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
        `);

        console.log('✅ Banco de dados inicializado');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error.message);
        console.log('⚠️  Servidor iniciará sem banco de dados (modo desenvolvimento)');
        return false;
    }
}

async function startServer() {
    const dbAvailable = await initDatabase();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor SingulAI rodando na porta ${PORT}`);
        if (!dbAvailable) {
            console.log(`⚠️  Modo desenvolvimento - sem banco de dados`);
        }
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
}

// Graceful shutdown - desabilitado para desenvolvimento
/*
process.on('SIGTERM', async () => {
    console.log('🛑 Encerrando servidor...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Encerrando servidor...');
    await pool.end();
    process.exit(0);
});
*/

startServer();