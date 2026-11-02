import * as account from '../services/accountService.js';

const ok = (res, message, data, status = 200) => res.status(status).json({ success: true, message, data });

export const login = async (req, res) => ok(res, 'Đăng nhập thành công.', await account.login(req.body.email, req.body.password));
export const register = async (req, res) => ok(res, 'Đăng ký tài khoản thành công.', await account.register(req.body), 201);
export const profile = async (req, res) => ok(res, 'Lấy thông tin hồ sơ thành công.', account.getProfile(req.user));
export const updateProfile = async (req, res) => ok(res, 'Cập nhật thông tin hồ sơ thành công.', await account.updateProfile(req.user, req.body));
export const changePassword = async (req, res) => ok(res, 'Đổi mật khẩu thành công.', await account.changePassword(req.user, req.body));
export const orders = async (req, res) => ok(res, 'Lấy danh sách đơn hàng thành công.', await account.getOrders(req.user._id));
export const order = async (req, res) => ok(res, 'Lấy chi tiết đơn hàng thành công.', await account.getOrder(req.user._id, req.params.id));
export const dresses = async (req, res) => ok(res, 'Lấy danh sách sản phẩm thành công.', await account.listDresses());
export const dressDetail = async (req, res) => ok(res, 'Lấy chi tiết sản phẩm thành công.', await account.getDressDetail(req.params.id));
export const createDress = async (req, res) => ok(res, 'Thêm mới mẫu váy cưới thành công.', await account.createDress(req.body), 201);
export const updateDress = async (req, res) => ok(res, 'Cập nhật mẫu váy cưới thành công.', await account.updateDress(req.params.id, req.body));
export const deleteDress = async (req, res) => ok(res, 'Xóa/ẩn mẫu váy cưới thành công.', await account.deleteDress(req.params.id));
