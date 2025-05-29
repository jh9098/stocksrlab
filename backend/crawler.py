import requests
from bs4 import BeautifulSoup
import re

def crawl_naver_price(code: str, max_pages: int = 20):
    code = code.replace("A", "")
    url = f"https://finance.naver.com/item/sise_day.nhn?code={code}"
    headers = { "User-Agent": "Mozilla/5.0" }
    prices = []

    for page in range(1, max_pages + 1):
        res = requests.get(f"{url}&page={page}", headers=headers, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")
        rows = soup.select("table.type2 tr")  # type2 테이블에서만 tr 선택

        for row in rows:
            tds = row.select("td")
            if len(tds) != 7:
                continue  # 데이터 행이 아니면 패스

            try:
                # 날짜/가격 정보 추출
                date_raw = tds[0].text.strip()
                close_raw = tds[1].text.strip().replace(",", "")
                open_raw = tds[3].text.strip().replace(",", "")
                high_raw = tds[4].text.strip().replace(",", "")
                low_raw = tds[5].text.strip().replace(",", "")
                volume_raw = tds[6].text.strip().replace(",", "")

                # 날짜와 종가가 정상적으로 있는 행만 필터링
                if re.match(r"\d{4}\.\d{2}\.\d{2}", date_raw) and close_raw.isdigit():
                    prices.append({
                        "date": date_raw.replace(".", "-"),
                        "price": int(close_raw),
                        "open": int(open_raw),
                        "high": int(high_raw),
                        "low": int(low_raw),
                        "volume": int(volume_raw)
                    })
            except Exception as e:
                continue

    return prices
