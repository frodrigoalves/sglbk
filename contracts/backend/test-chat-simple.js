const axios = require('axios');

async function testChatAPI() {
    try {
        console.log('🔍 Testando API de chat do backend...');
        
        const startTime = Date.now();
        
        const response = await axios.post('http://localhost:3000/api/chat', {
            message: 'Oi'
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Sucesso! Tempo de resposta: ${duration}ms`);
        console.log('Resposta:', response.data.response);
        console.log('Modelo:', response.data.model);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
        
        if (error.code === 'ECONNABORTED') {
            console.log('💡 Timeout - o servidor demorou mais de 30 segundos para responder');
        }
    }
}

testChatAPI();