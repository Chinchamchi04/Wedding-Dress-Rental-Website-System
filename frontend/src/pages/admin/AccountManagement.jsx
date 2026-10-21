import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Search,
  ChevronDown,
  Globe,
  Users,
  Briefcase,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Lock,
  Unlock,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Shield,
  Key,
  UserPlus,
  Trash2,
  FileText,
  Phone,
  Mail,
  Building,
  RotateCcw
} from 'lucide-react';
import heroBride from '../../assets/hero_bride.jpg';

// Initial users matching the screenshot exactly
const INITIAL_USERS = [
  {
    id: 1,
    name: 'Võ Hoàng Mỹ Linh',
    isVerified: true,
    email: 'linh.vo@unibridal.com',
    code: 'Mã: ADM-2024-001',
    phone: '(+84) 912 345 678',
    role: 'Super Admin',
    roleType: 'super_admin',
    roleDesc: 'Toàn quyền hệ thống & Tài chính',
    department: 'Ban Giám Đốc Điều Hành',
    location: 'Quận 1, TP.HCM',
    status: 'Đang hoạt động', // 'Đang hoạt động' | 'Ca trực online' | 'Chờ xác thực' | 'Tạm khóa'
    statusType: 'active',
    avatarText: 'ML',
    avatarImg: null,
    contractCode: '',
    dressRented: ''
  },
  {
    id: 2,
    name: 'Trần Bích Ngọc',
    isVerified: false,
    email: 'ngoc.tran@unibridal.com',
    code: 'Mã: STF-2024-018',
    phone: '(+84) 938 119 002',
    role: 'Staff',
    roleType: 'staff',
    roleDesc: 'Quản lý kho, fitting váy & tạo đơn',
    department: 'Bộ phận Tạo Hình & Kho Váy',
    location: 'Suite Thử Váy VIP - Salon 02',
    status: 'Ca trực online',
    statusType: 'online',
    avatarText: 'BN',
    avatarImg: heroBride,
    contractCode: '',
    dressRented: ''
  },
  {
    id: 3,
    name: 'Nguyễn Hoàng Lan Vy',
    isVerified: false,
    email: 'lanvy.nguyen89@gmail.com',
    code: 'CCCD: 079198004521',
    phone: '(+84) 912 348 899',
    role: 'Khách Hàng (Cô Dâu)',
    roleType: 'customer',
    roleDesc: 'Đã xác thực OTP VNPT-CA',
    department: 'Hợp Đồng: HD-UB-2025-089',
    location: 'Thuê váy: Elysian Rose Ballgown',
    status: 'Đang hoạt động',
    statusType: 'active',
    avatarText: 'LV',
    avatarImg: null,
    contractCode: 'HD-UB-2025-089',
    dressRented: 'Elysian Rose Ballgown'
  },
  {
    id: 4,
    name: 'Lê Hoàng Hải',
    isVerified: false,
    email: 'hai.le@unibridal.com',
    code: 'Mã: STF-2023-009',
    phone: '(+84) 903 881 224',
    role: 'Staff',
    roleType: 'staff',
    roleDesc: 'Xuất hóa đơn, tiền cọc & ERP',
    department: 'Phòng Tài Chính & Kế Toán',
    location: 'Văn Phòng Trụ Sở Quận 1',
    status: 'Đang hoạt động',
    statusType: 'active',
    avatarText: 'HH',
    avatarImg: null,
    contractCode: '',
    dressRented: ''
  },
  {
    id: 5,
    name: 'Trịnh Minh Thảo',
    isVerified: false,
    email: 'minhthao.t@gmail.com',
    code: 'CCCD: 001195029134',
    phone: '(+84) 903 881 224',
    role: 'Khách Hàng (Cô Dâu)',
    roleType: 'customer',
    roleDesc: 'Đang chờ ký SmartOTP Zalo',
    department: 'Hợp Đồng: HD-UB-2025-088',
    location: 'Thuê váy: Celeste Royal Mermaid',
    status: 'Chờ xác thực',
    statusType: 'pending',
    avatarText: 'MT',
    avatarImg: null,
    contractCode: 'HD-UB-2025-088',
    dressRented: 'Celeste Royal Mermaid'
  },
  {
    id: 6,
    name: 'Phạm Quỳnh Nga',
    isVerified: false,
    email: 'nga.pham@unibridal.com',
    code: 'Mã: STF-2024-033',
    phone: '(+84) 989 332 109',
    role: 'Staff',
    roleType: 'staff',
    roleDesc: 'Đã thu hồi token đăng nhập',
    department: 'Chi Nhánh Hà Nội (Tràng Tiền)',
    location: 'Nghỉ phép chế độ thai sản',
    status: 'Tạm khóa',
    statusType: 'locked',
    avatarText: 'QN',
    avatarImg: null,
    contractCode: '',
    dressRented: ''
  }
];

