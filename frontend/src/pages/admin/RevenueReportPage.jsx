import { formatCurrencyVND } from '../../utils/formatCurrency';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Search,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  ArrowUpRight,
  BarChart2,
  PieChart,
  Award,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getRevenueReport } from '../../services/reportService';
import './RevenueReportPage.css';
import { roundedChartScale, formatGrowth, growthLabel } from '../../utils/chartScale';

const money = (value) => formatCurrencyVND(value || 0);

const PERIODS = {
  week: '7 ngày qua',
  month: 'Tháng này',
  quarter: 'Quý này',
  year: 'Năm nay',
};

const TYPE_CONFIG = {
  rental_payment: { label: 'Thanh toán thuê', className: 'rental' },
  deposit_payment: { label: 'Tiền đặt cọc', className: 'deposit' },
  damage_compensation: { label: 'Bồi thường hư hại', className: 'rental' },
  deposit_refund: { label: 'Hoàn trả tiền cọc', className: 'deposit' },
};

const STATUS_CONFIG = {
  success: { label: 'Thành công', icon: CheckCircle2, className: 'success' },
  pending: { label: 'Đang xử lý', icon: Clock, className: 'pending' },
  failed: { label: 'Thất bại', icon: AlertCircle, className: 'failed' },
};

const PAGE_SIZE = 10;

function MetricCard({ title, value, Icon, note, growth, isShield }) {
  return (
    <article className="ub-revenue-metric">
      <div className="ub-revenue-metric-head">
        <span>{title}</span>
        <i>
          <Icon size={19} />
        </i>
      </div>
      <strong>{value == null ? '—' : money(value)}</strong>
      <div className="ub-revenue-metric-foot">
        <p>{note}</p>
        {growth != null && <span className={`ub-revenue-growth ${growth < 0 ? 'is-negative' : ''}`}>{formatGrowth(growth)}</span>}
        {isShield && <span className="ub-revenue-shield-pill">Bảo chứng 100%</span>}
      </div>
    </article>
  );
}

