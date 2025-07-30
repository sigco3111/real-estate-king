
import React from 'react';
import { Property, ActiveGameEvent, District } from '../types';
import PropertyCard from './PropertyCard';
import DistrictCard from './DistrictCard';
import { ArrowLeft } from 'lucide-react';

interface MarketViewProps {
  districts: District[];
  properties: Property[];
  onBuy: (property: Property) => void;
  playerMoney: number;
  activeEvent: ActiveGameEvent | null;
  currentDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ 
  districts, 
  properties, 
  onBuy, 
  playerMoney, 
  activeEvent, 
  currentDistrictId, 
  onSelectDistrict 
}) => {

  if (!currentDistrictId) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-700">🏢 지역 선택</h2>
        <p className="text-gray-500 mb-6">투자할 지역을 선택하세요. 각 지역은 고유의 시세, 임대료, 성장률 특성을 가집니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {districts.map(district => (
            <DistrictCard 
              key={district.id}
              district={district}
              onSelect={() => onSelectDistrict(district.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  const selectedDistrict = districts.find(d => d.id === currentDistrictId);
  const districtProperties = properties
    .filter(p => p.districtId === currentDistrictId)
    .sort((a, b) => {
        const aIsLandmark = a.category === '랜드마크';
        const bIsLandmark = b.category === '랜드마크';
        if (aIsLandmark && !bIsLandmark) return -1;
        if (!aIsLandmark && bIsLandmark) return 1;
        return a.purchasePrice - b.purchasePrice;
    });

  if (!selectedDistrict) {
    return <div className="text-center text-gray-500 py-10">잘못된 지역입니다.</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          onClick={() => onSelectDistrict(null)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors mr-3"
          aria-label="지역 선택으로 돌아가기"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-700">
          {selectedDistrict.icon} {selectedDistrict.name}
        </h2>
      </div>

      {districtProperties.length === 0 ? (
        <div className="text-center text-gray-500 py-10">이 지역에 나온 매물이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districtProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onBuy={onBuy}
              playerMoney={playerMoney}
              activeEvent={activeEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketView;
