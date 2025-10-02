-- Script de inicialização do banco de dados SingulAI
-- Execute este script no PostgreSQL para criar as tabelas necessárias

-- Criar banco de dados (execute como superuser se necessário)
-- CREATE DATABASE singulai_db;
-- \c singulai_db;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    wallet_private_key TEXT,
    wallet_mnemonic TEXT,
    wallet_type VARCHAR(50) DEFAULT 'generated',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações da carteira
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    gas_used VARCHAR(255),
    gas_price VARCHAR(255),
    transaction_type VARCHAR(50) DEFAULT 'transfer',
    status VARCHAR(20) DEFAULT 'pending',
    block_number INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de atividades do usuário
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_hash ON wallet_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS - Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (cada usuário vê apenas seus próprios dados)
CREATE POLICY users_policy ON users
    FOR ALL USING (id = current_setting('app.current_user_id')::integer);

CREATE POLICY sessions_policy ON sessions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY wallet_transactions_policy ON wallet_transactions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY user_activities_policy ON user_activities
    FOR ALL USING (user_id = current_setting('app.current_user_id')::integer);

-- Usuário admin inicial (opcional - para desenvolvimento)
-- Senha: admin123 (hash do bcrypt)
-- INSERT INTO users (name, email, password_hash, wallet_type)
-- VALUES ('Admin', 'admin@singulai.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYKtPu', 'admin')
-- ON CONFLICT (email) DO NOTHING;

-- Logs de inicialização
DO $$
BEGIN
    RAISE NOTICE '✅ Banco de dados SingulAI inicializado com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas: users, sessions, wallet_transactions, user_activities';
    RAISE NOTICE '🔒 Row Level Security habilitado';
    RAISE NOTICE '📈 Índices de performance criados';
END $$;