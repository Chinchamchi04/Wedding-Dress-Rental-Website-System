import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Search,
  Plus,
  Network,
  Tag,
  Shirt,
  SlidersHorizontal,
  Pencil,
  Eye,
  Check,
  X,
  ListFilter,
  Layers,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import HangerIcon from '../../components/common/HangerIcon';

// 12 Initial categories matching the screenshot
const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Công Chúa Bồng Xòe (Ballgown)',
    subtitle: 'Xòe lớn hoàng gia, lộng lẫy',
    group: 'PHOM DÁNG',
    groupKey: 'silhouette',
    gownCount: 24,
    priceSegment: '5 - 18 triệu',
    position: '#1',
    orderNum: 1,
    isActive: true,
    hasSpark: true,
    description: 'Thiết kế xòe bồng công chúa kinh điển với khung corsetry định hình eo con kiến và chân váy tơ tằm nhiều tầng.'
  },
  {
    id: 2,
    name: 'Đuôi Cá Điêu Khắc (Mermaid)',
    subtitle: 'Ôm sát tôn đường cong quyến rũ',
    group: 'PHOM DÁNG',
    groupKey: 'silhouette',
    gownCount: 18,
    priceSegment: '8 - 25 triệu',
    position: '#2',
    orderNum: 2,
    isActive: true,
    hasSpark: false,
    description: 'Cắt may theo tỷ lệ vàng cơ thể người phụ nữ Á Đông, tôn trọn vẹn 3 vòng đồng hồ cát kiêu sa.'
  },
  {
    id: 3,
    name: 'Chữ A Thanh Lịch (A-line)',
    subtitle: 'Duyên dáng, phù hợp mọi vóc dáng',
    group: 'PHOM DÁNG',
    groupKey: 'silhouette',
    gownCount: 16,
    priceSegment: '4.5 - 15 triệu',
    position: '#3',
    orderNum: 3,
    isActive: true,
    hasSpark: false,
    description: 'Phom váy chữ A thanh thoát, che khuyết điểm hoàn hảo và tạo cảm giác nhẹ nhàng, bay bổng khi di chuyển.'
  },
  {
    id: 4,
    name: 'Satin Suông Tối Giản (Minimal Slip)',
    subtitle: 'Thanh thoát, nhẹ nhàng, vượt thời gian',
    group: 'PHOM DÁNG',
    groupKey: 'silhouette',
    gownCount: 12,
    priceSegment: '3.8 - 9.5 triệu',
    position: '#4',
    orderNum: 4,
    isActive: true,
    hasSpark: false,
    description: 'Phong cách tối giản Minimalism với chất liệu lụa satin thượng hạng không họa tiết, tôn nét thanh tú thuần khiết.'
  },
  {
    id: 5,
    name: 'Ren Chantilly & Guipure Pháp',
    subtitle: 'Dệt thủ công từ vùng Caudry miền bắc nước Pháp',
    group: 'CHẤT LIỆU',
    groupKey: 'material',
    gownCount: 22,
    priceSegment: 'Haute Couture',
    position: '#5',
    orderNum: 5,
    isActive: true,
    hasSpark: true,
    description: 'Loại ren dệt tay trứ danh thế giới được các hoàng gia Châu Âu ưa chuộng suốt hàng trăm năm.'
  },
  {
    id: 6,
    name: 'Lụa Mikado Hoàng Gia Nhật Bản',
    subtitle: 'Độ đứng phom chuẩn tỷ lệ corsetry hoàng gia',
    group: 'CHẤT LIỆU',
    groupKey: 'material',
    gownCount: 15,
    priceSegment: 'Premium Silk',
    position: '#6',
    orderNum: 6,
    isActive: true,
    hasSpark: false,
    description: 'Sợi lụa Mikado cao cấp với bề mặt bóng mịn, độ dày dặn đứng phom giúp định hình khung eo sắc nét.'
  },
  {
    id: 7,
    name: 'Voan Tơ Tằm Organza 3D',
    subtitle: 'Hiệu ứng xếp lớp bồng bềnh tựa mây trời',
    group: 'CHẤT LIỆU',
    groupKey: 'material',
    gownCount: 14,
    priceSegment: 'Artisan 3D',
    position: '#7',
    orderNum: 7,
    isActive: true,
    hasSpark: false,
    description: 'Kỹ thuật dập hoa 3D nổi và xếp ly thủ công tinh xảo trên nền voan tơ tằm tự nhiên 100%.'
  },
  {
    id: 8,
    name: 'Tulle Kim Tuyến Ánh Sao (Starlight)',
    subtitle: 'Bắt sáng lấp lánh dưới ánh đèn dạ tiệc sân khấu',
    group: 'CHẤT LIỆU',
    groupKey: 'material',
    gownCount: 11,
    priceSegment: 'Sparkle Glam',
    position: '#8',
    orderNum: 8,
    isActive: true,
    hasSpark: false,
    description: 'Các hạt vi kim sa pha lê Swarovski được phủ nhiệt đa chiều tạo hiệu ứng bầu trời ngàn sao rực rỡ.'
  },
  {
    id: 9,
    name: 'Gói Tiết Kiệm (Dưới 5 Triệu)',
    subtitle: 'Phù hợp chụp studio hoặc tiệc cưới thân mật',
    group: 'GIÁ THUÊ',
    groupKey: 'price',
    gownCount: 18,
    priceSegment: 'Budget Friendly',
    position: '#9',
    orderNum: 9,
    isActive: true,
    hasSpark: false,
    description: 'Phân khúc giá tối ưu chi phí nhưng vẫn đảm bảo tiêu chuẩn làm sạch và hấp sấy vô trùng công nghiệp.'
  },
  {
    id: 10,
    name: 'Gói Tiêu Chuẩn (5 - 12 Triệu)',
    subtitle: 'Phân khúc phổ biến nhất được các cô dâu lựa chọn',
    group: 'GIÁ THUÊ',
    groupKey: 'price',
    gownCount: 32,
    priceSegment: 'Signature Collection',
    position: '#10',
    orderNum: 10,
    isActive: true,
    hasSpark: true,
    description: 'Dòng váy cưới Signature đa dạng mẫu mã, cập nhật xu hướng thời trang cưới mới nhất trong năm.'
  },
  {
    id: 11,
    name: 'Gói Cao Cấp (12 - 25 Triệu)',
    subtitle: 'Thiết kế độc quyền, ren nhập khẩu nguyên tấm',
    group: 'GIÁ THUÊ',
    groupKey: 'price',
    gownCount: 24,
    priceSegment: 'Luxury Bridal',
    position: '#11',
    orderNum: 11,
    isActive: true,
    hasSpark: false,
    description: 'Dòng sản phẩm cao cấp đính kết pha lê thủ công hàng trăm giờ từ các nghệ nhân lành nghề UniBridal.'
  },
  {
    id: 12,
    name: 'Gói May Đo Độc Bản (Trên 25 Triệu)',
    subtitle: 'Thiết kế theo số đo riêng và độc quyền ngày cưới',
    group: 'GIÁ THUÊ',
    groupKey: 'price',
    gownCount: 12,
    priceSegment: 'Bespoke Royalty',
    position: '#12',
    orderNum: 12,
    isActive: true,
    hasSpark: true,
    description: 'Dịch vụ bespoke thiết kế riêng biệt 1-1 cùng Giám đốc Sáng tạo, độc quyền bản quyền trên toàn cầu.'
  }
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState('all'); // all, silhouette, material, price
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    group: 'PHOM DÁNG',
    groupKey: 'silhouette',
    gownCount: 10,
    priceSegment: '',
    orderNum: 13,
    isActive: true,
    description: ''
  });

  // Toggle active switch
  const handleToggleActive = (id) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const nextState = !cat.isActive;
          showToast(
            nextState
              ? `Đã kích hoạt hiển thị phân mục "${cat.name}" trên bộ lọc`
              : `Đã tắt hiển thị phân mục "${cat.name}" khỏi bộ lọc`
          );
          return { ...cat, isActive: nextState };
        }
        return cat;
      })
    );
  };

  // Counts
  const counts = useMemo(() => {
    return {
      all: categories.length,
      silhouette: categories.filter((c) => c.groupKey === 'silhouette').length,
      material: categories.filter((c) => c.groupKey === 'material').length,
      price: categories.filter((c) => c.groupKey === 'price').length
    };
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Tab filter
      if (activeTab !== 'all' && cat.groupKey !== activeTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.subtitle.toLowerCase().includes(q) ||
          cat.group.toLowerCase().includes(q) ||
          cat.priceSegment.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [categories, activeTab, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      subtitle: cat.subtitle,
      group: cat.group,
      groupKey: cat.groupKey,
      gownCount: cat.gownCount,
      priceSegment: cat.priceSegment,
      orderNum: cat.orderNum,
      isActive: cat.isActive,
      description: cat.description || ''
    });
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập Tên danh mục!');
      return;
    }

    if (editingCategory) {
      // Update
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formData.name,
                subtitle: formData.subtitle,
                group: formData.group,
                groupKey: formData.groupKey,
                gownCount: Number(formData.gownCount) || 0,
                priceSegment: formData.priceSegment || 'Tiêu chuẩn',
                orderNum: Number(formData.orderNum) || c.orderNum,
                position: `#${formData.orderNum || c.orderNum}`,
                isActive: formData.isActive,
                description: formData.description
              }
            : c
        )
      );
      showToast(`Đã cập nhật danh mục "${formData.name}" thành công`);
    } else {
      // Add new
      const newId = Date.now();
      const newCat = {
        id: newId,
        name: formData.name,
        subtitle: formData.subtitle || 'Phân loại thiết kế cao cấp UniBridal',
        group: formData.group,
        groupKey: formData.groupKey,
        gownCount: Number(formData.gownCount) || 0,
        priceSegment: formData.priceSegment || 'Tiêu chuẩn',
        position: `#${categories.length + 1}`,
        orderNum: categories.length + 1,
        isActive: formData.isActive,
        hasSpark: false,
        description: formData.description || 'Danh mục tuyển chọn mới thêm vào hệ thống.'
      };

      setCategories((prev) => [...prev, newCat]);
      showToast(`Đã thêm danh mục mới "${newCat.name}" thành công!`);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Delete category
  const handleDeleteCategory = (id) => {
    const item = categories.find((c) => c.id === id);
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${item?.name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Đã xóa danh mục "${item?.name}"`);
    }
  };

  return (
    <AdminLayout activeMenu="categories">
      <div className="font-jakarta pb-12">
        {/* ===================== 1. TOP HEADER & TITLE ===================== */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7">
          <div>
            {/* Small line and label */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-px bg-[#B88771]" />
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#A39192]">
                CẤU TRÚC DANH MỤC 2025
              </span>
            </div>

            <h1 className="font-playfair text-[28px] sm:text-[34px] font-bold text-[#45272F] tracking-tight leading-tight m-0">
              Quản Lý Danh Mục Tuyển Chọn
            </h1>
            <p className="text-[13px] sm:text-[13.5px] text-[#7A6A6B] mt-1.5 max-w-2xl leading-relaxed">
              Hệ thống phân loại Phom Dáng, Chất Liệu và Phân Khúc Giá theo chuẩn Haute Couture UniBridal. Dữ liệu được đồng bộ trực tiếp hai chiều với Bộ Lọc Tuyển Chọn của khách hàng.
            </p>
          </div>

          {/* Action Button: Thêm Danh Mục Mới */}
          <div className="shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setFormData({
                  name: '',
                  subtitle: '',
                  group: 'PHOM DÁNG',
                  groupKey: 'silhouette',
                  gownCount: 12,
                  priceSegment: '5 - 15 triệu',
                  orderNum: categories.length + 1,
                  isActive: true,
                  description: ''
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#733F49] hover:bg-[#5E323B] text-white px-5 py-2.5 rounded-xl font-jakarta text-[12.5px] font-bold tracking-wider uppercase transition-all shadow-[0_2px_8px_rgba(115,63,73,0.25)] hover:shadow-lg active:scale-95 cursor-pointer border-0 select-none"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>THÊM DANH MỤC MỚI</span>
            </button>
          </div>
        </div>

        {/* ===================== 2. THREE KPI SUMMARY CARDS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: NHÓM CHÍNH */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                NHÓM CHÍNH
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Network size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="font-playfair text-[32px] sm:text-[34px] font-bold text-[#2C2523] leading-none">
                3
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              Phom Dáng • Chất Liệu • Giá
            </div>
          </div>

          {/* Card 2: DANH MỤC CON ĐANG CHẠY */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                DANH MỤC CON ĐANG CHẠY
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Tag size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="font-playfair text-[32px] sm:text-[34px] font-bold text-[#2C2523] leading-none">
                12
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#2E7D32] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] inline-block" />
              <span>100% hiển thị trên bộ lọc</span>
            </div>
          </div>

          {/* Card 3: TỔNG MẪU VÁY ĐÃ GẮN THẺ */}
          <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 shadow-[0_2px_12px_rgba(115,63,73,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-[10.5px] font-bold tracking-[1.2px] text-[#8C7A7B] uppercase leading-snug">
                TỔNG MẪU VÁY ĐÃ GẮN THẺ
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F6ECE8] flex items-center justify-center text-[#733F49] shrink-0">
                <Shirt size={17} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="font-playfair text-[32px] sm:text-[34px] font-bold text-[#733F49] leading-none">
                86
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-[#F7EFEA] text-[12px] text-[#8C7A7B]">
              Tỷ lệ bao phủ đạt 98.4%
            </div>
          </div>
        </div>

        {/* ===================== 3. TABS & FILTER BAR ROW ===================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 mb-5">
          {/* Left Tabs Group */}
          <div className="flex items-center gap-1.5 bg-[#FAF5F2] p-1 rounded-xl border border-[#EFE5E0] self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border-0 cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#733F49] text-white shadow-xs'
                  : 'text-[#6D5D5E] hover:text-[#733F49] bg-transparent'
              }`}
            >
              Tất Cả ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('silhouette')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all border-0 cursor-pointer whitespace-nowrap ${
                activeTab === 'silhouette'
                  ? 'bg-[#733F49] text-white font-bold shadow-xs'
                  : 'text-[#6D5D5E] hover:text-[#733F49] bg-transparent'
              }`}
            >
              Phom Dáng ({counts.silhouette})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('material')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all border-0 cursor-pointer whitespace-nowrap ${
                activeTab === 'material'
                  ? 'bg-[#733F49] text-white font-bold shadow-xs'
                  : 'text-[#6D5D5E] hover:text-[#733F49] bg-transparent'
              }`}
            >
              Chất Liệu ({counts.material})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('price')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all border-0 cursor-pointer whitespace-nowrap ${
                activeTab === 'price'
                  ? 'bg-[#733F49] text-white font-bold shadow-xs'
                  : 'text-[#6D5D5E] hover:text-[#733F49] bg-transparent'
              }`}
            >
              Mức Giá Thuê ({counts.price})
            </button>
          </div>

          {/* Right Search Input & Filter Icon */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39192]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc danh mục..."
                className="w-full bg-[#FAF5F2] hover:bg-[#F6ECE8] focus:bg-white text-[13px] text-[#2C2523] placeholder:text-[#A39192] rounded-xl pl-9 pr-3.5 py-2 border border-[#EFE5E0] focus:border-[#733F49] outline-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => showToast('Đang áp dụng bộ sắp xếp nâng cao')}
              className="p-2.5 rounded-xl bg-[#FAF5F2] hover:bg-[#F6ECE8] text-[#733F49] border border-[#EFE5E0] cursor-pointer transition-colors shrink-0"
              title="Bộ lọc & Sắp xếp"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ===================== 4. MAIN CATEGORY TABLE CARD ===================== */}
        <div className="bg-white rounded-2xl border border-[#F0E6E2] p-5 sm:p-6 shadow-[0_2px_14px_rgba(115,63,73,0.04)]">
          {/* Card Top Title Bar */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F6ECE8]">
            <div className="flex items-center gap-2 font-bold text-[13.5px] sm:text-[14px] text-[#2C2523]">
              <ListFilter size={18} className="text-[#733F49]" />
              <span>Danh Sách Phân Cấp & Dữ Liệu Bộ Lọc</span>
            </div>

            <div className="text-[11px] font-bold tracking-[1.2px] uppercase text-[#8C7A7B]">
              HIỂN THỊ {filteredCategories.length} PHÂN MỤC
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#FAF4F0] text-[#8C7A7B] text-[11px] font-bold tracking-[1.1px] uppercase">
                  <th className="py-3 px-4 rounded-l-xl font-bold">TÊN DANH MỤC & NHÃN</th>
                  <th className="py-3 px-3 font-bold text-center">NHÓM</th>
                  <th className="py-3 px-3 font-bold text-center">MẪU VÁY</th>
                  <th className="py-3 px-4 font-bold">PHÂN KHÚC / TAG</th>
                  <th className="py-3 px-3 font-bold text-center">VỊ TRÍ</th>
                  <th className="py-3 px-3 font-bold text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-4 rounded-r-xl font-bold text-center">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F6ECE8]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#8C7A7B] text-[13.5px]">
                      Không tìm thấy danh mục nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#FAF7F5] transition-colors group"
                    >
                      {/* Cột 1: TÊN DANH MỤC & NHÃN */}
                      <td className="py-4 px-4 align-middle">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-playfair text-[15px] font-bold text-[#2C2523] leading-snug group-hover:text-[#733F49] transition-colors">
                              {cat.name}
                            </span>
                            {cat.hasSpark && (
                              <span className="text-[#B8737D] text-[12px]" title="Danh mục nổi bật">
                                ✦
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#8C7A7B] mt-0.5 leading-snug">
                            {cat.subtitle}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: NHÓM */}
                      <td className="py-4 px-3 align-middle text-center">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md leading-none text-center ${
                            cat.groupKey === 'silhouette'
                              ? 'bg-[#F6EAE4] text-[#5F333B]'
                              : cat.groupKey === 'material'
                              ? 'bg-[#F2EBF0] text-[#6E425E]'
                              : 'bg-[#EBF1F6] text-[#335675]'
                          }`}
                        >
                          {cat.group}
                        </span>
                      </td>

                      {/* Cột 3: MẪU VÁY */}
                      <td className="py-4 px-3 align-middle text-center">
                        <span className="font-playfair text-[15px] font-bold text-[#2C2523]">
                          {cat.gownCount}
                        </span>
                      </td>

                      {/* Cột 4: PHÂN KHÚC / TAG */}
                      <td className="py-4 px-4 align-middle">
                        <span className="text-[12.5px] font-medium text-[#4A3E3D]">
                          {cat.priceSegment}
                        </span>
                      </td>

                      {/* Cột 5: VỊ TRÍ */}
                      <td className="py-4 px-3 align-middle text-center">
                        <span className="inline-block bg-[#F6ECE8] text-[#5F333B] font-mono text-[11.5px] font-bold px-2 py-0.5 rounded">
                          {cat.position}
                        </span>
                      </td>

                      {/* Cột 6: TRẠNG THÁI (TOGGLE SWITCH) */}
                      <td className="py-4 px-3 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            cat.isActive ? 'bg-[#733F49]' : 'bg-[#D7CCC8]'
                          }`}
                          role="switch"
                          aria-checked={cat.isActive}
                          title={cat.isActive ? 'Đang bật trên bộ lọc' : 'Đang tắt khỏi bộ lọc'}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              cat.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Cột 7: THAO TÁC */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2 text-[#8C7A7B]">
                          {/* Nút sửa (Pencil) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 hover:text-[#733F49] hover:bg-[#F6ECE8] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                            title="Chỉnh sửa danh mục"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Nút xem chi tiết (Eye) */}
                          <button
                            type="button"
                            onClick={() => setViewingCategory(cat)}
                            className="p-1.5 hover:text-[#733F49] hover:bg-[#F6ECE8] rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                            title="Xem chi tiết phân mục"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== 5. MODAL: THÊM / CHỈNH SỬA DANH MỤC ===================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#F0E6E2] my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#F6ECE8]">
                <div>
                  <h3 className="font-playfair text-[22px] font-bold text-[#45272F] m-0">
                    {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                  </h3>
                  <p className="text-[12px] text-[#8C7A7B] m-0 mt-0.5">
                    Đồng bộ trực tiếp với bộ lọc tuyển chọn sản phẩm trên website
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F6ECE8] text-[#8C7A7B] hover:text-[#733F49] transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
                {/* Tên Danh Mục */}
                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Tên Danh Mục & Nhãn Hiển Thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Công Chúa Bồng Xòe (Ballgown)"
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                  />
                </div>

                {/* Mô tả phụ / subtitle */}
                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Mô Tả Phụ (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="VD: Xòe lớn hoàng gia, lộng lẫy"
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                  />
                </div>

                {/* Nhóm danh mục & Phân khúc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Nhóm Danh Mục
                    </label>
                    <select
                      value={formData.groupKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        const groupLabel =
                          val === 'silhouette'
                            ? 'PHOM DÁNG'
                            : val === 'material'
                            ? 'CHẤT LIỆU'
                            : 'GIÁ THUÊ';
                        setFormData({ ...formData, groupKey: val, group: groupLabel });
                      }}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    >
                      <option value="silhouette">Phom Dáng</option>
                      <option value="material">Chất Liệu</option>
                      <option value="price">Mức Giá Thuê</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Phân Khúc / Tag
                    </label>
                    <input
                      type="text"
                      value={formData.priceSegment}
                      onChange={(e) => setFormData({ ...formData, priceSegment: e.target.value })}
                      placeholder="VD: 5 - 18 triệu hoặc Haute Couture"
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    />
                  </div>
                </div>

                {/* Số lượng mẫu váy & Vị trí hiển thị */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Số Mẫu Váy Thuộc Danh Mục
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.gownCount}
                      onChange={(e) => setFormData({ ...formData, gownCount: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                      Thứ Tự Ưu Tiên (Vị Trí)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.orderNum}
                      onChange={(e) => setFormData({ ...formData, orderNum: e.target.value })}
                      className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] font-mono text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none"
                    />
                  </div>
                </div>

                {/* Mô tả chi tiết */}
                <div>
                  <label className="block text-[12px] font-bold text-[#5F333B] mb-1 uppercase tracking-wider">
                    Mô Tả Quy Chuẩn Haute Couture
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về cách nhận diện phom dáng hoặc chất liệu..."
                    className="w-full bg-[#FAF5F2] focus:bg-white text-[13px] text-[#2C2523] px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] focus:border-[#733F49] outline-none resize-none"
                  />
                </div>

                {/* Trạng thái hoạt động */}
                <div className="flex items-center justify-between p-3 bg-[#FAF5F2] rounded-xl border border-[#EFE5E0]">
                  <div>
                    <span className="text-[12.5px] font-bold text-[#2C2523] block">
                      Hiển Thị Lên Bộ Lọc Khách Hàng
                    </span>
                    <span className="text-[11.5px] text-[#8C7A7B]">
                      Khi bật, khách hàng có thể tìm kiếm và lọc theo danh mục này trên website
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isActive ? 'bg-[#733F49]' : 'bg-[#D7CCC8]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        formData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#F6ECE8]">
                  {editingCategory ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteCategory(editingCategory.id);
                        setIsModalOpen(false);
                      }}
                      className="px-4 py-2.5 rounded-xl text-[#C93B3B] hover:bg-[#FDECEE] text-[12.5px] font-bold transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-1.5"
                    >
                      <Trash2 size={15} />
                      <span>Xóa danh mục</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-[#EFE5E0] text-[13px] font-semibold text-[#6D5D5E] hover:bg-[#FAF5F2] transition-colors cursor-pointer"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5E323B] text-white text-[13px] font-bold tracking-wide transition-all shadow-md cursor-pointer border-0"
                    >
                      {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== 6. MODAL: XEM CHI TIẾT DANH MỤC ===================== */}
        {viewingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#F0E6E2] my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between pb-4 border-b border-[#F6ECE8]">
                <div>
                  <span className="inline-block bg-[#F6ECE8] text-[#5F333B] font-mono text-[11.5px] font-bold px-2.5 py-0.5 rounded mb-2">
                    Vị Trí {viewingCategory.position}
                  </span>
                  <h3 className="font-playfair text-[22px] font-bold text-[#45272F] m-0">
                    {viewingCategory.name}
                  </h3>
                  <p className="text-[12.5px] text-[#8C7A7B] m-0 mt-0.5">
                    {viewingCategory.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCategory(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F6ECE8] text-[#8C7A7B] hover:text-[#733F49] transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-3.5 text-[13px]">
                <div className="p-3.5 bg-[#FAF5F2] rounded-xl border border-[#EFE5E0]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A7B] block mb-1">
                    Mô Tả Quy Chuẩn Thiết Kế
                  </span>
                  <p className="text-[#2C2523] leading-relaxed m-0">
                    {viewingCategory.description || 'Chưa có thông tin mô tả chi tiết cho phân mục này.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#EFE5E0] rounded-xl">
                    <span className="text-[11px] font-bold uppercase text-[#8C7A7B] block mb-0.5">
                      Nhóm Phân Loại
                    </span>
                    <span className="font-bold text-[#5F333B] text-[13.5px]">
                      {viewingCategory.group}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-[#EFE5E0] rounded-xl">
                    <span className="text-[11px] font-bold uppercase text-[#8C7A7B] block mb-0.5">
                      Tổng Thiết Kế
                    </span>
                    <span className="font-playfair font-bold text-[#733F49] text-[17px]">
                      {viewingCategory.gownCount} mẫu váy
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#EFE5E0] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[#8C7A7B] block">
                      Trạng Thái Hoạt Động
                    </span>
                    <span className="text-[13px] font-semibold text-[#2C2523]">
                      {viewingCategory.isActive
                        ? 'Đang hiển thị trên bộ lọc trang chủ & bộ sưu tập'
                        : 'Đang tạm ẩn'}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-[12px] font-bold ${
                      viewingCategory.isActive
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#F6ECE8] text-[#8C7A7B]'
                    }`}
                  >
                    {viewingCategory.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F6ECE8] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(viewingCategory);
                    setViewingCategory(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5E323B] text-white text-[13px] font-bold transition-all border-0 cursor-pointer"
                >
                  Chỉnh Sửa
                </button>
              </div>
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
