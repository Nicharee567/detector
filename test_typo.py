from analyzer import MentalHealthAnalyzer
import os

# Use the key from app.py
API_KEY = "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI"
analyzer = MentalHealthAnalyzer(api_key=API_KEY)

test_messages = [
    "กเนข้านยีง", # Typo for "กินข้าวยัง" (Should be GREEN)
    "หวัดดีคับ ทามไรอยุ่", # Slang (Should be GREEN)
    "ม่ายไหวแล้ว อยากตาย", # Typo + Suicide (Should be RED)
    "พิมไม่รุ้เรื่องเลย สมองเบลอไปหมด", # Confusion (YELLOW)
    "dfgfdgdfg", # Random keys (Should be GREEN/Ignored)
]

print("--- Testing Typo Handling ---")
for msg in test_messages:
    print(f"\nMessage: {msg}")
    result = analyzer.analyze_text(msg)
    print(f"Level: {result.get('level')} (Score: {result.get('score')})")
    print(f"Reason: {result.get('reason')}")
