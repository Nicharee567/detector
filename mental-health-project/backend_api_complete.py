# backend_api_complete.py

"""
Mental Health Analyzer Backend – Stable & Fixed
ใช้ Google Gemini Flash 1.5 (แนะนำ)
"""

import os
import json
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# -------------------------------------------------
# Load environment
# -------------------------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("❌ ERROR: Missing GEMINI_API_KEY in .env")

genai.configure(api_key=GEMINI_API_KEY)


# -------------------------------------------------
# FastAPI Setup
# -------------------------------------------------
app = FastAPI(
    title="Mental Health Analyzer",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Data Models
# -------------------------------------------------
class AnalysisRequest(BaseModel):
    text: str
    user_id: Optional[str] = None


class AnalysisResponse(BaseModel):
    level: str
    score: int
    reason: str
    keywords: List[str]
    recommendation: str
    timestamp: str
    original_message: str


# -------------------------------------------------
# Helper: score → level
# -------------------------------------------------
def get_level(score: int) -> str:
    if score <= 3:
        return "GREEN"
    elif score <= 6:
        return "YELLOW"
    return "RED"


# -------------------------------------------------
# Analyzer — FIXED version
# -------------------------------------------------
class MentalHealthAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel("models/gemini-1.5-flash")

    def extract_text(self, response):
        """
        Gemini อาจส่งคืนหลายแบบ:
        1. response.text
        2. response.candidates[0].content.parts
        3. response.content.parts
        ต้องรองรับทั้งหมด
        """

        # แบบ 1 — ง่ายสุด
        if hasattr(response, "text") and isinstance(response.text, str):
            return response.text

        # แบบ 2 — ผ่าน candidates
        if hasattr(response, "candidates"):
            try:
                return response.candidates[0].content.parts[0].text
            except:
                pass

        # แบบ 3 — ผ่าน content.parts
        if hasattr(response, "content") and hasattr(response.content, "parts"):
            try:
                return response.content.parts[0].text
            except:
                pass

        raise Exception("❌ Cannot extract text from Gemini response")

    def analyze_text(self, message: str):
        prompt = f"""
วิเคราะห์ข้อความ และตอบเป็น JSON เท่านั้น:

รูปแบบ:
{{
  "score": 1-10,
  "reason": "string",
  "keywords": ["word1", "word2"],
  "recommendation": "string"
}}

ข้อความ: "{message}"
"""

        try:
            response = self.model.generate_content(prompt)

            raw = self.extract_text(response).strip()
            print("\n===== RAW GEMINI RESPONSE =====")
            print(raw)
            print("================================\n")

            # หา JSON
            start = raw.find("{")
            end = raw.rfind("}") + 1
            raw_json = raw[start:end]

            print("===== EXTRACTED JSON =====")
            print(raw_json)
            print("==========================\n")

            data = json.loads(raw_json)

            # เติมค่า
            data["level"] = get_level(data["score"])
            data["timestamp"] = datetime.now().isoformat()
            data["original_message"] = message

            return data

        except Exception as e:
            raise HTTPException(500, f"Analysis failed: {e}")


# -------------------------------------------------
# Create Analyzer
# -------------------------------------------------
analyzer = MentalHealthAnalyzer()


# -------------------------------------------------
# API ROUTES
# -------------------------------------------------
@app.post("/api/v1/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    return analyzer.analyze_text(request.text)


@app.get("/")
def root():
    return {"status": "OK", "api": "Mental Analyzer Running"}


# -------------------------------------------------
# Local Run
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend_api_complete:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
