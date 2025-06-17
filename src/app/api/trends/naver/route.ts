import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // 네이버 데이터랩 API 호출
    const response = await axios.get('https://openapi.naver.com/v1/datalab/search', {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
      data: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        timeUnit: 'date',
        keywordGroups: [
          {
            groupName: '실시간',
            keywords: ['실시간'],
          },
        ],
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Naver API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Naver trends' }, { status: 500 });
  }
} 