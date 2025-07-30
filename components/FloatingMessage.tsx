
import React from 'react';

interface FloatingMessageProps {
  text: string;
  type: 'income' | 'expense' | 'info';
}

const FloatingMessage: React.FC<FloatingMessageProps> = ({ text, type }) => {
  const baseStyle = "font-bold text-lg px-4 py-2 rounded-full shadow-lg text-white animate-fade-out-up";
  
  const typeStyles = {
    income: "bg-blue-500",
    expense: "bg-red-500",
    info: "bg-yellow-500",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      {text}
      <style>{`
        @keyframes fade-out-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        .animate-fade-out-up {
          animation: fade-out-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FloatingMessage;
