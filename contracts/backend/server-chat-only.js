const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).send('SingulAI Backend - Chat Only Version - OK');
});

// Chat with Ollama endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Mensagem é obrigatória'
            });
        }

        // Check if Ollama is enabled
        if (process.env.OLLAMA_ENABLED !== 'true') {
            return res.status(503).json({
                success: false,
                error: 'Serviço de IA está desabilitado'
            });
        }

        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const model = process.env.OLLAMA_MODEL || 'llama2';

        console.log(`📤 Enviando para Ollama: ${message.substring(0, 100)}...`);
        console.log(`🔗 URL: ${ollamaUrl}/api/generate`);
        
        const prompt = `Você é o assistente IA do SingulAI, especialista em legado digital e blockchain. 

Sobre o SingulAI:
- Plataforma de legado digital na blockchain
- Avatares NFT que preservam personalidades
- Cápsulas do tempo para mensagens futuras
- Herança digital inteligente
- Contratos na rede Sepolia (testnet)

Responda de forma útil, concisa e focada em blockchain, NFTs, legado digital ou heranças digitais.

Pergunta: ${message}

Resposta:`;

        const ollamaResponse = await axios.post(`${ollamaUrl}/api/generate`, {
            model: model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 150,
                top_p: 0.9
            }
        }, {
            timeout: 60000, // 60 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (ollamaResponse.data && ollamaResponse.data.response) {
            const aiResponse = ollamaResponse.data.response.trim();
            console.log(`✅ Resposta recebida: ${aiResponse.substring(0, 100)}...`);
            
            res.json({
                success: true,
                response: aiResponse,
                model: model,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('❌ Resposta inválida do Ollama:', ollamaResponse.data);
            res.status(500).json({
                success: false,
                error: 'Resposta inválida da IA'
            });
        }

    } catch (error) {
        console.error('❌ Erro no chat:', error.message);
        
        let errorMessage = 'Erro interno do servidor';
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Não foi possível conectar com a IA';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Timeout - IA demorou para responder';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Erro no servidor:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SingulAI Backend (Chat Only) rodando na porta ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🔧 Ollama URL: ${process.env.OLLAMA_URL}`);
    console.log(`🧠 Modelo: ${process.env.OLLAMA_MODEL}`);
});

module.exports = app;