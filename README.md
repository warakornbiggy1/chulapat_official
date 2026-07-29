# 🎪 CHULAPAT_OFFICIAL

เว็บไซต์ทีมกีฬาสี ธีม **Dark Circus สีแสด–ดำ** — static website (HTML/CSS/JS ล้วน ไม่มี backend/ฐานข้อมูล)
เนื้อหาหลักเป็นภาษาอังกฤษ ส่วนสโลแกนคงภาษาไทย: *"กิติศัพท์เกียงไกรยิ่งใหญ่เลื่องลือ มัจจุราชขานชื่อ เราคือแสดดำ"*

## หน้าเว็บ
| ไฟล์ | หน้า |
|------|------|
| `index.html` | Home (hero + โลโก้ + ไฮไลต์) |
| `about.html` | About |
| `members.html` | Members (กรองตามฝ่ายได้) |
| `jersey.html` | Jersey + ไซซ์ |
| `ourpost.html` | Our Post (โปสเตอร์ + ลิงก์ IG) |
| `history.html` | History (timeline ปีก่อนๆ) |
| `contact.html` | Contact + ฟอร์ม + QR Instagram |

## รูปภาพ (โฟลเดอร์ `assets/`)
ดึงจาก `chula/` มาย่อขนาดให้เหมาะกับเว็บแล้ว: `logo-mark.png` (โลโก้พื้นใส), `logo-ring.png` (โลโก้วงไฟ),
`post-coming-soon.jpg` (โปสเตอร์), `ig-qr.jpg` (QR Instagram) — โฟลเดอร์ `chula/` ต้นฉบับเก็บไว้เป็นสำรอง

## โซเชียล
Instagram: **@chulapat_official** — https://www.instagram.com/chulapat_official

## วิธีเปิดดู
- **เร็วที่สุด:** ดับเบิลคลิก `index.html` เปิดในเบราว์เซอร์
- **แนะนำ (ให้เมนู/ฟอนต์ทำงานครบ):** รันเซิร์ฟเวอร์ในเครื่อง เช่น
  ```powershell
  # ต้องมี Python
  python -m http.server 8080
  # แล้วเปิด http://localhost:8080
  ```

## การปรับแก้
- **สี/ธีม:** แก้ตัวแปรใน `css/styles.css` ส่วน `:root` (เช่น `--orange`, `--ink`)
- **เมนู / ฟุตเตอร์:** แก้ที่เดียวใน `js/main.js` (ตัวแปร `NAV_LINKS`) แล้วมีผลทุกหน้า
- **สมาชิก / เสื้อ / ประวัติ:** แก้เนื้อหาในไฟล์ HTML ของแต่ละหน้าได้ตรงๆ

## 🔒 หมายเหตุความปลอดภัย (ทำไว้ให้แล้ว)
- เป็น **static site** — ไม่มีเซิร์ฟเวอร์/ฐานข้อมูลให้โจมตี ลด attack surface และล่มยาก
- ตั้ง **Content-Security-Policy** ในทุกหน้า จำกัดที่มาของสคริปต์/สไตล์/ฟอนต์
- ไม่มี inline `<script>` และไม่ใช้ `eval` / `innerHTML` กับข้อมูลผู้ใช้ (ลด XSS)
- ฟอร์มติดต่อ validate ฝั่ง client และ **ยังไม่ส่งข้อมูลออกไปที่ใด**

### เมื่อจะนำขึ้นจริง (production) ควรทำเพิ่ม
1. **HTTPS เสมอ** — ใช้โฮสต์ที่บังคับ HTTPS (Netlify / Vercel / Cloudflare Pages / GitHub Pages)
2. **ต่อฟอร์มกับบริการที่ปลอดภัย** เช่น Formspree / Netlify Forms ที่มี CAPTCHA + rate-limit กันสแปม/บอท (อย่าเก็บข้อมูลเองถ้าไม่จำเป็น)
3. **ตั้ง security headers ที่ระดับโฮสต์** (HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy)
4. **ใช้ Cloudflare (ฟรี)** วางหน้าเว็บ ได้ทั้ง CDN กันเว็บล่มเวลาคนเข้าเยอะ + WAF/DDoS protection กันโดนยิง
5. ตรวจสิทธิ์ก่อนใส่ข้อมูลจริงของสมาชิก (ชื่อ/รูป) ตาม PDPA — ขอความยินยอมก่อนเผยแพร่

> ชื่อ/เบอร์/อีเมลในเว็บตอนนี้เป็น **ข้อมูลตัวอย่าง** เปลี่ยนเป็นของจริงก่อนใช้งาน
