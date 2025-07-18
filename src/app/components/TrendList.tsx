import React from 'react';

interface TrendItem {
  keyword: string;
  rank: number;
  searchCount?: number;
  diff?: number;
  ratio?: number;
}

interface TrendListProps {
  title: string;
  items: TrendItem[];
}

export default function TrendList({ title, items }: TrendListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">{title}</h2>
        <div className="text-gray-500 text-center py-8">데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">{title}</h2>
      <div className="space-y-2 sm:space-y-3">
        {items.map((item) => (
          <div
            key={item.keyword}
            className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`font-bold text-base sm:text-lg ${
                item.rank <= 3 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}>
                {item.rank}
              </span>
              <span className="font-medium text-gray-800 text-sm sm:text-base">{item.keyword}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 min-w-[80px] sm:min-w-[120px] justify-end">
              {typeof item.searchCount === 'number' && (
                <span className="text-xs sm:text-sm text-gray-500 w-12 sm:w-16 text-right">
                  {item.searchCount.toLocaleString()}
                </span>
              )}
              {typeof item.diff === 'number' && (
                <span className={`text-xs font-semibold ${item.diff > 0 ? 'text-green-600' : item.diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>▲ {item.diff}</span>
              )}
              {typeof item.ratio === 'number' && (
                <span className="text-xs text-blue-500 font-semibold">{item.ratio > 0 ? '+' : ''}{item.ratio}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 