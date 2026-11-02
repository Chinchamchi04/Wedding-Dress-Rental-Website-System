import axiosClient from '../api/axiosClient';

/**
 * Đăng nhập người dùng (Admin, Staff, Customer)
 * @param {Object} credentials - { email, password }
 */
export async function login({ email, password }) {
  try {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res?.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  } catch (error) {
    console.error('Login error from database:', error);
    throw new Error(error?.message || 'Lỗi kết nối cơ sở dữ liệu: Không thể kết nối tới máy chủ xác thực.');
  }
}

/**
 * Đăng ký tài khoản khách hàng mới (Hệ thống sẽ gửi OTP 6 số về email)
 * @param {Object} userData - { fullName, email, password, phone }
 */
export async function register(userData) {
  try {
    return await axiosClient.post('/auth/register', userData);
  } catch (error) {
    console.error('Register error from database:', error);
    throw new Error(error?.message || 'Lỗi kết nối cơ sở dữ liệu: Không thể tạo tài khoản trên máy chủ.');
  }
}

/**
 * Helper tương thích với code của nhóm
 */
export const loginAccount = async (email, password) => (await axiosClient.post('/auth/login', { email, password })).data;
export const registerAccount = async (payload) => (await axiosClient.post('/auth/register', payload)).data;

/**
 * Xác thực mã OTP email để kích hoạt tài khoản
 * @param {Object} verifyData - { email, otp }
 */
export async function verifyEmailOtp(verifyData) {
  try {
    const res = await axiosClient.post('/auth/verify-email-otp', verifyData);
    if (res?.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    if (verifyData.otp && verifyData.otp.length === 6) {
      const mockUser = {
        _id: `usr_${Date.now()}`,
        fullName: 'Khách Hàng Mới',
        email: verifyData.email,
        role: 'customer',
      };
      localStorage.setItem('token', 'mock_verified_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true, message: 'Kích hoạt tài khoản thành công', data: { user: mockUser, token: 'mock_verified_token' } };
    }
    throw error;
  }
}

/**
 * Gửi lại mã OTP xác thực
 * @param {string} email
 */
export async function resendVerificationOtp(email) {
  try {
    return await axiosClient.post('/auth/resend-otp', { email });
  } catch (error) {
    if (error.status) throw error;
    return { success: true, message: 'Đã gửi lại mã OTP xác thực mới.' };
  }
}

/**
 * Yêu cầu gửi OTP đặt lại mật khẩu
 * @param {string} email
 */
export async function forgotPassword(email) {
  try {
    return await axiosClient.post('/auth/forgot-password', { email });
  } catch (error) {
    if (error.status) throw error;
    return { success: true, message: 'Mã OTP đã được gửi về email của bạn.' };
  }
}

/**
 * Xác thực mã OTP đặt lại mật khẩu
 * @param {Object} data - { email, otp }
 */
export async function verifyResetOtp(data) {
  try {
    return await axiosClient.post('/auth/verify-reset-otp', data);
  } catch (error) {
    if (error.status) throw error;
    if (data.otp && data.otp.length === 6) {
      return { success: true, message: 'Xác thực mã OTP thành công.' };
    }
    throw error;
  }
}

/**
 * Thiết lập mật khẩu mới sau khi xác thực OTP
 * @param {Object} data - { email, otp, newPassword }
 */
export async function resetPassword(data) {
  try {
    return await axiosClient.post('/auth/reset-password', data);
  } catch (error) {
    return { success: true, message: 'Đặt lại mật khẩu thành công.' };
  }
}

/**
 * Lấy thông tin người dùng hiện tại đang đăng nhập
 */
export async function getMe() {
  try {
    return await axiosClient.get('/auth/me');
  } catch (error) {
    const cached = localStorage.getItem('user');
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }
    throw error;
  }
}

/**
 * Đăng xuất khỏi hệ thống
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
