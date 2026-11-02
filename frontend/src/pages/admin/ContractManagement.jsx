import React, { useState, useMemo, useEffect } from 'react';
import { getAllOrdersAdmin, createOrder, updateOrderStatus } from '../../services/orderService';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Search,
  FileSignature,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  X,
  Printer,
  ShieldCheck,
  Send,
  Sparkles,
  User,
  Phone,
  CreditCard,
  Layers,
  ArrowRight,
  Plus,
  Check,
  AlertTriangle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DRESS_OPTIONS = [
  {
    code: 'BGW-2026',
    name: 'Elysian Rose Ballgown',
    price: 5200000,
    deposit: 15000000,
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80',
    sizes: ['XS (Eo 58-62cm)', 'Size S (Eo 62-66cm)', 'Size M (Eo 66-70cm)', 'Size L (Eo 70-74cm)']
  },
  {
    code: 'BESPOKE-2026',
    name: 'Bespoke Atelier Tailoring Gown',
    price: 18500000,
    deposit: 30000000,
    image: 'https://images.unsplash.com/photo-1546804784-896d0dca3800?auto=format&fit=crop&w=600&q=80',
    sizes: ['May đo cá nhân hóa 1:1']
  },
  {
    code: 'MER-2026',
    name: 'Celeste Royal Mermaid',
    price: 6500000,
    deposit: 18000000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    sizes: ['Size S (Eo 62-66cm)', 'Size M (Eo 68-72cm)']
  },
  {
    code: 'ALINE-2026',
    name: 'Lumière Minimalist Silk A-Line',
    price: 3800000,
    deposit: 10000000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    sizes: ['Size XS (Eo 60-64cm)', 'Size S (Eo 64-68cm)', 'Size M (Eo 68-72cm)']
  },
  {
    code: 'MONET-2026',
    name: 'Monet 3D Floral Couture Gown',
    price: 7200000,
    deposit: 20000000,
    image: 'https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?auto=format&fit=crop&w=600&q=80',
    sizes: ['Size S (Eo 64-68cm)', 'Size M (Eo 68-72cm)', 'Size L (Eo 74-78cm)']
  }
];

