# 🎪 CHULAPAT_OFFICIAL

เว็บไซต์ทีมกีฬาสี ธีม **Dark Circus — BlackOrange** — static website (HTML/CSS/JS ล้วน ไม่มี backend/ฐานข้อมูล)
เนื้อหาหลักเป็นภาษาอังกฤษ ส่วนสโลแกนคงภาษาไทย: *"กิติศัพท์เกียงไกรยิ่งใหญ่เลื่องลือ มัจจุราชขานชื่อ เราคือแสดดำ"*

## หน้าเว็บ
| ไฟล์ | หน้า |
|------|------|
| `index.html` | Home (hero + โลโก้ + ไฮไลต์) |
| `about.html` | About |
| `members.html` | Members (กรองตามฝ่ายได้) |
| `jersey.html` | Jersey — 6 กีฬา กีฬาละ 1 แบบ (รูป model + รูปเสื้อ + ราคา + ปุ่ม Buy) |
| `ourpost.html` | Our Post (โปสเตอร์ + การ์ดโพสต์ IG) |
| `history.html` | History (ตอนนี้เป็น Coming Soon — รอข้อมูลจริง) |
| `contact.html` | Contact — ช่องทางติดต่อ + QR Instagram |

## รูปภาพ (โฟลเดอร์ `assets/`)
ดึงจาก `chula/` มาย่อขนาดให้เหมาะกับเว็บแล้ว: `logo-mark.png` (โลโก้พื้นใส), `logo-ring.png` (โลโก้วงไฟ),
`post-coming-soon.jpg` (โปสเตอร์), `ig-qr.jpg` (QR Instagram) — โฟลเดอร์ `chula/` ต้นฉบับเก็บไว้เป็นสำรอง

`assets/sports/*.svg` = ไอคอนกีฬา 6 ชนิด (วาดเป็นเส้น monoline สีทอง) — ถ้ามีโลโก้จริงให้ **เขียนทับไฟล์เดิมชื่อเดิม**
ได้เลย ไม่ต้องแก้ HTML

`assets/kit/*.webp` = รูปชุดกีฬา 12 ไฟล์ (`<กีฬา>-model.webp` = รูปนักกีฬาใส่จริง, `<กีฬา>-product.webp` = รูปเสื้อพื้นใส)
**อย่าแก้ไฟล์พวกนี้ตรงๆ** — สร้างจากไฟล์ต้นฉบับด้วยสคริปต์ (ดูหัวข้อ "สคริปต์" ด้านล่าง)

## แบรนด์
ชื่อเรียกอัตลักษณ์ทีมเขียนติดกันคำเดียวเสมอ: **BlackOrange** — คำเดียว ไม่มีวรรค ไม่มีเครื่องหมาย &
ในหน้าเว็บใช้ `<span class="wordmark">` เพื่อให้มีรอยต่อสี Black|Orange — ส่วนคำว่า "orange" ที่หมายถึง *สี* จริงๆ
(เช่น "bold orange home kit", ตัวแปร `--orange`) ไม่ต้องเปลี่ยน

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
- **ลิงก์ฟอร์มสั่งซื้อ:** แก้ที่เดียวที่ตัวแปร `ORDER_FORM_URL` ใน `js/main.js` — ทุกปุ่ม `data-buy` จะอัปเดตตาม
  (ใน HTML ใส่ href จริงไว้ด้วย เผื่อกรณีปิด JS)
- **โพสต์ IG:** เพิ่มบรรทัดเดียวในอาร์เรย์ `IG_POSTS` ที่ `js/ig-posts.js` (ดูคำอธิบายหัวไฟล์)
  รูปต้องวางใน `assets/` เท่านั้น เพราะ CSP ตั้งไว้ `img-src 'self'` —
  ถ้าจะดึงรูปโพสต์เก่าทั้งชุด อ่าน [`docs/instagram-posts.md`](docs/instagram-posts.md)
- **ราคาเสื้อ:** แก้ในบล็อก `.kit-prices` ของแต่ละกีฬาใน `jersey.html` ได้ตรงๆ
- **สมาชิก / เสื้อ / ประวัติ:** แก้เนื้อหาในไฟล์ HTML ของแต่ละหน้าได้ตรงๆ

## สคริปต์ (โฟลเดอร์ `tools/` — ไม่ได้ deploy ขึ้นเว็บ)
ต้องมี Python + Pillow (`pip install pillow`) แล้วรันจาก **โฟลเดอร์หลักของโปรเจกต์**

| สคริปต์ | ทำอะไร |
|---------|--------|
| `tools/build-kit-images.py` | แปลงรูปต้นฉบับใน `shirt-model/` → `public/assets/kit/*.webp` (12 MB → ~0.9 MB) |
| `tools/build-ig-posts.py` | แปลงไฟล์ export จาก Instagram → `public/assets/posts/*.webp` + อาร์เรย์ `IG_POSTS` |

> `shirt-model/` คือรูปต้นฉบับความละเอียดสูง — **ไม่ได้เก็บใน git** (อยู่ใน `.gitignore` เพราะใหญ่ 12 MB)
> เก็บไว้ในเครื่อง/ไดรฟ์ของทีม ถ้าจะสร้างรูปใหม่ต้องมีโฟลเดอร์นี้ก่อน

## 🔒 หมายเหตุความปลอดภัย (ทำไว้ให้แล้ว)
- เป็น **static site** — ไม่มีเซิร์ฟเวอร์/ฐานข้อมูลให้โจมตี ลด attack surface และล่มยาก
- ตั้ง **Content-Security-Policy** ในทุกหน้า จำกัดที่มาของสคริปต์/สไตล์/ฟอนต์
- ไม่มี inline `<script>` และไม่ใช้ `eval` / `innerHTML` กับข้อมูลผู้ใช้ (ลด XSS)
- ไม่มีฟอร์มรับข้อมูลบนเว็บเลย — ติดต่อผ่าน email / Instagram และสั่งซื้อผ่าน Google Form
  จึงไม่มีข้อมูลผู้ใช้ค้างอยู่ที่เว็บนี้

### เมื่อจะนำขึ้นจริง (production) ควรทำเพิ่ม
1. **HTTPS เสมอ** — ใช้โฮสต์ที่บังคับ HTTPS (Netlify / Vercel / Cloudflare Pages / GitHub Pages)
2. **ถ้าจะเพิ่มฟอร์มในอนาคต** ให้ต่อกับบริการที่มี CAPTCHA + rate-limit (เช่น Formspree / Netlify Forms) อย่าเก็บข้อมูลเอง
3. **ตั้ง security headers ที่ระดับโฮสต์** (HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy)
4. **ใช้ Cloudflare (ฟรี)** วางหน้าเว็บ ได้ทั้ง CDN กันเว็บล่มเวลาคนเข้าเยอะ + WAF/DDoS protection กันโดนยิง
5. ตรวจสิทธิ์ก่อนใส่ข้อมูลจริงของสมาชิก (ชื่อ/รูป) ตาม PDPA — ขอความยินยอมก่อนเผยแพร่

> ชื่อ/เบอร์/อีเมลในเว็บตอนนี้เป็น **ข้อมูลตัวอย่าง** เปลี่ยนเป็นของจริงก่อนใช้งาน
