from analyzer import MentalHealthAnalyzer
import os

# Initialize Analyzer
# Note: Ensure GEMINI_API_KEY is set in your environment or passed here
analyzer = MentalHealthAnalyzer()

def test_song(url, description):
    print(f"\n--- Testing: {description} ---")
    print(f"URL: {url}")
    
    # Simulate the logic in app.py where we detect URL and call analyze_youtube_url
    result = analyzer.analyze_youtube_url(url)
    
    print(f"Title Detected: {result.get('keywords', ['(Not in keywords)'])[0] if 'keywords' in result else 'N/A'}") # Title isn't directly returned in result dict unless we change analyze_text to return it, but let's check the analysis reason.
    print(f"Level: {result.get('level')}")
    print(f"Score: {result.get('score')}")
    print(f"Reason: {result.get('reason')}")
    print("-" * 30)

# Test Cases
# 1. Sad Song (e.g., "Gloomy Sunday" or a known sad Thai song)
# Using a placeholder URL for a sad song if possible, or a real one. 
# Let's use a well known sad song: "Billie Eilish - What Was I Made For?" or similar.
# Or a Thai sad song.
# Let's try: "Bodyslam - ความเชื่อ" (Inspirational/Positive) vs "Silly Fools - ผิดที่ไว้ใจ" (Sad/Betrayal)

# Test 1: Inspirational/Positive
test_song("https://www.youtube.com/watch?v=sysT6J6a5wM", "Bodyslam - ความเชื่อ (Inspirational)")

# Test 2: Sad/Depressive context (Simulated with a known sad song if available, or just check if it reads lyrics)
# "Billie Eilish - What Was I Made For?"
test_song("https://www.youtube.com/watch?v=cW8VLC9nnTo", "Billie Eilish - What Was I Made For? (Sad/Reflective)")
