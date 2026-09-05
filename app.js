/******************************************************************
 HANGTHONG SOMBOON GOLD SAVINGS SYSTEM
 Version 2.2
 Fix : Admin Login Navigation & Event Safeguard
******************************************************************/

const ADMIN_PASSWORD = "jimmy0309!";

let activeCustomerId = null;
let passwordCustomerId = null;
let cachedCustomers = [];
let language = localStorage.getItem("hangthong-language") || "ko";

/* ===========================================================
   LANGUAGE
=========================================================== */

const translations = {
  ko: {
    adminLogin: "관리자",
    loginTitle: "나의 금 적립금을 확인하세요.",
    phone: "전화번호",
    password: "비밀번호",
    viewSavings: "내 적립금 보기",
    logout: "로그아웃",
    customerName: "고객 이름",
    deposit: "입금",
    depositAmount: "입금 금액",
    depositDate: "입금 날짜",
    memo: "메모",
    choose: "고객을 선택하세요",
    totalSavings: "총 적립금",
    depositHistory: "입금 내역",
    saveDeposit: "입금 내역 저장",
    invalidAdmin: "관리자 비밀번호가 올바르지 않습니다.",
    invalidLogin: "전화번호 또는 비밀번호를 확인해주세요."
  },

  th: {
    adminLogin: "ผู้ดูแล",
    loginTitle: "ตรวจสอบยอดสะสมทอง",
    phone: "หมายเลขโทรศัพท์",
    password: "รหัสผ่าน",
    viewSavings: "ดูยอดสะสม",
    logout: "ออกจากระบบ",
    customerName: "ชื่อลูกค้า",
    deposit: "ฝากเงิน",
    depositAmount: "จำนวนเงินฝาก",
    depositDate: "วันที่ฝาก",
    memo: "หมายเหตุ",
    choose: "เลือกลูกค้า",
    totalSavings: "ยอดสะสมทั้งหมด",
    depositHistory: "ประวัติการฝาก",
    saveDeposit: "บันทึกการฝาก",
    invalidAdmin: "รหัสผ่านผู้ดูแลไม่ถูกต้อง",
    invalidLogin: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง"
  }
};

const t = key => translations[language][key] || key;

/* ===========================================================
   COMMON
=========================================================== */

const phone = value => (value || "").replace(/[^0-9]/g, "");

const today = () => new Date().toISOString().slice(0,10);

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
      { year:"numeric", month:"long", day:"numeric"}
    ).format(new Date(value));
  } catch (e) {
    return value;
  }
};

/* ===========================================================
   SUPABASE API
=========================================================== */

async function fetchCustomersFromDB(){
  try{
    const res = await fetch("/.netlify/functions/get-customers");
    if(!res.ok) throw new Error("고객 조회 실패");
    cachedCustomers = await res.json();
    return cachedCustomers;
  }catch(err){
    console.error("fetchCustomersFromDB Error:", err);
    return [];
  }
}

async function saveCustomerToDB(customer){
  const res = await fetch("/.netlify/functions/save-customer",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(customer)
  });
  const result = await res.json();
  if(!res.ok){
    throw new Error(result.error || "고객 저장 실패");
  }
  return result;
}

async function saveDepositToDB(deposit){
  const res = await fetch("/.netlify/functions/save-deposit",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(deposit)
  });
  const result = await res.json();
  if(!res.ok){
    throw new Error(result.error || "입금 저장 실패");
  }
  return result;
}

/* ===========================================================
   SCREEN & LANGUAGE CONTROL
=========================================================== */

function setLanguage(next){
  language = next;
  localStorage.setItem("hangthong-language", language);
  document.documentElement.lang = language;
  document.querySelectorAll("[data-language]").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.language===language);
  });
  if(activeCustomerId){
    renderCustomer();
  }
}

