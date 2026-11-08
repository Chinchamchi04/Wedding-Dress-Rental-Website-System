import fs from 'fs';

function generateXml(isEn = true) {
  const cells = [];

  function addCell(id, value, style, parent, vertex, edge, geometry, extra = '') {
    let safeValue = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    let xml = `        <mxCell id="${id}" value="${safeValue}" style="${style}"`;
    if (vertex) xml += ' vertex="1"';
    if (edge) xml += ' edge="1"';
    xml += ` parent="${parent}"${extra}>`;
    if (geometry) {
      xml += `\n          ${geometry}\n        `;
    }
    xml += `</mxCell>`;
    cells.push(xml);
  }

  cells.push('        <mxCell id="0" />');
  cells.push('        <mxCell id="1" parent="0" />');

  const title = isEn
    ? '<b><u>1.4.2 Customer Create Rental Order, Sign Contract & Pay Deposit</u></b>'
    : '<b><u>1.4.2 Khách Hàng Tạo Đơn Thuê Váy, Ký Hợp Đồng & Đặt Cọc</u></b>';

  // Title
  addCell(
    'title',
    title,
    'text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=18;fontColor=#155799;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="40" y="25" width="680" height="30" as="geometry" />'
  );

  // PARTICIPANT 1: Actor Customer
  addCell(
    'part_actor',
    'Customer',
    'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;fontStyle=1;',
    '1',
    true,
    false,
    '<mxGeometry x="93" y="70" width="34" height="60" as="geometry" />'
  );
  addCell(
    'line_actor',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="110" y="150" as="sourcePoint" /><mxPoint x="110" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_actor',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="104" y="160" width="12" height="690" as="geometry" />'
  );

  // PARTICIPANT 2: <<user interface>> CheckoutPage
  addCell(
    'box_ui',
    '<<user interface>><br><b>CheckoutPage</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="230" y="75" width="140" height="50" as="geometry" />'
  );
  addCell(
    'line_ui',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="300" y="125" as="sourcePoint" /><mxPoint x="300" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_ui',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="294" y="160" width="12" height="690" as="geometry" />'
  );

  // PARTICIPANT 3: <<route>> orderRoutes
  addCell(
    'box_route',
    '<<route>><br><b>orderRoutes</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="425" y="75" width="130" height="50" as="geometry" />'
  );
  addCell(
    'line_route',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="490" y="125" as="sourcePoint" /><mxPoint x="490" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_route',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="484" y="285" width="12" height="45" as="geometry" />'
  );

  // PARTICIPANT 4: <<control>> orderController
  addCell(
    'box_ctrl',
    '<<control>><br><b>orderController</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="610" y="75" width="140" height="50" as="geometry" />'
  );
  addCell(
    'line_ctrl',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="680" y="125" as="sourcePoint" /><mxPoint x="680" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_ctrl',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="674" y="315" width="12" height="445" as="geometry" />'
  );

  // PARTICIPANT 5: <<service>> orderService
  addCell(
    'box_srv',
    '<<service>><br><b>orderService</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="820" y="75" width="140" height="50" as="geometry" />'
  );
  addCell(
    'line_srv',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="890" y="125" as="sourcePoint" /><mxPoint x="890" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_srv',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="884" y="345" width="12" height="385" as="geometry" />'
  );

  // PARTICIPANT 6: <<database>> OrderModel(MongoDB)
  addCell(
    'box_db',
    '<<database>><br><b>OrderModel(MongoDB)</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="1030" y="75" width="160" height="50" as="geometry" />'
  );
  addCell(
    'line_db',
    '',
    'edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1110" y="125" as="sourcePoint" /><mxPoint x="1110" y="865" as="targetPoint" /></mxGeometry>'
  );
  addCell(
    'act_db',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="1104" y="645" width="12" height="50" as="geometry" />'
  );

  const solidCall = 'html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';
  const dashedReturn = 'html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';

  // 1.1
  addCell(
    'msg1_1',
    isEn ? '1.1: Select rental dates, days, delivery method & fill measurements' : '1.1: Chọn ngày thuê, số ngày, phương thức nhận váy & điền số đo',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="175" as="sourcePoint" /><mxPoint x="294" y="175" as="targetPoint" /></mxGeometry>'
  );

  // 1.2
  addCell(
    'msg1_2',
    isEn ? '1.2: Review rental contract terms & submit electronic signature' : '1.2: Xem điều khoản hợp đồng & thực hiện ký tên điện tử',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="215" as="sourcePoint" /><mxPoint x="294" y="215" as="targetPoint" /></mxGeometry>'
  );

  // 1.3
  addCell(
    'msg1_3',
    isEn ? '1.3: Select deposit option (50%/100%), scan VietQR & click \'Confirm Deposit\'' : '1.3: Chọn gói đặt cọc (50%/100%), quét VietQR & click \'Xác nhận đặt cọc\'',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="255" as="sourcePoint" /><mxPoint x="294" y="255" as="targetPoint" /></mxGeometry>'
  );

  // 1.4
  addCell(
    'msg1_4',
    '1.4: POST /api/orders (body: orderPayload)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="306" y="290" as="sourcePoint" /><mxPoint x="484" y="290" as="targetPoint" /></mxGeometry>'
  );

  // 1.5
  addCell(
    'msg1_5',
    '1.5: createOrder(req, res, next)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="496" y="320" as="sourcePoint" /><mxPoint x="674" y="320" as="targetPoint" /></mxGeometry>'
  );

  // 1.6
  addCell(
    'msg1_6',
    '1.6: createOrder(req.body, req.user)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="686" y="350" as="sourcePoint" /><mxPoint x="884" y="350" as="targetPoint" /></mxGeometry>'
  );

  // 1.7
  addCell(
    'msg1_7',
    isEn ? '1.7: Validate input: items, rentalDates, customerContact, contractSignature' : '1.7: Kiểm tra hợp lệ: items, rentalDates, thông tin liên hệ, chữ ký HĐ',
    'html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="380" as="sourcePoint" /><mxPoint x="896" y="405" as="targetPoint" /><Array as="points"><mxPoint x="935" y="380" /><mxPoint x="935" y="405" /></Array></mxGeometry>'
  );

  // ALT FRAME
  addCell(
    'alt_frame',
    'alt',
    'shape=umlFrame;whiteSpace=wrap;html=1;width=50;height=25;boundedLbl=1;strokeColor=#000000;fillColor=none;fontSize=11;fontStyle=1;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="50" y="425" width="1160" height="420" as="geometry" />'
  );

  // Guard 1
  addCell(
    'guard_1',
    isEn ? '[Scenario 1: Validation Failed / Missing Info / Empty Items]' : '[Scenario 1: Xác thực thất bại / Thiếu thông tin / Không có sản phẩm]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="450" width="450" height="20" as="geometry" />'
  );

  // 1.8
  addCell(
    'msg1_8',
    isEn ? '1.8: throw Error("Rental order requires at least 1 dress item / Missing info...")' : '1.8: throw Error("Đơn thuê cần ít nhất 1 sản phẩm váy cưới / Thiếu thông tin...")',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="480" as="sourcePoint" /><mxPoint x="686" y="480" as="targetPoint" /></mxGeometry>'
  );

  // 1.9
  addCell(
    'msg1_9',
    '1.9: HTTP 400 Bad Request { success: false, message }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="510" as="sourcePoint" /><mxPoint x="306" y="510" as="targetPoint" /></mxGeometry>'
  );

  // 1.10
  addCell(
    'msg1_10',
    isEn ? '1.10: Display error notification toast on UI & scroll to missing step' : '1.10: Hiển thị thông báo lỗi trên UI & cuộn về bước cần bổ sung',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="540" as="sourcePoint" /><mxPoint x="116" y="540" as="targetPoint" /></mxGeometry>'
  );

  // ALT DIVIDER
  addCell(
    'alt_divider',
    '',
    'edgeStyle=none;html=1;strokeColor=#666666;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="50" y="565" as="sourcePoint" /><mxPoint x="1210" y="565" as="targetPoint" /></mxGeometry>'
  );

  // Guard 2
  addCell(
    'guard_2',
    isEn ? '[Scenario 2: Validation Passed / Success]' : '[Scenario 2: Xác thực thành công / Tạo đơn & Hợp đồng]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="575" width="450" height="20" as="geometry" />'
  );

  // 1.11
  addCell(
    'msg1_11',
    isEn ? '1.11: Calculate fees (totalRent, totalDeposit, depositPaid) & generate code: UB-2026-XXX, HĐ-UB-2026-XXX' : '1.11: Tính toán chi phí (totalRent, totalDeposit, depositPaid) & Sinh mã: UB-2026-XXX, HĐ-UB-2026-XXX',
    'html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="600" as="sourcePoint" /><mxPoint x="896" y="625" as="targetPoint" /><Array as="points"><mxPoint x="935" y="600" /><mxPoint x="935" y="625" /></Array></mxGeometry>'
  );

  // 1.12
  addCell(
    'msg1_12',
    '1.12: OrderModel.create(orderDoc)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="655" as="sourcePoint" /><mxPoint x="1104" y="655" as="targetPoint" /></mxGeometry>'
  );

  // 1.13
  addCell(
    'msg1_13',
    isEn ? '1.13: Return savedOrderDoc (status: \'deposit_paid\')' : '1.13: return savedOrderDoc (status: \'deposit_paid\')',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1104" y="685" as="sourcePoint" /><mxPoint x="896" y="685" as="targetPoint" /></mxGeometry>'
  );

  // 1.14
  addCell(
    'msg1_14',
    isEn ? '1.14: Return newOrder' : '1.14: return newOrder',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="715" as="sourcePoint" /><mxPoint x="686" y="715" as="targetPoint" /></mxGeometry>'
  );

  // 1.15
  addCell(
    'msg1_15',
    isEn ? '1.15: HTTP 201 Created { success: true, message: \'Order created successfully!\', data: order }' : '1.15: HTTP 201 Created { success: true, message: \'Tạo đơn và ký HĐ thành công!\', data: order }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="745" as="sourcePoint" /><mxPoint x="306" y="745" as="targetPoint" /></mxGeometry>'
  );

  // 1.16
  addCell(
    'msg1_16',
    isEn ? '1.16: Show Success Modal, clear cart & redirect to Order Detail (/orders/:id)' : '1.16: Hiển thị Success Modal, xóa giỏ hàng & chuyển hướng xem đơn hàng (/orders/:id)',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="780" as="sourcePoint" /><mxPoint x="116" y="780" as="targetPoint" /></mxGeometry>'
  );

  // 1.17
  addCell(
    'msg1_17',
    isEn ? '1.17: Send confirmation email & attached electronic rental contract' : '1.17: Gửi email xác nhận đặt cọc kèm file Hợp đồng thuê váy cưới điện tử',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="815" as="sourcePoint" /><mxPoint x="116" y="815" as="targetPoint" /></mxGeometry>'
  );

  const diagramName = isEn ? '1.4.2 Customer Create Order' : '1.4.2 Khách Hàng Tạo Đơn &amp; Đặt Cọc';

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-04T03:25:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram id="CustomerOrderSequence_${isEn ? 'EN' : 'VN'}" name="${diagramName}">
    <mxGraphModel dx="1434" dy="894" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1250" pageHeight="920" background="#ffffff" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

// 1. File chuẩn tiếng Anh theo mẫu 1.4.1
fs.writeFileSync('docs/diagrams/1.4.2_customer_order_contract_deposit_sequence.drawio', generateXml(true), 'utf8');
console.log('Saved 1.4.2_customer_order_contract_deposit_sequence.drawio');

// 2. File tiếng Việt chi tiết
fs.writeFileSync('docs/diagrams/1.4.2_khach_hang_tao_don_thue_va_ky_hop_dong_dat_coc.drawio', generateXml(false), 'utf8');
console.log('Saved 1.4.2_khach_hang_tao_don_thue_va_ky_hop_dong_dat_coc.drawio');
