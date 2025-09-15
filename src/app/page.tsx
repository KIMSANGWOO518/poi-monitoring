/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
// Check와 X를 import에서 제거
import { User, Lock, LogOut, MapPin, Phone, Home, Info, ChevronDown } from 'lucide-react';

// POI 데이터 타입 정의
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
  Store_status: string;
  status?: string; // optional로 추가
}

// 멀티셀렉트 드롭다운 컴포넌트
function MultiSelectDropdown({ 
  options, 
  selected, 
  onChange, 
  label,
  colors = {}
}: { 
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  colors?: { [key: string]: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => {
    onChange(options);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 min-w-[200px] justify-between"
      >
        <span className="text-sm">
          {label}: {selected.length === 0 ? '선택 안함' : selected.length === options.length ? '전체' : `${selected.length}개 선택`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg" style={{ zIndex: 9999 }}>
          <div className="p-2 border-b border-gray-200 flex gap-2">
            <button
              onClick={selectAll}
              className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
            >
              전체 선택
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition"
            >
              전체 해제
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-3"
                />
                <span className="flex items-center gap-2 text-sm">
                  {colors[option] && (
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[option] }}
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

// Leaflet을 동적으로 로드 (SSR 방지)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
// Marker는 사용하지 않으므로 제거
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

// LeafletSetup은 사용하지 않으므로 제거

// 로그인 컴포넌트
function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'test_2025' && password === '1234') {
        onLogin(username);
      } else if (username === 'poi_2025' && password === '4321') {
        onLogin(username);
      } else if (username === 'dynamic_2025' && password === '1234') {
        onLogin(username);
      } else if (username === 'gis_2025' && password === '4321') {
        onLogin(username);
      } else if (username === 'park_2025' && password === '4321') {
        onLogin(username);
      } else if (username === 'recruit_2025' && password === '4321') {
        onLogin(username);
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://raw.githubusercontent.com/KIMSANGWOO518/inavi-calendar/main/image/inavi_logo.png" 
            alt="iNavi Logo" 
            className="h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          공간플랫폼개발그룹<br />POI MAP 로그인
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="아이디를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 text-right text-sm text-gray-500">
          <p>이용문의: Dynamic팀 김상우</p>
        </div>
      </div>
    </div>
  );
}

// 메인 지도 컴포넌트
function MapContent({ currentUser, onLogout }: { currentUser: string; onLogout: () => void }) {
  const [poiData, setPoiData] = useState<POIData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [franchiseOptions, setFranchiseOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  // 프랜차이즈별 마커 색상 설정
  const franchiseColors: { [key: string]: string } = {
    '커피빈': '#8B008B',
    '스타벅스': '#00FF00', 
    '투썸플레이스': '#FF0000'
  };

  const getMarkerColor = (franchiseName: string): string => {
    return franchiseColors[franchiseName] || '#0000FF';
  };

  // 상태별 마커 스타일 설정
  const getMarkerOpacity = (status: string): number => {
    switch(status) {
      case '개점':
        return 0.9;
      case '폐점':
        return 0.3;
      case '유지':
        return 0.7;
      default:
        return 0.6;
    }
  };

  // POI 데이터 로드
  useEffect(() => {
    const fetchPOIData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://raw.githubusercontent.com/KIMSANGWOO518/poi-monitoring/main/json/Fix_Franchise.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const data = JSON.parse(text);
        
        if (Array.isArray(data)) {
          setPoiData(data);
          
          // 프랜차이즈 옵션 추출
          const franchises = [...new Set(data.map(item => item.Franchise_name))].filter(Boolean);
          setFranchiseOptions(franchises);
          setSelectedFranchises(franchises); // 초기값: 모두 선택
          
          // 상태 옵션 설정 (고정값으로 설정)
          const statuses = ['개점', '유지', '폐점', '휴점', '재오픈'];
          setStatusOptions(statuses);
          setSelectedStatuses(statuses); // 초기값: 모두 선택
          
          setError(null);
        } else {
          throw new Error('데이터가 배열 형식이 아닙니다.');
        }
        
      } catch (err) {
        console.error('전체 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPOIData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 필터링된 데이터
  const filteredPoiData = poiData.filter(poi => {
    const franchiseMatch = selectedFranchises.length === 0 || selectedFranchises.includes(poi.Franchise_name);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(poi.Store_status || poi.status || '');
    return franchiseMatch && statusMatch;
  });

  // 지도 중심 좌표 계산
  const getMapCenter = (): [number, number] => {
    if (filteredPoiData.length > 0) {
      return [
        parseFloat(filteredPoiData[0].Store_lat),
        parseFloat(filteredPoiData[0].Store_long)
      ];
    }
    return [37.5665, 126.9780]; // 기본값: 서울
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-7xl mx-auto">
        {/* 헤더 영역 - 로고와 로그아웃 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://raw.githubusercontent.com/KIMSANGWOO518/inavi-calendar/main/image/inavi_logo.png" 
              alt="iNavi Logo" 
              className="mr-4 h-12 object-contain"
              onError={(e) => {
                console.error('이미지 로드 실패:', e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-bold text-gray-800">
              공간플랫폼개발그룹 POI 모니터링 지도
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <User className="inline w-4 h-4 mr-1" />
              {currentUser}님
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* 필터 드롭다운 영역 */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">필터:</span>
            
            <MultiSelectDropdown
              options={franchiseOptions}
              selected={selectedFranchises}
              onChange={setSelectedFranchises}
              label="프랜차이즈"
              colors={franchiseColors}
            />
            
            <MultiSelectDropdown
              options={statusOptions}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              label="매장 상태"
            />
            
            <div className="ml-auto text-sm text-gray-600">
              {isLoading ? (
                <span>데이터 로딩 중...</span>
              ) : error ? (
                <span className="text-red-600">오류: {error}</span>
              ) : (
                <span>
                  총 {poiData.length}개 중 {filteredPoiData.length}개 표시
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 범례 표시 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">
            프랜차이즈 매장 위치 모니터링
          </h2>
          <div className="flex items-center gap-6">
            {/* 프랜차이즈 범례 */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">프랜차이즈:</span>
              {franchiseOptions.map(franchise => (
                <div key={franchise} className="flex items-center gap-1">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getMarkerColor(franchise) }}
                  />
                  <span>{franchise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 지도 영역 */}
        <div className="mb-8">
          <div className="w-full h-[700px] border border-gray-300 rounded-lg overflow-hidden shadow-lg">
            <MapContainer
              center={getMapCenter()}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* 필터링된 POI 원형 마커 표시 */}
              {filteredPoiData.map((poi, index) => {
                const lat = parseFloat(poi.Store_lat);
                const lng = parseFloat(poi.Store_long);
                const status = poi.Store_status || poi.status || '';
                
                // 유효한 좌표인지 확인
                if (isNaN(lat) || isNaN(lng)) {
                  return null;
                }
                
                return (
                  <CircleMarker 
                    key={`${poi.Store_code}-${index}`} 
                    center={[lat, lng]}
                    radius={8}
                    fillColor={getMarkerColor(poi.Franchise_name)}
                    color="#ffffff"
                    weight={2}
                    fillOpacity={getMarkerOpacity(status)}
                  >
                    <Popup maxWidth={350}>
                      <div className="p-3">
                        {/* 프랜차이즈 이름 헤더 */}
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-bold" style={{ color: getMarkerColor(poi.Franchise_name) }}>
                            {poi.Franchise_name}
                          </h3>
                        </div>
                        
                        {/* 매장 정보 */}
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-700">매장명:</span>
                              <span className="ml-1 text-gray-600">{poi.Store_name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Home className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-700">주소:</span>
                              <span className="ml-1 text-gray-600 text-sm">{poi.Store_addr}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-700">전화:</span>
                              <span className="ml-1 text-gray-600">{poi.Store_tel}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Info className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-700">상태:</span>
                              <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                                status === '개점' 
                                  ? 'bg-green-100 text-green-700' 
                                  : status === '폐점'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                          
                          {/* 좌표 정보 (작게 표시) */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              좌표: {poi.Store_lat}, {poi.Store_long}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">
            위의 지도는 OpenStreetMap을 사용합니다. 마커를 클릭하면 상세 정보를 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

// 메인 컴포넌트
export default function POIMonitoringApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    sessionStorage.setItem('currentUser', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    sessionStorage.removeItem('currentUser');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <MapContent currentUser={currentUser} onLogout={handleLogout} />;
}