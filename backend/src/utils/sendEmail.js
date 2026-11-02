import nodemailer from 'nodemailer';

/**
 * Khởi tạo Transporter gửi email
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST.includes('gmail')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Gửi email xác thực tài khoản với mã OTP 6 số
 */
export async function sendVerificationEmail(to, otp, fullName = 'Quý khách') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; border: 1px solid #E6DAC8; border-radius: 12px; overflow: hidden; color: #2C2523;">
      <div style="background: linear-gradient(135deg, #2C2523 0%, #453735 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 2px; color: #FDFBF7;">UNIBRIDAL</h1>
        <p style="font-size: 11px; letter-spacing: 3px; color: #B8737D; margin-top: 6px; text-transform: uppercase;">Haute Couture Bridal Atelier</p>
      </div>

      <div style="padding: 36px 32px;">
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #2C2523; margin-top: 0;">Xác Thực Tài Khoản Đăng Ký</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #514344;">
          Xin chào <strong>${fullName}</strong>,<br>
          Cảm ơn bạn đã lựa chọn UniBridal. Để kích hoạt tài khoản thành viên và bắt đầu trải nghiệm dịch vụ thuê váy cưới cao cấp, vui lòng sử dụng mã xác thực OTP dưới đây:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #FFF0ED; border: 2px dashed #B8737D; border-radius: 10px; padding: 14px 36px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #854F55;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #847374; margin-top: 8px;">Mã OTP có hiệu lực trong vòng <strong>3 phút</strong>.</p>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #847374;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ hotline UniBridal <strong>0908 123 888</strong> để được hỗ trợ.
        </p>
      </div>

      <div style="background: #FAF6F0; padding: 18px 24px; text-align: center; font-size: 11px; color: #847374; border-top: 1px solid #E6DAC8;">
        © 2026 UniBridal Atelier. Bảo lưu mọi quyền. • 128 Đồng Khởi, Bến Nghé, Quận 1, TP. HCM
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const senderName = process.env.EMAIL_FROM_NAME || 'UniBridal Haute Couture';
      const info = await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `[UniBridal] Mã xác thực đăng ký tài khoản: ${otp}`,
        html,
      });
      console.log(`[EMAIL SENT SUCCESS] Gửi OTP đăng ký tới ${to} thành công! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL SEND FAILED] Lỗi gửi email tới ${to}:`, err.message);
      return { simulated: true, otp, error: err.message };
    }
  } else {
    console.log(`[EMAIL VERIFY SIMULATION] To: ${to} | OTP: ${otp}`);
    return { simulated: true, otp };
  }
}

/**
 * Gửi email đặt lại mật khẩu với mã OTP 6 số
 */
export async function sendResetPasswordEmail(to, otp, fullName = 'Quý khách') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; border: 1px solid #E6DAC8; border-radius: 12px; overflow: hidden; color: #2C2523;">
      <div style="background: linear-gradient(135deg, #2C2523 0%, #453735 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 2px; color: #FDFBF7;">UNIBRIDAL</h1>
        <p style="font-size: 11px; letter-spacing: 3px; color: #B8737D; margin-top: 6px; text-transform: uppercase;">Haute Couture Bridal Atelier</p>
      </div>

      <div style="padding: 36px 32px;">
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #2C2523; margin-top: 0;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #514344;">
          Xin chào <strong>${fullName}</strong>,<br>
          Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản UniBridal của bạn. Vui lòng nhập mã OTP sau để tiến hành thiết lập mật khẩu mới:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #FFF0ED; border: 2px dashed #B8737D; border-radius: 10px; padding: 14px 36px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #854F55;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #847374; margin-top: 8px;">Mã có hiệu lực trong vòng <strong>3 phút</strong>.</p>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #847374;">
          Vì lý do bảo mật, tuyệt đối không chia sẻ mã này cho bất kỳ ai.
        </p>
      </div>

      <div style="background: #FAF6F0; padding: 18px 24px; text-align: center; font-size: 11px; color: #847374; border-top: 1px solid #E6DAC8;">
        © 2026 UniBridal Atelier. Bảo lưu mọi quyền. • 128 Đồng Khởi, Bến Nghé, Quận 1, TP. HCM
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const senderName = process.env.EMAIL_FROM_NAME || 'UniBridal Haute Couture';
      const info = await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `[UniBridal] Mã xác thực đặt lại mật khẩu: ${otp}`,
        html,
      });
      console.log(`[EMAIL SENT SUCCESS] Gửi OTP đặt lại mật khẩu tới ${to} thành công! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL SEND FAILED] Lỗi gửi email tới ${to}:`, err.message);
      return { simulated: true, otp, error: err.message };
    }
  } else {
    console.log(`[FORGOT PASSWORD OTP SIMULATION] To: ${to} | OTP: ${otp}`);
    return { simulated: true, otp };
  }
}

