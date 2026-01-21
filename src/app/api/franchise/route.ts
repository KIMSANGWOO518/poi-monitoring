// src/app/api/franchise/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import franchiseData from "../../../../json/Fix_Franchise.json";

// ✅ JSON 한 줄 타입
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
  Store_region?: string;
  status?: string;
};

// ✅ JSON import 타입 이슈 방지
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

// 🔥 [수정된 부분] Redis 에러가 나도 API가 죽지 않게 안전장치 추가
async function checkRateLimit(role: string, clientKey: string) {
  const limit = DAILY_LIMITS[role];

  // 1. 무제한(Admin)이면 바로 통과
  if (!Number.isFinite(limit)) return { used: 0, remaining: Infinity, exceeded: false };

  // 2. Redis 설정이 아예 없으면 그냥 통과 (에러 방지용)
  if (!redis) {
    console.warn("[FRANCHISE_API] Redis not configured. Skipping rate limit check.");
    return { used: 0, remaining: limit, exceeded: false };
  }

  try {
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

  } catch (error) {
    // 🔥 [핵심] Redis 연결 에러가 나면 서버를 죽이지 말고 로그만 남기고 통과시킴
    console.error("[FRANCHISE_API] Redis error ignored:", error);
    return { used: 0, remaining: limit, exceeded: false }; // 쿨하게 통과
  }
}

// -----------------------------
// 3) 실제 API 핸들러
// -----------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1) 클라이언트에서 보낸 키 확인
  const clientKeyFromQuery = searchParams.get("key");
  const clientKeyFromHeader = request.headers.get("x-api-key");
  const clientKey = clientKeyFromQuery || clientKeyFromHeader;

  // 2) 서버 키 목록 구성
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

  // 3) 키 검증
  const callerRole = clientKey ? keyRoles[clientKey] : undefined;

  // 4) 로그 출력 (여기서 region을 Store_region으로 쓰고 싶으시면 변수명만 바꾸시면 됩니다)
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const franchise = searchParams.get("franchise");
  const region = searchParams.get("region");
  const status = searchParams.get("status"); 

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

  // 6) 호출 제한 체크 (이제 에러 안 남!)
  const limitInfo = await checkRateLimit(callerRole, clientKey);

  if (limitInfo.exceeded) {
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

  if (region) {
    const target = region.toLowerCase();
    result = result.filter((item) => (item.Store_region ?? "").toLowerCase() === target);
  }

  if (status) {
    result = result.filter((item) => item.status === status);
  }


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