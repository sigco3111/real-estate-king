
import React from 'react';

interface GameEndModalProps {
  status: 'win' | 'lose';
  onRestart: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({ status, onRestart }) => {
  const winContent = {
    emoji: '🎉🏆🎉',
    title: '게임 승리!',
    message: '축하합니다! 당신은 최고의 부동산 거물이 되었습니다!',
    button: '새 게임 시작',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    titleColor: 'text-green-700',
  };

  const loseContent = {
    emoji: '💸😢💸',
    title: '게임 오버',
    message: '안타깝게도 파산했습니다. 다시 도전해보세요!',
    button: '다시 시작하기',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    titleColor: 'text-red-700',
  };

  const content = status === 'win' ? winContent : loseContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className={`jua-font ${content.bgColor} rounded-2xl border-4 ${content.borderColor} shadow-2xl p-8 text-center max-w-sm mx-auto animate-bounce-in`}>
        <div className="text-6xl mb-4">{content.emoji}</div>
        <h2 className={`text-4xl font-bold ${content.titleColor} mb-2`}>{content.title}</h2>
        <p className="text-gray-600 mb-8">{content.message}</p>
        <button
          onClick={onRestart}
          className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300"
        >
          {content.button}
        </button>
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

export default GameEndModal;
