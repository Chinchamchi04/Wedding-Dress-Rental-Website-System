import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { message, Modal } from 'antd';
import {
  ArrowLeft,
  CalendarDays,
  Landmark,
  Shirt,
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  RefreshCcw,
  Star,
  XCircle,
  MessageCircle,
  Printer,
  AlertCircle,
} from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import { formatVnd, getOrder, updateOrderStatus } from '../../services/orderService';

/* ─────────────────────────────────────────────
   STATUS TIMELINE CONFIG
───────────────────────────────────────────── */
const TIMELINE_STEPS = [
  {
    key: 'deposit_paid',
    label: 'Đặt Cọc',
    subLabel: 'Đã xác nhận cọc',
    Icon: CheckCircle2,
  },
  {
    key: 'preparing',
    label: 'Chuẩn Bị',
    subLabel: 'Đang chuẩn bị bàn giao',
    Icon: Package,
  },
  {
    key: 'delivered',
    label: 'Đã Giao',
    subLabel: 'Váy đã được giao',
    Icon: Truck,
  },
  {
    key: 'renting',
    label: 'Đang Thuê',
    subLabel: 'Đang trong thời gian thuê',
    Icon: Clock,
  },
  {
    key: 'returned',
    label: 'Đã Trả',
    subLabel: 'Váy đã được trả lại',
    Icon: RefreshCcw,
  },
  {
    key: 'completed',
    label: 'Hoàn Tất',
    subLabel: 'Đơn hàng hoàn tất',
    Icon: Star,
  },
];

// Map từ rawStatus → index bước đang active (0-based)
const STATUS_STEP_MAP = {
  pending_payment: -1, // chưa cọc
  deposit_paid: 0,
  preparing: 1,
  delivered: 2,
  renting: 3,
  returned: 4,
  completed: 5,
};

