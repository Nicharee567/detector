#C:\project\detector\main.py
"""
ระบบตรวจสอบสุขภาพจิตผ่านโซเชียลมีเดีย
Version 2.0 - ใช้ Google Gemini (ฟรี 100%)
"""
import google.generativeai as genai
import re
from datetime import datetime
import json
# ===============================
# ขั้นตอนที่ 1: ตั้งค่า API
# ===============================
class MentalHealthAnalyzer:
    def __init__(self, api_key, ai_provider='gemini'):
        """
        สร้างตัววิเคราะห์
        api_key: API Key (ฟรีจาก Google AI Studio)
        ai_provider: 'gemini' (ฟรี) หรือ 'claude' (มีค่าใช้จ่าย)
        """
        self.ai_provider = ai_provider
        
        if ai_provider == 'gemini':
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        elif ai_provider == 'claude':
            import anthropic
            self.client = anthropic.Anthropic(api_key=api_key)
        
        self.risk_keywords = {
            'red': ['ฆ่าตัวตาย', 'อยากตาย', 'ไม่อยากมีชีวิต', 'หายไปจากโลก'],
            'yellow': ['เหนื่อย', 'ท้อแท้', 'โดดเดี่ยว', 'ไม่มีความหมาย'],
            'green': ['มีความสุข', 'ดีใจ', 'สนุก', 'รัก']
        }
    
    def analyze_text(self, message):
        """
        วิเคราะห์ข้อความด้วย AI
        """
        try:
            prompt = f"""คุณเป็นนักจิตวิทยาที่ช่วยประเมินความเสี่ยงด้านสุขภาพจิต
วิเคราะห์ข้อความนี้:
"{message}"
ให้คะแนนความเสี่ยง:
- GREEN (เขียว): ปลอดภัย ไม่มีสัญญาณเสี่ยง
- YELLOW (เหลือง): ควรเฝ้าระวัง มีความเครียดหรือทุกข์ใจ
- RED (แดง): อันตราย มีสัญญาณทำร้ายตนเองหรือคิดสั้น
ตอบเป็น JSON format นี้เท่านั้น (ไม่ต้องใส่ ```json):
{{
    "level": "GREEN/YELLOW/RED",
    "score": 1-10,
    "reason": "อธิบายสั้นๆ ภาษาไทย",
    "keywords": ["คำสำคัญ"],
    "recommendation": "คำแนะนำ"
}}"""
            
            if self.ai_provider == 'gemini':
                # ใช้ Google Gemini (ฟรี!)
                response = self.model.generate_content(prompt)
                result_text = response.text
            elif self.ai_provider == 'claude':
                # ใช้ Claude (มีค่าใช้จ่าย)
                response = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}]
                )
                result_text = response.content[0].text
            
            # ลบ ```json และ ``` ออก (ถ้ามี)
            result_text = re.sub(r'```json\s*|\s*```', '', result_text).strip()
            result = json.loads(result_text)
            
            # เพิ่มข้อมูลเวลา
            result['timestamp'] = datetime.now().isoformat()
            result['original_message'] = message
            result['ai_provider'] = self.ai_provider
            
            return result
            
        except Exception as e:
            return {
                'level': 'ERROR',
                'error': str(e),
                'message': 'ไม่สามารถวิเคราะห์ได้'
            }
    
    def check_url_in_text(self, message):
        """
        ตรวจหาลิงก์ใน message
        """
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, message)
        return urls
    
    def analyze_youtube_url(self, url):
        """
        วิเคราะห์ลิงก์ YouTube (ต้องติดตั้ง youtube-transcript-api)
        pip install youtube-transcript-api
        """
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            
            # ดึง video ID
            video_id = None
            if 'youtu.be/' in url:
                video_id = url.split('youtu.be/')[1].split('?')[0]
            elif 'youtube.com/watch?v=' in url:
                video_id = url.split('v=')[1].split('&')[0]
            
            if not video_id:
                return {'error': 'ไม่พบ video ID'}
            
            # ดึง subtitle/lyrics
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['th', 'en'])
            lyrics = ' '.join([t['text'] for t in transcript])
            
            # วิเคราะห์เนื้อเพลง
            return self.analyze_text(f"เนื้อเพลง: {lyrics[:500]}")  # วิเคราะห์ 500 ตัวอักษรแรก
            
        except Exception as e:
            return {'error': f'ไม่สามารถวิเคราะห์วิดีโอได้: {str(e)}'}
