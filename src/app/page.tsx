"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Icon as LeafletIcon } from "leaflet"; // ✅ type-only import (런타임 영향 없음)
import { LogOut, ChevronDown } from "lucide-react";

/* =========================
   타입 정의
========================= */
interface POIData {
  Franchise_name: string;
  Franchise_code: string;
  Store_name: string;
  Store_code: string;
  Store_addr: string;
  Store_tel: string;
  Store_lat: string;
  Store_long: string;
  FS_name: string;
  FS_code?: string;
  Store_region?: string;
  status?: string; // ✅ 추가
}

/* =========================
   멀티셀렉트 드롭다운
========================= */
function MultiSelectDropdown({
  options,
  selected,
  onChange,
  label,
  icons = {},
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  icons?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) onChange(selected.filter((item) => item !== option));
    else onChange([...selected, option]);
  };

  const selectAll = () => onChange(options);
  const clearAll = () => onChange([]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between min-w-[220px]"
      >
        <span className="text-sm">
          {label}:{" "}
          {selected.length === 0
            ? "선택 안함"
            : selected.length === options.length
            ? "전체"
            : `${selected.length}개 선택`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded"
            >
              전체 해제
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-3"
                />
                <span className="flex items-center gap-2 text-sm">
                  {icons[option] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={icons[option]}
                      alt={`${option} 로고`}
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Leaflet / react-leaflet (SSR 방지)
========================= */
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

/* =========================
   로그인 컴포넌트
========================= */
function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (username === "test_2025" && password === "1234") ||
      (username === "poi_2025" && password === "7777") ||
      (username === "dynamic_2025" && password === "8888") ||
      (username === "gis_2025" && password === "4321") ||
      (username === "park_2025" && password === "4321") ||
      (username === "recruit_2025" && password === "99998888")
    ) {
      onLogin(username);
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          {/* ✅ public/icons에 넣어둔 로고를 쓰면 가장 안정적 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/inavi_logo.png" alt="iNavi 로고" className="h-14" />
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          공간플랫폼개발그룹
          <br />
          POI MAP 로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border px-4 py-2 rounded"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full border px-4 py-2 rounded"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   메인 지도 컴포넌트
========================= */
function MapContent({ onLogout, currentUser }: { currentUser: string; onLogout: () => void }) {
  const [poiData, setPoiData] = useState<POIData[]>([]);
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [franchiseOptions, setFranchiseOptions] = useState<string[]>([]);

  // ✅ leaflet을 “클라이언트에서만” 로드 (window 에러 방지)
  const [leaflet, setLeaflet] = useState<null | typeof import("leaflet")>(null);
  useEffect(() => {
    let alive = true;
    import("leaflet")
      .then((mod) => {
        if (alive) setLeaflet(mod);
      })
      .catch((err) => console.error("leaflet import error:", err));
    return () => {
      alive = false;
    };
  }, []);

  /**
   * ✅ 핵심 변경점
   * public/icons/* 에 넣은 파일은 런타임에서 /icons/* 로 접근됩니다.
   */
  const ICON_BASE = "/icons";

  const franchiseIcons = useMemo<Record<string, string>>(
    () => ({
      커피빈: `${ICON_BASE}/bean.png`,
      할리스: `${ICON_BASE}/hollys.gif`,
      스타벅스: `${ICON_BASE}/star.png`,
      투썸플레이스: `${ICON_BASE}/two.png`,
    }),
    [ICON_BASE]
  );

  const getIconUrl = (name: string) => franchiseIcons[name] || `${ICON_BASE}/inavi_logo.png`;

  const formatCoord = (v: unknown) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "-";
    return n.toFixed(6);
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "").trim();
    // 필요하면 여기서 케이스를 더 추가하면 됨
    if (s === "유지") return { text: "유지", cls: "bg-green-50 text-green-700 border-green-200" };
    if (s === "신규") return { text: "신규", cls: "bg-blue-50 text-blue-700 border-blue-200" };
    if (s === "폐점" || s === "삭제")
      return { text: s, cls: "bg-red-50 text-red-700 border-red-200" };
    if (!s) return { text: "상태없음", cls: "bg-gray-50 text-gray-700 border-gray-200" };
    return { text: s, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  };

  // ✅ leaflet 로드된 이후에만 iconCache 생성
  const iconCache = useMemo(() => {
    if (!leaflet) return null;

    // ✅ 여기서 마커 크기 조절 가능
    const ICON_SIZE: [number, number] = [20, 20];
    const ICON_ANCHOR: [number, number] = [ICON_SIZE[0] / 2, ICON_SIZE[1]]; // 가운데-아래
    const POPUP_ANCHOR: [number, number] = [0, -ICON_SIZE[1]];

    const cache = new Map<string, LeafletIcon>();
    for (const [name, url] of Object.entries(franchiseIcons)) {
      cache.set(
        name,
        leaflet.icon({
          iconUrl: url,
          iconRetinaUrl: url,
          iconSize: ICON_SIZE,
          iconAnchor: ICON_ANCHOR,
          popupAnchor: POPUP_ANCHOR,
        })
      );
    }

    const fallback = `${ICON_BASE}/inavi_logo.png`;
    cache.set(
      "__default__",
      leaflet.icon({
        iconUrl: fallback,
        iconRetinaUrl: fallback,
        iconSize: ICON_SIZE,
        iconAnchor: ICON_ANCHOR,
        popupAnchor: POPUP_ANCHOR,
      })
    );

    return cache;
  }, [leaflet, franchiseIcons, ICON_BASE]);

  const getLeafletIcon = (name: string) =>
    iconCache?.get(name) || iconCache?.get("__default__") || undefined;

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/KIMSANGWOO518/poi-monitoring/main/json/Fix_Franchise.json")
      .then((res) => res.json())
      .then((data: POIData[]) => {
        setPoiData(data);

        const franchises: string[] = Array.from(
          new Set(
            data
              .map((d) => d.Franchise_name)
              .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
          )
        );

        setFranchiseOptions(franchises);
        setSelectedFranchises(franchises);
      })
      .catch((err) => console.error("Fix_Franchise.json fetch error:", err));
  }, []);

  /**
   * ✅ 전체 해제 시(선택 0개) 지도에 "아무것도" 안 보이게
   */
  const filtered = poiData.filter(
    (p) => selectedFranchises.length > 0 && selectedFranchises.includes(p.Franchise_name)
  );

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">POI 모니터링 지도</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{currentUser}님</span>
          <button type="button" onClick={onLogout} className="text-sm text-gray-600">
            <LogOut className="inline w-4 h-4 mr-1" />
            로그아웃
          </button>
        </div>
      </div>

      <MultiSelectDropdown
        options={franchiseOptions}
        selected={selectedFranchises}
        onChange={setSelectedFranchises}
        label="프랜차이즈"
        icons={franchiseIcons}
      />

      <div className="mt-4 h-[700px] border rounded overflow-hidden">
        <MapContainer center={[37.5665, 126.978]} zoom={11} style={{ height: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* ✅ 선택이 0개면 마커 렌더 자체를 안 함 */}
          {selectedFranchises.length > 0 &&
            filtered.map((poi) => {
              const lat = Number(poi.Store_lat);
              const lng = Number(poi.Store_long);
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

              const badge = getStatusBadge(poi.status);

              return (
                <Marker
                  key={poi.FS_name || poi.FS_code || `${poi.Franchise_code}-${poi.Store_code}`}
                  position={[lat, lng]}
                  icon={getLeafletIcon(poi.Franchise_name)}
                >
                  <Popup>
                    <div className="min-w-[260px] max-w-[340px]">
                      {/* 헤더: 로고 + 프랜차이즈 + 상태 배지 */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getIconUrl(poi.Franchise_name)}
                            alt={`${poi.Franchise_name} 로고`}
                            className="w-6 h-6 rounded-sm object-contain"
                          />
                          <div className="flex flex-col leading-tight">
                            <span className="text-[13px] text-gray-500">{poi.Franchise_name}</span>
                            <span className="text-[15px] font-semibold text-gray-900">
                              {poi.Store_name}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`ml-3 px-2 py-[2px] text-[12px] border rounded-full ${badge.cls}`}
                          title="status"
                        >
                          {badge.text}
                        </span>
                      </div>

                      {/* 본문 */}
                      <div className="space-y-2 text-[13px] text-gray-800">
                        <div className="flex gap-2">
                          <span className="shrink-0 w-5 text-center">📍</span>
                          <span className="break-words">{poi.Store_addr}</span>
                        </div>

                        <div className="flex gap-2">
                          <span className="shrink-0 w-5 text-center">📞</span>
                          <a
                            href={`tel:${(poi.Store_tel || "").replace(/[^0-9+]/g, "")}`}
                            className="text-blue-700 hover:underline"
                          >
                            {poi.Store_tel}
                          </a>
                        </div>

                        {/* ✅ 좌표 표시 (lat/long) */}
                        <div className="flex gap-2">
                          <span className="shrink-0 w-5 text-center">🧭</span>
                          <span className="text-gray-700">
                            {formatCoord(poi.Store_lat)}, {formatCoord(poi.Store_long)}
                          </span>
                        </div>

                        {/* ✅ status 표시 (추가로 한 줄 더 표시 원할 때) */}
                        <div className="flex gap-2">
                          <span className="shrink-0 w-5 text-center">✅</span>
                          <span className="text-gray-700">{badge.text}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}

/* =========================
   루트 컴포넌트
========================= */
export default function POIMonitoringApp() {
  useEffect(() => {
    console.log("### POI MAP VERSION: 2025-12-19 marker-logo ###");
  }, []);

  const [user, setUser] = useState<string | null>(null);

  if (!user) return <LoginForm onLogin={setUser} />;
  return <MapContent currentUser={user} onLogout={() => setUser(null)} />;
}
