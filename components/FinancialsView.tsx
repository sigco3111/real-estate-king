
import React, { useState, useMemo } from 'react';
import { FinancialRecord, FinancialSummary } from '../types';
import { TrendingUp, TrendingDown, Landmark, PiggyBank, HandCoins, Wrench, Building2, Banknote } from 'lucide-react';

// --- PROPS ---
interface FinancialsViewProps {
    financialHistory: FinancialRecord[];
    financialsThisMonth: FinancialSummary;
    currentDate: Date;
}

interface BreakdownCardProps {
    title: string;
    icon: React.ReactNode;
    items: { label: string; value: number, icon: React.ReactNode }[];
    color: string;
}

interface SimpleBarChartProps {
    data: FinancialRecord[];
    onBarClick: (date: string) => void;
    selectedDate: string | null;
}

interface SummaryCardProps {
    label: string;
    value: number;
    colorClass: string;
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => `₩ ${value.toLocaleString('ko-KR')}`;

// --- SUB-COMPONENTS ---
const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, colorClass }) => (
    <div className="bg-white/80 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">{label}</div>
        <div className={`text-2xl font-bold ${colorClass}`}>{formatCurrency(value)}</div>
    </div>
);

const BreakdownCard: React.FC<BreakdownCardProps> = ({ title, icon, items, color }) => {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const validItems = items.filter(item => item.value > 0);

    return (
        <div className="bg-white/80 p-4 rounded-lg shadow-md flex-1">
            <div className={`flex items-center text-xl font-bold mb-3 ${color}`}>
                {icon}
                <h3 className="ml-2">{title}</h3>
            </div>
            {validItems.length > 0 ? (
                <ul className="space-y-2">
                    {validItems.map(({ label, value, icon }) => (
                        <li key={label} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="flex items-center text-gray-600">{icon}<span className="ml-2">{label}</span></span>
                                <span className="font-semibold text-gray-800">{formatCurrency(value)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className={`${color.replace('text-', 'bg-')} h-1.5 rounded-full`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400 text-center py-4">해당 내역이 없습니다.</p>
            )}
        </div>
    );
};

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, onBarClick, selectedDate }) => {
    const chartData = data.slice(-12); // Show last 12 months
    const maxVal = useMemo(() => {
        if (chartData.length === 0) return 1;
        return Math.max(...chartData.flatMap(d => [
            d.summary.rentIncome + d.summary.salesIncome,
            d.summary.maintenanceExpense + d.summary.purchaseExpense + d.summary.upgradeExpense + d.summary.loanInterestExpense
        ]));
    }, [chartData]);

    return (
        <div className="bg-white/80 p-4 rounded-lg shadow-md h-64 flex items-end justify-around gap-1">
            {chartData.length === 0 && <div className="text-gray-400 self-center">아직 기록된 데이터가 없습니다.</div>}
            {chartData.map(record => {
                const totalIncome = record.summary.rentIncome + record.summary.salesIncome;
                const totalExpense = record.summary.maintenanceExpense + record.summary.purchaseExpense + record.summary.upgradeExpense + record.summary.loanInterestExpense + record.summary.loanPrincipalPaid;
                const incomeHeight = maxVal > 0 ? (totalIncome / maxVal) * 100 : 0;
                const expenseHeight = maxVal > 0 ? (totalExpense / maxVal) * 100 : 0;
                const [year, month] = record.date.split('-');

                return (
                    <div key={record.date} className="h-full flex flex-col items-center justify-end w-full cursor-pointer group" onClick={() => onBarClick(record.date)}>
                        <div className="h-full flex items-end gap-1 w-full justify-center">
                            <div className="w-1/2 bg-blue-400 group-hover:bg-blue-500 rounded-t transition-all" style={{ height: `${incomeHeight}%` }} title={`수입: ${formatCurrency(totalIncome)}`}></div>
                            <div className="w-1/2 bg-red-400 group-hover:bg-red-500 rounded-t transition-all" style={{ height: `${expenseHeight}%` }} title={`지출: ${formatCurrency(totalExpense)}`}></div>
                        </div>
                         <div className={`text-xs font-bold mt-1 p-1 rounded ${selectedDate === record.date ? 'bg-indigo-500 text-white' : 'text-gray-500'}`}>{parseInt(month, 10)}월</div>
                    </div>
                );
            })}
        </div>
    );
};

// --- MAIN COMPONENT ---
const FinancialsView: React.FC<FinancialsViewProps> = ({ financialHistory, financialsThisMonth, currentDate }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleBarClick = (date: string) => {
        setSelectedDate(date);
    };

    const displayData = useMemo(() => {
        if (selectedDate) {
            return financialHistory.find(r => r.date === selectedDate) || null;
        }
        return null;
    }, [selectedDate, financialHistory]);

    const currentMonthLabel = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 (진행중)`;
    const selectedMonthLabel = displayData ? `${parseInt(displayData.date.split('-')[0], 10)}년 ${parseInt(displayData.date.split('-')[1], 10)}월` : currentMonthLabel;

    const summary = displayData ? displayData.summary : financialsThisMonth;
    const netProfit = displayData ? displayData.netProfit : (summary.rentIncome + summary.salesIncome - summary.maintenanceExpense - summary.loanInterestExpense);
    const cashFlow = displayData ? displayData.cashFlow : (summary.rentIncome + summary.salesIncome) - (summary.maintenanceExpense + summary.purchaseExpense + summary.upgradeExpense + summary.loanInterestExpense + summary.loanPrincipalPaid);

    const incomeItems = [
        { label: '임대 수입', value: summary.rentIncome, icon: <HandCoins size={16} className="text-gray-500"/> },
        { label: '자산 매각', value: summary.salesIncome, icon: <Landmark size={16} className="text-gray-500"/> },
    ];

    const expenseItems = [
        { label: '유지비', value: summary.maintenanceExpense, icon: <Wrench size={16} className="text-gray-500"/> },
        { label: '대출 이자', value: summary.loanInterestExpense, icon: <Banknote size={16} className="text-gray-500"/> },
        { label: '자산 구매', value: summary.purchaseExpense, icon: <Building2 size={16} className="text-gray-500"/> },
        { label: '업그레이드', value: summary.upgradeExpense, icon: <TrendingUp size={16} className="text-gray-500"/> },
    ];
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-700">📊 상세 재무제표</h2>
            <p className="text-gray-500 mb-4">과거 재무 기록을 분석하여 현명한 투자 결정을 내리세요. 차트의 막대를 클릭하여 월별 상세 내역을 볼 수 있습니다.</p>

            <SimpleBarChart data={financialHistory} onBarClick={handleBarClick} selectedDate={selectedDate} />
            
            <div className="mt-6">
                <h3 className="text-xl font-bold mb-3 text-gray-700">{selectedMonthLabel} 상세 내역</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <SummaryCard label="순이익" value={netProfit} colorClass={netProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
                    <SummaryCard label="현금 흐름" value={cashFlow} colorClass={cashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <BreakdownCard title="수입 내역" icon={<TrendingUp size={22} />} items={incomeItems} color="text-blue-500" />
                    <BreakdownCard title="지출 내역" icon={<TrendingDown size={22} />} items={expenseItems} color="text-red-500" />
                </div>
            </div>
        </div>
    );
};

export default FinancialsView;
