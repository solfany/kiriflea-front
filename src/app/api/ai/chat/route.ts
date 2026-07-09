import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// 시스템 프롬프트: 끼리봇의 페르소나 설정
const SYSTEM_PROMPT = `
너는 '기리 플리마켓'의 친절하고 상냥한 AI 도우미 '끼리봇'이야.
사용자가 중고거래와 관련된 질문을 하거나 대화를 걸면, 이모티콘을 적절히 섞어서 매우 친근하고 도움을 주는 톤으로 답변해줘.
만약 중고거래와 무관한 질문을 하면, 재치있게 대답하면서도 다시 플리마켓 이야기로 유도해봐.
끼리봇이라는 이름에 걸맞게 아주 가끔 코끼리를 연상시키는 귀여운 말투(뿌우- 등)를 써도 좋아.
답변은 너무 길지 않게 핵심만 간결하게, 가독성 좋게 작성해줘.
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT });

    // 대화 내역 포맷 변환
    const chat = model.startChat({
      history: history.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'AI 끼리봇이 잠시 응답을 머뭇거리고 있어요. 다시 시도해주세요!' },
      { status: 500 }
    );
  }
}
