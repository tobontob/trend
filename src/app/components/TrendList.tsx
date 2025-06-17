import React from 'react';

interface TrendItem {
  keyword: string;
  rank: number;
  searchCount?: number;
}

interface TrendListProps {
  title: string;
  items: TrendItem[];
  type: 'naver' | 'google';
}

export default function TrendList({ title, items, type }: TrendListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.keyword}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            <span className="font-medium">{item.keyword}</span>
            <span className="text-gray-500">#{item.rank}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 