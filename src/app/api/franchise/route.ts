// src/app/api/franchise/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import franchiseData from "../../../../json/Fix_Franchise.json";

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

// -----------------------------
// 1) Upstash Redis 클라이언트
// -----------------------------
let redis: Redis | null = null;

// ✅ 여기에서 환경변수 이름은 Upstash 대시보드에서 보여준 그대로 사용
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
} else {
  console.warn(
    "[FRANCHISE_API] Upstash Redis env not configured. Rate limit disabled."
  );
}

// -----------------------------
// 2) 역할별 일일 호출 제한 설정
// -----------------------------
const DAILY_LIMITS: Record<string, number> = {
  admin: Infinity, // 관리자 무제한
  team_park: 200,
  team_dynamic: 500,
  team_poi: 500,
  team_digital_display: 200,
};

// Redis로 카운트 + 제한 체크
async function checkRateLimit(role: string, clientKey: string) {
  const limit = DAILY_LIMITS[role];

  // 제한 값이 없거나 Infinity면 체크 안 함
  if (!Number.isFinite(limit)) return { used: 0, remaining: Infinity };

  if (!redis) {
    // Redis 설정 안 되어 있으면 그냥 패스 (개발환경 등)
    console.warn(
      "[FRANCHISE_API] Redis not available, skipping rate limit check."
    );
    return { used: 0, remaining: Infinity };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `franchise_api:${role}:${clientKey}:${today}`;

  // 오늘 호출 횟수 +1
  const usedCountRaw = await redis.incr(key);
  // 혹시 타입이 number가 아니더라도 안전하게 숫자로 변환
  const usedCount = Number(usedCountRaw);

  // 첫 호출이면 TTL 24시간 설정
  if (usedCount === 1) {
    await redis.expire(key, 60 * 60 * 24); // 24h
  }

  const remaining = Math.max(0, limit - usedCount);

  if (usedCount > limit) {
    return { used: usedCount, remaining: 0, exceeded: true };
  }

  return { used: usedCount, remaining, exceeded: false };
}

// -----------------------------
// 3) 실제 API 핸들러
// -----------------------------
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

  if (process.env.API_KEY_TEAM_DNM)
    keyRoles[process.env.API_KEY_TEAM_DNM] = "team_dynamic";

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

  // -----------------------------
  // 6) 팀별 일일 호출 제한 체크
  // -----------------------------
  const limitInfo = await checkRateLimit(callerRole, clientKey);

  if (limitInfo.exceeded) {
    console.warn("[FRANCHISE_RATE_LIMIT]", {
      role: callerRole,
      key: clientKey.slice(0, 4) + "***",
      used: limitInfo.used,
      remaining: limitInfo.remaining,
    });

    return NextResponse.json(
      {
        error: "Daily API quota exceeded",
        role: callerRole,
        used: limitInfo.used,
        remaining: limitInfo.remaining,
      },
      { status: 429 }
    );
  }

  // -----------------------------
  // 7) 실제 데이터 필터링
  // -----------------------------
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
    // 남은 쿼터도 같이 내려주면 팀에서 확인하기 편함
    rate_limit: {
      role: callerRole,
      used: limitInfo.used,
      remaining: limitInfo.remaining,
    },
  });
}
