import React, { useState, useEffect, useRef } from 'react';
import { GameState, ActiveGameEvent } from '../types';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface HeaderProps {
  gameState: GameState;
  netWorth: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onResetGame: () => void;
}

const StatCard: React.FC<{ title: string; value: string; color: string; icon: string, className?: string }> = ({ title, value, color, icon, className }) => {
    const [animate, setAnimate] = useState(false);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (prevValueRef.current !== value) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            prevValueRef.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);

    return (
        <div className={`flex-1 p-3 rounded-xl shadow-md flex items-center space-x-3 ${color} ${className} ${animate ? 'animate-value-pop' : ''}`}>
            <div className="text-3xl">{icon}</div>
            <div>
                <h2 className="text-sm text-gray-700 font-semibold">{title}</h2>
                <p className="text-lg lg:text-xl font-bold text-gray-900">{value}</p>
            </div>
            <style>{`
                @keyframes value-change-pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .animate-value-pop {
                    animation: value-change-pop 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

const EventTicker: React.FC<{ activeEvent: ActiveGameEvent | null }> = ({ activeEvent }) => {
  if (!activeEvent) return null;

  return (
    <div className="bg-red-500 text-white text-center p-2 rounded-lg shadow-inner animate-pulse mt-2">
      <span className="font-bold text-lg">{activeEvent.event.emoji} {activeEvent.event.title}</span>
      <span className="ml-4 text-sm">({activeEvent.remainingMonths}개월 남음)</span>
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ gameState, netWorth, isPaused, onPauseToggle, onResetGame }) => {
  const { money, date, activeEvent, creditScore, managementPoints } = gameState;
  const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  
  return (
    <header className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 w-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-blue-600">두근두근! 부동산 왕👑</h1>
            <button
            onClick={onResetGame}
            className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-800 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="게임 초기화"
            title="게임 초기화 (모든 데이터 삭제)"
            >
            <RotateCcw size={18} />
            </button>
        </div>
        <button
            onClick={onPauseToggle}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg transition-transform transform hover:scale-110"
            aria-label={isPaused ? '게임 시작' : '일시정지'}
        >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <StatCard title="날짜" value={formattedDate} color="bg-sky-200" icon="📅" className="col-span-2 lg:col-span-1" />
        <StatCard title="보유 현금" value={`₩ ${money.toLocaleString('ko-KR')}`} color="bg-green-200" icon="💰" />
        <StatCard title="총 자산" value={`₩ ${netWorth.toLocaleString('ko-KR')}`} color="bg-amber-200" icon="🏦" />
        <StatCard title="신용점수" value={`${creditScore}`} color="bg-purple-200" icon="⭐" />
        <StatCard title="경영 포인트" value={`${managementPoints} MP`} color="bg-pink-200" icon="🧠" />
      </div>
      <EventTicker activeEvent={activeEvent} />
    </header>
  );
};

export default Header;