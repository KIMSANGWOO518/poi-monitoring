// src/app/api/franchise/route.ts
import { NextResponse } from 'next/server';
// route.ts → src/app/api/franchise/route.ts 기준으로
// 프로젝트 루트의 json/Fix_Franchise.json 까지 올라가는 상대경로
import franchiseData from '../../../../json/Fix_Franchise.json';

// JSON 한 줄 타입(선택 사항이지만 있으면 IDE에서 편함)
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

// import 한 JSON을 타입 캐스팅
const data = franchiseData as FranchiseItem[];

// GET /api/franchise
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const franchise = searchParams.get('franchise'); // ?franchise=스타벅스
  const status = searchParams.get('status');       // ?status=유지 이런 식

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
