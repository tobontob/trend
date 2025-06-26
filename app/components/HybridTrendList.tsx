'use client';

import { useState, useEffect } from 'react';

interface TrendItem {
  keyword: string;
  score: number;
  source: string;
  count?: number;
}

interface HybridTrendData {
  news: TrendItem[];
  social: TrendItem[];
  shopping: TrendItem[];
  search: TrendItem[];
  combined: TrendItem[];
  collected_at: string;
}

interface HybridTrendListProps {
  engine: string;
  period: string;
  onKeywordClick?: (keyword: string) => void;
}

export default function HybridTrendList({ engine, period, onKeywordClick }: HybridTrendListProps) {
  const [trends, setTrends] = useState<HybridTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combined' | 'news' | 'social' | 'shopping' | 'search'>('combined');

  useEffect(() => {
    fetchTrends();
  }, [engine, period]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/trends?engine=${engine}&period=${period}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTrends(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'news': return '📰';
      case 'social': return '📱';
      case 'shopping': return '🛒';
      case 'search': return '🔍';
      case 'combined': return '🌟';
      default: return '📊';
    }
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'news': return '뉴스';
      case 'social': return '소셜';
      case 'shopping': return '쇼핑';
      case 'search': return '검색';
      case 'combined': return '종합';
      default: return source;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-red-600 font-bold';
    if (score >= 30) return 'text-orange-600 font-semibold';
    if (score >= 15) return 'text-yellow-600 font-medium';
    return 'text-gray-600';
  };

  // 더미 변화 데이터 생성 (랜덤)
  const getTrendChange = (idx: number) => {
    const arr = ['up', 'down', 'same'];
    return arr[idx % 3];
  };
  const getChangeIcon = (change: string) => {
    if (change === 'up') return <span className="text-green-500 ml-1">▲</span>;
    if (change === 'down') return <span className="text-red-500 ml-1">▼</span>;
    return <span className="text-gray-400 ml-1">–</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">트렌드 데이터 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={fetchTrends}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!trends) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">데이터가 없습니다.</div>
      </div>
    );
  }

  const currentTrends = trends[activeTab] || [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'combined', name: '종합', icon: '🌟' },
          { key: 'news', name: '뉴스', icon: '📰' },
          { key: 'social', name: '소셜', icon: '📱' },
          { key: 'shopping', name: '쇼핑', icon: '🛒' },
          { key: 'search', name: '검색', icon: '🔍' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* 트렌드 리스트 */}
      <div className="space-y-3">
        {currentTrends.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {getSourceName(activeTab)} 트렌드 데이터가 없습니다.
          </div>
        ) : (
          currentTrends.map((trend, index) => (
            <div
              key={`${trend.keyword}-${index}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                  {index + 1}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSourceIcon(trend.source)}</span>
                  {/* 키워드 클릭 시 상세 모달 */}
                  <button
                    type="button"
                    className="font-medium text-gray-800 hover:underline focus:outline-none"
                    onClick={() => onKeywordClick && onKeywordClick(trend.keyword)}
                  >
                    {trend.keyword}
                  </button>
                  {/* 네이버 검색 아이콘 */}
                  <a
                    href={`https://search.naver.com/search.naver?query=${encodeURIComponent(trend.keyword)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-400 hover:text-blue-600"
                    title="네이버에서 검색"
                  >
                    🔗
                  </a>
                  {/* 변화 아이콘(더미) */}
                  {getChangeIcon(getTrendChange(index))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {trend.count && (
                  <div className="text-sm text-gray-500">
                    빈도: {trend.count}
                  </div>
                )}
                <div className={`text-lg font-bold ${getScoreColor(trend.score)}`}>
                  {Math.round(trend.score)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 데이터 수집 시간 */}
      {trends.collected_at && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            마지막 업데이트: {new Date(trends.collected_at).toLocaleString('ko-KR')}
          </div>
        </div>
      )}
    </div>
  );
} 