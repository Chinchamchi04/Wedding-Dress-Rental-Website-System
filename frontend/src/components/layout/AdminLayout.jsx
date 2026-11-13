import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard,
  Crown,
  CalendarCheck,
  CalendarDays,
  Package,
  Headphones,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
  Layers,
  FileSignature,
  Users,
  Tag,
  Bell,
  BellRing,
  Sparkles,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Clock,
  ArrowRight,
  ExternalLink } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import heroBride from '../../assets/hero_bride.jpg';
import adminAvatarImg from '../../assets/admin_avatar.jpg';
import { useAuth } from '../../contexts/AuthContext';
import { getAllOrdersAdmin } from '../../services/orderService';
import { getAppointmentsApi, getAppointments, APPOINTMENT_EVENT } from '../../services/appointmentService';
import { formatCurrencyVND } from '../../utils/formatCurrency';

const READ_NOTIFS_STORAGE_KEY = 'unibridal_read_notif_ids';

function timeAgo(dateInput) {
  if (!dateInput) return 'Vừa xong';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Gần đây';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export default function AdminLayout({
  children,
  activeMenu,
  role = 'admin',
  title,
  subtitle,
  controls,
  headerTitle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Notifications State for New Deposits & Appointments
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'deposit' | 'appointment'
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const notifRef = useRef(null);

  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem(READ_NOTIFS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markIdAsRead = (id) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [id, ...prev].slice(0, 100);
      try {
        localStorage.setItem(READ_NOTIFS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = liveNotifications.map((n) => n.id);
    setReadNotifIds((prev) => {
      const merged = Array.from(new Set([...allIds, ...prev])).slice(0, 100);
      try {
        localStorage.setItem(READ_NOTIFS_STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  // Tự động nhận diện menu đang active nếu không truyền chủ động
  const currentPath = location.pathname;
  const isStaff = role === 'staff' || user?.role === 'staff' || currentPath.startsWith('/staff');

  // Fetch Live Notifications from Orders & Appointments
  const fetchLiveNotifications = async () => {
    try {
      const notifs = [];

      // 1. Fetch Orders (Lọc các đơn mới cọc hoặc đang hoạt động)
      try {
        const ordersRes = await getAllOrdersAdmin({ limit: 15 });
        const orders = ordersRes?.orders || [];
        orders.forEach((o) => {
          const rawSt = (o.rawStatus || o.status || '').toLowerCase();
          const hasDeposit = (o.totalDeposit > 0 || o.depositAmount > 0) && rawSt !== 'cancelled';
          const isDepositPaid = rawSt === 'deposit_paid' || rawSt === 'active' || (hasDeposit && !['pending_payment', 'cancelled'].includes(rawSt));
          
          if (isDepositPaid) {
            notifs.push({
              id: `order-${o._id || o.orderCode || Math.random()}`,
              type: 'deposit',
              orderCode: o.orderCode,
              customerName: o.customerName || 'Khách Hàng',
              amount: o.totalDeposit || o.depositAmount || 0,
              time: o.createdAt || new Date(),
              url: `${isStaff ? '/staff' : '/admin'}/don-thue?search=${encodeURIComponent(o.orderCode || '')}`,
              badge: 'ĐÃ ĐẶT CỌC',
            });
          }
        });
      } catch (err) {
        console.warn('Orders notification fetch error:', err);
      }

      // 2. Fetch Appointments (Lịch hẹn thử váy mới)
      try {
        const aptsRes = await getAppointmentsApi({ limit: 15 });
        const apts = Array.isArray(aptsRes?.data) ? aptsRes.data : (Array.isArray(aptsRes) ? aptsRes : getAppointments());
        if (Array.isArray(apts)) {
          apts.forEach((a) => {
            const aptDateStr = a.appointmentDate || a.date;
            const timeSlotStr = a.timeSlot || '09:00 — 10:30';
            notifs.push({
              id: `apt-${a._id || a.id || a.appointmentCode || Math.random()}`,
              type: 'appointment',
              orderCode: a.appointmentCode || a.id || 'LỊCH HẸN',
              customerName: a.customerName || a.fullName || 'Cô Dâu / Chú Rể',
              timeSlot: timeSlotStr,
              date: aptDateStr,
              branchName: a.branchName || 'Showroom UniBridal',
              time: a.createdAt || a.appointmentDate || new Date(),
              url: `${isStaff ? '/staff' : '/admin'}/lich-tong-quan`,
              badge: 'LỊCH THỬ VÁY',
            });
          });
        }
      } catch (err) {
        console.warn('Appointments notification fetch error:', err);
      }

      // Sắp xếp thời gian mới nhất lên đầu
      notifs.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
      setLiveNotifications(notifs);
    } catch (err) {
      console.error('Error fetching live notifications:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const timer = setInterval(fetchLiveNotifications, 20000); // 20s polling
    const handleUpdate = () => fetchLiveNotifications();
    window.addEventListener(APPOINTMENT_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener(APPOINTMENT_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isStaff]);

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ticker Auto-rotation every 4.5s
  useEffect(() => {
    if (isTickerPaused || liveNotifications.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % liveNotifications.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isTickerPaused, liveNotifications.length]);

  const handleSelectNotification = (item) => {
    markIdAsRead(item.id);
    setNotifOpen(false);
    navigate(item.url);
  };

  const unreadCount = liveNotifications.filter((n) => !readNotifIds.includes(n.id)).length;
  const currentNotif = liveNotifications[currentTickerIdx % Math.max(liveNotifications.length, 1)];

  const filteredNotifs = liveNotifications.filter((n) => {
    if (notifFilter === 'deposit') return n.type === 'deposit';
    if (notifFilter === 'appointment') return n.type === 'appointment';
    return true;
  });

  const getActiveKey = () => {
    if (activeMenu) {
      const lower = activeMenu.toLowerCase();
      if (lower.includes('lịch tổng quan') || lower === 'lich-tong-quan' || lower === 'schedule' || lower.includes('lịch hẹn') || lower === 'appointments' || lower === 'lich-hen') return 'lich-tong-quan';
      if (lower.includes('tổng quan') || lower === 'dashboard') return 'dashboard';
      if (lower.includes('đơn thuê') || lower === 'don-thue') return 'don-thue';
      if (lower.includes('mẫu hợp đồng') || lower === 'contract-templates') return 'contract-templates';
      if (lower.includes('hợp đồng') || lower === 'contracts') return 'contracts';
      if (lower.includes('danh mục') || lower === 'categories' || lower === 'danh-muc') return 'categories';
      if (lower.includes('tài khoản') || lower.includes('account') || lower.includes('user')) return 'accounts';
      if (lower.includes('kho hàng') || lower.includes('sản phẩm') || lower === 'inventory' || lower === 'san-pham') return 'inventory';
      if (lower.includes('chăm sóc') || lower === 'customer-care') return 'customer-care';
      if (lower.includes('doanh thu') || lower === 'revenue') return 'revenue';
    }
    if (currentPath.includes('/lich-tong-quan') || currentPath.includes('/schedule') || currentPath.includes('/lich-hen') || currentPath.includes('/appointments')) return 'lich-tong-quan';
    if (currentPath.includes('/dashboard')) return 'dashboard';
    if (currentPath.includes('/reports') || currentPath.includes('/revenue')) return 'revenue';
    if (currentPath.includes('/accounts') || currentPath.includes('/users') || currentPath.includes('/tai-khoan')) return 'accounts';
    if (currentPath.includes('/don-thue') || currentPath.includes('/orders')) return 'don-thue';
    if (currentPath.includes('/kho-hang') || currentPath.includes('/inventory')) return 'inventory';
    if (currentPath.includes('/cham-soc-khach-hang') || currentPath.includes('/customer-care')) return 'customer-care';
    if (currentPath.includes('/hop-dong') || currentPath.includes('/contracts')) return 'contracts';
    if (currentPath.includes('/mau-hop-dong') || currentPath.includes('/contract-templates')) return 'contract-templates';
    if (currentPath.includes('/danh-muc') || currentPath.includes('/categories')) return 'categories';
    return 'dashboard';
  };

  const activeKey = getActiveKey();

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      to: isStaff ? '/staff/dashboard' : '/admin/dashboard'
    },
    {
      key: 'lich-tong-quan',
      label: 'Lịch Tổng Quan',
      icon: CalendarDays,
      to: isStaff ? '/staff/lich-tong-quan' : '/admin/lich-tong-quan'
    },
    {
      key: 'don-thue',
      label: 'Quản Lý Đơn Thuê',
      icon: CalendarCheck,
      to: isStaff ? '/staff/don-thue' : '/admin/don-thue'
    },
    {
      key: 'contracts',
      label: 'Quản Lý Hợp Đồng',
      icon: FileSignature,
      to: isStaff ? '/staff/hop-dong' : '/admin/hop-dong'
    },
    {
      key: 'inventory',
      label: 'Quản Lý Sản Phẩm',
      icon: Package,
      to: isStaff ? '/staff/kho-hang' : '/admin/kho-hang'
    },
    {
      key: 'customer-care',
      label: 'Chăm Sóc Khách Hàng',
      icon: Headphones,
      to: isStaff ? '/staff/cham-soc-khach-hang' : '/admin/cham-soc-khach-hang'
    },
    ...(!isStaff ? [
      {
        key: 'categories',
        label: 'Quản Lý Danh Mục',
        icon: Tag,
        to: '/admin/danh-muc'
      },
      {
        key: 'accounts',
        label: 'Quản Lý Tài Khoản',
        icon: Users,
        to: '/admin/accounts'
      },
      {
        key: 'revenue',
        label: 'Báo Cáo Doanh Thu',
        icon: BarChart3,
        to: '/admin/reports/revenue'
      }
    ] : [])
  ];

  const userName = user?.fullName || user?.name || (isStaff ? 'Chuyên Viên Atelier' : 'Quản Trị Viên UniBridal');
  const userAvatar = (!isStaff || user?.role === 'admin')
    ? adminAvatarImg
    : (user?.avatar || adminAvatarImg || heroBride);
  const userRoleText = isStaff ? 'STAFF MODE' : 'ADMIN MODE';

  const handleLogout = () => {
    navigate('/login', { replace: true });
    logout();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-jakarta text-[#2C2523] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FCF7F4] border-r border-[#EFE5E1] flex flex-col justify-between py-6 px-4 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Logo */}
          <div className="flex items-center justify-between px-2 mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#EFE5E0] flex items-center justify-center p-1 shrink-0 transition-transform group-hover:scale-105">
                <img
                  src={logoImg}
                  alt="UniBridal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[19px] font-bold tracking-normal text-[#BE807C] select-none leading-none">
                  UniBridal
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#A39192] mt-1 font-semibold">
                  Atelier Haute Couture
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#733F49] hover:bg-[#F3E7E3]"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Section Title */}
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#A39192]">
              MENU QUẢN TRỊ
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#F2E4DE] text-[#5F333B] font-bold shadow-xs'
                      : 'text-[#6D5D5E] hover:bg-[#F8EFEA] hover:text-[#5F333B]'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#733F49]' : 'text-[#8A797A]'}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Box */}
        <div className="mt-8 rounded-lg bg-[#F6ECE8] border border-[#EFE2DD] p-2.5 flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-[#5F333B] bg-transparent hover:bg-[#EDE0DA] transition-colors"
          >
            <Store size={16} className="text-[#733F49]" />
            <span>VỀ TRANG CHỦ</span>
          </Link>
          <div className="h-px bg-[#EADBCE] my-0.5" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-[#C93B3B] bg-transparent hover:bg-[#FADBD8] transition-colors w-full text-left cursor-pointer"
          >
            <LogOut size={16} />
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF5F2]">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#F0E6E2] flex items-center justify-between sticky top-0 z-30">
          {/* Left: Sidebar toggle + Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#733F49] hover:bg-[#F8EFEA]"
              aria-label="Mở menu điều hướng"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2.5">
              <Crown size={20} className="text-[#8A797A] shrink-0" />
              {(headerTitle || (activeMenu === 'customer-care' ? 'Chăm Sóc Khách Hàng' : null)) && (
                <span className="font-playfair text-[18px] sm:text-[21px] font-bold text-[#5F2B36] tracking-tight leading-none m-0 p-0 select-none hidden sm:inline">
                  {headerTitle || 'Chăm Sóc Khách Hàng'}
                </span>
              )}
            </div>
          </div>

          {/* Center: Live Notification Ticker Pill (Đơn mới cọc & Lịch thử váy mới) */}
          <div
            className="hidden md:flex items-center justify-center flex-1 max-w-xl lg:max-w-2xl mx-3"
            onMouseEnter={() => setIsTickerPaused(true)}
            onMouseLeave={() => setIsTickerPaused(false)}
          >
            {liveNotifications.length > 0 && currentNotif ? (
              <div className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-[#FFFBF9] via-[#FAF3F0] to-[#FFFBF9] border border-[#F2DFD8] hover:border-[#D6A498] rounded-full py-1.5 px-3.5 shadow-xs transition-all duration-300">
                <div
                  onClick={() => handleSelectNotification(currentNotif)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
                  title="Nhấn để xem chi tiết ngay"
                >
                  {currentNotif.type === 'deposit' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF6EE] text-[#1E8347] border border-[#CDEBCE] shrink-0 tracking-wider">
                      <CreditCard size={11} className="shrink-0" />
                      <span>ĐƠN CỌC MỚI</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECEE] text-[#BE4B5E] border border-[#F9CFD7] shrink-0 tracking-wider">
                      <CalendarCheck size={11} className="shrink-0" />
                      <span>LỊCH THỬ MỚI</span>
                    </span>
                  )}

                  <span className="text-[12.5px] font-medium text-[#4A3B32] truncate group-hover:text-[#733F49] transition-colors">
                    <strong className="font-bold text-[#2C2523]">{currentNotif.customerName}</strong>
                    {currentNotif.type === 'deposit' ? (
                      <> • Cọc <span className="font-bold text-[#1E8347]">{formatCurrencyVND(currentNotif.amount)}</span> • Đơn <span className="font-mono font-medium text-[#733F49]">#{currentNotif.orderCode}</span></>
                    ) : (
                      <> • {currentNotif.timeSlot} • {currentNotif.date ? new Date(currentNotif.date).toLocaleDateString('vi-VN') : ''}</>
                    )}
                  </span>

                  <span className="text-[11px] text-[#A89899] shrink-0 hidden lg:inline flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    {timeAgo(currentNotif.time)}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 pl-1.5 border-l border-[#EFE2DC]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTickerIdx((prev) => (prev - 1 + liveNotifications.length) % liveNotifications.length);
                    }}
                    className="p-1 rounded-full text-[#8A797A] hover:bg-white hover:text-[#5F2B36] transition-colors cursor-pointer"
                    title="Thông báo trước"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[10px] text-[#A89899] font-mono px-1">
                    {currentTickerIdx + 1}/{liveNotifications.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTickerIdx((prev) => (prev + 1) % liveNotifications.length);
                    }}
                    className="p-1 rounded-full text-[#8A797A] hover:bg-white hover:text-[#5F2B36] transition-colors cursor-pointer"
                    title="Thông báo kế tiếp"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#FAF5F2] border border-[#EFE5E0] text-[12px] text-[#8A797A]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Hệ thống trực tuyến • Sẵn sàng đón nhận đơn mới &amp; lịch thử váy</span>
              </div>
            )}
          </div>

          {/* Right Section: Bell Notification + User Profile Widget */}
          <div className="flex items-center">
            {/* Bell Notification Button & Popover */}
            <div className="relative mr-2 sm:mr-4" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                  notifOpen ? 'bg-[#F5E6E1] text-[#733F49]' : 'text-[#733F49] hover:bg-[#F8EFEA]'
                }`}
                aria-label="Thông báo hệ thống"
                title="Thông báo đơn cọc & lịch thử mới"
              >
                {unreadCount > 0 ? (
                  <BellRing size={20} className="text-[#8D3B4C] animate-pulse" />
                ) : (
                  <Bell size={20} className="text-[#8A797A]" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-[#C93B3B] to-[#9E2A2B] rounded-full ring-2 ring-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-[#EFE2DC] z-50 overflow-hidden text-left">
                  {/* Top Bar of Popover */}
                  <div className="px-4 py-3 bg-[#FAF5F2] border-b border-[#EFE2DC] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#BE807C]" />
                      <span className="font-playfair text-[15px] font-bold text-[#5F2B36]">
                        Thông Báo Trực Tuyến
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C93B3B] text-white">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-[#733F49] hover:text-[#5F2B36] flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <CheckCheck size={13} />
                        Đã đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-[#F0E6E2] bg-white px-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setNotifFilter('all')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                        notifFilter === 'all'
                          ? 'border-b-2 border-[#733F49] text-[#733F49] bg-[#FAF5F2]'
                          : 'text-[#8A797A] hover:text-[#5F2B36]'
                      }`}
                    >
                      Tất cả ({liveNotifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter('deposit')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                        notifFilter === 'deposit'
                          ? 'border-b-2 border-[#1E8347] text-[#1E8347] bg-[#FAF5F2]'
                          : 'text-[#8A797A] hover:text-[#1E8347]'
                      }`}
                    >
                      Đơn mới cọc ({liveNotifications.filter((n) => n.type === 'deposit').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter('appointment')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                        notifFilter === 'appointment'
                          ? 'border-b-2 border-[#BE4B5E] text-[#BE4B5E] bg-[#FAF5F2]'
                          : 'text-[#8A797A] hover:text-[#BE4B5E]'
                      }`}
                    >
                      Lịch thử váy ({liveNotifications.filter((n) => n.type === 'appointment').length})
                    </button>
                  </div>

                  {/* Notification List Body */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-[#F5ECE8]">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map((item) => {
                        const isRead = readNotifIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectNotification(item)}
                            className={`p-3.5 hover:bg-[#FAF3F0] transition-colors cursor-pointer flex items-start gap-3 relative ${
                              !isRead ? 'bg-[#FCF8F6]' : 'bg-white opacity-85'
                            }`}
                          >
                            {!isRead && (
                              <span className="absolute left-1 top-4 w-1.5 h-1.5 bg-[#C93B3B] rounded-full" />
                            )}
                            <div className="shrink-0 mt-0.5">
                              {item.type === 'deposit' ? (
                                <div className="w-8 h-8 rounded-full bg-[#EBF6EE] text-[#1E8347] border border-[#CDEBCE] flex items-center justify-center shadow-xs">
                                  <CreditCard size={15} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#FDECEE] text-[#BE4B5E] border border-[#F9CFD7] flex items-center justify-center shadow-xs">
                                  <CalendarDays size={15} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A39192]">
                                  {item.type === 'deposit' ? 'Đã đặt cọc lễ phục' : 'Lịch hẹn thử váy mới'}
                                </span>
                                <span className="text-[10px] text-[#A89899] font-mono shrink-0">
                                  {timeAgo(item.time)}
                                </span>
                              </div>

                              <div className="text-[13px] font-bold text-[#2C2523] truncate">
                                {item.customerName}
                              </div>

                              {item.type === 'deposit' ? (
                                <div className="text-xs text-[#5C4D4D] mt-0.5">
                                  Tiền cọc: <span className="font-bold text-[#1E8347]">{formatCurrencyVND(item.amount)}</span> • Đơn <span className="font-mono text-[#733F49] font-semibold">#{item.orderCode}</span>
                                </div>
                              ) : (
                                <div className="text-xs text-[#5C4D4D] mt-0.5">
                                  Giờ thử: <span className="font-bold text-[#BE4B5E]">{item.timeSlot}</span>
                                  {item.date && (
                                    <> ngày <span className="font-medium text-[#2C2523]">{new Date(item.date).toLocaleDateString('vi-VN')}</span></>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="shrink-0 self-center text-[#A89899]">
                              <ChevronRight size={15} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center px-4">
                        <div className="w-10 h-10 rounded-full bg-[#FAF5F2] text-[#A89899] mx-auto flex items-center justify-center mb-2">
                          <Bell size={18} />
                        </div>
                        <p className="text-xs text-[#7A6B6C] font-medium">Chưa có thông báo nào trong mục này</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation Shortcuts */}
                  <div className="p-2.5 bg-[#FAF5F2] border-t border-[#EFE2DC] flex items-center justify-between gap-2 text-xs">
                    <Link
                      to={isStaff ? '/staff/don-thue' : '/admin/don-thue'}
                      onClick={() => setNotifOpen(false)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#EFE2DC] text-center font-bold text-[#5F2B36] hover:bg-[#F3E7E3] transition-colors"
                    >
                      Quản lý đơn thuê →
                    </Link>
                    <Link
                      to={isStaff ? '/staff/lich-tong-quan' : '/admin/lich-tong-quan'}
                      onClick={() => setNotifOpen(false)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#EFE2DC] text-center font-bold text-[#5F2B36] hover:bg-[#F3E7E3] transition-colors"
                    >
                      Lịch tổng quan →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Widget */}
            <div className="h-8 w-px bg-[#EFE5E1] mr-3 sm:mr-5 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[13.5px] font-bold text-[#2C2523] leading-tight">
                  {userName}
                </div>
                <div className={`inline-block mt-0.5 px-2 py-0.5 rounded-sm text-[9.5px] font-bold tracking-wider uppercase ${
                  isStaff ? 'bg-[#FDECEE] text-[#B8737D]' : 'bg-[#EBF5EE] text-[#2F6F4E]'
                }`}>
                  {userRoleText}
                </div>
              </div>
              <div className="relative">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#EFE5E1]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Optional Page Heading Header if title or controls are passed */}
        {(title || controls) && (
          <div className="px-6 lg:px-8 pt-6 pb-2 max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {title && (
                <h1 className="font-playfair text-[32px] sm:text-[38px] font-normal text-[#5F2B36] tracking-tight leading-tight mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[14px] text-[#7A6B6C] font-normal max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {controls && <div>{controls}</div>}
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 px-6 lg:px-8 pt-3.5 pb-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
