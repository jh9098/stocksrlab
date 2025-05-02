import os
import json
from crawler import crawl_naver_price
from datetime import datetime

CRAWLED_DIR = "./frontend/src/data/crawled"
INDEX_PATH = os.path.join(CRAWLED_DIR, "index.json")

def load_existing_index():
    if not os.path.exists(INDEX_PATH):
        return {}

    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def update_one_stock(code, existing_prices):
    # A000020 → A000020
    full_code = "A" + code
    latest = crawl_naver_price(full_code, max_pages=5)

    last_date = existing_prices[-1]["date"] if existing_prices else "1900-01-01"
    new_data = [p for p in latest if p["date"] > last_date]

    if not new_data:
        print(f"⏩ {code}: 새 데이터 없음 (마지막 날짜 {last_date})")
        return existing_prices

    merged = existing_prices + new_data
    merged = sorted(merged, key=lambda x: x["date"])

    print(f"✅ {code} 업데이트 완료 (+{len(new_data)}건)")
    return merged

def update_all_crawled():
    # 기존 index.json 불러오기
    index_data = load_existing_index()
    codes = sorted(index_data.keys())

    print(f"🔁 총 {len(codes)}개 종목 누적 업데이트 시작")

    for i, code in enumerate(codes):
        print(f"[{i+1}/{len(codes)}] {code}")
        try:
            existing = index_data.get(code, [])
            updated = update_one_stock(code, existing)
            index_data[code] = updated
        except Exception as e:
            print(f"❌ {code} 에러 발생: {e}")

    # 최종 index.json 저장
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\n✅ 전체 업데이트 완료! 저장 위치: {INDEX_PATH}")

if __name__ == "__main__":
    update_all_crawled()
