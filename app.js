/******************************************************************
 HANGTHONG SOMBOON GOLD SAVINGS SYSTEM
 Version 3.0.0
 Fix: Updated Admin layout UI elements to use existing CSS classes
******************************************************************/

const ADMIN_PASSWORD = "jimmy0309!";

let activeCustomerId = null;
let passwordCustomerId = null;
let cachedCustomers = [];
let language = localStorage.getItem("hangthong-language") || "ko";

/* ===========================================================
   i18n TRANSLATION DICTIONARY
=========================================================== */

const translations = {
  ko: {
    adminLogin: "관리자 로그인",
    loginTitle: "나의 금 적립금을<br />확인하세요.",
    loginDescription: "전화번호와 관리자에게 받은 비밀번호를 입력해 주세요.",
    phone: "전화번호",
    password: "비밀번호",
    viewSavings: "내 적립금 보기",
    forgotPassword: "비밀번호를 잊으셨다면 매장 관리자에게 문의해 주세요.",
    logout: "로그아웃",
    mySavings: "MY SAVINGS",
    customerTitle: "님의<br />금 적립 현황",
    depositAccount: "입금 계좌",
    bankName: "우리은행",
    accountHolder: "예금주 BANSOMBOON",
    totalSavings: "총 적립금",
    depositCount: "입금 횟수",
    recentDeposit: "최근 입금일",
    depositHistory: "입금 내역",
    adminOnly: "ADMIN ONLY",
    adminPage: "관리자 페이지",
    adminDescription: "관리자 비밀번호를 입력해 주세요.",
    adminPassword: "관리자 비밀번호",
    login: "로그인",
    customerManagement: "CUSTOMER MANAGEMENT",
    manageSavings: "고객 적립금 관리",
    addCustomerPlain: "고객 등록",
    serial: "시리얼번호",
    customerName: "고객 이름",
    address: "주소",
    initialPassword: "초기 비밀번호",
    registerCustomer: "고객 등록하기",
    recordDepositPlain: "입금 기록",
    customer: "고객",
    depositAmount: "입금 금액",
    depositDate: "입금 날짜",
    memo: "메모",
    optional: "(선택)",
    saveDeposit: "입금 내역 저장",
    registeredCustomers: "등록 고객",
    totalSystemSavings: "총 적립 금액",
    adminCheck: "관리자 확인",
    confirmAdmin: "고객 비밀번호를 확인하려면 관리자 비밀번호를 다시 입력해 주세요.",
    confirmPassword: "비밀번호 확인",
    customerPassword: "고객 비밀번호",
    // Placeholders
    serialExample: "예: 1001 또는 GOLD-001",
    nameExample: "홍길동",
    addressExample: "예: 방콕 수쿰윗 1",
    minFour: "4자 이상",
    amountExample: "예: 100000",
    cashDeposit: "예: 현금 입금"
  },
  th: {
    adminLogin: "เข้าสู่ระบบผู้ดูแล",
    loginTitle: "ตรวจสอบเงินออมทอง<br />ของคุณ",
    loginDescription: "กรุณากรอกหมายเลขโทรศัพท์และรหัสผ่านที่ได้รับจากผู้ดูแล",
    phone: "หมายเลขโทรศัพท์",
    password: "รหัสผ่าน",
    viewSavings: "ดูเงินออมของฉัน",
    forgotPassword: "หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลร้าน",
    logout: "ออกจากระบบ",
    mySavings: "MY SAVINGS",
    customerTitle: "<br />สถานะการออมทอง",
    depositAccount: "บัญชีโอนเงิน",
    bankName: "ธนาคารอูรี (Woori Bank)",
    accountHolder: "ชื่อบัญชี BANSOMBOON",
    totalSavings: "ยอดออมรวม",
    depositCount: "จำนวนครั้งที่ฝาก",
    recentDeposit: "วันที่ฝากล่าสุด",
    depositHistory: "ประวัติการฝากเงิน",
    adminOnly: "ADMIN ONLY",
    adminPage: "หน้าผู้ดูแลระบบ",
    adminDescription: "กรุณากรอกรหัสผ่านผู้ดูแลระบบ",
    adminPassword: "รหัสผ่านผู้ดูแล",
    login: "เข้าสู่ระบบ",
    customerManagement: "CUSTOMER MANAGEMENT",
    manageSavings: "จัดการเงินออมลูกค้า",
    addCustomerPlain: "ลงทะเบียนลูกค้า",
    serial: "หมายเลขซีเรียล",
    customerName: "ชื่อลูกค้า",
    address: "ที่อยู่",
    initialPassword: "รหัสผ่านเริ่มต้น",
    registerCustomer: "ลงทะเบียนลูกค้า",
    recordDepositPlain: "บันทึกการฝากเงิน",
    customer: "ลูกค้า",
    depositAmount: "จำนวนเงินฝาก",
    depositDate: "วันที่ฝาก",
    memo: "บันทึกช่วยจำ",
    optional: "(เลือกได้)",
    saveDeposit: "บันทึกประวัติการฝาก",
    registeredCustomers: "ลูกค้าที่ลงทะเบียน",
    totalSystemSavings: "ยอดออมรวมทั้งหมด",
    adminCheck: "ยืนยันผู้ดูแลระบบ",
    confirmAdmin: "กรุณากรอกรหัสผ่านผู้ดูแลระบบอีกครั้งเพื่อตรวจสอบรหัสผ่านของลูกค้า",
    confirmPassword: "ยืนยันรหัสผ่าน",
    customerPassword: "รหัสผ่านลูกค้า",
    // Placeholders
    serialExample: "ตัวอย่าง: 1001 หรือ GOLD-001",
    nameExample: "ชื่อ-นามสกุล",
    addressExample: "ตัวอย่าง: กรุงเทพฯ สุขุมวิท 1",
    minFour: "4 ตัวอักษรขึ้นไป",
    amountExample: "ตัวอย่าง: 100000",
    cashDeposit: "ตัวอย่าง: เงินสด"
  }
};

