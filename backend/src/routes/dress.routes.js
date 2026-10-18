import { Router } from 'express';
import dressController from '../controllers/dress.controller.js';

const router = Router();

// Lấy danh sách mẫu váy cưới tương tự / gợi ý
router.get('/:id/related', dressController.getRelatedDresses);

// Lấy chi tiết mẫu váy cưới theo ID, Slug hoặc SKU
router.get('/:id', dressController.getDressById);

// Lấy danh sách mẫu váy cưới
router.get('/', dressController.getDresses);

export default router;
