import os
import json

# 종목별 JSON 파일들이 있는 폴더 경로
input_folder = "./src/data/crawled"
# 통합하여 저장할 경로
output_file = "./src/data/crawled/index.json"

# 결과 저장용 딕셔너리
merged_data = {}

# 모든 .json 파일 순회
for filename in os.listdir(input_folder):
    if not filename.endswith(".json"):
        continue

    filepath = os.path.join(input_folder, filename)
    code = filename.replace(".json", "")

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            prices = data.get("prices", [])
            if isinstance(prices, list):
                merged_data[code] = prices
        except Exception as e:
            print(f"❌ {filename} 파싱 실패: {e}")

# 하나로 저장 (압축된 포맷으로)
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(merged_data, f, ensure_ascii=False, separators=(",", ":"))

print(f"✅ 통합 완료! 저장 위치: {output_file}")