/* ===========================================================
   COMMON UTILS
=========================================================== */

const phone = value => (value || "").replace(/[^0-9]/g, "");

const today = () => new Date().toISOString().slice(0, 10);

const money = value =>
  new Intl.NumberFormat(
    language === "th" ? "th-TH" : "ko-KR"
  ).format(Number(value || 0)) +
  (language === "th" ? " บาท" : "원");

const formatDate = value => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(
      language === "th" ? "th-TH" : "ko-KR",
      { year: "numeric", month: "long", day: "numeric" }
    ).format(new Date(value));
  } catch (e) {
    return value;
  }
};

const getCustomerId = customer => {
  if (!customer) return "";
  return String(customer.id ?? customer._id ?? customer.serial ?? "");
};

const getDepositId = deposit => {
  if (!deposit) return "";
  return String(deposit.id ?? deposit._id ?? deposit.deposit_id ?? "");
};

/* ===========================================================
   SUPABASE API
=========================================================== */

async function fetchCustomersFromDB() {
  try {
    const res = await fetch("/.netlify/functions/get-customers");
    if (!res.ok) throw new Error("고객 조회 실패");
    cachedCustomers = await res.json();
    return cachedCustomers;
  } catch (err) {
    console.error("fetchCustomersFromDB Error:", err);
    return [];
  }
}

async function saveCustomerToDB(customer) {
  const res = await fetch("/.netlify/functions/save-customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer)
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "고객 저장 실패");
  }
  return result;
}

async function saveDepositToDB(deposit) {
  const res = await fetch("/.netlify/functions/save-deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deposit)
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "입금 저장 실패");
  }
  return result;
}

async function deleteDepositFromDB(depositId) {
  if (!depositId || depositId === "undefined" || depositId === "null") {
    throw new Error("유효하지 않은 입금 ID입니다.");
  }
  const res = await fetch("/.netlify/functions/delete-deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: depositId })
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "입금 삭제 실패");
  }
  return result;
}

/* ===========================================================
   SCREEN & LANGUAGE NAVIGATION
=========================================================== */

function show(id) {
  console.log("화면 전환 ->", id);
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
  } else {
    console.error(`ID가 '${id}'인 화면 요소를 찾을 수 없습니다.`);
  }
}

function setLanguage(next) {
  language = next;
  localStorage.setItem("hangthong-language", language);
  document.documentElement.lang = language;
  
  document.querySelectorAll(".language-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.language === language);
  });

  const dict = translations[language] || translations.ko;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  if (activeCustomerId) {
    renderCustomer();
  }
}

