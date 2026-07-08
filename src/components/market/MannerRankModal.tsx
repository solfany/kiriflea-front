'use client';

import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function MannerRankModal({ onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">매너 계급표</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              매너 점수에 따라 다음과 같이 계급이 부여됩니다.
            </p>
            
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                <div className="p-3 text-center border-r border-gray-100">점수 범위</div>
                <div className="p-3 text-center">계급</div>
              </div>
              <div className="text-sm">
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">100점 이상</div>
                  <div className="p-3 text-center font-bold text-orange-500">🌟 전설적인 끼리</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">80점 ~ 99.9점</div>
                  <div className="p-3 text-center font-bold text-orange-500">👑 존경받는 끼리</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">60점 ~ 79.9점</div>
                  <div className="p-3 text-center font-bold text-orange-500">🎩 신사적인 끼리</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">40점 ~ 59.9점</div>
                  <div className="p-3 text-center font-bold text-orange-500">☕ 성숙한 끼리</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50 bg-orange-50/30">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600 flex flex-col items-center justify-center gap-1">
                    <span>36.5점 ~ 39.9점</span>
                    <span className="text-[10px] text-orange-500 font-medium bg-orange-100 px-1.5 py-0.5 rounded-sm">시작 점수 (36.5점)</span>
                  </div>
                  <div className="p-3 text-center font-bold text-orange-500 flex items-center justify-center gap-1">🌱 평범한 끼리</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">30점 ~ 36.4점</div>
                  <div className="p-3 text-center font-bold text-orange-500">😒 껄렁한 끼리</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">0점 ~ 29.9점</div>
                  <div className="p-3 text-center font-bold text-orange-500">👿 양아치 끼리</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full mt-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
