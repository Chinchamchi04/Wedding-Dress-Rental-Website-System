import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import * as account from '../controllers/accountController.js';
import * as report from '../controllers/reportController.js';

const router = Router();
const handle = (action) => (req, res, next) => Promise.resolve(action(req, res)).catch(next);

router.post('/auth/login', handle(account.login));
router.post('/auth/register', handle(account.register));
router.get('/dresses', handle(account.dresses));
router.get('/dresses/:id', handle(account.dressDetail));
router.post('/dresses', optionalAuthenticate, handle(account.createDress));
router.put('/dresses/:id', optionalAuthenticate, handle(account.updateDress));
router.patch('/dresses/:id', optionalAuthenticate, handle(account.updateDress));
router.delete('/dresses/:id', optionalAuthenticate, handle(account.deleteDress));
router.get('/profile/wishlist', authenticate, handle(account.getWishlist));
router.put('/profile/wishlist', authenticate, handle(account.updateWishlist));
router.get('/profile', optionalAuthenticate, handle(account.profile));
router.put('/profile', optionalAuthenticate, handle(account.updateProfile));
router.patch('/profile/password', authenticate, handle(account.changePassword));
router.get('/orders/my', optionalAuthenticate, handle(account.orders));
router.get('/orders/my/:id', optionalAuthenticate, handle(account.order));
router.get('/staff/dashboard', optionalAuthenticate, handle(report.staffDashboard));
router.get('/admin/dashboard', optionalAuthenticate, handle(report.adminDashboard));
router.get('/admin/revenue', optionalAuthenticate, handle(report.revenue));

export default router;
