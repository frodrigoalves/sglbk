const axios = require('axios');

async function testSimpleOllama() {
    try {
        console.log('Testando conexão simples com Ollama...');
        
        const response = await axios.get('http://72.60.147.56:11434/api/version', {
            timeout: 10000
        });
        
        console.log('✅ Ollama conectado!');
        console.log('Versão:', response.data);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao conectar com Ollama:', error.message);
        return false;
    }
}

async function testChatEndpoint() {
    try {
        console.log('Testando endpoint de chat do backend...');
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            message: 'Oi'
        }, {
            timeout: 5000
        });
        
        console.log('✅ Chat endpoint funcionando!');
        console.log('Resposta:', response.data.response.substring(0, 100) + '...');
        
    } catch (error) {
        console.error('❌ Erro no chat endpoint:', error.message);
        
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            console.log('🔍 Problema: O backend está demorando para responder');
            console.log('💡 Possível causa: Ollama não está respondendo rapidamente');
        }
    }
}

async function main() {
    console.log('=== Diagnóstico de Conectividade ===\n');
    
    const ollamaOk = await testSimpleOllama();
    
    if (ollamaOk) {
        console.log('\n=== Testando Backend ===\n');
        await testChatEndpoint();
    } else {
        console.log('\n❌ Não foi possível continuar - Ollama não está acessível');
    }
}

main();