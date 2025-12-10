// src/app/api/franchise/route.ts
import { NextResponse } from 'next/server';
import franchiseData from '../../../../json/Fix_Franchise.json';

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

export async function GET(request: Request) {
  // ===========================
  // 1) API KEY 체크 부분 추가
  // ===========================
  const url = new URL(request.url);

  // 요청에서 키 꺼내기 (헤더 > 쿼리 순서)
  const clientKey =
    request.headers.get("x-api-key") ??
    url.searchParams.get("api_key");

  if (!clientKey) {
    return NextResponse.json(
      { error: "API key is required" },
      { status: 401 }
    );
  }

  // Vercel 환경변수에 저장한 키 이름 그대로 사용
  const serverKey = process.env.API_SECRET_KEY;
  // → 이미 네가 만들어둔 환경변수 이름이 API_SECRET_KEY니까 그대로 활용!

  if (!serverKey) {
    return NextResponse.json(
      { error: "Server misconfigured: API_SECRET_KEY is not set" },
      { status: 500 }
    );
  }

  if (clientKey !== serverKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  // ===========================
  // 2) API KEY 인증 성공 → 기존 로직 실행
  // ===========================

  const { searchParams } = url;

  const franchise = searchParams.get('franchise'); 
  const status = searchParams.get('status');

  let result = data;

  if (franchise) {
    const target = franchise.toLowerCase();
    result = result.filter(
      (item) => item.Franchise_name.toLowerCase() === target
    );
  }

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
