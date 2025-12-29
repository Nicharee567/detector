import google.generativeai as genai
import re
from datetime import datetime
import json
import os
import io
from PIL import Image

class MentalHealthAnalyzer:
    def __init__(self, api_key=None, ai_provider='gemini'):
        """
        สร้างตัววิเคราะห์
        api_key: API Key (ฟรีจาก Google AI Studio)
        ai_provider: 'gemini' (ฟรี) หรือ 'claude' (มีค่าใช้จ่าย)
        """
        self.ai_provider = ai_provider
        
        # Try to get API key from env if not provided
        if not api_key:
            api_key = os.environ.get("GEMINI_API_KEY")

        if not api_key:
            print("Warning: No API Key provided. AI features will not work.")
            self.model = None
            return

        if ai_provider == 'gemini':
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
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
        if not self.model and self.ai_provider == 'gemini':
             return {
                'level': 'ERROR',
                'error': 'No API Key provided',
                'message': 'กรุณาใส่ API Key'
            }

        # 1. Check for YouTube Links & Context
        youtube_context = ""
        urls = self.check_url_in_text(message)
        if urls:
            for url in urls:
                if 'youtu' in url:
                    # Fetch Title
                    video_title = self.get_video_title(url)
                    youtube_context += f"\n[YouTube Video Title]: {video_title}"
                    
                    # Try to get transcript
                    try:
                        from youtube_transcript_api import YouTubeTranscriptApi
                        video_id = None
                        if 'youtu.be/' in url:
                            video_id = url.split('youtu.be/')[1].split('?')[0]
                        elif 'youtube.com/watch?v=' in url:
                            video_id = url.split('v=')[1].split('&')[0]
                        
                        if video_id:
                            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['th', 'en'])
                            full_text = " ".join([t['text'] for t in transcript])
                            youtube_context += f"\n[YouTube Transcript Summary]: {full_text[:1000]}..."
                    except Exception as e:
                        pass # Ignore transcript errors

        try:
            prompt = f"""คุณเป็นผู้เชี่ยวชาญด้านจิตเวชและสุขภาพจิต หน้าที่ของคุณคือวิเคราะห์ข้อความเพื่อหา "ความผิดปกติทางจิตและอารมณ์" (Abnormal Psychology)

วิเคราะห์ข้อความนี้: "{message}"
{youtube_context}

คำเตือนสำคัญ (Critical Instruction):
- ให้ระวัง "คำผิด" (Typos), "ภาษาวิบัติ", หรือ "การพิมพ์ผิดแบบนิ้วเบียด" (Fat-finger) ของภาษาไทย
- หากข้อความดูไม่มีความหมาย ให้พยายาม "เดาคำที่ถูกต้อง" ก่อน (เช่น "กเนข้านยีง" น่าจะมาจาก "กินข้าวยัง")
- หากเป็นแค่คำผิดหรือคำสแลงทั่วไป ให้จัดเป็น GREEN (ปกติ) อย่าเหมาว่าเป็น "การพูดจาสับสน" (Disorganized speech) ยกเว้นว่ามันดูหลุดโลกจริงๆ

เกณฑ์การประเมิน (Abnormal Psychology Spectra):
            1. RED (Danger/Severe Abnormalities): 
               - Harm to Self: Suicidal ideation, self-injury planning, hopeless fatalism.
               - Harm to Others (Antisocial/Psychopath): Threats, plans to kill/rape/torture, extreme cruelty, lack of empathy.
               - Severe Psychosis: Command hallucinations (voices telling to hurt), bizarre delusions.
               - Severe Paraphilias: Admission of illegal/non-consensual sexual acts (Pedophilia, Rape intent).
            
            2. YELLOW (Clinical Attention Needed):
               - Mood Disorders: Depression, Mania, Bipolar patterns.
               - Anxiety/OCD: Panic, Obsessive thoughts, Phobias affecting function.
               - Personality Disorders (Cluster A/B): Extreme paranoia, Narcissism with rage, instability (Borderline).
               - Sexual Deviance: Voyeurism mentions, stalking behavior, socially inappropriate sexual expression.
               - Heartbreak/Grief: Severe emotional distress but not yet dangerous.
               - **Observation**: Anything deviating significantly from social norms (Socially Deviant).
               - **Video context**: Sad or disturbing content shared.

3. GREEN (ปกติ):
   - อารมณ์ความรู้สึกของมนุษย์ทั่วไป
   - การบ่นเรื่องทั่วไป, คำหยาบคายทั่วไป, มุกตลก
   - **คำผิด, ภาษาวิบัติ, หรือข้อความสั้นๆ ที่อาจจะแค่พิมพ์ผิด**
   - การแชร์เพลงรัก, เพลงสนุก, หรือวิดีโอทั่วไป

ตอบเป็น JSON format เท่านั้น:
{{
    "level": "GREEN/YELLOW/RED",
    "score": 1-10 (1=ปกติ, 10=วิกฤต),
    "reason": "วิเคราะห์อาการ (หากเป็นคำผิด ให้ระบุว่าน่าจะพิมพ์ผิดจากคำว่าอะไร)",
    "keywords": ["คำที่ตรวจพบ"],
    "content_type": "Song/Vlog/News/Unknown (ระบุประเภทสื่อถ้ามี)",
    "media_context": "สรุปสั้นๆ เกี่ยวกับสื่อที่แนบมา (ถ้ามี)",
    "recommendation": "คำแนะนำ"
}}"""
            
            result_text = ""
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
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                # Fallback if JSON is malformed
                return {
                    'level': 'YELLOW',
                    'score': 5,
                    'reason': 'AI ตอบกลับผิดรูปแบบ แต่ควรเฝ้าระวังไว้ก่อน',
                    'raw_response': result_text
                }
            
            # เพิ่มข้อมูลเวลา
            result['timestamp'] = datetime.now().isoformat()
            result['original_message'] = message
            result['ai_provider'] = self.ai_provider
            
            return result
            
        except Exception as e:
            return {
                'level': 'ERROR',
                'score': 0,
                'reason': f"เกิดข้อผิดพลาด: {str(e)}",
                'error': str(e)
            }
    
    def check_url_in_text(self, message):
        """
        ตรวจหาลิงก์ใน message
        """
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, message)
        return urls
    
    def get_video_title(self, url):
        """
        ดึงชื่อคลิปจาก YouTube (เพื่อรู้ชื่อเพลง/บริบท)
        """
        try:
            import requests
            from bs4 import BeautifulSoup
            
            response = requests.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to get title from meta tags
            title = soup.find('meta', property='og:title')
            if title:
                return title['content']
            
            return "Unknown Video"
        except Exception as e:
            print(f"Error fetching title: {e}")
            return "Unknown Video"

    def analyze_youtube_url(self, url):
        """
        วิเคราะห์ลิงก์ YouTube (ชื่อคลิป + เนื้อหา/เนื้อเพลง)
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
            
            # 1. ดึงชื่อคลิป (สำคัญมาก เพราะบอกชื่อเพลง/อารมณ์ได้)
            video_title = self.get_video_title(url)
            
            # 2. ดึง subtitle/lyrics
            lyrics = ""
            try:
                transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['th', 'en'])
                lyrics = ' '.join([t['text'] for t in transcript])
            except Exception as e:
                lyrics = "(ไม่พบเนื้อเพลง/คำบรรยาย - วิเคราะห์จากชื่อคลิปแทน)"
            
            # 3. สร้าง Prompt สำหรับวิเคราะห์สื่อ
            analysis_message = f"""
            [วิเคราะห์สื่อที่ผู้ใช้กำลังรับชม/ฟัง]
            ประเภท: YouTube Video
            ชื่อคลิป: {video_title}
            เนื้อหา/เนื้อเพลง (บางส่วน): "{lyrics[:1500]}"
            
            คำสั่ง: วิเคราะห์ว่าเพลงหรือคลิปนี้สะท้อนอารมณ์หรือความเสี่ยงทางจิตใจของผู้แชร์อย่างไร?
            - เพลงเศร้า/อกหัก/อยากตาย หรือไม่?
            - เป็นคลิปข่าวด้านลบ/หดหู่ หรือไม่?
            - หรือเป็นแค่เพลงรัก/ตลก/ทั่วไป?
            """
            
            return self.analyze_text(analysis_message)
            
        except ImportError:
             return {'error': 'ไม่ได้ติดตั้ง youtube-transcript-api หรือ beautifulsoup4'}
        except Exception as e:
            return {'error': f'ไม่สามารถวิเคราะห์วิดีโอได้: {str(e)}'}

    def analyze_image(self, image_data):
        """
        วิเคราะห์รูปภาพหาความเสี่ยง (Self-harm, Depression, Threat)
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """
            คุณเป็นผู้เชี่ยวชาญด้านจิตเวชและนิติเวช (Forensic Psychiatrist)
            
            ภารกิจ: วิเคราะห์รูปภาพนี้เพื่อหา "สัญญาณอันตรายต่อชีวิตและจิตใจ"
            
            Things to detect (Critical Triggers - Abnormal Psychology):
            1. Risk to Self (Self-Harm/Suicide):
               - Cuts, blood, nooses, overdose, rooftop edges.
            2. Risk to Others (Violence/Antisocial):
               - Weapons (guns, knives) with threatening context.
               - Cruelty to animals (gore/torture).
               - Vandalism, Arson (fire starting).
            3. Sexual Deviance & Paraphilias (DSM-5 Categories):
               - Voyeurism (Upskirt/Spying), Exhibitionism (flashing).
               - Pedophilic interest context, Sexual Sadism/Masochism visuals.
            4. Bizarre/Disorganized Behavior (Psychosis/Schizophrenia):
               - Filth/Hoarding (extreme squalor).
               - Bizarre rituals, fecal matter, dead animals.
            5. Severe Distress:
               - Funeral selfies (inappropriate affect), extreme crying.

            Scoring Criteria (1-10):
            - RED (8-10): Clear evidence of Harm to Self, Harm to Others, Animal Cruelty, Sexual Deviance/Harassment. -> IMMEDIATE ALERT.
            - YELLOW (5-7): Bizarre/Eccentric behavior, Hoarding, Depressive atmosphere, Obsessive visuals.
            - GREEN (1-4): Normal human behavior, hobbies, food, landscapes.

            Response Format (JSON):
            {
                "level": "GREEN/YELLOW/RED",
                "score": 1-10,
                "reason": "อธิบายสิ่งที่เห็นในภาพที่เป็นความเสี่ยง",
                "keywords": ["สิ่งที่ตรวจเจอ เช่น มีด, เลือด, รอยแผล"],
                "recommendation": "คำแนะนำเบื้องต้น"
            }
            """

            response = self.model.generate_content([prompt, image])
            result_text = response.text
            
            # Clean JSON
            result_text = re.sub(r'```json\s*|\s*```', '', result_text).strip()
            result = json.loads(result_text)
            
            result['timestamp'] = datetime.now().isoformat()
            
            return result
            
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return {
                'level': 'YELLOW', # Error safe fallback
                'score': 5,
                'reason': 'ไม่สามารถวิเคราะห์ภาพได้ชัดเจน แต่ควรตรวจสอบ',
                'error': str(e)
            }
