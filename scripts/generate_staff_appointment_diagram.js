import fs from 'fs';
import path from 'path';

function generateAppointmentXml(isEn = true) {
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
    ? '<b><u>1.4.3 Staff Receive & Confirm Dress Trial Appointment</u></b>'
    : '<b><u>1.4.3 Nhân Viên Tiếp Nhận &amp; Xác Nhận Lịch Hẹn Thử Váy</u></b>';

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

  // PARTICIPANT 2: <<user interface>> AppointmentManagement
  addCell(
    'box_ui',
    '<<user interface>><br><b>AppointmentManagement</b>',
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

  // PARTICIPANT 3: <<route>> appointmentRoutes
  addCell(
    'box_route',
    '<<route>><br><b>appointmentRoutes</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="415" y="75" width="150" height="50" as="geometry" />'
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

  // PARTICIPANT 4: <<control>> appointmentController
  addCell(
    'box_ctrl',
    '<<control>><br><b>appointmentController</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="600" y="75" width="160" height="50" as="geometry" />'
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
    '<mxGeometry x="674" y="275" width="12" height="495" as="geometry" />'
  );

  // PARTICIPANT 5: <<service>> appointmentService
  addCell(
    'box_srv',
    '<<service>><br><b>appointmentService</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="810" y="75" width="160" height="50" as="geometry" />'
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
    '<mxGeometry x="884" y="305" width="12" height="435" as="geometry" />'
  );

  // PARTICIPANT 6: <<database>> AppointmentModel(MongoDB)
  addCell(
    'box_db',
    '<<database>><br><b>AppointmentModel(MongoDB)</b>',
    'rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;',
    '1',
    true,
    false,
    '<mxGeometry x="1015" y="75" width="190" height="50" as="geometry" />'
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
    '<mxGeometry x="1104" y="625" width="12" height="50" as="geometry" />'
  );

  const solidCall = 'html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';
  const dashedReturn = 'html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;';

  // 1.1
  addCell(
    'msg1_1',
    isEn ? '1.1: View pending appointments list (filtered by showroom branch)' : '1.1: Xem danh sách lịch hẹn chờ duyệt (lọc theo chi nhánh showroom)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="175" as="sourcePoint" /><mxPoint x="294" y="175" as="targetPoint" /></mxGeometry>'
  );

  // 1.2
  addCell(
    'msg1_2',
    isEn ? '1.2: Check trial suite availability & click \'Xác nhận lịch\' (Confirm)' : '1.2: Kiểm tra phòng thử VIP khả dụng & nhấn \'Xác nhận lịch\'',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="116" y="215" as="sourcePoint" /><mxPoint x="294" y="215" as="targetPoint" /></mxGeometry>'
  );

  // 1.3
  addCell(
    'msg1_3',
    '1.3: PATCH /api/appointments/:id/status (body: { status: \'confirmed\' })',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="306" y="250" as="sourcePoint" /><mxPoint x="484" y="250" as="targetPoint" /></mxGeometry>'
  );

  // 1.4
  addCell(
    'msg1_4',
    '1.4: updateAppointmentStatus(req, res, next)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="496" y="280" as="sourcePoint" /><mxPoint x="674" y="280" as="targetPoint" /></mxGeometry>'
  );

  // 1.5
  addCell(
    'msg1_5',
    '1.5: updateAppointmentStatus(id, status, staffId)',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="686" y="310" as="sourcePoint" /><mxPoint x="884" y="310" as="targetPoint" /></mxGeometry>'
  );

  // 1.6
  addCell(
    'msg1_6',
    '1.6: AppointmentModel.findById(id)',
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
    isEn ? '[Scenario 1: Appointment Not Found / Invalid ID]' : '[Scenario 1: Không tìm thấy lịch hẹn / ID không tồn tại]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="405" width="450" height="20" as="geometry" />'
  );

  // 1.7
  addCell(
    'msg1_7',
    '1.7: return null',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1104" y="430" as="sourcePoint" /><mxPoint x="896" y="430" as="targetPoint" /></mxGeometry>'
  );

  // 1.8
  addCell(
    'msg1_8',
    isEn ? '1.8: throw Error("Không tìm thấy lịch hẹn.")' : '1.8: throw Error("Không tìm thấy lịch hẹn.")',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="460" as="sourcePoint" /><mxPoint x="686" y="460" as="targetPoint" /></mxGeometry>'
  );

  // 1.9
  addCell(
    'msg1_9',
    '1.9: HTTP 400 / 404 Bad Request { success: false, message }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="490" as="sourcePoint" /><mxPoint x="306" y="490" as="targetPoint" /></mxGeometry>'
  );

  // 1.10
  addCell(
    'msg1_10',
    isEn ? '1.10: Display error notification toast: "Cập nhật trạng thái thất bại"' : '1.10: Hiển thị thông báo lỗi trên UI: "Cập nhật trạng thái thất bại"',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="520" as="sourcePoint" /><mxPoint x="116" y="520" as="targetPoint" /></mxGeometry>'
  );

  // ALT DIVIDER
  addCell(
    'alt_divider',
    '',
    'edgeStyle=none;html=1;strokeColor=#666666;strokeWidth=1;dashed=1;endArrow=none;rounded=0;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="50" y="545" as="sourcePoint" /><mxPoint x="1210" y="545" as="targetPoint" /></mxGeometry>'
  );

  // Guard 2
  addCell(
    'guard_2',
    isEn ? '[Scenario 2: Appointment Found & Successfully Confirmed]' : '[Scenario 2: Tìm thấy lịch hẹn & Xác nhận thành công]',
    'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;',
    '1',
    true,
    false,
    '<mxGeometry x="60" y="555" width="450" height="20" as="geometry" />'
  );

  // 1.11
  addCell(
    'msg1_11',
    '1.11: return appointmentDoc',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1104" y="575" as="sourcePoint" /><mxPoint x="896" y="575" as="targetPoint" /></mxGeometry>'
  );

  // 1.12
  addCell(
    'msg1_12',
    isEn ? '1.12: Update appointment.status = \'confirmed\', assign staffId' : '1.12: Cập nhật appointment.status = \'confirmed\', gán staffId',
    'html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;',
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="595" as="sourcePoint" /><mxPoint x="896" y="618" as="targetPoint" /><Array as="points"><mxPoint x="935" y="595" /><mxPoint x="935" y="618" /></Array></mxGeometry>'
  );

  // 1.13
  addCell(
    'msg1_13',
    '1.13: appointment.save()',
    solidCall,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="896" y="635" as="sourcePoint" /><mxPoint x="1104" y="635" as="targetPoint" /></mxGeometry>'
  );

  // 1.14
  addCell(
    'msg1_14',
    isEn ? '1.14: return updatedAppointment (status: \'confirmed\')' : '1.14: return updatedAppointment (status: \'confirmed\')',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="1104" y="665" as="sourcePoint" /><mxPoint x="896" y="665" as="targetPoint" /></mxGeometry>'
  );

  // 1.15
  addCell(
    'msg1_15',
    '1.15: return appointment',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="884" y="695" as="sourcePoint" /><mxPoint x="686" y="695" as="targetPoint" /></mxGeometry>'
  );

  // 1.16
  addCell(
    'msg1_16',
    isEn ? '1.16: HTTP 200 OK { success: true, message: \'Cập nhật trạng thái thành công!\', data }' : '1.16: HTTP 200 OK { success: true, message: \'Cập nhật trạng thái thành công!\', data }',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="674" y="725" as="sourcePoint" /><mxPoint x="306" y="725" as="targetPoint" /></mxGeometry>'
  );

  // 1.17
  addCell(
    'msg1_17',
    isEn ? '1.17: Show toast "Đã xác nhận", re-fetch & update status badge to Confirmed' : '1.17: Hiển thị toast "Đã xác nhận", tải lại danh sách & đổi badge sang Đã xác nhận',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="760" as="sourcePoint" /><mxPoint x="116" y="760" as="targetPoint" /></mxGeometry>'
  );

  // 1.18
  addCell(
    'msg1_18',
    isEn ? '1.18: Send confirmation SMS / Email to Customer with trial room details' : '1.18: Gửi tin nhắn / Email xác nhận lịch hẹn kèm thông tin phòng thử cho Khách hàng',
    dashedReturn,
    '1',
    false,
    true,
    '<mxGeometry relative="1" as="geometry"><mxPoint x="294" y="795" as="sourcePoint" /><mxPoint x="116" y="795" as="targetPoint" /></mxGeometry>'
  );

  const diagramName = isEn ? '1.4.3 Staff Confirm Appointment' : '1.4.3 Nhân Viên Xác Nhận Lịch Hẹn';

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-04T03:35:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram id="StaffConfirmAppointment_${isEn ? 'EN' : 'VN'}" name="${diagramName}">
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
fs.writeFileSync('docs/diagrams/1.4.3_staff_confirm_appointment_sequence.drawio', generateAppointmentXml(true), 'utf8');
console.log('Saved docs/diagrams/1.4.3_staff_confirm_appointment_sequence.drawio');

fs.writeFileSync('docs/diagrams/1.4.3_nhan_vien_tiep_nhan_va_xac_nhan_lich_hen.drawio', generateAppointmentXml(false), 'utf8');
console.log('Saved docs/diagrams/1.4.3_nhan_vien_tiep_nhan_va_xac_nhan_lich_hen.drawio');

// Generate SVG
function generateAppointmentSvg(isEn = true) {
  const title = isEn
    ? "1.4.3 Staff Receive & Confirm Dress Trial Appointment"
    : "1.4.3 Nhân Viên Tiếp Nhận & Xác Nhận Lịch Hẹn Thử Váy";

  const msg1_1 = isEn
    ? "1.1: View pending appointments list (filtered by showroom branch)"
    : "1.1: Xem danh sách lịch hẹn chờ duyệt (lọc theo chi nhánh showroom)";

  const msg1_2 = isEn
    ? "1.2: Check trial suite availability & click 'Xác nhận lịch' (Confirm)"
    : "1.2: Kiểm tra phòng thử VIP khả dụng & nhấn 'Xác nhận lịch'";

  const msg1_3 = "1.3: PATCH /api/appointments/:id/status (body: { status: 'confirmed' })";
  const msg1_4 = "1.4: updateAppointmentStatus(req, res, next)";
  const msg1_5 = "1.5: updateAppointmentStatus(id, status, staffId)";
  const msg1_6 = "1.6: AppointmentModel.findById(id)";

  const guard1 = isEn
    ? "[Scenario 1: Appointment Not Found / Invalid ID]"
    : "[Scenario 1: Không tìm thấy lịch hẹn / ID không tồn tại]";

  const msg1_7 = "1.7: return null";
  const msg1_8 = "1.8: throw Error(\"Không tìm thấy lịch hẹn.\")";
  const msg1_9 = "1.9: HTTP 400 / 404 Bad Request { success: false, message }";
  const msg1_10 = isEn
    ? "1.10: Display error notification toast: \"Cập nhật trạng thái thất bại\""
    : "1.10: Hiển thị thông báo lỗi trên UI: \"Cập nhật trạng thái thất bại\"";

  const guard2 = isEn
    ? "[Scenario 2: Appointment Found & Successfully Confirmed]"
    : "[Scenario 2: Tìm thấy lịch hẹn & Xác nhận thành công]";

  const msg1_11 = "1.11: return appointmentDoc";
  const msg1_12 = isEn
    ? "1.12: Update appointment.status = 'confirmed', assign staffId"
    : "1.12: Cập nhật appointment.status = 'confirmed', gán staffId";
  const msg1_13 = "1.13: appointment.save()";
  const msg1_14 = "1.14: return updatedAppointment (status: 'confirmed')";
  const msg1_15 = "1.15: return appointment";
  const msg1_16 = "1.16: HTTP 200 OK { success: true, message: 'Cập nhật thành công!', data }";
  const msg1_17 = isEn
    ? "1.17: Show toast \"Đã xác nhận\", re-fetch & update status badge to Confirmed"
    : "1.17: Hiển thị toast \"Đã xác nhận\", tải lại danh sách & đổi badge sang Đã xác nhận";
  const msg1_18 = isEn
    ? "1.18: Send confirmation SMS / Email to Customer with trial room details"
    : "1.18: Gửi tin nhắn / Email xác nhận lịch hẹn kèm thông tin phòng thử cho Khách hàng";

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
  <text x="${xUI}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">AppointmentManagement</text>

  <rect x="${xRoute - 75}" y="75" width="150" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xRoute}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;route&gt;&gt;</text>
  <text x="${xRoute}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">appointmentRoutes</text>

  <rect x="${xCtrl - 80}" y="75" width="160" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xCtrl}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;control&gt;&gt;</text>
  <text x="${xCtrl}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">appointmentController</text>

  <rect x="${xSrv - 80}" y="75" width="160" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xSrv}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;service&gt;&gt;</text>
  <text x="${xSrv}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">appointmentService</text>

  <rect x="${xDB - 95}" y="75" width="190" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.2" />
  <text x="${xDB}" y="94" font-size="11" fill="#333333" text-anchor="middle">&lt;&lt;database&gt;&gt;</text>
  <text x="${xDB}" y="112" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">AppointmentModel(MongoDB)</text>

  <!-- ACTIVATION BARS -->
  <rect x="${xActor - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xUI - 6}" y="160" width="12" height="680" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xRoute - 6}" y="245" width="12" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xCtrl - 6}" y="275" width="12" height="490" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xSrv - 6}" y="305" width="12" height="430" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xDB - 6}" y="340" width="12" height="45" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />
  <rect x="${xDB - 6}" y="625" width="12" height="50" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1" />

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
  <line x1="${xDB - 6}" y1="440" x2="${xSrv + 6}" y2="440" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="434" font-size="11" fill="#000000" text-anchor="middle">${msg1_7}</text>

  <!-- 1.8 -->
  <line x1="${xSrv - 6}" y1="465" x2="${xCtrl + 6}" y2="465" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="459" font-size="11" fill="#cc0000" text-anchor="middle">${msg1_8}</text>

  <!-- 1.9 -->
  <line x1="${xCtrl - 6}" y1="495" x2="${xUI + 6}" y2="495" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="489" font-size="11" fill="#000000" text-anchor="middle">${msg1_9}</text>

  <!-- 1.10 -->
  <line x1="${xUI - 6}" y1="525" x2="${xActor + 6}" y2="525" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="519" font-size="11" fill="#000000" text-anchor="middle">${msg1_10}</text>

  <!-- ALT DIVIDER LINE -->
  <line x1="50" y1="548" x2="1220" y2="548" stroke="#666666" stroke-width="1.2" stroke-dasharray="6,4" />

  <!-- Scenario 2 Guard -->
  <text x="65" y="568" font-size="11" font-weight="bold" fill="#333333">${guard2}</text>

  <!-- 1.11 -->
  <line x1="${xDB - 6}" y1="585" x2="${xSrv + 6}" y2="585" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="579" font-size="11" fill="#000000" text-anchor="middle">${msg1_11}</text>

  <!-- 1.12 -->
  <path d="M ${xSrv + 6} 600 L ${xSrv + 38} 600 L ${xSrv + 38} 623 L ${xSrv + 6} 623" fill="none" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${xSrv + 44}" y="615" font-size="11" fill="#000000" text-anchor="start">${msg1_12}</text>

  <!-- 1.13 -->
  <line x1="${xSrv + 6}" y1="640" x2="${xDB - 6}" y2="640" stroke="#000000" stroke-width="1.2" marker-end="url(#arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="634" font-size="11" fill="#000000" text-anchor="middle">${msg1_13}</text>

  <!-- 1.14 -->
  <line x1="${xDB - 6}" y1="670" x2="${xSrv + 6}" y2="670" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xSrv + xDB) / 2}" y="664" font-size="11" fill="#000000" text-anchor="middle">${msg1_14}</text>

  <!-- 1.15 -->
  <line x1="${xSrv - 6}" y1="700" x2="${xCtrl + 6}" y2="700" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xCtrl + xSrv) / 2}" y="694" font-size="11" fill="#000000" text-anchor="middle">${msg1_15}</text>

  <!-- 1.16 -->
  <line x1="${xCtrl - 6}" y1="730" x2="${xUI + 6}" y2="730" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xUI + xCtrl) / 2}" y="724" font-size="11" fill="#000000" text-anchor="middle">${msg1_16}</text>

  <!-- 1.17 -->
  <line x1="${xUI - 6}" y1="765" x2="${xActor + 6}" y2="765" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="759" font-size="11" fill="#000000" text-anchor="middle">${msg1_17}</text>

  <!-- 1.18 -->
  <line x1="${xUI - 6}" y1="800" x2="${xActor + 6}" y2="800" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#open-arrow)" />
  <text x="${(xActor + xUI) / 2}" y="794" font-size="11" fill="#000000" text-anchor="middle">${msg1_18}</text>
