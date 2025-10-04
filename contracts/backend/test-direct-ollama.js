const axios = require('axios');

async function testDirectOllama() {
    try {
        console.log('🔍 Testando geração direta com Ollama...');
        
        const response = await axios.post('http://72.60.147.56:11434/api/generate', {
            model: 'llama2',
            prompt: 'Oi',
            stream: false,
            options: {
                temperature: 0.3,
                top_p: 0.8,
                num_predict: 50,  // Muito pequeno para teste
                stop: ['\n\n']
            }
        }, {
            timeout: 30000
        });
        
        console.log('✅ Resposta direta do Ollama:');
        console.log(response.data.response);
        
    } catch (error) {
        console.error('❌ Erro direto com Ollama:', error.message);
    }
}

testDirectOllama();