import React from 'react';
import { Achievement } from '../types';
import AchievementCard from './AchievementCard';

interface TrophyRoomViewProps {
    achievements: Achievement[];
    unlockedAchievementIds: string[];
}

const TrophyRoomView: React.FC<TrophyRoomViewProps> = ({ achievements, unlockedAchievementIds }) => {
    const unlockedSet = new Set(unlockedAchievementIds);
    
    const unlockedAchievements = achievements.filter(a => unlockedSet.has(a.id));
    const lockedAchievements = achievements.filter(a => !unlockedSet.has(a.id));

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-700">🏆 트로피 룸</h2>
            <p className="text-gray-500 mb-6">게임 플레이를 통해 달성한 업적들을 확인해보세요.</p>
            
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-amber-600">달성한 업적 ({unlockedAchievements.length})</h3>
                {unlockedAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unlockedAchievements.map(ach => (
                            <AchievementCard key={ach.id} achievement={ach} isUnlocked={true} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-6 bg-gray-50 rounded-lg">아직 달성한 업적이 없습니다.</div>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-500">미달성 업적 ({lockedAchievements.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAchievements.map(ach => (
                        <AchievementCard key={ach.id} achievement={ach} isUnlocked={false} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrophyRoomView;
