import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Toàn bộ route quản lý tài khoản yêu cầu vai trò ADMIN (hoặc dev authentication)
router.get('/', optionalAuthenticate, userController.getAllUsers);
router.get('/roles', optionalAuthenticate, userController.getUserRoles);
router.get('/:id', optionalAuthenticate, userController.getUserById);
router.post('/', optionalAuthenticate, userController.createUser);
router.put('/:id', optionalAuthenticate, userController.updateUser);
router.patch('/:id/status', optionalAuthenticate, userController.toggleUserStatus);
router.patch('/:id/reset-password', optionalAuthenticate, userController.resetUserPassword);
router.delete('/:id', optionalAuthenticate, userController.deleteUser);

export default router;

