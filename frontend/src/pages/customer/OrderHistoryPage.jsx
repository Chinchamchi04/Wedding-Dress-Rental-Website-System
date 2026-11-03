import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import {
  Heart,
  Search,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  ShieldCheck,
  Clock,
  X,
  Banknote,
  Send,
  MessageSquare,
  Building2,
  CreditCard,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  formatVnd,
  getDemoOrders,
  getOrders,
  getReturnInspection,
  approveReturnInspection,
  disputeReturnInspection,
} from '../../services/orderService';
import elysianImage from '../../assets/card1_elysian.jpg';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang thuê & Chờ nhận' },
  { id: 'complete', label: 'Đã hoàn tất' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const POPULAR_BANKS = [
  'Vietcombank (VCB)',
  'MB Bank (Quân Đội)',
  'Techcombank (TCB)',
  'ACB (Á Châu)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'TPBank (Tiên Phong)',
  'BIDV (Đầu Tư và Phát Triển)',
  'VietinBank (Công Thương)',
  'Agribank (Nông Nghiệp)',
  'Sacombank (Sài Gòn Thương Tín)',
  'MSB (Hàng Hải)',
  'OCB (Phương Đông)',
  'HDBank (Phát Triển TP.HCM)',
  'VIB (Quốc Tế)',
  'SHB (Sài Gòn - Hà Nội)',
  'Khác (Tự nhập tên ngân hàng)',
];

/**
 * Modal Biên Bản Kiểm Định & Quyết Toán Hoàn Cọc (Khách Hàng)
 */
export function CustomerInspectionModal({ order, onClose, onUpdated }) {
  const [inspection, setInspection] = useState(order?.inspection || null);
  const [loading, setLoading] = useState(!order?.inspection);
  const [step, setStep] = useState('inspection'); // 'inspection' | 'bank_form'
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form thông tin tài khoản ngân hàng nhận hoàn cọc
  const [selectedBank, setSelectedBank] = useState('Vietcombank (VCB)');
  const [customBank, setCustomBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const defaultHolder = useMemo(() => {
    const raw = order.customerName || order.brideName || order.customer?.fullName || '';
    return raw.toUpperCase();
  }, [order]);
  const [accountHolder, setAccountHolder] = useState(defaultHolder);
  const [notes, setNotes] = useState(() => `Hoan coc don ${order.orderCode || order.id || ''}`);

  useEffect(() => {
    let active = true;
    getReturnInspection(order._id || order.id)
      .then((res) => {
        if (!active) return;
        const insp = res?.data || res;
        if (insp && (insp.itemsCondition || insp.totalDeduction !== undefined)) {
          setInspection(insp);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [order._id, order.id]);

  const customerStatus = inspection?.customerStatus || 'pending';
  const initialDeposit = inspection?.initialDeposit ?? order.totalDeposit ?? order.deposit ?? 0;
  const lateDays = inspection?.lateDays ?? 0;
  const lateFee = inspection?.latePenaltyFee ?? 0;
  const itemsCondition = inspection?.itemsCondition || [];
  const compensation = itemsCondition.reduce((sum, it) => sum + Number(it.repairFee || 0), 0);
  const totalDeduction = inspection?.totalDeduction ?? (lateFee + compensation);
  const finalRefund = inspection?.finalRefundAmount ?? Math.max(0, initialDeposit - totalDeduction);
  const evidencePhotos = inspection?.evidencePhotos || [];
  const refundBankDetails = inspection?.refundBankDetails || null;

  // Bước 2: Khách hàng điền xong STK và bấm xác nhận hoàn cọc
  const handleConfirmRefund = async (e) => {
    e?.preventDefault?.();
    const finalBank = selectedBank === 'Khác (Tự nhập tên ngân hàng)' ? customBank.trim() : selectedBank;
    if (!finalBank) {
      message.warning('Vui lòng chọn hoặc nhập tên ngân hàng thụ hưởng.');
      return;
    }
    if (!accountNumber.trim()) {
      message.warning('Vui lòng nhập số tài khoản ngân hàng (STK) nhận tiền hoàn cọc.');
      return;
    }
    if (!accountHolder.trim()) {
      message.warning('Vui lòng nhập tên chủ tài khoản nhận tiền.');
      return;
    }

    setSubmitting(true);
    try {
      const bankData = {
        bankName: finalBank,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
        notes: notes.trim(),
      };
      const res = await approveReturnInspection(order._id || order.id, bankData);
      message.success(
        `Nàng đã đồng ý biên bản kiểm định thành công! Hệ thống đã tự động hoàn trả ${formatVnd(
          finalRefund
        )} tiền cọc về tài khoản của nàng.`
      );
      if (res?.data?.inspection) {
        setInspection(res.data.inspection);
      } else {
        setInspection((prev) => ({
          ...prev,
          customerStatus: 'approved',
          isRefunded: true,
          refundBankDetails: bankData,
        }));
      }
      setStep('inspection');
      if (onUpdated) onUpdated();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Xác nhận hoàn cọc thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Khách hàng gửi đơn khiếu nại
  const handleSendDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      message.warning('Vui lòng nhập lý do nàng muốn khiếu nại.');
      return;
    }
    setSubmitting(true);
    try {
      await disputeReturnInspection(order._id || order.id, { reason: disputeReason.trim() });
      message.success(
        'Đã gửi đơn khiếu nại thành công! Chuyên viên chăm sóc khách hàng của UniBridal sẽ liên hệ trực tiếp với nàng trong vòng 24h.'
      );
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Gửi khiếu nại thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getConditionLabel = (cond) => {
    switch (cond) {
      case 'good':
        return { label: 'Tốt (100% nguyên vẹn)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'minor_stain':
        return { label: 'Vết bẩn nhỏ', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'heavy_damage':
        return { label: 'Hư hỏng nặng', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'torn_lace':
        return { label: 'Rách ren / đính kết', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      default:
        return { label: 'Đạt chuẩn', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-jakarta animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EFE5E1]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0E6E2] bg-[#FFF8F6] rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FDECEE] flex items-center justify-center text-[#B8737D] shrink-0">
              {step === 'bank_form' ? <CreditCard size={22} /> : <ShieldCheck size={22} />}
            </div>
            <div>
              <h3 className="font-playfair text-xl font-bold text-[#5F2B36] m-0">
                {step === 'bank_form'
                  ? 'Điền Tài Khoản Nhận Hoàn Cọc Tự Động'
                  : 'Biên Bản Kiểm Định Trả Váy & Quyết Toán Cọc'}
              </h3>
              <p className="text-xs text-[#8C7D7E] m-0 mt-0.5">
                Đơn hàng #{order.orderCode || order.id} • {step === 'bank_form' ? 'Nhận chuyển khoản tức thì 100% bảo mật' : 'Lập bởi chuyên viên Atelier UniBridal'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF2EE] text-[#7A6B6C] hover:text-[#5F2B36] flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nội dung Modal */}
        {step === 'bank_form' ? (
          /* ================= GIAO DIỆN FORM ĐIỀN STK NHẬN HOÀN CỌC TỰ ĐỘNG ================= */
          <form onSubmit={handleConfirmRefund} className="p-6 space-y-5 text-xs animate-fadeIn">
            {/* Hộp tổng kết tiền hoàn cọc */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Số tiền cọc thực nhận được hoàn lại
                </span>
                <span className="text-[11px] text-emerald-700">
                  (Tiền cọc ban đầu {formatVnd(initialDeposit)} - Khấu trừ {formatVnd(totalDeduction)})
                </span>
              </div>
              <span className="font-playfair text-2xl font-bold text-[#15803D]">
                {formatVnd(finalRefund)}
              </span>
            </div>

            {/* Thông tin điền Form */}
            <div className="space-y-4 bg-[#FFFDFC] p-5 rounded-2xl border border-[#F2E5E0]">
              {/* Chọn ngân hàng */}
              <div>
                <label className="block text-[12px] font-bold text-[#4A3B3D] mb-1.5 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#B8737D]" />
                  <span>Ngân hàng thụ hưởng <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D0CA] bg-white text-xs text-[#2C2523] outline-none focus:border-[#733F49] cursor-pointer"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {selectedBank === 'Khác (Tự nhập tên ngân hàng)' && (
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên ngân hàng của nàng (VD: Timo, Cake, PVcomBank...)"
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-[#E0D0CA] bg-white text-xs text-[#2C2523] outline-none focus:border-[#733F49]"
                  />
                )}
              </div>

              {/* Số tài khoản (STK) */}
              <div>
                <label className="block text-[12px] font-bold text-[#4A3B3D] mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-[#B8737D]" />
                  <span>Số tài khoản (STK) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số tài khoản ngân hàng của nàng"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D0CA] bg-white text-[14px] font-mono tracking-wider font-semibold text-[#2C2523] outline-none focus:border-[#733F49]"
                />
              </div>

              {/* Tên chủ tài khoản */}
              <div>
                <label className="block text-[12px] font-bold text-[#4A3B3D] mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#B8737D]" />
                  <span>Tên chủ tài khoản (Viết in hoa) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: NGUYEN QUYNH MAI"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D0CA] bg-white text-xs font-bold uppercase text-[#2C2523] outline-none focus:border-[#733F49]"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-[12px] font-medium text-[#7A6B6C] mb-1">
                  Nội dung chuyển khoản / Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Nội dung chuyển khoản hoàn cọc"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0D0CA] bg-white text-xs text-[#5F4E50] outline-none focus:border-[#733F49]"
                />
              </div>
            </div>

            {/* Thông báo cam kết */}
            <div className="p-3.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[11.5px] text-[#7A6B6C] flex items-start gap-2">
              <Sparkles size={16} className="text-[#B8737D] shrink-0 mt-0.5" />
              <span>
                Ngay khi nàng bấm xác nhận, hệ thống tự động hoàn tất quyết toán và chuyển số tiền{' '}
                <strong className="text-emerald-700">{formatVnd(finalRefund)}</strong> về số tài khoản trên, đồng thời gửi email biên nhận tới hộp thư của nàng.
              </span>
            </div>

            {/* Buttons điều hướng */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('inspection')}
                className="py-3 px-4 rounded-xl border border-[#E0D0CA] bg-white text-[#5F2B36] font-bold text-xs hover:bg-[#FAF2EE] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Xem Lại Biên Bản</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-5 rounded-xl bg-[#1E8347] text-white font-bold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 border-0 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{submitting ? 'Đang thực hiện hoàn cọc tự động...' : 'Xác Nhận & Nhận Hoàn Cọc Tự Động Ngay'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* ================= GIAO DIỆN XEM BIÊN BẢN KIỂM ĐỊNH HIỆN TRẠNG ================= */
          <div className="p-6 space-y-5 text-xs">
            {/* Status Alert Banner */}
            {customerStatus === 'disputed' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-amber-800">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>Nàng đã gửi khiếu nại về biên bản này</span>
                </div>
                <p className="italic bg-white p-2.5 rounded-xl border border-amber-100 text-[#4A3B3D] text-xs">
                  "{inspection?.disputeReason || 'Nàng chưa đồng ý với mức bồi thường khấu trừ'}"
                </p>
                <p className="text-[11.5px] text-amber-700 m-0">
                  Chuyên viên chăm sóc khách hàng của UniBridal đang đối soát lại hồ sơ và sẽ liên hệ hỗ trợ nàng sớm nhất.
                </p>
              </div>
            ) : customerStatus === 'approved' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <p className="font-bold text-[13.5px] text-emerald-800 m-0">
                    Nàng đã đồng ý với biên bản kiểm định &amp; nhận hoàn cọc tự động thành công!
                  </p>
                </div>
                <p className="text-[12px] text-emerald-700 m-0">
                  Số tiền cọc <strong>{formatVnd(finalRefund)}</strong> đã được hệ thống tự động hoàn trả.
                </p>
                {/* Chi tiết tài khoản đã nhận tiền hoàn cọc nếu có */}
                {refundBankDetails?.accountNumber && (
                  <div className="mt-2 p-3 bg-white/80 rounded-xl border border-emerald-200 text-[11.5px] text-[#2C2523] space-y-1">
                    <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-emerald-700" />
                      <span>Tài khoản thụ hưởng nhận tiền cọc:</span>
                    </div>
                    <div>• Ngân hàng: <strong>{refundBankDetails.bankName || 'Ngân hàng nội địa'}</strong></div>
                    <div>• Số tài khoản (STK): <strong className="font-mono text-[12.5px]">{refundBankDetails.accountNumber}</strong></div>
                    <div>• Chủ tài khoản: <strong>{refundBankDetails.accountHolder}</strong></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FFF6F3] border border-[#F3DDD7] text-[#5F2B36] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[13px]">
                  <Clock size={16} className="text-[#B8737D]" />
                  <span>Chờ nàng xác nhận biên bản kiểm định</span>
                </div>
                <p className="text-[12px] text-[#7A6B6C] m-0">
                  Vui lòng kiểm tra chi tiết hiện trạng váy và số tiền hoàn trả dưới đây. Khi nàng bấm <strong>"Đồng Ý"</strong>, hệ thống sẽ mở form để nàng điền tài khoản ngân hàng (STK) nhận hoàn cọc tự động ngay; nếu nàng thấy chưa hợp lý, nàng có quyền <strong>"Gửi Khiếu Nại"</strong>.
                </p>
              </div>
            )}

            {/* Chi tiết hiện trạng từng lễ phục */}
            <div>
              <h4 className="font-bold text-[13px] text-[#2C2523] mb-3 uppercase tracking-wider text-[11px] text-[#8C7D7E]">
                1. Hiện Trạng Lễ Phục Khi Bàn Giao Trả
              </h4>
              {itemsCondition.length === 0 ? (
                <div className="p-4 rounded-xl border border-[#EFE5E1] bg-[#FAF5F2] text-center text-[#8C7D7E]">
                  Lễ phục bàn giao nguyên vẹn, đạt chuẩn kiểm định 100%.
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsCondition.map((item, idx) => {
                    const cond = getConditionLabel(item.condition);
                    const fee = Number(item.repairFee || 0);
                    return (
                      <div key={idx} className="p-4 rounded-2xl border border-[#EFE5E1] bg-white space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-[13.5px] text-[#5F2B36]">
                            {order.items?.[idx]?.name || order.dress || `Lễ phục #${idx + 1}`}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cond.color}`}>
                            {cond.label}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-[12px] text-[#5F4E50] bg-[#FAF5F2] p-2.5 rounded-xl border border-[#F0E6E2] m-0">
                            <strong className="text-[#8C7D7E]">Ghi chú thẩm định:</strong> {item.note}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-1 text-[12px]">
                          <span className="text-[#8C7D7E]">Mức khấu trừ phục hồi hư hại:</span>
                          <span className={`font-bold ${fee > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {fee > 0 ? `-${formatVnd(fee)}` : '0 ₫ (Không khấu trừ)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ảnh bằng chứng hiện trạng váy */}
            {evidencePhotos.length > 0 && (
              <div>
                <h4 className="font-bold text-[13px] text-[#2C2523] mb-2 uppercase tracking-wider text-[11px] text-[#8C7D7E] flex items-center gap-1.5">
                  <Camera size={14} className="text-[#733F49]" />
                  <span>Ảnh Chụp Đối Soát Hiện Trạng Tại Showroom ({evidencePhotos.length} ảnh)</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {evidencePhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5D7D0]">
                      <img src={photo} alt={`Chứng cứ ${pIdx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bảng tính quyết toán tiền cọc */}
            <div>
              <h4 className="font-bold text-[13px] text-[#2C2523] mb-2.5 uppercase tracking-wider text-[11px] text-[#8C7D7E]">
                2. Bảng Quyết Toán Tiền Cọc Bảo Lãnh
              </h4>
              <div className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#F2E5E0] space-y-2.5 text-[12.5px]">
                <div className="flex justify-between text-[#7A6B6C]">
                  <span>Tiền cọc bảo lãnh ban đầu của đơn:</span>
                  <span className="font-semibold text-[#2C2523]">{formatVnd(initialDeposit)}</span>
                </div>
                {lateDays > 0 && (
                  <div className="flex justify-between text-[#92400E]">
                    <span>Phí trễ hạn ({lateDays} ngày):</span>
                    <span className="font-semibold">-{formatVnd(lateFee)}</span>
                  </div>
                )}
                {compensation > 0 && (
                  <div className="flex justify-between text-[#B84E5D]">
                    <span>Khấu trừ chi phí phục hồi / hư hại:</span>
                    <span className="font-semibold">-{formatVnd(compensation)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-[#ECDCD6]">
                  <div>
                    <span className="font-bold text-[14px] text-[#5F2B36] block">
                      SỐ TIỀN CỌC HOÀN TRẢ NÀNG:
                    </span>
                    <span className="text-[11px] text-[#8C7D7E]">
                      Chuyển khoản trực tiếp về tài khoản ngân hàng (STK)
                    </span>
                  </div>
                  <span className="font-playfair text-[22px] font-bold text-[#1E8347]">
                    {formatVnd(finalRefund)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form gửi khiếu nại (nếu khách bấm khiếu nại) */}
            {isDisputing && customerStatus === 'pending' && (
              <form onSubmit={handleSendDispute} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                  <MessageSquare size={16} />
                  <span>Nội dung khiếu nại về biên bản kiểm định:</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="VD: Tôi thấy khoản trừ hư hỏng 500.000đ chưa hợp lý vì vết nhỏ ở chân gấu váy đã có từ trước khi nhận váy..."
                  className="w-full p-3 rounded-xl border border-rose-200 bg-white text-xs outline-none focus:border-rose-400 text-[#2C2523]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDisputing(false)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-800 bg-white font-semibold text-xs cursor-pointer hover:bg-rose-100"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs cursor-pointer hover:bg-rose-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{submitting ? 'Đang gửi...' : 'Gửi Đơn Khiếu Nại'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Hành động dưới modal */}
            <div className="pt-2">
              {customerStatus === 'pending' && !isDisputing ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDisputing(true)}
                    className="py-3 px-4 rounded-xl border border-rose-200 bg-white text-rose-800 font-bold text-xs hover:bg-rose-50 transition-colors cursor-pointer text-center"
                  >
                    Tôi Có Thắc Mắc / Gửi Khiếu Nại
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('bank_form')}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#1E8347] text-white font-bold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 border-0"
                  >
                    <CheckCircle2 size={16} />
                    <span>Tôi Đồng Ý Biên Bản &amp; Điền STK Nhận Hoàn Cọc</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-[#733F49] text-white font-bold text-xs hover:bg-[#5C3038] transition-colors border-0 cursor-pointer text-center"
                >
                  Đóng Biên Bản
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onOpenInspection }) {
  const active = order.status === 'active';
  const hasInspection = order.rawStatus === 'returned' || order.inspection;
  const inspStatus = order.inspection?.customerStatus || 'pending';

  return (
    <article className="border border-[#eee2df] bg-white p-4 sm:p-5 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee2df] pb-3 text-xs">
        <span className="font-semibold text-[#874e57]">MÃ ĐƠN: #{order.id}</span>
        <span className={`account-status ${active ? 'account-status-active' : 'account-status-complete'}`}>
          {order.statusLabel}
        </span>
      </div>
      <div className="my-4 flex flex-col gap-4 sm:flex-row">
        <img src={order.image} alt={order.imageAlt} className="h-32 w-24 object-cover object-center rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-playfair text-xl">{order.dress}</h3>
              <p className="mt-1 text-xs text-[#766966]">
                Phân loại: {order.category} • Size {order.size} • Form {order.style}
              </p>
            </div>
            <strong className="text-base text-[#874e57]">{formatVnd(order.amount)}</strong>
          </div>
          {active ? (
            <>
              <p className="mt-3 text-xs">
                <CalendarDays size={14} className="mr-1 inline text-[#874e57]" />
                Lịch thuê: {order.rentalDates}
              </p>
              <div className="mt-3 rounded-xl bg-[#fcf0ed] px-3.5 py-2 text-xs leading-5 text-[#66504d]">
                Tiền cọc theo đơn: <strong>{formatVnd(order.deposit)}</strong>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-xl bg-[#fcf0ed] px-3.5 py-2 text-xs leading-5 text-[#66504d]">
              Đã bàn giao và hoàn cọc theo hợp đồng thuê.
            </div>
          )}
        </div>
      </div>

      {/* BANNER BIÊN BẢN KIỂM ĐỊNH & HOÀN CỌC NỔI BẬT */}
      {hasInspection && (
        <div className="mb-4 pt-1">
          {inspStatus === 'pending' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF4F0] via-[#FFF8F5] to-[#FFF1EC] border-2 border-[#E7BFB5] shadow-sm space-y-3 font-jakarta transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8737D] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8C4654]"></span>
                  </span>
                  <span className="font-playfair font-bold text-[#5F2B36] text-[15px] sm:text-[16px] tracking-wide">
                    ✦ Showroom đã lập Biên Bản Kiểm Định Trả Váy
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInspection(order)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#733F49] to-[#8C4654] hover:from-[#5A2D35] hover:to-[#733F49] text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg border-0 shrink-0"
                >
                  <span>Xem Biên Bản &amp; Xác Nhận Hoàn Cọc</span>
                </button>
              </div>

              <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-[#5E4D4F] m-0">
                Nàng vui lòng xem chi tiết hiện trạng váy và số tiền cọc được hoàn lại. Khi nàng đồng ý, hệ thống sẽ tự động hoàn cọc ngay lập tức; nếu chưa hài lòng nàng có quyền gửi đơn khiếu nại.
              </p>

              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#8C7A7B]">
                <span>📧</span>
                <span>Hệ thống đã đồng thời gửi thông báo và bản sao biên bản kiểm định chi tiết về email của nàng.</span>
              </div>
            </div>
          )}

          {inspStatus === 'disputed' && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs space-y-2 font-jakarta">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-amber-900 flex items-center gap-2 text-[13px]">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Nàng đã gửi khiếu nại về biên bản kiểm định
                </span>
                <button
                  type="button"
                  onClick={() => onOpenInspection(order)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
                >
                  Xem Lại Biên Bản &amp; Khiếu Nại
                </button>
              </div>
              <p className="text-[12px] text-amber-800 m-0 italic bg-white/70 p-2 rounded-lg border border-amber-100">
                Lý do: "{order.inspection?.disputeReason}"
              </p>
              <p className="text-[11px] text-amber-700 m-0">
                Chuyên viên Atelier của UniBridal đang rà soát và sẽ liên hệ giải quyết hoặc cập nhật lại biên bản hoàn cọc cho nàng.
              </p>
            </div>
          )}

          {inspStatus === 'approved' && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Nàng đã đồng ý biên bản kiểm định &amp; Tiền cọc đã được tự động hoàn tất.</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenInspection(order)}
                className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-900 cursor-pointer bg-transparent border-0"
              >
                Xem chi tiết biên bản
              </button>
            </div>
          )}
        </div>
      )}

      {active && (
        <div className="border-t border-[#eee2df] pt-3 text-xs text-[#766966]">
          Trạng thái hiện tại: <span className="font-medium text-[#874e57]">{order.statusLabel}</span>
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#eee2df] pt-4">
        <Link className="account-button-primary" to={`/profile/orders/${order.id}`}>
          XEM CHI TIẾT ĐƠN
        </Link>
      </div>
    </article>
  );
}

export default function OrderHistoryPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedInspectionOrder, setSelectedInspectionOrder] = useState(null);

  // Xóa bỏ triệt để dữ liệu đơn hàng giả lập (fake) lưu trong localStorage của trình duyệt
  useEffect(() => {
    try {
      localStorage.removeItem('unibridal-orders');
      localStorage.removeItem('unibridal-last-order');
    } catch {}
  }, []);

  const fetchOrders = () => {
    if (!token && !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getOrders()
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((issue) => {
        setError(issue.message || 'Không tải được danh sách đơn hàng từ máy chủ.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token, user]);

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          (tab === 'all' || order.status === tab) &&
          `${order.id || ''} ${order.dress || ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi').trim())
      ),
    [orders, tab, query]
  );

  return (
    <AccountLayout hideBreadcrumb={true} breadcrumb={[]}>
      <section className="profile-card rounded-2xl bg-white px-5 py-7 sm:px-7 border border-[#F0E5DC] shadow-xs font-jakarta" aria-labelledby="order-history-title">
        <h1 id="order-history-title" className="mt-1 font-jakarta font-bold text-[24px] sm:text-[26px] text-[#2C2523] tracking-tight">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6c5b57]">
          Theo dõi tiến độ may đo, lịch trình thử váy và tình trạng giao nhận các kiệt tác lễ phục Haute Couture của nàng.
        </p>
        <div className="account-heading-rule mt-3" />

        {!user && !token ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FAF0EC] text-[#733F49] flex items-center justify-center mx-auto mb-4">
              <FileText size={28} />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-[#5F2B36]">Chưa Đăng Nhập Tài Khoản</h2>
            <p className="mt-2 text-sm text-[#7A6B6C] max-w-md mx-auto">
              Vui lòng đăng nhập tài khoản của nàng để theo dõi lịch sử thuê váy cưới, tiến độ giao nhận và biên bản kiểm định cọc.
            </p>
            <Link to="/login" className="account-button-primary mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
              Đăng Nhập Ngay
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Lọc trạng thái đơn hàng">
              {tabs.map(({ id, label }) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  key={id}
                  onClick={() => setTab(id)}
                  className={`account-tab ${tab === id ? 'account-tab-active' : ''}`}
                >
                  {label} ({id === 'all' ? orders.length : orders.filter((order) => order.status === id).length})
                </button>
              ))}
            </div>
            <div className="mt-5 border-b border-[#eee2df] pb-5">
              <label className="account-search relative block w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#967c79]" />
                <span className="sr-only">Tìm mã đơn hàng hoặc tên váy</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo mã đơn hàng, tên váy cưới..."
                  className="w-full rounded-xl border border-[#eee2df] bg-[#fff8f6] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#874e57] focus:bg-white transition-colors"
                />
              </label>
            </div>
            <div className="mt-5 space-y-5">
              {loading ? (
                <p className="py-8 text-center text-sm text-[#766966]">Đang tải đơn hàng...</p>
              ) : filtered.length ? (
                filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpenInspection={(ord) => setSelectedInspectionOrder(ord)}
                  />
                ))
              ) : (
                <div className="py-16 text-center">
                  <Heart size={30} className="mx-auto text-[#b8737d]" />
                  <h2 className="mt-4 font-playfair text-xl font-bold text-[#5F2B36]">
                    {orders.length === 0 ? 'Nàng chưa có đơn thuê nào' : 'Không tìm thấy đơn hàng phù hợp'}
                  </h2>
                  <p className="mt-2 text-sm text-[#766966]">
                    {orders.length === 0
                      ? 'Hãy khám phá các mẫu thiết kế Haute Couture mới nhất của UniBridal.'
                      : 'Thử bộ lọc khác hoặc xóa từ khóa tìm kiếm.'}
                  </p>
                  {orders.length === 0 ? (
                    <Link to="/collection" className="account-button-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold">
                      KHÁM PHÁ BỘ SƯU TẬP
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('all');
                        setQuery('');
                      }}
                      className="account-button-secondary mt-5"
                    >
                      XÓA BỘ LỌC
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Modal Kiểm Định & Hoàn Cọc (Khách Hàng) */}
      {selectedInspectionOrder && (
        <CustomerInspectionModal
          order={selectedInspectionOrder}
          onClose={() => setSelectedInspectionOrder(null)}
          onUpdated={fetchOrders}
        />
      )}
    </AccountLayout>
  );
}
