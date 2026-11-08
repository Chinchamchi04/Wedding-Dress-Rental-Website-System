import fs from 'fs';
import path from 'path';

// Generate standalone SVG with both English and Vietnamese text support or dynamic SVG
function generateSvg(lang = 'EN') {
  const isEn = lang === 'EN';

  const title = isEn
    ? "1.4.2 Customer Create Rental Order, Sign Contract & Pay Deposit"
    : "1.4.2 Khách Hàng Tạo Đơn Thuê Váy, Ký Hợp Đồng & Đặt Cọc";

  const msg1_1 = isEn
    ? "1.1: Select rental dates, days, delivery method & fill measurements"
    : "1.1: Chọn ngày thuê, số ngày, phương thức nhận váy & điền số đo";

  const msg1_2 = isEn
    ? "1.2: Review rental contract terms & submit electronic signature"
    : "1.2: Xem điều khoản hợp đồng & thực hiện ký tên điện tử";

  const msg1_3 = isEn
    ? "1.3: Select deposit option (50%/100%), scan VietQR & click 'Confirm Deposit'"
    : "1.3: Chọn gói đặt cọc (50%/100%), quét VietQR & click 'Xác nhận đặt cọc'";

  const msg1_4 = "1.4: POST /api/orders (body: orderPayload)";
  const msg1_5 = "1.5: createOrder(req, res, next)";
  const msg1_6 = "1.6: createOrder(req.body, req.user)";

  const msg1_7 = isEn
    ? "1.7: Validate input: items, rentalDates, customerContact, contractSignature"
    : "1.7: Kiểm tra hợp lệ: items, rentalDates, thông tin liên hệ, chữ ký HĐ";

  const guard1 = isEn
    ? "[Scenario 1: Validation Failed / Missing Info / Empty Items]"
    : "[Scenario 1: Xác thực thất bại / Thiếu thông tin / Không có sản phẩm]";

  const msg1_8 = isEn
    ? "1.8: throw Error(\"Rental order requires at least 1 dress item / Missing info...\")"
    : "1.8: throw Error(\"Đơn thuê cần ít nhất 1 sản phẩm váy cưới / Thiếu thông tin...\")";

  const msg1_9 = "1.9: HTTP 400 Bad Request { success: false, message }";

  const msg1_10 = isEn
    ? "1.10: Display error notification toast on UI & scroll to missing step"
    : "1.10: Hiển thị thông báo lỗi trên UI & cuộn về bước cần bổ sung";

  const guard2 = isEn
    ? "[Scenario 2: Validation Passed / Success]"
    : "[Scenario 2: Xác thực thành công / Tạo đơn & Hợp đồng]";

  const msg1_11 = isEn
    ? "1.11: Calculate fees (totalRent, totalDeposit, depositPaid) & generate code: UB-2026-XXX, HĐ-UB-2026-XXX"
    : "1.11: Tính toán chi phí (totalRent, totalDeposit, depositPaid) & Sinh mã: UB-2026-XXX, HĐ-UB-2026-XXX";

  const msg1_12 = "1.12: OrderModel.create(orderDoc)";

  const msg1_13 = isEn
    ? "1.13: Return savedOrderDoc (status: 'deposit_paid')"
    : "1.13: return savedOrderDoc (status: 'deposit_paid')";

  const msg1_14 = isEn
    ? "1.14: Return newOrder"
    : "1.14: return newOrder";

  const msg1_15 = isEn
    ? "1.15: HTTP 201 Created { success: true, message: 'Order created successfully!', data: order }"
    : "1.15: HTTP 201 Created { success: true, message: 'Tạo đơn và ký HĐ thành công!', data: order }";

  const msg1_16 = isEn
    ? "1.16: Show Success Modal, clear cart & redirect to Order Detail (/orders/:id)"
    : "1.16: Hiển thị Success Modal, xóa giỏ hàng & chuyển hướng xem đơn hàng (/orders/:id)";

  const msg1_17 = isEn
    ? "1.17: Send confirmation email & attached electronic rental contract"
    : "1.17: Gửi email xác nhận đặt cọc kèm file Hợp đồng thuê váy cưới điện tử";

  // Coordinates
  const xActor = 110;
  const xUI = 310;
  const xRoute = 500;
  const xCtrl = 690;
  const xSrv = 900;
  const xDB = 1120;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 920" width="100%" height="100%" style="background:#ffffff; font-family: Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Solid Arrow Marker for Synchronous Calls -->
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
    </marker>
    <!-- Open Arrow Marker for Return Messages -->
    <marker id="open-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#000000" stroke-width="1.5" />
    </marker>
  </defs>

  <!-- Title -->
  <text x="45" y="42" font-size="20" font-weight="bold" fill="#155799" text-decoration="underline">${title}</text>

  <!-- LIFELINES (Dashed Lines) -->
  <line x1="${xActor}" y1="150" x2="${xActor}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xUI}" y1="130" x2="${xUI}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xRoute}" y1="130" x2="${xRoute}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xCtrl}" y1="130" x2="${xCtrl}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xSrv}" y1="130" x2="${xSrv}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xDB}" y1="130" x2="${xDB}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />

  <!-- HEADERS -->
  <!-- Actor Customer -->
  <g transform="translate(${xActor - 18}, 65)">
    <circle cx="18" cy="10" r="10" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="20" x2="18" y2="40" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="6" y1="27" x2="30" y2="27" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="40" x2="8" y2="58" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="40" x2="28" y2="58" stroke="#6c8ebf" stroke-width="1.5" />
    <text x="18" y="74" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">Customer</text>
  </g>

  <!-- <<user interface>> CheckoutPage -->
  <rect x="${xUI - 70}" y="75" width="140" height="50" rx="0" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xUI}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;user interface&gt;&gt;</text>
  <text x="${xUI}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">CheckoutPage</text>

  <!-- <<route>> orderRoutes -->
  <rect x="${xRoute - 65}" y="75" width="130" height="50" rx="0" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xRoute}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;route&gt;&gt;</text>
  <text x="${xRoute}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderRoutes</text>

  <!-- <<control>> orderController -->
  <rect x="${xCtrl - 70}" y="75" width="140" height="50" rx="0" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xCtrl}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;control&gt;&gt;</text>
  <text x="${xCtrl}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderController</text>

  <!-- <<service>> orderService -->
  <rect x="${xSrv - 70}" y="75" width="140" height="50" rx="0" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xSrv}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;service&gt;&gt;</text>
  <text x="${xSrv}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderService</text>

  <!-- <<database>> OrderModel(MongoDB) -->
  <rect x="${xDB - 80}" y="75" width="160" height="50" rx="0" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xDB}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;database&gt;&gt;</text>
  <text x="${xDB}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">OrderModel(MongoDB)</text>

  <!-- ACTIVATION BARS -->
  <!-- Customer -->
  <rect x="${xActor - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <!-- UI -->
  <rect x="${xUI - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <!-- Route -->
  <rect x="${xRoute - 6}" y="285" width="12" height="45" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <!-- Controller -->
  <rect x="${xCtrl - 6}" y="315" width="12" height="440" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <!-- Service -->
  <rect x="${xSrv - 6}" y="345" width="12" height="380" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <!-- Database -->
  <rect x="${xDB - 6}" y="645" width="12" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />

  <!-- MESSAGES BEFORE ALT -->
  <!-- 1.1 -->
  <line x1="${xActor + 6}" y1="175" x2="${xUI - 6}" y2="175" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xActor + xUI) / 2}" y="169" font-size="11" fill="#000000" text-anchor="middle">${msg1_1}</text>

  <!-- 1.2 -->
  <line x1="${xActor + 6}" y1="215" x2="${xUI - 6}" y2="215" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xActor + xUI) / 2}" y="209" font-size="11" fill="#000000" text-anchor="middle">${msg1_2}</text>

  <!-- 1.3 -->
  <line x1="${xActor + 6}" y1="255" x2="${xUI - 6}" y2="255" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xActor + xUI) / 2}" y="249" font-size="11" fill="#000000" text-anchor="middle">${msg1_3}</text>

  <!-- 1.4 -->
  <line x1="${xUI + 6}" y1="290" x2="${xRoute - 6}" y2="290" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xUI + xRoute) / 2}" y="284" font-size="11" fill="#000000" text-anchor="middle">${msg1_4}</text>

  <!-- 1.5 -->
  <line x1="${xRoute + 6}" y1="320" x2="${xCtrl - 6}" y2="320" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xRoute + xCtrl) / 2}" y="314" font-size="11" fill="#000000" text-anchor="middle">${msg1_5}</text>

  <!-- 1.6 -->
  <line x1="${xCtrl + 6}" y1="350" x2="${xSrv - 6}" y2="350" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="344" font-size="11" fill="#000000" text-anchor="middle">${msg1_6}</text>

  <!-- 1.7 (Self-call loop) -->
  <path d="M ${xSrv + 6} 380 L ${xSrv + 38} 380 L ${xSrv + 38} 405 L ${xSrv + 6} 405" fill="none" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${xSrv + 44}" y="396" font-size="11" fill="#000000" text-anchor="start">${msg1_7}</text>

  <!-- ALT FRAME -->
  <rect x="50" y="425" width="1170" height="415" fill="none" stroke="#000000" stroke-width="1.2" />
  <!-- alt tab -->
  <path d="M 50 425 L 110 425 L 110 445 L 100 455 L 50 455 Z" fill="#f0f0f0" stroke="#000000" stroke-width="1.2" />
  <text x="75" y="445" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">alt</text>

  <!-- Scenario 1 Guard -->
  <text x="65" y="475" font-size="11" font-weight="bold" fill="#333333">${guard1}</text>

  <!-- 1.8 (Error throw) -->
  <line x1="${xSrv - 6}" y1="490" x2="${xCtrl + 6}" y2="490" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="484" font-size="11" fill="#cc0000" text-anchor="middle">${msg1_8}</text>

  <!-- 1.9 -->
  <line x1="${xCtrl - 6}" y1="520" x2="${xUI + 6}" y2="520" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="514" font-size="11" fill="#000000" text-anchor="middle">${msg1_9}</text>

  <!-- 1.10 -->
  <line x1="${xUI - 6}" y1="548" x2="${xActor + 6}" y2="548" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="542" font-size="11" fill="#000000" text-anchor="middle">${msg1_10}</text>

  <!-- ALT DIVIDER LINE -->
  <line x1="50" y1="568" x2="1220" y2="568" stroke="#666666" stroke-width="1.2" stroke-dasharray="6,4" />

  <!-- Scenario 2 Guard -->
  <text x="65" y="588" font-size="11" font-weight="bold" fill="#333333">${guard2}</text>

  <!-- 1.11 (Self-call loop) -->
  <path d="M ${xSrv + 6} 605 L ${xSrv + 38} 605 L ${xSrv + 38} 630 L ${xSrv + 6} 630" fill="none" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${xSrv + 44}" y="621" font-size="11" fill="#000000" text-anchor="start">${msg1_11}</text>

  <!-- 1.12 -->
  <line x1="${xSrv + 6}" y1="655" x2="${xDB - 6}" y2="655" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="649" font-size="11" fill="#000000" text-anchor="middle">${msg1_12}</text>

  <!-- 1.13 -->
  <line x1="${xDB - 6}" y1="685" x2="${xSrv + 6}" y2="685" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="679" font-size="11" fill="#000000" text-anchor="middle">${msg1_13}</text>

  <!-- 1.14 -->
  <line x1="${xSrv - 6}" y1="715" x2="${xCtrl + 6}" y2="715" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="709" font-size="11" fill="#000000" text-anchor="middle">${msg1_14}</text>

  <!-- 1.15 -->
  <line x1="${xCtrl - 6}" y1="745" x2="${xUI + 6}" y2="745" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="739" font-size="11" fill="#000000" text-anchor="middle">${msg1_15}</text>

  <!-- 1.16 -->
  <line x1="${xUI - 6}" y1="780" x2="${xActor + 6}" y2="780" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="774" font-size="11" fill="#000000" text-anchor="middle">${msg1_16}</text>

  <!-- 1.17 -->
  <line x1="${xUI - 6}" y1="815" x2="${xActor + 6}" y2="815" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="809" font-size="11" fill="#000000" text-anchor="middle">${msg1_17}</text>

