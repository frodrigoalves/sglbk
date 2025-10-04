const axios = require('axios');

async function testChatAPI() {
    try {
        console.log('Testando API de chat...');
        
        console.log('Fazendo requisição para http://localhost:3000/api/chat');
        const response = await axios.post('http://localhost:3000/api/chat', {
            message: 'Olá, como o SingulAI pode me ajudar com legado digital?'
        }, {
            timeout: 60000, // 60 segundos timeout
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Resposta da API:');
        console.log('----------------------------------');
        console.log(response.data.response);
        console.log('----------------------------------');
        console.log(`Modelo usado: ${response.data.model}`);
        console.log(`Timestamp: ${response.data.timestamp}`);
        
    } catch (error) {
        console.error('Erro ao testar API de chat:', error.message || error);
        console.error('Stack:', error.stack);
        
        if (error.response) {
            console.error('Detalhes do erro:');
            console.error(`Status: ${error.response.status}`);
            console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
            if (error.response.data && error.response.data.stack) {
                console.error('Stack do servidor:', error.response.data.stack);
            }
        } else if (error.code) {
            console.error('Código de erro:', error.code);
        }
        
        // Verificar se é um problema de acesso ao servidor Ollama
        if (error.message && error.message.includes('ECONNREFUSED') && error.message.includes('11434')) {
            console.error('\n⚠️ PROBLEMA DETECTADO: Não foi possível conectar ao servidor Ollama.');
            console.error('Verifique se o Ollama está rodando na VPS e se a porta 11434 está acessível.\n');
        }
    }
}

testChatAPI();