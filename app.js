const ADMIN_PASSWORD = "jimmy0309!";
let activeCustomerId = null;
let passwordCustomerId = null;
let selectedCustomerIdForDeposit = null;
let language = localStorage.getItem("hangthong-language") || "ko";
let cachedCustomers = [];

const translations = {
  ko: { adminLogin:"관리자", loginTitle:"나의 금 적립금을<br />확인하세요.", loginDescription:"전화번호와 관리자에게 받은 비밀번호를 입력해 주세요.", phone:"전화번호", password:"비밀번호", viewSavings:"내 적립금 보기", forgotPassword:"비밀번호를 잊으셨다면 매장 관리자에게 문의해 주세요.", logout:"로그아웃", mySavings:"MY SAVINGS", customerTitle:"님의<br />금 적립 현황", depositAccount:"입금 계좌", bankName:"우리은행", accountHolder:"예금주 BANSOMBOON", totalSavings:"총 적립금", depositCount:"입금 횟수", recentDeposit:"최근 입금일", depositHistory:"입금 내역", adminPage:"관리자 페이지", adminDescription:"관리자 비밀번호를 입력해 주세요.", adminPassword:"관리자 비밀번호", login:"로그인", customerManagement:"CUSTOMER MANAGEMENT", manageSavings:"고객 적립금 관리", addCustomer:"+ 고객 등록", recordDeposit:"+ 입금 기록", editCustomer:"고객 정보 수정", addCustomerPlain:"고객 등록", serial:"시리얼번호", customerName:"고객 이름", initialPassword:"초기 비밀번호", registerCustomer:"고객 등록하기", cancel:"취소", chooseCustomer:"수정할 고객 선택", customerPassword:"고객 비밀번호", saveCustomer:"고객 정보 저장", recordDepositPlain:"입금 기록", customer:"고객", depositAmount:"입금 금액", depositDate:"입금 날짜", memo:"메모", optional:"(선택)", saveDeposit:"입금 내역 저장", registeredCustomers:"등록 고객", adminCheck:"관리자 확인", confirmAdmin:"고객 비밀번호를 확인하려면 관리자 비밀번호를 다시 입력해 주세요.", confirmPassword:"비밀번호 확인", serialExample:"예: 1001 또는 GOLD-001", nameExample:"홍길동", minFour:"4자 이상", amountExample:"예: 100000", cashDeposit:"예: 현금 입금", noDeposit:"아직 입금 내역이 없습니다.", lastDeposit:"최근 입금일", entries:"건", times:"회", people:"명", deposit:"입금", noHistory:"등록된 입금 내역이 없습니다.", noCustomers:"등록된 고객이 없습니다.", choose:"고객을 선택하세요", chooseEdit:"수정할 고객을 선택하세요", unregistered:"미등록", passwordCheck:"비밀번호 확인", invalidLogin:"전화번호 또는 비밀번호를 확인해 주세요.", invalidAdmin:"관리자 비밀번호가 올바르지 않습니다.", duplicatePhone:"이미 등록된 전화번호입니다.", duplicateSerial:"이미 사용 중인 시리얼번호입니다.", customerPasswordTitle:"님 비밀번호 확인", downloadPdf:"송금 내역 PDF 다운로드" },
  th: { adminLogin:"ผู้ดูแล", loginTitle:"ตรวจสอบยอดสะสมทอง<br />ของคุณ", loginDescription:"กรอกหมายเลขโทรศัพท์และรหัสผ่านที่ได้รับจากผู้ดูแลร้าน", phone:"หมายเลขโทรศัพท์", password:"รหัสผ่าน", viewSavings:"ดูยอดสะสมของฉัน", forgotPassword:"หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลร้าน", logout:"ออกจากระบบ", mySavings:"ยอดสะสมของฉัน", customerTitle:"<br />สถานะยอดสะสมทอง", depositAccount:"บัญชีสำหรับโอนเงิน", bankName:"ธนาคารอูรี", accountHolder:"ชื่อบัญชี BANSOMBOON", totalSavings:"ยอดสะสมทั้งหมด", depositCount:"จำนวนครั้งที่ฝาก", recentDeposit:"วันที่ฝากล่าสุด", depositHistory:"ประวัติการฝาก", adminPage:"หน้าผู้ดูแล", adminDescription:"กรอกรหัสผ่านผู้ดูแล", adminPassword:"รหัสผ่านผู้ดูแล", login:"เข้าสู่ระบบ", customerManagement:"จัดการลูกค้า", manageSavings:"จัดการยอดสะสมลูกค้า", addCustomer:"+ เพิ่มลูกค้า", recordDeposit:"+ บันทึกการฝาก", editCustomer:"แก้ไขข้อมูลลูกค้า", addCustomerPlain:"เพิ่มลูกค้า", serial:"หมายเลขซีเรียล", customerName:"ชื่อลูกค้า", initialPassword:"รหัสผ่านเริ่มต้น", registerCustomer:"ลงทะเบียนลูกค้า", cancel:"ยกเลิก", chooseCustomer:"เลือกลูกค้าที่จะแก้ไข", customerPassword:"รหัสผ่านลูกค้า", saveCustomer:"บันทึกข้อมูลลูกค้า", recordDepositPlain:"บันทึกการฝาก", customer:"ลูกค้า", depositAmount:"จำนวนเงินฝาก", depositDate:"วันที่ฝาก", memo:"หมายเหตุ", optional:"(ไม่บังคับ)", saveDeposit:"บันทึกประวัติการฝาก", registeredCustomers:"ลูกค้าที่ลงทะเบียน", adminCheck:"ยืนยันผู้ดูแล", confirmAdmin:"กรอกรหัสผ่านผู้ดูแลอีกครั้งเพื่อตรวจสอบรหัสผ่านลูกค้า", confirmPassword:"ยืนยันรหัสผ่าน", serialExample:"เช่น 1001 หรือ GOLD-001", nameExample:"สมชาย", minFour:"อย่างน้อย 4 ตัวอักษร", amountExample:"เช่น 100000", cashDeposit:"เช่น ฝากเงินสด", noDeposit:"ยังไม่มีรายการฝาก", lastDeposit:"วันที่ฝากล่าสุด", entries:"รายการ", times:"ครั้ง", people:"คน", deposit:"ฝากเงิน", noHistory:"ยังไม่มีประวัติการฝาก", noCustomers:"ยังไม่มีลูกค้าที่ลงทะเบียน", choose:"เลือกลูกค้า", chooseEdit:"เลือกลูกค้าที่จะแก้ไข", unregistered:"ยังไม่ลงทะเบียน", passwordCheck:"ตรวจสอบรหัสผ่าน", invalidLogin:"โปรดตรวจสอบหมายเลขโทรศัพท์หรือรหัสผ่าน", invalidAdmin:"รหัสผ่านผู้ดูแลไม่ถูกต้อง", duplicatePhone:"หมายเลขโทรศัพท์นี้ลงทะเบียนแล้ว", duplicateSerial:"หมายเลขซีเรียลนี้ถูกใช้แล้ว", customerPasswordTitle:" ตรวจสอบรหัสผ่าน", downloadPdf:"ดาวน์โหลดประวัติการโอน PDF" }
};
const fallbackTranslations = { ko:{address:"주소",addressExample:"주소를 정확히 입력하세요"}, th:{address:"ที่อยู่",addressExample:"กรุณากรอกที่อยู่ให้ถูกต้องค่ะ"} };
const t = key => translations[language][key] || fallbackTranslations[language][key] || key;
const money = value => new Intl.NumberFormat(language === "th" ? "th-TH" : "ko-KR").format(value) + (language === "th" ? " บาท" : "원");
const formatDate = value => new Intl.DateTimeFormat(language === "th" ? "th-TH" : "ko-KR", { year:"numeric", month:"long", day:"numeric" }).format(new Date(`${value}T00:00:00`));