</svg>`;
}

const svgAppointmentContent = generateAppointmentSvg(true);
fs.writeFileSync('docs/diagrams/1.4.3_staff_confirm_appointment_sequence.svg', svgAppointmentContent, 'utf8');
console.log('Saved docs/diagrams/1.4.3_staff_confirm_appointment_sequence.svg');

// Generate Interactive HTML Viewer in Artifact Directory
const artifactDir = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\49f42edd-dcf5-4c3f-b02f-f5a91777514f';
const htmlViewer = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Sequence Diagram Viewer: Staff Confirm Appointment</title>
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
          <span>👔</span>
          <span id="titleText">1.4.3 Staff Receive & Confirm Dress Trial Appointment</span>
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          Quy trình Nhân viên Showroom tiếp nhận & xác nhận lịch thử váy VIP (Layered Architecture: React SPA $\\rightarrow$ Routes $\\rightarrow$ Controllers $\\rightarrow$ Services $\\rightarrow$ MongoDB)
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
      ${svgAppointmentContent}
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
    const svgEN = ${JSON.stringify(generateAppointmentSvg(true))};
    const svgVN = ${JSON.stringify(generateAppointmentSvg(false))};

    function switchLang(lang) {
      const wrapper = document.getElementById('svgWrapper');
      const title = document.getElementById('titleText');
      const btnEn = document.getElementById('btnEn');
      const btnVn = document.getElementById('btnVn');

      if (lang === 'EN') {
        wrapper.innerHTML = svgEN;
        title.innerText = "1.4.3 Staff Receive & Confirm Dress Trial Appointment";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      } else {
        wrapper.innerHTML = svgVN;
        title.innerText = "1.4.3 Nhân Viên Tiếp Nhận & Xác Nhận Lịch Hẹn Thử Váy";
        btnVn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition";
        btnEn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition";
      }
    }

    function downloadDrawio() {
      window.open('file:///c:/Users/admin/Downloads/Wedding-Dress-Rental-Website-System/docs/diagrams/1.4.3_staff_confirm_appointment_sequence.drawio');
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(artifactDir, 'staff_appointment_viewer.html'), htmlViewer, 'utf8');
console.log('Saved staff_appointment_viewer.html in artifact directory!');

fs.writeFileSync('docs/diagrams/staff_appointment_viewer.html', htmlViewer, 'utf8');
console.log('Saved docs/diagrams/staff_appointment_viewer.html');

