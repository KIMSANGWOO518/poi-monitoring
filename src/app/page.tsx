/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { User, Lock, LogOut, MapPin, Phone, Home, Info, ChevronDown } from "lucide-react";

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
  Store_region?: string;
}

/* =========================
   멀티셀렉트 드롭다운 (로고 버전)
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
  icons?: { [key: string]: string };
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
              onClick={selectAll}
              className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
            >
              전체 선택
            </button>
            <button
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
                      alt={option}
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
   Leaflet (SSR 방지)
========================= */
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://raw.githubusercontent.com/KIMSANGWOO518/inavi-calendar/main/image/inavi_logo.png"
            alt="iNavi"
            className="h-14"
          />
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          공간플랫폼개발그룹<br />POI MAP 로그인
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

          <button className="w-full bg-blue-600 text-white py-2 rounded">
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
function MapContent({ currentUser, onLogout }: { currentUser: string; onLogout: () => void }) {
  const [poiData, setPoiData] = useState<POIData[]>([]);
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [franchiseOptions, setFranchiseOptions] = useState<string[]>([]);

  const ICON_BASE =
    "https://raw.githubusercontent.com/KIMSANGWOO518/inavi-calendar/main/image";

  const franchiseIcons: { [key: string]: string } = {
    커피빈: `${ICON_BASE}/bean.png`,
    할리스: `${ICON_BASE}/hollys.gif`,
    스타벅스: `${ICON_BASE}/star.png`,
    투썸플레이스: `${ICON_BASE}/two.png`,
  };

  const getIconUrl = (name: string) =>
    franchiseIcons[name] || `${ICON_BASE}/inavi_logo.png`;

  const getLeafletIcon = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require("leaflet");
    return L.icon({
      iconUrl: getIconUrl(name),
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/KIMSANGWOO518/poi-monitoring/main/json/Fix_Franchise.json"
    )
      .then((res) => res.json())
      .then((data) => {
        setPoiData(data);
        const franchises = [...new Set(data.map((d: any) => d.Franchise_name))];
        setFranchiseOptions(franchises);
        setSelectedFranchises(franchises);
      });
  }, []);

  const filtered = poiData.filter(
    (p) => selectedFranchises.length === 0 || selectedFranchises.includes(p.Franchise_name)
  );

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">POI 모니터링 지도</h1>
        <button onClick={onLogout} className="text-sm text-gray-600">
          <LogOut className="inline w-4 h-4 mr-1" />
          로그아웃
        </button>
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

          {filtered.map((poi, i) => (
            <Marker
              key={i}
              position={[+poi.Store_lat, +poi.Store_long]}
              icon={getLeafletIcon(poi.Franchise_name)}
            >
              <Popup>
                <div className="flex items-center gap-2 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getIconUrl(poi.Franchise_name)} className="w-5 h-5" />
                  <b>{poi.Franchise_name}</b>
                </div>
                <div>{poi.Store_name}</div>
                <div className="text-sm text-gray-600">{poi.Store_addr}</div>
                <div className="text-sm">{poi.Store_tel}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

/* =========================
   루트 컴포넌트
========================= */
export default function POIMonitoringApp() {
  const [user, setUser] = useState<string | null>(null);

  if (!user) return <LoginForm onLogin={setUser} />;

  return <MapContent currentUser={user} onLogout={() => setUser(null)} />;
}
