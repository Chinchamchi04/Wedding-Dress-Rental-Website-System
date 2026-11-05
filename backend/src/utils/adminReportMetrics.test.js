import test from 'node:test';
import assert from 'node:assert/strict';
import { reportBounds, previousBounds, reportBuckets, growthRate, revenueChart, rankedDresses } from './adminReportMetrics.js';
test('monthly buckets cover leap February once, with dynamic month labels', () => {
    const { start, end } = reportBounds('month', new Date(2028, 1, 17));
    const buckets = reportBuckets('month', start, end);
    assert.equal(buckets.length, 5);
    assert.ok(buckets.every((bucket) => bucket.label.includes('/2')));
    assert.equal(buckets[0].start.getTime(), start.getTime());
    assert.equal(buckets.at(-1).end.getTime(), end.getTime());
    buckets.slice(1).forEach((bucket, i) => assert.equal(bucket.start.getTime(), buckets[i].end.getTime()));
});
test('last seven days cross year boundaries and compare with preceding seven days', () => {
    const { start, end } = reportBounds('week', new Date(2027, 0, 2));
    assert.equal(start.getMonth(), 11);
    assert.equal(reportBuckets('week', start, end).length, 7);
    assert.equal(previousBounds('week', start).end.getTime(), start.getTime());
});
test('growth handles loss, no previous revenue and genuine zero', () => {
    assert.equal(growthRate(50, 100), -50);
    assert.equal(growthRate(100, 0), null);
    assert.equal(growthRate(0, 0), 0);
    assert.equal(growthRate(100, 100), 0);
});
test('a payment exactly at a bucket boundary is counted only in the next bucket', () => {
    const { start, end } = reportBounds('month', new Date(2026, 10, 5));
    const rows = revenueChart([{ transactionType: 'rental_payment', amount: 500, paidAt: new Date(2026, 10, 8) }], [], 'month', start, end);
    assert.equal(rows[0].revenue, 0);
    assert.equal(rows[1].revenue, 500);
    assert.equal(rows.reduce((sum, row) => sum + row.revenue, 0), 500);
});
test('rental ranking allocates actual paid amounts across every dress without doubling totals', () => {
    const order = { _id: 'order', items: [{ dressId: 'a', name: 'A', rentPrice: 1000000 }, { dressId: 'b', name: 'B', rentPrice: 2000000 }] };
    const rows = rankedDresses([{ orderId: order, transactionType: 'rental_payment', amount: 3000000 }], []);
    assert.equal(rows.find((r) => r.name === 'A').totalRevenue, 1000000);
    assert.equal(rows.find((r) => r.name === 'B').totalRevenue, 2000000);
    assert.equal(rows.reduce((sum, row) => sum + row.totalRevenue, 0), 3000000);
});
test('partial rental payments allocate exactly and deposits do not become rental revenue', () => {
    const order = { _id: 'order', items: [{ dressId: 'a', name: 'A', rentPrice: 1 }, { dressId: 'b', name: 'B', rentPrice: 2 }] };
    const rows = rankedDresses([{ orderId: order, transactionType: 'rental_payment', amount: 100 }, { orderId: order, transactionType: 'deposit_payment', amount: 500 }], []);
    assert.equal(rows.reduce((sum, row) => sum + row.totalRevenue, 0), 100);
    assert.equal(rows[0].rentalCount, 1);
    assert.deepEqual(rankedDresses([], []), []);
});