const phone = value => value.replace(/[^0-9]/g, "");
const today = () => new Date().toISOString().slice(0, 10);

// --- Netlify & Supabase API 통신 함수 ---
async function fetchCustomersFromDB() {
  try {
    const res = await fetch('/.netlify/functions/get-customers');
    if (!res.ok) throw new Error('데이터 불러오기 실패');
    cachedCustomers = await res.json();
    return cachedCustomers;
  } catch (err) {
    console.error('API Error:', err);
    return cachedCustomers;
  }
}

async function saveCustomerToDB(customerData) {
  const res = await fetch('/.netlify/functions/save-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || '고객 저장 실패');
  }
  return await res.json();
}

async function saveDepositToDB(depositData) {
  console.log("-> saveDepositToDB 실행 시도:", depositData);
  const res = await fetch('/.netlify/functions/save-deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(depositData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `서버 에러 (${res.status})`);
  }
  return await res.json();
}

async function fetchDepositsFromDB(serial) {
  try {
    const response = await fetch(`/.netlify/functions/get-deposits?serial=${encodeURIComponent(serial)}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || '입금 내역 불러오기 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    alert('입금 내역 조회 오류: ' + error.message);
    return [];
  }
}

function setLanguage(next) { 
  language=next; 
  localStorage.setItem("hangthong-language", language); 
  document.documentElement.lang=language; 
  document.querySelectorAll("[data-i18n]").forEach(el=>el.childNodes.forEach(node=>{ if(node.nodeType===3 && node.textContent.trim()) node.textContent=t(el.dataset.i18n); })); 
  document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml)); 
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder)); 
  document.querySelectorAll(".language-button").forEach(button=>button.classList.toggle("active", button.dataset.language===language)); 
  if(activeCustomerId) renderCustomer(); 
  if(!document.getElementById("admin-dashboard")?.classList.contains("hidden")) renderAdmin(); 
}

function reportCanvas(customer, rows, page, pageCount) {
  const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d"), width=1240, height=1754, pad=88; canvas.width=width; canvas.height=height;
  ctx.fillStyle="#fffaf0"; ctx.fillRect(0,0,width,height); ctx.fillStyle="#7b0712"; ctx.fillRect(0,0,width,220); ctx.fillStyle="#e8bb43"; ctx.fillRect(0,212,width,8);
  ctx.fillStyle="#ffe7a0"; ctx.font="700 31px Arial"; ctx.fillText("HANGTHONG SOMBOON",pad,77); ctx.fillStyle="#fff"; ctx.font="700 46px 'Noto Sans Thai','Noto Sans KR',Arial"; ctx.fillText(t("downloadPdf").replace(" PDF 다운로드","").replace(" PDF", ""),pad,145);
  ctx.fillStyle="#3c1014"; ctx.font="700 35px 'Noto Sans Thai','Noto Sans KR',Arial"; ctx.fillText(`${t("customerName")}: ${customer.name}`,pad,300); ctx.font="500 25px 'Noto Sans Thai','Noto Sans KR',Arial"; ctx.fillStyle="#725456"; ctx.fillText(`${t("phone")}: ${customer.phone}`,pad,344); ctx.fillText(`${t("address")}: ${customer.address || "-"}`,pad,387); ctx.fillText(`${t("totalSavings")}: ${money(totals(customer).total)}`,pad,430);
  const top=490; ctx.fillStyle="#7b0712"; ctx.fillRect(pad,top,width-pad*2,58); ctx.fillStyle="#fff"; ctx.font="700 23px 'Noto Sans Thai','Noto Sans KR',Arial"; ctx.fillText(t("depositDate"),pad+26,top+38); ctx.fillText(t("memo"),pad+350,top+38); ctx.textAlign="right"; ctx.fillText(t("depositAmount"),width-pad-26,top+38); ctx.textAlign="left";
  let y=top+58; rows.forEach((d,index)=>{ ctx.fillStyle=index%2 ? "#fffdf8" : "#fff4dc"; ctx.fillRect(pad,y,width-pad*2,62); ctx.fillStyle="#3c1014"; ctx.font="500 22px 'Noto Sans Thai','Noto Sans KR',Arial"; ctx.fillText(formatDate(d.date),pad+26,y+39); ctx.fillText(d.note || d.memo || t("deposit"),pad+350,y+39); ctx.textAlign="right"; ctx.font="700 22px Arial"; ctx.fillText(`+${money(d.amount)}`,width-pad-26,y+39); ctx.textAlign="left"; y+=62; });
  ctx.fillStyle="#8a6b6d"; ctx.font="500 19px Arial"; ctx.textAlign="center"; ctx.fillText(`${page} / ${pageCount}`,width/2,height-60); ctx.textAlign="left"; return canvas;
}
function bytesFromDataUrl(dataUrl) { const raw=atob(dataUrl.split(",")[1]), bytes=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i); return bytes; }
function downloadPdfFromJpegs(jpegs) {
  const encoder=new TextEncoder(), parts=[], offsets=[], addText=text=>parts.push(encoder.encode(text)), addBytes=bytes=>parts.push(bytes), length=()=>parts.reduce((sum,p)=>sum+p.length,0), addObject=(id,content)=>{ offsets[id]=length(); addText(`${id} 0 obj\n${content}\nendobj\n`); }, addImage=(id,jpeg)=>{ offsets[id]=length(); addText(`${id} 0 obj\n<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); addBytes(jpeg); addText("\nendstream\nendobj\n"); };
  addText("%PDF-1.4\n%"); addBytes(new Uint8Array([255,255,255,255])); addText("\n"); const count=jpegs.length, firstPage=3, firstImage=firstPage+count*2; addObject(1,"<< /Type /Catalog /Pages 2 0 R >>"); addObject(2,`<< /Type /Pages /Kids [${Array.from({length:count},(_,i)=>`${firstPage+i*2} 0 R`).join(" ")}] /Count ${count} >>`); jpegs.forEach((jpeg,i)=>{const page=firstPage+i*2,image=firstImage+i,content=page+1,stream=`q\n595 0 0 842 0 0 cm\n/Im${i} Do\nQ\n`; addObject(page,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im${i} ${image} 0 R >> >> /Contents ${content} 0 R >>`); addObject(content,`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`); addImage(image,jpeg); }); const xref=length(); addText(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`); for(let i=1;i<offsets.length;i++) addText(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`); addText(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`); const url=URL.createObjectURL(new Blob(parts,{type:"application/pdf"})), link=document.createElement("a"); link.href=url; link.download="Hangthong-Somboon-transfer-history.pdf"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function downloadCustomerPdf() { const customer=cachedCustomers.find(c=>String(c.id)===String(activeCustomerId) || String(c._id)===String(activeCustomerId)); if(!customer)return; await document.fonts.ready; const deposits=[...(customer.deposits||[])].sort((a,b)=>b.date.localeCompare(a.date)); const groups=deposits.length ? Array.from({length:Math.ceil(deposits.length/18)},(_,i)=>deposits.slice(i*18,i*18+18)) : [[]]; downloadPdfFromJpegs(groups.map((group,i)=>bytesFromDataUrl(reportCanvas(customer,group,i+1,groups.length).toDataURL("image/jpeg",.94)))); }

function show(id) { document.querySelectorAll(".screen").forEach(x => x.classList.add("hidden")); document.getElementById(id)?.classList.remove("hidden"); }
function totals(customer) { const deposits = customer.deposits || []; return { total:deposits.reduce((sum,d) => sum + Number(d.amount),0), count:deposits.length, recent:[...deposits].sort((a,b)=>b.date.localeCompare(a.date))[0] }; }
function depositRow(d) { return `<div class="deposit-row"><div><p>${formatDate(d.date)}</p><small>${d.note || d.memo || t("deposit")}</small></div><strong>+${money(d.amount)}</strong></div>`; }

async function renderCustomer() {
  await fetchCustomersFromDB();
  const customer = cachedCustomers.find(x => String(x.id) === String(activeCustomerId) || String(x._id) === String(activeCustomerId)); 
  if (!customer) return show("customer-login");
  const {total,count,recent} = totals(customer); 
  if(document.getElementById("customer-name")) document.getElementById("customer-name").textContent = customer.name; 
  if(document.getElementById("customer-total")) document.getElementById("customer-total").textContent = money(total); 
  if(document.getElementById("customer-count")) document.getElementById("customer-count").textContent = `${count}${t("times")}`; 
  if(document.getElementById("customer-recent")) document.getElementById("customer-recent").textContent = recent ? formatDate(recent.date) : "-"; 
  if(document.getElementById("customer-last-deposit")) document.getElementById("customer-last-deposit").textContent = recent ? `${t("lastDeposit")} ${formatDate(recent.date)}` : t("noDeposit"); 
  if(document.getElementById("deposit-count")) document.getElementById("deposit-count").textContent = `${count}${t("entries")}`;
  const list = document.getElementById("customer-deposit-list"); 
  if(list) list.innerHTML = count ? [...customer.deposits].sort((a,b)=>b.date.localeCompare(a.date)).map(depositRow).join("") : `<p class="empty">${t("noHistory")}</p>`; 
  show("customer-dashboard");
}

async function renderAdmin() {
  const customers = await fetchCustomersFromDB();
  const bySerial = [...customers].sort((a,b) => { if (!a.serial) return 1; if (!b.serial) return -1; return String(a.serial).localeCompare(String(b.serial), language, { numeric:true, sensitivity:"base" }); }); 
  
  const customerOptions = bySerial.map(x => {
    const cId = x.id || x._id;
    return `<option value="${cId}">[${x.serial || t("unregistered")}] ${x.name} · ${x.phone}</option>`;
  }).join(""); 

  const selectElements = document.querySelectorAll("#deposit-customer, #new-deposit-customer, #customer-select, select[name='customer']");
  selectElements.forEach(select => {
    if(select) select.innerHTML = `<option value="">${t("choose")}</option>` + customerOptions; 
  });

  if(document.getElementById("edit-customer-select")) document.getElementById("edit-customer-select").innerHTML = `<option value="">${t("chooseEdit")}</option>` + customerOptions; 
  if(document.getElementById("admin-customer-count")) document.getElementById("admin-customer-count").textContent = `${customers.length}${t("people")}`;
  
  const adminList = document.getElementById("admin-customer-list");
  if(adminList) {
    adminList.innerHTML = customers.length ? bySerial.map(c=>{
      const total=totals(c); 
      const cId = c.id || c._id;
      return `<div class="customer-row"><div><p>${c.name}</p><small>${t("serial")} ${c.serial || t("unregistered")} · ${c.phone} · ${total.count}${t("times")} ${t("deposit")}</small><div class="customer-buttons"><button class="password-check" data-customer-id="${cId}">${t("passwordCheck")}</button></div></div><strong>${money(total.total)}</strong></div>`; 
    }).join("") : `<p class="empty">${t("noCustomers")}</p>`; 
    document.querySelectorAll(".password-check").forEach(button => button.addEventListener("click", () => openPasswordModal(button.dataset.customerId)));
  }
  show("admin-dashboard");
}

function fillEditCustomer(customerId) {
  const customer=cachedCustomers.find(c=>String(c.id)===String(customerId) || String(c._id)===String(customerId)); 
  if(document.getElementById("edit-customer-id")) document.getElementById("edit-customer-id").value=customer ? (customer.id || customer._id) : ""; 
  if(document.getElementById("edit-serial")) document.getElementById("edit-serial").value=customer ? customer.serial || "" : ""; 
  if(document.getElementById("edit-name")) document.getElementById("edit-name").value=customer ? customer.name : ""; 
  if(document.getElementById("edit-phone")) document.getElementById("edit-phone").value=customer ? customer.phone : ""; 
  if(document.getElementById("edit-address")) document.getElementById("edit-address").value=customer ? customer.address || "" : ""; 
  if(document.getElementById("edit-password")) document.getElementById("edit-password").value=customer ? customer.password : ""; 
}

function openEditCustomer() { 
  document.getElementById("new-customer-form")?.classList.add("hidden"); 
  if(document.getElementById("edit-customer-select")) document.getElementById("edit-customer-select").value=""; 
  fillEditCustomer(""); 
  if(document.getElementById("edit-customer-error")) document.getElementById("edit-customer-error").textContent=""; 
  document.getElementById("edit-customer-form")?.classList.remove("hidden"); 
  document.getElementById("edit-customer-form")?.scrollIntoView({behavior:"smooth", block:"start"}); 
}

function openPasswordModal(customerId) { 
  passwordCustomerId=customerId; 
  const customer=cachedCustomers.find(c=>String(c.id)===String(customerId) || String(c._id)===String(customerId)); 
  if(document.getElementById("password-modal-title")) document.getElementById("password-modal-title").textContent=language === "th" ? `${t("passwordCheck")} ${customer?.name || ""}` : `${customer?.name || ""}${t("customerPasswordTitle")}`; 
  document.getElementById("password-confirm-form")?.classList.remove("hidden"); 
  document.getElementById("password-confirm-form")?.reset(); 
  if(document.getElementById("password-confirm-error")) document.getElementById("password-confirm-error").textContent=""; 
  document.getElementById("revealed-password")?.classList.add("hidden"); 
  document.getElementById("password-modal")?.classList.remove("hidden"); 
  setTimeout(()=>document.getElementById("password-confirm-input")?.focus(),0); 
}

function closePasswordModal() { 
  passwordCustomerId=null; 
  document.getElementById("password-modal")?.classList.add("hidden"); 
}

document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => show(button.dataset.view)));
document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language)));

