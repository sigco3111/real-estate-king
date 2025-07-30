
import React, { useState, useMemo } from 'react';
import { GameState } from '../types';
import { BASE_INTEREST_RATE, MAX_CREDIT_SCORE, LOAN_TERM_MONTHS } from '../constants';

interface BankViewProps {
  gameState: GameState;
  netWorth: number;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
}

const InfoCard: React.FC<{ label: string; value: string | number; icon: string;}> = ({ label, value, icon }) => (
    <div className="bg-gray-100 rounded-lg p-4 flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-lg font-bold text-gray-800">{value}</div>
        </div>
    </div>
);

const BankView: React.FC<BankViewProps> = ({ gameState, netWorth, onTakeLoan, onRepayLoan }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const { money, creditScore, loan } = gameState;

  const loanLimit = useMemo(() => {
    if (loan) return 0; // 이미 대출이 있으면 추가 대출 불가
    return Math.max(0, Math.floor((netWorth * 0.5) * (creditScore / MAX_CREDIT_SCORE)));
  }, [netWorth, creditScore, loan]);

  const estimatedInterestRate = useMemo(() => {
    const rate = BASE_INTEREST_RATE + (1 - creditScore / MAX_CREDIT_SCORE) * 0.1;
    return (rate * 100).toFixed(2) + '%';
  }, [creditScore]);
  
  const handleTakeLoanClick = () => {
      const amount = parseInt(loanAmount, 10);
      if (isNaN(amount) || amount <= 0) return;
      if (amount > loanLimit) {
          alert('대출 한도를 초과했습니다.');
          return;
      }
      onTakeLoan(amount);
      setLoanAmount('');
  };
  
  const handleRepayLoanClick = () => {
      const amount = parseInt(repayAmount, 10);
      if (isNaN(amount) || amount <= 0) return;
       if (amount > money) {
          alert('보유 현금이 부족합니다.');
          return;
      }
      if (loan && amount > loan.principal) {
          alert('상환 금액이 남은 원금을 초과합니다. 전액 상환을 이용해주세요.');
          return;
      }
      onRepayLoan(amount);
      setRepayAmount('');
  };
  
  const handleRepayFullLoanClick = () => {
      if(!loan) return;
      if (loan.principal > money) {
          alert('보유 현금이 부족하여 전액 상환할 수 없습니다.');
          return;
      }
      onRepayLoan(loan.principal);
      setRepayAmount('');
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-700">🏦 은행</h2>

      <div className="bg-white/80 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">나의 금융 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon="⭐" label="신용점수" value={creditScore} />
          <InfoCard icon="🎯" label="대출 한도" value={`₩ ${loanLimit.toLocaleString('ko-KR')}`} />
          <InfoCard icon="%" label="예상 연 금리" value={estimatedInterestRate} />
        </div>
      </div>

      {loan ? (
        <div className="bg-white/80 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">대출 현황 및 상환</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <InfoCard icon="💰" label="남은 원금" value={`₩ ${loan.principal.toLocaleString('ko-KR')}`} />
              <InfoCard icon="📈" label="적용 금리" value={`${(loan.interestRate * 100).toFixed(2)}%`} />
              <InfoCard icon="💸" label="월 상환금" value={`₩ ${loan.monthlyPayment.toLocaleString('ko-KR')}`} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="상환 금액 입력"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <button onClick={handleRepayLoanClick} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap hover:bg-blue-600 transition">상환하기</button>
            </div>
             <button onClick={handleRepayFullLoanClick} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition">원금 전액 상환 (₩ {loan.principal.toLocaleString('ko-KR')})</button>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">대출 받기</h3>
          <p className="text-gray-600 mb-4">{LOAN_TERM_MONTHS}개월 원리금균등상환 방식입니다. 신용점수에 따라 금리가 결정됩니다.</p>
          <div className="space-y-4">
              <input
                type="number"
                placeholder="대출 희망 금액"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full p-3 border rounded-lg"
                max={loanLimit}
              />
              <div className="flex gap-2">
                {[0.25, 0.5, 1].map(ratio => (
                    <button key={ratio} onClick={() => setLoanAmount(String(Math.floor(loanLimit * ratio)))} className="flex-1 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition">
                       한도의 {ratio * 100}%
                    </button>
                ))}
              </div>
              <button onClick={handleTakeLoanClick} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition" disabled={!loanAmount || parseInt(loanAmount, 10) <= 0 || !!loan}>대출 실행</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankView;