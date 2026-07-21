'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface KiriBotModalProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const markdownComponents: any = {
  strong: ({ node, ...props }: any) => <strong className="font-bold text-emerald-700" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
  li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700" target="_blank" rel="noopener noreferrer" {...props} />,
  img: ({ node, alt, ...props }: any) => {
    if (alt === 'stand' || props.src?.includes('stand')) {
      return <img className="block w-28 h-28 object-contain my-3 drop-shadow-sm rounded-lg" alt={alt} {...props} />;
    }
    return <img className="inline-block w-5 h-5 object-contain mx-0.5 align-text-bottom drop-shadow-sm" alt={alt} {...props} />;
  },
};

const DEFAULT_MESSAGE: Message = { role: 'bot', text: '안녕하신가구리! ![face](/images/logo/raccoon-mascot-face.png) \n\n너굴상점의 AI 도우미 너굴맨이라구 한다구리 \n 나는 너굴상점의 사용 가이드 등 서비스 이용 규칙에 대해 자세히 안내해 줄 수 있다구리.\n\n 어떤 도움이 필요하신가구리?![logo](/images/logo/raccoon-mascot-logo.png)' };

export default function KiriBotModal({ onClose }: KiriBotModalProps) {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('kiribot_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    if (messages.length > 1) {
      sessionStorage.setItem('kiribot_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleReset = () => {
    setMessages([DEFAULT_MESSAGE]);
    sessionStorage.removeItem('kiribot_history');
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // API 전송 시, 가장 첫 인사 메시지는 제외하고 그 이후의 컨텍스트만 보냄
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await axios.post('/api/ai/chat', {
        history,
        message: userMessage
      });

      setMessages(prev => [...prev, { role: 'bot', text: res.data.text }]);
    } catch (error) {
      console.error('KiriBot Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: '앗, 오류가 발생했다구리... 💦 다시 한 번 말해달라구리! ![face](/images/logo/raccoon-mascot-face.png)' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none transition-all duration-300" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[100] flex justify-center sm:block p-0 pointer-events-none transition-all duration-300">
        {/* 바텀시트(모바일) or 우측 하단 플로팅 챗봇(PC) 디자인 */}
        <div
          className="w-full sm:w-[380px] h-[85vh] sm:h-[600px] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl sm:border sm:border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 border-b border-emerald-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm shrink-0">
                <Image
                  src="/images/logo/raccoon-mascot-logo.png"
                  alt="너굴맨"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 leading-tight">AI 너굴맨</h2>
                <p className="text-[11px] text-emerald-700 font-medium">가이드라인 기반 AI 도우미 🍃</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors flex items-center gap-1 border border-emerald-200 bg-white shadow-sm"
              >
                <RotateCcw size={14} /> 새 채팅
              </button>
              <button
                onClick={onClose}
                className="p-2 ml-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 채팅 내역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide font-nook text-[16px] leading-relaxed tracking-[1px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>

                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                      <Image
                        src="/images/logo/raccoon-mascot-face.png"
                        alt="너굴맨"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className={cn(
                    "p-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm markdown-body"
                  )}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown components={markdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-1">
                    <Image
                      src="/images/logo/raccoon-mascot-face.png"
                      alt="너굴맨"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="px-4 py-3 bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="너굴맨에게 궁금한 점을 질문해보세요!"
                maxLength={500}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
