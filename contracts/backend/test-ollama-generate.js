const axios = require('axios');

async function testOllamaGenerate() {
    try {
        console.log('Testando geração de texto com Ollama...');
        const ollamaUrl = 'http://72.60.147.56:11434';
        const ollamaModel = 'llama2';
        
        const prompt = 'Como o SingulAI pode ajudar com legado digital?';
        console.log(`Enviando prompt: "${prompt}"`);
        
        const response = await axios.post(`${ollamaUrl}/api/generate`, {
            model: ollamaModel,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 500
            }
        });
        
        console.log('\nResposta do Ollama:');
        console.log('----------------------------------');
        console.log(response.data.response);
        console.log('----------------------------------');
        
    } catch (error) {
        console.error('Erro ao testar geração de texto:', error.message || error);
        
        if (error.response) {
            console.error('Detalhes do erro:');
            console.error(`Status: ${error.response.status}`);
            console.error(`Mensagem: ${JSON.stringify(error.response.data)}`);
        } else if (error.code) {
            console.error('Código de erro:', error.code);
        }
    }
}

testOllamaGenerate();