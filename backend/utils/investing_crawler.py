import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def fetch_index_full(url):
    try:
        res = requests.get(url, headers=headers, timeout=5)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        price = soup.select_one('[data-test="instrument-price-last"]')
        change = soup.select_one('[data-test="instrument-price-change"]')
        percent = soup.select_one('[data-test="instrument-price-change-percent"]')

        if not price or not change or not percent:
            raise ValueError("필수 데이터 누락")

        price_val = float(price.text.strip().replace(",", ""))
        change_val = float(change.text.strip().replace(",", "").replace("+", "").replace("−", "-"))
        percent_val = float(percent.text.strip().replace("(", "").replace(")", "").replace("%", "").replace("+", "").replace("−", "-"))

        return {
            "price": price_val,
            "change": change_val,
            "percent": percent_val
        }

    except Exception as e:
        print(f"[ERROR] {url} 크롤링 실패: {e}")
        return None