/**
 * Gửi email thông báo Showroom đã lập biên bản kiểm định trả váy
 */
export async function sendInspectionNotificationEmail({
  to,
  fullName = 'Quý khách',
  orderCode,
  totalDeposit = 0,
  totalDeduction = 0,
  finalRefundAmount = 0,
  returnUrl = 'http://localhost:3000/profile/orders',
}) {
  const transporter = createTransporter();
  const formatMoney = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; border: 1px solid #E6DAC8; border-radius: 16px; overflow: hidden; color: #2C2523;">
      <div style="background: linear-gradient(135deg, #2C2523 0%, #453735 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 2px; color: #FDFBF7;">UNIBRIDAL</h1>
        <p style="font-size: 11px; letter-spacing: 3px; color: #B8737D; margin-top: 6px; text-transform: uppercase;">Haute Couture Bridal Atelier</p>
      </div>

      <div style="padding: 32px 28px;">
        <div style="background: #FFF0ED; border: 1px solid #F3DDD7; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; color: #733F49; margin: 0 0 8px 0;">
            ✦ Showroom đã lập Biên Bản Kiểm Định Trả Váy
          </h2>
          <p style="font-size: 13.5px; color: #514344; margin: 0; line-height: 1.6;">
            Đơn thuê lễ phục mã: <strong style="color: #733F49;">#${orderCode}</strong>
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.7; color: #514344;">
          Kính chào <strong>${fullName}</strong>,<br>
          Chuyên viên Atelier của UniBridal đã tiến hành kiểm tra phom dáng, chất liệu trang phục sau lễ cưới và hoàn tất biên bản kiểm định đối với đơn hàng <strong>#${orderCode}</strong>.
        </p>

        <div style="background: #FFF8F6; border-left: 4px solid #B8737D; padding: 14px 16px; margin: 20px 0; border-radius: 0 10px 10px 0;">
          <p style="font-size: 14px; line-height: 1.6; color: #733F49; margin: 0; font-weight: 600;">
            Nàng vui lòng xem chi tiết hiện trạng váy và số tiền cọc được hoàn lại. Khi nàng đồng ý, hệ thống sẽ tự động hoàn cọc ngay lập tức; nếu chưa hài lòng nàng có quyền gửi đơn khiếu nại.
          </p>
        </div>

        <!-- Bảng tóm tắt số tiền -->
        <div style="background: #FFFFFF; border: 1px solid #EFE5E1; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 8px 0; color: #7A6B6C;">Tiền đặt cọc ban đầu:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #2C2523;">${formatMoney(totalDeposit)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7A6B6C;">Khấu trừ (hư tổn / phí phát sinh):</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #C53030;">-${formatMoney(totalDeduction)}</td>
            </tr>
            <tr style="border-top: 1px dashed #E6DAC8;">
              <td style="padding: 12px 0 4px 0; font-weight: bold; color: #5F2B36; font-size: 15px;">Số tiền cọc hoàn lại dự kiến:</td>
              <td style="padding: 12px 0 4px 0; text-align: right; font-weight: bold; color: #1E8347; font-size: 18px;">${formatMoney(finalRefundAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- Nút hành động nổi bật -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${returnUrl}" style="display: inline-block; background: linear-gradient(135deg, #733F49 0%, #5F2B36 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(115, 63, 73, 0.28); letter-spacing: 0.5px;">
            ✦ Xem Biên Bản &amp; Xác Nhận Hoàn Cọc
          </a>
        </div>

        <p style="font-size: 12px; color: #847374; text-align: center; margin-top: 16px;">
          Nàng cũng có thể đăng nhập vào website và xem tại mục Lịch sử đơn hàng: <br>
          <a href="${returnUrl}" style="color: #B8737D; text-decoration: underline;">${returnUrl}</a>
        </p>
      </div>

      <div style="background: #FAF6F0; padding: 18px 24px; text-align: center; font-size: 11px; color: #847374; border-top: 1px solid #E6DAC8;">
        © 2026 UniBridal Atelier. Hotline hỗ trợ: 0908 123 888 • 128 Đồng Khởi, Bến Nghé, Quận 1, TP. HCM
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const senderName = process.env.EMAIL_FROM_NAME || 'UniBridal Haute Couture';
      const info = await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `[UniBridal] ✦ Showroom đã lập Biên Bản Kiểm Định Trả Váy #${orderCode}`,
        html,
      });
      console.log(`[EMAIL INSPECTION SUCCESS] Đã gửi biên bản kiểm định đơn #${orderCode} tới ${to}! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL INSPECTION FAILED] Lỗi gửi email tới ${to}:`, err.message);
      return { simulated: true, error: err.message };
    }
  } else {
    console.log(`[EMAIL INSPECTION SIMULATION] To: ${to} | Order: #${orderCode}`);
    return { simulated: true };
  }
}

