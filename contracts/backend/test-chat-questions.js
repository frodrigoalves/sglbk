const axios = require('axios');

async function testChatQuestions() {
    const questions = [
        'O que é o SingulAI?',
        'Como posso criar um avatar digital?',
        'O que são cápsulas do tempo?',
        'Como funciona a blockchain?',
        'Preciso de uma carteira para usar o SingulAI?'
    ];
    
    console.log('🤖 Testando diferentes perguntas para o SingulAI...\n');
    
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        try {
            console.log(`${i + 1}. Pergunta: "${question}"`);
            console.log('   ⏳ Aguardando resposta...');
            
            const startTime = Date.now();
            
            const response = await axios.post('http://localhost:3000/api/chat', {
                message: question
            }, {
                timeout: 30000
            });
            
            const duration = Date.now() - startTime;
            
            console.log(`   ✅ Resposta (${duration}ms):`);
            console.log(`   "${response.data.response}"`);
            console.log('');
            
        } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
            console.log('');
        }
    }
}

testChatQuestions();