'use client';
import { useState } from 'react';

export function DeveloperEmail() {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchend') {
      e.preventDefault(); // 모바일에서 onClick 중복 실행 방지
    }
    
    navigator.clipboard.writeText('solfany@krtranslink.com');

    let clientX, clientY;
    if ('changedTouches' in e) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX / window.innerWidth;
    const y = clientY / window.innerHeight;

    import('canvas-confetti').then((module) => {
      const confetti = module.default || module;
      confetti({
        origin: { x, y },
        particleCount: 60,
        spread: 80,
        startVelocity: 30,
        colors: ['#ff87ab', '#ffb5a7', '#fcd5ce', '#f8edeb', '#f4978e', '#ff0a54', '#ff477e'],
        zIndex: 999999
      });
    }).catch(err => console.error('Confetti failed to load:', err));

    setShowCopiedTooltip(true);
    setTimeout(() => {
      setShowCopiedTooltip(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 w-full mb-6 text-sm text-gray-500 text-center font-sans tracking-normal">
      <span className="font-semibold text-gray-700">개발자 이메일: </span>
      <div className="relative inline-block">
        <span
          onClick={handleCopyEmail}
          onTouchEnd={handleCopyEmail}
          className="font-bold bg-gradient-to-r from-sky-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-all select-none touch-manipulation active:scale-95 inline-block"
        >
          solfany@krtranslink.com
        </span>
        {showCopiedTooltip && (
          <span className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 z-10 bg-gray-800 text-white font-medium text-[12px] px-3 py-1.5 rounded-md shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-1 whitespace-nowrap tracking-wide after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-b-gray-800">
            복사되었어요! ✨
          </span>
        )}
      </div>
    </div>
  );
}