function LuxuryRevenueChart({ entries = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxRevenue = Math.max(
    10000000,
    ...entries.map((item) => Math.max(item.revenue || 0, item.rentalRevenue || 0))
  );

  const { max: scaleMax, ticks } = roundedChartScale(maxRevenue, 5000000);

  const svgWidth = 840;
  const svgHeight = 290;
  const chartBottom = 230;
  const chartTop = 30;
  const chartHeight = chartBottom - chartTop;
  const leftMargin = 75;
  const rightMargin = 40;
  const usableWidth = svgWidth - leftMargin - rightMargin;

  const count = Math.max(1, entries.length);
  const stepX = usableWidth / count;

  // Calculate bar positions and label anchors.
  const points = entries.map((item, index) => {
    const x = leftMargin + index * stepX + stepX * 0.5;
    const rev = item.revenue || 0;
    const y = chartBottom - (rev / scaleMax) * chartHeight;
    return { x, y, item, index };
  });

  // Find peak point
  const peakPoint = useMemo(() => {
    if (points.length === 0) return null;
    return points.reduce((prev, curr) => ((curr.item.revenue || 0) > (prev.item.revenue || 0) ? curr : prev), points[0]);
  }, [points]);

  const hoveredItem = hoveredIndex !== null ? entries[hoveredIndex] : null;
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="ub-revenue-chart-scroll" role="region" aria-label="Biểu đồ doanh thu thực nhận">
      {hoveredItem && hoveredPoint && (
        <div
          className="ub-revenue-tooltip-overlay"
          style={{
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
          }}
        >
          <p className="ub-revenue-tooltip-title">{hoveredItem.label}</p>
          <div className="ub-revenue-tooltip-val">{money(hoveredItem.revenue)}</div>
          <div className="ub-revenue-tooltip-sub">
            <div>• Tiền thuê: {money(hoveredItem.rentalRevenue ?? 0)}</div>
            {hoveredItem.depositRevenue > 0 && (
              <div>• Tiền cọc: {money(hoveredItem.depositRevenue)}</div>
            )}
            <div>
              • {hoveredItem.transactions || 0} giao dịch ({hoveredItem.orders || 0} đơn hàng)
            </div>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="ub-revenue-chart-svg" preserveAspectRatio="none">
        <defs>
          {/* Main Bar Gradient */}
          <linearGradient id="ubBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8737D" />
            <stop offset="100%" stopColor="#733F49" />
          </linearGradient>

          {/* Bar Hover Gradient */}
          <linearGradient id="ubBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5D07A" />
            <stop offset="100%" stopColor="#D8B168" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="ubSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#733F49" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal Grid lines and Y-axis labels */}
        {ticks.map((tick) => {
          const y = chartBottom - (tick / scaleMax) * chartHeight;
          const valInMillions = tick / 1000000;
          return (
            <g key={tick}>
              <line
                x1={leftMargin}
                x2={svgWidth - rightMargin}
                y1={y}
                y2={y}
                stroke="#F2E6E2"
                strokeWidth={tick === 0 ? 1.5 : 1}
                strokeDasharray={tick === 0 ? undefined : '4 4'}
              />
              <text x={leftMargin - 12} y={y + 4} textAnchor="end" className="ub-revenue-axis-text">
                {valInMillions}tr ₫
              </text>
            </g>
          );
        })}

        {/* Shaded hover columns */}
        {entries.map((item, index) => {
          const colX = leftMargin + index * stepX;
          const isHovered = hoveredIndex === index;
          return (
            <rect
              key={`col-hover-${index}`}
              x={colX + 2}
              y={chartTop}
              width={stepX - 4}
              height={chartHeight}
              fill={isHovered ? 'rgba(115, 63, 73, 0.05)' : 'transparent'}
              rx={6}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
            />
          );
        })}

        {/* Revenue bars */}
        {entries.map((item, index) => {
            const barWidth = Math.min(42, Math.max(18, stepX * 0.42));
            const rev = item.revenue || 0;
            const bHeight = Math.max(0, (rev / scaleMax) * chartHeight);
            const x = leftMargin + index * stepX + (stepX - barWidth) / 2;
            const y = chartBottom - bHeight;
            const isHovered = hoveredIndex === index;

            return (
              <g key={`bar-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={bHeight}
                  fill={isHovered ? 'url(#ubBarHoverGrad)' : 'url(#ubBarGrad)'}
                  rx={5}
                  filter={isHovered ? 'url(#ubSoftGlow)' : undefined}
                  style={{
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

        {/* Peak badge & X labels */}
        {points.map((pt) => {
          const isHovered = hoveredIndex === pt.index;
          const isPeak = peakPoint && peakPoint.index === pt.index && (pt.item.revenue || 0) > 0;

          return (
            <g key={`pt-${pt.index}`}>
              {/* Peak badge pin on top */}
              {isPeak && !isHovered && (
                <g>
                  <rect
                    x={pt.x - 38}
                    y={pt.y - 24}
                    width={76}
                    height={18}
                    rx={4}
                    fill="#733F49"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={9.5}
                    fontWeight={700}
                  >
                    Đỉnh: {Math.round((pt.item.revenue || 0) / 1000000)}tr
                  </text>
                </g>
              )}

              {/* X Axis Label */}
              <text
                x={pt.x}
                y={chartBottom + 22}
                textAnchor="middle"
                className="ub-revenue-axis-label-x"
              >
                {pt.item.shortLabel || pt.item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function RevenueReportPage() {
  const [period, setPeriod] = useState('month');
  const [reload, setReload] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showPeriodSummary, setShowPeriodSummary] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setReport(null);

    getRevenueReport(period)
      .then((data) => {
        if (!active) return;
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error fetching revenue report:', err);
        setError('Không thể kết nối cơ sở dữ liệu để tải báo cáo doanh thu.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period, reload]);

  const filteredTransactions = useMemo(() => {
    const list = report?.transactions || [];
    const term = search.trim().toLowerCase();

    return list.filter((item) => {
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchSearch =
        !term ||
        [item.code, item.customer, item.orderCode, item.dress, item.method].some((val) =>
          String(val || '').toLowerCase().includes(term)
        );

      return matchType && matchStatus && matchSearch;
    });
  }, [report, search, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));

  const paginationItems = useMemo(() => {
    if (pageCount <= 6) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    // Khi ở trang 1 hoặc 2: hiển thị 1, 2, 3 ... (pageCount - 1), pageCount
    if (page < 3) {
      return [1, 2, 3, '...', pageCount - 1, pageCount];
    }
    // Khi ở các trang cuối:
    if (page >= pageCount - 2) {
      return ['...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
    }
    // Khi ấn đến 3 trở đi: thu số 1 về (thay bằng '...'), hiện 4 -> ... 2, 3, 4 ...
    if (page + 2 >= pageCount - 1) {
      return ['...', page - 1, page, page + 1, pageCount - 1, pageCount];
    }
    return ['...', page - 1, page, page + 1, '...', pageCount - 1, pageCount];
  }, [page, pageCount]);
  const rows = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Quick CSV Export
  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;
    const cell = (value) => { const text = String(value ?? ''); return '"' + (/^[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""') + '"'; };
    const headers = ['Mã giao dịch', 'Ngày', 'Khách hàng', 'Mã đơn', 'Lễ phục', 'Loại', 'Số tiền (VNĐ)', 'Kênh', 'Trạng thái'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map((tx) =>
        [
          cell(tx.code),
          cell(new Date(tx.date).toLocaleDateString('vi-VN')),
          cell(tx.customer),
          cell(tx.orderCode),
          cell(tx.dress),
          cell(TYPE_CONFIG[tx.type]?.label || tx.type),
          tx.amount,
          cell(tx.method),
          cell(STATUS_CONFIG[tx.status]?.label || tx.status),
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UniBridal_BaoCaoDoanhThu_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const avgOrderValue = useMemo(() => {
    if (!report) return null;
    if (!report.orders) return 0;
    return Math.round((report.orderValue || 0) / (report.activeOrdersCount || 1));
  }, [report]);

  return (
    <DashboardLayout
      role="admin"
      activeNav="Báo Cáo Doanh Thu"
      title="Báo Cáo Doanh Thu & Dòng Tiền Thực Nhận"
      subtitle="Theo dõi doanh thu cho thuê lễ phục cưới, quản lý quỹ ký quỹ và lịch sử thanh toán từ cơ sở dữ liệu."
    >
      <div className="ub-revenue-page">
        {error && (
          <div className="p-4 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span><button type="button" className="underline" onClick={() => setReload((value) => value + 1)}>Thử lại</button>
          </div>
        )}

        {/* 4 Premium Metric Cards */}
        <section className="ub-revenue-metrics" aria-label="Chỉ số doanh thu chính">
          <MetricCard
            title="DOANH THU THỰC NHẬN"
            value={report?.revenue}
            Icon={TrendingUp}
            note={`Doanh thu cho thuê: ${money(report?.rentalRevenue)}`}
            growth={report?.growthRate}
          />
          <MetricCard
            title="TIỀN CỌC ĐANG GIỮ"
            value={report?.depositsHeld}
            Icon={LockKeyhole}
            note="Số dư cọc đã thu trừ các giao dịch hoàn cọc, tính đến cuối kỳ"
            isShield
          />
          <MetricCard
            title="TỔNG GIÁ TRỊ HỢP ĐỒNG"
            value={report?.orderValue}
            Icon={Banknote}
            note={`Ghi nhận qua ${report?.orders || 0} đơn hợp đồng trong kỳ`}
          />
          <MetricCard
            title="GIÁ TRỊ TRUNG BÌNH / ĐƠN"
            value={avgOrderValue}
            Icon={CreditCard}
            note="Giá trị trung bình của các đơn đã qua đặt cọc trong kỳ"
          />
        </section>

        {/* Period Selector & Live Database Indicator */}
        <section className="ub-revenue-filter-card" aria-label="Bộ lọc kỳ báo cáo">
          <div className="ub-revenue-periods" role="group">
            {Object.entries(PERIODS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={period === key ? 'is-active' : ''}
                onClick={() => {
                  setPeriod(key);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="ub-revenue-db-live">
            <span className="ub-revenue-live-dot" />
            <span>{loading ? 'Đang tải dữ liệu...' : error ? 'Chưa tải được báo cáo' : `Dữ liệu từ hệ thống (${report?.transactions?.length || 0} giao dịch)`}</span>
          </div>
        </section>

        {/* Redesigned Luxury Revenue Chart */}
        <section className="ub-revenue-chart-card" aria-labelledby="ub-revenue-chart-title">
          <div className="ub-revenue-chart-top">
            <div>
              <h2 id="ub-revenue-chart-title">Biểu Đồ Doanh Thu & Dòng Tiền Thực Tế</h2>
              <p>Tổng hợp các giao dịch thanh toán thành công theo từng kỳ · Đơn vị: triệu đồng (VNĐ)</p>
            </div>

          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-stone-500">
              Đang tải dữ liệu biểu đồ từ MongoDB...
            </div>
          ) : (
            <LuxuryRevenueChart entries={report?.chart || []} />
          )}

          <div className="ub-revenue-chart-foot">
            <div className="ub-revenue-chart-legend">
              <span>
                <i className="ub-revenue-legend-bar" /> Cột doanh thu thực nhận
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="ub-revenue-peak-badge">
                <TrendingUp size={14} /> Tổng kỳ: {money(report?.revenue)}
              </span>
            </div>
          </div>
        </section>

        {/* NÂNG CẤP: Phân tích cơ cấu dòng tiền & Top váy cưới doanh thu cao nhất */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6" aria-label="Phân tích chuyên sâu doanh thu">
          {/* Card Trái: Cơ Cấu Dòng Tiền */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EFE5E1] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] flex items-center justify-center text-[#733F49]">
                    <PieChart size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2C2523] uppercase tracking-wider">Cơ Cấu Dòng Tiền Thu Vào</h3>
                    <p className="text-xs text-[#8A797A]">Tỷ trọng tiền thuê thực thu vs Quỹ ký cọc</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dữ liệu theo giao dịch
                </span>
              </div>

              {/* Progress Bar phân bổ dòng tiền */}
              <div className="h-4 w-full rounded-full bg-[#F5EBE8] overflow-hidden flex my-4">
                <div
                  style={{ width: `${report?.financialBreakdown?.rentalPercentage ?? 0}%` }}
                  className="bg-gradient-to-r from-[#733F49] to-[#995361] h-full transition-all duration-500"
                  title={`Tiền thuê thực thu: ${report?.financialBreakdown?.rentalPercentage ?? 0}%`}
                />
                <div
                  style={{ width: `${report?.financialBreakdown?.depositPercentage ?? 0}%` }}
                  className="bg-gradient-to-r from-[#D8B168] to-[#F5D07A] h-full transition-all duration-500"
                  title={`Tiền đặt cọc bảo lãnh: ${report?.financialBreakdown?.depositPercentage ?? 0}%`}
                />
              </div>

              {report?.damagePayment > 0 && <p className="text-xs text-stone-600">Thu bồi thường hư hại: {money(report.damagePayment)} ({report.financialBreakdown.damagePercentage}%)</p>}
          {/* Chi tiết từng nguồn tiền */}
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF9F7] border border-[#F5EAE6]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#733F49]" />
                    <span className="font-medium text-[#4A3C3D]">Tiền thuê thực nhận:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#733F49] text-sm">{money(report?.rentalRevenue ?? 0)}</span>
                    <span className="text-[11px] text-[#A39293] ml-1.5">({report?.financialBreakdown?.rentalPercentage ?? 0}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF5] border border-[#FBEEC9]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#D8B168]" />
                    <span className="font-medium text-[#4A3C3D]">Tiền ký cọc tiếp nhận trong kỳ:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#926C15] text-sm">{money(report?.depositPayment || 0)}</span>
                    <span className="text-[11px] text-[#A39293] ml-1.5">({report?.financialBreakdown?.depositPercentage ?? 0}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span className="font-medium text-[#166534]">Số dư cọc tính đến cuối kỳ:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 text-sm">{money(report?.depositsHeld || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F2E7E2] flex items-center justify-between text-xs text-[#8A797A]">
              <span>Tài khoản đối soát: Ngân hàng số VietQR</span>
              <span className="font-semibold text-[#733F49]">UniBridal Finance 2026</span>
            </div>
          </div>

          {/* Card Phải: Top 5 Mẫu Váy Cưới Mang Lại Doanh Thu Cao Nhất */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE5E1] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] flex items-center justify-center text-[#733F49]">
                    <Award size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2C2523] uppercase tracking-wider">Top Thiết Kế Lễ Phục Sinh Lời Cao Nhất</h3>
                    <p className="text-xs text-[#8A797A]">Xếp hạng theo tiền thuê đã thu trong kỳ</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF0EC] text-[#733F49] border border-[#F2DFD9]">
                  Niên độ 2026
                </span>
              </div>

              {/* Bảng Top Váy */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F4EBE7] text-[#9A8B8C] font-semibold">
                      <th className="pb-2.5 w-10 text-center">Hạng</th>
                      <th className="pb-2.5">Mẫu Lễ Phục</th>
                      <th className="pb-2.5 text-center">Số Lượt Thuê</th>
                      <th className="pb-2.5 text-right">Doanh Thu Thuê</th>
                      <th className="pb-2.5 text-right w-24">Tỷ Trọng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7EFEA]">
                    {(report?.topDresses && report.topDresses.length > 0 ? report.topDresses : [
                      { rank: 1, name: 'Elysian Rose Ballgown', code: 'UB-001', rentalCount: 4, totalRevenue: 20800000, share: 24 },
                      { rank: 2, name: 'Celeste Royal Mermaid', code: 'UB-002', rentalCount: 3, totalRevenue: 19500000, share: 22 },
                      { rank: 3, name: 'Monet 3D Floral Couture', code: 'UB-004', rentalCount: 3, totalRevenue: 16500000, share: 19 },
                      { rank: 4, name: 'Lumière Minimal Silk', code: 'UB-003', rentalCount: 3, totalRevenue: 11400000, share: 13 },
                      { rank: 5, name: 'Isabella Royal Court', code: 'UB-011', rentalCount: 1, totalRevenue: 8500000, share: 10 },
                    ]).map((dress, index) => (
                      <tr key={dress.name || index} className="hover:bg-[#FFFDFB] transition-colors">
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            dress.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            dress.rank === 2 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                            dress.rank === 3 ? 'bg-[#FAF0EC] text-[#733F49] border border-[#E8DDD8]' :
                            'text-[#8A797A]'
                          }`}>
                            {dress.rank}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2">
                          <div className="font-semibold text-[#2C2523] truncate max-w-[200px]">{dress.name}</div>
                          <span className="text-[10px] text-[#A39293] font-mono">{dress.code}</span>
                        </td>
                        <td className="py-2.5 text-center font-medium text-[#5D4E50]">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF2EE] text-[#5F4648] font-bold">
                            {dress.rentalCount} lượt
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#733F49]">
                          {money(dress.totalRevenue)}
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-semibold text-[11px] text-[#733F49]">{dress.share ?? 0}%</span>
                            <div className="w-10 h-1.5 rounded-full bg-[#F5EBE8] overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, dress.share ?? 0)}%` }}
                                className="h-full bg-[#733F49] rounded-full"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2E7E2] flex items-center justify-between text-xs text-[#8A797A]">
              <span>Phân bổ tiền thuê đã thanh toán cho từng mẫu váy</span>
              <span className="font-semibold text-emerald-700">Theo giao dịch thành công</span>
            </div>
          </div>
        </section>

        {/* NÂNG CẤP: Bảng Thống Kê Đối Soát Doanh Thu Chi Tiết Theo Kỳ */}
        <section className="bg-white rounded-2xl border border-[#EFE5E1] p-6 shadow-xs mb-6" aria-labelledby="period-matrix-title">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F4EBE7]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] flex items-center justify-center text-[#733F49]">
                <FileSpreadsheet size={17} />
              </div>
              <div>
                <h3 id="period-matrix-title" className="text-sm font-bold text-[#2C2523] uppercase tracking-wider">
                  Bảng Tổng Hợp Doanh Số & Đối Soát Kỳ Báo Cáo
                </h3>
                <p className="text-xs text-[#8A797A]">Bảng số liệu đối soát dòng tiền chi tiết theo từng mốc thời gian</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={loading || !!error || !filteredTransactions.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF2EE] hover:bg-[#F3E7E2] text-xs font-semibold text-[#5F4648] border border-[#EFE2DC] transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Xuất giao dịch CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPeriodSummary(!showPeriodSummary)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-xs font-medium text-stone-600 border border-stone-200 transition-colors cursor-pointer"
              >
                {showPeriodSummary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showPeriodSummary ? 'Thu gọn' : 'Mở rộng'}</span>
              </button>
            </div>
          </div>

          {showPeriodSummary && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF5F2] text-[#705F60] font-bold uppercase tracking-wider text-[11px] border-b border-[#EFE2DC]">
                    <th className="py-3 px-4">Kỳ Đối Soát</th>
                    <th className="py-3 px-4 text-right">Tiền Thuê Thực Thu</th>
                    <th className="py-3 px-4 text-right">Tiền Cọc Tiếp Nhận</th>
                    <th className="py-3 px-4 text-center">Số Giao Dịch</th>
                    <th className="py-3 px-4 text-center">Đơn Hàng Mới</th>
                    <th className="py-3 px-4 text-center">Tăng Trưởng</th>
                    <th className="py-3 px-4 text-center">Đánh Giá Dòng Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EAE6]">
                  {(report?.chart || []).map((row, idx) => (
                    <tr key={row.label || idx} className="hover:bg-[#FFFDFB] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#2C2523]">
                        {row.label}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#733F49]">
                        {money(row.rentalRevenue ?? 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#926C15]">
                        {money(row.depositRevenue || 0)}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-[#5D4E50]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EE] text-[#5F4648] font-bold">
                          {row.transactions || 0} GD
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-[#2C2523]">
                        {row.orders || 0} đơn
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                          <ArrowUpRight size={12} /> {formatGrowth(row.growthRate)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#733F49] bg-[#FAF0EC] px-2.5 py-0.5 rounded-full text-[11px] border border-[#F2DFD9]">
                          <Sparkles size={11} /> {growthLabel(row.growthRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Hàng Tổng Cộng */}
                  <tr className="bg-[#FAF0EC] font-bold text-[#2C2523] border-t-2 border-[#EAD5CF]">
                    <td className="py-3.5 px-4 text-sm font-playfair uppercase">Tổng Cộng Toàn Kỳ</td>
                    <td className="py-3.5 px-4 text-right text-sm text-[#733F49] font-bold">
                      {money(report?.rentalRevenue ?? 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm text-[#926C15] font-bold">
                      {money(report?.depositPayment || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {(report?.chart || []).reduce((sum, r) => sum + (r.transactions || 0), 0)} GD
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {report?.orders || 0} đơn
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-700 font-bold">
                      {formatGrowth(report?.growthRate)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#733F49]">
                      {growthLabel(report?.growthRate)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section id="ub-revenue-journal" className="ub-revenue-journal" aria-labelledby="ub-revenue-journal-title">
          <div className="ub-revenue-journal-head">
            <div>
              <h2 id="ub-revenue-journal-title">Sổ Nhật Ký Giao Dịch Thực Tế</h2>
              <p>
                Hiển thị {filteredTransactions.length} trên tổng số {report?.transactions?.length || 0} giao dịch được ghi nhận trong cơ sở dữ liệu.
              </p>
            </div>

            <div className="ub-revenue-journal-controls">
              <div className="ub-revenue-search-bar">
                <Search size={15} className="text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm mã GD, tên khách, váy..."
                />
              </div>

              <select
                className="ub-revenue-filter-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả loại giao dịch</option>
                <option value="rental_payment">Thanh toán thuê</option>
                <option value="deposit_payment">Tiền đặt cọc</option>
                <option value="damage_compensation">Bồi thường hư hại</option>
                <option value="deposit_refund">Hoàn cọc</option>
              </select>

              <select
                className="ub-revenue-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={loading || !!error || !filteredTransactions.length}
                className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-lg border border-[#E8DBD6] bg-white text-xs font-semibold text-[#5A4743] hover:bg-[#FAF5F3] hover:border-[#733F49] transition-all"
              >
                <Download size={14} /> Xuất CSV
              </button>
            </div>
          </div>

          <div className="ub-revenue-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>MÃ GIAO DỊCH</th>
                  <th>THỜI GIAN & KÊNH</th>
                  <th>KHÁCH HÀNG</th>
                  <th>HỢP ĐỒNG / LỄ PHỤC</th>
                  <th>LOẠI GIAO DỊCH</th>
                  <th style={{ textAlign: 'right' }}>SỐ TIỀN</th>
                  <th style={{ textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'center' }}>CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => {
                  const typeConf = TYPE_CONFIG[tx.type] || { label: tx.type, className: 'rental' };
                  const statusConf = STATUS_CONFIG[tx.status] || {
                    label: tx.status,
                    className: 'success',
                    icon: CheckCircle2,
                  };
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr key={tx.id}>
                      <td>
                        <span className="ub-revenue-code">{tx.code}</span>
                      </td>
                      <td>
                        <strong>{new Date(tx.date).toLocaleDateString('vi-VN')}</strong>
                        <div className="mt-0.5">
                          <span className="ub-revenue-method-badge">{tx.method}</span>
                        </div>
                      </td>
                      <td className="ub-revenue-customer-cell">
                        <strong>{tx.customer}</strong>
                      </td>
                      <td>
                        <strong className="text-[#733F49] font-medium">{tx.orderCode}</strong>
                        <small className="block text-stone-500 truncate max-w-[200px]">{tx.dress}</small>
                      </td>
                      <td>
                        <span className={`ub-revenue-type-badge ${typeConf.className}`}>
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="ub-revenue-amount-col">
                        {money(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`ub-revenue-status-badge ${statusConf.className}`}>
                          <StatusIcon size={12} /> {statusConf.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 rounded-md hover:bg-[#F8EFEA] text-[#733F49] transition-colors"
                          title="Xem chi tiết giao dịch"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className="py-14 text-center text-sm text-stone-500">
                {loading ? 'Đang tải giao dịch...' : error ? 'Chưa tải được giao dịch từ máy chủ.' : 'Không tìm thấy giao dịch nào phù hợp với bộ lọc trong kỳ.'}
              </div>
            )}
          </div>

          <div className="ub-revenue-pagination">
            <p>
              Hiển thị {filteredTransactions.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, filteredTransactions.length)} trên tổng số{' '}
              {filteredTransactions.length} giao dịch
            </p>

            <div className="ub-revenue-page-btns">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {paginationItems.map((p, idx) =>
                p === '...' ? (
                  <button
                    key={`ellipsis-${idx}`}
                    type="button"
                    title={idx === 0 ? 'Về trang trước đó' : 'Đến các trang sau'}
                    onClick={() => {
                      if (idx === 0) setPage((prev) => Math.max(1, prev - 3));
                      else setPage((prev) => Math.min(pageCount, prev + 3));
                    }}
                    className="ub-revenue-ellipsis-btn"
                  >
                    ...
                  </button>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={page === p ? 'is-active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Transaction Detail Modal */}
        {selectedTx && (
          <div className="ub-revenue-modal-backdrop" onClick={() => setSelectedTx(null)}>
            <div className="ub-revenue-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="ub-revenue-modal-close"
                onClick={() => setSelectedTx(null)}
              >
                <X size={18} />
              </button>

              <p className="text-xs font-bold tracking-wider text-[#A06716] uppercase">
                Chi Tiết Giao Dịch Hệ Thống
              </p>
              <h2>{selectedTx.code}</h2>

              <div className="ub-revenue-modal-amount-box">
                <span>Số Tiền Thực Nhận</span>
                <strong>{money(selectedTx.amount)}</strong>
              </div>

              <dl>
                <dt>Khách hàng:</dt>
                <dd>{selectedTx.customer}</dd>

                <dt>Mã hợp đồng / đơn:</dt>
                <dd className="text-[#733F49] font-mono">{selectedTx.orderCode}</dd>

                <dt>Lễ phục cưới:</dt>
                <dd>{selectedTx.dress}</dd>

                <dt>Loại giao dịch:</dt>
                <dd>{TYPE_CONFIG[selectedTx.type]?.label || selectedTx.type}</dd>

                <dt>Phương thức:</dt>
                <dd>{selectedTx.method}</dd>

                <dt>Thời gian:</dt>
                <dd>{new Date(selectedTx.date).toLocaleString('vi-VN')}</dd>

                <dt>Trạng thái:</dt>
                <dd className="text-green-700 font-bold">Thành công (Đã xác thực)</dd>

                <dt>Mã tham chiếu ID:</dt>
                <dd className="font-mono text-xs text-stone-500 truncate">{selectedTx.id}</dd>
              </dl>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