/* ─────────────────────────────────────────────
   ORDER STATUS TIMELINE COMPONENT
───────────────────────────────────────────── */
function OrderStatusTimeline({ rawStatus }) {
  // Trạng thái huỷ: hiển thị banner thay timeline
  if (rawStatus === 'cancelled') {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="font-semibold text-sm">Đơn hàng đã bị huỷ</p>
          <p className="text-xs text-red-500 mt-0.5">
            Đơn thuê này đã được huỷ. Vui lòng liên hệ UniBridal nếu có thắc mắc.
          </p>
        </div>
      </div>
    );
  }

  const activeIndex = STATUS_STEP_MAP[rawStatus] ?? -1;

  return (
    <section
      className="mt-6 rounded-2xl border border-[#EEDECF] bg-[#FFF9F6] px-5 py-6 sm:px-7"
      aria-label="Trạng thái đơn hàng"
    >
      <p className="mb-5 text-[11px] font-bold uppercase tracking-[1.6px] text-[#BA7A83]">
        ✦ Hành Trình Lễ Phục Của Nàng
      </p>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex items-start">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;
          const { Icon } = step;

          return (
            <React.Fragment key={step.key}>
              {/* Step node */}
              <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
                {/* Circle */}
                <div className="relative flex items-center justify-center">
                  {isCompleted && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BA7A83] shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {isActive && (
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#BA7A83] bg-white shadow-sm">
                      <Icon className="h-4 w-4 text-[#BA7A83]" />
                      {/* Pulsing ring */}
                      <span className="absolute inset-0 rounded-full animate-ping bg-[#BA7A83]/20" />
                    </div>
                  )}
                  {isPending && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEDECF]/60 border border-[#EEDECF]">
                      <Circle className="h-4 w-4 text-[#EEDECF]" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="text-center px-1">
                  <p
                    className={`text-[11.5px] font-semibold leading-tight ${
                      isCompleted || isActive ? 'text-[#804E55]' : 'text-[#BCAAA4]'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-[10px] text-[#BA7A83] leading-tight">
                      {step.subLabel}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line (not after last) */}
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`mt-5 h-0.5 flex-1 min-w-[16px] self-start transition-colors ${
                    idx < activeIndex ? 'bg-[#BA7A83]' : 'bg-[#EEDECF]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <ol className="flex flex-col gap-0 sm:hidden">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;
          const { Icon } = step;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          return (
            <li key={step.key} className="flex gap-3">
              {/* Left: circle + vertical line */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  {isCompleted && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BA7A83]">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isActive && (
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#BA7A83] bg-white">
                      <Icon className="h-4 w-4 text-[#BA7A83]" />
                      <span className="absolute inset-0 rounded-full animate-ping bg-[#BA7A83]/20" />
                    </div>
                  )}
                  {isPending && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEDECF] bg-[#EEDECF]/50">
                      <Circle className="h-3.5 w-3.5 text-[#EEDECF]" />
                    </div>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`mt-1 w-0.5 flex-1 min-h-[16px] ${
                      idx < activeIndex ? 'bg-[#BA7A83]' : 'bg-[#EEDECF]'
                    }`}
                  />
                )}
              </div>

              {/* Right: text */}
              <div className="pb-4">
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isCompleted || isActive ? 'text-[#804E55]' : 'text-[#BCAAA4]'
                  }`}
                >
                  {step.label}
                </p>
                {(isActive || isCompleted) && (
                  <p className="mt-0.5 text-[11px] text-[#BA7A83]">{step.subLabel}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancelOrder = () => {
    Modal.confirm({
      title: 'Xác nhận yêu cầu hủy đơn thuê',
      content: 'Nàng có chắc chắn muốn hủy đơn thuê này? Tiền cọc sẽ được xử lý hoàn trả theo chính sách hợp đồng của UniBridal.',
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        setCancelling(true);
        try {
          await updateOrderStatus(order._id || order.id, 'cancelled');
          message.success('Đã gửi yêu cầu hủy đơn thành công');
          setOrder((prev) => ({
            ...prev,
            rawStatus: 'cancelled',
            status: 'cancelled',
            statusLabel: 'Đã hủy',
          }));
        } catch {
          message.error('Không thể hủy đơn lúc này. Vui lòng liên hệ showroom.');
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  useEffect(() => {
    let active = true;
    getOrder(orderId)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((issue) => {
        if (active) setError(issue.message || 'Không tìm thấy thông tin đơn hàng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <AccountLayout
      hideSidebar
      breadcrumb={[
        { label: 'Lịch sử đơn hàng', to: '/profile/orders' },
        { label: order ? `Chi tiết #${order.id}` : 'Chi tiết đơn hàng' },
      ]}
    >
      <div className="account-detail-content">
        <div className="mb-4 flex justify-end">
          <Link
            to="/profile/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-[#874e57]"
          >
            <ArrowLeft size={14} /> QUAY LẠI LỊCH SỬ ĐƠN HÀNG
          </Link>
        </div>

        {loading ? (
          <section className="rounded-md bg-white p-8 text-center text-[#766966]">
            Đang tải dữ liệu đơn hàng...
          </section>
        ) : error ? (
          <section className="rounded-md bg-white p-8 text-center text-red-700" role="alert">
            {error}
          </section>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div className="rounded-2xl bg-gradient-to-br from-[#f8e9e4] to-[#FFF9F6] px-6 py-6 sm:px-8 border border-[#EEDECF]">
              <span className="account-status account-status-active">{order.statusLabel}</span>
              <h1 className="mt-2 font-playfair text-3xl sm:text-4xl">Chi Tiết Đơn Thuê Lễ Phục</h1>
              <p className="mt-2 font-playfair text-[27px] italic text-[#874e57]">#{order.id}</p>
              <p className="mt-2 text-xs text-[#874e57]">
                <CalendarDays size={14} className="mr-1 inline" />
                Lịch thuê: {order.rentalDates}
              </p>
            </div>

            {/* ── STATUS TIMELINE ── */}
            <OrderStatusTimeline rawStatus={order.rawStatus} />

            {/* ── 2-COLUMN DETAIL ── */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Dress detail */}
              <section
                className="rounded-2xl bg-white px-5 py-6 sm:px-7 border border-[#EEDECF]"
                aria-labelledby="dress-detail-title"
              >
                <p className="account-overline text-[#874e57]">
                  <Shirt size={14} className="mr-1 inline" />
                  Chi tiết lễ phục
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-[160px_1fr]">
                  {order.image && (
                    <img
                      src={order.image}
                      alt={order.imageAlt}
                      className="h-56 w-full object-cover rounded-xl"
                    />
                  )}
                  <div>
                    <h2 id="dress-detail-title" className="font-playfair text-xl">
                      {order.dress}
                    </h2>
                    <p className="mt-2 text-xs text-[#874e57]">{order.category}</p>
                    <p className="mt-4 text-sm">Kích cỡ: {order.size}</p>
                    <p className="mt-2 text-sm">
                      Trạng thái hiện tại:{' '}
                      <span className="font-medium text-[#874e57]">{order.statusLabel}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Finance */}
              <section
                className="rounded-2xl bg-white px-5 py-6 sm:px-7 border border-[#EEDECF]"
                aria-labelledby="invoice-title"
              >
                <p className="account-overline text-[#874e57]">
                  Tài chính &amp; ký quỹ <Landmark size={15} className="float-right" />
                </p>
                <h2 id="invoice-title" className="mt-2 font-playfair text-xl">
                  Phí Thuê &amp; Tiền Cọc Theo Đơn
                </h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt>Tổng phí thuê trọn gói</dt>
                    <dd className="font-semibold">{formatVnd(order.amount)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#eee2df] pt-3">
                    <dt>Tiền cọc bảo lãnh</dt>
                    <dd className="font-semibold text-[#874e57]">{formatVnd(order.deposit)}</dd>
                  </div>
                </dl>
                <p className="mt-5 rounded-lg bg-[#fcf0ed] p-4 text-xs leading-5 text-[#66504d]">
                  Số tiền trên ghi nhận theo hợp đồng thuê. Tiền cọc sẽ được hoàn tất chuyển
                  trả vào tài khoản của nàng sau khi chuyên viên UniBridal thu hồi và kiểm định
                  lễ phục.
                </p>
              </section>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-[#EEDECF] shadow-xs">
              <div className="text-xs text-[#766966] flex items-center gap-2">
                <AlertCircle size={15} className="text-[#BA7A83] shrink-0" />
                <span>Cần thay đổi số đo hoặc hỗ trợ dời ngày thuê? Showroom UniBridal luôn sẵn sàng 24/7.</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/messages"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#BA7A83] text-[#804E55] text-xs font-semibold hover:bg-[#FFF9F6] transition-colors"
                >
                  <MessageCircle size={14} />
                  Nhắn tin với Showroom
                </Link>
                {(order.rawStatus === 'deposit_paid' || order.rawStatus === 'pending_payment') && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    {cancelling ? 'Đang xử lý...' : 'Yêu cầu hủy đơn'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BA7A83] hover:bg-[#a86a73] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs border-0"
                >
                  <Printer size={14} />
                  In Biên Nhận Đơn
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AccountLayout>
  );
}
