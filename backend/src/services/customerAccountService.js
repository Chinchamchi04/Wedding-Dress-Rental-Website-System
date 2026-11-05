import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Contract from '../models/Contract.model.js';
import ContractTemplate from '../models/ContractTemplate.model.js';
import ReturnInspection from '../models/ReturnInspection.model.js';
import Payment from '../models/Payment.model.js';
const fail = (status, message) => { throw Object.assign(new Error(message), { statusCode: status }); };
// An explicitly assigned order belongs only to that account. Contact matching
// supports existing guest orders without changing their customerId.
async function ownerFilter(userId) {
    const user = await User.findById(userId).select('email phone').lean();
    if (!user)
        fail(401, 'Vui lòng đăng nhập lại.');
    const contacts = [];
    if (user.email)
        contacts.push({ customerEmail: user.email });
    if (user.phone)
        contacts.push({ customerPhone: user.phone });
    return contacts.length
        ? { $or: [{ customerId: userId }, { customerId: null, $or: contacts }] }
        : { customerId: userId };
}
async function ownOrder(userId, identifier) {
    const identity = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { orderCode: String(identifier).toUpperCase() };
    const order = await Order.findOne({ $and: [identity, await ownerFilter(userId)] });
    if (!order)
        fail(404, 'Không tìm thấy đơn thuê thuộc tài khoản của bạn.');
    return order;
}
export async function assertOrderAccess(user, identifier) {
    if (!user?._id)
        fail(401, 'Vui lòng đăng nhập để xem thông tin đơn thuê.');
    const role = String(user.roleId?.code || user.role || '').toUpperCase();
    if (!['ADMIN', 'STAFF'].includes(role))
        await ownOrder(user._id, identifier);
}
export async function listOrders(userId) {
    const orders = await Order.find(await ownerFilter(userId)).sort({ createdAt: -1 }).lean();
    const inspections = await ReturnInspection.find({ orderId: { $in: orders.map((order) => order._id) } }).lean();
    const refunds = await Payment.find({ orderId: { $in: orders.map((order) => order._id) }, transactionType: 'deposit_refund', status: 'success' }).select('orderId amount').lean();
    const paid = new Map();
    refunds.forEach((payment) => paid.set(String(payment.orderId), (paid.get(String(payment.orderId)) || 0) + payment.amount));
    const byOrder = new Map(inspections.map((inspection) => [String(inspection.orderId), { ...inspection, isRefunded: inspection.finalRefundAmount <= 0 || (paid.get(String(inspection.orderId)) || 0) >= inspection.finalRefundAmount }]));
    return orders.map((order) => ({ ...order, inspection: byOrder.get(String(order._id)) || null }));
}
export async function orderDetail(userId, identifier) {
    const order = await ownOrder(userId, identifier);
    let contract = await Contract.findOne({
        $or: [{ orderId: order._id }, { contractCode: order.contractCode }],
    }).select('contractCode templateName status signedAt signedMethod contractPdfUrl clauses').lean();

    // Nếu đơn chưa có bản ghi Contract trong DB, tự động gắn template hợp đồng pháp lý đầy đủ
    if (!contract) {
        try {
            const defaultTemplate = await ContractTemplate.findOne({
                $or: [{ code: 'TPL-HC-01' }, { isDefault: true }],
            }).lean();
            const firstItem = order.items?.[0] || {};
            const created = await Contract.create({
                contractCode: order.contractCode || `HĐ-${order.orderCode}`,
                orderId: order._id,
                customerId: order.customerId || userId || null,
                templateId: defaultTemplate?._id || null,
                templateName: defaultTemplate?.name || 'Hợp Đồng Thuê Lễ Phục Cưới Cao Cấp (Haute Couture)',
                customerName: order.customerName || order.brideName || 'Cô Dâu UniBridal',
                phone: order.customerPhone || order.phone || '',
                idCard: order.customerCccd || order.cccd || '',
                dressInfo: {
                    name: firstItem.name || 'Váy Cưới Haute Couture',
                    code: firstItem.code || 'UB-HC-2026',
                    size: firstItem.size || 'S',
                    image: firstItem.image || '',
                },
                startDate: order.rentalStartDate || new Date(),
                endDate: order.rentalEndDate || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                rentalPrice: order.totalRentPrice || 0,
                depositAmount: order.totalDeposit || 0,
                totalValue: order.totalPayment || 0,
                status: order.status === 'completed' ? 'completed' : 'active',
                signedAt: order.createdAt || new Date(),
                signedMethod: 'Chữ ký điện tử trực tuyến',
                packageType: `Gói ${order.rentalDays || 4} Ngày Tiêu Chuẩn`,
                clauses: defaultTemplate?.clauses || [],
            });
            contract = created.toObject();
        } catch (e) {
            console.error('[ON DEMAND CONTRACT CREATE ERROR]', e.message);
        }
    }

    const inspection = await getInspection(userId, identifier);
    return { ...order.toObject(), inspection, contract };
}
export async function cancelOrder(userId, identifier) {
    const order = await ownOrder(userId, identifier);
    if (!['pending_payment', 'deposit_paid'].includes(order.status))
        fail(409, 'Đơn đã chuẩn bị hoặc bàn giao; vui lòng liên hệ showroom để yêu cầu hủy.');
    const updated = await Order.findOneAndUpdate({ _id: order._id, status: order.status }, { $set: { status: 'cancelled' } }, { new: true, runValidators: true });
    if (!updated)
        fail(409, 'Trạng thái đơn vừa thay đổi. Vui lòng tải lại.');
    return { ...updated.toObject(), inspection: null };
}
export async function getInspection(userId, identifier) {
    const order = await ownOrder(userId, identifier);
    const inspection = await ReturnInspection.findOne({ orderId: order._id }).lean();
    if (!inspection)
        return null;
    const refunds = await Payment.find({ orderId: order._id, transactionType: 'deposit_refund', status: 'success' }).select('amount').lean();
    const confirmed = refunds.reduce((sum, payment) => sum + payment.amount, 0);
    return { ...inspection, isRefunded: inspection.finalRefundAmount <= 0 || confirmed >= inspection.finalRefundAmount };
}
export async function confirmInspection(userId, identifier, bankData = {}) {
    const order = await ownOrder(userId, identifier);
    const inspection = await ReturnInspection.findOne({ orderId: order._id });
    if (!inspection)
        fail(404, 'Đơn chưa có biên bản kiểm định.');
    if (inspection.customerStatus === 'approved')
        return { order: order.toObject(), inspection: await getInspection(userId, identifier) };
    if (inspection.finalRefundAmount > 0 && (!String(bankData.bankName || '').trim() || !/^\d{6,30}$/.test(String(bankData.accountNumber || '').trim()) || !String(bankData.accountHolder || '').trim())) {
        fail(400, 'Vui lòng nhập ngân hàng, số tài khoản (6–30 chữ số) và tên chủ tài khoản hợp lệ.');
    }
    const updated = await ReturnInspection.findOneAndUpdate({ _id: inspection._id, customerStatus: inspection.customerStatus }, { $set: {
            customerStatus: 'approved', customerConfirmedAt: new Date(),
            refundBankDetails: Object.fromEntries(['bankName', 'accountNumber', 'accountHolder', 'notes'].map((key) => [key, String(bankData[key] || '').trim()])),
        } }, { new: true, runValidators: true });
    if (!updated)
        fail(409, 'Biên bản vừa thay đổi. Vui lòng tải lại.');
    // Customer confirmation is not a bank transfer and does not complete the order.
    return { order: order.toObject(), inspection: await getInspection(userId, identifier) };
}
export async function disputeInspection(userId, identifier, reason) {
    const order = await ownOrder(userId, identifier);
    if (!String(reason || '').trim())
        fail(400, 'Vui lòng nhập lý do khiếu nại.');
    const inspection = await ReturnInspection.findOneAndUpdate({ orderId: order._id, customerStatus: { $ne: 'approved' } }, { $set: { customerStatus: 'disputed', disputeReason: String(reason).trim(), disputeCreatedAt: new Date() } }, { new: true, runValidators: true });
    if (!inspection)
        fail(409, 'Biên bản không tồn tại hoặc đã được xác nhận.');
    return { order: order.toObject(), inspection };
}
