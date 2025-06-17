import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // 구글 트렌드 API 호출
    const response = await axios.get('https://trends.google.com/trends/api/dailytrends', {
      params: {
        hl: 'ko',
        tz: '-540',
        geo: 'KR',
        ns: '15',
      },
    });

    // 구글 트렌드 API는 특이한 형식으로 응답을 반환하므로 파싱이 필요합니다
    const data = response.data.replace(')]}\',', '');
    const parsedData = JSON.parse(data);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Google Trends API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Google trends' }, { status: 500 });
  }
} 