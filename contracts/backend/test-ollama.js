console.log('Teste de conexao Ollama');
const axios = require('axios');

async function testOllama() {
    try {
        console.log('Testando conexao com Ollama...');
        const response = await axios.get('http://72.60.147.56:11434/api/tags', {
            timeout: 10000
        });
        console.log('Ollama acessivel!');
        console.log('Modelos:', response.data.models || []);
    } catch (error) {
        console.log('Ollama nao acessivel:', error.message);
    }
}

testOllama();
