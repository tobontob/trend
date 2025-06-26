'use client';

import { useState, useEffect } from 'react';
import HybridTrendList from './components/HybridTrendList';
import dynamic from 'next/dynamic';
import TrendTabs from './components/TrendTabs';
import TrendDetailModal from './components/TrendDetailModal';
const WordCloud = dynamic(() => import('./components/WordCloud'), { ssr: false });

export default function Home() {
  const [selectedEngine, setSelectedEngine] = useState('hybrid');
  const [selectedPeriod, setSelectedPeriod] = useState('realtime');
  const [trendWords, setTrendWords] = useState<{text: string, value: number}[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKeyword, setModalKeyword] = useState<string | null>(null);

  const engines = [
    { value: 'hybrid', name: '하이브리드', icon: '🌟' },
    { value: 'news', name: '뉴스', icon: '📰' },
    { value: 'social', name: '소셜', icon: '📱' },
    { value: 'shopping', name: '쇼핑', icon: '🛒' },
    { value: 'search', name: '검색', icon: '🔍' }
  ];

  const periods = [
    { value: 'realtime', name: '실시간', icon: '⚡' },
    { value: 'weekly', name: '이주', icon: '📅' },
    { value: 'monthly', name: '이달', icon: '📆' },
    { value: 'yearly', name: '올해', icon: '🎯' }
  ];

  // TrendTabs용 이름 배열 생성
  const engineNames = engines.map(e => e.name);
  const periodNames = periods.map(p => p.name);
  // name -> value 매핑
  const nameToEngineValue = Object.fromEntries(engines.map(e => [e.name, e.value]));
  const nameToPeriodValue = Object.fromEntries(periods.map(p => [p.name, p.value]));

  // 워드클라우드용 데이터 fetch
  const fetchTrendWords = async () => {
    try {
      setTrendLoading(true);
      setTrendError(null);
      const response = await fetch(`/api/trends?engine=${selectedEngine}&period=${selectedPeriod}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const combined = data.data?.combined || [];
      setTrendWords(
        Array.isArray(combined)
          ? combined.map((item: any) => ({ text: item.keyword, value: item.score }))
          : []
      );
    } catch (err) {
      setTrendError(err instanceof Error ? err.message : '데이터 로드 실패');
    } finally {
      setTrendLoading(false);
    }
  };

  // 워드클라우드 데이터 fetch useEffect
  useEffect(() => {
    fetchTrendWords();
  }, [selectedEngine, selectedPeriod]);

  // 디버깅용 콘솔 출력
  useEffect(() => {
    console.log('워드클라우드 words:', []);
  }, []);

  const handleKeywordClick = (keyword: string) => {
    setModalKeyword(keyword);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 트렌드 분석기
              </h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                하이브리드
              </span>
            </div>
            <div className="text-sm text-gray-500">
              실시간 트렌드 분석 및 키워드 추적
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 섹션 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 데이터 소스 선택
            </h2>
            {/* TrendTabs 컴포넌트로 교체 */}
            <TrendTabs
              engines={engineNames}
              periods={periodNames}
              selectedEngine={engines.find(e => e.value === selectedEngine)?.name || engineNames[0]}
              selectedPeriod={periods.find(p => p.value === selectedPeriod)?.name || periodNames[0]}
              onEngineChange={name => setSelectedEngine(nameToEngineValue[name])}
              onPeriodChange={name => setSelectedPeriod(nameToPeriodValue[name])}
            />
          </div>
        </div>

        {/* 트렌드 데이터 표시 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 워드클라우드 영역 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 h-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 키워드 분포
              </h3>
              <div className="flex items-center justify-center h-64 text-gray-500">
                {trendLoading ? (
                  <div className="text-center text-gray-400">로딩 중...</div>
                ) : trendError ? (
                  <div className="text-center text-red-400">{trendError}</div>
                ) : (
                  <WordCloud words={trendWords} />
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 트렌드 리스트 */}
          <div className="lg:col-span-2">
            <HybridTrendList 
              engine={selectedEngine} 
              period={selectedPeriod} 
              onKeywordClick={handleKeywordClick}
            />
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ℹ️ 하이브리드 트렌드 시스템
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📰</div>
                <h3 className="font-semibold text-gray-900">뉴스</h3>
                <p className="text-sm text-gray-600">가중치: 3.0</p>
                <p className="text-xs text-gray-500">시사성, 신뢰도</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-900">소셜</h3>
                <p className="text-sm text-gray-600">가중치: 2.0</p>
                <p className="text-xs text-gray-500">바이럴성, 확산성</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">🛒</div>
                <h3 className="font-semibold text-gray-900">쇼핑</h3>
                <p className="text-sm text-gray-600">가중치: 1.5</p>
                <p className="text-xs text-gray-500">실용성, 구매 의도</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-semibold text-gray-900">검색</h3>
                <p className="text-sm text-gray-600">가중치: 1.0</p>
                <p className="text-xs text-gray-500">일반적 관심도</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 트렌드 분석기. 하이브리드 데이터 수집 시스템으로 제공됩니다.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              뉴스, 소셜, 쇼핑, 검색 데이터를 종합하여 정확한 트렌드를 분석합니다.
            </p>
          </div>
        </div>
      </footer>

      {/* 모달 렌더링 */}
      <TrendDetailModal open={modalOpen} keyword={modalKeyword} onClose={() => setModalOpen(false)} />
    </div>
  );
} 