document.getElementById("customer-login-form")?.addEventListener("submit", async e => { 
  e.preventDefault(); 
  const customers = await fetchCustomersFromDB();
  const phoneVal = document.getElementById("customer-phone")?.value || "";
  const passVal = document.getElementById("customer-password")?.value || "";
  const found = customers.find(c => c.phone === phone(phoneVal) && c.password === passVal); 
  const error = document.getElementById("customer-login-error"); 
  if (!found) { if(error) error.textContent=t("invalidLogin"); return; } 
  if(error) error.textContent=""; 
  activeCustomerId=found.id || found._id; 
  renderCustomer(); 
});

document.getElementById("admin-login-form")?.addEventListener("submit", async e => { 
  e.preventDefault(); 
  const error = document.getElementById("admin-login-error"); 
  const adminPassVal = document.getElementById("admin-password")?.value || "";
  if(adminPassVal !== ADMIN_PASSWORD) { if(error) error.textContent=t("invalidAdmin"); return; } 
  if(error) error.textContent=""; 
  await renderAdmin(); 
});

if(document.getElementById("customer-logout")) document.getElementById("customer-logout").onclick = () => { activeCustomerId=null; document.getElementById("customer-login-form")?.reset(); show("customer-login"); }; 
if(document.getElementById("admin-logout")) document.getElementById("admin-logout").onclick = () => { document.getElementById("admin-login-form")?.reset(); show("customer-login"); };
if(document.getElementById("download-pdf")) document.getElementById("download-pdf").onclick = downloadCustomerPdf;
document.querySelectorAll("[data-panel]").forEach(button => button.addEventListener("click", () => document.getElementById(`new-${button.dataset.panel}`)?.classList.toggle("hidden")));

