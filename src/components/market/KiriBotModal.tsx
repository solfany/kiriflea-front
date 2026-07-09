'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface KiriBotModalProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function KiriBotModal({ onClose }: KiriBotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '안녕하세요! 기리 플리마켓의 귀염둥이 AI 도우미 끼리봇입니다 뿌우- 🐘\n어떤 도움이 필요하신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
      setMessages(prev => [...prev, { role: 'bot', text: '앗, 끼리봇 머리에 쥐가 났어요 뿌우... 💦 다시 한 번 말해주세요!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300" onClick={onClose}>
      {/* 바텀시트(모바일) or 우측 패널(PC) 디자인 */}
      <div 
        className="w-full sm:w-[400px] h-[80vh] sm:h-full mt-auto sm:mt-0 bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-orange-50 border-b border-orange-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">AI 끼리봇</h2>
              <p className="text-[11px] text-orange-600 font-medium">언제든 물어보세요! 🐘</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 채팅 내역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 mt-1">
                    <Bot size={18} />
                  </div>
                )}
                
                <div className={cn(
                  "p-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-orange-500 text-white rounded-tr-sm" 
                    : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex gap-2 max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 mt-1">
                  <Bot size={18} />
                </div>
                <div className="px-4 py-3 bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
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
              placeholder="끼리봇에게 무엇이든 물어보세요!"
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