function show(id){
  console.log("화면 전환 시도 ->", id);
  const screens = document.querySelectorAll(".screen");
  if (screens.length === 0) {
    console.warn("'.screen' 클래스를 가진 요소를 찾을 수 없습니다.");
  }
  screens.forEach(screen => {
    screen.classList.add("hidden");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
    console.log("화면 전환 성공 ->", id);
  } else {
    console.error(`ID가 '${id}'인 화면 요소를 찾을 수 없습니다.`);
  }
}

/* ===========================================================
   CUSTOMER / ADMIN RENDER
=========================================================== */

function totals(customer){
  const deposits = customer.deposits || [];
  const total = deposits.reduce((sum,d)=>sum+Number(d.amount || 0), 0);
  const recent = [...deposits].sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
  return {
    total,
    count: deposits.length,
    recent
  };
}

async function renderCustomer(){
  await fetchCustomersFromDB();
  const customer = cachedCustomers.find(c=>
    String(c.id)===String(activeCustomerId) ||
    String(c._id)===String(activeCustomerId)
  );

  if(!customer){
    show("customer-login");
    return;
  }

  const info = totals(customer);

  const nameEl = document.getElementById("customer-name");
  const totalEl = document.getElementById("customer-total");
  const countEl = document.getElementById("customer-count");
  const recentEl = document.getElementById("customer-recent");

  if(nameEl) nameEl.textContent = customer.name;
  if(totalEl) totalEl.textContent = money(info.total);
  if(countEl) countEl.textContent = info.count + "회";
  if(recentEl) recentEl.textContent = info.recent ? formatDate(info.recent.date) : "-";

  const list = document.getElementById("customer-deposit-list");
  if(list) {
    list.innerHTML = "";
    if(info.count===0){
      list.innerHTML = "<p class='empty'>입금 내역이 없습니다.</p>";
    }else{
      [...customer.deposits]
      .sort((a,b)=>(b.date||"").localeCompare(a.date||""))
      .forEach(d=>{
        list.innerHTML += `
          <div class="deposit-row">
            <div>
              <p>${formatDate(d.date)}</p>
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

async function renderAdmin(){
  console.log("renderAdmin() 실행 시작");
  const customers = await fetchCustomersFromDB();

  const sorted = [...customers].sort((a,b)=>
    String(a.serial || "").localeCompare(String(b.serial || ""),"ko",{numeric:true})
  );

  const countEl = document.getElementById("admin-customer-count");
  if(countEl) countEl.textContent = customers.length + "명";

  /* 고객 Select 박스 갱신 */
  const options = sorted.map(customer=>{
    const id = customer.id || customer._id;
    return `
      <option value="${id}">
        [${customer.serial || '미등록'}] ${customer.name} · ${customer.phone}
      </option>
    `;
  }).join("");

  const depositSelect = document.getElementById("new-deposit-customer");
  if(depositSelect){
    depositSelect.innerHTML = `<option value="">고객을 선택하세요</option>` + options;
  }

  const editSelect = document.getElementById("edit-customer-select");
  if(editSelect){
    editSelect.innerHTML = `<option value="">수정할 고객 선택</option>` + options;
  }

  /* 고객 목록 렌더링 */
  const list = document.getElementById("admin-customer-list");
  if (list) {
    list.innerHTML = "";
    sorted.forEach(customer => {
      const info = totals(customer);
      list.innerHTML += `
        <div class="customer-row">
          <div>
            <p>${customer.name}</p>
            <small>
              ${customer.serial || '미등록'} ·
              ${customer.phone} ·
              입금 ${info.count}회
            </small>
            <div class="customer-buttons">
              <button class="password-check" data-id="${customer.id || customer._id}">
                비밀번호 확인
              </button>
            </div>
          </div>
          <strong>${money(info.total)}</strong>
        </div>
      `;
    });

    document.querySelectorAll(".password-check").forEach(button => {
      button.onclick = () => openPasswordModal(button.dataset.id);
    });
  }

  // 관리자 대시보드로 화면 전환
  show("admin-dashboard");
}

/* ===========================================================
   LOGIN HANDLERS
=========================================================== */

async function handleAdminLogin(e) {
  if (e) e.preventDefault();
  console.log("관리자 로그인 시도 중...");

  const passInput = document.getElementById("admin-password");
  const inputPass = passInput ? passInput.value : "";

  if (inputPass !== ADMIN_PASSWORD) {
    alert("관리자 비밀번호가 올바르지 않습니다.");
    return;
  }

  console.log("관리자 비밀번호 일치. 관리자 화면으로 이동합니다.");
  await renderAdmin();
}

async function handleCustomerLogin(e) {
  if (e) e.preventDefault();

  const phoneInput = document.getElementById("customer-phone");
  const passInput = document.getElementById("customer-password");

  const customers = await fetchCustomersFromDB();
  const found = customers.find(customer=>
    customer.phone === phone(phoneInput ? phoneInput.value : "") &&
    customer.password === (passInput ? passInput.value : "")
  );

  if(!found){
    alert("전화번호 또는 비밀번호를 확인하세요.");
    return;
  }

  activeCustomerId = found.id || found._id;
  renderCustomer();
}

/* ===========================================================
   DEPOSIT HANDLER
=========================================================== */

async function handleDepositSubmit(e) {
  if(e) e.preventDefault();

  const customerSelect = document.getElementById("new-deposit-customer");
  if (!customerSelect) {
    alert("고객 선택창을 찾을 수 없습니다.");
    return;
  }

  const customerId = customerSelect.value;
  if (!customerId) {
    alert("입금할 고객을 선택하세요.");
    customerSelect.focus();
    return;
  }

  const customers = await fetchCustomersFromDB();
  const customer = customers.find(c =>
    String(c.id) === String(customerId) ||
    String(c._id) === String(customerId)
  );

  if (!customer) {
    alert("선택한 고객 정보를 찾을 수 없습니다.");
    return;
  }

  const amountInput = document.getElementById("new-deposit-amount");
  const memoInput = document.getElementById("new-deposit-memo");
  const dateInput = document.getElementById("new-deposit-date");

  const amount = Number(amountInput ? amountInput.value : 0);
  if (!amount || amount <= 0) {
    alert("입금 금액을 입력하세요.");
    if(amountInput) amountInput.focus();
    return;
  }

  const depositData = {
    customer_id: customer.id || customer._id,
    serial: customer.serial || "",
    amount: amount,
    memo: (memoInput ? memoInput.value : "").trim(),
    note: (memoInput ? memoInput.value : "").trim(),
    date: (dateInput ? dateInput.value : "") || today()
  };

  try {
    await saveDepositToDB(depositData);
    alert("입금 내역이 저장되었습니다.");

    const form = document.getElementById("new-deposit-form");
    if(form) form.reset();
    if(dateInput) dateInput.value = today();

    await renderAdmin();
  } catch (err) {
    console.error("Deposit Save Error:", err);
    alert("입금 저장 실패\n\n" + err.message);
  }
}

/* ===========================================================
   PASSWORD MODAL
=========================================================== */

function closePasswordModal(){
  passwordCustomerId = null;
  const modal = document.getElementById("password-modal");
  if(modal) modal.classList.add("hidden");
}

function openPasswordModal(customerId){
  passwordCustomerId = customerId;
  const customer = cachedCustomers.find(c =>
    String(c.id)===String(customerId) ||
    String(c._id)===String(customerId)
  );

  const titleEl = document.getElementById("password-modal-title");
  if(titleEl) titleEl.textContent = `${customer ? customer.name : ''} 비밀번호 확인`;

  const inputEl = document.getElementById("password-confirm-input");
  const errEl = document.getElementById("password-confirm-error");
  if(inputEl) inputEl.value = "";
  if(errEl) errEl.textContent = "";

  document.getElementById("revealed-password")?.classList.add("hidden");
  document.getElementById("password-confirm-form")?.classList.remove("hidden");
  document.getElementById("password-modal")?.classList.remove("hidden");
}

/* ===========================================================
   DOM READY & EVENT BINDING
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 관리자 로그인 이벤트 연동
  const adminForm = document.getElementById("admin-login-form");
  if (adminForm) {
    adminForm.addEventListener("submit", handleAdminLogin);
  }

  // 고객 로그인 이벤트 연동
  const customerForm = document.getElementById("customer-login-form");
  if (customerForm) {
    customerForm.addEventListener("submit", handleCustomerLogin);
  }

  // 신규 고객 등록
  const newCustomerForm = document.getElementById("new-customer-form");
  if (newCustomerForm) {
    newCustomerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const customers = await fetchCustomersFromDB();
      const serial = (document.getElementById("new-serial")?.value || "").trim();
      const phoneNumber = phone(document.getElementById("new-phone")?.value || "");

      if(customers.some(c=>c.phone===phoneNumber)){
        alert("이미 등록된 전화번호입니다.");
        return;
      }

      if(serial && customers.some(c=>c.serial===serial)){
        alert("이미 등록된 시리얼번호입니다.");
        return;
      }

      await saveCustomerToDB({
        serial,
        name: (document.getElementById("new-name")?.value || "").trim(),
        phone: phoneNumber,
        address: (document.getElementById("new-address")?.value || "").trim(),
        password: document.getElementById("new-password")?.value || ""
      });

      alert("고객 등록 완료");
      e.target.reset();
      await renderAdmin();
    });
  }

  // 입금 폼 연동
  const depositForm = document.getElementById("new-deposit-form");
  if (depositForm) {
    depositForm.addEventListener("submit", handleDepositSubmit);
  }

  // 비밀번호 확인 폼
  const passConfirmForm = document.getElementById("password-confirm-form");
  if (passConfirmForm) {
    passConfirmForm.addEventListener("submit", e => {
      e.preventDefault();
      const passInput = document.getElementById("password-confirm-input");
      const errEl = document.getElementById("password-confirm-error");

      if ((passInput ? passInput.value : "") !== ADMIN_PASSWORD) {
        if (errEl) errEl.textContent = "관리자 비밀번호가 올바르지 않습니다.";
        return;
      }

      const customer = cachedCustomers.find(c =>
        String(c.id)===String(passwordCustomerId) ||
        String(c._id)===String(passwordCustomerId)
      );

      passConfirmForm.classList.add("hidden");
      const revVal = document.getElementById("revealed-password-value");
      if(revVal) revVal.textContent = customer ? customer.password : "";
      document.getElementById("revealed-password")?.classList.remove("hidden");
    });
  }

  // 로그아웃 버튼
  const customerLogoutBtn = document.getElementById("customer-logout");
  if (customerLogoutBtn) {
    customerLogoutBtn.onclick = () => {
      activeCustomerId = null;
      document.getElementById("customer-login-form")?.reset();
      show("customer-login");
    };
  }

  const adminLogoutBtn = document.getElementById("admin-logout");
  if (adminLogoutBtn) {
    adminLogoutBtn.onclick = () => {
      document.getElementById("admin-login-form")?.reset();
      show("customer-login");
    };
  }

  const closePassModalBtn = document.getElementById("close-password-modal");
  if (closePassModalBtn) {
    closePassModalBtn.onclick = closePasswordModal;
  }

  // 날짜 기본값 설정
  const dateInput = document.getElementById("new-deposit-date");
  if (dateInput) {
    dateInput.value = today();
  }

  setLanguage(language);
  fetchCustomersFromDB();
});
