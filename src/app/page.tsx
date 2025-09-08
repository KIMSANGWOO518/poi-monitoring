"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { User, Lock, LogOut, MapPin, Phone, Home, Info } from 'lucide-react';

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
  status: string;
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
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Leaflet 아이콘 설정을 위한 컴포넌트
const LeafletSetup = dynamic(
  () => import("leaflet").then((L) => {
    // 기본 마커 아이콘 설정
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    return () => null;
  }),
  { ssr: false }
);

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
          공간플랫폼개발그룹<br />POI M 로그인
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

  // 프랜차이즈별 마커 색상 설정
  const getMarkerColor = (franchiseName: string): string => {
    switch(franchiseName) {
      case '커피빈':
        return '#8B008B'; // 보라색
      case '스타벅스':
        return '#00FF00'; // 초록색
      case '투썸플레이스':
        return '#FF0000'; // 빨간색
      default:
        return '#0000FF'; // 기본값: 파란색
    }
  };

  // POI 데이터 로드
  useEffect(() => {
    const fetchPOIData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('POI 데이터 로딩 시작...');
        
        // fetch 요청
        const response = await fetch('https://raw.githubusercontent.com/KIMSANGWOO518/poi-monitoring/blob/main/json/Fix_Franchise.json');
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response length:', text.length);
        console.log('First 200 chars:', text.substring(0, 200));
        
        // JSON 파싱 시도
        let data;
        try {
          data = JSON.parse(text);
          console.log('Data parsed successfully');
          console.log('Data type:', typeof data);
          console.log('Is Array:', Array.isArray(data));
          
          if (Array.isArray(data)) {
            console.log('Data length:', data.length);
            console.log('First item:', data[0]);
            setPoiData(data);
            setError(null); // 성공시 에러 클리어
          } else {
            throw new Error('데이터가 배열 형식이 아닙니다.');
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          throw new Error('JSON 파싱 실패: ' + parseError);
        }
        
      } catch (err) {
        console.error('전체 오류:', err);
        
        // 더 자세한 오류 메시지
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('네트워크 오류: CORS 정책 또는 네트워크 연결을 확인하세요.');
        } else if (err instanceof SyntaxError) {
          setError('데이터 형식 오류: JSON 파싱 실패');
        } else {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 컴포넌트 마운트 후 약간의 딜레이를 주고 실행
    const timer = setTimeout(() => {
      fetchPOIData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 지도 중심 좌표 계산 (데이터가 있을 경우 첫 번째 POI 위치로)
  const getMapCenter = (): [number, number] => {
    if (poiData.length > 0) {
      return [
        parseFloat(poiData[0].Store_lat),
        parseFloat(poiData[0].Store_long)
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

        {/* 데이터 상태 및 범례 표시 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">
            프랜차이즈 매장 위치 모니터링
          </h2>
          <div className="flex items-center gap-6">
            {/* 범례 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B008B' }}></span>
                <span>커피빈</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00FF00' }}></span>
                <span>스타벅스</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF0000' }}></span>
                <span>투썸플레이스</span>
              </div>
            </div>
            {/* 데이터 상태 */}
            <div className="text-sm text-gray-600">
              {isLoading ? (
                <span>데이터 로딩 중...</span>
              ) : error ? (
                <span className="text-red-600">오류: {error}</span>
              ) : (
                <span>총 {poiData.length}개 매장</span>
              )}
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
              
              {/* POI 원형 마커 표시 */}
              {poiData.map((poi, index) => {
                const lat = parseFloat(poi.Store_lat);
                const lng = parseFloat(poi.Store_long);
                
                // 유효한 좌표인지 확인
                if (isNaN(lat) || isNaN(lng)) {
                  return null;
                }
                
                return (
                  <CircleMarker 
                    key={index} 
                    center={[lat, lng]}
                    radius={8}
                    fillColor={getMarkerColor(poi.Franchise_name)}
                    color="#ffffff"
                    weight={2}
                    fillOpacity={0.8}
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
                                poi.status === '개점' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {poi.status}
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