'use client';
import { useState } from 'react';

export function DeveloperEmail() {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    navigator.clipboard.writeText('solfany@krtranslink.com');

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

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
    <div className="bg-gray-50 rounded-lg p-3 w-full mb-6 text-sm text-gray-500 text-center">
      <span className="font-semibold text-gray-700">개발자 이메일: </span>
      <div className="relative inline-block">
        <span
          onClick={handleCopyEmail}
          className="font-bold bg-gradient-to-r from-sky-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
        >
          solfany@krtranslink.com
        </span>
        {showCopiedTooltip && (
          <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-10 text-pink-500 font-bold text-[12px] px-2.5 py-1 animate-in fade-in slide-in-from-top-2 whitespace-nowrap">
            복사되었어요! 💖
          </span>
        )}
      </div>
    </div>
  );
}
