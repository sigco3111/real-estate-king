
import React from 'react';
import { District } from '../types';

interface DistrictCardProps {
  district: District;
  onSelect: (id: string) => void;
}

const FeatureTag: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className={`text-xs font-bold px-2 py-1 rounded-full text-white ${color}`}>
        {label}: {value}
    </div>
);

const getFeature = (multiplier: number): { text: string; color: string } => {
    if (multiplier >= 1.4) return { text: '매우 높음', color: 'bg-red-500' };
    if (multiplier >= 1.1) return { text: '높음', color: 'bg-orange-500' };
    if (multiplier < 0.9) return { text: '낮음', color: 'bg-blue-500' };
    return { text: '보통', color: 'bg-gray-500' };
}

const getGrowthFeature = (rate: number): { text: string; color: string } => {
    if (rate >= 0.002) return { text: '매우 빠름', color: 'bg-green-600' };
    if (rate >= 0.0015) return { text: '빠름', color: 'bg-green-500' };
    return { text: '보통', color: 'bg-gray-500' };
}

const DistrictCard: React.FC<DistrictCardProps> = ({ district, onSelect }) => {
    const marketValueFeature = getFeature(district.marketValueMultiplier);
    const rentFeature = getFeature(district.rentMultiplier);
    const growthFeature = getGrowthFeature(district.growthRate);

    return (
        <div 
            onClick={() => onSelect(district.id)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer p-6 flex flex-col"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-800">{district.name}</h3>
                <span className="text-4xl">{district.icon}</span>
            </div>
            <p className="text-gray-600 mb-4 flex-grow">{district.description}</p>
            <div className="flex flex-wrap gap-2">
                <FeatureTag label="시세" value={marketValueFeature.text} color={marketValueFeature.color} />
                <FeatureTag label="임대료" value={rentFeature.text} color={rentFeature.color} />
                <FeatureTag label="성장성" value={growthFeature.text} color={growthFeature.color} />
            </div>
        </div>
    );
};

export default DistrictCard;
