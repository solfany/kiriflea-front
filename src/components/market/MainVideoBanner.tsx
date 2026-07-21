'use client';
import { useRef } from 'react';

export default function MainVideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
  };

  const handleClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // 재생 끝나면 맨 앞으로 돌려놓기
      videoRef.current.pause();
    }
  };

  return (
    <div 
      className="w-full relative aspect-video mb-6 overflow-hidden shadow-sm rounded-2xl cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-2xl"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
      >
        <source src="/mp4/main.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
