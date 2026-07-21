'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';
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
      <div className="fixed bottom-20 z-40 flex flex-col items-end gap-3 right-4 md:right-[max(1.5rem,calc(50vw-480px))]">
        {/* 서브 메뉴들 */}
        <div
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-300 origin-bottom",
            isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10 pointer-events-none"
          )}
        >
          {/* 맨 위로 */}
          <button onClick={scrollToTop} className="flex items-center gap-2 group">
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">맨 위로</span>
            <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all">
              <ArrowUp size={20} />
            </div>
          </button>

          {/* 개발자 문의 */}
          <button
            onClick={() => { setShowDeveloperModal(true); setIsOpen(false); }}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">개발자 문의</span>
            <div className="w-14 h-14 flex items-center justify-center active:scale-95 transition-all drop-shadow-md">
              <Image
                src="/images/logo/judy-face2.png"
                alt="개발자 문의"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </button>

          {/* AI 너굴봇 */}
          <button
            onClick={() => { setShowKiriBotModal(true); setIsOpen(false); }}
            className="flex items-center gap-2 group"
          >
            <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">AI 너굴봇</span>
            <div className="w-14 h-14 flex items-center justify-center active:scale-95 transition-all drop-shadow-md">
              <Image
                src="/images/logo/raccoon-mascot-face.png"
                alt="AI 너굴봇"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </button>
        </div>

        {/* 메인 FAB 토글 — 너굴 로고 이미지 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group"
        >
          <span className="bg-white px-2.5 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isOpen ? "메뉴 닫기" : "너굴 메뉴 열기"}
          </span>
          <div className={cn(
            "w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all duration-300 overflow-hidden shrink-0",
            isOpen ? "rotate-12 shadow-xl" : "hover:shadow-xl"
          )}>
            <Image
              src="/images/logo/raccoon-mascot-logo.png"
              alt="메뉴"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
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
