'use client';

import { useEffect, useState } from 'react';
import TrendList from './components/TrendList';
import WordCloud from './components/WordCloud';

interface TrendItem {
  keyword: string;
  rank: number;
  searchCount: number;
  diff?: number;
  ratio?: number;
}

const ENGINES = [
  { key: 'naver', label: '네이버' },
  { key: 'google', label: '구글' },
];

const PERIOD_LABELS: Record<string, string> = {
  realtime: '실시간',
  week: '이주',
  month: '이달',
  year: '올해',
};

type Period = keyof typeof PERIOD_LABELS;

export default function Home() {
  const [selectedEngine, setSelectedEngine] = useState('naver');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('realtime');
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/trends?engine=${selectedEngine}&period=${selectedPeriod}`);
        if (!res.ok) throw new Error('트렌드 데이터를 가져오는데 실패했습니다.');
        const data = await res.json();
        const keywords = data[0]?.data?.keywords || [];
        const items: TrendItem[] = keywords.map((kw: any, idx: number) => ({
          keyword: typeof kw === 'string' ? kw : kw.keyword,
          rank: idx + 1,
          searchCount: kw.searchCount || Math.floor(Math.random() * 10000 + 1000),
          diff: kw.diff,
          ratio: kw.ratio,
        }));
        setTrends(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedEngine, selectedPeriod]);

  const getWordCloudData = (trends: TrendItem[]) =>
    trends.map(trend => ({
      text: trend.keyword,
      value: trend.searchCount,
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">오류 발생</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          트렌드 분석
        </h1>
        {/* 엔진별 탭 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          {ENGINES.map(engine => (
            <button
              key={engine.key}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium border-2 transition-colors duration-150 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                ${selectedEngine === engine.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 active:bg-blue-100'}
              `}
              onClick={() => setSelectedEngine(engine.key)}
            >
              {engine.label}
            </button>
          ))}
        </div>
        {/* 기간별 탭 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium border-2 transition-colors duration-150 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400
                ${selectedPeriod === key
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 active:bg-green-100'}
              `}
              onClick={() => setSelectedPeriod(key as Period)}
            >
              {label}
            </button>
          ))}
        </div>
        {/* 좌: 워드클라우드, 우: 트렌드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center min-h-[220px] sm:min-h-[320px]">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">키워드 클라우드</h2>
            <div className="w-full flex-1 flex items-center justify-center min-h-[120px] sm:min-h-[320px]">
              <WordCloud words={getWordCloudData(trends)} width={320} height={220} />
            </div>
          </div>
          <TrendList
            title={`${ENGINES.find(e => e.key === selectedEngine)?.label} ${PERIOD_LABELS[selectedPeriod]} 키워드`}
            items={trends}
          />
        </div>
      </div>
    </main>
  );
} 