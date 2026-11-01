import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Tạo đơn thuê mới (Hỗ trợ cả khách đăng nhập lẫn guest checkout)
router.post('/', optionalAuthenticate, orderController.createOrder);

// 2. Khách hàng xem lịch sử đơn thuê cá nhân
router.get('/my', authenticate, orderController.getMyOrders);

// 3. Nhân viên / Quản trị viên xem tất cả đơn thuê
router.get('/', authenticate, authorize('STAFF', 'ADMIN'), orderController.getAllOrders);

// 3.1. Lấy danh sách các ngày đã kín lịch của váy
router.get('/booked-dates', orderController.getDressBookedDates);

// 4. Xem chi tiết đơn thuê theo ID hoặc Mã Đơn
router.get('/:id', optionalAuthenticate, orderController.getOrderById);

// 5. Cập nhật trạng thái đơn thuê (Admin / Staff)
router.patch('/:id/status', authenticate, authorize('STAFF', 'ADMIN'), orderController.updateOrderStatus);

// 6. Nhân viên lập biên bản kiểm định tình trạng váy khi khách trả
router.post('/:id/inspection', authenticate, authorize('STAFF', 'ADMIN'), orderController.submitReturnInspection);

// 7. Lấy biên bản kiểm định của đơn thuê
router.get('/:id/inspection', authenticate, authorize('STAFF', 'ADMIN'), orderController.getReturnInspection);

export default router;

