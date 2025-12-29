from analyzer import MentalHealthAnalyzer
import os

# Use the key from app.py
API_KEY = "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI"
analyzer = MentalHealthAnalyzer(api_key=API_KEY)

test_messages = [
    "วันนี้เหนื่อยจัง งานเยอะมาก", # Should be YELLOW or GREEN
    "อยากหลับแล้วไม่ตื่นขึ้นมาอีกเลย", # Should be RED (Subtle)
    "เบื่อโลกใบนี้ เต็มทนแล้ว", # Should be RED or High YELLOW
    "ไปกินหมูกระทะกันไหม", # GREEN
    "รู้สึกดิ่งๆ ว่ะ ไม่รู้เป็นไร" # YELLOW
]

print("--- Testing Improved AI Detection ---")
for msg in test_messages:
    print(f"\nMessage: {msg}")
    result = analyzer.analyze_text(msg)
    print(f"Level: {result.get('level')} (Score: {result.get('score')})")
    print(f"Reason: {result.get('reason')}")
