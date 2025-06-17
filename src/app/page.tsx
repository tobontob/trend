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

const PERIOD_LABELS: Record<string, string> = {
  realtime: '실시간',
  today: '오늘',
  yesterday: '어제',
  week: '이주',
  month: '이달',
  year: '올해',
};

type Period = keyof typeof PERIOD_LABELS;

type Engine = 'naver' | 'google';

export default function Home() {
  const [selectedEngine, setSelectedEngine] = useState<Engine>('naver');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('realtime');
  const [naverTrends, setNaverTrends] = useState<TrendItem[]>([]);
  const [googleTrends, setGoogleTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedEngine === 'naver') {
          const naverResponse = await fetch(`/api/trends/naver?period=${selectedPeriod}`);
          if (!naverResponse.ok) throw new Error('네이버 트렌드 데이터를 가져오는데 실패했습니다.');
          const naverData = await naverResponse.json();
          setNaverTrends(naverData.keywords);
        } else {
          const googleResponse = await fetch(`/api/trends/google?period=${selectedPeriod}`);
          if (!googleResponse.ok) throw new Error('구글 트렌드 데이터를 가져오는데 실패했습니다.');
          const googleData = await googleResponse.json();
          setGoogleTrends(googleData.keywords);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedEngine, selectedPeriod]);

  // WordCloud 데이터 변환
  const getWordCloudData = (trends: TrendItem[]) => {
    return trends.map(trend => ({
      text: trend.keyword,
      value: trend.searchCount
    }));
  };

  const trends = selectedEngine === 'naver' ? naverTrends : googleTrends;

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
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          트렌드 분석
        </h1>
        {/* 엔진 탭 */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-6 py-2 rounded-full font-semibold shadow transition-colors duration-150 border-2 ${selectedEngine === 'naver' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
            onClick={() => setSelectedEngine('naver')}
          >
            네이버
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold shadow transition-colors duration-150 border-2 ${selectedEngine === 'google' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
            onClick={() => setSelectedEngine('google')}
          >
            구글
          </button>
        </div>
        {/* 기간별 탭 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-full font-medium border-2 transition-colors duration-150 text-sm
                ${selectedPeriod === key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'}
              `}
              onClick={() => setSelectedPeriod(key as Period)}
            >
              {label}
            </button>
          ))}
        </div>
        {/* 좌: 워드클라우드, 우: 트렌드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">키워드 클라우드</h2>
            <div className="w-full flex-1 flex items-center justify-center min-h-[320px]">
              <WordCloud words={getWordCloudData(trends)} width={400} height={320} />
            </div>
          </div>
          <TrendList
            title={`${selectedEngine === 'naver' ? '네이버' : '구글'} ${PERIOD_LABELS[selectedPeriod]} 키워드`}
            items={trends}
            type={selectedEngine}
          />
        </div>
      </div>
    </main>
  );
} 