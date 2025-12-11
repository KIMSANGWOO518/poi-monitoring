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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1) 클라이언트에서 보낸 키
  const clientKeyFromQuery = searchParams.get("key");
  const clientKeyFromHeader = request.headers.get("x-api-key");
  const clientKey = clientKeyFromQuery || clientKeyFromHeader;

  // 2) 서버에 등록된 키들을 테이블로 구성
  const keyRoles: Record<string, string> = {};

  // 관리자 키
  if (process.env.API_SECRET_KEY) {
    keyRoles[process.env.API_SECRET_KEY] = "admin";
  }

  // 팀 키들
  if (process.env.API_KEY_TEAM_PARK)
    keyRoles[process.env.API_KEY_TEAM_PARK] = "team_park";

  if (process.env.API_KEY_TEAM_DMN)
    keyRoles[process.env.API_KEY_TEAM_DMN] = "team_dynamic";

  if (process.env.API_KEY_TEAM_POI)
    keyRoles[process.env.API_KEY_TEAM_POI] = "team_poi";

  if (process.env.API_KEY_TEAM_DGD)
    keyRoles[process.env.API_KEY_TEAM_DGD] = "team_digital_display";

  const serverKeys = Object.keys(keyRoles);

  // 서버에 키가 하나도 없을 때
  if (serverKeys.length === 0) {
    return NextResponse.json(
      { error: "No API keys configured on server" },
      { status: 500 }
    );
  }

  // 3) 이 요청이 어떤 키인지 판별
  const callerRole = clientKey ? keyRoles[clientKey] : undefined;

  // 4) 로그 출력
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const franchise = searchParams.get("franchise");
  const status = searchParams.get("status");

  console.log("[FRANCHISE_API_CALL]", {
    time: new Date().toISOString(),
    ip,
    key: clientKey ? clientKey.slice(0, 4) + "***" : "NO_KEY",
    role: callerRole ?? "INVALID",
    franchise,
    status,
  });

  // 5) 인증 실패 처리
  if (!clientKey || !callerRole) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  // 6) 실제 데이터 필터링
  let result = data;

  if (franchise) {
    const target = franchise.toLowerCase();
    result = result.filter(
      (item) => item.Franchise_name.toLowerCase() === target
    );
  }

  if (status) {
    const target = status.toLowerCase();
    result = result.filter((item) => item.status.toLowerCase() === target);
  }

  return NextResponse.json({
    count: result.length,
    data: result,
  });
}