
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
      <div className="jua-font bg-white rounded-2xl border-4 border-red-400 shadow-2xl p-8 text-center max-w-sm mx-auto animate-bounce-in">
        <h2 className="text-3xl font-bold text-red-700 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-400 transform hover:scale-105 transition-all duration-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          70% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
