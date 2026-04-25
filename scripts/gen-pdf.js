/**
 * Generate "WealthHub คืออะไร" PDF
 * Run: node scripts/gen-pdf.js
 */
const puppeteer = require("puppeteer");
const path = require("path");

const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>WealthHub คืออะไร</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Sarabun", "Noto Sans Thai", "TH Sarabun New", -apple-system, sans-serif;
    color: #1e293b;
    line-height: 1.65;
    font-size: 13px;
    margin: 0;
  }
  h1 {
    color: #0ea5e9;
    font-size: 26px;
    margin: 0 0 4px;
    border-bottom: 3px solid #0ea5e9;
    padding-bottom: 10px;
  }
  .sub { color: #64748b; font-size: 12px; margin-bottom: 22px; }
  h2 {
    color: #0284c7;
    font-size: 17px;
    margin: 22px 0 10px;
    padding-left: 10px;
    border-left: 4px solid #0ea5e9;
  }
  p { margin: 6px 0 10px; }
  .hero {
    background: linear-gradient(135deg, #38bdf8, #0284c7);
    color: white;
    padding: 18px 22px;
    border-radius: 12px;
    margin-bottom: 18px;
  }
  .hero strong { font-size: 16px; display: block; margin-bottom: 6px; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 12px;
  }
  th, td {
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 600;
  }
  td.x { color: #dc2626; text-align: center; font-weight: 600; }
  td.o { color: #16a34a; text-align: center; font-weight: 600; }
  ul { margin: 8px 0; padding-left: 22px; }
  li { margin: 4px 0; }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    margin-right: 4px;
  }
  .badge.green { background: #dcfce7; color: #16a34a; }
  .badge.red { background: #fee2e2; color: #dc2626; }
  .quote {
    background: #f0f9ff;
    border-left: 4px solid #0ea5e9;
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #0c4a6e;
  }
  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 14px;
  }
  .examples span {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 11px;
  }
  .footer {
    margin-top: 24px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }
  .icon-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  .icon-row .ic {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #38bdf8, #0284c7);
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
    font-weight: 800;
    flex-shrink: 0;
  }
  .icon-row .meta strong { font-size: 14px; color: #0f172a; }
  .icon-row .meta div { font-size: 11px; color: #64748b; }
  .check { color: #16a34a; }
  .cross { color: #dc2626; }
</style>
</head>
<body>

<h1>WealthHub เป็นแอพเถื่อนหรือเปล่า?</h1>
<div class="sub">เอกสารอธิบาย Progressive Web App (PWA) สำหรับเพื่อนผู้สงสัย</div>

<div class="icon-row">
  <div class="ic">W</div>
  <div class="meta">
    <strong>WealthHub</strong>
    <div>แอปบริหารเงินส่วนตัว · เว็บไซต์ + PWA</div>
  </div>
</div>

<div class="hero">
  <strong>คำตอบสั้นๆ: ไม่ใช่แอพเถื่อนครับ ✅</strong>
  WealthHub เป็น "PWA" (Progressive Web App) — เว็บไซต์ปกติที่บราวเซอร์อนุญาตให้ติดตั้งเป็น shortcut บนหน้า Home เพื่อใช้งานเหมือนแอพ เป็นเทคโนโลยีมาตรฐานที่ Google และ Apple สนับสนุนอย่างเป็นทางการ
</div>

<h2>🆚 ต่างจากแอพเถื่อนยังไง</h2>
<table>
  <thead>
    <tr>
      <th style="width:35%">ประเด็น</th>
      <th style="width:32%">แอพเถื่อน (พ่ออ)</th>
      <th style="width:33%">PWA (WealthHub)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>ที่มา</b></td>
      <td>โหลด APK / IPA นอก Store, crack</td>
      <td>เปิดเว็บใน Chrome / Safari แล้วกดติดตั้ง</td>
    </tr>
    <tr>
      <td><b>ต้องเปิด "Unknown sources"</b></td>
      <td class="x">✓ ต้องเปิด</td>
      <td class="o">✗ ไม่ต้อง</td>
    </tr>
    <tr>
      <td><b>มี malware ได้</b></td>
      <td class="x">✓ เสี่ยงสูง</td>
      <td class="o">✗ รันใน sandbox ของบราวเซอร์</td>
    </tr>
    <tr>
      <td><b>เข้าถึงไฟล์ / contacts</b></td>
      <td class="x">✓ ขอ permission ทั้งหมด</td>
      <td class="o">✗ จำกัดมาก (sandbox)</td>
    </tr>
    <tr>
      <td><b>ละเมิดลิขสิทธิ์</b></td>
      <td class="x">✓ ส่วนใหญ่ใช่</td>
      <td class="o">✗ เขียนเอง 100%</td>
    </tr>
    <tr>
      <td><b>ผ่าน HTTPS</b></td>
      <td class="x">บางทีไม่มี</td>
      <td class="o">✓ บังคับ (Vercel ใช้ HTTPS)</td>
    </tr>
  </tbody>
</table>

<h2>🌟 แอพดังที่เป็น PWA เหมือนกัน</h2>
<p>ที่หลายคนใช้กันอยู่แล้วโดยไม่รู้ตัว:</p>
<div class="examples">
  <span>Twitter / X</span>
  <span>Spotify Web</span>
  <span>Pinterest</span>
  <span>Starbucks</span>
  <span>Uber</span>
  <span>Microsoft Teams</span>
  <span>Telegram Web</span>
  <span>Google Photos</span>
</div>
<p>ทั้งหมดเปิดเว็บแล้ว "Add to Home Screen" → ใช้งานเหมือนแอพได้ ไม่ต้องโหลดจาก Store</p>

<h2>🔒 ยืนยันความปลอดภัย</h2>
<ul>
  <li><b>เปิดผ่าน HTTPS</b> — ดูจากไอคอน 🔒 ตรงช่อง URL ของบราวเซอร์</li>
  <li><b>โฮสต์ที่ Vercel</b> — บริษัทโครงสร้างพื้นฐานเว็บที่น่าเชื่อถือ ใช้โดยบริษัทใหญ่ทั่วโลก</li>
  <li><b>ไม่ขอ permission อันตราย</b> — ไม่เข้าถึง Contacts / Photos / SMS / ตำแหน่ง</li>
  <li><b>Open source ดูได้</b> — โค้ดอยู่บน GitHub: <code>naypote500-netizen/wealthhub</code></li>
  <li><b>Apple / Google ไม่ blacklist</b> — ถ้าเป็นแอพอันตรายจริง ระบบจะเตือนตั้งแต่แรก</li>
</ul>

<h2>❓ ทำไมไม่ขึ้น App Store?</h2>
<p>เพราะการขึ้น Apple App Store ต้อง:</p>
<ul>
  <li>จ่าย Apple Developer fee <b>$99/ปี (~3,400 บาท)</b></li>
  <li>รอ review 2 - 4 สัปดาห์</li>
  <li>ต้องปฏิบัติตามกฎ Apple อย่างเคร่งครัด</li>
</ul>
<p>Google Play ก็ต้องเสียค่าสมัคร $25 ครั้งเดียว + รอ review</p>
<p><b>PWA ฟรี + เปิดใช้งานได้ทันที + อัปเดตอัตโนมัติทุกครั้งที่ deploy</b> เลยเหมาะกับ side project แบบนี้</p>

<h2>📱 วิธีติดตั้ง</h2>
<p><b>Android (Chrome):</b> เปิดเว็บ → กด ⋮ มุมขวาบน → "ติดตั้งแอป" → เสร็จ</p>
<p><b>iPhone (Safari เท่านั้น):</b> เปิดเว็บ → กดปุ่ม Share 📤 → "Add to Home Screen" → "Add" → เสร็จ</p>
<p style="font-size:11px;color:#64748b;">⚠️ บน iPhone ต้องใช้ Safari เท่านั้น Chrome บน iOS ติดตั้งไม่ได้ (Apple บังคับ)</p>

<h2>📝 สรุปสำหรับเพื่อน</h2>
<div class="quote">
  "มันคือเว็บไซต์ที่ติดตั้งเป็น shortcut ได้แค่นั้นเอง เหมือน Twitter PWA ที่หลายคนใช้กัน ปลอดภัย — ลองเปิดใน browser ปกติดูสิ ยังเป็นเว็บอยู่เลย"
</div>

<div class="footer">
  <span class="badge green">SAFE</span>
  <span class="badge green">HTTPS</span>
  <span class="badge green">OPEN SOURCE</span>
  <br><br>
  WealthHub © ${new Date().getFullYear()} · เอกสารนี้สร้างเมื่อ ${new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}
</div>

</body>
</html>`;

(async()=>{
  const browser = await puppeteer.launch({headless:"new"});
  const page = await browser.newPage();
  await page.setContent(html, {waitUntil:"networkidle0"});
  const out = path.join(__dirname, "..", "WealthHub-คืออะไร.pdf");
  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    margin: {top:"0", bottom:"0", left:"0", right:"0"}
  });
  await browser.close();
  console.log("✓ PDF saved:", out);
})().catch(e=>{console.error(e);process.exit(1)});
