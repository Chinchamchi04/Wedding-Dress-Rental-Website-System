import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { message, Modal, Radio, Input, Dropdown, notification } from 'antd';
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
  AlertCircle,
  Camera,
  UploadCloud,
  Archive,
  FileText,
  Eye,
  FolderArchive,
  Banknote,
  CreditCard,
  UserCheck,
  UserX,
  Crown,
} from 'lucide-react';
import HangerIcon from '../../components/common/HangerIcon';
import {
  getAllOrdersAdmin,
  getOrder,
  updateOrderStatus,
  submitReturnInspection,
  getReturnInspection,
} from '../../services/orderService';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { DRESS_CATALOG } from '../../data/dressCatalog';
import { recordCompletedOrderMaintenance } from '../../utils/maintenanceStorage';

// Helper lấy mã sản phẩm (SKU) của váy cưới từ item hoặc fallback vào catalog
const getDressCode = (item) => {
  if (!item) return '';
  if (item.code) return item.code;
  if (item.dressCode) return item.dressCode;
  const match = DRESS_CATALOG.find(
    (d) =>
      (item.dressId && (String(d.id) === String(item.dressId) || String(d._id) === String(item.dressId))) ||
      (d.code && (d.code === item.dressId || d.code === item.id)) ||
      (d.name && item.name && d.name.trim().toLowerCase() === item.name.trim().toLowerCase())
  );
  if (match?.code) return match.code;
  if (item.dressId && typeof item.dressId === 'string' && item.dressId.startsWith('UB-')) {
    return item.dressId;
  }
  return '';
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

/** Badge config cho từng status */
const STATUS_CONFIG = {
  pending_payment: { label: 'Chờ Cọc', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  deposit_paid: { label: 'Đã Đặt Cọc', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  active: { label: 'Đã Ký Hợp Đồng', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  confirmed: { label: 'Đã Xác Nhận', bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
  preparing: { label: 'Đang Chuẩn Bị', bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
  delivered: { label: 'Đã Giao Váy', bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
  renting: { label: 'Đang Thuê', bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' },
  returned: { label: 'Chờ Hoàn Cọc', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  complete: { label: 'Hoàn Tất', bg: 'bg-[#A7F3D0]', text: 'text-[#064E3B]' },
  completed: { label: 'Hoàn Tất', bg: 'bg-[#A7F3D0]', text: 'text-[#064E3B]' },
  cancelled: { label: 'Đã Hủy', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

/** Các chuyển tiếp status hợp lệ (chỉ tiến, không lui) */
const NEXT_STATUSES = {
  pending_payment: ['deposit_paid', 'cancelled'],
  deposit_paid: ['delivered', 'cancelled'],
  active: ['delivered', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
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
  { value: 'disputed', label: '⚠️ Khách Khiếu Nại' },
  { value: 'deposit_paid', label: 'Đã Đặt Cọc' },
  { value: 'delivered', label: 'Đã Giao Váy' },
  { value: 'renting', label: 'Đang Thuê' },
  { value: 'returned', label: 'Chờ Hoàn Cọc' },
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

const getRentalDays = (order) => {
  if (order?.rentalDays) return order.rentalDays;
  if (order?.rentalStartDate && order?.rentalEndDate) {
    const start = new Date(order.rentalStartDate);
    const end = new Date(order.rentalEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 4;
  }
  return 4;
};

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

function StatusBadge({ status, order }) {
  const custStatus = order?.inspection?.customerStatus || order?.inspectionCustomerStatus;
  if (status === 'returned' || status === 'disputed' || custStatus === 'disputed') {
    if (custStatus === 'disputed' || status === 'disputed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Khách Khiếu Nại
        </span>
      );
    }
    if (custStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
          Khách Đã Duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
        Chờ Khách Duyệt
      </span>
    );
  }

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
  const [loading, setLoading] = useState(false);
  const nexts = NEXT_STATUSES[order.status] || [];

  if (nexts.length === 0) return null;

  const handleChange = async (newStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(order._id, newStatus);
      if (newStatus === 'completed' || newStatus === 'complete') {
        recordCompletedOrderMaintenance(order);
      }
      message.success(`Đã cập nhật trạng thái thành "${STATUS_CONFIG[newStatus]?.label ?? newStatus}"`);
      onUpdated?.(order._id, newStatus);
    } catch {
      message.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'header',
      type: 'group',
      label: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A7B] block py-0.5">
          Chuyển bước tiếp theo
        </span>
      ),
      children: nexts.map((s) => {
        const cfg = STATUS_CONFIG[s] || { label: s };
        const isCancel = s === 'cancelled';
        return {
          key: s,
          label: (
            <div className="flex items-center justify-between py-1 min-w-[175px]">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isCancel ? 'bg-red-500' : 'bg-[#733F49]'}`} />
                <span className={`text-[12.5px] font-medium ${isCancel ? 'text-red-600' : 'text-[#4A3E3F]'}`}>
                  {cfg.label}
                </span>
              </span>
              <ChevronRight size={13} className="text-[#8C7A7B] opacity-50" />
            </div>
          ),
          onClick: () => handleChange(s),
        };
      }),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      disabled={loading}
    >
      <button
        type="button"
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF2EE] border border-[#EFE2DC] text-[12px] text-[#554748] font-medium hover:bg-[#F3E7E2] hover:text-[#733F49] transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
      >
        <SlidersHorizontal size={12} className="text-[#846E63]" />
        <span>Cập nhật</span>
        <ChevronDown size={12} className="text-[#846E63]" />
      </button>
    </Dropdown>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const items = order.items && order.items.length > 0 ? order.items : [
    {
      name: order.dressName || 'Lễ Phục Cao Cấp',
      code: order.dressCode,
      size: order.size,
      color: order.color,
      rentPrice: order.totalRentPrice,
      depositAmount: order.totalDeposit,
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-jakarta"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#EFE5E1] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Tiêu đề + Mã đơn + Trạng thái + Nút đóng X */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#F0E6E2] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#733F49] shrink-0">
              <FileText size={17} />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#5F2B36] m-0 leading-tight">
                Chi Tiết Đơn Thuê
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[11px] text-[#8C7D7E] font-medium">Mã đơn thuê:</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF0EC] text-[#733F49] font-mono text-[11px] font-bold border border-[#F2D8D4]">
                  {order.orderCode || order._id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} order={order} />
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#FAF2EE] text-[#7A6B6C] hover:text-[#5F2B36] flex items-center justify-center transition-colors cursor-pointer border-0 shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Nội dung hiển thị trọn vẹn trong 1 trang duy nhất, không cần cuộn */}
        <div className="p-5 pb-6 space-y-3.5 text-xs">
          {/* 1. Thông tin khách hàng */}
          <div className="bg-[#FAF5F2]/70 rounded-2xl p-3.5 border border-[#EFE5E1]">
            <h4 className="font-bold text-[#733F49] text-[11px] uppercase tracking-wider m-0 mb-2.5">
              Thông Tin Khách Hàng
            </h4>
            <div className="space-y-2 text-[12px]">
              {/* Dòng 1: Tên khách hàng & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#8C7D7E] shrink-0">Tên khách hàng:</span>
                  <span className="font-bold text-[#2C2523] inline-flex items-center gap-1.5 truncate" title={order.customerName}>
                    {order.customerName || '—'}
                    {(order.hasAccount || order.customerId) && (
                      <Crown size={13} className="text-[#D4AF37] fill-[#FDF3D6] shrink-0" title="Khách hàng thành viên" />
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8C7D7E] shrink-0">Số điện thoại:</span>
                  <span className="font-bold text-[#2C2523]">{order.customerPhone || '—'}</span>
                </div>
              </div>
              {/* Dòng 2: Email khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#8C7D7E] shrink-0">Email khách hàng:</span>
                  <span className="font-semibold text-[#2C2523] truncate" title={order.customerEmail}>
                    {order.customerEmail || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Grid 2 cột: Thông tin váy cưới (Trái) & Thời gian + Chi phí (Phải) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cột trái: Thông tin váy cưới (1 khung duy nhất, không lồng 2 khung) */}
            <div className="bg-[#FAF5F2]/70 rounded-2xl p-3.5 border border-[#EFE5E1]">
              <h4 className="font-bold text-[#733F49] text-[11px] uppercase tracking-wider m-0 mb-2.5">
                Thông tin váy cưới
              </h4>
              <div className="space-y-2 text-[11.5px]">
                {items.map((it, idx) => {
                  const code = getDressCode(it);
                  const sizeStr = it.size ? it.size.replace(/^size\s*/i, '') : '—';
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8C7D7E] shrink-0">Tên váy:</span>
                        <span className="font-bold text-[#2C2523] text-[12px] truncate" title={it.name}>
                          {it.name || 'Lễ Phục Cao Cấp'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8C7D7E] shrink-0">Mã váy:</span>
                        <span className="font-mono font-bold text-[#733F49] text-[12px]">
                          {code || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8C7D7E] shrink-0">Size váy:</span>
                        <span className="font-bold text-[#B8737D] text-[12px]">
                          Size {sizeStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải: Thời Gian & Chi Phí */}
            <div className="bg-[#FAF5F2]/70 rounded-2xl p-3.5 border border-[#EFE5E1]">
              <h4 className="font-bold text-[#733F49] text-[11px] uppercase tracking-wider m-0 mb-2.5">
                Thời Gian & Chi Phí
              </h4>
              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7D7E]">Chi tiết ngày:</span>
                  <span className="font-semibold text-[#2C2523]">
                    {fmtDate(order.rentalStartDate)} – {fmtDate(order.rentalEndDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7D7E]">Giá thuê váy:</span>
                  <span className="font-bold text-[#733F49]">{fmtVnd(order.totalRentPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7D7E]">Tiền đặt cọc:</span>
                  <span className="font-bold text-[#863E4B]">{fmtVnd(order.totalDeposit)}</span>
                </div>

                <div className="pt-2 border-t border-[#E8D0CC] flex items-center justify-between text-[12.5px]">
                  <span className="font-bold text-[#5F2B36]">Tổng thanh toán:</span>
                  <span className="font-extrabold text-[#733F49] text-[13px]">
                    {fmtVnd(order.totalAmount || ((order.totalRentPrice || 0) + (order.totalDeposit || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionModal({ order, onClose, onSuccess }) {
  const isCompletedOrder = order.status === 'completed' || order.status === 'complete';
  const isReturnedOrder = order.status === 'returned';
  const isGuestOrder = !order.hasAccount && !order.customerId && !order.userId;
  const [customerStatus, setCustomerStatus] = useState(order.inspectionCustomerStatus || order.inspection?.customerStatus || 'pending');
  const isCustomerApproved = customerStatus === 'approved';
  const [isEditing, setIsEditing] = useState(!isReturnedOrder && !isCustomerApproved);
  const isReadOnly = isCompletedOrder || isCustomerApproved || (!isEditing && isReturnedOrder);

  const [disputeReason, setDisputeReason] = useState('');
  const [refundBankDetails, setRefundBankDetails] = useState(null);

  // Trực tiếp tại quầy dành cho Guest hoặc khách tại Showroom
  const [confirmOnSite, setConfirmOnSite] = useState(isGuestOrder);
  const [refundMethod, setRefundMethod] = useState('cash'); // 'cash' | 'bank_transfer'
  const [onSiteBankName, setOnSiteBankName] = useState('Vietcombank');
  const [onSiteAccountNum, setOnSiteAccountNum] = useState('');
  const [onSiteAccountHolder, setOnSiteAccountHolder] = useState(order.customerName || '');
  const [onSiteNotes, setOnSiteNotes] = useState('');

  const [itemsCondition, setItemsCondition] = useState(
    () =>
      (order.items || []).map((item) => {
        const itemDeposit = item.depositAmount ?? (order.totalDeposit ? Math.round(order.totalDeposit / Math.max(1, (order.items || []).length)) : 0);
        const itemRent = item.rentPrice ?? (order.totalRentPrice ? Math.round(order.totalRentPrice / Math.max(1, (order.items || []).length)) : 0);
        // Giới hạn tiền bồi thường tối đa không được vượt quá tiền cọc
        const maxDepositLimit = itemDeposit > 0 ? itemDeposit : (order.totalDeposit || 0);
        return {
          dressId: item.dressId || item.id || item._id || 'item_default',
          name: item.name,
          condition: 'good',
          damageNotes: '',
          compensation: 0,
          rentPrice: itemRent,
          depositAmount: maxDepositLimit,
          maxPrice: maxDepositLimit,
          maxDeposit: maxDepositLimit,
        };
      })
  );
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Luôn luôn tải biên bản kiểm định đã lưu từ trước (nếu có)
  useEffect(() => {
    getReturnInspection(order._id)
      .then((res) => {
        const insp = res?.data || res;
        if (insp && (insp.itemsCondition || insp.totalDeduction !== undefined)) {
          if (insp.customerStatus) {
            setCustomerStatus(insp.customerStatus);
            if (insp.customerStatus === 'approved') {
              setIsEditing(false);
            }
          }
          if (insp.disputeReason) setDisputeReason(insp.disputeReason);
          if (insp.refundBankDetails) setRefundBankDetails(insp.refundBankDetails);
          if (insp.evidencePhotos?.length) {
            setEvidencePhotos(insp.evidencePhotos);
          }
          if (insp.itemsCondition?.length) {
            setItemsCondition((prev) =>
              prev.map((it, idx) => {
                const match =
                  insp.itemsCondition[idx] ||
                  insp.itemsCondition.find((c) => String(c.dressId) === String(it.dressId));
                return match
                  ? {
                    ...it,
                    condition: match.condition || it.condition,
                    damageNotes: match.note || match.damageNotes || '',
                    compensation: match.repairFee ?? match.compensation ?? 0,
                  }
                  : it;
              })
            );
          }
        }
      })
      .catch(() => { });
  }, [order._id]);

  // Xử lý chụp ảnh / tải ảnh bằng chứng hiện trạng váy (tự động nén ảnh nhẹ để tối ưu tốc độ và database)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setEvidencePhotos((prev) => [...prev, compressed]);
        };
        img.src = event.target.result;
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
    if (isReadOnly) return;
    setItemsCondition((prev) => {
      const next = [...prev];
      let val = value;
      if (field === 'compensation') {
        const numVal = Math.max(0, Number(val || 0));
        const maxLimit = next[idx]?.maxDeposit || next[idx]?.depositAmount || order.totalDeposit || 0;
        if (numVal > maxLimit && maxLimit > 0) {
          message.warning(`Số tiền bồi thường không được vượt quá tiền cọc (Tối đa ${fmtVnd(maxLimit)})`);
          val = maxLimit;
        } else {
          val = numVal;
        }
      }
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'condition' && value === 'good') {
        next[idx].damageNotes = '';
        next[idx].compensation = 0;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isCustomerApproved) {
      message.error('Khách hàng đã duyệt biên bản kiểm định, hồ sơ đã khóa và không thể chỉnh sửa.');
      return;
    }

    // Validate không được nhập số tiền lớn hơn tiền cọc
    for (const ic of itemsCondition) {
      const maxLimit = ic.maxDeposit || ic.depositAmount || order.totalDeposit || 0;
      if (Number(ic.compensation || 0) > maxLimit && maxLimit > 0) {
        message.error(`Số tiền bồi thường của váy "${ic.name}" không được vượt quá tiền cọc (${fmtVnd(maxLimit)})`);
        return;
      }
    }

    if (totalCompensation > (order.totalDeposit || 0) && (order.totalDeposit || 0) > 0) {
      message.error(`Tổng số tiền bồi thường (${fmtVnd(totalCompensation)}) không được vượt quá tổng tiền cọc của đơn (${fmtVnd(order.totalDeposit || 0)})`);
      return;
    }

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

      const body = {
        itemsCondition: payload,
        evidencePhotos,
        confirmOnSite,
        refundMethod,
        refundBankDetails: confirmOnSite ? (
          refundMethod === 'cash' ? {
            bankName: 'Tiền mặt tại quầy',
            accountNumber: 'TIỀN MẶT',
            accountHolder: order.customerName || 'Khách hàng',
            notes: onSiteNotes || 'Đã hoàn tiền mặt trực tiếp cho khách tại quầy showroom',
          } : {
            bankName: onSiteBankName || 'Ngân hàng nội địa',
            accountNumber: onSiteAccountNum || '',
            accountHolder: onSiteAccountHolder || order.customerName || '',
            notes: onSiteNotes || 'Showroom chuyển khoản trực tiếp cho khách tại quầy',
          }
        ) : null,
      };

      await submitReturnInspection(order._id, body);

      if (confirmOnSite) {
        message.success(`Đã xác nhận kiểm định và quyết toán hoàn cọc ${fmtVnd(finalRefund)} trực tiếp tại quầy thành công! Đơn hàng đã hoàn tất.`);
      } else {
        message.success('Đã lưu biên bản kiểm định thành công! Hệ thống đã gửi email thông báo kèm liên kết xác nhận hoàn cọc tới khách hàng.');
      }
      setIsEditing(false);
      onSuccess();
    } catch {
      message.error('Gửi biên bản kiểm định thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-[#EFE5E1]">
        {/* Header - Thu gọn chiều cao */}
        <div className="flex items-center justify-between py-2.5 px-4 border-b border-[#F0E6E2] bg-[#FFF6F3] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#B8737D]" />
            <div>
              <h3 className="font-playfair text-[15px] font-bold text-[#5F2B36] m-0">
                {isCompletedOrder
                  ? 'Hồ Sơ Lưu Trữ Đơn Thuê và Quyết Toán Cọc'
                  : isCustomerApproved
                    ? 'Biên Bản Kiểm Định Trả Váy (Khách Đã Duyệt)'
                    : isReturnedOrder
                      ? 'Biên Bản Kiểm Định Trả Váy (Đã Kiểm Định)'
                      : 'Kiểm Định Trả Váy và Giám Định Hiện Trạng'}
              </h3>
              <p className="text-[10.5px] text-[#8C7D7E] m-0">
                Đơn #{order.orderCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F2E3DC] text-[#7A6B6C] hover:text-[#733F49] flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-3.5 space-y-2.5 text-xs">
          {/* Status banner nếu khách đã phản hồi */}
          {customerStatus === 'disputed' && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-900 text-[11.5px]">
                <AlertTriangle size={13} />
                <span>Khách hàng đã gửi khiếu nại về biên bản:</span>
              </div>
              <p className="italic bg-white p-1.5 rounded-lg border border-red-100 text-[#4A3B3D] text-[11px] m-0">
                "{disputeReason || 'Khách hàng không đồng ý với mức bồi thường khấu trừ cọc'}"
              </p>
            </div>
          )}

          {customerStatus === 'approved' && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center justify-between gap-1.5 text-[11.5px] flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Khách hàng đã duyệt biên bản.</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  Đã Khóa Chỉnh Sửa
                </span>
              </div>
              {refundBankDetails?.accountNumber && (
                <div className="p-2 rounded-lg bg-white/90 border border-emerald-200 text-[11px] text-[#2C2523] space-y-0.5">
                  <div>• Ngân hàng: <strong>{refundBankDetails.bankName || 'Ngân hàng nội địa'}</strong> • STK: <strong className="font-mono">{refundBankDetails.accountNumber}</strong> • Chủ TK: <strong>{refundBankDetails.accountHolder}</strong></div>
                  {refundBankDetails.notes && <div>• Ghi chú: <em>{refundBankDetails.notes}</em></div>}
                </div>
              )}
            </div>
          )}

          {customerStatus === 'pending' && isReturnedOrder && (
            <div className="p-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Đang chờ khách duyệt:</strong> {isGuestOrder ? 'Khách vãng lai không có tài khoản online.' : 'Khách xác nhận thì hệ thống sẽ tự động hoàn cọc ngay.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setConfirmOnSite(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1E8347] text-white font-bold text-[10.5px] cursor-pointer hover:bg-[#166534] transition-colors border-0 flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 size={12} />
                <span>Xác nhận tại quầy ngay</span>
              </button>
            </div>
          )}

          {/* Dải thông tin tóm tắt đơn hàng gọn gàng 1 dòng */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#FAF5F2] border border-[#F0E6E2] text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#8C7D7E]">Khách hàng: </span>
              <strong className="text-[#2C2523]">{order.customerName}</strong>
              {order.hasAccount || order.customerId ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF0EC] text-[#733F49] border border-[#F2D8D4]">
                  <UserCheck size={10} className="text-[#B8737D]" /> Thành Viên
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#F5F2F0] text-[#7A6A6B] border border-[#E8DFDC]">
                  <UserX size={10} className="text-[#A39192]" /> Khách Vãng Lai
                </span>
              )}
            </div>
            <div>
              <span className="text-[#8C7D7E]">Ngày thuê: </span>
              <strong className="text-[#2C2523]">
                {fmtDate(order.rentalStartDate)} – {fmtDate(order.rentalEndDate)}
              </strong>
            </div>
            {lateDays > 0 && (
              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                Trễ {lateDays} ngày (+{fmtVnd(lateFee)})
              </span>
            )}
          </div>

          {/* Items inspection - Kiểm định váy */}
          {itemsCondition.map((ic, idx) => {
            const maxLimit = ic.maxDeposit || ic.depositAmount || order.totalDeposit || 0;
            const itemCode = getDressCode(ic) || getDressCode(order.items?.[idx]);
            return (
              <div key={idx} className="p-2.5 px-3 rounded-xl border border-[#EFE5E1] bg-white space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[12.5px] text-[#5F2B36]">
                      {ic.name}
                    </span>
                    {itemCode && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FAF0EC] text-[#733F49] font-mono text-[10px] font-bold border border-[#F2D8D4] leading-none">
                        {itemCode}
                      </span>
                    )}
                    {(ic.size || order.items?.[idx]?.size) && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#FCECE8] text-[#B8737D] text-[10px] font-bold leading-none">
                        Size: {ic.size || order.items?.[idx]?.size}
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] text-[#8C7D7E]">
                    (Tiền cọc: <strong className="text-[#5F2B36]">{fmtVnd(maxLimit)}</strong>)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#8C7D7E]">Tình trạng:</span>
                  <Radio.Group
                    disabled={isReadOnly}
                    value={ic.condition}
                    onChange={(e) => updateItem(idx, 'condition', e.target.value)}
                    className="flex flex-wrap gap-1.5 text-[11px]"
                  >
                    {CONDITION_OPTIONS.map((opt) => (
                      <Radio key={opt.value} value={opt.value}>
                        <span className="text-[11.5px]">{opt.label}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>

                {ic.condition !== 'good' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fadeIn">
                    <Input
                      disabled={isReadOnly}
                      placeholder="Ghi chú hư hỏng (ren, khóa, gấu...)"
                      value={ic.damageNotes}
                      onChange={(e) => updateItem(idx, 'damageNotes', e.target.value)}
                      className="text-xs"
                      size="middle"
                    />
                    <div>
                      <Input
                        disabled={isReadOnly}
                        placeholder={`Số tiền bồi thường (tối đa ${fmtVnd(maxLimit)})`}
                        value={ic.compensation ? String(ic.compensation).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                        onChange={(e) => {
                          const rawDigits = e.target.value.replace(/\D/g, '');
                          const num = rawDigits ? parseInt(rawDigits, 10) : 0;
                          updateItem(idx, 'compensation', num);
                        }}
                        suffix={<span className="text-[#8C7D7E] font-medium text-xs">đ</span>}
                        className="text-xs"
                        size="middle"
                      />
                      <span className="text-[10px] text-amber-800 block mt-0.5">
                        * Tối đa không vượt quá tiền cọc: {fmtVnd(maxLimit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* CHỤP ẢNH VÀ LƯU BẰNG CHỨNG HIỆN TRẠNG VÁY - Thu gọn thanh mảnh */}
          <div className="p-2 px-3 rounded-xl border border-[#EFE5E1] bg-[#FCF8F5] space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Camera size={14} className="text-[#733F49]" />
                <span className="font-bold text-[12px] text-[#2C2523]">
                  Ảnh Bằng Chứng Đối Soát ({evidencePhotos.length})
                </span>
              </div>
              {!isReadOnly && (
                <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#733F49] text-white text-[11px] font-bold cursor-pointer hover:bg-[#5C3038] transition-colors shadow-2xs">
                  <Camera size={12} />
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
              )}
            </div>

            {evidencePhotos.length === 0 ? (
              <div className="py-1.5 px-3 rounded-lg border border-dashed border-[#DDC6C0] text-center bg-white text-[11px] text-[#8C7D7E] flex items-center justify-center gap-1.5">
                <Camera size={13} className="text-[#A38D91]" />
                <span>Chưa có ảnh bằng chứng (nhấn nút "+ Chụp / Tải ảnh" để thêm ảnh đối soát)</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {evidencePhotos.map((photo, pIdx) => (
                  <div key={pIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E5D7D0] group">
                    <img src={photo} alt={`Bằng chứng ${pIdx + 1}`} className="w-full h-full object-cover" />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removePhoto(pIdx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer border-0"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary - Bảng quyết toán thu gọn 1 hàng */}
          <div className="p-2.5 px-3.5 rounded-xl bg-[#FFF6F3] border border-[#EFE5E1] text-[11.5px] flex items-center justify-between flex-wrap gap-2">
            <div className="space-x-2 text-[#7A6B6C]">
              <span>Cọc ban đầu: <strong className="text-[#2C2523]">{fmtVnd(order.totalDeposit)}</strong></span>
              {lateDays > 0 && <span className="text-[#92400E]">• Trễ: <strong>-{fmtVnd(lateFee)}</strong></span>}
              {totalCompensation > 0 && <span className="text-[#B84E5D]">• Bồi thường: <strong>-{fmtVnd(totalCompensation)}</strong></span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#5F2B36]">Dự kiến hoàn trả:</span>
              <span className="text-[15px] font-bold text-[#1E8347]">{fmtVnd(finalRefund)}</span>
            </div>
          </div>

          {/* Tùy chọn xác nhận trực tiếp dành cho 2 hình thức: Trả tại Showroom hoặc Nhân viên đến thu hồi */}
          {!isReadOnly && (
            <div className={`p-3 rounded-xl border transition-all ${confirmOnSite ? 'border-[#BCE2C5] bg-[#F3FAF5]' : 'border-[#EFE5E1] bg-[#FAF5F2]'}`}>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmOnSite}
                    onChange={(e) => setConfirmOnSite(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E8347] accent-[#1E8347] cursor-pointer"
                  />
                  <span className="font-bold text-[12px] text-[#1E6B37]">
                    Đồng kiểm tra & xác nhận trực tiếp cùng khách (Tại Showroom / Tận nơi thu hồi)
                  </span>
                </label>
                {isGuestOrder && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Khách vãng lai (Không có tài khoản)
                  </span>
                )}
              </div>

              {confirmOnSite && (
                <div className="pt-2.5 mt-2 border-t border-[#D5E8D8] space-y-2 text-[11.5px] animate-fadeIn">
                  <div className="flex items-center gap-4">
                    <span className="text-[#3F5946] font-semibold">Hình thức hoàn cọc:</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMethod"
                        value="cash"
                        checked={refundMethod === 'cash'}
                        onChange={() => setRefundMethod('cash')}
                        className="accent-[#1E8347]"
                      />
                      <span className="font-medium text-[#2C2523]">Tiền mặt trực tiếp</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="refundMethod"
                        value="bank_transfer"
                        checked={refundMethod === 'bank_transfer'}
                        onChange={() => setRefundMethod('bank_transfer')}
                        className="accent-[#1E8347]"
                      />
                      <span className="font-medium text-[#2C2523]">Chuyển khoản ngay</span>
                    </label>
                  </div>

                  {refundMethod === 'bank_transfer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 bg-white p-2.5 rounded-lg border border-[#D5E8D8]">
                      <div>
                        <span className="text-[10.5px] text-[#7A6A6B] block mb-0.5">Ngân hàng</span>
                        <Input
                          size="small"
                          placeholder="VD: Vietcombank, MB..."
                          value={onSiteBankName}
                          onChange={(e) => setOnSiteBankName(e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10.5px] text-[#7A6A6B] block mb-0.5">Số tài khoản (STK)</span>
                        <Input
                          size="small"
                          placeholder="Nhập STK của khách..."
                          value={onSiteAccountNum}
                          onChange={(e) => setOnSiteAccountNum(e.target.value)}
                          className="text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10.5px] text-[#7A6A6B] block mb-0.5">Chủ tài khoản</span>
                        <Input
                          size="small"
                          placeholder="TÊN CHỦ TÀI KHOẢN"
                          value={onSiteAccountHolder}
                          onChange={(e) => setOnSiteAccountHolder(e.target.value.toUpperCase())}
                          className="text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[#2E7D47] m-0">
                    ✓ Sau khi xác nhận, hệ thống sẽ <strong>quyết toán hoàn cọc {fmtVnd(finalRefund)}</strong> và chuyển đơn sang <strong>Hoàn tất</strong> ngay lập tức.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions - Nút bấm thu gọn */}
          <div className="flex gap-2.5 pt-1">
            {isReadOnly ? (
              <div className="flex w-full gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl border border-[#EFE5E1] text-[12px] font-bold text-[#5F4E50] hover:bg-[#FAF5F2] transition-colors bg-transparent cursor-pointer"
                >
                  {isCompletedOrder ? 'Đóng Hồ Sơ Lưu Trữ' : isCustomerApproved ? 'Đóng (Khách Đã Duyệt - Hồ Sơ Đã Khóa)' : 'Đóng'}
                </button>
                {!isCompletedOrder && !isCustomerApproved && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2 rounded-xl bg-[#733F49] text-[12px] font-bold text-white hover:bg-[#5C3038] transition-colors border-0 cursor-pointer shadow-xs"
                  >
                    Chỉnh Sửa Số Tiền Trừ / Bồi Thường
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (isReturnedOrder) setIsEditing(false);
                    else onClose();
                  }}
                  className="flex-1 py-2 rounded-xl border border-[#EFE5E1] text-[12px] font-bold text-[#5F4E50] hover:bg-[#FAF5F2] transition-colors bg-transparent cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-white transition-colors border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs ${
                    confirmOnSite ? 'bg-[#1E8347] hover:bg-[#166534]' : 'bg-[#733F49] hover:bg-[#5C3038]'
                  }`}
                >
                  {submitting ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : confirmOnSite ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  <span>
                    {confirmOnSite ? 'Xác Nhận & Hoàn Cọc Cho Khách' : 'Lưu và Gửi Biên Bản Cho Khách Hàng'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefundModal({ order, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [refundMethod, setRefundMethod] = useState('bank_transfer');
  const [refundNote, setRefundNote] = useState('');
  const [inspectionData, setInspectionData] = useState(null);

  useEffect(() => {
    getReturnInspection(order._id)
      .then((res) => {
        const insp = res?.data || res;
        if (insp && (insp.itemsCondition || insp.totalDeduction !== undefined)) {
          setInspectionData(insp);
        }
      })
      .catch(() => { });
  }, [order._id]);

  const lateDays = inspectionData?.lateDays ?? calcLate(order.rentalEndDate);
  const lateFee = inspectionData?.latePenaltyFee ?? 0;
  const compensation = inspectionData?.itemsCondition?.reduce((sum, item) => sum + (item.repairFee || 0), 0) ?? 0;
  const totalDeduction = inspectionData?.totalDeduction ?? (lateFee + compensation);
  const finalRefund = inspectionData?.finalRefundAmount ?? Math.max(0, (order.totalDeposit ?? 0) - totalDeduction);

  const handleConfirmRefund = async () => {
    setSubmitting(true);
    try {
      await updateOrderStatus(order._id, 'completed');
      recordCompletedOrderMaintenance(order);
      message.success(`Đã hoàn tất quyết toán cọc ${fmtVnd(finalRefund)} cho khách hàng! Đơn hàng đã chuyển vào Hồ Sơ Lưu Trữ.`);
      onSuccess();
    } catch {
      message.error('Quyết toán hoàn cọc thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EFE5E1]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0E6E2] bg-[#F4FAF6] rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F7ED] flex items-center justify-center text-[#1E8347] shrink-0">
              <Banknote size={20} />
            </div>
            <div>
              <h3 className="font-playfair text-[18px] font-bold text-[#196C3B]">
                Quyết Toán và Hoàn Cọc Cho Khách (Bước 2)
              </h3>
              <p className="text-[11.5px] text-[#6E8276]">
                Đơn #{order.orderCode} • Hoàn trả tiền cọc bảo lãnh sau khi đã qua bước kiểm định
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5EFE8] text-[#4F6858] hover:text-[#196C3B] flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs font-jakarta">
          {/* Thông tin khách hàng và Hiện trạng kiểm định */}
          <div className="p-3.5 rounded-xl bg-[#FAF5F2] border border-[#F0E6E2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#8C7D7E]">Khách hàng nhận hoàn cọc:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#2C2523] text-[13px]">{order.customerName}</span>
                {order.hasAccount || order.customerId ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#FAF0EC] text-[#733F49] border border-[#F2D8D4]">
                    <UserCheck size={10} className="text-[#B8737D]" /> Thành Viên
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-[#F5F2F0] text-[#7A6A6B] border border-[#E8DFDC]">
                    <UserX size={10} className="text-[#A39192]" /> Khách Vãng Lai
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8C7D7E]">Số điện thoại liên hệ:</span>
              <span className="font-semibold text-[#2C2523]">{order.customerPhone || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#EFE2DC]">
              <span className="text-[#8C7D7E]">Tình trạng kiểm định:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#1E8347] bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} />
                {totalDeduction === 0 ? 'Phom dáng 100% nguyên vẹn (Đạt)' : `Đã khấu trừ bồi thường (${fmtVnd(totalDeduction)})`}
              </span>
            </div>
          </div>

          {/* Chi tiết tính toán hoàn trả */}
          <div className="p-4 rounded-xl bg-[#FFF9F6] border border-[#F2E5E0] space-y-2.5">
            <div className="flex justify-between text-[#7A6B6C]">
              <span>1. Tiền cọc bảo lãnh ban đầu:</span>
              <span className="font-semibold text-[#2C2523]">{fmtVnd(order.totalDeposit)}</span>
            </div>
            {lateDays > 0 && (
              <div className="flex justify-between text-[#92400E]">
                <span>2. Khấu trừ phí trả trễ ({lateDays} ngày):</span>
                <span className="font-semibold">-{fmtVnd(lateFee)}</span>
              </div>
            )}
            {compensation > 0 && (
              <div className="flex justify-between text-[#B84E5D]">
                <span>3. Khấu trừ chi phí phục hồi / hư hại:</span>
                <span className="font-semibold">-{fmtVnd(compensation)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2.5 mt-2 border-t border-[#ECDCD6]">
              <div>
                <span className="font-bold text-[13px] text-[#2C2523] block">SỐ TIỀN THỰC TẾ HOÀN TRẢ:</span>
                <span className="text-[11px] text-[#8C7D7E]">Đúng theo biên bản kiểm định đối soát</span>
              </div>
              <span className="font-playfair text-[20px] font-bold text-[#1E8347]">
                {fmtVnd(finalRefund)}
              </span>
            </div>
          </div>

          {/* Lựa chọn phương thức hoàn tiền */}
          <div className="p-3.5 rounded-xl border border-[#EFE5E1] bg-white space-y-3">
            <label className="font-bold text-[#2C2523] block">
              Phương thức hoàn trả tiền cọc cho khách:
            </label>
            <Radio.Group
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="flex flex-col gap-2"
            >
              <Radio value="bank_transfer">
                <span className="font-medium text-[#2C2523]">Chuyển khoản trực tuyến (Internet Banking)</span>
              </Radio>
              <Radio value="cash">
                <span className="font-medium text-[#2C2523]">Tiền mặt trực tiếp tại quầy Showroom</span>
              </Radio>
              <Radio value="card">
                <span className="font-medium text-[#2C2523]">Hoàn trả vào thẻ ngân hàng / Cổng thanh toán</span>
              </Radio>
            </Radio.Group>

            <div>
              <label className="text-[11.5px] text-[#8C7D7E] block mb-1">
                Ghi chú đối soát / Mã giao dịch ngân hàng (Tùy chọn):
              </label>
              <Input
                placeholder="VD: Đã chuyển khoản qua STK Vietcombank lúc 15:30, mã GD: FT26001..."
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                className="text-[12px] rounded-lg"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#EFE5E1] text-[12px] font-bold text-[#5F4E50] hover:bg-[#FAF5F2] transition-colors bg-transparent cursor-pointer"
            >
              Hủy / Để Sau
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmRefund}
              className="flex-1 py-2.5 rounded-xl bg-[#1E8347] text-[12px] font-bold text-white hover:bg-[#166534] transition-colors border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>Xác Nhận Đã Hoàn Cọc và Đóng Đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderRentalManagement() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const isStaffContext =
    location.pathname.startsWith('/staff') ||
    (user?.role === 'staff' && !location.pathname.startsWith('/admin'));

  const queryOrderCode = searchParams.get('orderCode') || searchParams.get('search') || '';
  const queryAction = searchParams.get('action') || '';

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activePage, setActivePage] = useState(1);

  // Lưu trữ chỉ số thống kê toàn hệ thống showroom (không bị nhảy về 0 khi tìm kiếm)
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    renting: 0,
    completed: 0,
    cancelled: 0,
    active: 0,
  });

  const [searchTerm, setSearchTerm] = useState(queryOrderCode);
  const [highlightedOrderCode, setHighlightedOrderCode] = useState(queryOrderCode);
  const autoHandledRef = useRef(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' (Đơn Đang Xử Lý) | 'archived' (Kho Lưu Trữ)

  const [inspectionOrder, setInspectionOrder] = useState(null); // for inspection modal (bước 1)
  const [refundOrder, setRefundOrder] = useState(null); // for refund modal (bước 2)
  const [detailOrder, setDetailOrder] = useState(null); // for detail modal (chi tiết đơn thuê)
  const [statusMenuId, setStatusMenuId] = useState(null); // row dropdown open id

  const isArchived = (order) => order.status === 'completed' || order.status === 'complete' || order.status === 'cancelled';
  const activeOrdersCount = useMemo(() => {
    return globalStats.active ?? (globalStats.total - ((globalStats.completed || 0) + (globalStats.cancelled || 0))) ?? 0;
  }, [globalStats]);

  const archivedOrdersCount = useMemo(() => {
    return ((globalStats.completed || 0) + (globalStats.cancelled || 0)) || 0;
  }, [globalStats]);

  // ── Load orders ──────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: activePage, limit: PAGE_SIZE };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (!searchTerm.trim()) {
        params.viewMode = viewMode;
      }

      const result = await getAllOrdersAdmin(params);
      const rawList = result.orders || [];

      setOrders(rawList);
      setTotal(result.total ?? rawList.length);
      setTotalPages(result.totalPages || Math.ceil((result.total || rawList.length) / PAGE_SIZE));
      if (result.stats) {
        setGlobalStats(result.stats);
      }
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
  }, [activePage, statusFilter, searchTerm, viewMode]);

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

  // ── Tự động nhảy vào chính đơn và mở quy trình kiểm định nếu điều hướng từ Lịch Tổng Quan ──
  useEffect(() => {
    if (!queryOrderCode || autoHandledRef.current) return;
    if (loading && orders.length === 0) return;

    const cleanQ = queryOrderCode.trim().toLowerCase().replace(/^[#\s]+/, '');
    const found = orders.find((o) => {
      const code = (o.orderCode || o._id || o.id || '').toLowerCase().replace(/^[#\s]+/, '');
      return code === cleanQ;
    });

    if (found) {
      autoHandledRef.current = true;
      setHighlightedOrderCode(found.orderCode || found._id);
      if (isArchived(found)) {
        setViewMode('archived');
      } else {
        setViewMode('active');
      }

      if (queryAction === 'inspect') {
        setInspectionOrder(found);
      }

      setTimeout(() => {
        const rowId = `order-row-${found.orderCode || found._id}`;
        const el = document.getElementById(rowId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);

      const timer = setTimeout(() => {
        setHighlightedOrderCode(null);
      }, 6000);
      return () => clearTimeout(timer);
    } else if (!loading) {
      // Trường hợp đơn hàng không nằm ở trang 1, gọi getOrder để nạp trực tiếp
      getOrder(cleanQ)
        .then((detail) => {
          if (detail) {
            autoHandledRef.current = true;
            setHighlightedOrderCode(detail.orderCode || detail._id);
            if (isArchived(detail)) {
              setViewMode('archived');
            } else {
              setViewMode('active');
            }
            setOrders((prev) => {
              const exists = prev.some(
                (o) => (o.orderCode || o._id) === (detail.orderCode || detail._id)
              );
              return exists ? prev : [detail, ...prev];
            });

            if (queryAction === 'inspect') {
              setInspectionOrder(detail);
            }

            setTimeout(() => {
              const rowId = `order-row-${detail.orderCode || detail._id}`;
              const el = document.getElementById(rowId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 350);

            const timer = setTimeout(() => {
              setHighlightedOrderCode(null);
            }, 6000);
            return () => clearTimeout(timer);
          }
        })
        .catch(() => {});
    }
  }, [queryOrderCode, queryAction, orders, loading]);

  // ── Stats derived from orders ────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: globalStats.total || orders.length,
      renting: globalStats.renting || orders.filter((o) => o.status === 'renting').length,
      completed: globalStats.completed || orders.filter((o) => o.status === 'completed' || o.status === 'complete').length,
      cancelled: globalStats.cancelled || orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [globalStats, orders]);

  // ── Đơn hàng có khiếu nại từ khách hàng ─────────────────────────────────
  const disputedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.inspection?.customerStatus === 'disputed' ||
        o.inspectionCustomerStatus === 'disputed' ||
        o.status === 'disputed'
    );
  }, [orders]);

  const notifiedDisputesRef = useRef(new Set());

  // Hiển thị thông báo nổi lên (pop-up notification) ngay khi phát hiện đơn hàng có khiếu nại
  useEffect(() => {
    if (disputedOrders.length > 0) {
      disputedOrders.forEach((ord) => {
        const key = `dispute_${ord._id || ord.orderCode}`;
        if (!notifiedDisputesRef.current.has(key)) {
          notifiedDisputesRef.current.add(key);
          notification.error({
            key,
            message: (
              <span className="font-bold text-red-900 text-[13.5px]">
                ⚠️ CÓ ĐƠN KHIẾU NẠI CẦN XỬ LÝ GẤP
              </span>
            ),
            description: (
              <div className="space-y-1.5 text-xs font-jakarta">
                <p className="m-0 text-[#2C2523]">
                  Đơn hàng <strong>#{ord.orderCode}</strong> — Khách hàng <strong>{ord.customerName}</strong> ({ord.customerPhone || 'SĐT'}) vừa gửi khiếu nại về biên bản kiểm định.
                </p>
                {ord.inspection?.disputeReason && (
                  <p className="m-0 text-red-700 italic bg-red-50 p-2 rounded-lg border border-red-200">
                    "{ord.inspection.disputeReason}"
                  </p>
                )}
                <div className="pt-1.5 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      notification.destroy(key);
                      setInspectionOrder(ord);
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold border-0 cursor-pointer shadow-xs transition-colors"
                  >
                    Xem và Xử Lý Ngay →
                  </button>
                </div>
              </div>
            ),
            duration: 12,
            placement: 'topRight',
          });
        }
      });
    }
  }, [disputedOrders]);

  // ── Client-side filter (for demo fallback và search) ───────────────────────
  const filteredOrders = useMemo(() => {
    const qRaw = searchTerm.trim().toLowerCase();
    const cleanQ = qRaw.replace(/^[#\s]+/, '');

    return orders.filter((o) => {
      const matchSearch =
        !cleanQ ||
        (o.orderCode || '').toLowerCase().includes(cleanQ) ||
        `#${(o.orderCode || '').toLowerCase()}`.includes(qRaw) ||
        (o.customerName || '').toLowerCase().includes(qRaw) ||
        (o.customerPhone || '').includes(cleanQ) ||
        (o.items || []).some((it) => {
          const c = getDressCode(it);
          return (it.name || '').toLowerCase().includes(qRaw) || (c && c.toLowerCase().includes(cleanQ));
        });

      const isDisputed =
        o.inspection?.customerStatus === 'disputed' ||
        o.inspectionCustomerStatus === 'disputed' ||
        o.status === 'disputed';

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'disputed'
          ? isDisputed
          : o.status === statusFilter;

      // Khi người dùng đang tìm kiếm cụ thể: Hiển thị ngay kết quả kể cả đơn nằm ở Kho Lưu Trữ
      if (cleanQ) {
        return matchSearch && matchStatus;
      }

      // Khi lọc đơn khiếu nại: Hiển thị luôn không phân biệt active/archived
      if (statusFilter === 'disputed') {
        return matchSearch && isDisputed;
      }

      // Khi không tìm kiếm: Phân tách rõ ràng giữa Đơn Đang Xử Lý và Kho Lưu Trữ
      if (viewMode === 'active' && isArchived(o)) return false;
      if (viewMode === 'archived' && !isArchived(o)) return false;

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter, viewMode]);

  const selectedFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.value === statusFilter)?.label ?? 'Tất Cả Trạng Thái';

  // ── Pagination helper ────────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // Khi ở trang 1 hoặc 2: hiển thị 1, 2, 3 ... (totalPages - 1), totalPages
    if (activePage < 3) {
      return [1, 2, 3, '...', totalPages - 1, totalPages];
    }
    // Khi ở các trang cuối:
    if (activePage >= totalPages - 2) {
      return ['...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    // Khi ấn đến 3 trở đi: thu số 1 về (thay bằng '...'), hiện 4 -> ... 2, 3, 4 ...
    if (activePage + 2 >= totalPages - 1) {
      return ['...', activePage - 1, activePage, activePage + 1, totalPages - 1, totalPages];
    }
    return ['...', activePage - 1, activePage, activePage + 1, '...', totalPages - 1, totalPages];
  }, [activePage, totalPages]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout activeMenu="don-thue" role={isStaffContext ? 'staff' : 'admin'}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-[32px] sm:text-[38px] font-normal text-[#5F2B36] tracking-tight leading-tight mb-2">
            Quản Lý Đơn Thuê
          </h1>
          <p className="text-[14px] text-[#7A6B6C] font-normal max-w-3xl leading-relaxed">
            Theo dõi, điều phối tiến độ đơn thuê váy cưới và biên bản kiểm định hoàn cọc hệ thống UniBridal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            loadOrders();
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8DDD8] bg-white text-[#5F2B36] hover:bg-[#FAF0EC] text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-60"
          title="Làm mới danh sách đơn thuê từ máy chủ"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* Banner thông báo nổi bật khi có đơn khiếu nại */}
      {disputedOrders.length > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FEF2F2] via-[#FFF1F2] to-[#FEF2F2] border-2 border-red-300 shadow-md space-y-3 font-jakarta animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="font-bold text-red-900 text-[14px] sm:text-[15.5px] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>CẢNH BÁO: CÓ {disputedOrders.length} ĐƠN HÀNG ĐANG BỊ KHÁCH KHIẾU NẠI!</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('disputed');
                setActivePage(1);
              }}
              className="text-xs font-bold text-red-700 hover:text-red-900 underline cursor-pointer bg-transparent border-0"
            >
              Lọc danh sách {disputedOrders.length} đơn khiếu nại →
            </button>
          </div>

          <div className="space-y-2">
            {disputedOrders.map((ord) => (
              <div
                key={ord._id || ord.orderCode}
                className="p-3.5 bg-white/95 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-md border border-red-200">
                      #{ord.orderCode}
                    </span>
                    <strong className="text-gray-900 text-[13px]">{ord.customerName}</strong>
                    <span className="text-gray-500 font-medium">({ord.customerPhone || 'Không có SĐT'})</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-700 font-medium">
                      {ord.items?.[0]?.name || ord.dress || 'Lễ phục'}
                    </span>
                  </div>
                  {ord.inspection?.disputeReason && (
                    <p className="text-red-700 italic m-0 bg-red-50/80 p-2 rounded-lg border border-red-100">
                      <strong>Lý do khiếu nại:</strong> "{ord.inspection.disputeReason}"
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setInspectionOrder(ord)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5 border-0"
                >
                  <AlertCircle size={14} />
                  <span>Xem và Xử Lý Khiếu Nại Ngay</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Tổng đơn */}
        <div
          onClick={() => { setViewMode('active'); setStatusFilter('all'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDCE1_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] py-4 px-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#B8737D]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                TỔNG ĐƠN THUÊ
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F4EDE6] flex items-center justify-center text-[#8C6D62]">
                <HangerIcon size={17} strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#2C2523] leading-none">
                {loading && !stats.total ? '—' : stats.total}
              </span>
              <span className="text-[12px] font-medium text-[#8C7D7E] ml-1.5">đơn</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đang thuê */}
        <div
          onClick={() => { setViewMode('active'); setStatusFilter('renting'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#EDE9FE_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] py-4 px-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#6D28D9]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐANG THUÊ
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#6D28D9]">
                <CalendarDays size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#6D28D9] leading-none">
                {loading && !stats.total ? '—' : stats.renting}
              </span>
              <span className="text-[12px] font-medium text-[#8C7D7E] ml-1.5">đơn</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hoàn tất (Kho Lưu Trữ) */}
        <div
          onClick={() => { setViewMode('archived'); setStatusFilter('all'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#DEF5E7_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] py-4 px-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#229A53]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐÃ HOÀN TẤT (LƯU KHO)
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#229A53]">
                <Archive size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#1E8347] leading-none">
                {loading && !stats.total ? '—' : stats.completed}
              </span>
              <span className="text-[12px] font-medium text-[#8C7D7E] ml-1.5">đơn</span>
            </div>
          </div>
        </div>

        {/* Card 4: Đã hủy */}
        <div
          onClick={() => { setViewMode('archived'); setStatusFilter('cancelled'); setActivePage(1); }}
          className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FCDFD9_0%,_transparent_70%)] rounded-2xl border border-[#EFE5E1] py-4 px-5 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md hover:border-[#B8737D]/50 transition-all"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#736364] uppercase">
                ĐÃ HỦY
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FDECEE] flex items-center justify-center text-[#B8737D]">
                <Clock size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#A84A58] leading-none">
                {loading && !stats.total ? '—' : stats.cancelled}
              </span>
              <span className="text-[12px] font-medium text-[#8C7D7E] ml-1.5">đơn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search và Filter Bar (Tích hợp tìm kiếm và tab Đơn Đang Xử Lý / Kho Lưu Trữ) */}
      <div className="bg-white p-2 rounded-2xl border border-[#EFE5E1] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39192]" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại, váy thuê..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActivePage(1); }}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#EFE5E1] bg-[#FCF7F4] text-sm text-[#302626] placeholder-[#A39293] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 focus:border-[#B8737D] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setActivePage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39192] hover:text-[#5F333B] cursor-pointer bg-transparent border-0 p-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => { setViewMode('active'); setStatusFilter('all'); setActivePage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-0 ${
              viewMode === 'active'
                ? 'bg-[#733F49] text-white shadow-xs'
                : 'bg-[#FCF7F4] text-[#7A6B6C] hover:bg-[#FAF0EC] hover:text-[#733F49]'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Đơn Đang Xử Lý</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-[#FAF0EC] text-[#733F49]'
              }`}
            >
              {activeOrdersCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setViewMode('archived'); setStatusFilter('all'); setActivePage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-0 ${
              viewMode === 'archived'
                ? 'bg-[#1E8347] text-white shadow-xs'
                : 'bg-[#FCF7F4] text-[#7A6B6C] hover:bg-[#FAF0EC] hover:text-[#733F49]'
            }`}
          >
            <Archive size={14} />
            <span>Kho Lưu Trữ Đơn Hoàn Tất</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                viewMode === 'archived' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#1E8347]'
              }`}
            >
              {archivedOrdersCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3]">
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase">
                  MÃ ĐƠN
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  KHÁCH HÀNG
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  VÁY THUÊ
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  NGÀY THUÊ
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  TIỀN CỌC
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
                  TRẠNG THÁI
                </th>
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center">
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
                  const isDisputed =
                    order.inspection?.customerStatus === 'disputed' ||
                    order.inspectionCustomerStatus === 'disputed' ||
                    order.status === 'disputed';
                  const isHighlighted =
                    highlightedOrderCode &&
                    ((order.orderCode && order.orderCode.toLowerCase().replace(/^[#\s]+/, '') === highlightedOrderCode.toLowerCase().replace(/^[#\s]+/, '')) ||
                      order._id === highlightedOrderCode);

                  return (
                    <tr
                      id={`order-row-${order.orderCode || order._id}`}
                      key={order._id || order.orderCode}
                      className={`transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-amber-100/80 border-l-4 border-l-amber-500 ring-2 ring-amber-400 ring-inset shadow-md'
                          : isDisputed
                          ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500'
                          : 'hover:bg-[#FCF9F7]'
                      }`}
                    >
                      {/* Mã đơn */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded bg-[#F6EDE8] text-[#846E63] font-mono text-[11px] font-semibold tracking-wider">
                            {order.orderCode || order._id}
                          </span>
                          {isHighlighted && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-500 text-white animate-bounce shadow-2xs">
                              Đang Chọn
                            </span>
                          )}
                          {isArchived(order) && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#EAF7EE] text-[#1E8347] border border-[#C6F0D4]">
                              Kho Lưu Trữ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold text-[#2C2523] leading-tight">
                            {order.customerName || '—'}
                          </span>
                          {(order.hasAccount || order.customerId) && (
                            <Crown size={14} className="text-[#D4AF37] fill-[#FDF3D6] shrink-0" title="Khách hàng thành viên" />
                          )}
                        </div>
                      </td>

                      {/* Váy thuê */}
                      <td className="py-4 px-4 text-center">
                        <div className="text-[13px] font-semibold text-[#2C2523] leading-tight text-center">
                          {firstItem.name || '—'}
                        </div>
                        {order.items?.length > 1 && (
                          <div className="text-[11px] text-[#8C7D7E] font-medium mt-0.5">
                            (+{order.items.length - 1} váy khác)
                          </div>
                        )}
                      </td>

                      {/* Ngày thuê */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-[#FAF0EC] text-[#733F49] text-[12px] font-bold border border-[#F2D8D4]">
                          {getRentalDays(order)} ngày
                        </span>
                      </td>

                      {/* Tiền cọc */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
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
                        <StatusBadge status={order.status} order={order} />
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-2">
                          {/* Nút Xem Chi Tiết Đơn Thuê */}
                          <button
                            type="button"
                            onClick={() => setDetailOrder(order)}
                            title="Xem chi tiết đầy đủ đơn thuê"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF0EC] hover:bg-[#F3E2DB] border border-[#ECD9D3] text-[#733F49] text-[12px] font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>Chi Tiết</span>
                          </button>
                          {/* ĐỐI VỚI CÁC ĐƠN ĐÃ HOÀN TẤT TRONG KHO LƯU TRỮ */}
                          {isArchived(order) ? (
                            <button
                              type="button"
                              onClick={() => setInspectionOrder(order)}
                              title="Xem biên bản kiểm định và hồ sơ lưu trữ"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF7EE] border border-[#C6F0D4] text-[#1E8347] text-[12px] font-bold hover:bg-[#D5EFE0] transition-all cursor-pointer shadow-2xs"
                            >
                              <FileText size={13} />
                              <span>Hồ Sơ Lưu Trữ</span>
                            </button>
                          ) : order.status === 'renting' ? (
                            <button
                              type="button"
                              onClick={() => setInspectionOrder(order)}
                              title="Bước 1: Tiếp nhận và Kiểm định hiện trạng váy khi khách trả"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#733F49] text-white text-[12px] font-bold hover:bg-[#5C3038] shadow-xs transition-all cursor-pointer"
                            >
                              <ShieldCheck size={13} />
                              <span>Kiểm Định Trả Váy</span>
                            </button>
                          ) : order.status === 'returned' || isDisputed ? (
                            <button
                              type="button"
                              onClick={() => setInspectionOrder(order)}
                              title={isDisputed ? 'Khách đã gửi khiếu nại — Nhấn để xem và đối soát xử lý' : 'Xem biên bản kiểm định hiện trạng'}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer border ${
                                isDisputed
                                  ? 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-xs'
                                  : 'bg-[#FAF0EB] text-[#733F49] hover:bg-[#F3E2DB] border-[#ECD9D3]'
                              }`}
                            >
                              {isDisputed ? (
                                <>
                                  <AlertTriangle size={13} />
                                  <span>Xử Lý Khiếu Nại</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={13} />
                                  <span>Xem Kiểm Định</span>
                                </>
                              )}
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
          <div className="text-[12.5px] text-[#7A6B6C]">
            <span>
              Hiển thị{' '}
              <span className="font-bold text-[#5F2B36]">
                {total > 0 ? `${(activePage - 1) * PAGE_SIZE + 1} – ${Math.min(activePage * PAGE_SIZE, total)}` : 0}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-bold text-[#2C2523]">{total}</span> đơn
            </span>
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
                <button
                  key={`ellipsis-${idx}`}
                  type="button"
                  title={idx === 0 ? 'Về các trang trước' : 'Đến các trang sau'}
                  onClick={() => {
                    if (idx === 0) setActivePage((prev) => Math.max(1, prev - 3));
                    else setActivePage((prev) => Math.min(totalPages, prev + 3));
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#8C7D7E] text-xs font-bold hover:bg-[#F5ECE8] hover:text-[#78434D] transition-colors cursor-pointer"
                >
                  ...
                </button>
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

      {/* Bước 1: Inspection Modal (Biên bản kiểm định trả váy) */}
      {inspectionOrder && (
        <InspectionModal
          order={inspectionOrder}
          onClose={() => setInspectionOrder(null)}
          onSuccess={() => {
            const updatedId = inspectionOrder._id;
            setInspectionOrder(null);
            setOrders((prev) => {
              const next = prev.map((o) => (o._id === updatedId ? { ...o, status: 'returned' } : o));
              try {
                localStorage.setItem('unibridal_orders_local', JSON.stringify(next));
              } catch { }
              return next;
            });
            loadOrders();
          }}
        />
      )}

      {/* Bước 2: Refund Modal (Quyết toán và Hoàn tiền cọc sau kiểm định) */}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onSuccess={() => {
            const updatedId = refundOrder._id;
            setRefundOrder(null);
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

      {/* Modal Chi Tiết Đơn Thuê */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
