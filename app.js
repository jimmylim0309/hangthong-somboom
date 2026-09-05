/******************************************************************
 HANGTHONG SOMBOON GOLD SAVINGS SYSTEM
 Version 2.3
 Fix : HTML ID Mapping & Dynamic Screen Navigation
******************************************************************/

const ADMIN_PASSWORD = "jimmy0309!";

let activeCustomerId = null;
let passwordCustomerId = null;
let cachedCustomers = [];
let language = localStorage.getItem("hangthong-language") || "ko";

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
  if (activeCustomerId) {
    renderCustomer();
  }
}

/* ===========================================================
   RENDER LOGIC (전체 교체용)
=========================================================== */

function totals(customer) {
  const deposits = customer.deposits || [];
  const total = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  
  // created_at과 date 필드 모두 대응하여 최신 내역 추출
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
  
  // ID 비교 시 문자열/숫자 타입 차이 방지
  const customer = cachedCustomers.find(c =>
    String(c.id) === String(activeCustomerId) ||
    String(c._id) === String(activeCustomerId)
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
  if (countEl) countEl.textContent = info.count + "회";
  if (recentEl) recentEl.textContent = info.recent ? formatDate(info.recent.created_at || info.recent.date) : "-";

  const list = document.getElementById("customer-deposit-list");
  if (list) {
    list.innerHTML = "";
    if (!customer.deposits || customer.deposits.length === 0) {
      list.innerHTML = "<p class='empty'>입금 내역이 없습니다.</p>";
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

async function renderAdmin() {
  console.log("관리자 데이터 렌더링 중...");
  const customers = await fetchCustomersFromDB();

  const sorted = [...customers].sort((a, b) =>
    String(a.serial || "").localeCompare(String(b.serial || ""), "ko", { numeric: true })
  );

  const countEl = document.getElementById("admin-customer-count");
  if (countEl) countEl.textContent = customers.length + "명";

  /* Select 박스 바인딩 */
  const options = sorted.map(customer => {
    const id = customer.id || customer._id;
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

  const editSelect = document.getElementById("edit-customer-select");
  if (editSelect) {
    editSelect.innerHTML = `<option value="">수정할 고객 선택</option>` + options;
  }

  /* 고객 목록 표시 */
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
    String(c.id) === String(customerId) ||
    String(c._id) === String(customerId)
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
  /* 1. data-view 버튼을 통한 화면 전환 (관리자 버튼, 뒤로가기 버튼 등) */
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      show(targetView);
    });
  });

  /* 2. 관리자 대시보드 내 서브 패널 토글 (+ 고객 등록, + 입금 기록 등) */
  document.querySelectorAll("[data-panel]").forEach(btn => {
    btn.addEventListener("click", () => {
      const panelId = btn.dataset.panel;
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        targetPanel.classList.toggle("hidden");
      }
    });
  });

  /* 3. 언어 변경 버튼 */
  document.querySelectorAll(".language-button").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.language);
    });
  });

  /* 4. 고객 로그인 제출 */
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
      if (errEl) errEl.textContent = "전화번호 또는 비밀번호를 확인해주세요.";
      return;
    }

    activeCustomerId = found.id || found._id;
    renderCustomer();
  });

  /* 5. 관리자 로그인 제출 */
  document.getElementById("admin-login-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const passInput = document.getElementById("admin-password");

    if (passInput?.value !== ADMIN_PASSWORD) {
      const errEl = document.getElementById("admin-login-error");
      if (errEl) errEl.textContent = "관리자 비밀번호가 올바르지 않습니다.";
      return;
    }

    await renderAdmin();
  });

  /* 6. 신규 고객 등록 제출 */
  document.getElementById("new-customer-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const customers = await fetchCustomersFromDB();
    const serial = (document.getElementById("new-serial")?.value || "").trim();
    const phoneNumber = phone(document.getElementById("new-phone")?.value);

    if (customers.some(c => c.phone === phoneNumber)) {
      alert("이미 등록된 전화번호입니다.");
      return;
    }

    if (serial && customers.some(c => c.serial === serial)) {
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
    document.getElementById("new-customer-form")?.classList.add("hidden");
    await renderAdmin();
  });

  /* 7. 입금 기록 저장 제출 (index.html ID 기준) */
  document.getElementById("new-deposit-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    const customerSelect = document.getElementById("deposit-customer");
    const customerId = customerSelect?.value;

    if (!customerId) {
      alert("입금할 고객을 선택하세요.");
      return;
    }

    const amountInput = document.getElementById("deposit-amount");
    const dateInput = document.getElementById("deposit-date");
    const noteInput = document.getElementById("deposit-note");

    const amount = Number(amountInput?.value || 0);
    if (!amount || amount <= 0) {
      alert("입금 금액을 입력하세요.");
      return;
    }

    const customers = await fetchCustomersFromDB();
    const customer = customers.find(c => String(c.id || c._id) === String(customerId));

    try {
      await saveDepositToDB({
        customer_id: customerId,
        serial: customer?.serial || "",
        amount: amount,
        memo: (noteInput?.value || "").trim(),
        note: (noteInput?.value || "").trim(),
        date: dateInput?.value || today()
      });

      alert("입금 내역이 저장되었습니다.");
      e.target.reset();
      if (dateInput) dateInput.value = today();
      document.getElementById("new-deposit-form")?.classList.add("hidden");
      await renderAdmin();
    } catch (err) {
      alert("입금 저장 실패: " + err.message);
    }
  });

  /* 8. 관리자 비밀번호 확인 모달 제출 */
  document.getElementById("password-confirm-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const passInput = document.getElementById("password-confirm-input");
    const errEl = document.getElementById("password-confirm-error");

    if (passInput?.value !== ADMIN_PASSWORD) {
      if (errEl) errEl.textContent = "관리자 비밀번호가 올바르지 않습니다.";
      return;
    }

    const customer = cachedCustomers.find(c =>
      String(c.id || c._id) === String(passwordCustomerId)
    );

    document.getElementById("password-confirm-form")?.classList.add("hidden");
    const revVal = document.getElementById("revealed-password-value");
    if (revVal) revVal.textContent = customer ? customer.password : "";
    document.getElementById("revealed-password")?.classList.remove("hidden");
  });

  /* 9. 기타 버튼 이벤트 연동 (로그아웃, 모달 닫기 등) */
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

  // 기본 입금 날짜 오늘로 설정
  const depositDate = document.getElementById("deposit-date");
  if (depositDate) depositDate.value = today();

  // 초기화 실행
  setLanguage(language);
  fetchCustomersFromDB();
});

