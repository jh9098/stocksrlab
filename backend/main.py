from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from crawler import crawl_naver_price

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 최근 시세 약 200일치
@app.get("/price/{code}")
async def get_price(code: str):
    return crawl_naver_price(code, max_pages=20)

# ✅ 최신 1일 시세
@app.get("/price/latest/{code}")
async def get_latest_price(code: str):
    data = crawl_naver_price(code, max_pages=1)
    return data[0] if data else { "error": "No data available" }

# ✅ 건강 체크 (필요시)
@app.get("/health")
def health():
    return {"status": "ok"}
