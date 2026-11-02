import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Search,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Snowflake,
  Droplets,
  Wrench,
  Gem,
  MoreVertical,
  Download,
  FileSpreadsheet,
  Check,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';
import HangerIcon from '../../components/common/HangerIcon';
import ShelvesIcon from '../../components/common/ShelvesIcon';
import { useAuth } from '../../contexts/AuthContext';
import { getAllDresses } from '../../services/dressService';

import card1Elysian from '../../assets/card1_elysian.jpg';
import card2Celeste from '../../assets/card2_celeste.jpg';
import card3Lumiere from '../../assets/card3_lumiere.jpg';
import card4Monet from '../../assets/card4_monet.jpg';
import card5Aurora from '../../assets/card5_aurora.jpg';
import card6Seraphina from '../../assets/card6_seraphina.jpg';

const PAGE_SIZE = 6;

export default function InventoryManagement() {
  const { user } = useAuth();
  const currentInspectorName = user?.fullName || user?.name || 'Bích Ngọc';

  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form thêm sản phẩm kho mới
  const [newName, setNewName] = useState('');
  const [newCollection, setNewCollection] = useState('ATELIER COUTURE 2026');
  const [newLocation, setNewLocation] = useState('Tủ Treo A2 - Kệ 01');
  const [newRfid, setNewRfid] = useState('');
  const [newConditionType, setNewConditionType] = useState('cold');
  const [newDescription, setNewDescription] = useState('');
  const [newSizeS, setNewSizeS] = useState(1);
  const [newSizeM, setNewSizeM] = useState(1);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Đồng bộ toàn bộ 50 mẫu váy từ cơ sở dữ liệu thực vào Quản lý kho
  useEffect(() => {
    let active = true;
    getAllDresses()
      .then((res) => {
        if (!active) return;
        const dbDresses = res?.data;
        if (Array.isArray(dbDresses) && dbDresses.length > 0) {
          const shelves = ['KỆ A1 - TẦNG 2', 'KỆ B2 - TẦNG 1', 'KỆ C1 - TẦNG 3', 'KỆ VIP - SẢNH TRƯỚC', 'KỆ D3 - TẦNG 2'];
          const conditions = [
            { type: 'cold', text: 'Kho Lạnh Tơ Tằm (19°C)' },
            { type: 'humidity', text: 'Kho Chống Ẩm Cao Cấp' },
            { type: 'diamond', text: 'Kho Kim Hoàn & Đính Kết VIP' }
          ];
          const mapped = dbDresses.map((d, index) => {
            const num = (index + 1).toString().padStart(2, '0');
            const code = d.code || `UB-${(index + 1).toString().padStart(3, '0')}`;
            const shelf = shelves[index % shelves.length];
            const cond = conditions[index % conditions.length];
            const statusType = index % 8 === 0 ? 'drying' : index % 7 === 0 ? 'pending' : index % 3 === 0 ? 'ready' : 'stored';
            const statusText = statusType === 'stored' ? 'ĐẠT CHUẨN LƯU KHO'
              : statusType === 'ready' ? 'SẴN SÀNG XUẤT GIAO'
              : statusType === 'drying' ? 'GIẶT SẤY NHIỆT THẤP'
              : 'CHỜ KIỂM ĐỊNH';

            const rawSizes = Array.isArray(d.sizes) && d.sizes.length > 0 ? d.sizes : ['S', 'M'];
            const mappedSizes = rawSizes.map((sz) => ({
              label: typeof sz === 'object' && sz?.label ? sz.label : `Size ${typeof sz === 'object' ? (sz?.size || 'S') : sz} (2 bộ)`
            }));
            
            return {
              id: d._id || d.id || `inv_${index + 1}`,
              code: `KHÔ-${code}`,
              name: d.name,
              collection: d.collection || 'ATELIER HAUTE COUTURE 2026',
              rfid: `#RF-2026-${(index + 1).toString().padStart(4, '0')}`,
              location: shelf,
              conditionType: cond.type,
              conditionText: cond.text,
              statusType,
              statusText,
              stock: mappedSizes.length * 2,
              sizes: mappedSizes,
              totalUnits: `Tổng: ${String(mappedSizes.length * 2).padStart(2, '0')} bộ`,
              description: d.description || 'Lễ phục cưới cao cấp UniBridal Haute Couture',
              price: d.rentPrice || d.price || 5000000,
              inspector: `Bởi: ${currentInspectorName}`,
              inspectDate: 'Hôm nay',
              inspectNote: 'Phom dáng 100% nguyên vẹn',
              inspectNoteColor: 'green',
              image: (d.images && d.images[0]) || d.image || `/assets/dresses/dress_${num}.jpg`,
            };
          });
          setItems(mapped);
          setError('');
        } else {
          setItems([]);
          setError('Không có dữ liệu váy cưới trong cơ sở dữ liệu kho hàng.');
        }
      })
      .catch((err) => {
        if (!active) return;
        setItems([]);
        setError('Lỗi kết nối cơ sở dữ liệu: Không thể tải danh sách kho hàng từ máy chủ MongoDB.');
      });
    return () => { active = false; };
  }, [currentInspectorName]);

  const statusOptions = [
    { value: 'all', label: 'Tất Cả Tình Trạng' },
    { value: 'stored', label: 'Đạt chuẩn lưu kho' },
    { value: 'ready', label: 'Sẵn sàng xuất giao' },
    { value: 'drying', label: 'Giặt sấy nhiệt thấp' },
    { value: 'pending', label: 'Chờ kiểm định sau thuê' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'all' || item.statusType === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, activePage]);

  // Reset về page 1 nếu filter thay đổi
  useEffect(() => {
    setActivePage(1);
  }, [searchTerm, statusFilter]);

  // Cập nhật tình trạng của một váy trong kho
  const handleUpdateItemStatus = (itemId, newStatusType, newStatusText) => {
    const updated = items.map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          statusType: newStatusType,
          statusText: newStatusText,
          inspectDate: new Date().toLocaleDateString('vi-VN'),
          inspector: `Bởi: ${currentInspectorName}`
        };
      }
      return it;
    });
    setItems(updated);
    try { localStorage.setItem('unibridal_inventory_local', JSON.stringify(updated)); } catch {}
    setActionMenuOpenId(null);
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem((prev) => ({
        ...prev,
        statusType: newStatusType,
        statusText: newStatusText,
        inspectDate: new Date().toLocaleDateString('vi-VN'),
        inspector: `Bởi: ${currentInspectorName}`
      }));
    }
    showToast(`Đã cập nhật trạng thái kho: ${newStatusText}`);
  };

  // Xác nhận kiểm kê đạt chuẩn
  const handleConfirmInspection = (item) => {
    handleUpdateItemStatus(item.id, 'stored', 'ĐẠT CHUẨN LƯU KHO');
    showToast(`Đã hoàn tất kiểm định phom dáng & sợi vải cho tác phẩm: ${item.name}!`);
  };

  // Xử lý nộp phiếu nhập kho mới
  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Vui lòng nhập tên mẫu váy cưới.');
      return;
    }

    const conditionMap = {
      cold: 'Kho Lạnh Tơ Tằm (19°C)',
      humidity: 'Kho Chống Ẩm Cao Cấp',
      restore: 'Bảo Dưỡng Phục Hồi Riêng',
      diamond: 'Kho Kim Hoàn & Đính Kết VIP'
    };

    const newCode = `KHÔ-${newCollection.slice(0, 4).toUpperCase()}-${String(items.length + 1).padStart(2, '0')}`;
    const rfidVal = newRfid.trim() || `RFID: #RF-${Math.floor(1000 + Math.random() * 9000)}-${newLocation.slice(0, 2).toUpperCase()}`;

    const totalCount = Number(newSizeS || 0) + Number(newSizeM || 0);

    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      code: newCode,
      collection: newCollection.trim(),
      image: card1Elysian,
      location: newLocation.trim(),
      rfid: rfidVal,
      conditionType: newConditionType,
      conditionText: conditionMap[newConditionType] || 'Kho Lạnh Tơ Tằm (19°C)',
      description: newDescription.trim() || 'Lễ phục cưới cao cấp bảo quản tiêu chuẩn vi khí hậu.',
      sizes: [
        { label: `Size S: ${String(newSizeS).padStart(2, '0')}` },
        { label: `Size M: ${String(newSizeM).padStart(2, '0')}` },
      ],
      totalUnits: `Tổng: ${String(totalCount).padStart(2, '0')} bộ`,
      statusText: 'ĐẠT CHUẨN LƯU KHO',
      statusType: 'stored',
      inspectDate: new Date().toLocaleDateString('vi-VN'),
      inspector: `Bởi: ${currentInspectorName}`,
      inspectNote: 'Nhập kho mới 10/10',
      inspectNoteColor: 'green',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    try { localStorage.setItem('unibridal_inventory_local', JSON.stringify(updated)); } catch {}

    setIsAddModalOpen(false);
    setNewName('');
    setNewDescription('');
    setNewRfid('');
    showToast(`Đã nhập kho thành công thiết kế ${newItem.name} với mã ${newItem.code}!`);
  };

  // Xuất file bảng kiểm kê CSV
  const handleExportCsv = () => {
    try {
      const headers = ['Mã Kho', 'Tên Váy', 'Bộ Sưu Tập', 'Vị Trí Tủ Kệ', 'Thẻ RFID', 'Điều Kiện Bảo Quản', 'Tình Trạng', 'Lần Kiểm Kê Gần Nhất', 'Người Kiểm Định'];
      const rows = items.map((it) => [
        `"${it.code}"`,
        `"${it.name}"`,
        `"${it.collection}"`,
        `"${it.location}"`,
        `"${it.rfid}"`,
        `"${it.conditionText}"`,
        `"${it.statusText}"`,
        `"${it.inspectDate}"`,
        `"${it.inspector}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bang_Kiem_Ke_Kho_UniBridal_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã xuất thành công file kiểm kê kho UniBridal (.csv)!');
    } catch {
      showToast('Có lỗi xảy ra khi xuất file.');
    }
  };

  const selectedFilterLabel =
    statusOptions.find((opt) => opt.value === statusFilter)?.label ||
    'Tất Cả Tình Trạng';

  // Dynamic counts for top cards
  const totalCount = items.length;
  const readyCount = items.filter((i) => i.statusType === 'ready').length;
  const storedCount = items.filter((i) => i.statusType === 'stored').length;
  const dryingCount = items.filter((i) => i.statusType === 'drying').length;
  const pendingCount = items.filter((i) => i.statusType === 'pending').length;

  return (
    <AdminLayout activeMenu="inventory">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#302626] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-amber-900/30">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠️ Lỗi kết nối Cơ sở dữ liệu:</span> {error}
        </div>
      )}
      {/* Page Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#B8737D] mb-3" />
          <h1 className="font-playfair text-[32px] md:text-[38px] font-bold text-[#5F2B36] tracking-tight mb-2">
            Quản Lý Kho Hàng &amp; Sản Phẩm
          </h1>
          <p className="text-[13.5px] text-[#7A6B6C] font-normal leading-relaxed max-w-4xl">
            Giám sát kiểm định phom dáng, điều phối tủ treo bảo quản lạnh/chống ẩm vi khí hậu chuyên dụng, theo dõi lịch sử giặt hấp phục hồi xơ sợi tơ tằm và kiểm kê vật tư phụ kiện hạt cườm, pha lê thủ công.
          </p>
        </div>

        {/* Action buttons */}
        <div className="pt-2 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D9C4BD] bg-white text-[#733F49] hover:bg-[#FDF9F8] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Xuất danh sách kiểm kê kho ra file Excel"
          >
            <Download size={15} />
            <span>Xuất Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5C3038] text-white text-xs font-bold tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>NHẬP KHO MỚI</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDCE1_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                TỔNG LỄ PHỤC TRONG KHO
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#FDECEE] flex items-center justify-center text-[#B8737D]">
                <HangerIcon size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#2C2523] leading-none">
                {totalCount}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">
                mẫu váy lưu kho
              </span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#1E8347] font-medium">
            <span>{storedCount} thiết kế đạt chuẩn lưu kho</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#DEF5E7_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                SẴN SÀNG XUẤT GIAO
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#229A53]">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#2C2523] leading-none">
                {readyCount}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">
                thiết kế ({totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#6A5B5C]">
            <Check size={14} className="text-[#229A53]" />
            <span>Đạt chuẩn vệ sinh tơ tằm &amp; hấp phom</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FEEBD0_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐANG BẢO DƯỠNG / GIẶT HẤP
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#FEF2E6] flex items-center justify-center text-[#D97706]">
                <HangerIcon size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#2C2523] leading-none">
                {dryingCount}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">
                bộ đang xử lý
              </span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#6A5B5C]">
            <Clock size={14} className="text-[#D97706]" />
            <span>Xử lý giặt sấy nhiệt thấp vi khí hậu</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDFD9_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                CHỜ KIỂM ĐỊNH SAU THUÊ
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#FDECEE] flex items-center justify-center text-[#D03B3B]">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#D03B3B] leading-none">
                {pendingCount}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">
                váy mới thu hồi
              </span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1 text-[12px] text-[#C93B3B] font-medium">
            <span>Cần kiểm định ren &amp; gọng siết eo</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Card Container */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4 shadow-xs mb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8B8C]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã váy, tên thiết kế, vị trí tủ treo, mô tả chất liệu..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FFF6F3] border border-[#F4E8E3] focus:border-[#B8737D] focus:bg-white text-[13.5px] text-[#2C2523] placeholder-[#A39293] outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39293] hover:text-[#5F333B] cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Filter Right Aligned inside card */}
        <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
          {/* Climate / Điều Kiện Kho Pill Badges Row */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-bold text-[#3C3133] tracking-wider uppercase mr-1">
              TIÊU CHUẨN KHO:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EBE6] text-[#3A2E30] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              Nhiệt độ 18°C – 21°C
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EBE6] text-[#3A2E30] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              Độ ẩm 45% – 50%
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EBE6] text-[#3A2E30] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              Khử khuẩn Ion Âm
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-[#FAF2EE] border border-[#EFE2DC] text-[12.5px] text-[#554748] font-medium hover:bg-[#F3E7E2] transition-colors cursor-pointer"
            >
              <span>{selectedFilterLabel}</span>
              <ChevronDown
                size={14}
                className={`text-[#8C7D7E] transition-transform ${
                  filterDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-[#EFE5E1] py-1.5 z-20 animate-fadeIn">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-[13px] transition-colors cursor-pointer ${
                      statusFilter === opt.value
                        ? 'bg-[#F9EDE9] text-[#733F49] font-bold'
                        : 'bg-transparent text-[#5F4E50] hover:bg-[#FAF5F2]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3]">
                <th className="py-4 px-4 sm:px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[22%] min-w-[190px]">
                  SẢN PHẨM &amp; MÃ LỄ PHỤC
                </th>
                <th className="py-4 px-3 sm:px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[23%] min-w-[200px]">
                  VỊ TRÍ KHO &amp; KỆ TREO
                </th>
                <th className="py-4 px-3 sm:px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[14%] min-w-[130px]">
                  PHÂN LOẠI &amp; TỒN SIZE
                </th>
                <th className="py-4 px-3 sm:px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[15%] min-w-[140px]">
                  TÌNH TRẠNG LƯU KHO
                </th>
                <th className="py-4 px-3 sm:px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[15%] min-w-[140px]">
                  LẦN KIỂM KÊ
                </th>
                <th className="py-4 px-3 pr-5 sm:pr-6 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[11%] min-w-[110px]">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6EDE9]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7D7E] text-sm">
                    Không tìm thấy sản phẩm kho nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FCF9F7] transition-colors"
                    >
                      {/* Col 1: Sản phẩm */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#EFE5E1] shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedItem(item)}
                          />
                          <div className="flex flex-col gap-1 items-start">
                            <div
                              onClick={() => setSelectedItem(item)}
                              className="font-jakarta text-[14.5px] font-bold text-[#2C2523] hover:text-[#B8737D] cursor-pointer transition-colors leading-tight"
                            >
                              {item.name}
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F6EDE8] text-[#846E63] font-mono text-[10.5px] font-semibold leading-none">
                              {item.code}
                            </span>
                            <div className="text-[10px] font-bold text-[#A39293] tracking-wider uppercase leading-none">
                              {item.collection}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Vị trí kho & Kệ treo */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1 whitespace-nowrap">
                          <ShelvesIcon size={16} className="text-[#8A4650] shrink-0" />
                          <span className="font-bold text-[#2C2523] text-[13px] whitespace-nowrap">
                            {item.location}
                          </span>
                          <span className="px-1.5 py-0.5 rounded border border-[#E8DCD7] text-[#8C7D7E] font-mono text-[10px] whitespace-nowrap shrink-0">
                            {item.rfid}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] font-semibold mb-0.5 whitespace-nowrap">
                          {item.conditionType === 'cold' && (
                            <>
                              <Snowflake size={13} className="text-[#2563EB]" />
                              <span className="text-[#2563EB]">{item.conditionText}</span>
                            </>
                          )}
                          {item.conditionType === 'humidity' && (
                            <>
                              <Droplets size={13} className="text-[#0284C7]" />
                              <span className="text-[#0284C7]">{item.conditionText}</span>
                            </>
                          )}
                          {item.conditionType === 'restore' && (
                            <>
                              <Wrench size={13} className="text-[#D97706]" />
                              <span className="text-[#D97706]">{item.conditionText}</span>
                            </>
                          )}
                          {item.conditionType === 'diamond' && (
                            <>
                              <Gem size={13} className="text-[#D97706]" />
                              <span className="text-[#D97706]">{item.conditionText}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11.5px] text-[#8A797A]">
                          {item.description}
                        </div>
                      </td>

                      {/* Col 3: Phân loại & Tồn size (Căn giữa) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1 mb-1">
                          {(Array.isArray(item.sizes) ? item.sizes : []).map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2.5 py-0.5 rounded bg-[#FBEBE7] text-[#8A4650] font-semibold text-[11px] text-center"
                            >
                              {typeof s === 'object' && s?.label ? s.label : `Size ${s}`}
                            </span>
                          ))}
                          {item.outOfStockSize && (
                            <span className="text-[11px] font-semibold text-[#D03B3B] text-center">
                              {item.outOfStockSize}
                            </span>
                          )}
                        </div>
                        {item.totalUnits && (
                          <div className="text-[11px] text-[#8C7D7E] text-center">
                            {item.totalUnits}
                          </div>
                        )}
                      </td>

                      {/* Col 4: Tình trạng (Capsule badge nằm ngang) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {item.statusType === 'stored' && (
                          <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap bg-[#EAF8EE] text-[#1E8347]">
                            Đạt Chuẩn Lưu Kho
                          </span>
                        )}
                        {item.statusType === 'ready' && (
                          <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap bg-[#FEF3E8] text-[#D97706]">
                            Sẵn Sàng Xuất Giao
                          </span>
                        )}
                        {item.statusType === 'drying' && (
                          <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap bg-[#FFF4E6] text-[#C05621]">
                            Giặt Sấy Nhiệt Thấp
                          </span>
                        )}
                        {item.statusType === 'pending' && (
                          <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase whitespace-nowrap bg-[#F5EEFA] text-[#7E3AF2]">
                            Chờ Kiểm Định Sau Thuê
                          </span>
                        )}
                      </td>

                      {/* Col 5: Lần kiểm kê */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#2C2523] text-[12.5px] leading-tight whitespace-nowrap">
                          {item.inspectDate}
                        </div>
                        <div className="text-[11px] text-[#8C7D7E] mt-0.5 whitespace-nowrap">
                          {item.inspector}
                        </div>
                        <div
                          className={`text-[11.5px] font-semibold mt-0.5 whitespace-nowrap ${
                            item.inspectNoteColor === 'green'
                              ? 'text-[#1E8347]'
                              : item.inspectNoteColor === 'orange'
                              ? 'text-[#C05621]'
                              : 'text-[#7E3AF2]'
                          }`}
                        >
                          {item.inspectNote}
                        </div>
                      </td>

                      {/* Col 6: Thao tác */}
                      <td className="py-4 px-3 pr-5 sm:pr-6 text-center whitespace-nowrap">
                        <div className="relative inline-flex items-center justify-center gap-1.5 text-[#736364]">
                          <button
                            type="button"
                            onClick={() => handleConfirmInspection(item)}
                            title="Xác nhận kiểm kê đạt chuẩn 10/10"
                            className="p-1.5 rounded-lg hover:bg-[#F3E7E3] hover:text-[#733F49] transition-colors cursor-pointer"
                          >
                            <ClipboardCheck size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            title="Xem chi tiết hồ sơ bảo quản"
                            className="p-1.5 rounded-lg hover:bg-[#F3E7E3] hover:text-[#733F49] transition-colors cursor-pointer"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActionMenuOpenId(
                                actionMenuOpenId === item.id ? null : item.id
                              )
                            }
                            title="Chuyển trạng thái quy trình"
                            className="p-1.5 rounded-lg hover:bg-[#F3E7E3] hover:text-[#733F49] transition-colors cursor-pointer"
                          >
                            <MoreVertical size={17} />
                          </button>

                          {/* Action Popover Menu */}
                          {actionMenuOpenId === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-[#EFE5E1] py-1.5 z-30 text-left">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'ready', 'SẴN SÀNG XUẤT GIAO')}
                                className="w-full px-3.5 py-2 text-xs text-[#1E8347] hover:bg-[#EAF8EE] font-semibold block text-left transition-colors cursor-pointer"
                              >
                                ✓ Chuyển Sẵn Sàng Xuất Giao
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'drying', 'GIẶT SẤY NHIỆT THẤP')}
                                className="w-full px-3.5 py-2 text-xs text-[#C05621] hover:bg-[#FFF4E6] font-semibold block text-left transition-colors cursor-pointer"
                              >
                                ♨ Chuyển Giặt Hấp Nhiệt Thấp
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'pending', 'CHỜ KIỂM ĐỊNH SAU THUÊ')}
                                className="w-full px-3.5 py-2 text-xs text-[#7E3AF2] hover:bg-[#F5EEFA] font-semibold block text-left transition-colors cursor-pointer"
                              >
                                ⏱ Đưa Vào Hàng Đợi Kiểm Định
                              </button>
                              <div className="h-px bg-[#F0E6E2] my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  showToast(`Đã kích hoạt quét RFID xác thực vị trí: ${item.location}`);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-[#5F4E50] hover:bg-[#FAF5F2] hover:text-[#733F49] block text-left transition-colors cursor-pointer"
                              >
                                Hiệu chuẩn thẻ RFID
                              </button>
                            </div>
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

        {/* Footer / Pagination */}
        <div className="py-4 px-6 border-t border-[#F0E6E2] bg-[#FAF2EE] rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-[12.5px] text-[#7A6B6C]">
            <span>
              Hiển thị <span className="font-medium text-[#2C2523]">
                {filteredItems.length > 0 ? (activePage - 1) * PAGE_SIZE + 1 : 0} - {Math.min(activePage * PAGE_SIZE, filteredItems.length)}
              </span> trong tổng số{' '}
              <span className="font-medium text-[#2C2523]">{filteredItems.length}</span> thiết kế lễ phục trong kho
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-[13px]">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setActivePage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      activePage === pageNum
                        ? 'bg-[#78434D] text-white shadow-xs'
                        : 'bg-white border border-[#EFE5E1] shadow-2xs text-[#4A3B3D] hover:bg-[#F5ECE8]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Details / Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl lg:max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EFE5E1] flex flex-col sm:flex-row relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#FAF2EE] text-[#7A6B6C] hover:bg-[#F2E3DC] hover:text-[#733F49] flex items-center justify-center transition-colors z-20 border-0 cursor-pointer shadow-2xs"
              title="Đóng cửa sổ"
            >
              <X size={16} />
            </button>

            {/* Left: Image Panel */}
            <div className="w-full sm:w-[42%] lg:w-[45%] relative bg-[#FAF5F2] shrink-0 overflow-hidden min-h-[260px] sm:min-h-[380px]">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded-lg bg-[#733F49]/90 backdrop-blur-xs text-white text-[11px] font-mono font-bold tracking-wider shadow-xs">
                {selectedItem.code}
              </div>
            </div>

            {/* Right: Information Panel */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8737D]">
                  {selectedItem.collection}
                </span>
                <h3 className="font-playfair text-[22px] sm:text-[24px] font-bold text-[#68353E] mb-1 pr-6 leading-tight mt-0.5">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-[#8A797A] mb-4">
                  {selectedItem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2]">
                    <span className="text-[#8C7D7E] block mb-1">Vị trí tủ treo:</span>
                    <div className="font-bold text-[#2C2523]">
                      {selectedItem.location}
                    </div>
                    <div className="text-[10.5px] text-[#8C7D7E] mt-0.5 font-mono">
                      {selectedItem.rfid}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2]">
                    <span className="text-[#8C7D7E] block mb-1">Chế độ vi khí hậu:</span>
                    <div className="font-bold text-[#2563EB]">
                      {selectedItem.conditionText}
                    </div>
                    <div className="text-[10.5px] text-[#1E8347] mt-0.5 font-semibold">
                      Kiểm soát tự động 24/7
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2] mb-5 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[#8C7D7E] block">Tình trạng kiểm kê:</span>
                    <span className="font-bold text-[#1E8347]">
                      {selectedItem.statusText || 'ĐẠT CHUẨN LƯU KHO'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8C7D7E] block">Kiểm định gần nhất:</span>
                    <span className="font-semibold text-[#2C2523]">
                      {selectedItem.inspectDate} ({selectedItem.inspector})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EFE5E1] text-xs font-bold text-[#5F4E50] hover:bg-[#FAF5F2] transition-colors bg-transparent cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmInspection(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#733F49] text-xs font-bold text-white hover:bg-[#5C3038] shadow-xs transition-colors border-0 cursor-pointer"
                >
                  Xác Nhận Đạt Chuẩn 10/10
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập Kho Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EFE5E1]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0E6E2]">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#733F49]" />
                <h3 className="font-playfair text-xl font-bold text-[#68353E]">
                  Nhập Kho Lễ Phục Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#9A8B8C] hover:text-[#5F333B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Tên Tác Phẩm / Mẫu Váy Cưới *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Juliette Royal Velvet"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Bộ Sưu Tập
                  </label>
                  <input
                    type="text"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Vị Trí Tủ Treo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tủ Treo A2 - Kệ 01"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Mã RFID Chip (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Tự sinh nếu bỏ trống"
                    value={newRfid}
                    onChange={(e) => setNewRfid(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Chế Độ Vi Khí Hậu Bảo Quản
                  </label>
                  <select
                    value={newConditionType}
                    onChange={(e) => setNewConditionType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  >
                    <option value="cold">Kho Lạnh Tơ Tằm (18°C – 20°C)</option>
                    <option value="humidity">Kho Chống Ẩm Cao Cấp (45% – 50%)</option>
                    <option value="restore">Bảo Dưỡng Phục Hồi Riêng</option>
                    <option value="diamond">Kho Kim Hoàn &amp; Đính Kết VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Số lượng Size S
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSizeS}
                    onChange={(e) => setNewSizeS(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Số lượng Size M
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSizeM}
                    onChange={(e) => setNewSizeM(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Mô Tả Kỹ Thuật / Phom Dáng &amp; Ren
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Ren hoa 3D, tơ tằm Pháp mật độ cao, phom corsetry siết eo..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EFE5E1] font-bold text-[#5F4E50] hover:bg-[#FAF5F2] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#733F49] font-bold text-white hover:bg-[#5C3038] shadow-xs cursor-pointer"
                >
                  Xác Nhận Nhập Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