/* ===========================================================
   RENDER LOGIC & PDF DOWNLOAD (ADMIN ONLY)
=========================================================== */

function totals(customer) {
  const deposits = customer.deposits || [];
  const total = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  
  const sorted = [...deposits].sort((a, b) => {
    const dateA = a.created_at || a.date || "";
    const dateB = b.created_at || b.date || "";
    return dateB.localeCompare(dateA);
  });

  return {
    total,
    count: deposits.length,
    recent: sorted[0]
  };
}

async function renderCustomer() {
  await fetchCustomersFromDB();
  
  const customer = cachedCustomers.find(c =>
    getCustomerId(c) === String(activeCustomerId)
  );

  if (!customer) {
    show("customer-login");
    return;
  }

  const info = totals(customer);

  const nameEl = document.getElementById("customer-name");
  const totalEl = document.getElementById("customer-total");
  const countEl = document.getElementById("customer-count");
  const recentEl = document.getElementById("customer-recent");

  if (nameEl) nameEl.textContent = customer.name;
  if (totalEl) totalEl.textContent = money(info.total);
  if (countEl) countEl.textContent = info.count + (language === "th" ? " ครั้ง" : "회");
  if (recentEl) recentEl.textContent = info.recent ? formatDate(info.recent.created_at || info.recent.date) : "-";

  const list = document.getElementById("customer-deposit-list");
  if (list) {
    list.innerHTML = "";
    if (!customer.deposits || customer.deposits.length === 0) {
      list.innerHTML = `<p class='empty'>${language === "th" ? "ไม่มีประวัติการฝากเงิน" : "입금 내역이 없습니다."}</p>`;
    } else {
      [...customer.deposits]
        .sort((a, b) => {
          const dateA = a.created_at || a.date || "";
          const dateB = b.created_at || b.date || "";
          return dateB.localeCompare(dateA);
        })
        .forEach(d => {
          const displayDate = d.created_at || d.date;
          list.innerHTML += `
            <div class="deposit-row">
              <div>
                <p>${formatDate(displayDate)}</p>
                <small>${d.memo || d.note || "-"}</small>
              </div>
              <strong>+${money(d.amount)}</strong>
            </div>
          `;
        });
    }
  }

  show("customer-dashboard");
}

