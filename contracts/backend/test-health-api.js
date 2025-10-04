const axios = require('axios');

async function testHealthAPI() {
    try {
        console.log('Testando API de saúde (health check)...');
        
        const response = await axios.get('http://localhost:3000/api/health');
        
        console.log('Resposta da API de saúde:');
        console.log(response.data);
        
    } catch (error) {
        console.error('Erro ao testar API de saúde:', error.message || error);
        console.error('Stack:', error.stack);
        
        if (error.response) {
            console.error('Detalhes do erro:');
            console.error(`Status: ${error.response.status}`);
            console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
        } else if (error.code) {
            console.error('Código de erro:', error.code);
        }
    }
}

testHealthAPI();