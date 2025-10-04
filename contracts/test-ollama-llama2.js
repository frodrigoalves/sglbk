const axios = require('axios');

async function testOllama() {
  try {
    console.log('Conectando ao Ollama no servidor...');
    
    const response = await axios.post('http://72.60.147.56:11434/api/generate', {
      model: 'llama2',
      prompt: 'Olá, sou a IA do SingulAI. Como posso ajudar?',
      stream: false
    });
    
    console.log('Resposta do Ollama:');
    console.log(response.data.response);
  } catch (error) {
    console.error('Erro ao se comunicar com o Ollama:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOllama();