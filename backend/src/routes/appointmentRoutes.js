import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Khách hàng (cả Guest lẫn Đã đăng nhập) gửi yêu cầu đặt lịch
router.post('/', optionalAuthenticate, appointmentController.createAppointment);

// 2. Khách hàng xem lịch hẹn cá nhân
router.get('/my', optionalAuthenticate, appointmentController.getMyAppointments);

// 3. Nhân viên / Quản trị viên xem tất cả lịch hẹn (kết nối trực tiếp MongoDB)
router.get('/', optionalAuthenticate, appointmentController.getAllAppointments);

// 4. Nhân viên / Quản trị viên cập nhật trạng thái lịch hẹn
router.patch('/:id/status', optionalAuthenticate, appointmentController.updateAppointmentStatus);

export default router;
