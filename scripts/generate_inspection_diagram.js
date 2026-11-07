import fs from 'fs';
import path from 'path';

function generateInspectionXml(isEn = true) {
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
    ? '<b><u>1.4.4 Staff Inspect Returned Dress & Settle Damage Charges</u></b>'
    : '<b><u>1.4.4 Nhân Viên Kiểm Định Trả Váy &amp; Quyết Toán Hư Tổn</u></b>';

  // Title
  addCell(
    'title',
    title,
    'text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=18;fontColor=#155799;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="40" y="25" width="720" height="30" as="geometry" />'
  );

  // PARTICIPANT 1: Actor Staff
  addCell(
    'part_actor',
    'Staff',
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

  // PARTICIPANT 2: <<user interface>> InspectionModal (OrderRentalManagement)
  addCell(
    'box_ui',
    '<<user interface>><br><b>InspectionModal</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="220" y="75" width="160" height="50" as="geometry" />'
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
    '<mxGeometry x="484" y="245" width="12" height="50" as="geometry" />'
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
    '<mxGeometry x="674" y="275" width="12" height="500" as="geometry" />'
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
    '<mxGeometry x="884" y="305" width="12" height="440" as="geometry" />'
  );

  // PARTICIPANT 6: <<database>> MongoDB (Order & Inspection)
  addCell(
    'box_db',
    '<<database>><br><b>MongoDB (Order &amp; Inspection)</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="1010" y="75" width="200" height="50" as="geometry" />'
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
    'act_db_1',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="1104" y="340" width="12" height="45" as="geometry" />'
  );
  addCell(
    'act_db_2',
    '',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    '1',
    true,
    false,
    '<mxGeometry x="1104" y="625" width="12" height="85" as="geometry" />'
  );

  const solidCall = 'html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';
  const dashedReturn = 'html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';

  // 1.1
  addCell(
    'msg1_1',
    isEn ? '1.1: Inspect returned dresses, select condition & enter repair fees' : '1.1: Giám định váy cưới trả về, chọn tình trạng & nhập phí khắc phục',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="175" as="sourcePoint" /><mxPoint x="294" y="175" as="targetPoint" /></mxGeometry>'
  );

  // 1.2
  addCell(
    'msg1_2',
    isEn ? '1.2: Attach evidence photos & click \'Lưu biên bản kiểm định\'' : '1.2: Tải lên ảnh bằng chứng hư tổn & nhấn \'Lưu biên bản kiểm định\'',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="215" as="sourcePoint" /><mxPoint x="294" y="215" as="targetPoint" /></mxGeometry>'
  );

  // 1.3
  addCell(
    'msg1_3',
    '1.3: POST /api/orders/:id/inspection (body: { itemsCondition, evidencePhotos })',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="306" y="250" as="sourcePoint" /><mxPoint x="484" y="250" as="targetPoint" /></mxGeometry>'
  );

  // 1.4
  addCell(
    'msg1_4',
    '1.4: submitReturnInspection(req, res, next)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="496" y="280" as="sourcePoint" /><mxPoint x="674" y="280" as="targetPoint" /></mxGeometry>'
  );

  // 1.5
  addCell(
    'msg1_5',
    '1.5: submitReturnInspection(orderId, req.body, req.user)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="686" y="310" as="sourcePoint" /><mxPoint x="884" y="310" as="targetPoint" /></mxGeometry>'
  );

  // 1.6
  addCell(
    'msg1_6',
    '1.6: Order.findById(orderId)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="345" as="sourcePoint" /><mxPoint x="1104" y="345" as="targetPoint" /></mxGeometry>'
  );

  // ALT FRAME
  addCell(
    'alt_frame',
    'alt',
    'shape=umlFrame;whiteSpace=wrap;html=1;width=50;height=25;boundedLbl=1;strokeColor=#000000;fillColor=none;fontSize=11;fontStyle=1;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="50" y="380" width="1160" height="465" as="geometry" />'
  );

  // Guard 1
  addCell(
    'guard_1',
    isEn ? '[Scenario 1: Order Not Found / Invalid Status / Fee Exceeds Limit]' : '[Scenario 1: Không tìm thấy đơn / Trạng thái không hợp lệ / Phí vượt cọc]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="405" width="480" height="20" as="geometry" />'
  );

  // 1.7
  addCell(
    'msg1_7',
    isEn ? '1.7: throw Error("Đơn thuê chưa ở trạng thái có thể kiểm định / Phí vượt giá trị...")' : '1.7: throw Error("Đơn thuê chưa ở trạng thái có thể kiểm định / Phí vượt giá trị...")',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="445" as="sourcePoint" /><mxPoint x="686" y="445" as="targetPoint" /></mxGeometry>'
  );

  // 1.8
  addCell(
    'msg1_8',
    '1.8: HTTP 400 Bad Request { success: false, message }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="480" as="sourcePoint" /><mxPoint x="306" y="480" as="targetPoint" /></mxGeometry>'
  );

  // 1.9
  addCell(
    'msg1_9',
    isEn ? '1.9: Display error notification toast on form UI' : '1.9: Hiển thị thông báo lỗi trên giao diện form kiểm định',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="515" as="sourcePoint" /><mxPoint x="116" y="515" as="targetPoint" /></mxGeometry>'
  );

  // ALT DIVIDER
  addCell(
    'alt_divider',
    '',
    'edgeStyle=none;html=1;strokeColor=#666666;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="50" y="540" as="sourcePoint" /><mxPoint x="1210" y="540" as="targetPoint" /></mxGeometry>'
  );

  // Guard 2
  addCell(
    'guard_2',
    isEn ? '[Scenario 2: Validation Passed / Settlement & Inspection Created]' : '[Scenario 2: Xác thực thành công / Quyết toán & Tạo biên bản kiểm định]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="550" width="480" height="20" as="geometry" />'
  );

  // 1.10
  addCell(
    'msg1_10',
    isEn ? '1.10: Calculate latePenaltyFee, damageTotal, totalDeduction & finalRefundAmount' : '1.10: Tính latePenaltyFee, damageTotal, totalDeduction & finalRefundAmount',
    'html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="570" as="sourcePoint" /><mxPoint x="896" y="593" as="targetPoint" /><Array as="points"><mxPoint x="935" y="570" /><mxPoint x="935" y="593" /></Array></mxGeometry>'
  );

  // 1.11
  addCell(
    'msg1_11',
    '1.11: ReturnInspection.create(inspectionDoc)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="615" as="sourcePoint" /><mxPoint x="1104" y="615" as="targetPoint" /></mxGeometry>'
  );

  // 1.12
  addCell(
    'msg1_12',
    isEn ? '1.12: return savedInspection (status: \'pending\')' : '1.12: return savedInspection (status: \'pending\')',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1104" y="645" as="sourcePoint" /><mxPoint x="896" y="645" as="targetPoint" /></mxGeometry>'
  );

  // 1.13
  addCell(
    'msg1_13',
    '1.13: order.status = \'returned\'; await order.save()',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="675" as="sourcePoint" /><mxPoint x="1104" y="675" as="targetPoint" /></mxGeometry>'
  );

  // 1.14
  addCell(
    'msg1_14',
    isEn ? '1.14: sendInspectionNotificationEmail(customerEmail, ...)' : '1.14: sendInspectionNotificationEmail(customerEmail, ...)',
    'html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="700" as="sourcePoint" /><mxPoint x="896" y="723" as="targetPoint" /><Array as="points"><mxPoint x="935" y="700" /><mxPoint x="935" y="723" /></Array></mxGeometry>'
  );

  // 1.15
  addCell(
    'msg1_15',
    '1.15: return { order, inspection }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="740" as="sourcePoint" /><mxPoint x="686" y="740" as="targetPoint" /></mxGeometry>'
  );

  // 1.16
  addCell(
    'msg1_16',
    isEn ? '1.16: HTTP 201 Created { success: true, message: \'Lập biên bản thành công!\', data }' : '1.16: HTTP 201 Created { success: true, message: \'Lập biên bản thành công!\', data }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="770" as="sourcePoint" /><mxPoint x="306" y="770" as="targetPoint" /></mxGeometry>'
  );

  // 1.17
  addCell(
    'msg1_17',
    isEn ? '1.17: Show toast "Lưu biên bản thành công", update status badge to Returned' : '1.17: Hiển thị toast "Lưu biên bản thành công", đổi trạng thái sang Đã trả váy',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="805" as="sourcePoint" /><mxPoint x="116" y="805" as="targetPoint" /></mxGeometry>'
  );

  const diagramName = isEn ? '1.4.4 Staff Return Inspection' : '1.4.4 Nhân Viên Kiểm Định Trả Váy';

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-04T04:10:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram id="StaffReturnInspection_${isEn ? 'EN' : 'VN'}" name="${diagramName}">
    <mxGraphModel dx="1434" dy="894" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1250" pageHeight="920" background="#ffffff" math="0" shadow="0">
      <root>
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

// Write English and Vietnamese files
fs.writeFileSync('docs/diagrams/1.4.4_staff_return_inspection_settlement_sequence.drawio', generateInspectionXml(true), 'utf8');
console.log('Saved docs/diagrams/1.4.4_staff_return_inspection_settlement_sequence.drawio');

fs.writeFileSync('docs/diagrams/1.4.4_nhan_vien_kiem_dinh_tra_vay_va_quyet_toan_hu_ton.drawio', generateInspectionXml(false), 'utf8');
console.log('Saved docs/diagrams/1.4.4_nhan_vien_kiem_dinh_tra_vay_va_quyet_toan_hu_ton.drawio');

// Generate SVG
function generateInspectionSvg(isEn = true) {
  const title = isEn
    ? "1.4.4 Staff Inspect Returned Dress & Settle Damage Charges"
    : "1.4.4 Nhân Viên Kiểm Định Trả Váy & Quyết Toán Hư Tổn";

  const msg1_1 = isEn
    ? "1.1: Inspect returned dresses, select condition & enter repair fees"
    : "1.1: Giám định váy cưới trả về, chọn tình trạng & nhập phí khắc phục";

  const msg1_2 = isEn
    ? "1.2: Attach evidence photos & click 'Lưu biên bản kiểm định'"
    : "1.2: Tải lên ảnh bằng chứng hư tổn & nhấn 'Lưu biên bản kiểm định'";

  const msg1_3 = "1.3: POST /api/orders/:id/inspection (body: { itemsCondition, evidencePhotos })";
  const msg1_4 = "1.4: submitReturnInspection(req, res, next)";
  const msg1_5 = "1.5: submitReturnInspection(orderId, req.body, req.user)";
  const msg1_6 = "1.6: Order.findById(orderId)";

  const guard1 = isEn
    ? "[Scenario 1: Order Not Found / Invalid Status / Fee Exceeds Limit]"
    : "[Scenario 1: Không tìm thấy đơn / Trạng thái không hợp lệ / Phí vượt cọc]";

  const msg1_7 = isEn
    ? "1.7: throw Error(\"Đơn thuê chưa ở trạng thái có thể kiểm định / Phí vượt giá trị...\")"
    : "1.7: throw Error(\"Đơn thuê chưa ở trạng thái có thể kiểm định / Phí vượt giá trị...\")";

  const msg1_8 = "1.8: HTTP 400 Bad Request { success: false, message }";
  const msg1_9 = isEn
    ? "1.9: Display error notification toast on form UI"
    : "1.9: Hiển thị thông báo lỗi trên giao diện form kiểm định";

  const guard2 = isEn
    ? "[Scenario 2: Validation Passed / Settlement & Inspection Created]"
    : "[Scenario 2: Xác thực thành công / Quyết toán & Tạo biên bản kiểm định]";

  const msg1_10 = isEn
    ? "1.10: Calculate latePenaltyFee, damageTotal, totalDeduction & finalRefundAmount"
    : "1.10: Tính latePenaltyFee, damageTotal, totalDeduction & finalRefundAmount";

  const msg1_11 = "1.11: ReturnInspection.create(inspectionDoc)";
  const msg1_12 = isEn
    ? "1.12: return savedInspection (status: 'pending')"
    : "1.12: return savedInspection (status: 'pending')";

  const msg1_13 = "1.13: order.status = 'returned'; await order.save()";
  const msg1_14 = "1.14: sendInspectionNotificationEmail(customerEmail, ...)";
  const msg1_15 = "1.15: return { order, inspection }";
  const msg1_16 = isEn
    ? "1.16: HTTP 201 Created { success: true, message: 'Lập biên bản thành công!', data }"
    : "1.16: HTTP 201 Created { success: true, message: 'Lập biên bản thành công!', data }";
  const msg1_17 = isEn
    ? "1.17: Show toast \"Lưu biên bản thành công\", update status badge to Returned"
    : "1.17: Hiển thị toast \"Lưu biên bản thành công\", đổi trạng thái sang Đã trả váy";

  const xActor = 110;
  const xUI = 310;
  const xRoute = 500;
  const xCtrl = 690;
  const xSrv = 900;
  const xDB = 1120;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 920" width="100%" height="100%" style="background:#ffffff; font-family: Helvetica, Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
    </marker>
    <marker id="open-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#000000" stroke-width="1.5" />
    </marker>
  </defs>

  <text x="45" y="42" font-size="20" font-weight="bold" fill="#155799" text-decoration="underline">${title}</text>

  <!-- LIFELINES -->
  <line x1="${xActor}" y1="150" x2="${xActor}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xUI}" y1="130" x2="${xUI}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xRoute}" y1="130" x2="${xRoute}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xCtrl}" y1="130" x2="${xCtrl}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xSrv}" y1="130" x2="${xSrv}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />
  <line x1="${xDB}" y1="130" x2="${xDB}" y2="865" stroke="#b0b0b0" stroke-width="1.2" stroke-dasharray="5,5" />

  <!-- HEADERS -->
  <g transform="translate(${xActor - 18}, 65)">
    <circle cx="18" cy="10" r="10" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="20" x2="18" y2="40" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="6" y1="27" x2="30" y2="27" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="40" x2="8" y2="58" stroke="#6c8ebf" stroke-width="1.5" />
    <line x1="18" y1="40" x2="28" y2="58" stroke="#6c8ebf" stroke-width="1.5" />
    <text x="18" y="74" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">Staff</text>
  </g>

  <rect x="${xUI - 80}" y="75" width="160" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xUI}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;user interface&gt;&gt;</text>
  <text x="${xUI}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">InspectionModal</text>

  <rect x="${xRoute - 65}" y="75" width="130" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xRoute}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;route&gt;&gt;</text>
  <text x="${xRoute}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderRoutes</text>

  <rect x="${xCtrl - 70}" y="75" width="140" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xCtrl}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;control&gt;&gt;</text>
  <text x="${xCtrl}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderController</text>

  <rect x="${xSrv - 70}" y="75" width="140" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xSrv}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;service&gt;&gt;</text>
  <text x="${xSrv}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">orderService</text>

  <rect x="${xDB - 100}" y="75" width="200" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xDB}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;database&gt;&gt;</text>
  <text x="${xDB}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">MongoDB (Order &amp; Inspection)</text>

  <!-- ACTIVATION BARS -->
  <rect x="${xActor - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xUI - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xRoute - 6}" y="245" width="12" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xCtrl - 6}" y="275" width="12" height="500" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xSrv - 6}" y="305" width="12" height="440" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xDB - 6}" y="340" width="12" height="45" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xDB - 6}" y="610" width="12" height="85" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />

  <!-- MESSAGES -->
  <!-- 1.1 -->
  <line x1="${xActor + 6}" y1="175" x2="${xUI - 6}" y2="175" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xActor + xUI) / 2}" y="169" font-size="11" fill="#000000" text-anchor="middle">${msg1_1}</text>

  <!-- 1.2 -->
  <line x1="${xActor + 6}" y1="215" x2="${xUI - 6}" y2="215" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xActor + xUI) / 2}" y="209" font-size="11" fill="#000000" text-anchor="middle">${msg1_2}</text>

  <!-- 1.3 -->
  <line x1="${xUI + 6}" y1="250" x2="${xRoute - 6}" y2="250" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xUI + xRoute) / 2}" y="244" font-size="11" fill="#000000" text-anchor="middle">${msg1_3}</text>

  <!-- 1.4 -->
  <line x1="${xRoute + 6}" y1="280" x2="${xCtrl - 6}" y2="280" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xRoute + xCtrl) / 2}" y="274" font-size="11" fill="#000000" text-anchor="middle">${msg1_4}</text>

  <!-- 1.5 -->
  <line x1="${xCtrl + 6}" y1="310" x2="${xSrv - 6}" y2="310" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="304" font-size="11" fill="#000000" text-anchor="middle">${msg1_5}</text>

  <!-- 1.6 -->
  <line x1="${xSrv + 6}" y1="345" x2="${xDB - 6}" y2="345" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="339" font-size="11" fill="#000000" text-anchor="middle">${msg1_6}</text>

  <!-- ALT FRAME -->
  <rect x="50" y="380" width="1170" height="465" fill="none" stroke="#000000" stroke-width="1.2" />
  <path d="M 50 380 L 110 380 L 110 400 L 100 410 L 50 410 Z" fill="#f0f0f0" stroke="#000000" stroke-width="1.2" />
  <text x="75" y="400" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">alt</text>

  <!-- Scenario 1 Guard -->
  <text x="65" y="425" font-size="11" font-weight="bold" fill="#333333">${guard1}</text>

  <!-- 1.7 -->
  <line x1="${xSrv - 6}" y1="445" x2="${xCtrl + 6}" y2="445" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="439" font-size="11" fill="#cc0000" text-anchor="middle">${msg1_7}</text>

  <!-- 1.8 -->
  <line x1="${xCtrl - 6}" y1="480" x2="${xUI + 6}" y2="480" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="474" font-size="11" fill="#000000" text-anchor="middle">${msg1_8}</text>

  <!-- 1.9 -->
  <line x1="${xUI - 6}" y1="515" x2="${xActor + 6}" y2="515" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="509" font-size="11" fill="#000000" text-anchor="middle">${msg1_9}</text>

  <!-- ALT DIVIDER LINE -->
  <line x1="50" y1="540" x2="1220" y2="540" stroke="#666666" stroke-width="1.2" stroke-dasharray="6,4" />

  <!-- Scenario 2 Guard -->
  <text x="65" y="560" font-size="11" font-weight="bold" fill="#333333">${guard2}</text>

  <!-- 1.10 -->
  <path d="M ${xSrv + 6} 570 L ${xSrv + 38} 570 L ${xSrv + 38} 593 L ${xSrv + 6} 593" fill="none" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${xSrv + 44}" y="585" font-size="11" fill="#000000" text-anchor="start">${msg1_10}</text>

  <!-- 1.11 -->
  <line x1="${xSrv + 6}" y1="615" x2="${xDB - 6}" y2="615" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="609" font-size="11" fill="#000000" text-anchor="middle">${msg1_11}</text>

  <!-- 1.12 -->
  <line x1="${xDB - 6}" y1="645" x2="${xSrv + 6}" y2="645" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="639" font-size="11" fill="#000000" text-anchor="middle">${msg1_12}</text>

  <!-- 1.13 -->
  <line x1="${xSrv + 6}" y1="675" x2="${xDB - 6}" y2="675" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="669" font-size="11" fill="#000000" text-anchor="middle">${msg1_13}</text>

  <!-- 1.14 -->
  <path d="M ${xSrv + 6} 700 L ${xSrv + 38} 700 L ${xSrv + 38} 723 L ${xSrv + 6} 723" fill="none" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${xSrv + 44}" y="715" font-size="11" fill="#000000" text-anchor="start">${msg1_14}</text>

  <!-- 1.15 -->
  <line x1="${xSrv - 6}" y1="740" x2="${xCtrl + 6}" y2="740" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="734" font-size="11" fill="#000000" text-anchor="middle">${msg1_15}</text>

  <!-- 1.16 -->
  <line x1="${xCtrl - 6}" y1="770" x2="${xUI + 6}" y2="770" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="764" font-size="11" fill="#000000" text-anchor="middle">${msg1_16}</text>

  <!-- 1.17 -->
  <line x1="${xUI - 6}" y1="805" x2="${xActor + 6}" y2="805" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="799" font-size="11" fill="#000000" text-anchor="middle">${msg1_17}</text>

