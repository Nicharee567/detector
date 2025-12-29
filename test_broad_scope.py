from analyzer import MentalHealthAnalyzer
import os

# Use the key from app.py
API_KEY = "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI"
analyzer = MentalHealthAnalyzer(api_key=API_KEY)

test_messages = [
    "ฉันได้ยินเสียงคนกระซิบสั่งให้ทำร้ายคนอื่น", # Psychosis (RED)
    "ฉันคือพระเจ้าผู้สร้างโลกใบนี้ ไม่มีใครทำลายฉันได้", # Mania/Delusion (RED/YELLOW)
    "มีคนแอบติดกล้องไว้ในตาของฉัน ฉันต้องควักมันออก", # Severe Psychosis (RED)
    "ต้องล้างมือซ้ำๆ ไม่งั้นเชื้อโรคจะกินสมอง", # OCD (YELLOW)
    "วันนี้รถติดมาก หงุดหงิดชิบหาย", # Normal Anger (GREEN)
    "เศร้าจัง หมาตาย", # Normal Grief (GREEN/YELLOW)
    "อยากตาย ไม่อยากอยู่แล้ว" # Suicide (RED)
]

print("--- Testing Broader Mental Health Detection ---")
for msg in test_messages:
    print(f"\nMessage: {msg}")
    result = analyzer.analyze_text(msg)
    print(f"Level: {result.get('level')} (Score: {result.get('score')})")
    print(f"Reason: {result.get('reason')}")
