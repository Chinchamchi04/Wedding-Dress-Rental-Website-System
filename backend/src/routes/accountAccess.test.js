import test from 'node:test';
import assert from 'node:assert/strict';
import router from './index.js';
import orderRouter from './order.routes.js';
const route = (router, path, method = 'get') => router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route;
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
test('personal endpoints require a real login before controllers run', async () => {
    for (const [path, method] of [['/profile', 'get'], ['/profile', 'put'], ['/account/orders', 'get'], ['/account/orders/:id', 'get'], ['/account/orders/:id/cancel', 'post'], ['/account/orders/:id/inspection/approve', 'post']]) {
        const res = response();
        let next = false;
        await route(router, path, method).stack[0].handle({ headers: {} }, res, () => { next = true; });
        assert.equal(res.statusCode, 401, path);
        assert.equal(next, false, path);
    }
});
test('admin reports reject staff and customers but allow administrators', async () => {
    for (const path of ['/admin/dashboard', '/admin/revenue']) {
        for (const role of ['STAFF', 'CUSTOMER', 'ADMIN']) {
            const res = response();
            let next = false;
            route(router, path).stack[1].handle({ user: { roleId: { code: role } } }, res, () => { next = true; });
            assert.equal(next, role === 'ADMIN', path + role);
            if (role !== 'ADMIN')
                assert.equal(res.statusCode, 403);
        }
    }
});
test('shared staff order operations keep staff/admin permission and reject customers', () => {
    for (const [path, method] of [['/', 'get'], ['/:id/status', 'patch'], ['/:id/inspection', 'post']]) {
        const guard = route(orderRouter, path, method).stack[1].handle;
        for (const role of ['STAFF', 'ADMIN', 'CUSTOMER']) {
            let next = false;
            const res = response();
            guard({ user: { roleId: { code: role } } }, res, () => { next = true; });
            assert.equal(next, role !== 'CUSTOMER');
        }
    }
});
