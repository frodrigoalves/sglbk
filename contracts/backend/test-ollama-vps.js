const axios = require('axios');

async function testOllamaAPI() {
    try {
        console.log('Testando API do Ollama no VPS...');
        const ollamaUrl = 'http://72.60.147.56:11434';
        
        // Primeiro teste: verificar se o servidor está online
        const pingResponse = await axios.get(`${ollamaUrl}/api/version`);
        console.log('Versão do Ollama:', pingResponse.data);
        
        // Segundo teste: listar modelos disponíveis
        const modelsResponse = await axios.get(`${ollamaUrl}/api/tags`);
        console.log('Modelos disponíveis:');
        console.log(modelsResponse.data);
        
    } catch (error) {
        console.error('Erro ao testar API do Ollama:', error.message || error);
        
        if (error.response) {
            console.error('Detalhes do erro:');
            console.error(`Status: ${error.response.status}`);
            console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
        } else if (error.code) {
            console.error('Código de erro:', error.code);
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                console.error('Não foi possível conectar ao Ollama na VPS. Verifique se:');
                console.error('1. O serviço Ollama está em execução');
                console.error('2. A porta 11434 está aberta no firewall');
                console.error('3. O Ollama está configurado para aceitar conexões externas');
            }
        }
    }
}

testOllamaAPI();