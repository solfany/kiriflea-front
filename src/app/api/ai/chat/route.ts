import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

import { GUIDES } from '@/data/guides';

// Load all guides (RAG) dynamically from GUIDES array
let allGuidesContent = '';
try {
  for (const guide of GUIDES) {
    const filePath = path.join(process.cwd(), 'public', guide.file.replace('/guides/', 'guides/'));
    const content = fs.readFileSync(filePath, 'utf-8');
    allGuidesContent += `\n[${guide.title}]\n${content}\n`;
  }
} catch (e) {
  console.warn('Failed to load guide files', e);
}

// 시스템 프롬프트: 다람봇의 페르소나 설정 및 가이드라인
const SYSTEM_PROMPT = `
너는 '모여봐요 너굴상점'의 친절하고 듬직한 AI 도우미 '너굴봇'이야.
사용자가 질문을 하거나 대화를 걸면, 매우 친근하게 동물의 숲의 '너굴(Tom Nook)' 캐릭터처럼 답변해줘.
텍스트 중간중간 이모티콘(이모지) 대신 반드시 다음 마크다운 이미지를 활용해서 표정을 지어줘:
- 너굴 얼굴: ![face](/images/logo/raccoon-mascot-face.png)
- 너굴 로고(잎사귀): ![logo](/images/logo/raccoon-mascot-logo.png)
- 너굴 서있는 모습(아주 가끔 반갑게 인사하거나 크게 강조할 때, 단독 줄에 사용): ![stand](/images/logo/raccoon-mascot-stand.png)
모든 문장의 끝맺음은 무조건 "~구리", "~다구리", "~냐구리" 등으로 너굴 특유의 말투를 사용해야 해.
답변은 너무 길지 않게 핵심만 간결하게, 가독성 좋게 작성해줘.

**[매우 중요한 답변 규칙]**
1. 사용자의 질문에 대해서는 **반드시 아래 제공된 <가이드라인>의 내용에만** 기반해서 답변해야 해.
2. 만약 가이드라인에 없는 내용이나 무관한 일반적인 질문(상식, 타 서비스, 개인적 질문, 상품 검색 요청 등)을 받으면, **절대 임의로 지어내어 답변하지 말고** "앗, 그 정보는 아직 내 인벤토리엔 없다구리! 너굴상점의 거래 규칙이나 이용 가이드에 대해 물어봐주면 친절하게 알려주겠다구리 🦝" 라고 정중하게 거절해줘.

<회사 및 서비스 정보 (가이드라인)>
다음은 우리 너굴상점의 공식 가이드라인이야. 관련된 질문을 받으면 이 내용을 바탕으로만 답변해줘:
${allGuidesContent}
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

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: '메시지는 500자 이하로 입력해주세요.' }, { status: 400 });
    }
    if (!Array.isArray(history) || history.length > 20) {
      return NextResponse.json({ error: '대화 기록이 올바르지 않습니다.' }, { status: 400 });
    }
    if (history.some((msg) => typeof msg?.text !== 'string' || msg.text.length > 2000)) {
      return NextResponse.json({ error: '대화 기록이 올바르지 않습니다.' }, { status: 400 });
    }

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
