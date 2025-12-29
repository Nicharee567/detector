import os
from analyzer import MentalHealthAnalyzer

# Mock API Key if not present (will fail if not set in env)
if not os.environ.get("GEMINI_API_KEY"):
    os.environ["GEMINI_API_KEY"] = "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI"

analyzer = MentalHealthAnalyzer()

# Test Case: Sad Song
sad_song_url = "https://www.youtube.com/watch?v=k2qgadSvNyU" # Dua Lipa - New Rules (Example, maybe not sad but has title)
# Better sad song: "Billie Eilish - What Was I Made For?"
sad_song_url = "https://www.youtube.com/watch?v=cW8VLC9nnTo" # Billie Eilish - What Was I Made For?

message = f"ฟังเพลงนี้แล้วร้องไห้หนักมาก {sad_song_url}"

print(f"Analyzing message: {message}")
result = analyzer.analyze_text(message)

print("\n--- Analysis Result ---")
print(f"Level: {result.get('level')}")
print(f"Reason: {result.get('reason')}")
print(f"Content Type: {result.get('content_type')}")
print(f"Media Context: {result.get('media_context')}")

if result.get('content_type'):
    print("\n[SUCCESS] Content Type detected!")
else:
    print("\n[FAIL] Content Type NOT detected.")