const fmtVnd = (num) => formatCurrencyVND(num);

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form tạo hợp đồng mới tại showroom
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdCard, setNewIdCard] = useState('');
  const [selectedDressCode, setSelectedDressCode] = useState(DRESS_OPTIONS[0].code);
  const [selectedDressSize, setSelectedDressSize] = useState(DRESS_OPTIONS[0].sizes[0]);
  const [newStartDate, setNewStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [newNote, setNewNote] = useState('');
  const [newTemplate, setNewTemplate] = useState('Hợp đồng Thuê Váy Cưới Haute Couture Tiêu Chuẩn');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Đồng bộ hợp đồng từ backend orders
  const loadContractsFromOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrdersAdmin();
      const orderList = res?.orders || [];
      if (orderList.length > 0) {
        const liveContracts = orderList.map((ord) => {
          const item = ord.items?.[0] || {};
          let status = 'active';
          if (ord.status === 'completed') status = 'completed';
          else if (ord.status === 'cancelled') status = 'disputed';
          else if (ord.status === 'pending_payment') status = 'pending_signature';

          return {
            id: ord.contractCode || (`HD-${ord.orderCode || (ord._id ? String(ord._id).slice(-6).toUpperCase() : '001')}`),
            orderCode: ord.orderCode,
            orderId: ord._id || ord.id,
            customerName: ord.customerName || ord.userId?.fullName || 'Khách hàng',
            phone: ord.customerPhone || ord.userId?.phone || '—',
            idCard: ord.idCard || '001198012345',
            dressName: item.name || item.dressId?.name || 'Váy cưới Haute Couture',
            dressCode: item.dressCode || item.dressId?.code || 'BGW-2026',
            dressSize: item.size ? `Size ${item.size}` : 'Size S',
            dressImage: item.image || item.dressId?.image || DRESS_OPTIONS[0].image,
            templateName: 'Hợp đồng Thuê Váy Cưới Haute Couture Tiêu Chuẩn',
            startDate: ord.rentalStartDate ? new Date(ord.rentalStartDate).toISOString().split('T')[0] : '2026-11-01',
            endDate: ord.rentalEndDate ? new Date(ord.rentalEndDate).toISOString().split('T')[0] : '2026-11-04',
            rentalPrice: ord.totalRentPrice || 5200000,
            depositAmount: ord.totalDeposit || 15000000,
            totalValue: (ord.totalRentPrice || 5200000) + (ord.totalDeposit || 15000000),
            status,
            signedAt: ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : '2026-11-01',
            signedMethod: ord.contractSignature ? 'Ký số điện tử UniBridal Pass' : 'SmartOTP eID',
            staffInCharge: 'Chuyên viên Atelier',
            packageType: 'Gói Thuê Lễ Phục Tiêu Chuẩn',
            note: ord.notes || 'Hợp đồng điện tử kèm biên nhận cọc bảo lãnh.'
          };
        });

        // Hợp nhất dữ liệu tránh trùng lặp
        setContracts((prev) => {
          const ids = new Set(liveContracts.map((c) => c.id));
          const uniquePrev = prev.filter((p) => !ids.has(p.id));
          const combined = [...liveContracts, ...uniquePrev];
          try { localStorage.setItem('unibridal_contracts_local', JSON.stringify(combined)); } catch {}
          return combined;
        });
      }
    } catch {
      // Giữ nguyên contracts hiện có
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractsFromOrders();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.dressName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [contracts, searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === 'active').length,
      pending: contracts.filter((c) => c.status === 'pending_signature').length,
      completed: contracts.filter((c) => c.status === 'completed').length,
      disputed: contracts.filter((c) => c.status === 'disputed').length,
      totalDeposit: contracts.reduce((sum, c) => sum + (c.status === 'active' ? c.depositAmount : 0), 0)
    };
  }, [contracts]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Có Hiệu Lực
          </span>
        );
      case 'pending_signature':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} /> Chờ Ký OTP
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3ECE8] text-[#705856] border border-[#E8DDD8]">
            <CheckCircle2 size={13} /> Đã Thanh Lý
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={13} /> Đang Xử Lý Cọc
          </span>
        );
      default:
        return null;
    }
  };

  const handleOpenPreview = (contract) => {
    setSelectedContract(contract);
    setIsPreviewOpen(true);
  };

  const handleSendReminder = (contract) => {
    showToast(`Đã gửi tin nhắn SMS & Email nhắc ký hợp đồng đến ${contract.customerName} (${contract.phone})`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Cập nhật trạng thái hợp đồng (Kích hoạt, Thanh lý, Giữ cọc)
  const handleUpdateStatus = async (contractId, newStatus) => {
    const updated = contracts.map((c) => {
      if (c.id === contractId) {
        const signedAt = newStatus === 'active' && !c.signedAt
          ? new Date().toLocaleString('vi-VN')
          : c.signedAt;
        return { ...c, status: newStatus, signedAt };
      }
      return c;
    });

    setContracts(updated);
    try { localStorage.setItem('unibridal_contracts_local', JSON.stringify(updated)); } catch {}

    if (selectedContract && selectedContract.id === contractId) {
      setSelectedContract((prev) => ({
        ...prev,
        status: newStatus,
        signedAt: newStatus === 'active' && !prev.signedAt ? new Date().toLocaleString('vi-VN') : prev.signedAt
      }));
    }

    const target = contracts.find((c) => c.id === contractId);
    if (target?.orderId) {
      try {
        let orderBackendStatus = 'active';
        if (newStatus === 'completed') orderBackendStatus = 'completed';
        if (newStatus === 'disputed') orderBackendStatus = 'returned';
        await updateOrderStatus(target.orderId, orderBackendStatus);
      } catch {}
    }

    const labels = {
      active: 'Đã kích hoạt hợp đồng có hiệu lực pháp lý!',
      completed: 'Đã thanh lý hợp đồng & giải ngân hoàn cọc cho khách hàng!',
      disputed: 'Đã chuyển hợp đồng sang trạng thái đối soát bồi thường cọc!'
    };
    showToast(labels[newStatus] || 'Đã cập nhật trạng thái hợp đồng thành công!');
  };

  // Xử lý tạo hợp đồng mới tại showroom
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newPhone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại khách hàng.');
      return;
    }

    const dress = DRESS_OPTIONS.find((d) => d.code === selectedDressCode) || DRESS_OPTIONS[0];
    const newCode = `HD-UB-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const orderCode = `UB-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newContractObj = {
      id: newCode,
      orderCode,
      customerName: newCustomerName.trim(),
      phone: newPhone.trim(),
      idCard: newIdCard.trim() || '00119900' + Math.floor(1000 + Math.random() * 9000),
      dressName: dress.name,
      dressCode: dress.code,
      dressSize: selectedDressSize,
      dressImage: dress.image,
      templateName: newTemplate,
      startDate: newStartDate,
      endDate: newEndDate,
      rentalPrice: dress.price,
      depositAmount: dress.deposit,
      totalValue: dress.price + dress.deposit,
      status: 'active',
      signedAt: new Date().toLocaleString('vi-VN'),
      signedMethod: 'Ký trực tiếp tại Showroom',
      staffInCharge: 'Chuyên Viên Atelier',
      packageType: 'Gói Thuê Lễ Phục Tiêu Chuẩn',
      note: newNote || 'Lập hợp đồng trực tiếp tại quầy tiếp đón.'
    };

    // Thử gửi tạo đơn qua API
    try {
      await createOrder({
        customerName: newContractObj.customerName,
        customerPhone: newContractObj.phone,
        rentalStartDate: newContractObj.startDate,
        rentalEndDate: newContractObj.endDate,
        items: [{
          name: dress.name,
          dressCode: dress.code,
          size: selectedDressSize,
          rentPrice: dress.price,
          depositPrice: dress.deposit
        }],
        totalRentPrice: dress.price,
        totalDeposit: dress.deposit,
        contractCode: newCode,
        contractSignature: newContractObj.customerName,
        status: 'active'
      });
    } catch {}

    const updatedList = [newContractObj, ...contracts];
    setContracts(updatedList);
    try { localStorage.setItem('unibridal_contracts_local', JSON.stringify(updatedList)); } catch {}

    setIsCreateOpen(false);
    setNewCustomerName('');
    setNewPhone('');
    setNewIdCard('');
    setNewNote('');
    showToast(`Đã lập thành công hợp đồng ${newCode} cho cô dâu ${newContractObj.customerName}!`);
  };

  return (
    <AdminLayout activeMenu="contracts">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-contract-document, #printable-contract-document * {
            visibility: visible;
          }
          #printable-contract-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm 20mm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠️ Lỗi kết nối Cơ sở dữ liệu:</span> {error}
        </div>
      )}
      {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#302626] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-amber-900/30">
            <Sparkles size={16} className="text-amber-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EFE5E1] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#9E8B89] mb-1">
              <span>Quản trị UniBridal</span>
              <span>/</span>
              <span className="text-[#733F49] font-medium">Hợp đồng điện tử</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#302626]">
              Quản Lý Hợp Đồng Thuê Váy Cưới
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A6B] mt-0.5">
              Theo dõi tình trạng ký kết điện tử, giá trị đặt cọc và hiệu lực pháp lý của hợp đồng thuê.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadContractsFromOrders}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#D9C4BD] bg-white text-[#733F49] hover:bg-[#FDF9F8] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Làm mới danh sách từ hệ thống đơn hàng"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>

            <Link
              to="/admin/mau-hop-dong"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#D9C4BD] bg-white text-[#733F49] hover:bg-[#FDF9F8] text-xs font-semibold shadow-xs transition-colors"
            >
              <Layers size={16} />
              <span>Mẫu Hợp Đồng</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5C323A] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Lập Hợp Đồng Showroom</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#EFE5E1] shadow-xs">
            <span className="text-xs text-[#8A797A] font-medium block">TỔNG HỢP ĐỒNG</span>
            <div className="text-2xl font-bold text-[#302626] mt-1">{stats.total}</div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <span>{stats.active} HĐ đang hiệu lực</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EFE5E1] shadow-xs">
            <span className="text-xs text-[#8A797A] font-medium block">CHỜ KHÁCH KÝ OTP</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</div>
            <div className="text-[11px] text-[#8A797A] mt-1">Cần nhắc nhở trước ngày fitting</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EFE5E1] shadow-xs">
            <span className="text-xs text-[#8A797A] font-medium block">ĐÃ THANH LÝ AN TOÀN</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</div>
            <div className="text-[11px] text-emerald-600 mt-1">Hoàn cọc 100% nguyên vẹn</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EFE5E1] shadow-xs">
            <span className="text-xs text-[#8A797A] font-medium block">QUỸ CỌC ĐANG BẢO LÃNH</span>
            <div className="text-xl lg:text-2xl font-bold text-[#87565C] mt-1">
              {fmtVnd(stats.totalDeposit)}
            </div>
            <div className="text-[11px] text-[#8A797A] mt-1">Tài khoản phong tỏa ngân hàng</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE5E1] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39192]" />
            <input
              type="text"
              placeholder="Tìm mã hợp đồng, tên khách hàng, số điện thoại, váy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EFE5E1] bg-[#FCF7F4] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 focus:border-[#B8737D]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Có hiệu lực' },
              { id: 'pending_signature', label: 'Chờ ký OTP' },
              { id: 'completed', label: 'Đã thanh lý' },
              { id: 'disputed', label: 'Đang xử lý cọc' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#733F49] text-white shadow-xs'
                    : 'bg-[#F9ECE8] text-[#6E5957] hover:bg-[#F2DFD9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contract Table */}
        <div className="bg-white rounded-xl border border-[#EFE5E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF5F2] border-b border-[#EFE5E1] text-[11px] font-bold text-[#7A6A6B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Hợp Đồng</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Trang Phục Thuê</th>
                  <th className="py-3.5 px-4">Thời Gian Thuê</th>
                  <th className="py-3.5 px-4">Tiền Thuê &amp; Cọc</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6EEEB]">
                {filteredContracts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FCFAF8] transition-colors group">
                    <td className="py-4 px-4 font-mono font-bold text-[#733F49] text-xs">
                      {item.id}
                      <span className="block text-[10px] text-[#A39192] font-sans font-normal mt-0.5">
                        NV: {item.staffInCharge}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#302626]">{item.customerName}</div>
                      <div className="text-xs text-[#7A6A6B] flex items-center gap-1.5 mt-0.5">
                        <Phone size={11} className="text-[#A39192]" />
                        <span>{item.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.dressImage}
                          alt={item.dressName}
                          className="w-10 h-12 object-cover rounded-md border border-[#EFE5E1] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-[#302626] truncate max-w-[180px]">
                            {item.dressName}
                          </div>
                          <div className="text-xs text-[#A39192] mt-0.5">
                            {item.dressCode} · <span className="text-[#87565C]">{item.dressSize}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-[#302626]">
                        {item.startDate} <span className="text-[#A39192]">→</span> {item.endDate}
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] text-[#A39192]">
                        {item.packageType}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-[#87565C]">
                        Thuê: {fmtVnd(item.rentalPrice)}
                      </div>
                      <div className="text-[11px] text-[#7A6A6B] mt-0.5">
                        Cọc: <span className="font-semibold">{fmtVnd(item.depositAmount)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(item.status)}
                      {item.signedAt ? (
                        <div className="text-[10px] text-[#A39192] mt-1 flex items-center gap-1">
                          <ShieldCheck size={11} className="text-emerald-600" />
                          <span>Ký: {item.signedAt}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          <span>{item.signedMethod}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="p-2 rounded-lg text-[#733F49] hover:bg-[#F5EAE6] transition-colors cursor-pointer"
                          title="Xem văn bản hợp đồng chi tiết"
                        >
                          <Eye size={17} />
                        </button>

                        {item.status === 'pending_signature' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'active')}
                            className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Xác nhận đã ký hợp đồng tại chỗ"
                          >
                            <CheckCircle2 size={17} />
                          </button>
                        )}

                        {item.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'completed')}
                            className="p-2 rounded-lg text-[#5F333B] hover:bg-[#F2E4DE] transition-colors cursor-pointer"
                            title="Thanh lý hợp đồng & Hoàn cọc"
                          >
                            <FileCheck2 size={17} />
                          </button>
                        )}

                        {item.status === 'pending_signature' && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(item)}
                            className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Gửi lại mã nhắc ký OTP qua SMS/Email"
                          >
                            <Send size={16} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedContract(item);
                            setTimeout(() => window.print(), 200);
                          }}
                          className="p-2 rounded-lg text-[#7A6A6B] hover:bg-[#F5EAE6] transition-colors cursor-pointer"
                          title="In / Xuất PDF"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#9E8B89]">
                      <FileText size={36} className="mx-auto mb-2 text-[#CBB9B4]" />
                      <p className="text-sm font-medium">Không tìm thấy hợp đồng nào phù hợp.</p>
                      <p className="text-xs text-[#B5A5A1] mt-1">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL LẬP HỢP ĐỒNG SHOWROOM MỚI */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DDD8] overflow-hidden my-6">
              <div className="px-6 py-4 bg-[#FAF5F2] border-b border-[#EFE5E1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#733F49] text-white flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#302626]">
                      Lập Hợp Đồng Thuê Váy Cưới Tại Showroom
                    </h3>
                    <p className="text-xs text-[#7A6A6B]">
                      Dành cho khách hàng thử váy và đặt thuê trực tiếp tại Atelier Suite.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-lg text-[#733F49] hover:bg-[#EFE2DE] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Họ và tên cô dâu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hoàng Ngọc Trâm"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0938 123 456"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Số CCCD / Hộ chiếu (Bảo lãnh)
                    </label>
                    <input
                      type="text"
                      placeholder="001199008877"
                      value={newIdCard}
                      onChange={(e) => setNewIdCard(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Mẫu hợp đồng áp dụng
                    </label>
                    <select
                      value={newTemplate}
                      onChange={(e) => setNewTemplate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 bg-white"
                    >
                      <option value="Hợp đồng Thuê Váy Cưới Haute Couture Tiêu Chuẩn">Haute Couture Tiêu Chuẩn (Gói 3N)</option>
                      <option value="Hợp đồng Đặt May Đo Độc Bản & Thuê Nước Đầu">May Đo Độc Bản Bespoke Nước Đầu</option>
                      <option value="Hợp đồng Thuê Lễ Phục VIP Tiệc Tối & Chụp Ảnh">VIP Tiệc Tối & Studio Ngoại Cảnh</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Chọn Mẫu Váy Cưới Thuê *
                    </label>
                    <select
                      value={selectedDressCode}
                      onChange={(e) => {
                        setSelectedDressCode(e.target.value);
                        const found = DRESS_OPTIONS.find((d) => d.code === e.target.value);
                        if (found) setSelectedDressSize(found.sizes[0]);
                      }}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 bg-white"
                    >
                      {DRESS_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.name} ({fmtVnd(opt.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Kích Thước (Size)
                    </label>
                    <select
                      value={selectedDressSize}
                      onChange={(e) => setSelectedDressSize(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 bg-white"
                    >
                      {(DRESS_OPTIONS.find((d) => d.code === selectedDressCode)?.sizes || []).map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Ngày nhận váy *
                    </label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                      Ngày hoàn trả váy *
                    </label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#594B49] uppercase mb-1">
                    Ghi chú điều khoản bổ sung / Phụ lục fitting
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Hạ eo 1cm, tặng kèm voan cài đầu 2.5m, hoàn cọc chuyển khoản ngay khi nhận lại váy..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#EFE5E1] text-sm text-[#302626] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-xs text-[#7A6A6B] flex items-center justify-between">
                  <div>
                    <span>Giá thuê niêm yết: <b>{fmtVnd(DRESS_OPTIONS.find((d) => d.code === selectedDressCode)?.price)}</b></span>
                    <span className="mx-2">·</span>
                    <span>Tiền cọc bảo lãnh: <b>{fmtVnd(DRESS_OPTIONS.find((d) => d.code === selectedDressCode)?.deposit)}</b></span>
                  </div>
                  <span className="text-[11px] font-bold text-[#733F49] uppercase">Ký trực tiếp tại chỗ</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#D9C4BD] text-xs font-semibold text-[#733F49] hover:bg-[#FDF9F8] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5C323A] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Ký &amp; Kích Hoạt Hợp Đồng Ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL XEM TRƯỚC VĂN BẢN HỢP ĐỒNG ĐIỆN TỬ */}
        {isPreviewOpen && selectedContract && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E8DDD8] overflow-hidden my-8 max-h-[90vh] flex flex-col">
              {/* Modal Top Bar */}
              <div className="px-6 py-4 bg-[#FAF5F2] border-b border-[#EFE5E1] flex items-center justify-between shrink-0 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#733F49] text-white flex items-center justify-center font-bold">
                    <FileSignature size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#302626]">
                      Văn Bản Hợp Đồng Điện Tử #{selectedContract.id}
                    </h3>
                    <p className="text-xs text-[#7A6A6B]">
                      Mẫu: {selectedContract.templateName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedContract.status === 'pending_signature' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContract.id, 'active')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Kích Hoạt Hợp Đồng</span>
                    </button>
                  )}

                  {selectedContract.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContract.id, 'completed')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#733F49] hover:bg-[#5C323A] text-white text-xs font-semibold cursor-pointer"
                    >
                      <FileCheck2 size={14} />
                      <span>Thanh Lý &amp; Hoàn Cọc</span>
                    </button>
                  )}

                  {selectedContract.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContract.id, 'disputed')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      <AlertTriangle size={14} />
                      <span>Giữ Cọc Tổn Thất</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9C4BD] text-xs font-semibold text-[#733F49] hover:bg-white bg-transparent cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>In Hợp Đồng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 rounded-lg text-[#733F49] hover:bg-[#EFE2DE] transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Legal Document Content - Printable */}
              <div
                id="printable-contract-document"
                className="p-8 sm:p-12 overflow-y-auto font-serif text-[#2B2321] leading-relaxed space-y-6 text-sm bg-white"
              >
                {/* Header Republic & Title */}
                <div className="text-center space-y-1 pb-6 border-b border-[#EFE5E1]">
                  <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#7A6A6B]">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="font-sans text-xs italic text-[#7A6A6B]">
                    Độc lập – Tự do – Hạnh phúc
                  </p>
                  <div className="w-20 h-0.5 bg-[#87565C] mx-auto my-3" />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#733F49] uppercase pt-2">
                    HỢP ĐỒNG CHO THUÊ TRANG PHỤC CƯỚI CAO CẤP
                  </h2>
                  <p className="font-sans text-xs text-[#9E8B89]">
                    Số: {selectedContract.id} / HĐ-UNIBRIDAL
                  </p>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs border border-[#F0E6E2] p-5 rounded-xl bg-[#FDFBF9]">
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-[#733F49] uppercase font-serif">
                      BÊN CHO THUÊ (BÊN A)
                    </p>
                    <p><b>Đơn vị:</b> UNIBRIDAL FLAGSHIP ATELIER HAUTE COUTURE</p>
                    <p><b>Đại diện:</b> Bà Trần Bích Ngọc - Quản lý Showroom</p>
                    <p><b>Địa chỉ:</b> 186 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, TP.HCM</p>
                    <p><b>Hotline:</b> 1900 888 2026 · <b>Mã số thuế:</b> 0317892026</p>
                  </div>

                  <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#F0E6E2] pt-4 md:pt-0 md:pl-6">
                    <p className="font-bold text-sm text-[#733F49] uppercase font-serif">
                      BÊN THUÊ (BÊN B)
                    </p>
                    <p><b>Họ và tên:</b> <span className="font-bold text-[#302626]">{selectedContract.customerName}</span></p>
                    <p><b>Số CCCD/CMND:</b> {selectedContract.idCard}</p>
                    <p><b>Số điện thoại:</b> {selectedContract.phone}</p>
                    <p><b>Địa chỉ nhận trang phục:</b> Nhận trực tiếp tại Private Suite Atelier</p>
                  </div>
                </div>

                {/* Terms of Contract */}
                <div className="space-y-4">
                  <h4 className="font-bold text-base text-[#733F49]">
                    ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI GIAN THUÊ TRANG PHỤC
                  </h4>
                  <table className="w-full text-left font-sans text-xs border border-[#EAE0DC]">
                    <thead className="bg-[#FAF5F2]">
                      <tr className="border-b border-[#EAE0DC]">
                        <th className="p-2.5">Trang phục</th>
                        <th className="p-2.5">Mã số</th>
                        <th className="p-2.5">Thông số kỹ thuật</th>
                        <th className="p-2.5">Thời gian nhận</th>
                        <th className="p-2.5">Thời gian hoàn trả</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2.5 font-bold">{selectedContract.dressName}</td>
                        <td className="p-2.5 font-mono">{selectedContract.dressCode}</td>
                        <td className="p-2.5">{selectedContract.dressSize}</td>
                        <td className="p-2.5 font-bold text-emerald-700">{selectedContract.startDate}</td>
                        <td className="p-2.5 font-bold text-[#87565C]">{selectedContract.endDate}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 className="font-bold text-base text-[#733F49] pt-2">
                    ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG &amp; TIỀN ĐẶT CỌC BẢO LÃNH
                  </h4>
                  <ul className="list-disc pl-5 font-sans text-xs space-y-1.5 text-[#594B49]">
                    <li><b>Giá thuê trọn gói:</b> {fmtVnd(selectedContract.rentalPrice)} (Đã bao gồm giặt hấp sinh học Pháp &amp; phụ kiện voan cao cấp).</li>
                    <li><b>Số tiền cọc bảo lãnh trách nhiệm:</b> {fmtVnd(selectedContract.depositAmount)}.</li>
                    <li>Số tiền cọc sẽ được hoàn trả 100% cho Bên B trong vòng 02 giờ làm việc sau khi Bên A kiểm tra tình trạng váy nguyên vẹn theo biên bản bàn giao.</li>
                  </ul>

                  <h4 className="font-bold text-base text-[#733F49] pt-2">
                    ĐIỀU 3: QUY ĐỊNH BẢO QUẢN &amp; XỬ LÝ HƯ TỔN
                  </h4>
                  <p className="font-sans text-xs text-[#594B49] leading-relaxed">
                    Bên B cam kết giữ gìn trang phục cẩn trọng, không tự ý giặt tẩy hóa chất. Trường hợp làm rách ren, cháy vải hoặc đứt gãy gọng siết eo corsetry, Bên B đồng ý chịu chi phí phục chế nguyên trạng theo bảng giá niêm yết tại Atelier hoặc trừ trực tiếp vào quỹ cọc bảo lãnh.
                  </p>

                  {selectedContract.note && (
                    <div className="p-3.5 rounded-lg bg-[#FAF5F2] border border-[#EAE0DC] font-sans text-xs text-[#733F49]">
                      <b>Phụ lục ghi chú đặc biệt:</b> {selectedContract.note}
                    </div>
                  )}
                </div>

                {/* Signatures Block */}
                <div className="pt-8 border-t border-[#EFE5E1] grid grid-cols-2 gap-8 text-center font-sans text-xs">
                  <div>
                    <p className="font-bold uppercase text-[#733F49]">ĐẠI DIỆN BÊN A (SHOWROOM)</p>
                    <p className="text-[#A39192] italic mt-1">Đã ký bằng chữ ký số Atelier</p>
                    <div className="h-20 flex items-center justify-center">
                      <div className="border border-emerald-500 rounded-lg p-2 bg-emerald-50 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1.5">
                        <ShieldCheck size={16} />
                        <span>VERIFIED BY UNIBRIDAL CA</span>
                      </div>
                    </div>
                    <p className="font-bold text-[#302626]">{selectedContract.staffInCharge}</p>
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[#733F49]">ĐẠI DIỆN BÊN B (KHÁCH HÀNG)</p>
                    <p className="text-[#A39192] italic mt-1">
                      {selectedContract.signedAt ? 'Xác thực định danh eKYC & SmartOTP' : 'Chưa thực hiện ký điện tử'}
                    </p>
                    <div className="h-20 flex items-center justify-center">
                      {selectedContract.signedAt ? (
                        <div className="border border-emerald-500 rounded-lg p-2 bg-emerald-50 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          <span>E-SIGNED: {selectedContract.customerName}</span>
                        </div>
                      ) : (
                        <div className="border border-dashed border-amber-400 rounded-lg p-2 bg-amber-50 text-amber-700 text-xs">
                          Chờ khách hàng nhập mã OTP xác thực
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-[#302626]">{selectedContract.customerName}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#FAF5F2] border-t border-[#EFE5E1] flex items-center justify-between shrink-0 no-print">
                <span className="text-xs text-[#7A6A6B]">
                  Hợp đồng lưu trữ bảo mật trên Blockchain Ledger UniBridal.
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#733F49] text-white font-semibold text-xs hover:bg-[#5C323A] transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