# ===============================
# ขั้นตอนที่ 2: ระบบจัดเก็บข้อมูล
# ===============================
class DataStorage:
    def __init__(self):
        """จัดเก็บข้อมูลในไฟล์ JSON (เริ่มต้นง่ายๆ)"""
        self.data_file = 'mental_health_data.json'
        self.load_data()
    
    def load_data(self):
        """โหลดข้อมูลจากไฟล์"""
        try:
            import json
            with open(self.data_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
        except FileNotFoundError:
            self.data = {'users': {}, 'analyses': []}
    
    def save_data(self):
        """บันทึกข้อมูลลงไฟล์"""
        import json
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
    
    def add_analysis(self, user_id, analysis_result):
        """เพิ่มผลการวิเคราะห์"""
        record = {
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'result': analysis_result
        }
        self.data['analyses'].append(record)
        self.save_data()
        return record
    
    def get_user_history(self, user_id):
        """ดูประวัติของผู้ใช้"""
        return [a for a in self.data['analyses'] if a['user_id'] == user_id]
# ===============================
# ขั้นตอนที่ 3: ทดสอบระบบ
# ===============================
def main():
    """ฟังก์ชันหลักสำหรับทดสอบ"""
    
    print("=" * 50)
    print("ระบบตรวจสอบสุขภาพจิต - Demo")
    print("=" * 50)
    
    # เลือกใช้ AI แบบไหน
    print("\n🤖 เลือก AI Provider:")
    print("1. Google Gemini (ฟรี 100%) ⭐ แนะนำ")
    print("2. Claude (มีค่าใช้จ่าย แต่ได้เครดิต $5)")
    
    choice = input("\nเลือก (1/2): ").strip()
    
    if choice == '1':
        # ใช้ Google Gemini (ฟรี!)
        API_KEY = "YOUR_GEMINI_API_KEY"  # ขอฟรีที่ aistudio.google.com
        ai_provider = 'gemini'
        print("✅ ใช้ Google Gemini (ฟรี)")
    else:
        # ใช้ Claude
        API_KEY = "YOUR_CLAUDE_API_KEY"  # console.anthropic.com
        ai_provider = 'claude'
        print("✅ ใช้ Claude")
    
    # สร้างตัววิเคราะห์
    analyzer = MentalHealthAnalyzer(API_KEY, ai_provider=ai_provider)
    storage = DataStorage()
    
    # ตัวอย่างข้อความทดสอบ
    test_messages = [
        "วันนี้อากาศดีมาก ไปเที่ยวสนุกจัง",
        "เหนื่อยมากๆ รู้สึกท้อแท้",
        "อยากหายไปจากโลกนี้ ไม่อยากมีชีวิตอีกแล้ว"
    ]
    
    print("\n🔍 เริ่มวิเคราะห์ข้อความ...\n")
    
    for idx, message in enumerate(test_messages, 1):
        print(f"\n--- ข้อความที่ {idx} ---")
        print(f"📝 ข้อความ: {message}")
        
        # วิเคราะห์
        result = analyzer.analyze_text(message)
        
        if result.get('level') != 'ERROR':
            level = result['level']
            emoji = {'GREEN': '🟢', 'YELLOW': '🟡', 'RED': '🔴'}.get(level, '⚪')
            
            print(f"{emoji} ระดับความเสี่ยง: {level}")
            print(f"📊 คะแนน: {result.get('score', 'N/A')}/10")
            print(f"💭 เหตุผล: {result.get('reason', 'N/A')}")
            print(f"💡 คำแนะนำ: {result.get('recommendation', 'N/A')}")
            
            # บันทึกลงฐานข้อมูล
            storage.add_analysis(f"user_{idx}", result)
        else:
            print(f"❌ Error: {result.get('error')}")
    
    print("\n" + "=" * 50)
    print("✅ การวิเคราะห์เสร็จสมบูรณ์")
    print(f"💾 ข้อมูลถูกบันทึกใน: {storage.data_file}")
    print("=" * 50)
if __name__ == "__main__":
    main()