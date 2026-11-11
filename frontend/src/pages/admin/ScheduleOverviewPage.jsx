import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Calendar,
  ConfigProvider,
  Modal,
  Tag,
  Tooltip,
  Empty,
  Spin,
  message,
} from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  CalendarDays,
  Sparkles,
  RotateCcw,
  Clock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
  ArrowRight,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Building2,
  Users,
  Mail,
  XCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  LayoutGrid,
  PhoneCall,
  CheckCheck,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  RefreshCw,
  PackageCheck,
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
  SHOWROOM_BRANCHES,
  APPOINTMENT_EVENT,
} from '../../services/appointmentService';
import { getAllOrdersAdmin } from '../../services/orderService';
import { formatCurrencyVND } from '../../utils/formatCurrency';

// Thiết lập locale tiếng Việt cho Dayjs
dayjs.locale('vi');

// Trích xuất giờ bắt đầu chuẩn xác từ chuỗi "18:30 — 20:00" hoặc "18:30 - 20:00"
const extractStartTime = (timeSlot) => {
  if (!timeSlot) return '';
  const parts = String(timeSlot).split(/[\u2014\u2013-]/);
  return (parts[0] || '').trim();
};

// Trích xuất tên ngắn gọn hiển thị trên thẻ lịch (ví dụ: "Phạm Hương Ly" -> "Hương Ly")
const extractDisplayName = (fullName) => {
  if (!fullName) return 'Cô dâu';
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return parts.slice(-2).join(' ');
};

