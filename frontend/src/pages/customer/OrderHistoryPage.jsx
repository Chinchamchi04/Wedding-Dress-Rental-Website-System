import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import { formatVnd, getDemoOrders, getOrders } from '../../services/orderService';
import elysianImage from '../../assets/card1_elysian.jpg';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang thuê & Chờ nhận' },
  { id: 'complete', label: 'Đã hoàn tất' },
  { id: 'cancelled', label: 'Đã hủy' },
];

function OrderCard({ order }) {
  const active = order.status === 'active';
  return (
    <article className="border border-[#eee2df] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee2df] pb-3 text-xs">
        <span className="font-semibold text-[#874e57]">MÃ ĐƠN: #{order.id}</span>
        <span className={`account-status ${active ? 'account-status-active' : 'account-status-complete'}`}>
          {order.statusLabel}
        </span>
      </div>
      <div className="my-4 flex flex-col gap-4 sm:flex-row">
        <img src={order.image} alt={order.imageAlt} className="h-32 w-24 object-cover object-center" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-playfair text-xl">{order.dress}</h3>
              <p className="mt-1 text-xs text-[#766966]">
                Phân loại: {order.category} • Size {order.size} • Form {order.style}
              </p>
            </div>
            <strong className="text-base text-[#874e57]">{formatVnd(order.amount)}</strong>
          </div>
          {active ? (
            <>
              <p className="mt-3 text-xs">
                <CalendarDays size={14} className="mr-1 inline text-[#874e57]" />
                Lịch thuê: {order.rentalDates}
              </p>
              <div className="mt-3 rounded-sm bg-[#fcf0ed] px-3 py-2 text-xs leading-5 text-[#66504d]">
                Tiền cọc theo đơn: <strong>{formatVnd(order.deposit)}</strong>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-sm bg-[#fcf0ed] px-3 py-2 text-xs leading-5 text-[#66504d]">
              Đã bàn giao và hoàn cọc theo hợp đồng thuê.
            </div>
          )}
        </div>
      </div>
      {active && (
        <div className="border-t border-[#eee2df] pt-3 text-xs text-[#766966]">
          Trạng thái hiện tại: <span className="font-medium text-[#874e57]">{order.statusLabel}</span>
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#eee2df] pt-4">
        <Link className="account-button-primary" to={`/profile/orders/${order.id}`}>
          XEM CHI TIẾT ĐƠN
        </Link>
      </div>
    </article>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrders()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((issue) => {
        if (active) setError(issue.message || 'Không tải được danh sách đơn hàng từ máy chủ.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          (tab === 'all' || order.status === tab) &&
          `${order.id || ''} ${order.dress || ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi').trim())
      ),
    [orders, tab, query]
  );

  return (
    <AccountLayout hideBreadcrumb={true} breadcrumb={[]}>
      <section className="profile-card rounded-2xl bg-white px-5 py-7 sm:px-7 border border-[#F0E5DC] shadow-xs font-jakarta" aria-labelledby="order-history-title">

        <h1 id="order-history-title" className="mt-1 font-jakarta font-bold text-[24px] sm:text-[26px] text-[#2C2523] tracking-tight">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6c5b57]">
          Theo dõi tiến độ may đo, lịch trình thử váy và tình trạng giao nhận các kiệt tác lễ phục Haute Couture của nàng.
        </p>
        <div className="account-heading-rule mt-3" />
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Lọc trạng thái đơn hàng">
          {tabs.map(({ id, label }) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === id}
              key={id}
              onClick={() => setTab(id)}
              className={`account-tab ${tab === id ? 'account-tab-active' : ''}`}
            >
              {label} ({id === 'all' ? orders.length : orders.filter((order) => order.status === id).length})
            </button>
          ))}
        </div>
        <div className="mt-5 border-b border-[#eee2df] pb-5">
          <label className="account-search relative block w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#967c79]" />
            <span className="sr-only">Tìm mã đơn hàng hoặc tên váy</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã đơn hàng, tên váy cưới..."
              className="w-full rounded-xl border border-[#eee2df] bg-[#fff8f6] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#874e57] focus:bg-white transition-colors"
            />
          </label>
        </div>
        <div className="mt-5 space-y-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-[#766966]">Đang tải đơn hàng...</p>
          ) : filtered.length ? (
            filtered.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="py-16 text-center">
              <Heart size={30} className="mx-auto text-[#b8737d]" />
              <h2 className="mt-4 font-playfair text-xl">Không tìm thấy đơn hàng</h2>
              <p className="mt-2 text-sm text-[#766966]">Thử bộ lọc khác hoặc xóa từ khóa tìm kiếm.</p>
              <button
                type="button"
                onClick={() => {
                  setTab('all');
                  setQuery('');
                }}
                className="account-button-secondary mt-5"
              >
                XÓA BỘ LỌC
              </button>
            </div>
          )}
        </div>
      </section>
    </AccountLayout>
  );
}
