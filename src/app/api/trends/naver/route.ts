import { NextResponse } from 'next/server';
import axios from 'axios';
import { TREND_KEYWORDS } from './keywords';

// 10분 캐싱
const CACHE_DURATION = 10 * 60 * 1000; // 10분
const CACHE: Record<string, { data: any; timestamp: number }> = {};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'realtime';

    // 캐시 확인
    const cacheKey = `naver_trends_${period}`;
    const cachedData = CACHE[cacheKey];
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    const today = new Date();
    const startDate = new Date(today);
    let timeUnit = 'date';

    // 기간별로 날짜 및 timeUnit 설정
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        timeUnit = 'date';
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        timeUnit = 'date';
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        timeUnit = 'date';
        break;
      case 'month':
        startDate.setDate(today.getDate() - 30);
        timeUnit = 'date';
        break;
      case 'year':
        startDate.setDate(today.getDate() - 365);
        timeUnit = 'date';
        break;
      default: // realtime
        startDate.setDate(today.getDate() - 1);
        timeUnit = 'date';
        break;
    }

    // 모든 카테고리의 키워드를 하나의 배열로 합치기 (상위 10개만)
    const allKeywords = Object.values(TREND_KEYWORDS)
      .reduce((acc, category) => [...acc, ...category.keywords], [] as string[])
      .slice(0, 10);

    // 각 키워드별로 별도의 API 요청
    const responses = await Promise.all(
      allKeywords.map(keyword =>
        axios.post(
          'https://openapi.naver.com/v1/datalab/search',
          {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit,
            keywordGroups: [{ groupName: keyword, keywords: [keyword] }]
          },
          {
            headers: {
              'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
              'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
              'Content-Type': 'application/json'
            }
          }
        ).catch(error => {
          console.error(`API Error for keyword ${keyword}:`, error?.response?.data || error);
          return null;
        })
      )
    );

    // 응답 데이터 처리 및 변환
    const trendData: any[] = [];
    responses.forEach((response, idx) => {
      if (!response?.data?.results?.[0]?.data) return;
      const result = response.data.results[0];
      const dataArr = result.data;
      if (!Array.isArray(dataArr) || dataArr.length < 2) return; // 데이터가 2개 미만이면 제외
      const keyword = result.keywords[0];
      const latest = dataArr[dataArr.length - 1]?.ratio ?? 0;
      const previous = dataArr[0]?.ratio ?? 0;
      const diff = latest - previous;
      const ratio = previous !== 0 ? (diff / previous) * 100 : 0;
      trendData.push({
        keyword,
        latest,
        previous,
        diff,
        ratio
      });
    });

    // 변화량(diff) 기준으로 정렬, 상위 10개만
    const sorted = trendData
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 10)
      .map((item, idx) => ({
        keyword: item.keyword,
        rank: idx + 1,
        searchCount: Math.round(item.latest * 100),
        diff: Math.round(item.diff * 100),
        ratio: Math.round(item.ratio * 100) / 100
      }));

    // 캐싱
    const result = { keywords: sorted };
    CACHE[cacheKey] = {
      data: result,
      timestamp: now
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('==== 네이버 트렌드 API CATCH 진입 ====');
    if (error.response) {
      console.error('Naver API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Naver API Error:', error.message || error);
    }
    return NextResponse.json(
      { error: '네이버 트렌드 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 