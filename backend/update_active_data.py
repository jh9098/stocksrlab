import os
import json
from datetime import datetime
from pathlib import Path
from utils.naver_crawler import fetch_stock_price
from utils.investing_crawler import fetch_index_full
import shutil
from zoneinfo import ZoneInfo

STOCKS_DIR = Path("frontend/src/data/stocks")
MARKET_PATH = Path("frontend/src/data/market.json")

def get_progressing_stocks():
    progressing = []
    for file in STOCKS_DIR.glob("*.json"):
        try:
            with open(file, encoding="utf-8") as f:
                data = json.load(f)
            if data.get("status") == "진행중":
                progressing.append((file, data))
        except Exception as e:
            print(f"❌ {file.name} 읽기 실패: {e}")
    return progressing

def update_stock_prices():
    print("📈 진행중 종목 주가 업데이트 시작...")
    for file, data in get_progressing_stocks():
        try:
            price_info = fetch_stock_price(data["code"])
            if not price_info:
                print(f"⚠️ {data['code']} 시세 실패 (skip)")
                continue
            data["latestPrice"] = {
                "price": price_info["price"],
                "change": price_info["change"],
                "date": datetime.now().strftime("%Y-%m-%d %H:%M")
            }
            with open(file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ {data['code']} ({file.name}) 업데이트 완료")
        except Exception as e:
            print(f"❌ {file.name} 오류: {e}")

def update_market_json():
    print("🌍 Investing.com에서 지수 크롤링 중...")

    urls = {
        "S&P500": "https://www.investing.com/indices/us-spx-500",
        "NASDAQ": "https://www.investing.com/indices/nq-100",
        "KOSPI": "https://www.investing.com/indices/kospi",
        "KOSDAQ": "https://www.investing.com/indices/kosdaq"
    }

    market_data = {}
    for name, url in urls.items():
        result = fetch_index_full(url)
        market_data[name] = result if result else None

    market_data["updatedAt"] = datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d %H:%M")

    try:
        os.makedirs(MARKET_PATH.parent, exist_ok=True)
        with open(MARKET_PATH, "w", encoding="utf-8") as f:
            json.dump(market_data, f, ensure_ascii=False, indent=2)
        print(f"✅ market.json 생성 완료 → {MARKET_PATH}")
    except Exception as e:
        print(f"❌ market.json 저장 실패: {e}")
        
    # market.json 저장 후 추가
    try:
        os.makedirs("frontend/public/data", exist_ok=True)  # ✅ Netlify에 포함될 폴더
        shutil.copy("frontend/src/data/market.json", "frontend/public/data/market.json")  # ✅ 진짜 복사 대상
        print("📂 frontend/public/data/market.json 으로 복사 완료")
    except Exception as e:
        print(f"❌ frontend/public/data 복사 실패: {e}")




if __name__ == "__main__":
    update_stock_prices()
    update_market_json()
    print("\n🎉 모든 업데이트 완료")
