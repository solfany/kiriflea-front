import React from 'react';
import Image from 'next/image';

interface NookLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'logo' | 'face' | 'hi' | 'stand';
}

export function NookLogo({
  className = '',
  showText = true,
  size = 'md',
  variant = 'face',
}: NookLogoProps) {
  const imageSrcs = {
    logo: '/images/logo/raccoon-mascot-logo.png',
    face: '/images/logo/raccoon-mascot-face.png',
    hi: '/images/logo/raccoon-mascot-hi.png',
    stand: '/images/logo/raccoon-mascot-stand.png',
  };

  const imgDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  };

  const textSizes = {
    sm: 'text-[16px]',
    md: 'text-[22px]',
    lg: 'text-[28px]',
  };

  const subTextSizes = {
    sm: 'text-[14px]',
    md: 'text-[18px]',
    lg: 'text-[24px]',
  };

  const { width, height } = imgDimensions[size];

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      {/* Raccoon Logo Image */}
      <span className="relative shrink-0 inline-flex items-center justify-center">
        <Image
          src={imageSrcs[variant]}
          alt="너굴상점 로고"
          width={width}
          height={height}
          className="object-contain hover:scale-105 transition-transform"
          priority
        />
      </span>

      {showText && (
        <span className="inline-flex items-baseline tracking-[1px] font-nook mt-1 font-bold">
          <span className={`${subTextSizes[size]} text-gray-800`}>모여봐요</span>
          <span className={`${textSizes[size]} text-emerald-600 ml-[3px]`}>너굴</span>
          <span className={`${subTextSizes[size]} text-gray-800 ml-[1px]`}>상점</span>
        </span>
      )}
    </span>
  );
}
