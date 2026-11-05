import test, { mock, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import ReturnInspection from '../models/ReturnInspection.model.js';
import Payment from '../models/Payment.model.js';
import { assertOrderAccess, orderDetail, cancelOrder, confirmInspection, getInspection, disputeInspection } from './customerAccountService.js';
import { updateProfile } from './accountService.js';
const query = (value) => ({ select() { return this; }, lean: async () => value });
const userId = '507f1f77bcf86cd799439011';
function owner(order = { _id: 'order', status: 'pending_payment', toObject() { return { ...this }; } }) {
    mock.method(User, 'findById', () => query({ email: 'sample@example.invalid', phone: '0900000000' }));
    mock.method(Order, 'findOne', async (filter) => { assert.ok(filter.$and); return order; });
    return order;
}
afterEach(() => mock.restoreAll());
test('anonymous users cannot read orders', async () => {
    await assert.rejects(assertOrderAccess(null, 'SAMPLE'), (error) => error.statusCode === 401);
});
test('non-owner cannot read a detail even if they know the order code', async () => {
    owner();
    mock.method(Order, 'findOne', async () => null);
    await assert.rejects(orderDetail(userId, 'SAMPLE'), (error) => error.statusCode === 404);
});
test('ownership filter never matches guest contacts on an order assigned to someone else', async () => {
    owner();
    mock.method(Order, 'findOne', async (filter) => { const allowed = filter.$and[1].$or; assert.deepEqual(allowed[0], { customerId: userId }); assert.equal(allowed[1].customerId, null); return null; });
    await assert.rejects(cancelOrder(userId, 'SAMPLE'), (error) => error.statusCode === 404);
});
test('staff access keeps its existing authorization without a personal order lookup', async () => {
    mock.method(Order, 'findOne', () => { throw new Error('unexpected lookup'); });
    await assertOrderAccess({ _id: userId, roleId: { code: 'STAFF' } }, 'SAMPLE');
});
test('cancel cannot change an order already delivered', async () => {
    owner({ _id: 'order', status: 'delivered' });
    mock.method(Order, 'findOneAndUpdate', () => { throw new Error('unexpected write'); });
    await assert.rejects(cancelOrder(userId, 'SAMPLE'), (error) => error.statusCode === 409);
});
test('cancel handles a concurrent state change without reporting success', async () => {
    owner();
    mock.method(Order, 'findOneAndUpdate', async () => null);
    await assert.rejects(cancelOrder(userId, 'SAMPLE'), (error) => error.statusCode === 409);
});
test('inspection approval stores confirmation only, without completing an order or refunding it', async () => {
    owner();
    const inspection = { _id: 'inspection', customerStatus: 'pending', finalRefundAmount: 1000, isRefunded: false };
    mock.method(ReturnInspection, 'findOne', () => ({ ...query(inspection), then(resolve) { return Promise.resolve(inspection).then(resolve); } }));
    mock.method(ReturnInspection, 'findOneAndUpdate', async (filter, update) => {
        assert.equal(update.$set.customerStatus, 'approved');
        assert.equal(update.$set.isRefunded, undefined);
        assert.equal(update.$set.refundedAt, undefined);
        return { ...inspection, customerStatus: 'approved' };
    });
    mock.method(Order, 'findOneAndUpdate', () => { throw new Error('unexpected order completion'); });
    mock.method(Payment, 'find', () => query([]));
    mock.method(Payment, 'create', () => { throw new Error('unexpected payment write'); });
    const result = await confirmInspection(userId, 'SAMPLE', { bankName: 'Sample Bank', accountNumber: '12345678', accountHolder: 'Sample' });
    assert.equal(result.inspection.isRefunded, false);
});
test('old refunded flag alone is not evidence of a bank refund', async () => {
    owner();
    mock.method(ReturnInspection, 'findOne', () => query({ finalRefundAmount: 1000, isRefunded: true }));
    mock.method(Payment, 'find', () => query([]));
    assert.equal((await getInspection(userId, 'SAMPLE')).isRefunded, false);
});
test('successful refund transactions confirm a refund', async () => {
    owner();
    mock.method(ReturnInspection, 'findOne', () => query({ finalRefundAmount: 1000, isRefunded: false }));
    mock.method(Payment, 'find', () => query([{ amount: 600 }, { amount: 400 }]));
    assert.equal((await getInspection(userId, 'SAMPLE')).isRefunded, true);
});
test('empty dispute is rejected before a write', async () => {
    owner();
    await assert.rejects(disputeInspection(userId, 'SAMPLE', ' '), (error) => error.statusCode === 400);
});
test('profile updates use only existing model fields', async () => {
    let saves = 0;
    const user = { _id: userId, email: 'sample@example.invalid', avatar: '', roleId: { code: 'CUSTOMER' }, save: async () => { saves++; } };
    const result = await updateProfile(user, { name: 'Sample', phone: '0900000000', idCard: '123456789012', address: { street: 'Sample' }, measurements: { height: 165, waist: 60 } });
    assert.equal(saves, 1);
    assert.equal(result.measurements.height, 165);
    assert.equal(result.idCard, '123456789012');
    assert.equal(result.address.street, 'Sample');
});
test('invalid measurement fails instead of being persisted', async () => {
    const user = { _id: userId, email: 'sample@example.invalid', save: async () => { throw new Error('unexpected save'); } };
    await assert.rejects(updateProfile(user, { name: 'Sample', phone: '0900000000', measurements: { height: 'bad' } }), (error) => error.statusCode === 400);
});
