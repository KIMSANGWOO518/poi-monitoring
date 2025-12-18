#!/usr/bin/env bash
set -euo pipefail

# ==============================
# 경로 설정
# ==============================
CRAWL_DIR="/mnt/c/Users/swkim518/Desktop/업무/Dynamic팀/크롤링/Franchise_div/py/최종_수정완료_251212"
REPO_DIR="/mnt/c/Users/swkim518/poi-monitoring"
OUTPUT_JSON="Fix_Franchise.json"

# ✅ Windows conda base python.exe (WSL 경로)
PY="/mnt/c/Users/swkim518/AppData/Local/anaconda3/python.exe"

LOCKFILE="/tmp/poi_monitoring.lock"
exec 200>"$LOCKFILE"
flock -n 200 || { echo "이미 실행 중 → 종료"; exit 0; }

echo "==[1] 크롤링 스크립트 실행 =="
cd "$CRAWL_DIR"

"$PY" 00.coffeebean2.py
"$PY" 00.star_ver6.py
"$PY" 00.twosome7.py
"$PY" 01.Franchise_combine_251212.py

echo "==[2] 결과물 repo로 복사 =="
cp "$CRAWL_DIR/$OUTPUT_JSON" "$REPO_DIR/json/$OUTPUT_JSON"

echo "==[3] git commit / push =="
cd "$REPO_DIR"

if [ -z "$(git status --porcelain)" ]; then
  echo "변경 없음 → 종료"
  exit 0
fi

git add "json/$OUTPUT_JSON"
git commit -m "auto: update franchise data $(date +%F_%H%M)"
git push origin main

echo "== 완료 =="