function downloadDepositPDF(customerId) {
  const customer = cachedCustomers.find(c =>
    getCustomerId(c) === String(customerId)
  );

  if (!customer) {
    alert("고객 정보를 찾을 수 없습니다.");
    return;
  }

  const info = totals(customer);
  const sortedDeposits = [...(customer.deposits || [])].sort((a, b) => {
    const dateA = a.created_at || a.date || "";
    const dateB = b.created_at || b.date || "";
    return dateB.localeCompare(dateA);
  });

  let rowsHtml = sortedDeposits.map((d, index) => `
    <tr style="border-bottom: 1px solid #eee; text-align: center;">
      <td style="padding: 10px;">${index + 1}</td>
      <td style="padding: 10px;">${formatDate(d.created_at || d.date)}</td>
      <td style="padding: 10px;">${d.memo || d.note || '-'}</td>
      <td style="padding: 10px; font-weight: bold; text-align: right;">+${money(d.amount)}</td>
    </tr>
  `).join("");

  if (sortedDeposits.length === 0) {
    rowsHtml = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #888;">입금 내역이 없습니다.</td></tr>`;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("팝업 차단이 설정되어 있습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>입금내역서_${customer.name}_${today()}</title>
        <style>
          body { font-family: 'Apple SD Gothic Neo', sans-serif; padding: 30px; color: #333; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 15px; }
          .header h2 { margin: 0; color: #d4af37; font-size: 22px; }
          .header h3 { margin: 5px 0 0 0; color: #444; font-size: 16px; }
          .info-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
          .info-box p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #333; color: #fff; padding: 10px; text-align: center; }
          .footer { margin-top: 40px; text-align: right; font-size: 11px; color: #888; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>HANGTHONG SOMBOON GOLD SAVINGS</h2>
          <h3>입금/송금 내역서</h3>
        </div>
        
        <div class="info-box">
          <p><strong>고객명:</strong> ${customer.name}</p>
          <p><strong>고객번호(Serial):</strong> ${customer.serial || '-'}</p>
          <p><strong>전화번호:</strong> ${customer.phone || '-'}</p>
          <p><strong>총 적립금액:</strong> <span style="color:#d4af37; font-weight:bold;">${money(info.total)}</span> (총 ${info.count}회)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>NO</th>
              <th>일자</th>
              <th>적요/메모</th>
              <th style="text-align: right;">금액</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          발급일자: ${today()}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

async function renderAdmin() {
  console.log("관리자 데이터 렌더링 중...");
  const customers = await fetchCustomersFromDB();

  const sorted = [...customers].sort((a, b) =>
    String(a.serial || "").localeCompare(String(b.serial || ""), "ko", { numeric: true })
  );

  // 전체 고객의 적립 금액 합산
  const totalSystemAmount = customers.reduce((sum, customer) => {
    const info = totals(customer);
    return sum + info.total;
  }, 0);

  const countEl = document.getElementById("admin-customer-count");
  if (countEl) countEl.textContent = customers.length + (language === "th" ? " คน" : "명");

  const totalSavingsEl = document.getElementById("admin-total-savings");
  if (totalSavingsEl) totalSavingsEl.textContent = money(totalSystemAmount);

  const options = sorted.map(customer => {
    const id = getCustomerId(customer);
    return `
      <option value="${id}">
        [${customer.serial || '미등록'}] ${customer.name} · ${customer.phone}
      </option>
    `;
  }).join("");

  const depositSelect = document.getElementById("deposit-customer");
  if (depositSelect) {
    depositSelect.innerHTML = `<option value="">고객을 선택하세요</option>` + options;
  }

  const list = document.getElementById("admin-customer-list");
  if (list) {
    list.innerHTML = "";
    sorted.forEach((customer, idx) => {
      const info = totals(customer);
      const cId = getCustomerId(customer) || `idx-${idx}`;
      
      const depositRows = (customer.deposits || []).map(d => {
        const depId = getDepositId(d);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; padding:6px 10px; margin-top:4px; border-radius:4px; font-size:13px;">
            <span>${formatDate(d.created_at || d.date)} | ${money(d.amount)} (${d.memo || d.note || '-'})</span>
            <button type="button" class="edit-deposit-btn" 
              data-id="${depId}" 
              data-customer-id="${cId}"
              data-amount="${d.amount}" 
              data-date="${(d.created_at || d.date || '').slice(0, 10)}" 
              data-note="${d.memo || d.note || ''}"
              style="padding:2px 6px; font-size:11px;">수정</button>
          </div>
        `;
      }).join('');

      list.innerHTML += `
        <div class="customer-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <p><strong>${customer.name}</strong></p>
              <small>${customer.serial || '미등록'} · ${customer.phone} · 입금 ${info.count}회</small>
            </div>
            <strong>${money(info.total)}</strong>
          </div>
          <div class="customer-buttons" style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="password-check" data-id="${cId}">비밀번호 확인</button>
            <button class="download-pdf-admin-btn" data-id="${cId}" style="background-color:#d4af37; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">PDF 다운로드</button>
            <button class="toggle-deposits-btn" data-target="deposits-${cId}">입금 내역 관리 (${info.count})</button>
          </div>
          <div id="deposits-${cId}" class="hidden" style="margin-top:8px; border-top:1px solid #eee; padding-top:8px;">
            ${depositRows || '<p style="font-size:12px; color:#888;">입금 내역이 없습니다.</p>'}
          </div>
        </div>
      `;
    });

    document.querySelectorAll(".password-check").forEach(button => {
      button.onclick = () => openPasswordModal(button.dataset.id);
    });

    document.querySelectorAll(".download-pdf-admin-btn").forEach(button => {
      button.onclick = () => downloadDepositPDF(button.dataset.id);
    });

    document.querySelectorAll(".toggle-deposits-btn").forEach(button => {
      button.onclick = () => {
        const targetEl = document.getElementById(button.dataset.target);
        if (targetEl) targetEl.classList.toggle("hidden");
      };
    });

    document.querySelectorAll(".edit-deposit-btn").forEach(button => {
      button.onclick = () => {
        document.getElementById("edit-deposit-id").value = button.dataset.id;
        document.getElementById("edit-deposit-customer-id").value = button.dataset.customerId;
        document.getElementById("edit-deposit-amount").value = button.dataset.amount;
        document.getElementById("edit-deposit-date").value = button.dataset.date;
        document.getElementById("edit-deposit-note").value = button.dataset.note;
        document.getElementById("edit-deposit-modal")?.classList.remove("hidden");
      };
    });
  }

  show("admin-dashboard");
}

/* ===========================================================
   MODAL LOGIC
=========================================================== */

function closePasswordModal() {
  passwordCustomerId = null;
  document.getElementById("password-modal")?.classList.add("hidden");
}

function openPasswordModal(customerId) {
  passwordCustomerId = customerId;
  const customer = cachedCustomers.find(c =>
    getCustomerId(c) === String(customerId)
  );

  const titleEl = document.getElementById("password-modal-title");
  if (titleEl) titleEl.textContent = `${customer ? customer.name : ''} 비밀번호 확인`;

  const inputEl = document.getElementById("password-confirm-input");
  const errEl = document.getElementById("password-confirm-error");
  if (inputEl) inputEl.value = "";
  if (errEl) errEl.textContent = "";

  document.getElementById("revealed-password")?.classList.add("hidden");
  document.getElementById("password-confirm-form")?.classList.remove("hidden");
  document.getElementById("password-modal")?.classList.remove("hidden");
}

/* ===========================================================
   EVENT BINDING (INIT)
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      show(targetView);
    });
  });

  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => {
      const panelId = btn.dataset.panel;
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        targetPanel.classList.toggle("hidden");
      }
    });
  });

  document.querySelectorAll(".language-button").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.language);
    });
  });

  document.getElementById("customer-login-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const phoneInput = document.getElementById("customer-phone");
    const passInput = document.getElementById("customer-password");

    const customers = await fetchCustomersFromDB();
    const found = customers.find(c =>
      c.phone === phone(phoneInput?.value) &&
      c.password === passInput?.value
    );

    if (!found) {
      const errEl = document.getElementById("customer-login-error");
      if (errEl) errEl.textContent = language === "th" ? "กรุณาตรวจสอบหมายเลขโทรศัพท์หรือรหัสผ่าน" : "전화번호 또는 비밀번호를 확인해주세요.";
      return;
    }

    activeCustomerId = getCustomerId(found);
    renderCustomer();
  });

  document.getElementById("admin-login-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const passInput = document.getElementById("admin-password");

    if (passInput?.value !== ADMIN_PASSWORD) {
      const errEl = document.getElementById("admin-login-error");
      if (errEl) errEl.textContent = language === "th" ? "รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง" : "관리자 비밀번호가 올바르지 않습니다.";
      return;
    }

    await renderAdmin();
  });

  document.getElementById("new-customer-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const customers = await fetchCustomersFromDB();
    const serial = (document.getElementById("new-serial")?.value || "").trim();
    const phoneNumber = phone(document.getElementById("new-phone")?.value);

    if (customers.some(c => c.phone === phoneNumber)) {
      alert(language === "th" ? "หมายเลขโทรศัพท์นี้ถูกลงทะเบียนแล้ว" : "이미 등록된 전화번호입니다.");
      return;
    }

    if (serial && customers.some(c => c.serial === serial)) {
      alert(language === "th" ? "หมายเลขซีเรียลนี้ถูกลงทะเบียนแล้ว" : "이미 등록된 시리얼번호입니다.");
      return;
    }

    await saveCustomerToDB({
      serial,
      name: (document.getElementById("new-name")?.value || "").trim(),
      phone: phoneNumber,
      address: (document.getElementById("new-address")?.value || "").trim(),
      password: document.getElementById("new-password")?.value || ""
    });

    alert(language === "th" ? "ลงทะเบียนลูกค้าเรียบร้อยแล้ว" : "고객 등록 완료");
    e.target.reset();
    document.getElementById("new-customer-form")?.classList.add("hidden");
    await renderAdmin();
  });

  document.getElementById("new-deposit-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    const customerSelect = document.getElementById("deposit-customer");
    const customerId = customerSelect?.value;

    if (!customerId) {
      alert(language === "th" ? "กรุณาเลือกลูกค้า" : "입금할 고객을 선택하세요.");
      return;
    }

    const amountInput = document.getElementById("deposit-amount");
    const dateInput = document.getElementById("deposit-date");
    const noteInput = document.getElementById("deposit-note");

    const amount = Number(amountInput?.value || 0);
    if (!amount || amount <= 0) {
      alert(language === "th" ? "กรุณากรอกจำนวนเงินฝาก" : "입금 금액을 입력하세요.");
      return;
    }

    const customers = await fetchCustomersFromDB();
    const customer = customers.find(c => getCustomerId(c) === String(customerId));

    try {
      await saveDepositToDB({
        customer_id: customerId,
        serial: customer?.serial || "",
        amount: amount,
        memo: (noteInput?.value || "").trim(),
        note: (noteInput?.value || "").trim(),
        date: dateInput?.value || today()
      });

      alert(language === "th" ? "บันทึกประวัติการฝากเรียบร้อยแล้ว" : "입금 내역이 저장되었습니다.");
      e.target.reset();
      if (dateInput) dateInput.value = today();
      document.getElementById("new-deposit-form")?.classList.add("hidden");
      await renderAdmin();
    } catch (err) {
      alert((language === "th" ? "บันทึกล้มเหลว: " : "입금 저장 실패: ") + err.message);
    }
  });

  document.getElementById("submit-edit-deposit-btn")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const id = document.getElementById("edit-deposit-id").value;
    const customerId = document.getElementById("edit-deposit-customer-id").value;
    const amount = Number(document.getElementById("edit-deposit-amount").value);
    const date = document.getElementById("edit-deposit-date").value;
    const note = document.getElementById("edit-deposit-note").value;

    if (!id || id === "undefined" || id === "null") {
      alert("수정할 입금 내역의 ID가 올바르지 않습니다.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("올바른 입금액을 입력해주세요.");
      return;
    }

    try {
      await saveDepositToDB({
        id: id,
        customer_id: customerId,
        amount: amount,
        created_at: date,
        date: date,
        memo: note,
        note: note
      });

      alert(language === "th" ? "แก้ไขข้อมูลเรียบร้อยแล้ว" : "입금 내역이 수정되었습니다.");
      document.getElementById("edit-deposit-modal")?.classList.add("hidden");
      await renderAdmin();
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 실패: " + err.message);
    }
  });

  document.getElementById("delete-deposit-btn")?.addEventListener("click", async () => {
    const id = document.getElementById("edit-deposit-id").value;
    
    if (!id || id === "undefined" || id === "null") {
      alert("삭제할 입금 내역의 고유 ID가 없습니다.");
      return;
    }

    if (confirm(language === "th" ? "คุณต้องการลบรายการนี้ใช่หรือไม่?" : "정말로 이 입금 내역을 삭제하시겠습니까?")) {
      try {
        await deleteDepositFromDB(id);
        alert(language === "th" ? "ลบรายการเรียบร้อยแล้ว" : "입금 내역이 삭제되었습니다.");
        document.getElementById("edit-deposit-modal")?.classList.add("hidden");
        await renderAdmin();
      } catch (err) {
        alert("삭제 실패: " + err.message);
      }
    }
  });

  document.getElementById("close-edit-deposit-modal")?.addEventListener("click", () => {
    document.getElementById("edit-deposit-modal")?.classList.add("hidden");
  });

  document.getElementById("password-confirm-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const passInput = document.getElementById("password-confirm-input");
    const errEl = document.getElementById("password-confirm-error");

    if (passInput?.value !== ADMIN_PASSWORD) {
      if (errEl) errEl.textContent = language === "th" ? "รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง" : "관리자 비밀번호가 올바르지 않습니다.";
      return;
    }

    const customer = cachedCustomers.find(c =>
      getCustomerId(c) === String(passwordCustomerId)
    );

    document.getElementById("password-confirm-form")?.classList.add("hidden");
    const revVal = document.getElementById("revealed-password-value");
    if (revVal) revVal.textContent = customer ? customer.password : "";
    document.getElementById("revealed-password")?.classList.remove("hidden");
  });

  document.getElementById("customer-logout")?.addEventListener("click", () => {
    activeCustomerId = null;
    document.getElementById("customer-login-form")?.reset();
    show("customer-login");
  });

  document.getElementById("admin-logout")?.addEventListener("click", () => {
    document.getElementById("admin-login-form")?.reset();
    show("customer-login");
  });

  document.getElementById("close-password-modal")?.addEventListener("click", closePasswordModal);

  const depositDate = document.getElementById("deposit-date");
  if (depositDate) depositDate.value = today();

  setLanguage(language);
  fetchCustomersFromDB();
});
