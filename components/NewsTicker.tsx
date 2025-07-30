import React from 'react';
import { NewsItem } from '../types';
import { Newspaper } from 'lucide-react';

interface NewsTickerProps {
  newsFeed: NewsItem[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsFeed }) => {
  if (newsFeed.length === 0) {
    return null;
  }
  
  const duplicatedNews = [...newsFeed, ...newsFeed];

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm text-white flex items-center overflow-hidden h-10 shadow-lg mt-4 rounded-lg">
      <div className="bg-red-500 h-full flex items-center px-4 font-bold text-lg whitespace-nowrap">
        <Newspaper size={20} className="mr-2"/>
        <span>시민일보 부동산 뉴스</span>
      </div>
      <div className="relative flex-1 h-full flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {duplicatedNews.map((news, index) => (
            <span key={`${news.id}-${index}`} className="mx-8 text-sm">
              <span className="font-semibold text-yellow-300">[{news.date.getFullYear()}.{news.date.getMonth() + 1}]</span> {news.headline}
            </span>
          ))}
        </div>
      </div>
       <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee ${newsFeed.length * 8}s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;