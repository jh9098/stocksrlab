# backend/save_popular.py
import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path

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
        rate = cols[2].get_text(strip=True)
        price = cols[3].get_text(strip=True)
        code = cols[1].find("a")["href"].split("code=")[-1]

        result.append({
            "rank": int(rank),
            "name": name,
            "code": code,
            "rate": rate,
            "price": price
        })

        if len(result) == 10:  # Top 10만 저장
            break

    return result

if __name__ == "__main__":
    data = crawl_popular_stocks()
    output_path = Path(__file__).parent.parent / "frontend/src/data/popular.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ popular.json 저장 완료")