</svg>`;
}

// 1. Write the standalone SVG file
const svgContent = generateSvg('EN');
fs.writeFileSync('docs/diagrams/1.4.2_customer_order_contract_deposit_sequence.svg', svgContent, 'utf8');
console.log('Saved docs/diagrams/1.4.2_customer_order_contract_deposit_sequence.svg');

// 2. Generate Interactive HTML Viewer in Artifact Directory
const artifactDir = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\49f42edd-dcf5-4c3f-b02f-f5a91777514f';
const htmlViewer = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Sequence Diagram Viewer: Customer Order & Contract Deposit</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .svg-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
  </style>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3">
  <div class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-5 shadow-sm max-w-full">
    
    <!-- Header Control Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border)]">
      <div>
        <h2 class="text-lg font-bold text-[#155799] flex items-center gap-2">
          <span>📊</span>
          <span id="titleText">1.4.2 Customer Create Rental Order, Sign Contract & Pay Deposit</span>
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          Kiến trúc Layered Architecture (React SPA $\\rightarrow$ Express Routes $\\rightarrow$ Controllers $\\rightarrow$ Services $\\rightarrow$ MongoDB)
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button id="btnEn" onclick="switchLang('EN')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition">
          English (Mẫu 1.4.1)
        </button>
        <button id="btnVn" onclick="switchLang('VN')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition">
          Tiếng Việt
        </button>
        <button onclick="downloadDrawio()" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1">
          <span>💾</span> Tải file .drawio
        </button>
      </div>
    </div>

    <!-- Live SVG Container -->
    <div id="svgWrapper" class="svg-container bg-white border border-slate-200 p-2 overflow-auto max-h-[820px]">
      ${svgContent}
    </div>

    <!-- Quick Footer Legend -->
    <div class="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-[var(--muted-foreground)]">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-[#dae8fc] border border-[#6c8ebf] inline-block"></span> Tầng kiến trúc / Activation bar</span>
        <span class="flex items-center gap-1.5"><span class="w-4 h-0.5 bg-black inline-block"></span> Gọi đồng bộ (Synchronous Call)</span>
        <span class="flex items-center gap-1.5"><span class="w-4 h-0.5 border-t border-dashed border-black inline-block"></span> Phản hồi dữ liệu (Return Response)</span>
      </div>
      <div>Dự án UniBridal - WDP301</div>
    </div>
  </div>

  <script>
    const svgEN = ${JSON.stringify(generateSvg('EN'))};
    const svgVN = ${JSON.stringify(generateSvg('VN'))};

    function switchLang(lang) {
      const wrapper = document.getElementById('svgWrapper');
      const title = document.getElementById('titleText');
      const btnEn = document.getElementById('btnEn');
      const btnVn = document.getElementById('btnVn');

      if (lang === 'EN') {
        wrapper.innerHTML = svgEN;
        title.innerText = "1.4.2 Customer Create Rental Order, Sign Contract & Pay Deposit";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      } else {
        wrapper.innerHTML = svgVN;
        title.innerText = "1.4.2 Khách Hàng Tạo Đơn Thuê Váy, Ký Hợp Đồng & Đặt Cọc";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      }
    }

    function downloadDrawio() {
      window.open('file:///c:/Users/admin/Downloads/Wedding-Dress-Rental-Website-System/docs/diagrams/1.4.2_customer_order_contract_deposit_sequence.drawio');
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(artifactDir, 'sequence_viewer.html'), htmlViewer, 'utf8');
console.log('Saved sequence_viewer.html in artifact directory!');

// Also write a copy to docs/diagrams for convenient local viewing in browser
fs.writeFileSync('docs/diagrams/sequence_diagram_viewer.html', htmlViewer, 'utf8');
console.log('Saved docs/diagrams/sequence_diagram_viewer.html');

