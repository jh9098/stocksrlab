import requests
from bs4 import BeautifulSoup

# User-Agent 설정 (크롤링 차단 방지용)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
}


# ✅ 국내 지수 크롤링 (KOSPI, KOSDAQ)
def fetch_korea_index(index_code):
    url = f"https://finance.naver.com/sise/sise_index.naver?code={index_code}"
    try:
        res = requests.get(url, headers=headers, timeout=5)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        price_tag = soup.select_one("div.rate_info div.today span.blind")
        change_tag = soup.select_one("div.rate_info span.tah.p11")

        if not price_tag or not change_tag:
            raise ValueError("셀렉터 결과 없음 (price_tag 또는 change_tag)")

        price = float(price_tag.text.strip().replace(",", ""))
        change_text = change_tag.text.strip().replace(",", "").replace("%", "")
        is_negative = "-" in change_text or "하락" in change_tag.text
        change = -float(change_text) if is_negative else float(change_text)

        return {"price": price, "change": change}

    except Exception as e:
        print(f"[ERROR] fetch_korea_index({index_code}) 실패: {e}")
        return None


# ✅ 해외 지수 크롤링 (NASDAQ, S&P500)
def fetch_world_index(symbol):
    url = f"https://finance.naver.com/world/sise.naver?symbol={symbol}"
    try:
        res = requests.get(url, headers=headers, timeout=5)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        price_tag = soup.select_one("div.rate_info div.today span.blind")
        change_tag = soup.select_one("div.rate_info span.tah.p11")

        if not price_tag or not change_tag:
            raise ValueError("셀렉터 결과 없음 (price_tag 또는 change_tag)")

        price = float(price_tag.text.strip().replace(",", ""))
        change_text = change_tag.text.strip().replace(",", "").replace("%", "")
        is_negative = "-" in change_text or "하락" in change_tag.text
        change = -float(change_text) if is_negative else float(change_text)

        return {"price": price, "change": change}

    except Exception as e:
        print(f"[ERROR] fetch_world_index({symbol}) 실패: {e}")
        return None


# ✅ 개별 종목 주가 크롤링
def fetch_stock_price(code):
    real_code = code.replace("A", "")  # 예: A005930 → 005930
    url = f"https://finance.naver.com/item/main.naver?code={real_code}"
    try:
        res = requests.get(url, headers=headers, timeout=5)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        price = soup.select_one("p.no_today span.blind").text.strip()
        change = soup.select("p.no_exday span.blind")[1].text.strip()  # 등락률

        return {
            "price": int(price.replace(",", "")),
            "change": float(change.replace(",", "").replace("%", ""))
        }
    except Exception as e:
        print(f"[ERROR] fetch_stock_price({code}) 실패: {e}")
        return None
