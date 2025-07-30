
import React, { useMemo } from 'react';
import { GameState, AIPlayer, ActiveGameEvent, Property } from '../types';

interface RivalsViewProps {
    playerState: GameState;
    playerNetWorth: number;
    aiPlayers: AIPlayer[];
    activeEvent: ActiveGameEvent | null;
}

const calculateNetWorthForAI = (ai: AIPlayer, activeEvent: ActiveGameEvent | null): number => {
    const marketValueModifier = activeEvent?.event.effects.marketValueModifier || 1;
    const propertiesValue = ai.ownedProperties.reduce((sum, p) => sum + Math.round(p.marketValue * marketValueModifier), 0);
    return ai.money + propertiesValue;
}

const RivalRow: React.FC<{rank: number; name: string; netWorth: number; propertyCount: number; isPlayer: boolean; color: string}> = ({rank, name, netWorth, propertyCount, isPlayer, color}) => (
    <div className={`flex items-center p-4 rounded-lg transition-all duration-300 ${isPlayer ? 'bg-blue-100 border-2 border-blue-400 scale-105 shadow-lg' : 'bg-white shadow'}`}>
        <div className="w-12 text-center text-2xl font-bold text-gray-500">{rank}</div>
        <div className="flex-1 flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${color}`}></div>
            <div className="font-bold text-lg text-gray-800">{name} {isPlayer && '(나)'}</div>
        </div>
        <div className="w-48 text-right font-semibold text-gray-700">
            {propertyCount}개
        </div>
        <div className="w-64 text-right font-bold text-xl text-green-600">
            ₩ {netWorth.toLocaleString('ko-KR')}
        </div>
    </div>
);


const RivalsView: React.FC<RivalsViewProps> = ({ playerState, playerNetWorth, aiPlayers, activeEvent }) => {
    
    const allPlayers = useMemo(() => {
        const playerEntry = {
            id: 'player',
            name: '나',
            netWorth: playerNetWorth,
            propertyCount: playerState.ownedProperties.length,
            isPlayer: true,
            color: 'bg-yellow-400'
        };

        const aiEntries = aiPlayers.map(ai => ({
            id: ai.id,
            name: ai.name,
            netWorth: calculateNetWorthForAI(ai, activeEvent),
            propertyCount: ai.ownedProperties.length,
            isPlayer: false,
            color: ai.color,
        }));
        
        return [playerEntry, ...aiEntries].sort((a,b) => b.netWorth - a.netWorth);

    }, [playerState, playerNetWorth, aiPlayers, activeEvent]);
    

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">🏆 라이벌 순위</h2>
            <p className="text-gray-500 mb-6">부동산 세계의 경쟁자들입니다. 최고의 자리를 차지하세요!</p>
            
            <div className="space-y-3">
                <div className="flex items-center p-2 rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                    <div className="w-12 text-center">순위</div>
                    <div className="flex-1 pl-8">이름</div>
                    <div className="w-48 text-right">보유 자산 수</div>
                    <div className="w-64 text-right">총 자산</div>
                </div>

                {allPlayers.map((p, index) => (
                    <RivalRow
                        key={p.id}
                        rank={index + 1}
                        name={p.name}
                        netWorth={p.netWorth}
                        propertyCount={p.propertyCount}
                        isPlayer={p.isPlayer}
                        color={p.color}
                    />
                ))}
            </div>
        </div>
    );
};

export default RivalsView;