async function deleteDepositFromDB(depositId) {
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

async function renderAdmin() {
  console.log("관리자 데이터 렌더링 중...");
  const customers = await fetchCustomersFromDB();

  const sorted = [...customers].sort((a, b) =>
    String(a.serial || "").localeCompare(String(b.serial || ""), "ko", { numeric: true })
  );

  const countEl = document.getElementById("admin-customer-count");
  if (countEl) countEl.textContent = customers.length + "명";

  const list = document.getElementById("admin-customer-list");
  if (list) {
    list.innerHTML = "";
    sorted.forEach(customer => {
      const info = totals(customer);
      
      // 고객별 입금 내역 HTML 생성
      const depositRows = (customer.deposits || []).map(d => `
        <div style="display:flex; justify-space-between; align-items:center; background:#f8f9fa; padding:6px 10px; margin-top:4px; border-radius:4px; font-size:13px;">
          <span>${formatDate(d.created_at || d.date)} | ${money(d.amount)} (${d.memo || d.note || '-'})</span>
          <button type="button" class="edit-deposit-btn" 
            data-id="${d.id}" 
            data-customer-id="${customer.id || customer._id}"
            data-amount="${d.amount}" 
            data-date="${(d.created_at || d.date || '').slice(0, 10)}" 
            data-note="${d.memo || d.note || ''}"
            style="padding:2px 6px; font-size:11px;">수정</button>
        </div>
      `).join('');

      list.innerHTML += `
        <div class="customer-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <p><strong>${customer.name}</strong></p>
              <small>${customer.serial || '미등록'} · ${customer.phone} · 입금 ${info.count}회</small>
            </div>
            <strong>${money(info.total)}</strong>
          </div>
          <div class="customer-buttons">
            <button class="password-check" data-id="${customer.id || customer._id}">비밀번호 확인</button>
            <button class="toggle-deposits-btn" data-target="deposits-${customer.id || customer._id}">입금 내역 관리 (${info.count})</button>
          </div>
          <div id="deposits-${customer.id || customer._id}" class="hidden" style="margin-top:8px; border-top:1px solid #eee; padding-top:8px;">
            ${depositRows || '<p style="font-size:12px; color:#888;">입금 내역이 없습니다.</p>'}
          </div>
        </div>
      `;
    });

    // 비밀번호 확인 버튼 이벤트
    document.querySelectorAll(".password-check").forEach(button => {
      button.onclick = () => openPasswordModal(button.dataset.id);
    });

    // 입금 내역 토글 버튼 이벤트
    document.querySelectorAll(".toggle-deposits-btn").forEach(button => {
      button.onclick = () => {
        const targetEl = document.getElementById(button.dataset.target);
        if (targetEl) targetEl.classList.toggle("hidden");
      };
    });

    // 입금 내역 수정 모달 열기 이벤트
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

// 입금 내역 수정 제출
  document.getElementById("edit-deposit-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("edit-deposit-id").value;
    const customerId = document.getElementById("edit-deposit-customer-id").value;
    const amount = Number(document.getElementById("edit-deposit-amount").value);
    const date = document.getElementById("edit-deposit-date").value;
    const note = document.getElementById("edit-deposit-note").value;

    try {
      await saveDepositToDB({
        id: id,
        customer_id: customerId,
        amount: amount,
        created_at: date,
        memo: note,
        note: note
      });
      alert("입금 내역이 수정되었습니다.");
      document.getElementById("edit-deposit-modal")?.classList.add("hidden");
      await renderAdmin();
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  });

  // 입금 내역 삭제 버튼 클릭
  document.getElementById("delete-deposit-btn")?.addEventListener("click", async () => {
    const id = document.getElementById("edit-deposit-id").value;
    if (!id) return;

    if (confirm("정말로 이 입금 내역을 삭제하시겠습니까?")) {
      try {
        await deleteDepositFromDB(id);
        alert("입금 내역이 삭제되었습니다.");
        document.getElementById("edit-deposit-modal")?.classList.add("hidden");
        await renderAdmin();
      } catch (err) {
        alert("삭제 실패: " + err.message);
      }
    }
  });

  // 수정 모달 닫기
  document.getElementById("close-edit-deposit-modal")?.addEventListener("click", () => {
    document.getElementById("edit-deposit-modal")?.classList.add("hidden");
  });
