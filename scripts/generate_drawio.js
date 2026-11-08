import fs from 'fs';

function generateDiagramXml(lang = 'EN') {
  const isEn = lang === 'EN';

  const title = isEn
    ? "<b><u>1.4.2 Customer Create Rental Order, Sign Contract &amp; Pay Deposit</u></b>"
    : "<b><u>1.4.2 Khách Hàng Tạo Đơn Thuê Váy, Ký Hợp Đồng &amp; Đặt Cọc</u></b>";

  const msg1_1 = isEn
    ? "1.1: Select rental dates, days, delivery method &amp; fill measurements"
    : "1.1: Chọn ngày thuê, số ngày, phương thức nhận váy &amp; điền số đo";

  const msg1_2 = isEn
    ? "1.2: Review rental contract terms &amp; submit electronic signature"
    : "1.2: Xem điều khoản hợp đồng &amp; thực hiện ký tên điện tử";

  const msg1_3 = isEn
    ? "1.3: Select deposit option (50%/100%), scan VietQR &amp; click 'Confirm Deposit'"
    : "1.3: Chọn gói đặt cọc (50%/100%), quét VietQR &amp; click 'Xác nhận đặt cọc'";

  const msg1_4 = isEn
    ? "1.4: POST /api/orders (body: orderPayload)"
    : "1.4: POST /api/orders (body: orderPayload)";

  const msg1_5 = isEn
    ? "1.5: createOrder(req, res, next)"
    : "1.5: createOrder(req, res, next)";

  const msg1_6 = isEn
    ? "1.6: createOrder(req.body, req.user)"
    : "1.6: createOrder(req.body, req.user)";

  const msg1_7 = isEn
    ? "1.7: Validate input: items, rentalDates, customerContact, contractSignature"
    : "1.7: Kiểm tra hợp lệ: items, rentalDates, thông tin liên hệ, chữ ký HĐ";

  const guard1 = isEn
    ? "[Scenario 1: Validation Failed / Missing Info / Empty Items]"
    : "[Scenario 1: Xác thực thất bại / Thiếu thông tin / Không có sản phẩm]";

  const msg1_8 = isEn
    ? "1.8: throw Error(&quot;Rental order requires at least 1 dress item / Missing info...&quot;)"
    : "1.8: throw Error(&quot;Đơn thuê cần ít nhất 1 sản phẩm váy cưới / Thiếu thông tin...&quot;)";

  const msg1_9 = isEn
    ? "1.9: HTTP 400 Bad Request { success: false, message }"
    : "1.9: HTTP 400 Bad Request { success: false, message }";

  const msg1_10 = isEn
    ? "1.10: Display error notification toast on UI &amp; scroll to missing step"
    : "1.10: Hiển thị thông báo lỗi trên UI &amp; cuộn về bước cần bổ sung";

  const guard2 = isEn
    ? "[Scenario 2: Validation Passed / Success]"
    : "[Scenario 2: Xác thực thành công / Tạo đơn &amp; Hợp đồng]";

  const msg1_11 = isEn
    ? "1.11: Calculate fees (totalRent, totalDeposit, depositPaid) &amp; generate code: UB-2026-XXX, HĐ-UB-2026-XXX"
    : "1.11: Tính toán chi phí (totalRent, totalDeposit, depositPaid) &amp; Sinh mã: UB-2026-XXX, HĐ-UB-2026-XXX";

  const msg1_12 = isEn
    ? "1.12: OrderModel.create(orderDoc)"
    : "1.12: OrderModel.create(orderDoc)";

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
    ? "1.16: Show Success Modal, clear cart &amp; redirect to Order Detail (/orders/:id)"
    : "1.16: Hiển thị Success Modal, xóa giỏ hàng &amp; chuyển hướng xem đơn hàng (/orders/:id)";

  const msg1_17 = isEn
    ? "1.17: Send confirmation email &amp; attached electronic rental contract"
    : "1.17: Gửi email xác nhận đặt cọc kèm file Hợp đồng thuê váy cưới điện tử";

  const p = isEn ? 'en' : 'vn';

  return `    <mxGraphModel dx="1434" dy="894" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1250" pageHeight="920" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- Main Title -->
        <mxCell id="title_${p}" value="${title}" style="text;html=1;align=left;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=18;fontColor=#1a56a4;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="40" y="25" width="650" height="30" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 1: Actor Customer -->
        <mxCell id="part_actor_${p}" value="Customer" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="93" y="70" width="34" height="60" as="geometry" />
        </mxCell>
        <mxCell id="line_actor_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="110" y="150" as="sourcePoint" />
            <mxPoint x="110" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_actor_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="104" y="160" width="12" height="690" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 2: <<user interface>> CheckoutPage -->
        <mxCell id="box_ui_${p}" value="&amp;lt;&amp;lt;user interface&amp;gt;&amp;gt;&lt;br&gt;&lt;b&gt;CheckoutPage&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="230" y="75" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="line_ui_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="300" y="125" as="sourcePoint" />
            <mxPoint x="300" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_ui_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="294" y="160" width="12" height="690" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 3: <<route>> orderRoutes -->
        <mxCell id="box_route_${p}" value="&amp;lt;&amp;lt;route&amp;gt;&amp;gt;&lt;br&gt;&lt;b&gt;orderRoutes&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="425" y="75" width="130" height="50" as="geometry" />
        </mxCell>
        <mxCell id="line_route_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="490" y="125" as="sourcePoint" />
            <mxPoint x="490" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_route_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="484" y="285" width="12" height="45" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 4: <<control>> orderController -->
        <mxCell id="box_ctrl_${p}" value="&amp;lt;&amp;lt;control&amp;gt;&amp;gt;&lt;br&gt;&lt;b&gt;orderController&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="610" y="75" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="line_ctrl_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="680" y="125" as="sourcePoint" />
            <mxPoint x="680" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_ctrl_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="674" y="315" width="12" height="445" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 5: <<service>> orderService -->
        <mxCell id="box_srv_${p}" value="&amp;lt;&amp;lt;service&amp;gt;&amp;gt;&lt;br&gt;&lt;b&gt;orderService&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="820" y="75" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="line_srv_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="890" y="125" as="sourcePoint" />
            <mxPoint x="890" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_srv_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="884" y="345" width="12" height="385" as="geometry" />
        </mxCell>

        <!-- PARTICIPANT 6: <<database>> OrderModel(MongoDB) -->
        <mxCell id="box_db_${p}" value="&amp;lt;&amp;lt;database&amp;gt;&amp;gt;&lt;br&gt;&lt;b&gt;OrderModel(MongoDB)&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontFamily=Helvetica;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="1030" y="75" width="160" height="50" as="geometry" />
        </mxCell>
        <mxCell id="line_db_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#b0b0b0;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1110" y="125" as="sourcePoint" />
            <mxPoint x="1110" y="860" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="act_db_${p}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="1104" y="645" width="12" height="50" as="geometry" />
        </mxCell>

        <!-- MESSAGE 1.1 -->
        <mxCell id="msg1_1_${p}" value="${msg1_1}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="116" y="175" as="sourcePoint" />
            <mxPoint x="294" y="175" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.2 -->
        <mxCell id="msg1_2_${p}" value="${msg1_2}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="116" y="215" as="sourcePoint" />
            <mxPoint x="294" y="215" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.3 -->
        <mxCell id="msg1_3_${p}" value="${msg1_3}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="116" y="255" as="sourcePoint" />
            <mxPoint x="294" y="255" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.4 -->
        <mxCell id="msg1_4_${p}" value="${msg1_4}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="306" y="290" as="sourcePoint" />
            <mxPoint x="484" y="290" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.5 -->
        <mxCell id="msg1_5_${p}" value="${msg1_5}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="496" y="320" as="sourcePoint" />
            <mxPoint x="674" y="320" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.6 -->
        <mxCell id="msg1_6_${p}" value="${msg1_6}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="686" y="350" as="sourcePoint" />
            <mxPoint x="884" y="350" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.7 (Self-call on Service) -->
        <mxCell id="msg1_7_${p}" value="${msg1_7}" style="html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="896" y="380" as="sourcePoint" />
            <mxPoint x="896" y="405" as="targetPoint" />
            <Array as="points">
              <mxPoint x="935" y="380" />
              <mxPoint x="935" y="405" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ALT FRAME -->
        <mxCell id="alt_frame_${p}" value="alt" style="shape=umlFrame;whiteSpace=wrap;html=1;width=50;height=25;boundedLbl=1;strokeColor=#000000;fillColor=none;fontSize=11;fontStyle=1;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="50" y="425" width="1160" height="420" as="geometry" />
        </mxCell>

        <!-- Guard 1 -->
        <mxCell id="guard_1_${p}" value="${guard1}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="60" y="450" width="450" height="20" as="geometry" />
        </mxCell>

        <!-- MESSAGE 1.8 -->
        <mxCell id="msg1_8_${p}" value="${msg1_8}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="884" y="480" as="sourcePoint" />
            <mxPoint x="686" y="480" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.9 -->
        <mxCell id="msg1_9_${p}" value="${msg1_9}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="674" y="510" as="sourcePoint" />
            <mxPoint x="306" y="510" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.10 -->
        <mxCell id="msg1_10_${p}" value="${msg1_10}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="294" y="540" as="sourcePoint" />
            <mxPoint x="116" y="540" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- ALT DIVIDER LINE -->
        <mxCell id="alt_divider_${p}" value="" style="edgeStyle=none;html=1;strokeColor=#666666;strokeWidth=1;dashed=1;endArrow=none;rounded=0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="50" y="565" as="sourcePoint" />
            <mxPoint x="1210" y="565" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Guard 2 -->
        <mxCell id="guard_2_${p}" value="${guard2}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=11;fontColor=#222222;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="60" y="575" width="450" height="20" as="geometry" />
        </mxCell>

        <!-- MESSAGE 1.11 (Self-call on Service) -->
        <mxCell id="msg1_11_${p}" value="${msg1_11}" style="html=1;align=left;spacingLeft=5;verticalAlign=middle;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="896" y="600" as="sourcePoint" />
            <mxPoint x="896" y="625" as="targetPoint" />
            <Array as="points">
              <mxPoint x="935" y="600" />
              <mxPoint x="935" y="625" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.12 -->
        <mxCell id="msg1_12_${p}" value="${msg1_12}" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="896" y="655" as="sourcePoint" />
            <mxPoint x="1104" y="655" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.13 -->
        <mxCell id="msg1_13_${p}" value="${msg1_13}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="1104" y="685" as="sourcePoint" />
            <mxPoint x="896" y="685" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.14 -->
        <mxCell id="msg1_14_${p}" value="${msg1_14}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="884" y="715" as="sourcePoint" />
            <mxPoint x="686" y="715" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.15 -->
        <mxCell id="msg1_15_${p}" value="${msg1_15}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="674" y="745" as="sourcePoint" />
            <mxPoint x="306" y="745" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.16 -->
        <mxCell id="msg1_16_${p}" value="${msg1_16}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="294" y="780" as="sourcePoint" />
            <mxPoint x="116" y="780" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- MESSAGE 1.17 -->
        <mxCell id="msg1_17_${p}" value="${msg1_17}" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;strokeWidth=1;fontSize=11;labelBackgroundColor=#ffffff;fontFamily=Helvetica;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="294" y="815" as="sourcePoint" />
            <mxPoint x="116" y="815" as="targetPoint" />
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>`;
}

const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-04T03:15:00.000Z" agent="Antigravity" version="24.0.0" type="device">
  <diagram id="CustomerOrderSequence_EN" name="1.4.2 Customer Create Order (English)">
${generateDiagramXml('EN')}
  </diagram>
  <diagram id="CustomerOrderSequence_VN" name="1.4.2 Khách Hàng Tạo Đơn (Tiếng Việt)">
${generateDiagramXml('VN')}
  </diagram>
</mxfile>
`;

fs.writeFileSync('docs/diagrams/1.4.2_customer_order_contract_deposit_sequence.drawio', fullXml, 'utf8');
console.log('Saved multi-tab Drawio file successfully!');

