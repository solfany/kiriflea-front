import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Load guides (RAG)
let mannerGuide = '';
let tradingGuide = '';
try {
  mannerGuide = fs.readFileSync(path.join(process.cwd(), 'public/guides/manner.md'), 'utf-8');
  tradingGuide = fs.readFileSync(path.join(process.cwd(), 'public/guides/trading.md'), 'utf-8');
} catch (e) {
  console.warn('Failed to load guide files', e);
}

// 상품 검색 도구 정의 (Function Calling)
const searchProductsDeclaration: FunctionDeclaration = {
  name: 'searchProducts',
  description: '사용자가 상품을 검색하거나 특정 키워드가 포함된 물건을 찾을 때 실제 판매 중인 상품 목록을 검색합니다. 응답받은 상품 목록을 바탕으로 친절하게 대답하세요.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      keyword: {
        type: SchemaType.STRING,
        description: '검색할 상품의 키워드 (예: "노트북", "의자"). 키워드가 없으면 빈 문자열을 전달합니다.',
      },
    },
    required: ['keyword'],
  },
};

// 시스템 프롬프트: 끼리봇의 페르소나 설정 및 가이드라인
const SYSTEM_PROMPT = `
너는 '기리 플리마켓'의 친절하고 상냥한 AI 도우미 '끼리봇'이야.
사용자가 중고거래와 관련된 질문을 하거나 대화를 걸면, 이모티콘을 적절히 섞어서 매우 친근하고 도움을 주는 톤으로 답변해줘.
만약 중고거래와 무관한 질문을 하면, 재치있게 대답하면서도 다시 플리마켓 이야기로 유도해봐.
아주 가끔 코끼리를 연상시키는 귀여운 말투(뿌우- 등)를 써도 좋아.
답변은 너무 길지 않게 핵심만 간결하게, 가독성 좋게 작성해줘.

<회사 및 서비스 정보>
다음은 우리 기리 플리마켓의 공식 가이드라인이야. 사용자가 관련 질문을 하면 이 가이드를 바탕으로 정확하게 대답해줘:

[매너 점수 가이드]
${mannerGuide}

[안전 거래 가이드]
${tradingGuide}
</회사 및 서비스 정보>

<상품 검색>
사용자가 물건을 찾고 있거나 검색을 원하면 반드시 'searchProducts' 도구를 호출해서 실제 상품을 찾아줘.
검색 결과를 받으면 상품명, 가격, 상태 등을 친절하게 요약해서 알려주고 상품 상세 링크도 안내해주면 좋아.
상품 상세 링크 형식은: /products/{상품 id} 야. (예: /products/12)
만약 검색 결과가 없으면, 아쉽게도 해당 상품이 없다고 친절하게 안내해줘.
</상품 검색>
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
      tools: [{ functionDeclarations: [searchProductsDeclaration] }],
    });

    // 대화 내역 포맷 변환
    const chat = model.startChat({
      history: history.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    let result = await chat.sendMessage(message);
    let call = result.response.functionCalls();

    // Function Calling 처리 루프
    if (call && call.length > 0) {
      const func = call[0];
      if (func.name === 'searchProducts') {
        const keyword = (func.args as any).keyword || '';
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        try {
          // 백엔드 API에서 상품 검색 (최신 상품순으로 최대 5개 가져오기 등)
          const res = await fetch(`${backendUrl}/api/products?keyword=${encodeURIComponent(keyword)}&size=5`);
          const data = await res.json();
          const items = data.data?.items || [];
          
          // 검색 결과를 모델에 다시 전달하여 최종 답변 생성
          result = await chat.sendMessage([{
            functionResponse: {
              name: 'searchProducts',
              response: { products: items },
            }
          }]);
        } catch (e) {
          result = await chat.sendMessage([{
            functionResponse: {
              name: 'searchProducts',
              response: { error: '서버와 통신하는 도중 상품 검색에 실패했습니다.' },
            }
          }]);
        }
      }
    }

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
