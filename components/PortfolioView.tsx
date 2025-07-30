
import React from 'react';
import { Property, ActiveGameEvent } from '../types';
import PropertyCard from './PropertyCard';

interface PortfolioViewProps {
  properties: Property[];
  onSell: (property: Property) => void;
  onRent: (property: Property) => void;
  onUpgrade: (property: Property) => void;
  playerMoney: number;
  activeEvent: ActiveGameEvent | null;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ properties, onSell, onRent, onUpgrade, playerMoney, activeEvent }) => {
  if (properties.length === 0) {
    return <div className="text-center text-gray-500 py-10">아직 보유한 자산이 없습니다. 시장에서 건물을 구매해보세요!</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-700">🏠 나의 자산</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.sort((a,b) => b.marketValue - a.marketValue).map(property =>
            <PropertyCard
              key={property.id}
              property={property}
              onSell={onSell}
              onRent={onRent}
              onUpgrade={onUpgrade}
              playerMoney={playerMoney}
              activeEvent={activeEvent}
            />
        )}
      </div>
    </div>
  );
};

export default PortfolioView;