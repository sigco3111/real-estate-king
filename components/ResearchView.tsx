
import React from 'react';
import { Skill } from '../types';
import SkillCard from './SkillCard';

interface ResearchViewProps {
    managementPoints: number;
    skills: Skill[];
    playerSkills: Record<string, number>; // key: skillId, value: level
    onUpgradeSkill: (skillId: string) => void;
}

const ResearchView: React.FC<ResearchViewProps> = ({ managementPoints, skills, playerSkills, onUpgradeSkill }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-bold text-gray-700">🔬 연구소</h2>
                 <div className="text-lg font-bold bg-pink-200 text-pink-800 px-4 py-2 rounded-lg shadow">
                    🧠 보유 MP: {managementPoints}
                 </div>
            </div>
            <p className="text-gray-500 mb-6">획득한 경영 포인트(MP)를 투자하여 영구적인 능력을 해금하고 경영 효율을 높이세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(skill => (
                    <SkillCard
                        key={skill.id}
                        skill={skill}
                        currentLevel={playerSkills[skill.id] || 0}
                        managementPoints={managementPoints}
                        onUpgrade={() => onUpgradeSkill(skill.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ResearchView;