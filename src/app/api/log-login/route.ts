// app/api/log-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 요청에서 로그인 정보 받기
    const body = await request.json();
    const { username } = body;

    // 로그 폴더 경로 (프로젝트 루트의 logs 폴더)
    const logsDir = path.join(process.cwd(), 'logs');
    
    // logs 폴더가 없으면 만들기
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir, { recursive: true });
    }

    // 오늘 날짜로 파일명 만들기
    const today = new Date().toISOString().split('T')[0]; // 2025-01-15 형식
    const logFile = path.join(logsDir, `login-${today}.txt`);

    // 로그 내용 만들기
    const now = new Date();
    const koreanTime = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const logEntry = `[${koreanTime}] ${username} 로그인\n`;

    // 파일에 추가하기 (파일이 없으면 자동 생성)
    await fs.appendFile(logFile, logEntry);

    console.log(`✅ 로그 저장 완료: ${username}`);

    return NextResponse.json({ 
      success: true, 
      message: '로그인 기록 저장 완료' 
    });

  } catch (error) {
    console.error('❌ 로그 저장 실패:', error);
    return NextResponse.json(
      { success: false, error: '로그 저장 실패' },
      { status: 500 }
    );
  }
}