// 신규 고객 등록 (Supabase DB 저장)
document.getElementById("new-customer-form")?.addEventListener("submit", async e => { 
  e.preventDefault(); 
  const customers = await fetchCustomersFromDB();
  const error = document.getElementById("new-customer-error");
  const newPhone = phone(document.getElementById("new-phone")?.value || "");
  const serial = (document.getElementById("new-serial")?.value || "").trim();

  if(customers.some(c=>c.phone===newPhone)){ if(error) error.textContent=t("duplicatePhone"); return; } 
  if(customers.some(c=>c.serial && c.serial.toLowerCase()===serial.toLowerCase())){ if(error) error.textContent=t("duplicateSerial"); return; } 

  const newCustomerData = {
    serial,
    name: (document.getElementById("new-name")?.value || "").trim(),
    phone: newPhone,
    address: (document.getElementById("new-address")?.value || "").trim(),
    password: document.getElementById("new-password")?.value || ""
  };

  try {
    await saveCustomerToDB(newCustomerData);
    e.target.reset();
    if(error) error.textContent = "";
    document.getElementById("new-customer-form")?.classList.add("hidden");
    await renderAdmin();
  } catch(err) {
    console.error(err);
    if(error) error.textContent = err.message || "저장 중 오류가 발생했습니다.";
  }
});