</svg>`;
}

const svgInspectionContent = generateInspectionSvg(true);
fs.writeFileSync('docs/diagrams/1.4.4_staff_return_inspection_settlement_sequence.svg', svgInspectionContent, 'utf8');
console.log('Saved docs/diagrams/1.4.4_staff_return_inspection_settlement_sequence.svg');

// Generate Interactive HTML Viewer in Artifact Directory
const artifactDir = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\49f42edd-dcf5-4c3f-b02f-f5a91777514f';
const htmlViewer = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Sequence Diagram Viewer: Staff Return Inspection & Settlement</title>
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
          <span>🔍</span>
          <span id="titleText">1.4.4 Staff Inspect Returned Dress & Settle Damage Charges</span>
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          Quy trình Nhân viên Showroom kiểm định trả váy & quyết toán hư tổn (Layered Architecture: React SPA $\\rightarrow$ Routes $\\rightarrow$ Controllers $\\rightarrow$ Services $\\rightarrow$ MongoDB)
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button id="btnEn" onclick="switchLang('EN')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition">
          English (Mẫu chuẩn)
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
      ${svgInspectionContent}
    </div>

    <!-- Footer Legend -->
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
    const svgEN = ${JSON.stringify(generateInspectionSvg(true))};
    const svgVN = ${JSON.stringify(generateInspectionSvg(false))};

    function switchLang(lang) {
      const wrapper = document.getElementById('svgWrapper');
      const title = document.getElementById('titleText');
      const btnEn = document.getElementById('btnEn');
      const btnVn = document.getElementById('btnVn');

      if (lang === 'EN') {
        wrapper.innerHTML = svgEN;
        title.innerText = "1.4.4 Staff Inspect Returned Dress & Settle Damage Charges";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      } else {
        wrapper.innerHTML = svgVN;
        title.innerText = "1.4.4 Nhân Viên Kiểm Định Trả Váy & Quyết Toán Hư Tổn";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      }
    }

    function downloadDrawio() {
      window.open('file:///c:/Users/admin/Downloads/Wedding-Dress-Rental-Website-System/docs/diagrams/1.4.4_staff_return_inspection_settlement_sequence.drawio');
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(artifactDir, 'inspection_settlement_viewer.html'), htmlViewer, 'utf8');
console.log('Saved inspection_settlement_viewer.html in artifact directory!');

fs.writeFileSync('docs/diagrams/inspection_settlement_viewer.html', htmlViewer, 'utf8');
console.log('Saved docs/diagrams/inspection_settlement_viewer.html');

