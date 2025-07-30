
import React from 'react';
import { Skill } from '../types';

interface SkillCardProps {
    skill: Skill;
    currentLevel: number;
    managementPoints: number;
    onUpgrade: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, currentLevel, managementPoints, onUpgrade }) => {
    const isMaxLevel = currentLevel >= skill.maxLevel;
    const upgradeCost = isMaxLevel ? 0 : (currentLevel + 1) * skill.baseCost;
    const canUpgrade = !isMaxLevel && managementPoints >= upgradeCost;

    const getEffectText = () => {
        const effectValue = currentLevel * skill.effectPerLevel;
        if (effectValue === 0) return "효과 없음";
        
        if (skill.effectUnit === 'percent') {
            return `${(effectValue * 100).toFixed(0)}%`;
        }
        if (skill.effectUnit === 'point') {
            return `${(effectValue * 100).toFixed(2)}%p`;
        }
        return `${effectValue}`;
    };

    const getNextEffectText = () => {
        if (isMaxLevel) return "최고 레벨";
        const nextEffectValue = (currentLevel + 1) * skill.effectPerLevel;
        if (skill.effectUnit === 'percent') {
            return `→ ${(nextEffectValue * 100).toFixed(0)}%`;
        }
        if (skill.effectUnit === 'point') {
            return `→ ${(nextEffectValue * 100).toFixed(2)}%p`;
        }
        return `→ ${nextEffectValue}`;
    }

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col p-4">
            <div className="flex items-start mb-2">
                <span className="text-4xl mr-3">{skill.icon}</span>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{skill.name}</h3>
                    <p className="text-xs text-gray-500">Lv. {currentLevel} / {skill.maxLevel}</p>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 flex-grow">{skill.description}</p>

            <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-600">현재 효과:</span>
                    <span className="font-bold text-blue-600">{getEffectText()}</span>
                </div>
                 {!isMaxLevel && (
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-gray-500">다음 레벨:</span>
                        <span className="font-semibold text-green-600">{getNextEffectText()}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onUpgrade}
                disabled={!canUpgrade || isMaxLevel}
                className={`w-full py-2 px-4 text-white font-bold rounded-lg shadow-md transition-all duration-200 text-sm
                    ${isMaxLevel ? 'bg-gray-400 cursor-not-allowed' : canUpgrade ? 'bg-yellow-500 hover:bg-yellow-600 transform hover:scale-105' : 'bg-gray-400 cursor-not-allowed'}`}
            >
                {isMaxLevel ? '최고 레벨 달성' : `업그레이드: ${upgradeCost} MP`}
            </button>
        </div>
    );
};

export default SkillCard;