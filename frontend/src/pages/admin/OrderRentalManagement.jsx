import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { message, Modal, Radio, Input } from 'antd';
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Check,
  Download,
  RefreshCw,
  AlertTriangle,
  Camera,
  UploadCloud,
  Archive,
  FileText,
  Eye,
  FolderArchive,
} from 'lucide-react';
import HangerIcon from '../../components/common/HangerIcon';
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  submitReturnInspection,
} from '../../services/orderService';
import { formatCurrencyVND } from '../../utils/formatCurrency';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

/** Badge config cho từng status */
const STATUS_CONFIG = {
  pending_payment: { label: 'Chờ Cọc', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  deposit_paid: { label: 'Đã Đặt Cọc', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  active: { label: 'Đã Ký Hợp Đồng', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  confirmed: { label: 'Đã Xác Nhận', bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
  preparing: { label: 'Đang Chuẩn Bị', bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
  delivered: { label: 'Đã Giao Váy', bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
  renting: { label: 'Đang Thuê', bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' },
  returned: { label: 'Đã Trả Váy', bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
  complete: { label: 'Hoàn Tất', bg: 'bg-[#A7F3D0]', text: 'text-[#064E3B]' },
  completed: { label: 'Hoàn Tất', bg: 'bg-[#A7F3D0]', text: 'text-[#064E3B]' },
  cancelled: { label: 'Đã Hủy', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

/** Các chuyển tiếp status hợp lệ (chỉ tiến, không lui) */
const NEXT_STATUSES = {
  pending_payment: ['deposit_paid', 'cancelled'],
  deposit_paid: ['preparing', 'cancelled'],
  active: ['preparing', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['delivered', 'cancelled'],
  delivered: ['renting', 'cancelled'],
  renting: [], // Bắt buộc nhân viên bấm nút [Kiểm Định], không dùng dropdown tùy ý
  returned: ['completed'],
  complete: [],
  completed: [],
  cancelled: [],
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất Cả Trạng Thái' },
  { value: 'deposit_paid', label: 'Đã Đặt Cọc' },
  { value: 'preparing', label: 'Đang Chuẩn Bị' },
  { value: 'delivered', label: 'Đã Giao Váy' },
  { value: 'renting', label: 'Đang Thuê' },
  { value: 'returned', label: 'Đã Trả Váy' },
  { value: 'completed', label: 'Hoàn Tất' },
  { value: 'cancelled', label: 'Đã Hủy' },
];

const CONDITION_OPTIONS = [
  { value: 'good', label: 'Tốt' },
  { value: 'minor_stain', label: 'Vết nhỏ' },
  { value: 'heavy_damage', label: 'Hư hỏng nặng' },
  { value: 'torn_lace', label: 'Rách ren/đính kết' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');
const fmtVnd = (v) => formatCurrencyVND(v ?? 0);

function calcLate(rentalEndDate) {
  if (!rentalEndDate) return 0;
  const end = new Date(rentalEndDate);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - end) / 86400000);
  return diff > 0 ? diff : 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function UpdateStatusDropdown({ order, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const nexts = NEXT_STATUSES[order.status] || [];

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  if (nexts.length === 0) return null;

  const handleChange = async (newStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      await updateOrderStatus(order._id, newStatus);
      message.success(`Đã cập nhật trạng thái thành "${STATUS_CONFIG[newStatus]?.label ?? newStatus}"`);
      onUpdated?.(order._id, newStatus);
    } catch {
      message.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left whitespace-normal">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EE] border border-[#EFE2DC] text-[12px] text-[#554748] font-medium hover:bg-[#F3E7E2] hover:text-[#733F49] transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
      >
        <SlidersHorizontal size={12} className="text-[#846E63]" />
        <span>Cập nhật</span>
        <ChevronDown size={12} className={`transition-transform text-[#846E63] ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-2xl border border-[#EFE5E1] py-1.5 z-50 flex flex-col divide-y divide-[#F9F0EB]">
          <div className="px-3.5 py-1.5 bg-[#FCF8F5] text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A7B]">
            Chuyển bước tiếp theo
          </div>
          <div className="py-1 flex flex-col">
            {nexts.map((s) => {
              const cfg = STATUS_CONFIG[s] || { label: s };
              const isCancel = s === 'cancelled';
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange(s)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-[12px] transition-colors font-medium border-0 bg-transparent cursor-pointer ${isCancel
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : 'text-[#4A3E3F] hover:bg-[#FAF4EE] hover:text-[#733F49]'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCancel ? 'bg-red-500' : 'bg-[#733F49]'}`} />
                    <span>{cfg.label}</span>
                  </span>
                  <ChevronRight size={13} className="opacity-40" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionModal({ order, onClose, onSuccess }) {
  const isCompletedOrder = order.status === 'completed' || order.status === 'complete';
  const [itemsCondition, setItemsCondition] = useState(
    () =>
      (order.items || []).map((item) => ({
        dressId: item.dressId || item.id || item._id || 'item_default',
        name: item.name,
        condition: 'good',
        damageNotes: '',
        compensation: 0,
        rentPrice: item.rentPrice ?? order.totalRentPrice ?? 0,
      }))
  );
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Xử lý chụp ảnh / tải ảnh bằng chứng hiện trạng váy
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidencePhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setEvidencePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const lateDays = calcLate(order.rentalEndDate);
  const dailyLateFee = itemsCondition.reduce((acc, ic) => acc + ic.rentPrice * 0.05, 0);
  const lateFee = lateDays * dailyLateFee;
  const totalCompensation = itemsCondition.reduce((acc, ic) => acc + Number(ic.compensation || 0), 0);
  const totalDeduction = lateFee + totalCompensation;
  const finalRefund = Math.max(0, (order.totalDeposit ?? 0) - totalDeduction);

  const updateItem = (idx, field, value) => {
    setItemsCondition((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'condition' && value === 'good') {
        next[idx].damageNotes = '';
        next[idx].compensation = 0;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = itemsCondition.map((ic) => ({
        dressId: ic.dressId,
        condition: ic.condition,
        note: ic.damageNotes || '',
        damageNotes: ic.damageNotes || '',
        repairFee: Number(ic.compensation || 0),
        compensation: Number(ic.compensation || 0),
      }));
      await submitReturnInspection(order._id, {
        itemsCondition: payload,
        evidencePhotos,
      });

      // Nếu kiểm định đạt yêu cầu, tự động cập nhật đơn hoàn tất và chuyển vào kho lưu trữ
      try {
        await updateOrderStatus(order._id, 'completed');
      } catch (e) {
        // ignore if already updated
      }

      message.success(`Kiểm định trả váy thành công! Đơn hàng đã được hoàn tất và tự động chuyển vào Kho Lưu Trữ.`);
      onSuccess();
    } catch {
      message.error('Gửi biên bản kiểm định thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EFE5E1]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0E6E2] bg-[#FFF6F3] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#B8737D]" />
            <div>
              <h3 className="font-playfair text-[17px] font-bold text-[#5F2B36]">
                {isCompletedOrder ? 'Hồ Sơ Lưu Trữ Đơn Thuê & Quyết Toán Cọc' : 'Kiểm Định Trả Váy'}
              </h3>
              <p className="text-[11.5px] text-[#8C7D7E]">
                Đơn #{order.orderCode} {isCompletedOrder ? '• Đã Hoàn Tất Lưu Kho' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2E3DC] text-[#7A6B6C] hover:text-[#733F49] flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Order info */}
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div className="p-3 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2]">
              <span className="text-[#8C7D7E] block mb-0.5">Khách hàng</span>
              <span className="font-semibold text-[#2C2523]">{order.customerName}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2]">
              <span className="text-[#8C7D7E] block mb-0.5">Ngày thuê</span>
              <span className="font-semibold text-[#2C2523]">
                {fmtDate(order.rentalStartDate)} – {fmtDate(order.rentalEndDate)}
              </span>
            </div>
          </div>

          {/* Late fee info */}
          {lateDays > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[12px]">
              <AlertTriangle size={15} className="text-[#92400E] shrink-0 mt-0.5" />
              <div className="text-[#92400E]">
                <span className="font-bold">Trễ {lateDays} ngày!</span> Phí trễ:{' '}
                <span className="font-bold">{fmtVnd(lateFee)}</span> (5%/ngày × số item)
              </div>
            </div>
          )}

          {/* Items inspection */}
          {itemsCondition.map((ic, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#EFE5E1] bg-white space-y-3">
              <div className="font-semibold text-[13.5px] text-[#5F2B36]">
                {ic.name}
              </div>
              <div>
                <p className="text-[11.5px] text-[#8C7D7E] mb-2">Tình trạng váy:</p>
                <Radio.Group
                  value={ic.condition}
                  onChange={(e) => updateItem(idx, 'condition', e.target.value)}
                  className="flex flex-wrap gap-2"
                >
                  {CONDITION_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      <span className="text-[12.5px]">{opt.label}</span>
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
              {ic.condition !== 'good' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Ghi chú hư hỏng..."
                    value={ic.damageNotes}
                    onChange={(e) => updateItem(idx, 'damageNotes', e.target.value)}
                    className="text-[12.5px]"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Số tiền bồi thường (₫)"
                    value={ic.compensation}
                    onChange={(e) => updateItem(idx, 'compensation', e.target.value)}
                    className="text-[12.5px]"
                  />
                </div>
              )}
            </div>
          ))}

          {/* CHỤP ẢNH & LƯU BẰNG CHỨNG HIỆN TRẠNG VÁY */}
          <div className="p-4 rounded-xl border border-[#EFE5E1] bg-[#FCF8F5] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-[#733F49]" />
                <span className="font-bold text-[13px] text-[#2C2523]">
                  Ảnh Chụp Bằng Chứng Hiện Trạng Váy ({evidencePhotos.length} ảnh)
                </span>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#733F49] text-white text-[11.5px] font-bold cursor-pointer hover:bg-[#5C3038] transition-colors shadow-2xs">
                <Camera size={13} />
                <span>+ Chụp / Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {evidencePhotos.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-[#DDC6C0] text-center bg-white">
                <Camera size={22} className="text-[#A38D91] mx-auto mb-1 opacity-70" />
                <p className="text-[12px] text-[#7A6B6C] m-0">
                  Nhân viên chụp ảnh cận cảnh hiện trạng váy (ren, khóa, gấu váy) để lưu hồ sơ đối soát và hoàn cọc
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {evidencePhotos.map((photo, pIdx) => (
                  <div key={pIdx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5D7D0] group">
                    <img src={photo} alt={`Bằng chứng ${pIdx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(pIdx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-[#FFF6F3] border border-[#EFE5E1] space-y-2 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-[#8C7D7E]">Tiền cọc ban đầu</span>
              <span className="font-semibold">{fmtVnd(order.totalDeposit)}</span>
            </div>
            {lateDays > 0 && (
              <div className="flex justify-between text-[#92400E]">
                <span>Phí trễ ({lateDays} ngày)</span>
                <span className="font-semibold">-{fmtVnd(lateFee)}</span>
              </div>
            )}
            {totalCompensation > 0 && (
              <div className="flex justify-between text-[#B84E5D]">
                <span>Tiền bồi thường hư hỏng</span>
                <span className="font-semibold">-{fmtVnd(totalCompensation)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#5F2B36] border-t border-[#EFE5E1] pt-2 mt-2">
              <span>Hoàn trả khách</span>
              <span className="text-[15px]">{fmtVnd(finalRefund)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {isCompletedOrder ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#733F49] text-[12px] font-bold text-white hover:bg-[#5C3038] transition-colors border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} />
                <span>Đóng Hồ Sơ Lưu Trữ</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#EFE5E1] text-[12px] font-bold text-[#5F4E50] hover:bg-[#FAF5F2] transition-colors bg-transparent cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-[#733F49] text-[12px] font-bold text-white hover:bg-[#5C3038] transition-colors border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  Xác Nhận & Chuyển Vào Kho Lưu Trữ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderRentalManagement() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' (Đơn Đang Xử Lý) | 'archived' (Kho Lưu Trữ)

  const [inspectionOrder, setInspectionOrder] = useState(null); // for inspection modal
  const [statusMenuId, setStatusMenuId] = useState(null); // row dropdown open id

  const isArchived = (order) => order.status === 'completed' || order.status === 'complete' || order.status === 'cancelled';
  const activeOrdersCount = useMemo(() => orders.filter((o) => !isArchived(o)).length, [orders]);
  const archivedOrdersCount = useMemo(() => orders.filter(isArchived).length, [orders]);

  // ── Load orders ──────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: activePage, limit: PAGE_SIZE };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const result = await getAllOrdersAdmin(params);
      const rawList = result.orders || [];

      setOrders(rawList);
      setTotal(result.total || rawList.length);
      setTotalPages(result.totalPages || Math.ceil((result.total || rawList.length) / PAGE_SIZE));
      setError('');
    } catch (err) {
      console.error('Database connection error in OrderRentalManagement:', err);
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
      setError('Lỗi kết nối cơ sở dữ liệu: Không thể lấy danh sách đơn thuê từ máy chủ MongoDB.');
    } finally {
      setLoading(false);
    }
  }, [activePage, statusFilter, searchTerm]);

  const handleOrderUpdated = (orderId, newStatus) => {
    setStatusMenuId(null);
    if (orderId && newStatus) {
      setOrders((prev) => {
        const next = prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o));
        try {
          localStorage.setItem('unibridal_orders_local', JSON.stringify(next));
        } catch { }
        return next;
      });
    }
    loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── Stats derived from orders ────────────────────────────────────────────
  const stats = useMemo(() => {
    const renting = orders.filter((o) => o.status === 'renting').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    return { total: orders.length, renting, completed, cancelled };
  }, [orders]);

  // ── Client-side filter (for demo fallback) ───────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Phân tách đơn đang xử lý và kho lưu trữ
      if (viewMode === 'active' && isArchived(o)) return false;
      if (viewMode === 'archived' && !isArchived(o)) return false;

      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q) ||
        (o.items?.[0]?.name || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter, viewMode]);

  const selectedFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.value === statusFilter)?.label ?? 'Tất Cả Trạng Thái';

  // ── Pagination helper ────────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);
    if (totalPages > 5) pages.push('...');
    if (totalPages > 5 && !pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  }, [totalPages]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout activeMenu="don-thue">
      {/* Header */}
      <div className="mb-8">
        <div className="w-2.5 h-2.5 rounded-full bg-[#B8737D] mb-3" />
        <h1 className="font-playfair text-[36px] md:text-[42px] font-normal text-[#5F2B36] tracking-tight mb-2">
          Quản Lý Đơn Thuê
        </h1>
        <p className="text-[14px] text-[#7A6B6C] font-normal leading-relaxed max-w-4xl">
          Theo dõi và quản lý toàn bộ đơn thuê váy cưới — cập nhật trạng thái vòng đời, kiểm định trả váy và hoàn cọc.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Tổng đơn */}
        <div
          onClick={() => { setViewMode('active'); setStatusFilter('all'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDCE1_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#B8737D]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                TỔNG ĐƠN THUÊ
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#F4EDE6] flex items-center justify-center text-[#8C6D62]">
                <HangerIcon size={20} strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#2C2523] leading-none">
                {loading ? '—' : total}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">đơn</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#7A6B6C]">
            <RefreshCw size={14} className="text-[#8C6D62]" />
            <span>Hiển thị danh sách đang xử lý</span>
          </div>
        </div>

        {/* Card 2: Đang thuê */}
        <div
          onClick={() => { setViewMode('active'); setStatusFilter('renting'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#EDE9FE_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#6D28D9]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐANG THUÊ
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] flex items-center justify-center text-[#6D28D9]">
                <CalendarDays size={20} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#6D28D9] leading-none">
                {loading ? '—' : stats.renting}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">đơn</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#7A6B6C]">
            <Calendar size={14} className="text-[#6D28D9]" />
            <span>Cần kiểm định khi khách trả</span>
          </div>
        </div>

        {/* Card 3: Hoàn tất (Kho Lưu Trữ) */}
        <div
          onClick={() => { setViewMode('archived'); setStatusFilter('all'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#DEF5E7_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#229A53]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐÃ HOÀN TẤT (LƯU KHO)
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#229A53]">
                <Archive size={20} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#1E8347] leading-none">
                {loading ? '—' : stats.completed}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">đơn</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#1E8347] font-medium">
            <CheckCircle2 size={14} className="text-[#229A53]" />
            <span>Đã đưa vào Kho Lưu Trữ (Click xem)</span>
          </div>
        </div>

        {/* Card 4: Đã hủy */}
        <div
          onClick={() => { setViewMode('archived'); setStatusFilter('cancelled'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDFD9_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] p-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#B8737D]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐÃ HỦY
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[#FDECEE] flex items-center justify-center text-[#B8737D]">
                <Clock size={20} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold text-[#A84A58] leading-none">
                {loading ? '—' : stats.cancelled}
              </span>
              <span className="text-[13px] font-medium text-[#8C7D7E] ml-2">đơn</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[12px] text-[#7A6B6C]">
            <Clock size={14} className="text-[#B8737D]" />
            <span>Lưu trữ đơn hủy trong kỳ</span>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4 shadow-xs mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8B8C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActivePage(1); }}
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại, váy thuê..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FFF6F3] border border-[#EFE2DC] focus:border-[#B8737D] focus:bg-white text-[13.5px] text-[#2C2523] placeholder-[#A39293] outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setActivePage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39293] hover:text-[#5F333B]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterDropdownOpen((v) => !v)}
              className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-[#FAF2EE] border border-[#EFE2DC] text-[12.5px] text-[#554748] font-medium hover:bg-[#F3E7E2] transition-colors"
            >
              <span>{selectedFilterLabel}</span>
              <ChevronDown
                size={14}
                className={`text-[#8C7D7E] transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-[#EFE5E1] py-1.5 z-20">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setActivePage(1);
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-[13px] transition-colors ${statusFilter === opt.value
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

      {/* View Mode Tabs: Đơn Đang Xử Lý vs Kho Lưu Trữ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { setViewMode('active'); setStatusFilter('all'); setActivePage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              viewMode === 'active'
                ? 'bg-[#733F49] text-white shadow-md'
                : 'bg-white border border-[#EFE5E1] text-[#7A6B6C] hover:bg-[#FAF4F0]'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Đơn Đang Xử Lý</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-[#FAF0EC] text-[#733F49]'
              }`}
            >
              {activeOrdersCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setViewMode('archived'); setStatusFilter('all'); setActivePage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              viewMode === 'archived'
                ? 'bg-[#1E8347] text-white shadow-md'
                : 'bg-white border border-[#EFE5E1] text-[#7A6B6C] hover:bg-[#FAF4F0]'
            }`}
          >
            <Archive size={14} />
            <span>Kho Lưu Trữ Đơn Hoàn Tất</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                viewMode === 'archived' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E8347]'
              }`}
            >
              {archivedOrdersCount}
            </span>
          </button>
        </div>

        {viewMode === 'archived' ? (
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#1E8347] bg-[#EAF7EE] px-4 py-2 rounded-xl border border-[#C6F0D4]">
            <FolderArchive size={15} />
            <span>Kho lưu trữ an toàn: Các đơn đã hoàn thành và quyết toán cọc bảo lãnh</span>
          </div>
        ) : (
          <div className="text-[12px] text-[#8C7D7E] hidden md:block">
            Hiển thị các đơn thuê đang tiếp nhận, giao trang phục và chuẩn bị kiểm định
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3]">
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase">
                  MÃ ĐƠN
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase">
                  KHÁCH HÀNG
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase">
                  VÁY THUÊ
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  NGÀY THUÊ
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-right">
                  TIỀN CỌC
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  TRẠNG THÁI
                </th>
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-right">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6EDE9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <RefreshCw size={24} className="animate-spin text-[#B8737D] mx-auto mb-2" />
                    <p className="text-[13px] text-[#8C7D7E]">Đang tải dữ liệu đơn thuê...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#8C7D7E] text-sm">
                    {viewMode === 'archived' ? (
                      <div className="flex flex-col items-center justify-center">
                        <FolderArchive size={32} className="text-[#8C7D7E] mb-2 opacity-60" />
                        <p className="font-medium text-[#4A3B3D]">Kho lưu trữ hiện chưa có đơn hoàn tất nào.</p>
                        <p className="text-[12px] text-[#A39293] mt-0.5">
                          Các đơn sau khi kiểm định và quyết toán cọc sẽ tự động chuyển vào đây.
                        </p>
                      </div>
                    ) : (
                      'Không tìm thấy đơn thuê nào phù hợp.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const firstItem = order.items?.[0] || {};
                  const canInspect = order.status === 'renting' || order.status === 'delivered';

                  return (
                    <tr key={order._id || order.orderCode} className="hover:bg-[#FCF9F7] transition-colors">
                      {/* Mã đơn */}
                      <td className="py-4 px-5">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#F6EDE8] text-[#846E63] font-mono text-[11px] font-semibold tracking-wider">
                          {order.orderCode || order._id}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-4">
                        <div className="text-[13.5px] font-semibold text-[#2C2523] leading-tight">
                          {order.customerName || '—'}
                        </div>
                        <div className="text-[11.5px] text-[#8A797A] mt-0.5">
                          {order.customerPhone || '—'}
                        </div>
                      </td>

                      {/* Váy thuê */}
                      <td className="py-4 px-4">
                        <div className="text-[13px] font-semibold text-[#2C2523] leading-tight">
                          {firstItem.name || '—'}
                        </div>
                        {firstItem.size && (
                          <div className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#FCECE8] text-[#B8737D] text-[10.5px] font-bold">
                            {firstItem.size}
                          </div>
                        )}
                      </td>

                      {/* Ngày thuê */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="text-[12px] text-[#554748] font-medium">
                          {fmtDate(order.rentalStartDate)}
                        </div>
                        <div className="text-[11px] text-[#8C7D7E]">–</div>
                        <div className="text-[12px] text-[#554748] font-medium">
                          {fmtDate(order.rentalEndDate)}
                        </div>
                      </td>

                      {/* Tiền cọc */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="text-[13.5px] font-bold text-[#863E4B]">
                          {fmtVnd(order.totalDeposit)}
                        </div>
                        {order.totalRentPrice > 0 && (
                          <div className="text-[11px] text-[#8C7D7E] mt-0.5">
                            (Thuê: {fmtVnd(order.totalRentPrice)})
                          </div>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {/* ĐỐI VỚI CÁC ĐƠN ĐÃ HOÀN TẤT TRONG KHO LƯU TRỮ */}
                          {isArchived(order) ? (
                            <button
                              type="button"
                              onClick={() => setInspectionOrder(order)}
                              title="Xem biên bản kiểm định & hồ sơ lưu trữ"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF7EE] border border-[#C6F0D4] text-[#1E8347] text-[12px] font-bold hover:bg-[#D5EFE0] transition-all cursor-pointer shadow-2xs"
                            >
                              <FileText size={13} />
                              <span>Hồ Sơ Lưu Trữ</span>
                            </button>
                          ) : order.status === 'renting' || order.status === 'returned' ? (
                            <button
                              type="button"
                              onClick={() => setInspectionOrder(order)}
                              title="Kiểm định trả váy & Chụp ảnh lưu bằng chứng"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#733F49] text-white text-[12px] font-bold hover:bg-[#5C3038] shadow-xs transition-all cursor-pointer"
                            >
                              <Camera size={13} />
                              <ShieldCheck size={13} />
                              <span>Kiểm Định</span>
                            </button>
                          ) : (
                            <UpdateStatusDropdown
                              order={order}
                              onUpdated={handleOrderUpdated}
                            />
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

        {/* Pagination Footer */}
        <div className="py-4 px-6 border-t border-[#F0E6E2] bg-[#FAF2EE] rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-[12.5px] text-[#7A6B6C]">
            <span>
              Hiển thị{' '}
              <span className="font-medium text-[#2C2523]">
                {filteredOrders.length}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-medium text-[#2C2523]">{total}</span> đơn
            </span>
            <span className="text-[#D4C5C0]">|</span>
            <button
              type="button"
              onClick={() => alert('Đang xuất danh sách đơn thuê (Excel/PDF)...')}
              className="inline-flex items-center gap-1.5 text-[#7A6B6C] hover:text-[#733F49] font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <Download size={14} className="stroke-[1.8]" />
              <span>Xuất Danh Sách (Excel/PDF)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-[#8C7D7E] text-xs font-semibold">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePage(p)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors ${activePage === p
                      ? 'bg-[#78434D] text-white shadow-xs'
                      : 'bg-white border border-[#EFE5E1] shadow-2xs text-[#4A3B3D] hover:bg-[#F5ECE8]'
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={activePage === totalPages}
              onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {inspectionOrder && (
        <InspectionModal
          order={inspectionOrder}
          onClose={() => setInspectionOrder(null)}
          onSuccess={() => {
            const updatedId = inspectionOrder._id;
            setInspectionOrder(null);
            setOrders((prev) => {
              const next = prev.map((o) => (o._id === updatedId ? { ...o, status: 'completed' } : o));
              try {
                localStorage.setItem('unibridal_orders_local', JSON.stringify(next));
              } catch { }
              return next;
            });
            loadOrders();
          }}
        />
      )}
    </AdminLayout>
  );
}
