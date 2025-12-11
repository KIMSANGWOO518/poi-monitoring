// src/app/api/franchise/route.ts
import { NextResponse } from 'next/server';
import franchiseData from '../../../../json/Fix_Franchise.json';

// JSON 한 줄 타입
type FranchiseItem = {
  Franchise_name: string;
  Franchise_code: string;
  Store_name: string;
  Store_code: string;
  Store_addr: string;
  Store_tel: string;
  Store_lat: string;
  Store_long: string;
  FS_name: string;
  status: string;
};

const data = franchiseData as FranchiseItem[];

// GET /api/franchise
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 0) ----- API KEY 검사 -----
  const clientKeyFromQuery = searchParams.get('key');            // ?key=xxxxx
  const clientKeyFromHeader = request.headers.get('x-api-key');  // 헤더 x-api-key
  const clientKey = clientKeyFromQuery || clientKeyFromHeader;

  const serverKey = process.env.API_SECRET_KEY;

  // 서버에 키가 세팅 안 돼 있으면 서버 설정 문제
  if (!serverKey) {
    return NextResponse.json(
      { error: 'Server API key not configured' },
      { status: 500 }
    );
  }

  // 키가 없거나 값이 다르면 401(Unauthorized)
  if (!clientKey || clientKey !== serverKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }
  // -------------- 여기까지 키 체크 --------------

  const franchise = searchParams.get('franchise'); // ?franchise=스타벅스
  const status = searchParams.get('status');       // ?status=유지

  let result = data;

  // 1) 프랜차이즈 이름으로 필터 (옵션)
  if (franchise) {
    const target = franchise.toLowerCase();
    result = result.filter(
      (item) => item.Franchise_name.toLowerCase() === target
    );
  }

  // 2) status로 추가 필터 (옵션)
  if (status) {
    const target = status.toLowerCase();
    result = result.filter(
      (item) => item.status.toLowerCase() === target
    );
  }

  return NextResponse.json({
    count: result.length,
    data: result,
  });
}
