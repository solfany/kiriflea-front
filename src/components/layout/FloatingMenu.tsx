'use client';

import { useState } from 'react';
import { Plus, MessageCircle, Bot, ArrowUp, CodeSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactDeveloperModal } from '@/components/market/ContactDeveloperModal';
import KiriBotModal from '@/components/market/KiriBotModal';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [showKiriBotModal, setShowKiriBotModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">
        {/* 서브 메뉴들 */}
        <div 
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-300 origin-bottom",
            isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none"
          )}
        >
          {/* 맨 위로 */}
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">맨 위로</span>
            <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all">
              <ArrowUp size={20} />
            </div>
          </button>

          {/* 카카오톡 문의 (예시 링크) */}
          <a 
            href="https://open.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">카톡 문의</span>
            <div className="w-12 h-12 bg-[#FEE500] rounded-full shadow-lg flex items-center justify-center text-[#000000] hover:bg-[#FDD800] active:scale-95 transition-all">
              <MessageCircle size={20} fill="currentColor" />
            </div>
          </a>

          {/* 개발자 문의 */}
          <button 
            onClick={() => {
              setShowDeveloperModal(true);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">개발자 문의</span>
            <div className="w-12 h-12 bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-gray-900 active:scale-95 transition-all">
              <CodeSquare size={20} />
            </div>
          </button>

          {/* AI 끼리봇 */}
          <button 
            onClick={() => {
              setShowKiriBotModal(true);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">AI 끼리봇</span>
            <div className="w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 active:scale-95 transition-all">
              <Bot size={22} />
            </div>
          </button>
        </div>

        {/* 메인 FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-all duration-300",
            isOpen ? "bg-gray-800 rotate-45" : "bg-orange-500 hover:bg-orange-600 hover:shadow-xl"
          )}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {showDeveloperModal && (
        <ContactDeveloperModal onClose={() => setShowDeveloperModal(false)} />
      )}
      
      {showKiriBotModal && (
        <KiriBotModal onClose={() => setShowKiriBotModal(false)} />
      )}
    </>
  );
}
