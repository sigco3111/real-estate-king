
import React from 'react';

interface EventLogProps {
  logs: string[];
}

const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-4 h-full max-h-[75vh] flex flex-col">
      <h3 className="text-xl font-bold mb-2 text-gray-700">📢 이벤트 로그</h3>
      <div className="flex-grow overflow-y-auto pr-2">
        <ul>
          {logs.map((log, index) => (
            <li
              key={index}
              className={`p-2 mb-1 rounded-md text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-900 font-bold' : 'bg-gray-100'}`}
            >
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventLog;