if(document.getElementById("cancel-edit-customer")) document.getElementById("cancel-edit-customer").onclick = () => document.getElementById("edit-customer-form")?.classList.add("hidden");
if(document.getElementById("open-edit-customer")) document.getElementById("open-edit-customer").onclick = openEditCustomer;
document.getElementById("edit-customer-select")?.addEventListener("change", e => { fillEditCustomer(e.target.value); if(document.getElementById("edit-customer-error")) document.getElementById("edit-customer-error").textContent=""; });

// 고객 정보 수정 (Supabase DB 저장)
document.getElementById("edit-customer-form")?.addEventListener("submit", async e => { 
  e.preventDefault(); 
  const customers = await fetchCustomersFromDB();
  const error = document.getElementById("edit-customer-error");
  const id = document.getElementById("edit-customer-id")?.value;
  const customer = customers.find(c=>String(c.id)===String(id) || String(c._id)===String(id));
  const serial = (document.getElementById("edit-serial")?.value || "").trim();
  const updatedPhone = phone(document.getElementById("edit-phone")?.value || "");

  if(!customer) return; 
  if(customers.some(c=>(String(c.id)!==String(id) && String(c._id)!==String(id)) && c.phone===updatedPhone)){ if(error) error.textContent=t("duplicatePhone"); return; } 
  if(customers.some(c=>(String(c.id)!==String(id) && String(c._id)!==String(id)) && c.serial && c.serial.toLowerCase()===serial.toLowerCase())){ if(error) error.textContent=t("duplicateSerial"); return; } 

  const updatedCustomerData = {
    id: id,
    serial,
    name: (document.getElementById("edit-name")?.value || "").trim(),
    phone: updatedPhone,
    address: (document.getElementById("edit-address")?.value || "").trim(),
    password: document.getElementById("edit-password")?.value || ""
  };

  try {
    await saveCustomerToDB(updatedCustomerData);
    document.getElementById("edit-customer-form")?.classList.add("hidden");
    if(error) error.textContent = "";
    await renderAdmin();
  } catch(err) {
    console.error(err);
    if(error) error.textContent = err.message || "수정 중 오류가 발생했습니다.";
  }
});

