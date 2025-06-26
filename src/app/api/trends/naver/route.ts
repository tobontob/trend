import { NextResponse } from 'next/server';
import axios from 'axios';
import { TREND_KEYWORDS } from './keywords';

// 1시간 캐싱
const CACHE_DURATION = 60 * 60 * 1000; // 1시간
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

    // 모든 카테고리의 키워드를 하나의 배열로 합치기 (최대 20개까지 출력)
    const allKeywords = Object.values(TREND_KEYWORDS)
      .reduce((acc, category) => [...acc, ...category.keywords], [] as string[])
      .slice(0, 30); // 넉넉하게 30개까지 시도

    // 5개씩 나눠서 여러 번 요청
    const chunkSize = 5;
    const keywordChunks: string[][] = [];
    for (let i = 0; i < allKeywords.length; i += chunkSize) {
      keywordChunks.push(allKeywords.slice(i, i + chunkSize));
    }

    // 각 요청마다 keywordGroups 개수 콘솔 출력
    keywordChunks.forEach((chunk, idx) => {
      console.log(`요청 ${idx + 1}: keywordGroups 개수 = ${chunk.length}, 키워드 = [${chunk.join(', ')}]`);
    });

    const responses = await Promise.all(
      keywordChunks.map(chunk =>
        axios.post(
          'https://openapi.naver.com/v1/datalab/search',
          {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit,
            keywordGroups: chunk.map(keyword => ({ groupName: keyword, keywords: [keyword] }))
          },
          {
            headers: {
              'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
              'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
              'Content-Type': 'application/json'
            }
          }
        ).catch(error => {
          console.error(`API Error for keywords ${chunk.join(', ')}:`, error?.response?.data || error);
          return null;
        })
      )
    );

    // 응답 데이터 처리 및 변환
    const trendData: any[] = [];
    responses.forEach((response) => {
      if (!response?.data?.results) return;
      response.data.results.forEach((result: any) => {
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
    });

    // 변화량(diff) 기준으로 정렬, 상위 20개만
    const sorted = trendData
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 20)
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