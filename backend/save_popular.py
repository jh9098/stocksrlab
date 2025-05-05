# backend/save_popular.py

import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

def crawl_popular_stocks():
    url = "https://finance.naver.com/sise/lastsearch2.naver"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    table = soup.find("table", class_="type_5")
    rows = table.find_all("tr")[2:]

    result = []
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 2:
            continue
        rank = cols[0].get_text(strip=True)
        name = cols[1].get_text(strip=True)
        rate = cols[5].get_text(strip=True)  # ✅ 등락률
        price = cols[3].get_text(strip=True)
        code = cols[1].find("a")["href"].split("code=")[-1]

        result.append({
            "rank": int(rank),
            "name": name,
            "code": code,
            "rate": rate,
            "price": price
        })

        if len(result) == 10:
            break

    return result

if __name__ == "__main__":
    # ✅ 크롤링
    top10_data_list = crawl_popular_stocks()
    
    # ✅ 시간 추가
    now = datetime.now(ZoneInfo("Asia/Seoul"))
    formatted_time = now.strftime("%Y.%m.%d %H시 %M분 기준")

    # ✅ 저장 경로
    output_path = Path(__file__).parent.parent / "frontend/src/data/popular.json"

    # ✅ 파일 저장
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "updatedAt": formatted_time,
            "stocks": top10_data_list
        }, f, indent=2, ensure_ascii=False)

    print("✅ popular.json 저장 완료")