export default function AccountManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, online, pending, locked
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Checkbox selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    department: '',
    location: '',
    status: 'Đang hoạt động'
  });

  // Role Matrix Permissions State for Role Modal
  const [roleMatrix, setRoleMatrix] = useState([
    {
      id: 'dresses',
      feature: 'Quản Lý Mẫu Váy & BST',
      superAdmin: true,
      staff: true,
      customer: false
    },
    {
      id: 'orders',
      feature: 'Tạo & Duyệt Đơn Thuê Váy',
      superAdmin: true,
      staff: true,
      customer: true
    },
    {
      id: 'contracts',
      feature: 'Ký & Xác Thực Hợp Đồng Điện Tử',
      superAdmin: true,
      staff: true,
      customer: true
    },
    {
      id: 'pricing',
      feature: 'Thiết Lập Giá Bán & Tiền Cọc',
      superAdmin: true,
      staff: false,
      customer: false
    },
    {
      id: 'reports',
      feature: 'Báo Cáo Doanh Thu & Tài Chính',
      superAdmin: true,
      staff: false,
      customer: false
    },
    {
      id: 'accounts',
      feature: 'Phân Quyền & Quản Trị Nhân Viên',
      superAdmin: true,
      staff: false,
      customer: false
    }
  ]);

  // Toggle selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle user lock/unlock status
  const handleToggleLock = (id) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const isCurrentlyLocked = user.status === 'Tạm khóa';
          const nextStatus = isCurrentlyLocked ? 'Đang hoạt động' : 'Tạm khóa';
          const nextType = isCurrentlyLocked ? 'active' : 'locked';
          showToast(
            isCurrentlyLocked
              ? `Đã mở khóa tài khoản cho ${user.name}`
              : `Đã tạm khóa tài khoản của ${user.name}`
          );
          return { ...user, status: nextStatus, statusType: nextType };
        }
        return user;
      })
    );
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      location: user.location,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Vui lòng nhập Họ tên và Email!');
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                department: formData.department,
                location: formData.location,
                status: formData.status
              }
            : u
        )
      );
      showToast(`Đã cập nhật thông tin tài khoản ${formData.name}`);
    } else {
      const newId = Date.now();
      const initials = formData.name
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase();

      const newUser = {
        id: newId,
        name: formData.name,
        isVerified: false,
        email: formData.email,
        code: `Mã: STF-2025-${String(users.length + 1).padStart(3, '0')}`,
        phone: formData.phone || '(+84) 900 000 000',
        role: formData.role,
        roleType: formData.role === 'Super Admin' ? 'super_admin' : formData.role === 'Staff' ? 'staff' : 'customer',
        roleDesc: 'Tài khoản người dùng mới tạo',
        department: formData.department || 'Bộ phận Showroom',
        location: formData.location || 'Trụ sở chính',
        status: formData.status,
        statusType: formData.status === 'Đang hoạt động' ? 'active' : 'locked',
        avatarText: initials,
        avatarImg: null,
        contractCode: '',
        dressRented: ''
      };

      setUsers((prev) => [newUser, ...prev]);
      showToast(`Đã thêm mới tài khoản ${newUser.name}`);
    }

    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (statusFilter === 'active' && u.status !== 'Đang hoạt động') return false;
      if (statusFilter === 'online' && u.status !== 'Ca trực online') return false;
      if (statusFilter === 'pending' && u.status !== 'Chờ xác thực') return false;
      if (statusFilter === 'locked' && u.status !== 'Tạm khóa') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [users, statusFilter, searchQuery]);

  return (
    <AdminLayout activeMenu="accounts" mode="ADMIN MODE">
      <div className="font-jakarta pb-12">
        {/* ===================== 1. TOP HEADER & TITLE ===================== */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="font-playfair text-[28px] sm:text-[34px] font-bold text-[#45272F] tracking-tight leading-tight m-0">
              Quản Lý Tài Khoản Người Dùng
            </h1>
            <p className="text-[13px] sm:text-[13.5px] text-[#7A6A6B] mt-1.5 max-w-2xl leading-relaxed">
              Giám sát, phân quyền và điều phối tài khoản nhân viên, và hồ sơ nàng dâu.
            </p>
          </div>

          {/* Action Button: Phân quyền vai trò */}
          <div className="shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#FAF5F2] hover:bg-[#F6ECE8] text-[#5F333B] border border-[#EFE5E0] hover:border-[#733F49] px-4 py-2.5 rounded-xl font-jakarta text-[12px] font-bold tracking-wider uppercase transition-all shadow-xs active:scale-95 cursor-pointer select-none"
            >
              <Globe size={15} className="text-[#733F49]" />
              <span>PHÂN QUYỀN VAI TRÒ</span>
            </button>
          </div>
        </div>

        {/* ===================== 2. FOUR KPI SUMMARY CARDS ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Tổng tài khoản */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                TỔNG TÀI KHOẢN
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Users size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-playfair text-[28px] sm:text-[32px] font-bold text-[#2C2523] leading-none">
                1,248
              </span>
              <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                +24 tuần này
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              Toàn bộ 3 phân hệ người dùng
            </div>
          </div>

          {/* Card 2: Nhân viên & Stylist */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                NHÂN VIÊN & STYLIST
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Briefcase size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-playfair text-[28px] sm:text-[32px] font-bold text-[#2C2523] leading-none">
                42
              </span>
              <span className="text-[11.5px] font-bold text-[#2E7D32]">
                18 ca trực online
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              3 Quản lý • 39 Chuyên viên
            </div>
          </div>

          {/* Card 3: Hồ sơ nàng dâu VIP */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                HỒ SƠ NÀNG DÂU VIP
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Heart size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-playfair text-[28px] sm:text-[32px] font-bold text-[#2C2523] leading-none">
                1,196
              </span>
              <span className="text-[11px] font-bold text-[#733F49]">
                86 Hợp đồng active
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              Tài khoản khách hàng thành viên
            </div>
          </div>

          {/* Card 4: Yêu cầu xác thực OTP */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                YÊU CẦU XÁC THỰC OTP
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center text-[#D97706] shrink-0">
                <ShieldCheck size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-playfair text-[28px] sm:text-[32px] font-bold text-[#2C2523] leading-none">
                10
              </span>
              <span className="text-[11.5px] font-bold text-[#D97706]">
                3 Tạm khóa
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              Cần đối soát danh tính CCCD
            </div>
          </div>
        </div>

        {/* ===================== 3. FILTERS & SEARCH ROW ===================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39192]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm họ tên, email, SĐT..."
              className="w-full bg-[#FAF5F2] hover:bg-[#F6ECE8] focus:bg-white text-[13px] text-[#2C2523] placeholder:text-[#A39192] rounded-xl pl-9 pr-3.5 py-2.5 border border-[#EFE5E0] focus:border-[#733F49] outline-none transition-all"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setSortDropdownOpen(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-between gap-3 bg-[#FAF5F2] hover:bg-[#F6ECE8] border border-[#EFE5E0] text-[12.5px] font-medium text-[#2C2523] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <span>
                {statusFilter === 'all' && 'Tất cả trạng thái hoạt động'}
                {statusFilter === 'active' && 'Đang hoạt động'}
                {statusFilter === 'online' && 'Ca trực online'}
                {statusFilter === 'pending' && 'Chờ xác thực'}
                {statusFilter === 'locked' && 'Tạm khóa'}
              </span>
              <ChevronDown size={14} className="text-[#8A797A]" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#EFE5E0] py-1.5 z-30">
                {[
                  { key: 'all', label: 'Tất cả trạng thái hoạt động' },
                  { key: 'active', label: 'Đang hoạt động' },
                  { key: 'online', label: 'Ca trực online' },
                  { key: 'pending', label: 'Chờ xác thực' },
                  { key: 'locked', label: 'Tạm khóa' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.key);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[12.5px] transition-colors flex items-center justify-between ${
                      statusFilter === opt.key
                        ? 'bg-[#F6ECE8] text-[#733F49] font-bold'
                        : 'text-[#2C2523] hover:bg-[#FAF5F2]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-between gap-3 bg-[#FAF5F2] hover:bg-[#F6ECE8] border border-[#EFE5E0] text-[12.5px] font-medium text-[#2C2523] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <span>
                {sortBy === 'newest' && 'Sắp xếp: Mới nhất'}
                {sortBy === 'oldest' && 'Sắp xếp: Cũ nhất'}
                {sortBy === 'name' && 'Sắp xếp: Tên A-Z'}
              </span>
              <ChevronDown size={14} className="text-[#8A797A]" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#EFE5E0] py-1.5 z-30">
                {[
                  { key: 'newest', label: 'Mới nhất' },
                  { key: 'oldest', label: 'Cũ nhất' },
                  { key: 'name', label: 'Tên A-Z' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[12.5px] transition-colors flex items-center justify-between ${
                      sortBy === opt.key
                        ? 'bg-[#F6ECE8] text-[#733F49] font-bold'
                        : 'text-[#2C2523] hover:bg-[#FAF5F2]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================== 4. USER ACCOUNTS TABLE ===================== */}
        <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 sm:p-6 shadow-[0_2px_14px_rgba(115,63,73,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#FAF4F0] text-[#8C7A7B] text-[11px] font-bold tracking-[1.1px] uppercase">
                  <th className="py-3.5 px-4 rounded-l-xl w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedIds.length === filteredUsers.length
                      }
                      onChange={handleSelectAll}
                      className="accent-[#733F49] rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-bold">NGƯỜI DÙNG & THÔNG TIN LIÊN HỆ</th>
                  <th className="py-3.5 px-4 font-bold">VAI TRÒ & QUYỀN HẠN</th>
                  <th className="py-3.5 px-4 font-bold">PHÂN PHỐI & ĐƠN VỊ</th>
                  <th className="py-3.5 px-3 font-bold text-center">TRẠNG THÁI</th>
                  <th className="py-3.5 px-4 rounded-r-xl font-bold text-center">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F6ECE8]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#8C7A7B] text-[13.5px]">
                      Không tìm thấy tài khoản người dùng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#FAF7F5] transition-colors group ${
                          isSelected ? 'bg-[#FDF6F3]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 align-middle text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(user.id)}
                            className="accent-[#733F49] rounded cursor-pointer"
                          />
                        </td>

                        {/* Cột 1: NGƯỜI DÙNG & THÔNG TIN LIÊN HỆ */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              {user.avatarImg ? (
                                <img
                                  src={user.avatarImg}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-[#EFE5E0]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#F6ECE8] text-[#5F333B] font-bold text-[12.5px] flex items-center justify-center border border-[#EFE5E0]">
                                  {user.avatarText}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[14px] text-[#2C2523] group-hover:text-[#733F49] transition-colors leading-snug">
                                  {user.name}
                                </span>
                                {user.isVerified && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-[9px] font-bold" title="Tài khoản đã xác minh">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-[12px] text-[#5F333B] mt-0.5 leading-snug font-medium">
                                {user.email}
                              </div>
                              <div className="text-[11.5px] text-[#8C7A7B] mt-0.5 leading-tight font-normal">
                                {user.code} • {user.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: VAI TRÒ & QUYỀN HẠN */}
                        <td className="py-4 px-4 align-middle">
                          <div>
                            <span
                              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-snug ${
                                user.roleType === 'super_admin'
                                  ? 'bg-[#FDECEE] text-[#D84365]'
                                  : user.roleType === 'staff'
                                  ? 'bg-[#E3F2FD] text-[#1976D2]'
                                  : 'bg-[#F3E8FF] text-[#7E22CE]'
                              }`}
                            >
                              {user.role}
                            </span>
                            <div
                              className={`text-[12px] mt-1 leading-tight ${
                                user.roleDesc.includes('chờ')
                                  ? 'text-[#D97706] font-medium'
                                  : 'text-[#8C7A7B]'
                              }`}
                            >
                              {user.roleDesc}
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: PHÂN PHỐI & ĐƠN VỊ */}
                        <td className="py-4 px-4 align-middle">
                          <div>
                            <div className="text-[13px] font-semibold text-[#2C2523] leading-snug">
                              {user.department}
                            </div>
                            <div className="text-[12px] text-[#8C7A7B] mt-0.5 leading-tight">
                              {user.location}
                            </div>
                          </div>
                        </td>

                        {/* Cột 4: TRẠNG THÁI */}
                        <td className="py-4 px-3 align-middle text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11.5px] font-bold ${
                              user.statusType === 'active' || user.statusType === 'online'
                                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                : user.statusType === 'pending'
                                ? 'bg-[#FEF3C7] text-[#D97706]'
                                : 'bg-[#F3F4F6] text-[#6B7280]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.statusType === 'active' || user.statusType === 'online'
                                  ? 'bg-[#2E7D32]'
                                  : user.statusType === 'pending'
                                  ? 'bg-[#D97706]'
                                  : 'bg-[#6B7280]'
                              }`}
                            />
                            <span>{user.status}</span>
                          </span>
                        </td>

                        {/* Cột 5: THAO TÁC */}
                        <td className="py-4 px-4 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút sửa */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-[#8C7A7B] hover:text-[#733F49] hover:bg-[#F6ECE8] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Chỉnh sửa thông tin"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Nút khóa / mở khóa */}
                            {user.statusType === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleLock(user.id)}
                                className="p-1.5 text-[#D97706] hover:bg-[#FEF3C7] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                                title="Đang chờ xác thực"
                              >
                                <Ban size={15} />
                              </button>
                            ) : user.status === 'Tạm khóa' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleLock(user.id)}
                                className="p-1.5 text-[#C93B3B] hover:bg-[#FDECEE] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                                title="Tài khoản đang bị khóa. Bấm để mở khóa"
                              >
                                <Lock size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleLock(user.id)}
                                className="p-1.5 text-[#2E7D32] hover:bg-[#E8F5E9] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                                title="Tài khoản đang hoạt động. Bấm để tạm khóa"
                              >
                                <Unlock size={15} />
                              </button>
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

          {/* ===================== 5. PAGINATION ===================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-[#F6ECE8] text-[12.5px] text-[#8C7A7B]">
            <div>
              Hiển thị <strong className="text-[#2C2523] font-bold">1 - 6</strong> trong tổng số{' '}
              <strong className="text-[#2C2523] font-bold">1,248</strong> tài khoản người dùng
            </div>

            <div className="flex items-center gap-1.5 select-none">
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7A7B] hover:text-[#733F49] hover:bg-[#F6ECE8] transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-40"
                disabled
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-[#733F49] text-white font-bold flex items-center justify-center shadow-xs cursor-pointer border-0 text-[12.5px]"
              >
                1
              </button>

              <button
                type="button"
                onClick={() => showToast('Chuyển trang 2')}
                className="w-8 h-8 rounded-lg text-[#2C2523] hover:bg-[#F6ECE8] font-medium flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent text-[12.5px]"
              >
                2
              </button>

              <button
                type="button"
                onClick={() => showToast('Chuyển trang 3')}
                className="w-8 h-8 rounded-lg text-[#2C2523] hover:bg-[#F6ECE8] font-medium flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent text-[12.5px]"
              >
                3
              </button>

              <span className="px-1 text-[#A39192]">...</span>

              <button
                type="button"
                onClick={() => showToast('Chuyển trang 208')}
                className="w-8 h-8 rounded-lg text-[#2C2523] hover:bg-[#F6ECE8] font-medium flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent text-[12.5px]"
              >
                208
              </button>

              <button
                type="button"
                onClick={() => showToast('Chuyển trang kế tiếp')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7A7B] hover:text-[#733F49] hover:bg-[#F6ECE8] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== 6. MODAL: PHÂN QUYỀN VAI TRÒ (RBAC) ===================== */}
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#F0E6E2] my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#F6ECE8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6ECE8] flex items-center justify-center text-[#733F49]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-[22px] font-bold text-[#45272F] m-0">
                      Ma Trận Phân Quyền Vai Trò (RBAC)
                    </h3>
                    <p className="text-[12px] text-[#8C7A7B] m-0 mt-0.5">
                      Quy định thẩm quyền truy cập và thao tác trên hệ thống UniBridal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F6ECE8] text-[#8C7A7B] hover:text-[#733F49] transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Roles Description Cards */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-xl bg-[#FDECEE] border border-[#FADBD8]">
                  <span className="text-[11.5px] font-bold text-[#D84365] block mb-1">
                    Super Admin
                  </span>
                  <span className="text-[11px] text-[#6D5D5E] leading-tight block">
                    Toàn quyền cấu hình, tài chính, phê duyệt cọc & xóa dữ liệu.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#E3F2FD] border border-[#BBDEFB]">
                  <span className="text-[11.5px] font-bold text-[#1976D2] block mb-1">
                    Staff Showroom
                  </span>
                  <span className="text-[11px] text-[#6D5D5E] leading-tight block">
                    Tạo đơn thuê, kiểm kho váy, fitting váy & hỗ trợ ký hợp đồng.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF]">
                  <span className="text-[11.5px] font-bold text-[#7E22CE] block mb-1">
                    Khách Hàng (Cô Dâu)
                  </span>
                  <span className="text-[11px] text-[#6D5D5E] leading-tight block">
                    Xem catalog váy, đặt cọc giữ chỗ, ký OTP & theo dõi đơn thuê.
                  </span>
                </div>
              </div>

              {/* Permissions Matrix Table */}
              <div className="border border-[#EFE5E0] rounded-xl overflow-hidden mb-5">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAF4F0] text-[#8C7A7B] text-[11px] font-bold uppercase">
                      <th className="py-2.5 px-3.5">Chức Năng Phân Hệ</th>
                      <th className="py-2.5 px-3 text-center">Super Admin</th>
                      <th className="py-2.5 px-3 text-center">Staff</th>
                      <th className="py-2.5 px-3 text-center">Cô Dâu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6ECE8]">
                    {roleMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF7F5]">
                        <td className="py-2.5 px-3.5 font-medium text-[#2C2523]">
                          {item.feature}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] leading-5 font-bold">
                            ✓
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.staff ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] leading-5 font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#F3F4F6] text-[#9CA3AF] leading-5 font-bold">
                              ✕
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.customer ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] leading-5 font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-block w-5 h-5 rounded-full bg-[#F3F4F6] text-[#9CA3AF] leading-5 font-bold">
                              ✕
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F6ECE8]">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5E323B] text-white text-[12.5px] font-bold transition-all border-0 cursor-pointer"
                >
                  Đóng & Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 7. MODAL: SỬA THÔNG TIN NGƯỜI DÙNG ===================== */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#F0E6E2] my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#F6ECE8]">
                <div>
                  <h3 className="font-playfair text-[22px] font-bold text-[#45272F] m-0">
                    Chỉnh Sửa Hồ Sơ Tài Khoản
                  </h3>
                  <p className="text-[12px] text-[#8C7A7B] m-0 mt-0.5">
                    Cập nhật quyền hạn và đơn vị công tác
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F6ECE8] text-[#8C7A7B] hover:text-[#733F49] transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Họ & Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Email Liên Hệ *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Số Điện Thoại
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Vai Trò Hệ Thống
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Staff">Staff Showroom</option>
                      <option value="Khách Hàng (Cô Dâu)">Khách Hàng (Cô Dâu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Trạng Thái Hoạt Động
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    >
                      <option value="Đang hoạt động">Đang hoạt động</option>
                      <option value="Ca trực online">Ca trực online</option>
                      <option value="Chờ xác thực">Chờ xác thực</option>
                      <option value="Tạm khóa">Tạm khóa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Đơn Vị / Phòng Ban / Hợp Đồng
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Địa Điểm / Chi Tiết Váy Thuê
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-[#F6ECE8]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#EFE5E0] text-[13px] font-semibold text-[#6D5D5E] hover:bg-[#FAF5F2] transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5E323B] text-white text-[13px] font-bold tracking-wide transition-all shadow-md cursor-pointer border-0"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TOAST NOTIFICATION ===================== */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2C2523] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-[13px] font-medium border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <Check size={14} className="stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