/**
 * Gửi email thông báo hoàn cọc thành công sau khi khách duyệt biên bản
 */
export async function sendRefundConfirmationEmail({
  to,
  fullName = 'Quý khách',
  orderCode,
  finalRefundAmount = 0,
  bankDetails = null,
}) {
  const transporter = createTransporter();
  const formatMoney = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  const bankHtml = bankDetails?.accountNumber
    ? `
      <div style="background: #F8F5F2; border: 1px dashed #D5C2B9; border-radius: 10px; padding: 14px 18px; margin: 18px 0; font-size: 13px; line-height: 1.6;">
        <strong style="color: #5F2B36; display: block; margin-bottom: 6px; font-size: 13.5px;">Thông tin tài khoản nhận hoàn cọc:</strong>
        <div>• Ngân hàng thụ hưởng: <strong>${bankDetails.bankName || 'Ngân hàng nội địa'}</strong></div>
        <div>• Số tài khoản (STK): <strong style="letter-spacing: 1px;">${bankDetails.accountNumber}</strong></div>
        <div>• Chủ tài khoản: <strong>${bankDetails.accountHolder || fullName}</strong></div>
        ${bankDetails.notes ? `<div>• Ghi chú: <em>${bankDetails.notes}</em></div>` : ''}
      </div>
    `
    : '';

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; border: 1px solid #E6DAC8; border-radius: 16px; overflow: hidden; color: #2C2523;">
      <div style="background: linear-gradient(135deg, #2C2523 0%, #453735 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 2px; color: #FDFBF7;">UNIBRIDAL</h1>
        <p style="font-size: 11px; letter-spacing: 3px; color: #B8737D; margin-top: 6px; text-transform: uppercase;">Haute Couture Bridal Atelier</p>
      </div>

      <div style="padding: 32px 28px;">
        <div style="background: #EDFBF2; border: 1px solid #C6F0D3; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; color: #1E8347; margin: 0 0 8px 0;">
            ✓ Xác Nhận Hoàn Cọc Thành Công
          </h2>
          <p style="font-size: 13.5px; color: #514344; margin: 0; line-height: 1.6;">
            Đơn thuê lễ phục mã: <strong style="color: #1E8347;">#${orderCode}</strong>
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.7; color: #514344;">
          Kính chào <strong>${fullName}</strong>,<br>
          Cảm ơn nàng đã xác nhận biên bản kiểm định. Hệ thống UniBridal đã tiến hành quyết toán và hoàn trả khoản tiền cọc <strong>${formatMoney(finalRefundAmount)}</strong> theo đúng quy chuẩn hợp đồng thuê váy.
        </p>

        ${bankHtml}

        <p style="font-size: 13.5px; line-height: 1.7; color: #514344;">
          UniBridal xin gửi lời chúc phúc sâu sắc và trân trọng cảm ơn nàng đã tin tưởng đồng hành cùng chúng tôi trong ngày trọng đại nhất cuộc đời!
        </p>
      </div>

      <div style="background: #FAF6F0; padding: 18px 24px; text-align: center; font-size: 11px; color: #847374; border-top: 1px solid #E6DAC8;">
        © 2026 UniBridal Atelier. Hotline: 0908 123 888 • 128 Đồng Khởi, Bến Nghé, Quận 1, TP. HCM
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const senderName = process.env.EMAIL_FROM_NAME || 'UniBridal Haute Couture';
      const info = await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `[UniBridal] Xác nhận hoàn cọc thành công - Đơn hàng #${orderCode}`,
        html,
      });
      console.log(`[EMAIL REFUND SUCCESS] Đã gửi xác nhận hoàn cọc đơn #${orderCode} tới ${to}! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL REFUND FAILED] Lỗi gửi email tới ${to}:`, err.message);
      return { simulated: true, error: err.message };
    }
  } else {
    console.log(`[EMAIL REFUND SIMULATION] To: ${to} | Order: #${orderCode}`);
    return { simulated: true };
  }
}
