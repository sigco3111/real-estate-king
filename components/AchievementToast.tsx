import React, { useEffect } from 'react';
import { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl shadow-2xl p-4 w-80 flex items-center space-x-4">
            <div className="text-5xl">{achievement.icon}</div>
            <div className="flex-1">
                <h3 className="font-bold text-lg">업적 달성!</h3>
                <p className="text-sm">{achievement.name}</p>
            </div>
        </div>
        <style>{`
            @keyframes slide-in-right {
                0% {
                    transform: translateX(110%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .animate-slide-in-right {
                animation: slide-in-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            }
        `}</style>
    </div>
  );
};

export default AchievementToast;
