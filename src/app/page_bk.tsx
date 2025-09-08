"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { User, Lock, LogOut } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-6xl mx-auto">
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
        
        {/* 지도 영역 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            
          </h2>
          <div className="w-[800px] h-[600px] mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg">         
            <MapContainer
              center={[37.5665, 126.9780]} // 서울 좌표
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[37.5665, 126.9780]}>
                <Popup>
                  서울, 대한민국
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">
            위의 지도는 OpenStreetMap을 사용합니다.
          </p>
        </div>
      </main>
    </div>
  );
}

// 메인 컴포넌트
export default function Home() {
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