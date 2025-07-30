
import React from 'react';

interface PriceHistoryChartProps {
  history: number[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <div className="text-center text-sm text-gray-400 py-4">
        시세 데이터가 부족합니다. (최소 2개월 필요)
      </div>
    );
  }

  const width = 280;
  const height = 100;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...history);
  const minVal = Math.min(...history);
  const valueRange = maxVal - minVal;

  const points = history.map((value, index) => {
    const x = (index / (history.length - 1)) * chartWidth + padding;
    const y = chartHeight - (valueRange > 0 ? ((value - minVal) / valueRange) * chartHeight : chartHeight / 2) + padding;
    return `${x},${y}`;
  }).join(' ');
  
  const formatCurrencySimple = (val: number) => {
      if (val >= 1_000_000_000) return `${(val/1_000_000_000).toFixed(1)}B`;
      if (val >= 1_000_000) return `${(val/1_000_000).toFixed(1)}M`;
      return `${(val/1000).toFixed(0)}K`;
  };

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis labels and grid lines */}
        <text x={padding - 5} y={padding} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="#9ca3af">{formatCurrencySimple(maxVal)}</text>
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" />
        
        <text x={padding - 5} y={height / 2} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="#9ca3af">{formatCurrencySimple(minVal + valueRange / 2)}</text>
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" />

        <text x={padding - 5} y={height - padding} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="#9ca3af">{formatCurrencySimple(minVal)}</text>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Gradient for area */}
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
        </defs>
        
        {/* Area Path */}
        <polyline
          fill="url(#areaGradient)"
          points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
        />

        {/* Line Path */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Points on line */}
        {history.map((value, index) => {
            const x = (index / (history.length - 1)) * chartWidth + padding;
            const y = chartHeight - (valueRange > 0 ? ((value - minVal) / valueRange) * chartHeight : chartHeight / 2) + padding;
            return <circle key={index} cx={x} cy={y} r="2" fill="#3b82f6" />;
        })}

      </svg>
      <div className="text-center text-xs text-gray-500 mt-1">
        과거 {history.length}개월 시세 변동
      </div>
    </div>
  );
};

export default PriceHistoryChart;
