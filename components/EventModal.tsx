
import React from 'react';
import { GameEvent } from '../types';

interface EventModalProps {
  event: GameEvent | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const effectDescriptions = [
      event.effects.marketValueModifier && `부동산 가치: ${( (event.effects.marketValueModifier - 1) * 100).toFixed(0)}%`,
      event.effects.rentModifier && `임대료: ${((event.effects.rentModifier - 1) * 100).toFixed(0)}%`,
      event.effects.maintenanceCostModifier && `유지비: ${((event.effects.maintenanceCostModifier - 1) * 100).toFixed(0)}%`,
  ].filter(Boolean);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="jua-font bg-white rounded-2xl border-4 border-yellow-400 shadow-2xl p-8 text-center max-w-md mx-auto animate-bounce-in">
        <div className="text-6xl mb-4">{event.emoji}</div>
        <h2 className="text-4xl font-bold text-yellow-700 mb-2">{event.title}</h2>
        <p className="text-gray-600 mb-6">{event.description}</p>
        
        <div className="bg-yellow-100 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-lg text-yellow-800 mb-2">이벤트 효과 ({event.duration}개월 지속):</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
                {effectDescriptions.map((desc, i) => <li key={i}>{desc}</li>)}
            </ul>
        </div>

        <button
          onClick={onClose}
          className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-all duration-300"
        >
          확인
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

export default EventModal;