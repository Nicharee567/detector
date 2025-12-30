# 🚀 Deployment Guide (คู่มือการนำเว็บไซต์ขึ้นออนไลน์)

เนื่องจากโปรเจกต์นี้มี 2 ส่วน (Frontend & Backend) เราต้องนำขึ้น 2 ที่แยกกันครับ

## ส่วนที่ 1: นำ Backend (Python) ขึ้น Render.com
*ทำส่วนนี้ก่อนเพื่อให้ได้ URL ของเซิร์ฟเวอร์*

1. **สมัคร/ล็อกอิน** ที่ [Render.com](https://render.com)
2. **สร้าง Web Service ใหม่**:
   - กดปุ่ม **New +** -> **Web Service**
   - เชื่อมต่อกับ Git Repository ของคุณ
3. **ตั้งค่า**:
   - **Name**: ตั้งชื่อ (เช่น `mental-health-api`)
   - **Root Directory**: `.` (ไม่ต้องแก้)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: เลือก Free
4. **Environment Variables** (ในหัวข้อ Advanced หรือ Environment):
   - กด **Add Environment Variable**
   - Key: `PYTHON_VERSION` | Value: `3.9.0` (แนะนำ)
   - Key: `JWT_SECRET_KEY` | Value: (ตั้งรหัสลับอะไรก็ได้ยาวๆ)
5. กด **Create Web Service** และรอจนกว่าจะขึ้นว่า **Live** 🟢
6. **Copy URL**: ด้านบนซ้าย (เช่น `https://mental-health-api.onrender.com`) เก็บไว้ใช้ในขั้นตอนที่ 2

---

## ส่วนที่ 2: นำ Frontend (Next.js) ขึ้น Vercel
*ส่วนหน้าเว็บที่เพื่อนจะกดเข้ามาดู*

1. **สมัคร/ล็อกอิน** ที่ [Vercel.com](https://vercel.com)
2. **Add New Project**:
   - กด **Add New...** -> **Project**
   - เลือก Git Repository เดิม
3. **Project Configuration**:
   - **Framework Preset**: Next.js (น่าจะเลือกให้อัตโนมัติ)
   - **Root Directory**: กด Edit -> เลือกโฟลเดอร์ `frontend/mental-next` 👈 (สำคัญมาก!)
4. **Environment Variables**:
   - กดขยายหัวข้อ Environment Variables
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: URL จากส่วนที่ 1 + `/api` (เช่น `https://mental-health-api.onrender.com/api`) 👈 อย่าลืมเติม /api ต่อท้าย
5. กด **Deploy**

---

## 🎉 เสร็จสิ้น!
เมื่อ Vercel ทำงานเสร็จ คุณจะได้ลิงก์ (เช่น `https://mental-health-project.vercel.app`) สามารถส่งให้เพื่อนดูได้เลย!

### ⚠️ หมายเหตุ
- **ข้อมูล**: เนื่องจากเราใช้ Database แบบไฟล์ (SQLite) บน Render แบบฟรี ข้อมูลที่บันทึกไว้อาจจะหายไปเมื่อเซิร์ฟเวอร์รีสตาร์ท (ซึ่งปกติของของฟรี) เหมาะสำหรับ Demo เท่านั้น
- **ความช้า**: Server ฟรีของ Render จะ "หลับ" ถ้าไม่มีคนเข้าสักพัก การเข้าครั้งแรกสุดอาจต้องรอ 50 วินาทีให้มันตื่นครับ
