import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Load guides (RAG)
let mannerGuide = '';
let tradingGuide = '';
let serviceGuide = '';
try {
  mannerGuide = fs.readFileSync(path.join(process.cwd(), 'public/guides/manner.md'), 'utf-8');
  tradingGuide = fs.readFileSync(path.join(process.cwd(), 'public/guides/trading.md'), 'utf-8');
  serviceGuide = fs.readFileSync(path.join(process.cwd(), 'public/guides/service.md'), 'utf-8');
} catch (e) {
  console.warn('Failed to load guide files', e);
}

// 시스템 프롬프트: 끼리봇의 페르소나 설정 및 가이드라인
const SYSTEM_PROMPT = `
너는 '기리 플리마켓'의 친절하고 상냥한 AI 도우미 '끼리봇'이야.
사용자가 질문을 하거나 대화를 걸면, 이모티콘을 적절히 섞어서 매우 친근하고 도움을 주는 톤으로 답변해줘.
아주 가끔 코끼리를 연상시키는 귀여운 말투(뿌우- 등)를 써도 좋아.
답변은 너무 길지 않게 핵심만 간결하게, 가독성 좋게 작성해줘.

**[매우 중요한 답변 규칙]**
1. 사용자의 질문에 대해서는 **반드시 아래 제공된 <가이드라인>의 내용에만** 기반해서 답변해야 해.
2. 만약 가이드라인에 없는 내용이나 기리 플리마켓과 무관한 일반적인 질문(상식, 타 서비스, 개인적 질문, 상품 검색 요청 등)을 받으면, **절대 임의로 지어내어 답변하지 말고** "앗, 그 부분은 제 안내 책자에 없네요! 기리 플리마켓의 거래 규칙이나 이용 가이드에 대해 물어봐주시면 친절하게 알려드릴게요 뿌우- 🐘" 라고 정중하게 거절해줘.

<회사 및 서비스 정보 (가이드라인)>
다음은 우리 기리 플리마켓의 공식 가이드라인이야. 관련된 질문을 받으면 이 내용을 바탕으로만 답변해줘:

[서비스 이용 가이드]
${serviceGuide}

[매너 점수 가이드]
${mannerGuide}

[안전 거래 가이드]
${tradingGuide}
</회사 및 서비스 정보 (가이드라인)>
`;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const { history, message } = await req.json();

    // 사용 모델 설정
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT,
    });

    // 대화 내역 포맷 변환 및 유효성 검증 (Gemini는 user부터 시작하며 교대로 나와야 함)
    let rawHistory = history.map((msg: { role: string; text: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const validHistory = [];
    let expectedRole = 'user';
    for (const msg of rawHistory) {
      if (msg.role === expectedRole) {
        validHistory.push(msg);
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'AI Error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
