
import React, { useState } from 'react';
import { Property, Tenant, ActiveGameEvent } from '../types';
import PriceHistoryChart from './PriceHistoryChart';
import { LineChart, ChevronDown, ChevronUp } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  playerMoney?: number;
  activeEvent?: ActiveGameEvent | null;
  onBuy?: (property: Property) => void;
  onSell?: (property: Property) => void;
  onRent?: (property: Property) => void;
  onUpgrade?: (property: Property) => void;
}

const Stat: React.FC<{ label: string; value: string | React.ReactNode; color?: string; change?: 'up' | 'down' | 'none' }> = ({ label, value, color = 'text-gray-700', change = 'none' }) => {
    const changeIndicator = change === 'up' ? '▲' : change === 'down' ? '▼' : '';
    return (
        <div className="text-sm">
            <span className="font-semibold text-gray-500">{label}: </span>
            <span className={`font-bold ${color}`}>{value} {changeIndicator}</span>
        </div>
    );
};

const TenantInfo: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
    const satisfactionColor = tenant.satisfaction > 70 ? 'bg-green-500' : tenant.satisfaction > 40 ? 'bg-yellow-500' : 'bg-red-500';
    const formattedDate = `${tenant.contractEndDate.getFullYear()}-${String(tenant.contractEndDate.getMonth() + 1).padStart(2, '0')}-${String(tenant.contractEndDate.getDate()).padStart(2, '0')}`;

    return (
        <div className="mt-2 text-xs border-t pt-2 space-y-1">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">임차인: {tenant.name}</span>
                <span className="font-semibold text-gray-600">만족도: {tenant.satisfaction}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${satisfactionColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${tenant.satisfaction}%` }}></div>
            </div>
            <div className="text-right text-gray-500 text-xs">
                계약 만료: {formattedDate}
            </div>
        </div>
    );
};


const PropertyCard: React.FC<PropertyCardProps> = ({ property, playerMoney = 0, activeEvent = null, onBuy, onSell, onRent, onUpgrade }) => {
  const { marketValueModifier = 1, rentModifier = 1, maintenanceCostModifier = 1 } = activeEvent?.event.effects || {};
  const [showChart, setShowChart] = useState(false);
  
  const effectiveMarketValue = Math.round(property.marketValue * marketValueModifier);
  const effectiveRent = Math.round(property.rent * rentModifier);
  const effectiveMaintenanceCost = Math.round(property.maintenanceCost * maintenanceCostModifier);

  const isLandmark = property.category === '랜드마크';

  const getStatusChip = () => {
    switch (property.status) {
      case '임대중':
        return <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{property.status}</div>;
      case '보유':
        return <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{property.status}</div>;
      default:
        return null;
    }
  };

  const isBuyDisabled = onBuy && playerMoney < property.purchasePrice;
  const isUpgradeDisabled = onUpgrade && playerMoney < property.upgradeCost;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col relative ${isLandmark ? 'landmark-card' : ''}`}>
      <div className="relative">
        <img src={property.image} alt={property.name} className="w-full h-40 object-cover" />
        {getStatusChip()}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800 flex-1">{property.name}</h3>
            {isLandmark && <span className="ml-2 text-xs font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 rounded-full shadow-md whitespace-nowrap">✨ 랜드마크</span>}
        </div>
        <p className="text-xs text-gray-500 mb-2">{property.type} / Lvl.{property.level}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 my-2">
          <Stat label="현재 시세" value={`₩ ${effectiveMarketValue.toLocaleString('ko-KR')}`} color={marketValueModifier > 1 ? 'text-green-600' : marketValueModifier < 1 ? 'text-red-600' : 'text-gray-700'} change={marketValueModifier > 1 ? 'up' : marketValueModifier < 1 ? 'down' : 'none'} />
          {onBuy && <Stat label="구매 가격" value={`₩ ${property.purchasePrice.toLocaleString('ko-KR')}`} color="text-red-600" />}
          <Stat label="월 임대료" value={`+ ₩ ${effectiveRent.toLocaleString('ko-KR')}`} color={rentModifier > 1 ? 'text-blue-600' : rentModifier < 1 ? 'text-orange-600' : 'text-blue-600'} change={rentModifier > 1 ? 'up' : rentModifier < 1 ? 'down' : 'none'}/>
          <Stat label="월 유지비" value={`- ₩ ${effectiveMaintenanceCost.toLocaleString('ko-KR')}`} color={maintenanceCostModifier > 1 ? 'text-red-600' : 'text-orange-600'} change={maintenanceCostModifier > 1 ? 'up' : 'none'} />
        </div>
        
        {isLandmark && property.buff && (
          <div className="my-2 p-2 bg-amber-100 border-l-4 border-amber-500 rounded">
            <p className="text-sm font-bold text-amber-800">{property.buff.description}</p>
          </div>
        )}

        {property.status === '임대중' && property.tenant && <TenantInfo tenant={property.tenant} />}
        
        <div className="mt-2">
            <button 
                onClick={() => setShowChart(!showChart)}
                className="w-full text-sm flex items-center justify-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-semibold"
            >
                <LineChart size={16} className="mr-2"/>
                1년 시세 그래프
                {showChart ? <ChevronUp size={16} className="ml-auto"/> : <ChevronDown size={16} className="ml-auto"/>}
            </button>
            {showChart && <PriceHistoryChart history={property.marketValueHistory} />}
        </div>
        
        <div className="mt-auto space-y-2 pt-2 flex-grow flex flex-col justify-end">
            {onBuy && (
                 <button
                    onClick={() => onBuy(property)}
                    disabled={isBuyDisabled}
                    className={`w-full py-2 px-4 text-white font-bold rounded-lg shadow-md transition-all duration-200 ${isBuyDisabled ? 'bg-gray-400 cursor-not-allowed' : `bg-blue-500 hover:bg-blue-600 transform hover:scale-105`}`}
                >
                    구매하기
                </button>
            )}

            {onSell && onUpgrade && (
                <>
                    <div className="flex w-full gap-2">
                        {property.status === '보유' && onRent && (
                            <button 
                                onClick={() => onRent(property)} 
                                className="flex-1 py-2 px-2 text-white font-bold rounded-lg shadow-md bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all duration-200 text-sm">
                                임대하기
                            </button>
                        )}
                        <button 
                            onClick={() => onUpgrade(property)} 
                            disabled={isUpgradeDisabled || isLandmark}
                            className="flex-1 py-2 px-2 text-white font-bold rounded-lg shadow-md bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transform enabled:hover:scale-105 transition-all duration-200 text-sm"
                        >
                           {isLandmark ? "업그레이드 불가" : "업그레이드"}
                           {!isLandmark && <br />}
                           {!isLandmark && <span className="text-xs font-normal">₩{property.upgradeCost.toLocaleString('ko-KR')}</span>}
                        </button>
                    </div>
                    <button 
                        onClick={() => onSell(property)} 
                        className="w-full py-2 px-4 text-white font-bold rounded-lg shadow-md bg-red-500 hover:bg-red-600 transform hover:scale-105 transition-all duration-200 mt-2">
                        판매하기
                    </button>
                </>
            )}
        </div>
      </div>
       {isLandmark && (
        <style>{`
            .landmark-card {
                position: relative;
                z-index: 1;
            }
            .landmark-card::before {
                content: '';
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                z-index: -1;
                margin: -3px;
                border-radius: 11px; /* card's rounded-lg is 8px, this needs to be slightly larger */
                background: linear-gradient(45deg, #FDE047, #F59E0B, #D97706);
                animation: landmark-glow 3s ease-in-out infinite;
            }
            @keyframes landmark-glow {
                0% { box-shadow: 0 0 5px #FDE047; }
                50% { box-shadow: 0 0 15px #F59E0B; }
                100% { box-shadow: 0 0 5px #FDE047; }
            }
        `}</style>
      )}
    </div>
  );
};

export default PropertyCard;