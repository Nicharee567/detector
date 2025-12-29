from analyzer import MentalHealthAnalyzer
import os
import traceback

# Use the key from app.py (hardcoded by user)
API_KEY = "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI"

print(f"Testing with Key: {API_KEY[:10]}...")

try:
    analyzer = MentalHealthAnalyzer(api_key=API_KEY)
    print("Analyzer initialized.")
    result = analyzer.analyze_text("อยากตาย")
    print("\n--- Result ---")
    print(result)
except Exception:
    traceback.print_exc()
