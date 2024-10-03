const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// JSON 요청을 처리하기 위한 미들웨어 설정
app.use(express.json());
app.use(cors()); // 모든 도메인에서의 요청을 허용

// 이미지가 저장된 로컬 경로 설정
const imageDirectory = path.join('C:', 'Users', 'j0708', 'Desktop', '무의식 상담소', 'image');
app.use('/images', express.static(imageDirectory)); // '/images' 경로로 이미지 제공

// OpenAI API 키 설정 (실제 키로 교체해야 합니다)
const OPENAI_API_KEY = 'sk-'; // 실제 OpenAI API 키로 교체

// 정적 파일 제공 - index.html 파일을 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // 프로젝트 루트에 있는 index.html 제공
});

// 대화 요청 처리
app.post('/counsel', async (req, res) => {
    const userInput = req.body.question;

    // 입력 값 검증
    if (!userInput) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        // OpenAI API로 대화 요청
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // OpenAI API 키 설정
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // GPT-3.5 모델 사용
                messages: [
                    {
                        role: 'system',
                        content: '너는 융 정신분석 전문가야. 사용자의 고민과 상담 요청에 대해 무의식과 꿈의 해석 및 감정 상담을 제공해줘.',
                    },
                    {
                        role: 'user',
                        content: userInput, // 사용자의 입력 내용을 전달
                    }
                ],
                max_tokens: 500,  // 응답의 최대 길이
                temperature: 0.7,  // 응답의 창의성 설정
            }),
        });

        const data = await response.json();

        // OpenAI API 응답 검증
        if (data && Array.isArray(data.choices) && data.choices.length > 0) {
            // 응답을 클라이언트로 전송
            res.json({ answer: data.choices[0].message.content });
        } else {
            console.error('Invalid response structure:', data);
            res.status(500).send('Invalid response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing your request.');
    }
});

// 서버 실행
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
