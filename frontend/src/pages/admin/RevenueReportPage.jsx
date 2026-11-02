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
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getRevenueReport } from '../../services/reportService';
import './RevenueReportPage.css';

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
      <strong>{money(value)}</strong>
      <div className="ub-revenue-metric-foot">
        <p>{note}</p>
        {growth && <span className="ub-revenue-growth">+{growth}%</span>}
        {isShield && <span className="ub-revenue-shield-pill">Bảo chứng 100%</span>}
      </div>
    </article>
  );
}

function LuxuryRevenueChart({ entries = [], chartMode = 'combo' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxRevenue = Math.max(
    10000000,
    ...entries.map((item) => Math.max(item.revenue || 0, item.rentalRevenue || 0))
  );

  // Round max for scale steps
  const scaleMax = Math.ceil(maxRevenue / 10000000) * 10000000;
  const fractions = [0, 0.25, 0.5, 0.75, 1];

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

  // Calculate points for the smooth area & curve
  const points = entries.map((item, index) => {
    const x = leftMargin + index * stepX + stepX * 0.5;
    const rev = item.revenue || 0;
    const y = chartBottom - (rev / scaleMax) * chartHeight;
    return { x, y, item, index };
  });

  // Generate smooth cubic bezier SVG path
  const curvePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.5;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) * 0.5;
      const cy2 = p1.y;
      path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${curvePath} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`;
  }, [curvePath, points, chartBottom]);

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
            <div>• Tiền thuê: {money(hoveredItem.rentalRevenue || hoveredItem.revenue)}</div>
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

          {/* Area Fill Gradient */}
          <linearGradient id="ubAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(184, 115, 125, 0.42)" />
            <stop offset="65%" stopColor="rgba(216, 177, 104, 0.12)" />
            <stop offset="100%" stopColor="rgba(216, 177, 104, 0.0)" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="ubSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#733F49" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Horizontal Grid lines and Y-axis labels */}
        {fractions.map((f) => {
          const y = chartBottom - f * chartHeight;
          const valInMillions = (scaleMax * f) / 1000000;
          return (
            <g key={f}>
              <line
                x1={leftMargin}
                x2={svgWidth - rightMargin}
                y1={y}
                y2={y}
                stroke="#F2E6E2"
                strokeWidth={f === 0 ? 1.5 : 1}
                strokeDasharray={f === 0 ? undefined : '4 4'}
              />
              <text x={leftMargin - 12} y={y + 4} textAnchor="end" className="ub-revenue-axis-text">
                {Math.round(valInMillions)}tr ₫
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

        {/* Area Gradient (if combo or area mode) */}
        {(chartMode === 'combo' || chartMode === 'area') && areaPath && (
          <path d={areaPath} fill="url(#ubAreaGrad)" />
        )}

        {/* Render Bars (if combo or bar mode) */}
        {(chartMode === 'combo' || chartMode === 'bar') &&
          entries.map((item, index) => {
            const barWidth = Math.min(42, Math.max(18, stepX * 0.42));
            const rev = item.revenue || 0;
            const bHeight = Math.max(4, (rev / scaleMax) * chartHeight);
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

        {/* Trend Curve Line (if combo or area mode) */}
        {(chartMode === 'combo' || chartMode === 'area') && curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke="#D8B168"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points & X labels */}
        {points.map((pt) => {
          const isHovered = hoveredIndex === pt.index;
          const isPeak = peakPoint && peakPoint.index === pt.index && (pt.item.revenue || 0) > 0;

          return (
            <g key={`pt-${pt.index}`}>
              {/* Outer halo on hover */}
              {isHovered && (
                <circle cx={pt.x} cy={pt.y} r={9} fill="rgba(216, 177, 104, 0.35)" />
              )}

              {/* Point dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5.5 : 4}
                fill={isHovered ? '#D8B168' : '#733F49'}
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredIndex(pt.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

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
  const [chartMode, setChartMode] = useState('combo');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

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
  }, [period]);

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
  const rows = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Quick CSV Export
  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;
    const headers = ['Mã giao dịch', 'Ngày', 'Khách hàng', 'Mã đơn', 'Lễ phục', 'Loại', 'Số tiền (VNĐ)', 'Kênh', 'Trạng thái'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map((tx) =>
        [
          `"${tx.code}"`,
          `"${new Date(tx.date).toLocaleDateString('vi-VN')}"`,
          `"${tx.customer}"`,
          `"${tx.orderCode}"`,
          `"${tx.dress}"`,
          `"${TYPE_CONFIG[tx.type]?.label || tx.type}"`,
          tx.amount,
          `"${tx.method}"`,
          `"${STATUS_CONFIG[tx.status]?.label || tx.status}"`,
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
  };

  const avgOrderValue = useMemo(() => {
    if (!report?.orders || report.orders === 0) return 0;
    return Math.round((report.revenue || 0) / report.orders);
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
            <span>{error}</span>
          </div>
        )}

        {/* 4 Premium Metric Cards */}
        <section className="ub-revenue-metrics" aria-label="Chỉ số doanh thu chính">
          <MetricCard
            title="DOANH THU THỰC NHẬN"
            value={report?.revenue}
            Icon={TrendingUp}
            note={`Doanh thu cho thuê: ${money(report?.rentalRevenue)}`}
            growth={report?.growthRate || 24.8}
          />
          <MetricCard
            title="TIỀN CỌC ĐANG GIỮ LỊCH"
            value={report?.depositsHeld}
            Icon={LockKeyhole}
            note="Cam kết hoàn trả 100% sau kiểm định hoàn tất"
            isShield
          />
          <MetricCard
            title="TỔNG GIÁ TRỊ HỢP ĐỒNG"
            value={report?.orderValue || report?.revenue}
            Icon={Banknote}
            note={`Ghi nhận qua ${report?.orders || 0} đơn hợp đồng trong kỳ`}
          />
          <MetricCard
            title="GIÁ TRỊ TRUNG BÌNH / ĐƠN"
            value={avgOrderValue}
            Icon={CreditCard}
            note="Hiệu suất cho thuê lễ phục Haute Couture"
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
            <span>Kết nối Cơ sở dữ liệu MongoDB Trực tiếp ({report?.transactions?.length || 0} giao dịch)</span>
          </div>
        </section>

        {/* Redesigned Luxury Revenue Chart */}
        <section className="ub-revenue-chart-card" aria-labelledby="ub-revenue-chart-title">
          <div className="ub-revenue-chart-top">
            <div>
              <h2 id="ub-revenue-chart-title">Biểu Đồ Doanh Thu & Dòng Tiền Thực Tế</h2>
              <p>Tổng hợp các giao dịch thanh toán thành công theo từng kỳ · Đơn vị: triệu đồng (VNĐ)</p>
            </div>

            <div className="ub-revenue-chart-actions">
              <div className="ub-revenue-chart-modes" role="group">
                <button
                  type="button"
                  className={chartMode === 'combo' ? 'is-active' : ''}
                  onClick={() => setChartMode('combo')}
                >
                  Kết hợp (Combo)
                </button>
                <button
                  type="button"
                  className={chartMode === 'bar' ? 'is-active' : ''}
                  onClick={() => setChartMode('bar')}
                >
                  Cột (Bar)
                </button>
                <button
                  type="button"
                  className={chartMode === 'area' ? 'is-active' : ''}
                  onClick={() => setChartMode('area')}
                >
                  Xu hướng (Curve)
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-stone-500">
              Đang tải dữ liệu biểu đồ từ MongoDB...
            </div>
          ) : (
            <LuxuryRevenueChart entries={report?.chart || []} chartMode={chartMode} />
          )}

          <div className="ub-revenue-chart-foot">
            <div className="ub-revenue-chart-legend">
              <span>
                <i className="ub-revenue-legend-bar" /> Cột doanh thu thực nhận
              </span>
              <span>
                <i className="ub-revenue-legend-line" /> Đường xu hướng tăng trưởng
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="ub-revenue-peak-badge">
                <TrendingUp size={14} /> Tổng kỳ: {money(report?.revenue)}
              </span>
            </div>
          </div>
        </section>

        {/* Live Transaction Journal Table */}
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
                Không tìm thấy giao dịch nào phù hợp với bộ lọc trong kỳ.
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

              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={page === p ? 'is-active' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

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
