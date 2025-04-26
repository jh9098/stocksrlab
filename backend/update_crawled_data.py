import os
import json
from crawler import crawl_naver_price
from datetime import datetime

CRAWLED_DIR = "./frontend/src/data/crawled"

def load_existing_prices(code):
    path = os.path.join(CRAWLED_DIR, f"{code}.json")
    if not os.path.exists(path):
        return [], "1900-01-01"

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        prices = data.get("prices", [])
        last_date = prices[-1]["date"] if prices else "1900-01-01"
        return prices, last_date

def update_one_stock(code):
    existing, last_date = load_existing_prices(code)
    latest = crawl_naver_price("A" + code, max_pages=5)

    new_data = [
        p for p in latest
        if p["date"] > last_date
    ]

    if not new_data:
        print(f"⏩ {code}: 새 데이터 없음 (마지막 날짜 {last_date})")
        return

    merged = existing + new_data
    merged = sorted(merged, key=lambda x: x["date"])

    save_path = os.path.join(CRAWLED_DIR, f"{code}.json")
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump({
            "code": "A" + code,
            "prices": merged
        }, f, indent=2, ensure_ascii=False)

    print(f"✅ {code} 업데이트 완료 (+{len(new_data)}건)")

def update_all_crawled():
    codes = [
        fname.replace(".json", "")
        for fname in os.listdir(CRAWLED_DIR)
        if fname.endswith(".json")
    ]

    print(f"🔁 총 {len(codes)}개 종목 누적 업데이트 시작")
    for i, code in enumerate(codes):
        print(f"[{i+1}/{len(codes)}] {code}")
        try:
            update_one_stock(code)
        except Exception as e:
            print(f"❌ {code} 에러 발생: {e}")

if __name__ == "__main__":
    update_all_crawled()
