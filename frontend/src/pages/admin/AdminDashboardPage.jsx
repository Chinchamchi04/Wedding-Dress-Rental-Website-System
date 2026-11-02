import { formatCurrencyVND } from '../../utils/formatCurrency';
import React, { useEffect, useMemo, useState } from 'react';
import { Banknote, Gem, PackageCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardChart from '../../components/common/DashboardChart';
import { getAdminDashboard } from '../../services/reportService';

const PERIODS = { week: '7 ngày qua', month: 'Tháng này', quarter: 'Quý này', year: 'Năm nay' };
const money = (value) => formatCurrencyVND(value);

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    setLoading(true);
    getAdminDashboard(period)
      .then((value) => {
        if (!active) return;
        if (value) {
          setData(value?.data || value);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setData(null);
        setError('Lỗi kết nối cơ sở dữ liệu: Không thể tải dữ liệu thống kê quản trị từ máy chủ MongoDB.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const chart = useMemo(() => {
    const values = data?.chart || [];
    const primary = values.map((item) => (item.orderValue || 0) / 1_000_000);
    const rawMax = Math.max(4, ...primary);
    const step = Math.ceil(rawMax / 4);
    const max = step * 4;
    return {
      labels: values.map((item) => item.label),
      primary,
      secondary: values.map(() => 0),
      trend: primary,
      max,
      ticks: [0, step, step * 2, step * 3, max],
      unit: 'tr',
    };
  }, [data]);

  const controls = (
    <div className="ub-dashboard-periods is-heading" role="group" aria-label="Khoảng thời gian thống kê">
      {Object.entries(PERIODS).map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={key === period}
          className={key === period ? 'is-active' : ''}
          onClick={() => setPeriod(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout
      role="admin"
      controls={controls}
      title="Tổng Quan Kinh Doanh"
      subtitle="Chỉ số hoạt động & phân tích tài chính UniBridal 2026"
      activeNav="dashboard"
    >
      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠️ Lỗi kết nối Cơ sở dữ liệu:</span> {error}
        </div>
      )}
      {data?.ordersMissingDepositTransaction > 0 && (
        <p role="alert" className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {data.ordersMissingDepositTransaction} đơn đã chuyển sang trạng thái đặt cọc nhưng chưa có giao dịch cọc thành công trong hệ thống. Cần đối soát trước khi xác nhận tiền thực thu.
        </p>
      )}

      <section className="ub-dashboard-metrics grid grid-cols-3 gap-[23px] max-[1120px]:gap-3 max-[650px]:grid-cols-1" aria-label="Chỉ số kinh doanh">
        {[
          {
            title: 'GIÁ TRỊ ĐƠN ĐÃ ĐẶT CỌC',
            value: money(data?.orderValue),
            note: `Tiền thuê thực thu ghi sổ: ${money(data?.revenue)}`,
            Icon: Banknote,
            color: 'rose',
          },
          {
            title: 'ĐƠN THUÊ LỄ PHỤC',
            value: data?.totalOrders ?? '—',
            note: `${data?.completedOrders ?? 0} đơn hoàn tất trong kỳ`,
            Icon: PackageCheck,
            color: 'gold',
          },
          {
            title: 'CỘNG ĐỒNG NÀNG DÂU',
            value: data?.members ?? '—',
            note: 'Tài khoản khách hàng đang hoạt động',
            Icon: Gem,
            color: 'rose',
          },
        ].map(({ title, value, note, Icon, color }) => (
          <article
            key={title}
            className="ub-dashboard-metric admin-metric min-w-0 rounded-[7px] border border-white bg-white px-[27px] pb-5 pt-7 max-[1120px]:px-[17px] max-[650px]:p-[18px]"
          >
            <div className="ub-dashboard-metric-head">
              <span>{title}</span>
              <span className={`ub-dashboard-metric-icon ${color}`}>
                <Icon size={20} />
              </span>
            </div>
            <div className="ub-dashboard-metric-value">{value}</div>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section
        className="ub-dashboard-chart-card is-admin mt-[41px] rounded-lg border border-[#f2e7e2] bg-white px-7 pb-[30px] pt-[27px] max-[650px]:mt-5 max-[650px]:p-4"
        aria-labelledby="admin-chart-title"
      >
        <div className="ub-dashboard-chart-head">
          <h2 id="admin-chart-title">
            <span className="ub-dashboard-title-dot" />
            Giá Trị Đơn Đã Đặt Cọc Theo Kỳ
          </h2>
          <p className="ub-dashboard-chart-subtitle">
            Tổng tiền thuê của các đơn đã qua bước đặt cọc giữ lịch theo niên độ 2026.
          </p>
        </div>
        {data && (
          <DashboardChart
            chartId={`admin-${period}`}
            {...chart}
            primaryLabel="Giá trị đơn"
            secondaryLabel=""
            trendLabel="Xu hướng"
            variant="admin"
          />
        )}
      </section>
    </DashboardLayout>
  );
}