// 핵심 처리 로직: 입금 처리 함수
async function handleDepositSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // DOM 탐색
  const selectEl = document.querySelector("#deposit-customer, #new-deposit-customer, #customer-select, select[name='customer']");
  const customerId = selectEl ? selectEl.value : selectedCustomerIdForDeposit;

  if (!customerId || customerId === "" || customerId === "undefined") {
    alert("입금할 고객을 선택해 주세요.");
    return;
  }

  let customers = cachedCustomers.length ? cachedCustomers : await fetchCustomersFromDB();
  let customer = customers.find(c => String(c.id) === String(customerId) || String(c._id) === String(customerId));

  if (!customer) {
    customers = await fetchCustomersFromDB();
    customer = customers.find(c => String(c.id) === String(customerId) || String(c._id) === String(customerId));
  }

  if (!customer) {
    alert("선택한 고객 정보가 DB에 존재하지 않습니다.");
    await renderAdmin();
    return;
  }

  const amountInput = document.querySelector("#deposit-amount, #new-deposit-amount, input[name='amount']");
  const noteInput = document.querySelector("#deposit-note, #deposit-memo, #new-deposit-memo, input[name='memo']");
  const dateInput = document.querySelector("#deposit-date, #new-deposit-date, input[type='date']");

  const amount = amountInput ? Number(amountInput.value) : 0;
  const noteValue = noteInput ? noteInput.value.trim() : "";
  const dateValue = dateInput ? dateInput.value : today();

  if (!amount || amount <= 0) {
    alert("올바른 입금 금액을 입력해 주세요.");
    return;
  }

  const targetId = customer.id || customer._id;

  const depositData = {
    customer_id: targetId,
    customerId: targetId,
    serial: customer.serial || "",
    amount: amount,
    memo: noteValue,
    note: noteValue,
    date: dateValue,
    created_at: dateValue
  };

  try {
    await saveDepositToDB(depositData);
    
    selectedCustomerIdForDeposit = null;
    const form = selectEl?.closest("form");
    if (form) form.reset();
    
    if (dateInput) dateInput.value = today();
    
    document.getElementById("new-deposit-form")?.classList.add("hidden");
    document.getElementById("deposit-form")?.classList.add("hidden");
    
    await renderAdmin();
    alert("입금 내역이 성공적으로 저장되었습니다.");
  } catch(err) {
    console.error("Deposit Save Error:", err);
    alert(`입금 내역 저장 실패: ${err.message}`);
  }
}

