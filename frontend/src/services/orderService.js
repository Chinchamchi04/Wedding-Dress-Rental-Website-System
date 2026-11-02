import axiosClient from '../api/axiosClient';
import elysianImage from '../assets/card1_elysian.jpg';
import auroraImage from '../assets/card3_lumiere.jpg';
import { formatCurrencyVND } from '../utils/formatCurrency';
import { dressImage } from './dressApiService';

const STATUS = {
  pending_payment: ['active', 'Chờ thanh toán cọc'],
  deposit_paid: ['active', 'Đã đặt cọc'],
  preparing: ['active', 'Đang chuẩn bị bàn giao'],
  delivered: ['active', 'Đã bàn giao'],
  renting: ['active', 'Đang thuê'],
  returned: ['active', 'Đã trả váy'],
  completed: ['complete', 'Hoàn tất'],
  cancelled: ['cancelled', 'Đã hủy'],
};

const fmtDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : '—');
export const formatVnd = (value) => formatCurrencyVND(value);

export function mapOrder(order) {
  if (!order) return null;
  const item = order.items?.[0] || {};
  const [status, statusLabel] = STATUS[order.status] || ['active', order.statusLabel || order.status || 'Đang xử lý'];
  return {
    id: order.orderCode || order.id || order._id,
    _id: order._id || order.id,
    orderCode: order.orderCode || order.id,
    status,
    statusLabel,
    rawStatus: order.status,
    date: fmtDate(order.rentalStartDate || order.createdAt || order.date),
    dress: item.name || order.dress || 'Lễ phục',
    image: order.image || (item.dressId ? dressImage(item.dressId) : elysianImage),
    imageAlt: order.imageAlt || item.name || 'Lễ phục',
    category: item.dressId?.silhouette || order.category || 'Haute Couture',
    size: item.size || order.size || '—',
    style: order.style || 'Theo đơn hàng',
    amount: order.totalRentPrice || order.amount || 0,
    deposit: order.totalDeposit || order.deposit || 0,
    rentalDates: order.rentalDates || `${fmtDate(order.rentalStartDate)} – ${fmtDate(order.rentalEndDate)}`,
    fitting: order.fitting || 'Liên hệ showroom để xác nhận',
    shippingAddress: order.shippingAddress,
    items: order.items || [],
  };
}

/**
 * Lấy danh sách toàn bộ đơn thuê (Admin / Staff) hoặc đơn cá nhân (Customer)
 * @param {Object} params - { status, customerId, page, limit }
 */
export async function getOrders(params = {}) {
  try {
    const res = await axiosClient.get('/orders/my', { params });
    const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : res.data?.data || []);
    if (list && list.length >= 0) {
      return list.map(mapOrder);
    }
  } catch (error) {
    // Không ném lỗi nếu là lỗi xác thực
  }

  const cached = localStorage.getItem('unibridal-orders');
  return (cached ? JSON.parse(cached) : []).map(mapOrder);
}

/**
 * Lấy chi tiết đơn thuê theo ID hoặc OrderCode
 * @param {string} idOrCode
 */
export async function getOrder(idOrCode) {
  try {
    const res = await axiosClient.get(`/orders/my/${encodeURIComponent(idOrCode)}`);
    if (res?.data) return mapOrder(res.data);
  } catch (error) {
    // Thử endpoint chung
  }

  try {
    const res = await axiosClient.get(`/orders/${encodeURIComponent(idOrCode)}`);
    const raw = res?.data?.data || res?.data;
    if (raw) return mapOrder(raw);
  } catch (error) {
    // Fallback demo
  }

  const cached = JSON.parse(localStorage.getItem('unibridal-orders') || '[]');
  if (found) return mapOrder(found);
    throw new Error('Không tìm thấy đơn hàng trong cơ sở dữ liệu.');
}

export const getOrderById = getOrder;

/**
 * Tạo mới đơn thuê váy từ giỏ hàng
 * @param {Object} orderData - { items, rentalStartDate, rentalEndDate, deliveryMethod, shippingAddress, notes }
 */
export async function createOrder(orderData) {
  try {
    return await axiosClient.post('/orders', orderData);
  } catch (error) {
    const newOrder = {
      id: `UB-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      _id: `ord_${Date.now()}`,
      orderCode: `UB-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      status: 'pending',
      statusLabel: 'Chờ Xác Nhận',
      date: new Date().toLocaleDateString('vi-VN'),
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    const cached = JSON.parse(localStorage.getItem('unibridal-orders') || '[]');
    cached.unshift(newOrder);
    localStorage.setItem('unibridal-orders', JSON.stringify(cached));
    return {
      success: true,
      message: 'Đặt đơn thuê thành công (Offline Demo)',
      data: newOrder,
    };
  }
}

/**
 * Cập nhật trạng thái đơn hàng (Admin/Staff)
 * @param {string} orderId
 * @param {string} status - 'confirmed' | 'preparing' | 'handover' | 'renting' | 'returned' | 'completed' | 'cancelled'
 */
export async function updateOrderStatus(orderId, status) {
  try {
    return await axiosClient.patch(`/orders/${orderId}/status`, { status });
  } catch (error) {
    return { success: true, message: 'Cập nhật trạng thái đơn thành công (Offline Demo)' };
  }
}

/**
 * Lập biên bản kiểm định tình trạng váy khi trả (Return Inspection)
 * @param {string} orderId
 * @param {Object} inspectionData - { condition, damageNotes, penaltyFee, refundDepositAmount, inspectorStaffId }
 */
export async function submitReturnInspection(orderId, inspectionData) {
  try {
    return await axiosClient.post(`/orders/${orderId}/inspection`, inspectionData);
  } catch (error) {
    return { success: true, message: 'Lập biên bản hoàn trả thành công (Offline Demo)' };
  }
}

/**
 * Lấy danh sách khoảng thời gian váy đã có người đặt thuê kín lịch
 * @param {string} dressId
 */
export async function getDressBookedDates(dressId) {
  try {
    const res = await axiosClient.get('/orders/booked-dates', {
      params: { dressId },
    });
    return res.data?.data || res.data || [];
  } catch (error) {
    return [];
  }
}

export function getDemoOrders() {
  throw new Error('Lỗi kết nối cơ sở dữ liệu: Không thể lấy danh sách đơn hàng.');
}

export function getDemoOrder(id) { return null; }

/**
 * Lấy toàn bộ danh sách đơn thuê (Admin)
 * @param {Object} params - { status, search, page, limit }
 */
export async function getAllOrdersAdmin(params = {}) {
  try {
    const res = await axiosClient.get('/orders', { params });
    const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : res.data?.data || []);
    const total = res.pagination?.total ?? res.total ?? list.length;
    const page = res.pagination?.page ?? res.page ?? 1;
    const totalPages = res.pagination?.totalPages ?? res.totalPages ?? 1;
    return {
      orders: list,
      total,
      page,
      totalPages,
    };
  } catch (error) {
    return { orders: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Lấy biên bản kiểm định trả váy theo orderId
 * @param {string} orderId
 */
export async function getReturnInspection(orderId) {
  try {
    const res = await axiosClient.get(`/orders/${orderId}/inspection`);
    return res.data?.data || res.data || null;
  } catch (error) {
    return null;
  }
}