// Chuẩn hóa trạng thái lịch hẹn: chỉ có 'confirmed' và 'completed'
const normalizeAptStatus = (st) => {
  const s = (st || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'confirmed';
};



// Trợ giúp định dạng nhãn trạng thái chính xác theo nghiệp vụ database
const getEventBadge = (item) => {
  if (item.type === 'fitting') {
    const isCompleted = item.status === 'completed';
    const isCancelled = item.status === 'cancelled';
    return {
      label: isCompleted ? 'ĐÃ HOÀN TẤT' : isCancelled ? 'ĐÃ HỦY' : 'ĐÃ XÁC NHẬN',
      className: isCompleted
        ? 'bg-purple-100 text-purple-800 border-purple-300'
        : isCancelled
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
  const st = (item.status || '').toLowerCase();
  switch (st) {
    case 'deposit_paid':
      return { label: 'ĐÃ CỌC (CHỜ GIAO)', className: 'bg-sky-100 text-sky-800 border-sky-300' };
    case 'preparing':
      return { label: 'ĐANG CHUẨN BỊ', className: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'delivered':
      return { label: 'ĐÃ BÀN GIAO', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    case 'renting':
      return { label: 'ĐANG THUÊ', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'returned':
      return { label: 'ĐÃ TRẢ (CHỜ KIỂM ĐỊNH)', className: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'completed':
      return { label: 'HOÀN TẤT ĐƠN', className: 'bg-purple-100 text-purple-800 border-purple-300' };
    case 'cancelled':
      return { label: 'ĐÃ HỦY', className: 'bg-gray-100 text-gray-700 border-gray-300' };
    default:
      return { label: (st || 'ĐANG XỬ LÝ').toUpperCase(), className: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
};

export default function ScheduleOverviewPage({ defaultTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tự động nhận diện phân hệ đang truy cập: Admin vs Staff để điều hướng đúng màn hình
  const isStaffContext =
    location.pathname.startsWith('/staff') ||
    (user?.role === 'staff' && !location.pathname.startsWith('/admin'));
  const orderBasePath = isStaffContext ? '/staff/don-thue' : '/admin/don-thue';

  // Tab chính: 'calendar' (Lịch Biểu Showroom) | 'appointments' (Danh Sách & Phê Duyệt Lịch Hẹn) | 'returns' (Lịch Hạn Trả Đồ)
  const activeMainTab = searchParams.get('tab') || defaultTab || 'calendar';
  const handleTabChange = (tabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabKey);
      return next;
    });
  };

  // Sub-filter trong Tab Lịch Biểu: 'all' | 'fitting' (Thử váy) | 'delivery' (Giao váy) | 'return' (Trả váy)
  const [calendarFilterType, setCalendarFilterType] = useState('all');
  const [calendarBranchFilter, setCalendarBranchFilter] = useState('all');

  // Bộ lọc cho Tab Danh Sách Lịch Hẹn (Merged từ AppointmentManagement)
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dữ liệu
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Lấy dữ liệu cả Lịch Hẹn Thử Váy và Đơn Thuê
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resApt, resOrd] = await Promise.all([
        getAppointmentsApi({ limit: 1000 }).catch(() => ({ data: [] })),
        getAllOrdersAdmin({ limit: 1000 }).catch(() => ({ orders: [] })),
      ]);

      const aptList = Array.isArray(resApt?.data)
        ? resApt.data
        : resApt?.data?.data || [];
      setAppointments(aptList);

      const ordList = Array.isArray(resOrd?.orders)
        ? resOrd.orders
        : Array.isArray(resOrd?.data)
        ? resOrd.data
        : Array.isArray(resOrd)
        ? resOrd
        : [];
      setOrders(ordList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu lịch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener(APPOINTMENT_EVENT, fetchData);
    return () => window.removeEventListener(APPOINTMENT_EVENT, fetchData);
  }, [fetchData]);

  // Cập nhật trạng thái lịch hẹn (Xác nhận, Hoàn tất, Hủy)
  const handleUpdateAppointmentStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatusApi(id, newStatus);
      const statusText =
        newStatus === 'confirmed'
          ? 'Đã xác nhận'
          : newStatus === 'completed'
          ? 'Đã hoàn tất ca thử'
          : 'Đã hủy lịch';
      message.success(`Cập nhật thành công: "${statusText}"`);

      // Cập nhật local state ngay lập tức để giao diện phản hồi mượt mà
      setAppointments((prev) =>
        prev.map((a) => {
          if ((a._id || a.id) === id) {
            return { ...a, status: newStatus };
          }
          return a;
        })
      );

      // Nếu đang xem modal chi tiết, cập nhật luôn modal
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      message.error('Không thể cập nhật trạng thái. Vui lòng thử lại!');
    } finally {
      setUpdatingId(null);
    }
  };

  // Chuẩn hóa định dạng YYYY-MM-DD
  const toDateKey = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = toDateKey(new Date());
  const selectedDateKey = toDateKey(selectedDate);

  // Danh sách sự kiện thử váy map theo ngày
  const appointmentsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((apt) => {
      const key = toDateKey(apt.appointmentDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({
        type: 'fitting',
        id: apt._id || apt.id,
        code: apt.appointmentCode || 'APT',
        customerName: apt.customerName || apt.fullName || 'Cô dâu',
        phone: apt.customerPhone || apt.phone,
        email: apt.customerEmail || apt.email,
        timeSlot: apt.timeSlot || '09:00 — 11:00',
        guestsCount: apt.guestsCount || 2,
        branch: apt.branch || apt.branchId || 'hcm-q1',
        status: normalizeAptStatus(apt.status),
        notes: apt.notes,
        interestedDresses: apt.interestedDresses || apt.selectedDresses || [],
        weddingDate: apt.weddingDate,
        date: key,
      });
    });
    return map;
  }, [appointments]);

  // Danh sách sự kiện bàn giao / nhận váy theo ngày bắt đầu thuê (rentalStartDate)
  const deliveriesByDate = useMemo(() => {
    const map = {};
    orders.forEach((ord) => {
      const key = toDateKey(ord.rentalStartDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({
        type: 'delivery',
        id: ord._id || ord.id,
        code: ord.orderCode || ord.contractCode || 'UB-ORD',
        customerName: ord.customerName || ord.brideName || 'Cô dâu',
        phone: ord.customerPhone || ord.phone,
        status: (ord.status || 'deposit_paid').toLowerCase(),
        items: ord.items || [],
        totalDeposit: ord.totalDeposit || 0,
        totalRentPrice: ord.totalRentPrice || 0,
        rentalStartDate: ord.rentalStartDate,
        rentalEndDate: ord.rentalEndDate,
        deliveryMethod: ord.deliveryMethod || 'showroom',
        shippingAddress: ord.shippingAddress,
        notes: ord.notes,
        date: key,
      });
    });
    return map;
  }, [orders]);

  // Danh sách sự kiện trả váy map theo ngày hạn trả (rentalEndDate)
  const returnsByDate = useMemo(() => {
    const map = {};
    orders.forEach((ord) => {
      const key = toDateKey(ord.rentalEndDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({
        type: 'return',
        id: ord._id || ord.id,
        code: ord.orderCode || ord.contractCode || 'UB-ORD',
        customerName: ord.customerName || ord.brideName || 'Cô dâu',
        phone: ord.customerPhone || ord.phone,
        status: (ord.status || 'renting').toLowerCase(),
        items: ord.items || [],
        totalDeposit: ord.totalDeposit || 0,
        totalRentPrice: ord.totalRentPrice || 0,
        rentalStartDate: ord.rentalStartDate,
        rentalEndDate: ord.rentalEndDate,
        actualReturnDate: ord.actualReturnDate,
        inspection: ord.inspection,
        deliveryMethod: ord.deliveryMethod || 'showroom',
        shippingAddress: ord.shippingAddress,
        notes: ord.notes,
        date: key,
      });
    });
    return map;
  }, [orders]);

  // Thống kê nhanh toàn diện từ MongoDB
  const stats = useMemo(() => {
    const todayFittings = (appointmentsByDate[todayKey] || []).length;
    const todayDeliveries = (deliveriesByDate[todayKey] || []).length;
    const todayReturns = (returnsByDate[todayKey] || []).length;
    const pendingAppointments = appointments.filter(
      (a) => (a.status || 'pending').toLowerCase() === 'pending'
    ).length;
    const confirmedAppointments = appointments.filter(
      (a) => (a.status || '').toLowerCase() === 'confirmed'
    ).length;
    const completedAppointments = appointments.filter(
      (a) => (a.status || '').toLowerCase() === 'completed'
    ).length;
    const activeRentals = orders.filter((o) =>
      ['renting', 'delivered', 'preparing', 'deposit_paid'].includes((o.status || '').toLowerCase())
    ).length;
    const totalReturns = orders.filter((o) =>
      ['renting', 'delivered', 'returned'].includes((o.status || '').toLowerCase())
    ).length;

    return {
      todayFittings,
      todayDeliveries,
      todayReturns,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalAppointments: appointments.length,
      totalOrders: orders.length,
      activeRentals,
      totalReturns,
    };
  }, [appointmentsByDate, deliveriesByDate, returnsByDate, todayKey, appointments, orders]);

  // Lọc danh sách lịch hẹn cho Tab Quản Lý Lịch Hẹn
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const name = (apt.customerName || apt.fullName || '').toLowerCase();
      const phone = apt.customerPhone || apt.phone || '';
      const code = (apt.appointmentCode || apt._id || apt.id || '').toLowerCase();
      const search = searchTerm.trim().toLowerCase();

      const matchSearch =
        !search || name.includes(search) || phone.includes(search) || code.includes(search);
      const matchBranch =
        branchFilter === 'all' || apt.branch === branchFilter || apt.branchId === branchFilter;
      const currentStatus = (apt.status || 'pending').toLowerCase();
      const matchStatus = statusFilter === 'all' || currentStatus === statusFilter.toLowerCase();

      return matchSearch && matchBranch && matchStatus;
    });
  }, [appointments, searchTerm, branchFilter, statusFilter]);

  // Sự kiện của ngày được chọn trên lịch (Kết hợp đủ 3 nguồn từ database)
  const currentDayEvents = useMemo(() => {
    const apts = appointmentsByDate[selectedDateKey] || [];
    const deliveries = deliveriesByDate[selectedDateKey] || [];
    const returns = returnsByDate[selectedDateKey] || [];

    const filteredApts =
      calendarBranchFilter === 'all'
        ? apts
        : apts.filter((a) => a.branch === calendarBranchFilter);

    if (calendarFilterType === 'fitting') return filteredApts;
    if (calendarFilterType === 'delivery') return deliveries;
    if (calendarFilterType === 'return') return returns;

    return [...filteredApts, ...deliveries, ...returns];
  }, [
    appointmentsByDate,
    deliveriesByDate,
    returnsByDate,
    selectedDateKey,
    calendarFilterType,
    calendarBranchFilter,
  ]);

  // Render nội dung từng ô ngày trên lịch Ant Design (Đầy đủ cả 3 nguồn sự kiện từ database)
  const dateCellRender = (dateObj) => {
    const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    const key = toDateKey(d);

    const dayApts = appointmentsByDate[key] || [];
    const dayDeliveries = deliveriesByDate[key] || [];
    const dayReturns = returnsByDate[key] || [];

    const showApts = calendarFilterType === 'all' || calendarFilterType === 'fitting';
    const showDeliveries = calendarFilterType === 'all' || calendarFilterType === 'delivery';
    const showReturns = calendarFilterType === 'all' || calendarFilterType === 'return';

    const visibleApts =
      calendarBranchFilter === 'all'
        ? dayApts
        : dayApts.filter((a) => a.branch === calendarBranchFilter);

    const totalEvents =
      (showApts ? visibleApts.length : 0) +
      (showDeliveries ? dayDeliveries.length : 0) +
      (showReturns ? dayReturns.length : 0);
    if (totalEvents === 0) return null;

    return (
      <div className="space-y-1 mt-1 overflow-hidden px-0.5">
        {/* Lịch Thử Váy */}
        {showApts &&
          visibleApts.slice(0, 1).map((item) => {
            const startTime = extractStartTime(item.timeSlot);
            const displayName = extractDisplayName(item.customerName);
            const isConfirmed = item.status === 'confirmed';
            const isCompleted = item.status === 'completed';

            const badgeBg = isCompleted
              ? 'bg-purple-50/90 text-purple-900 border-purple-300'
              : isConfirmed
              ? 'bg-emerald-50/90 text-emerald-900 border-emerald-300'
              : 'bg-amber-50/90 text-amber-900 border-amber-300';

            const dotBg = isCompleted
              ? 'bg-purple-500'
              : isConfirmed
              ? 'bg-emerald-500'
              : 'bg-amber-500';

            return (
              <Tooltip key={item.id} title={`👗 Thử váy: ${item.customerName} (${item.timeSlot})`}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(item);
                    setDetailModalOpen(true);
                  }}
                  className={`group flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ${badgeBg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />
                  <span className="font-mono text-[10px] font-bold text-gray-900 shrink-0">
                    {startTime}
                  </span>
                  <span className="text-gray-400 text-[9px]">•</span>
                  <span className="truncate text-[10.5px] font-semibold text-gray-800">
                    {displayName}
                  </span>
                </div>
              </Tooltip>
            );
          })}

        {/* Lịch Giao / Nhận Váy (Đơn Thuê Bắt Đầu) */}
        {showDeliveries &&
          dayDeliveries.slice(0, 1).map((item) => {
            const displayName = extractDisplayName(item.customerName);
            return (
              <Tooltip key={`del-${item.id}`} title={`📦 Giao váy: ${item.code} - ${item.customerName}`}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(item);
                    setDetailModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border shadow-2xs transition-all hover:scale-[1.02] cursor-pointer bg-sky-50/90 text-sky-900 border-sky-300 hover:bg-sky-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-sky-600" />
                  <span className="font-mono text-[9.5px] font-bold text-sky-950 shrink-0 uppercase">
                    GIAO
                  </span>
                  <span className="text-gray-400 text-[9px]">•</span>
                  <span className="truncate text-[10.5px] font-semibold text-gray-800">
                    {displayName}
                  </span>
                </div>
              </Tooltip>
            );
          })}

        {/* Lịch Trả Váy (Đơn Thuê Kết Thúc) */}
        {showReturns &&
          dayReturns.slice(0, 1).map((item) => {
            const isDone = item.status === 'completed' || item.status === 'returned';
            const displayName = extractDisplayName(item.customerName);

            return (
              <Tooltip key={`ret-${item.id}`} title={`🔄 Hạn trả váy: ${item.code} - ${item.customerName}`}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(item);
                    setDetailModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/90 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50/90 text-rose-800 border-rose-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isDone ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-mono text-[9.5px] font-bold text-rose-950 shrink-0 uppercase">
                    TRẢ
                  </span>
                  <span className="text-gray-400 text-[9px]">•</span>
                  <span className="truncate text-[10.5px] font-semibold text-gray-800">
                    {displayName}
                  </span>
                </div>
              </Tooltip>
            );
          })}
      </div>
    );
  };

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#733F49',
          borderRadius: 14,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      }}
    >
      {/* Scope CSS tùy biến giao diện Lịch theo chuẩn Haute Couture UniBridal */}
      <style>{`
        .unibridal-luxury-calendar .ant-picker-content th {
          color: #733F49 !important;
          font-weight: 700 !important;
          font-size: 11.5px !important;
          letter-spacing: 0.5px !important;
          padding-bottom: 10px !important;
          border-bottom: 1px solid #F4EBE8 !important;
        }
        .unibridal-luxury-calendar .ant-picker-calendar-date {
          border: 1px solid #F1E5E2 !important;
          border-radius: 14px !important;
          margin: 3px !important;
          min-height: 108px !important;
          background: #FFFFFF !important;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.015) !important;
        }
        .unibridal-luxury-calendar .ant-picker-calendar-date:hover {
          border-color: #BA7A83 !important;
          background: #FFFDFD !important;
          box-shadow: 0 4px 16px rgba(115, 63, 73, 0.08) !important;
        }
        /* Ô ĐƯỢC CHỌN (SELECTED CELL): KHÔNG BỊ XÁM ĐEN MÙ MỊT NỮA */
        .unibridal-luxury-calendar .ant-picker-cell-selected .ant-picker-calendar-date {
          background: #FFF5F2 !important;
          border: 2px solid #733F49 !important;
          box-shadow: 0 6px 20px rgba(115, 63, 73, 0.16) !important;
        }
        .unibridal-luxury-calendar .ant-picker-cell-selected .ant-picker-calendar-date-value {
          color: #733F49 !important;
          font-weight: 800 !important;
          font-size: 15px !important;
        }
        /* Ô HÔM NAY (TODAY) */
        .unibridal-luxury-calendar .ant-picker-calendar-date-today {
          border-color: #D4AF37 !important;
          background: #FFFEFB !important;
        }
        .unibridal-luxury-calendar .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
          color: #B45309 !important;
          font-weight: 800 !important;
        }
        /* Ô THÁNG KHÁC (DISABLED/OUT OF MONTH) */
        .unibridal-luxury-calendar .ant-picker-cell-disabled .ant-picker-calendar-date {
          background: #FAFAFA !important;
          opacity: 0.4 !important;
          border-color: #F3F3F3 !important;
        }
      `}</style>

      <AdminLayout activeMenu="lich-tong-quan" role={isStaffContext ? 'staff' : 'admin'}>
        <div className="space-y-5">
          {/* Header & Thanh Tiêu Đề */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-playfair text-[32px] sm:text-[38px] font-normal text-[#5F2B36] tracking-tight leading-tight mb-2">
                Lịch Tổng Quan
              </h1>
              <p className="text-[14px] text-[#7A6B6C] font-normal max-w-3xl leading-relaxed">
                Quản lý lịch hẹn thử váy Private Suite 1:1 và điều phối ngày bàn giao / hạn hoàn trả lễ phục cưới UniBridal.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-[#5F2B36] hover:bg-[#FAF0EC] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới dữ liệu</span>
              </button>
            </div>
          </div>

          {/* 3 TAB CHÍNH HỢP NHẤT: LỊCH BIỂU SHOWROOM | QUẢN LÝ LỊCH HẸN | HẠN TRẢ ĐỒ */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#EFE5E1] shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tab 1: Lịch Biểu Showroom (Calendar) */}
              <button
                type="button"
                onClick={() => handleTabChange('calendar')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'calendar'
                    ? 'bg-[#733F49] text-white shadow-md shadow-[#733F49]/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Lịch Biểu Showroom</span>
              </button>

              {/* Tab 2: Quản Lý Lịch Hẹn (Merged từ AppointmentManagement) */}
              <button
                type="button"
                onClick={() => handleTabChange('appointments')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'appointments'
                    ? 'bg-[#733F49] text-white shadow-md shadow-[#733F49]/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Danh Sách Lịch Hẹn</span>
                
              </button>

              
            </div>

            {/* Quick Stats Pill & Sync MongoDB */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF0EC] hover:bg-[#F2D8D4] text-[#733F49] rounded-xl border border-[#F2D8D4] font-bold transition cursor-pointer shadow-2xs"
                title="Đồng bộ dữ liệu thời gian thực từ MongoDB"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Đồng bộ Database</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-900 rounded-lg border border-purple-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                <span>Hôm nay: <strong>{stats.todayFittings} ca thử</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-900 rounded-lg border border-sky-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span>Hôm nay: <strong>{stats.todayDeliveries} đơn giao</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-900 rounded-lg border border-rose-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Hôm nay: <strong>{stats.todayReturns} đơn trả</strong></span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* NỘI DUNG TAB 1: LỊCH BIỂU SHOWROOM (LỊCH THÁNG + CHI TIẾT NGÀY) */}
          {/* ========================================================= */}
          {activeMainTab === 'calendar' && (
            <div className="space-y-6">
              {/* Thanh lọc phụ cho Lịch Biểu - Thiết kế sang trọng */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EFE5E1] shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#733F49] uppercase tracking-wider text-[11px] flex items-center gap-1.5 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Lọc hiển thị:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType('all')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      calendarFilterType === 'all'
                        ? 'bg-[#733F49] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    Tất cả sự kiện ({appointments.length + orders.length * 2})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType('fitting')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      calendarFilterType === 'fitting'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lịch thử váy ({appointments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType('delivery')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      calendarFilterType === 'delivery'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Lịch giao váy ({orders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilterType('return')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      calendarFilterType === 'return'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hạn trả váy ({orders.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#733F49]" />
                    <span>Chi nhánh:</span>
                  </span>
                  <select
                    value={calendarBranchFilter}
                    onChange={(e) => setCalendarBranchFilter(e.target.value)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-bold outline-none cursor-pointer text-xs focus:border-[#733F49]"
                  >
                    <option value="all">Toàn bộ 2 Showroom</option>
                    <option value="hcm-q1">UniBridal Q.1 TP.HCM</option>
                    <option value="hn-hoankiem">UniBridal Hoàn Kiếm, HN</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Cột: Lịch Tháng (Trái) & Bảng Chi Tiết Ngày VIP Concierge (Phải) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Lịch tháng Ant Design với Custom Styling & Header */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-xs border border-[#EFE5E1]">
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Spin tip="Đang tải dữ liệu lịch showroom..." />
                    </div>
                  ) : (
                    <Calendar
                      className="unibridal-luxury-calendar"
                      fullCellRender={(date, info) => {
                        if (info?.type === 'month') return info.originNode;

                        const d = date?.toDate ? date.toDate() : new Date(date);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const dateLabel = `${day}/${month}`;
                        const isToday = toDateKey(d) === todayKey;

                        return (
                          <div
                            className={`ant-picker-cell-inner ant-picker-calendar-date ${
                              isToday ? 'ant-picker-calendar-date-today' : ''
                            }`}
                          >
                            <div className="ant-picker-calendar-date-value font-mono">
                              {dateLabel}
                            </div>
                            <div className="ant-picker-calendar-date-content">
                              {dateCellRender(date)}
                            </div>
                          </div>
                        );
                      }}
                      headerRender={({ value, onChange }) => {
                        const current = value || dayjs();
                        const monthLabel = current.format('MMMM, YYYY');
                        const capitalized =
                          monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

                        return (
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] border border-[#F2D8D4] flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-[#733F49]" />
                              </div>
                              <h2 className="text-lg font-bold text-gray-900 m-0 font-playfair tracking-wide">
                                {capitalized}
                              </h2>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onChange(current.subtract(1, 'month'))}
                                className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                                title="Tháng trước"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onChange(dayjs())}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-[#733F49]/30 text-[#733F49] bg-[#FAF0EC] hover:bg-[#F2D8D4] transition cursor-pointer shadow-2xs"
                              >
                                Hôm nay
                              </button>
                              <button
                                type="button"
                                onClick={() => onChange(current.add(1, 'month'))}
                                className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                                title="Tháng sau"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      }}
                      onSelect={(date) => {
                        const d = date.toDate ? date.toDate() : new Date(date);
                        setSelectedDate(d);
                      }}
                    />
                  )}
                </div>

                {/* Cột Phải: Bảng Chi Tiết Ngày VIP Concierge Docket */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#EFE5E1] flex flex-col h-fit">
                  <div className="border-b border-[#F2E5E0] pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-[#733F49] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Chi tiết ngày được chọn</span>
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {currentDayEvents.length} lượt hẹn
                      </span>
                    </div>

                    <div className="text-lg font-bold text-gray-900 mt-1 capitalize font-playfair">
                      {selectedDate.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                    {currentDayEvents.length === 0 ? (
                      <div className="py-14 text-center text-gray-400 text-xs">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có ca hẹn thử hoặc đơn trả nào trong ngày này"
                        />
                      </div>
                    ) : (
                      currentDayEvents.map((item) => {
                        const isFitting = item.type === 'fitting';
                        const isDelivery = item.type === 'delivery';
                        const isReturn = item.type === 'return';
                        const isPending = item.status === 'pending';
                        const isConfirmed = item.status === 'confirmed';
                        const isCompleted = item.status === 'completed';
                        const badge = getEventBadge(item);

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all shadow-xs ${
                              isFitting
                                ? isPending
                                  ? 'border-amber-300 bg-amber-50/30'
                                  : isConfirmed
                                  ? 'border-emerald-300 bg-emerald-50/30'
                                  : 'border-purple-300 bg-purple-50/20'
                                : isDelivery
                                ? 'border-sky-300 bg-sky-50/30'
                                : 'border-rose-300 bg-rose-50/30'
                            }`}
                          >
                            {/* Dòng 1: Header sự kiện & Trạng thái */}
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                {isFitting ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-[#733F49]" />
                                    <span className="font-mono text-sm">{item.timeSlot}</span>
                                  </>
                                ) : isDelivery ? (
                                  <>
                                    <PackageCheck className="w-3.5 h-3.5 text-sky-700" />
                                    <span className="font-mono font-bold text-sky-900">
                                      GIAO VÁY: {item.code}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                                    <span className="font-mono font-bold text-rose-900">
                                      HẠN TRẢ: {item.code}
                                    </span>
                                  </>
                                )}
                              </span>
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>

                            {/* Tên khách hàng */}
                            <div className="font-bold text-gray-900 text-base font-playfair tracking-tight">
                              {item.customerName}
                            </div>

                            {/* Điện thoại liên hệ */}
                            {item.phone && (
                              <div className="flex items-center gap-2 mt-2">
                                <a
                                  href={`tel:${item.phone}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#EFE5E1] text-[#733F49] text-xs font-bold hover:bg-[#FAF0EC] transition shadow-2xs"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#733F49]" />
                                  <span>{item.phone}</span>
                                </a>
                              </div>
                            )}

                            {/* Chi nhánh Showroom / Phương thức giao */}
                            {isFitting ? (
                              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-2 font-medium">
                                <Building2 size={12} className="text-[#BA7A83]" />
                                <span>
                                  {item.branch === 'hn-hoankiem'
                                    ? 'Showroom Hoàn Kiếm, Hà Nội'
                                    : 'Flagship Showroom Q.1, TP. HCM'}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-600 flex items-center gap-1.5 mt-2 font-medium">
                                <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700">
                                  {item.deliveryMethod === 'express' ? '🚚 Giao tận nơi' : '🏛️ Nhận tại Showroom'}
                                </span>
                                <span className="font-bold text-[#733F49]">
                                  {formatCurrencyVND(item.totalRentPrice || 0)}
                                </span>
                              </div>
                            )}

                            {/* Lễ phục quan tâm / Lễ phục thuê */}
                            {isFitting && item.interestedDresses?.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-white/80 border border-[#F2D8D4] text-xs text-[#733F49] font-medium mt-2.5 space-y-1">
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                  👗 Lễ phục đã đăng ký thử:
                                </div>
                                <div className="space-y-0.5">
                                  {item.interestedDresses.map((d, i) => (
                                    <div key={i} className="font-semibold text-gray-800">
                                      • {d.name || d}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!isFitting && item.items?.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-white/80 border border-[#EFE5E1] text-xs font-medium mt-2.5 space-y-1">
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                  {isDelivery ? '📦 Lễ phục bàn giao:' : '🔄 Lễ phục thu hồi:'}
                                </div>
                                <div className="space-y-0.5">
                                  {item.items.map((it, idx) => (
                                    <div key={idx} className="font-semibold text-gray-800">
                                      • {it.name} (Size: {it.size || 'M'})
                                    </div>
                                  ))}
                                </div>
                                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                                  <span>Cọc bảo lãnh:</span>
                                  <strong className="text-gray-900">{formatCurrencyVND(item.totalDeposit || 0)}</strong>
                                </div>
                              </div>
                            )}

                            {/* Ghi chú */}
                            {item.notes && (
                              <div className="p-2.5 bg-white/70 rounded-xl text-xs text-gray-600 border border-gray-200/80 italic mt-2.5 leading-relaxed">
                                &ldquo;{item.notes}&rdquo;
                              </div>
                            )}

                            {/* CÁC NÚT THAO TÁC TRỰC TIẾP DÀNH CHO STAFF */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200/70 mt-3">
                              {isFitting && item.status === 'confirmed' && (
                                (item.date || toDateKey(item.appointmentDate)) <= todayKey ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={updatingId === item.id}
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(item.id, 'completed')
                                      }
                                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Hoàn Tất</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={updatingId === item.id}
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(item.id, 'cancelled')
                                      }
                                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                                      title="Khách bận hoặc không đến: Đánh dấu đã hủy"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Đã Hủy</span>
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex-1 py-1.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs font-semibold flex items-center justify-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Chờ đến ngày hẹn</span>
                                  </div>
                                )
                              )}

                              {isDelivery && (
                                <div className="flex-1 flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetCode = item.code || item.id || '';
                                      navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}&action=inspect`);
                                    }}
                                    className="flex-1 py-2 px-2.5 rounded-xl bg-[#FAF0EC] hover:bg-[#F2D8D4] text-[#733F49] text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer border border-[#F2D8D4]"
                                    title="Mở quy trình kiểm định đối soát váy"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Kiểm Định</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetCode = item.code || item.id || '';
                                      navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}`);
                                    }}
                                    className="flex-1 py-2 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                                    title="Xem chi tiết đơn thuê và bàn giao"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5" />
                                    <span>Đơn Thuê</span>
                                  </button>
                                </div>
                              )}

                              {isReturn && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetCode = item.code || item.id || '';
                                    navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}&action=inspect`);
                                  }}
                                  className="flex-1 py-2 px-3 rounded-xl bg-[#FAF0EC] hover:bg-[#F2D8D4] text-[#733F49] text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer border border-[#F2D8D4]"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Kiểm Định Cọc</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEvent(item);
                                  setDetailModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium transition cursor-pointer"
                                title="Xem chi tiết đầy đủ"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* NỘI DUNG TAB 2: QUẢN LÝ & PHÊ DUYỆT LỊCH HẸN (DANH SÁCH CHI TIẾT) */}
          {/* ========================================================= */}
          {activeMainTab === 'appointments' && (
            <div className="space-y-6">
              

                {/* Thanh Tìm Kiếm & Bộ Lọc Nâng Cao */}
              <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[260px] max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo mã lịch, tên cô dâu, số điện thoại..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#733F49] focus:bg-white transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Lọc chi nhánh */}
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả chi nhánh showroom (2 cơ sở)</option>
                    <option value="hcm-q1">UniBridal Q.1 TP.HCM</option>
                    <option value="hn-hoankiem">UniBridal Hoàn Kiếm, HN</option>
                  </select>

                  {/* Lọc trạng thái */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="confirmed">Đã xác nhận (Confirmed)</option>
                    <option value="completed">Đã hoàn tất (Completed)</option>
                    <option value="cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
              </div>

              {/* Bảng Dữ Liệu Lịch Hẹn */}
              <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#FFF8F6] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                        <th className="py-4 px-5">MÃ & KHÁCH HÀNG</th>
                        <th className="py-4 px-4">SHOWROOM & KHUNG GIỜ</th>
                        <th className="py-4 px-4">LỄ PHỤC QUAN TÂM</th>
                        <th className="py-4 px-5 text-right">THAO TÁC / TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-14 text-center text-gray-400 text-xs">
                            Không tìm thấy lịch hẹn thử váy nào phù hợp với bộ lọc hiện tại.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((apt) => {
                          const aptId = apt._id || apt.id || apt.appointmentCode;
                          const name = apt.customerName || apt.fullName || 'Cô dâu';
                          const phone = apt.customerPhone || apt.phone || '—';
                          const email = apt.customerEmail || apt.email || '';
                          const dateStr = apt.appointmentDate
                            ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN')
                            : apt.date || '—';
                          const aptDateKey = apt.date || toDateKey(apt.appointmentDate);
                          const isDue = aptDateKey <= todayKey;
                          const time = apt.timeSlot || '—';
                          const dresses = apt.interestedDresses || apt.selectedDresses || [];
                          const status = normalizeAptStatus(apt.status);
                          const branchLabel =
                            apt.branch === 'hn-hoankiem' ? 'Hoàn Kiếm, HN' : 'Q.1, TP. HCM';

                          return (
                            <tr key={aptId} className="hover:bg-gray-50/70 transition-colors">
                              {/* Cột 1: Mã & Khách hàng */}
                              <td className="py-4 px-5">
                                <div className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10.5px] font-bold mb-1">
                                  {apt.appointmentCode || aptId}
                                </div>
                                <div className="font-bold text-gray-900 text-sm">{name}</div>
                                <div className="text-gray-600 flex items-center gap-1.5 mt-0.5">
                                  <Phone size={12} className="text-[#733F49]" />
                                  <a
                                    href={`tel:${phone}`}
                                    className="hover:text-[#733F49] hover:underline"
                                  >
                                    {phone}
                                  </a>
                                </div>
                                {email && (
                                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Mail size={11} />
                                    <span>{email}</span>
                                  </div>
                                )}
                              </td>

                              {/* Cột 2: Showroom & Khung giờ */}
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-semibold mb-1">
                                  <Building2 size={11} className="text-[#733F49]" />
                                  <span>{branchLabel}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                  <CalendarIcon size={13} className="text-[#733F49]" />
                                  <span>{dateStr}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 mt-0.5 font-medium">
                                  <Clock size={12} className="text-gray-400" />
                                  <span>{time}</span>
                                </div>
                                {apt.guestsCount && (
                                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                    <Users size={11} />
                                    <span>{apt.guestsCount} khách đi cùng</span>
                                  </div>
                                )}
                              </td>

                              {/* Cột 3: Lễ phục quan tâm */}
                              <td className="py-4 px-4 max-w-[280px]">
                                {dresses.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {dresses.map((d, i) => (
                                      <span
                                        key={i}
                                        className="inline-block px-2 py-0.5 rounded-lg bg-[#FAF0EC] text-[#733F49] text-[11px] font-medium border border-[#F2D8D4]"
                                      >
                                        {d.name || d}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Tư vấn trực tiếp tại Showroom</span>
                                )}
                              </td>

                              {/* Cột Thao tác & Trạng thái */}
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end">
                                  {status === 'confirmed' ? (
                                    isDue ? (
                                      <div className="flex flex-col items-end gap-1.5">
                                        <button
                                          type="button"
                                          disabled={updatingId === aptId}
                                          onClick={() => handleUpdateAppointmentStatus(aptId, 'completed')}
                                          className="w-24 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                                          title="Khách đến thử đồ: Đánh dấu đã hoàn tất"
                                        >
                                          <CheckCircle2 size={13} />
                                          <span>Hoàn tất</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={updatingId === aptId}
                                          onClick={() => handleUpdateAppointmentStatus(aptId, 'cancelled')}
                                          className="w-24 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-2xs"
                                          title="Khách không đến hoặc có việc bận: Đánh dấu đã hủy"
                                        >
                                          <XCircle size={13} />
                                          <span>Đã hủy</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-end gap-1">
                                        <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          Đã xác nhận
                                        </span>
                                        <span className="text-[10px] text-gray-500 italic">
                                          Chờ đến ngày hẹn
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <span
                                      className={`inline-block px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase ${
                                        status === 'completed'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}
                                    >
                                      {status === 'completed' ? 'Đã hoàn tất' : 'Đã hủy'}
                                    </span>
                                  )}

                                  
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          

          {/* ========================================================= */}
          {/* MODAL XEM CHI TIẾT SỰ KIỆN + DUYỆT TRẠNG THÁI TRỰC TIẾP */}
          {/* ========================================================= */}
          <Modal
            open={detailModalOpen}
            onCancel={() => setDetailModalOpen(false)}
            footer={null}
            title={
              <div className="flex items-center gap-2 text-base font-bold text-gray-900 font-playfair">
                {selectedEvent?.type === 'fitting' ? (
                  <>
                    <Sparkles className="w-5 h-5 text-[#733F49]" />
                    <span>Chi Tiết Lịch Hẹn Thử Váy Private Suite</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5 text-rose-600" />
                    <span>Chi Tiết Đơn Thuê & Hạn Hoàn Trả Lễ Phục</span>
                  </>
                )}
              </div>
            }
          >
            {selectedEvent && (
              <div className="space-y-4 py-2 text-xs sm:text-sm">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Mã tham chiếu:</span>
                    <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {selectedEvent.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Khách hàng:</span>
                    <span className="font-bold text-gray-900">{selectedEvent.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Số điện thoại:</span>
                    <a
                      href={`tel:${selectedEvent.phone}`}
                      className="font-bold text-[#733F49] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {selectedEvent.phone || 'Chưa cập nhật'}
                    </a>
                  </div>
                  {selectedEvent.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Email:</span>
                      <span className="text-gray-700">{selectedEvent.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">
                      {selectedEvent.type === 'fitting' ? 'Khung giờ thử:' : 'Hạn hoàn trả:'}
                    </span>
                    <span className="font-bold text-[#733F49]">
                      {selectedEvent.type === 'fitting'
                        ? `${selectedEvent.timeSlot} (${selectedEvent.date})`
                        : `Ngày ${selectedEvent.date}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Trạng thái hiện tại:</span>
                    {(() => {
                        const badge = getEventBadge(selectedEvent);
                        return (
                          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                  </div>
                </div>

                {/* Ghi chú & Chi tiết váy */}
                {selectedEvent.type === 'fitting' && (
                  <div className="space-y-3">
                    {selectedEvent.interestedDresses?.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1.5">
                          Lễ phục cô dâu quan tâm:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEvent.interestedDresses.map((dress, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF0EC] text-[#733F49] text-xs font-semibold border border-[#F2D8D4]"
                            >
                              👗 {dress.name || dress}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-bold uppercase text-gray-500 mb-1">
                        Ghi chú từ cô dâu:
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-700 text-xs border border-gray-200 italic">
                        {selectedEvent.notes || 'Không có ghi chú thêm.'}
                      </div>
                    </div>

                    {/* Nút hành động phê duyệt trực tiếp trong Modal */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                      {selectedEvent.status === 'confirmed' && (
                        (selectedEvent.date || toDateKey(selectedEvent.appointmentDate)) <= todayKey ? (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === selectedEvent.id}
                              onClick={() => handleUpdateAppointmentStatus(selectedEvent.id, 'completed')}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Đánh Dấu Đã Thử Xong</span>
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === selectedEvent.id}
                              onClick={() => handleUpdateAppointmentStatus(selectedEvent.id, 'cancelled')}
                              className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Đánh Dấu Đã Hủy</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold text-center flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Lịch hẹn chưa đến ngày — Chỉ mở thao tác khi đến ngày hẹn</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.type === 'delivery' && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalOpen(false);
                        const targetCode = selectedEvent.code || selectedEvent.id || '';
                        navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}&action=inspect`);
                      }}
                      className="flex-1 py-2.5 px-3 bg-[#733F49] hover:bg-[#5a3239] text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Mở Quy Trình Kiểm Định &amp; Hoàn Cọc</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalOpen(false);
                        const targetCode = selectedEvent.code || selectedEvent.id || '';
                        navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}`);
                      }}
                      className="py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Quản Lý Đơn Thuê</span>
                    </button>
                  </div>
                )}

                {selectedEvent.type === 'return' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDetailModalOpen(false);
                        const targetCode = selectedEvent.code || selectedEvent.id || '';
                        navigate(`${orderBasePath}?orderCode=${encodeURIComponent(targetCode)}&action=inspect`);
                      }}
                      className="w-full py-2.5 px-4 bg-[#733F49] hover:bg-[#5a3239] text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Mở Quy Trình Kiểm Định &amp; Hoàn Cọc</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
}
