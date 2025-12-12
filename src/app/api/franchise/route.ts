// src/app/api/franchise/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import franchiseData from "../../../../json/Fix_Franchise.json";

// ✅ JSON 한 줄 타입 (status 제거 + Store_region 추가)
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
  Store_region?: string; // ✅ 추가 (없을 수도 있으니 optional)
};

// ✅ JSON import 타입 이슈 방지 (빌드 에러 방지용)
const data = franchiseData as unknown as FranchiseItem[];

// -----------------------------
// 1) Upstash Redis 클라이언트
// -----------------------------
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
} else {
  console.warn("[FRANCHISE_API] Upstash Redis env not configured. Rate limit disabled.");
}

// -----------------------------
// 2) 역할별 일일 호출 제한 설정
// -----------------------------
const DAILY_LIMITS: Record<string, number> = {
  admin: Infinity,
  team_park: 200,
  team_dynamic: 500,
  team_poi: 500,
  team_digital_display: 200,
};

// Redis로 카운트 + 제한 체크
async function checkRateLimit(role: string, clientKey: string) {
  const limit = DAILY_LIMITS[role];

  if (!Number.isFinite(limit)) return { used: 0, remaining: Infinity, exceeded: false };

  if (!redis) {
    console.warn("[FRANCHISE_API] Redis not available, skipping rate limit check.");
    return { used: 0, remaining: Infinity, exceeded: false };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `franchise_api:${role}:${clientKey}:${today}`;

  const usedCountRaw = await redis.incr(key);
  const usedCount = Number(usedCountRaw);

  if (usedCount === 1) {
    await redis.expire(key, 60 * 60 * 24);
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

  if (process.env.API_SECRET_KEY) keyRoles[process.env.API_SECRET_KEY] = "admin";
  if (process.env.API_KEY_TEAM_PARK) keyRoles[process.env.API_KEY_TEAM_PARK] = "team_park";
  if (process.env.API_KEY_TEAM_DNM) keyRoles[process.env.API_KEY_TEAM_DNM] = "team_dynamic";
  if (process.env.API_KEY_TEAM_POI) keyRoles[process.env.API_KEY_TEAM_POI] = "team_poi";
  if (process.env.API_KEY_TEAM_DGD) keyRoles[process.env.API_KEY_TEAM_DGD] = "team_digital_display";

  const serverKeys = Object.keys(keyRoles);

  if (serverKeys.length === 0) {
    return NextResponse.json({ error: "No API keys configured on server" }, { status: 500 });
  }

  // 3) 이 요청이 어떤 키인지 판별
  const callerRole = clientKey ? keyRoles[clientKey] : undefined;

  // 4) 로그 출력
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const franchise = searchParams.get("franchise");
  const region = searchParams.get("region"); // ✅ (옵션) 지역 필터

  console.log("[FRANCHISE_API_CALL]", {
    time: new Date().toISOString(),
    ip,
    key: clientKey ? clientKey.slice(0, 4) + "***" : "NO_KEY",
    role: callerRole ?? "INVALID",
    franchise,
    region,
  });

  // 5) 인증 실패 처리
  if (!clientKey || !callerRole) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  // 6) 팀별 일일 호출 제한 체크
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

  // 7) 데이터 필터링
  let result = data;

  if (franchise) {
    const target = franchise.toLowerCase();
    result = result.filter((item) => item.Franchise_name.toLowerCase() === target);
  }

  // ✅ (옵션) region 필터: Store_region이 없는 데이터는 제외되도록 처리
  if (region) {
    const target = region.toLowerCase();
    result = result.filter((item) => (item.Store_region ?? "").toLowerCase() === target);
  }

  // ✅ 캐시 방지 헤더 (API 갱신 즉시 반영되게)
  return NextResponse.json(
    {
      count: result.length,
      data: result,
      rate_limit: {
        role: callerRole,
        used: limitInfo.used,
        remaining: limitInfo.remaining,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
