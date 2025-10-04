const axios = require('axios');

async function testChatAPI() {
  try {
    console.log('Testando API de chat com SingulAI...');
    
    const response = await axios.post('http://localhost:3000/api/chat', {
      message: 'Olá, sou um usuário da plataforma SingulAI. Como o sistema de avatares digitais funciona?'
    });
    
    console.log('\nResposta da API de chat:');
    console.log('------------------------');
    console.log(response.data.response);
    console.log('------------------------');
    console.log(`\nModelo usado: ${response.data.model}`);
    console.log(`Timestamp: ${response.data.timestamp}`);
  } catch (error) {
    console.error('Erro ao se comunicar com a API de chat:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testChatAPI();