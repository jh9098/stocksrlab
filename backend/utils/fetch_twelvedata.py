import requests

API_KEY = "cdf98a65a2c44e60816bc3131d4a314a"

def fetch_index(symbol):
    url = f"https://api.twelvedata.com/quote?symbol={symbol}&apikey={API_KEY}"
    try:
        res = requests.get(url, timeout=5)
        res.raise_for_status()
        data = res.json()

        if "price" not in data:
            raise ValueError(f"API 응답 오류: {data}")

        return {
            "price": float(data["price"]),
            "change": float(data["percent_change"]),
        }
    except Exception as e:
        print(f"[ERROR] {symbol} 조회 실패: {e}")
        return None
