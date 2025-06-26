import React, { useEffect, useRef } from "react";

interface TrendDetailModalProps {
  open: boolean;
  keyword: string | null;
  onClose: () => void;
}

const TrendDetailModal: React.FC<TrendDetailModalProps> = ({ open, keyword, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 포커스 트랩(간단)
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open || !keyword) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 animate-fadein"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fadein-modal focus:outline-none">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">🔍 키워드 상세</h2>
        <div className="mb-4">
          <span className="text-lg font-semibold text-blue-600">{keyword}</span>
        </div>
        <div className="text-gray-500 text-sm mb-2">(여기에 연관어, 최근 뉴스, 그래프 등 상세 정보가 들어갈 수 있습니다)</div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein { animation: fadein 0.2s; }
        @keyframes fadein-modal {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadein-modal { animation: fadein-modal 0.25s; }
      `}</style>
    </div>
  );
};

export default TrendDetailModal; 