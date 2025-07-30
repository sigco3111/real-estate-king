import React from 'react';
import { Achievement } from '../types';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
    const cardClasses = isUnlocked
        ? "bg-gradient-to-br from-amber-100 to-yellow-200 border-yellow-400"
        : "bg-gray-100 border-gray-300 filter grayscale";
    
    const iconContainerClasses = isUnlocked
        ? "bg-white/50"
        : "bg-gray-200";

    const textColor = isUnlocked ? "text-gray-700" : "text-gray-500";
    
    return (
        <div className={`border-2 rounded-xl p-4 flex items-center space-x-4 transition-all duration-300 ${cardClasses}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl flex-shrink-0 ${iconContainerClasses}`}>
                {isUnlocked ? achievement.icon : <Lock className="text-gray-400" />}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold text-lg ${textColor}`}>{isUnlocked || !achievement.isSecret ? achievement.name : '비밀 업적'}</h4>
                <p className={`text-sm ${textColor}`}>
                    {isUnlocked || !achievement.isSecret ? achievement.description : '??????????'}
                </p>
            </div>
        </div>
    );
};

export default AchievementCard;
