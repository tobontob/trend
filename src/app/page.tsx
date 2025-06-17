'use client';

import { useState } from 'react';
import TrendList from './components/TrendList';
import WordCloud from './components/WordCloud';

export default function Home() {
  const [selectedEngine, setSelectedEngine] = useState<'naver' | 'google'>('naver');
  const [selectedPeriod, setSelectedPeriod] = useState<'realtime' | 'today' | 'yesterday' | 'week' | 'month' | 'year'>('realtime');

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const mockData = {
    naver: {
      realtime: Array.from({ length: 20 }, (_, i) => ({
        keyword: `네이버 키워드 ${i + 1}`,
        rank: i + 1,
        searchCount: Math.floor(Math.random() * 10000),
      })),
    },
    google: {
      realtime: Array.from({ length: 20 }, (_, i) => ({
        keyword: `구글 키워드 ${i + 1}`,
        rank: i + 1,
        searchCount: Math.floor(Math.random() * 10000),
      })),
    },
  };

  const wordCloudData = mockData[selectedEngine][selectedPeriod].map((item) => ({
    text: item.keyword,
    value: item.searchCount || 1,
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">키워드 트렌드</h1>
        {/* 검색엔진 선택 */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-6 py-2 rounded-full font-semibold shadow transition-colors duration-150 border-2 ${
              selectedEngine === 'naver'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setSelectedEngine('naver')}
          >
            네이버
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold shadow transition-colors duration-150 border-2 ${
              selectedEngine === 'google'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
            }`}
            onClick={() => setSelectedEngine('google')}
          >
            구글
          </button>
        </div>
        {/* 기간 선택 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'realtime', label: '실시간' },
            { key: 'today', label: '오늘' },
            { key: 'yesterday', label: '어제' },
            { key: 'week', label: '이번주' },
            { key: 'month', label: '이번달' },
            { key: 'year', label: '올해' },
          ].map((period) => (
            <button
              key={period.key}
              className={`px-4 py-1 rounded-full font-medium border-2 transition-colors duration-150 ${
                selectedPeriod === period.key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
              }`}
              onClick={() => setSelectedPeriod(period.key as any)}
            >
              {period.label}
            </button>
          ))}
        </div>
        {/* 컨텐츠 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 워드클라우드 */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">키워드 클라우드</h2>
            <div className="w-full flex-1 flex items-center justify-center min-h-[320px]">
              <WordCloud words={wordCloudData} width={400} height={320} />
            </div>
          </div>
          {/* 트렌드 리스트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <TrendList
              title={`${selectedEngine === 'naver' ? '네이버' : '구글'} ${
                selectedPeriod === 'realtime' ? '실시간' :
                selectedPeriod === 'today' ? '오늘의' :
                selectedPeriod === 'yesterday' ? '어제의' :
                selectedPeriod === 'week' ? '이번주' :
                selectedPeriod === 'month' ? '이번달' :
                '올해의'
              } 인기 키워드`}
              items={mockData[selectedEngine][selectedPeriod]}
              type={selectedEngine}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 