// 이벤트 위임 처리: 클릭 및 서브밋 방지
document.addEventListener("click", function(e) {
  const target = e.target;
  if (target.matches("#save-deposit-btn, #new-deposit-form button[type='submit'], #deposit-form button[type='submit']") || target.closest("#save-deposit-btn")) {
    e.preventDefault();
    handleDepositSubmit(e);
  }
});

document.addEventListener("submit", function(e) {
  if (e.target.matches("#deposit-form, #new-deposit-form")) {
    e.preventDefault();
    handleDepositSubmit(e);
  }
});

if(document.getElementById("close-password-modal")) document.getElementById("close-password-modal").onclick = closePasswordModal;
document.getElementById("password-modal")?.addEventListener("click", e => { if(e.target.id === "password-modal") closePasswordModal(); });
document.getElementById("password-confirm-form")?.addEventListener("submit", e => { 
  e.preventDefault(); 
  const error = document.getElementById("password-confirm-error"); 
  const confirmInput = document.getElementById("password-confirm-input")?.value || "";
  if(confirmInput !== ADMIN_PASSWORD) { if(error) error.textContent=t("invalidAdmin"); return; } 
  const customer = cachedCustomers.find(c=>String(c.id)===String(passwordCustomerId) || String(c._id)===String(passwordCustomerId)); 
  if(!customer) return closePasswordModal(); 
  document.getElementById("password-confirm-form")?.classList.add("hidden"); 
  if(document.getElementById("revealed-password-value")) document.getElementById("revealed-password-value").textContent = customer.password; 
  document.getElementById("revealed-password")?.classList.remove("hidden"); 
});

