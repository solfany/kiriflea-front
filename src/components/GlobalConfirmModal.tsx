'use client';
import { useConfirmStore } from '@/store/confirm';

export function GlobalConfirmModal() {
  const { isOpen, options, closeConfirm } = useConfirmStore();

  if (!isOpen || !options) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-gray-900 text-[16px] leading-relaxed mb-6 font-semibold whitespace-pre-line text-center break-keep">
          {options.title}
        </p>
        {options.description && (
          <p className="text-sm text-gray-500 mb-6 text-center">{options.description}</p>
        )}
        <div className="flex gap-2.5">
          <button
            className="flex-1 py-3.5 rounded-xl text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors text-[15px]"
            onClick={() => {
              if (options.onCancel) options.onCancel();
              closeConfirm();
            }}
          >
            {options.cancelText || '취소'}
          </button>
          <button
            className="flex-1 py-3.5 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors text-[15px]"
            onClick={() => {
              options.onConfirm();
              closeConfirm();
            }}
          >
            {options.confirmText || '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}
