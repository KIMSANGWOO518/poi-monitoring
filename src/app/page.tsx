"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          공간플랫폼개발그룹 POI M
        </h1>
        
        {/* 방법 1: React Leaflet 사용 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            React Leaflet을 사용한 지도
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