// 입금 내역 수정 함수
async function handleEditDeposit(id, serial, currentAmount, currentMemo) {
  const newAmount = prompt('수정할 입금 금액을 입력하세요:', currentAmount);
  if (newAmount === null) return;

  const newMemo = prompt('수정할 메모를 입력하세요:', currentMemo);
  if (newMemo === null) return;

  const updatedDeposit = {
    id: id,
    serial: serial,
    amount: Number(newAmount),
    memo: newMemo,
    note: newMemo
  };

  try {
    await saveDepositToDB(updatedDeposit);
    alert('입금 내역이 수정되었습니다.');
    renderDepositList(serial);
  } catch (err) {
    console.error(err);
    alert(`입금 내역 수정 실패: ${err.message}`);
  }
}

async function renderDepositList(serial) {
  const container = document.getElementById('deposit-list-container');
  if (!container) return;
  container.innerHTML = '로딩 중...';

  const deposits = await fetchDepositsFromDB(serial);

  if (deposits.length === 0) {
    container.innerHTML = '<p>입금 내역이 없습니다.</p>';
    return;
  }

  let html = `
    <table class="deposit-table">
      <thead>
        <tr>
          <th>일시</th>
          <th>금액</th>
          <th>메모</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
  `;

  deposits.forEach(item => {
    const date = new Date(item.created_at || item.date).toLocaleDateString();
    html += `
      <tr>
        <td>${date}</td>
        <td>${Number(item.amount).toLocaleString()}원</td>
        <td>${item.memo || item.note || '-'}</td>
        <td>
          <button onclick="handleEditDeposit(${item.id}, '${item.serial}', ${item.amount}, '${item.memo || item.note || ''}')">수정</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// 초기화 실행
const initialDateEl = document.getElementById("deposit-date") || document.getElementById("new-deposit-date") || document.querySelector("input[type='date']");
if (initialDateEl) initialDateEl.value = today();
setLanguage(language);
