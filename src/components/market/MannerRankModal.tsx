'use client';

import { X } from 'lucide-react';
import { MannerThermometer } from './MannerThermometer';

interface Props {
  onClose: () => void;
}

export function MannerRankModal({ onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={onClose}>
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
                  <div className="p-3 text-center font-extrabold text-emerald-900">명예 주민</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">80점 ~ 99.9점</div>
                  <div className="p-3 text-center font-bold text-emerald-800">인기 주민</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">60점 ~ 79.9점</div>
                  <div className="p-3 text-center font-bold text-emerald-700">상점 친구</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">40점 ~ 59.9점</div>
                  <div className="p-3 text-center font-bold text-emerald-600">단골 주민</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-50">
                  <div className="p-3 text-center border-r border-gray-50 text-gray-600">20점 ~ 39.9점</div>
                  <div className="p-3 text-center font-bold text-emerald-500">이웃 주민</div>
                </div>
                <div className="grid grid-cols-2 border-emerald-100 bg-emerald-50 relative">
                  {/* 하이라이트 포인트 바 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-md"></div>
                  <div className="p-3 text-center border-r border-emerald-100 text-emerald-800 font-semibold flex items-center justify-center">
                    0점 ~ 19.9점
                  </div>
                  <div className="p-3 text-center font-bold text-emerald-400 flex items-center justify-center">
                    새싹 주민
                  </div>
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
