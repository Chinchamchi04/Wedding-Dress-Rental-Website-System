import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  MapPin,
  Check,
  CheckCircle2,
  Lock,
  Phone,
  QrCode,
  CreditCard,
  Building2,
  FileText,
  Sparkles,
  Scissors,
  Briefcase,
  HelpCircle,
  X,
  Download,
  Printer,
  ChevronRight,
  ArrowRight,
  Clock,
  ExternalLink,
  Award,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import dressThumb from '../../assets/card1_elysian.jpg';

export default function CheckoutPage() {
  const navigate = useNavigate();

  // Form state
  const [brideName, setBrideName] = useState('Lê Nguyễn Thảo My');
  const [phone, setPhone] = useState('0938 128 899');
  const [email, setEmail] = useState('thaomy.bride@gmail.com');
  const [address, setAddress] = useState('120/4 Lê Lai, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
  
  // Schedule state
  const [rentalSchedule, setRentalSchedule] = useState({
    startDate: '18/11/2025',
    endDate: '21/11/2025',
    weddingDate: '20/11/2025',
  });

  // Measurements
  const [measurements, setMeasurements] = useState({
    height: '165',
    weight: '48',
    bust: '84',
    waist: '64',
    hips: '92',
    heel: '9',
  });

  // Delivery method: 'direct' | 'delivery'
  const [deliveryMethod, setDeliveryMethod] = useState('direct');

  // Deposit option: 'deposit30' | 'full100'
  const [depositOption, setDepositOption] = useState('deposit30');

  // Payment gateway: 'vietqr' | 'card' | 'offline'
  const [paymentGateway, setPaymentGateway] = useState('vietqr');

  // Checkbox agreements
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeNotifications, setAgreeNotifications] = useState(true);

  // Modals
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Financial calculations
  const totalRentPrice = 4700000;
  const depositCollateral = 15000000;
  
  // Amount to pay today based on depositOption (30% or 100%)
  // In reference mockup: Option 1 is 2.350.000₫ (50% or 30% flat), let's calculate:
  const amountToPayToday = depositOption === 'deposit30' ? 2350000 : 4700000;

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Vui lòng đồng ý với Điều khoản hợp đồng số trước khi tiến hành.');
      return;
    }
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2523] flex flex-col font-jakarta selection:bg-[#FCEEE9] selection:text-[#B8737D]">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] text-[#847374] mb-6">
          <Link to="/" className="hover:text-[#B8737D] transition-colors no-underline text-[#847374]">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#B8737D] transition-colors no-underline text-[#847374]">
            Giỏ Hàng
          </Link>
          <span>/</span>
          <span className="text-[#2C2523] font-medium">Tiến Hành Đặt Thuê & Ký Hợp Đồng</span>
        </nav>

        {/* Header Title Section */}
        <div className="mb-8">
          <div className="text-[11.5px] sm:text-[12px] font-bold tracking-[1.2px] text-[#B8737D] uppercase mb-1.5 font-jakarta">
            BƯỚC 2 / 3 • XÁC THỰC HỢP ĐỒNG
          </div>
          <h1 className="font-playfair text-[28px] sm:text-[38px] lg:text-[42px] font-medium text-[#2C2523] leading-tight mb-2.5">
            Ký Hợp Đồng & Đặt Thuê Lễ Phục
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#6B5C5D] font-normal leading-relaxed m-0 max-w-[850px]">
            Bảo chứng ngày cưới thiêng liêng cùng cam kết nguyên bản, bảo quản thủ công và may đo chuẩn phom tại UniBridal.
          </p>
        </div>

        {/* Stepper Bar */}
        <div className="w-full max-w-[720px] mx-auto mb-10">
          <div className="bg-white rounded-full border border-[#EEDECF]/80 shadow-[0_2px_12px_rgba(44,37,35,0.04)] px-5 sm:px-8 py-3 flex items-center justify-between text-[13px] sm:text-[14px]">
            {/* Step 1 */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-[#733F49] hover:text-[#5F323B] transition-colors no-underline font-medium"
            >
              <span className="w-5 h-5 rounded-full bg-[#733F49] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>1. Giỏ hàng</span>
            </Link>

            {/* Line 1 */}
            <div className="flex-1 h-[1.5px] bg-[#EEDECF] mx-3 sm:mx-6" />

            {/* Step 2 (Active) */}
            <div className="flex items-center gap-2 text-[#2C2523] font-bold">
              <span className="w-6 h-6 rounded-full bg-[#733F49] text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_6px_rgba(115,63,73,0.35)]">
                2
              </span>
              <span className="text-[#733F49]">2. Thông tin & Ký hợp đồng</span>
            </div>

            {/* Line 2 */}
            <div className="flex-1 h-[1.5px] bg-[#EEDECF] mx-3 sm:mx-6" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-[#9C8B8E] font-medium">
              <span className="w-5 h-5 rounded-full bg-[#EAE0D5] text-[#847374] flex items-center justify-center text-[11px] font-medium">
                3
              </span>
              <span className="hidden sm:inline">3. Xác nhận & Bàn giao</span>
              <span className="sm:hidden">3. Bàn giao</span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Form Left & Sticky Order Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: All Checkout Details (col-span-7 or 8) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* 1. THÔNG TIN NGƯỜI THUÊ */}
            <section className="bg-white rounded-2xl border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)] p-6 sm:p-7">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#F5EDE8] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#B8737D]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-[19px] sm:text-[21px] font-semibold text-[#2C2523] m-0">
                      Thông Tin Người Thuê
                    </h2>
                    <p className="text-[12px] text-[#847374] m-0 mt-0.5">
                      Dữ liệu bảo mật tuyệt đối cho quy trình tinh chỉnh phom váy
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#FDF2F0] border border-[#F7D8D4] text-[#B8737D] font-bold text-[10.5px] tracking-[0.5px]">
                  BẢO CHỨNG 1:1
                </span>
              </div>

              {/* Form Inputs Grid */}
              <div className="space-y-4">
                {/* Row 1: Name, Phone, Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49] mb-1.5">
                      HỌ & TÊN CÔ DÂU *
                    </label>
                    <input
                      type="text"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      className="w-full bg-[#FCF9F6] border border-[#EEDECF] rounded-xl px-3.5 py-2.5 text-[14px] text-[#2C2523] font-medium focus:outline-none focus:border-[#733F49] focus:bg-white transition-all"
                      placeholder="Nhập họ tên cô dâu"
                    />
                  </div>
                  <div>
                    <label className="block font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49] mb-1.5">
                      SỐ ĐIỆN THOẠI (ZALO) *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FCF9F6] border border-[#EEDECF] rounded-xl px-3.5 py-2.5 text-[14px] text-[#2C2523] font-medium focus:outline-none focus:border-[#733F49] focus:bg-white transition-all"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49] mb-1.5">
                      EMAIL NHẬN HỢP ĐỒNG SỐ *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FCF9F6] border border-[#EEDECF] rounded-xl px-3.5 py-2.5 text-[14px] text-[#2C2523] font-medium focus:outline-none focus:border-[#733F49] focus:bg-white transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Row 2: Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49]">
                      ĐỊA CHỈ NHẬN HÀNG / ĐỊA CHỈ CƯ TRÚ (SỐ NHÀ, TÊN ĐƯỜNG, PHƯỜNG/XÃ, QUẬN/HUYỆN, TỈNH/THÀNH PHỐ) *
                    </label>
                    <span className="text-[11px] text-[#847374] hidden sm:inline">
                      📌 Địa chỉ gửi hợp đồng & giao lễ phục
                    </span>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#B8737D]" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#FCF9F6] border border-[#EEDECF] rounded-xl pl-10 pr-3.5 py-2.5 text-[14px] text-[#2C2523] font-medium focus:outline-none focus:border-[#733F49] focus:bg-white transition-all"
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </div>
                </div>

                {/* Row 3: Rental Schedule Banner */}
                <div className="bg-[#FAF4EE] border border-[#EEDECF] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#733F49] shadow-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-bold text-[#847374] tracking-wider">
                        LỊCH TRÌNH ĐẶT THUÊ (3 NGÀY TRỌN VẸN)
                      </div>
                      <div className="font-jakarta font-bold text-[15px] text-[#2C2523]">
                        {rentalSchedule.startDate} — {rentalSchedule.endDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-[12.5px] font-medium text-[#733F49] bg-white px-3 py-1.5 rounded-lg border border-[#EEDECF] shadow-2xs self-start sm:self-auto">
                    💍 Lễ cưới chính thức: <strong>{rentalSchedule.weddingDate}</strong>
                  </div>
                </div>

                {/* Row 4: SỐ ĐO HÌNH THỂ */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49]">
                      SỐ ĐO HÌNH THỂ (ĐỂ NGHỆ NHÂN TINH CHỈNH FORM CORSET SIẾT EO)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideModalOpen(true)}
                      className="text-[11.5px] font-semibold text-[#B8737D] hover:underline flex items-center gap-1 border-0 bg-transparent p-0 cursor-pointer"
                    >
                      <span>Hướng dẫn lấy số đo</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {[
                      { key: 'height', label: 'CHIỀU CAO', unit: 'cm' },
                      { key: 'weight', label: 'CÂN NẶNG', unit: 'kg' },
                      { key: 'bust', label: 'VÒNG 1 (NGỰC)', unit: 'cm' },
                      { key: 'waist', label: 'VÒNG 2 (EO SIẾT)', unit: 'cm' },
                      { key: 'hips', label: 'VÒNG 3 (MÔNG)', unit: 'cm' },
                      { key: 'heel', label: 'CHIỀU CAO GIÀY', unit: 'cm' },
                    ].map((m) => (
                      <div
                        key={m.key}
                        className="bg-[#FCF9F6] border border-[#EEDECF] rounded-xl p-2.5 text-center focus-within:border-[#733F49] focus-within:bg-white transition-all"
                      >
                        <div className="text-[9.5px] font-bold text-[#847374] tracking-wider mb-1 truncate">
                          {m.label}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={measurements[m.key]}
                            onChange={(e) =>
                              setMeasurements({ ...measurements, [m.key]: e.target.value })
                            }
                            className="w-12 text-center font-jakarta font-bold text-[16px] text-[#2C2523] bg-transparent border-0 focus:outline-none p-0"
                          />
                          <span className="text-[11.5px] text-[#847374] font-medium">{m.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 5: PHƯƠNG THỨC BÀN GIAO */}
                <div className="pt-3">
                  <label className="block font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49] mb-2.5">
                    PHƯƠNG THỨC BÀN GIAO LỄ PHỤC
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Option 1: Direct */}
                    <div
                      onClick={() => setDeliveryMethod('direct')}
                      className={`rounded-xl p-4 border cursor-pointer transition-all ${
                        deliveryMethod === 'direct'
                          ? 'border-[#733F49] bg-[#FAF3F0] shadow-xs'
                          : 'border-[#EEDECF] bg-[#FCF9F6] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            checked={deliveryMethod === 'direct'}
                            onChange={() => setDeliveryMethod('direct')}
                            className="accent-[#733F49] w-4 h-4"
                          />
                          <span className="font-jakarta font-bold text-[14.5px] text-[#2C2523]">
                            Nhận trực tiếp
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#733F49] text-white">
                          KHUYÊN DÙNG
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B5C5D] leading-relaxed m-0 pl-6">
                        Trải nghiệm buổi thử hoàn thiện cuối cùng cùng NTK chính. 88 Nam Kỳ Khởi Nghĩa, Phường Bến Nghé, Quận 1, TP. HCM.
                      </p>
                    </div>

                    {/* Option 2: Delivery */}
                    <div
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`rounded-xl p-4 border cursor-pointer transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'border-[#733F49] bg-[#FAF3F0] shadow-xs'
                          : 'border-[#EEDECF] bg-[#FCF9F6] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            checked={deliveryMethod === 'delivery'}
                            onChange={() => setDeliveryMethod('delivery')}
                            className="accent-[#733F49] w-4 h-4"
                          />
                          <span className="font-jakarta font-bold text-[14.5px] text-[#2C2523]">
                            Giao lễ phục tận nơi
                          </span>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#6B5C5D] leading-relaxed m-0 pl-6">
                        Trợ lý phục trang bàn giao cùng vali chống ẩm cao cấp, móc lụa chuyên dụng và bảo hiểm vận chuyển 100%.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. ĐẶC QUYỀN & DỊCH VỤ ĐI KÈM MIỄN PHÍ */}
            <section className="bg-white rounded-2xl border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)] p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#B8737D]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-playfair text-[19px] sm:text-[21px] font-semibold text-[#2C2523] m-0">
                    Đặc Quyền & Dịch Vụ Đi Kèm Miễn Phí
                  </h2>
                  <p className="text-[12px] text-[#847374] m-0 mt-0.5">
                    Giá trị quà tặng và hậu mãi đặc quyền trị giá hơn 8.500.000₫ dành cho cô dâu
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: Sparkles,
                    title: 'Voan Cài Đầu Cathedral Pháp',
                    tag: '0₫',
                    desc: 'Lụa Tulle mềm 3.5m đính ren Chantilly đồng bộ hoa văn của váy chính.',
                  },
                  {
                    icon: Scissors,
                    title: 'Gói Fitting Form Siết 1:1',
                    tag: '0₫',
                    desc: 'Buổi thử kín cùng chuyên gia canh chỉnh số đo vòng eo trước ngày cưới 3 ngày.',
                  },
                  {
                    icon: Briefcase,
                    title: 'Vali & Túi Hộp Lưu Niệm Cao Cấp',
                    tag: '0₫',
                    desc: 'Bao bọc chống bụi vi sinh chuyên dụng kèm bộ găng tay trắng chạm váy.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Bảo Hiểm Tổn Thất Nhẹ',
                    tag: 'MIỄN PHÍ',
                    desc: 'Bảo hiểm 100% vết bẩn rượu vang, phấn kem trang điểm và hạt đính rơi tự nhiên.',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="bg-[#FCF9F6] border border-[#F0E5DC] rounded-xl p-4 flex items-start gap-3.5 hover:border-[#E8D1CB] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#EEDECF] flex items-center justify-center text-[#B8737D] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-jakarta font-bold text-[13.5px] text-[#2C2523] m-0">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0EC] text-[#B8737D] border border-[#F2D8D4]">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#6B5C5D] leading-relaxed m-0 font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. PHƯƠNG THỨC ĐẶT CỌC & ĐIỀU KHOẢN HỢP ĐỒNG SỐ */}
            <section className="bg-white rounded-2xl border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)] p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#B8737D]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-playfair text-[19px] sm:text-[21px] font-semibold text-[#2C2523] m-0">
                    Phương Thức Đặt Cọc & Điều Khoản Hợp Đồng Số
                  </h2>
                  <p className="text-[12px] text-[#847374] m-0 mt-0.5">
                    Lựa chọn hạn mức đặt cọc giữ tác phẩm và phương thức thanh toán an toàn
                  </p>
                </div>
              </div>

              {/* Payment Plan Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Plan 1: Deposit 30% */}
                <div
                  onClick={() => setDepositOption('deposit30')}
                  className={`rounded-2xl p-4.5 border cursor-pointer transition-all ${
                    depositOption === 'deposit30'
                      ? 'border-[#733F49] bg-[#FAF3F0] shadow-sm'
                      : 'border-[#EEDECF] bg-[#FCF9F6] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={depositOption === 'deposit30'}
                        onChange={() => setDepositOption('deposit30')}
                        className="accent-[#733F49] w-4 h-4"
                      />
                      <span className="font-jakarta font-bold text-[15px] text-[#2C2523]">
                        Đặt Cọc Giữ Lễ Phục 30%
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0EC] text-[#B8737D] border border-[#F2D8D4]">
                      ĐƯỢC CHỌN NHIỀU
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B5C5D] leading-relaxed m-0 pl-6 mb-3">
                    Chỉ thanh toán trước 30% tiền thuê để khóa ngày cưới nếu thử tại cửa hàng. 70% còn lại thanh toán vào ngày thử váy hoàn thiện.
                  </p>
                  <div className="pl-6">
                    <span className="font-playfair font-bold text-[22px] text-[#733F49]">
                      2.350.000₫
                    </span>
                    <span className="text-[12px] text-[#847374] font-medium ml-1.5">
                      / hôm nay
                    </span>
                  </div>
                </div>

                {/* Plan 2: Full 100% */}
                <div
                  onClick={() => setDepositOption('full100')}
                  className={`rounded-2xl p-4.5 border cursor-pointer transition-all ${
                    depositOption === 'full100'
                      ? 'border-[#733F49] bg-[#FAF3F0] shadow-sm'
                      : 'border-[#EEDECF] bg-[#FCF9F6] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={depositOption === 'full100'}
                        onChange={() => setDepositOption('full100')}
                        className="accent-[#733F49] w-4 h-4"
                      />
                      <span className="font-jakarta font-bold text-[15px] text-[#2C2523]">
                        Thanh Toán Trọn Gói 100%
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      THẢNH THƠI
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B5C5D] leading-relaxed m-0 pl-6 mb-3">
                    Hoàn tất trọn vẹn tiền thuê lễ phục, nhận thêm quà tặng nơ cài tóc pha lê Swarovski thủ công từ Atelier.
                  </p>
                  <div className="pl-6">
                    <span className="font-playfair font-bold text-[22px] text-[#733F49]">
                      4.700.000₫
                    </span>
                    <span className="text-[12px] text-[#847374] font-medium ml-1.5">
                      / trọn gói
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Gateways Row */}
              <div>
                <label className="block font-jakarta text-[11px] font-bold uppercase tracking-wider text-[#733F49] mb-2.5">
                  CỔNG THANH TOÁN TRỰC TUYẾN ĐƯỢC BẢO HỘ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'vietqr',
                      icon: QrCode,
                      title: 'VietQR Tức Thì',
                      desc: 'Xác nhận tự động 3s',
                    },
                    {
                      id: 'card',
                      icon: CreditCard,
                      title: 'Visa / Mastercard',
                      desc: 'Bảo mật SSL 256-bit',
                    },
                    {
                      id: 'offline',
                      icon: Building2,
                      title: 'Tại Showroom Atelier',
                      desc: 'Tiền mặt / Quẹt thẻ',
                    },
                  ].map((gw) => {
                    const Icon = gw.icon;
                    const isSelected = paymentGateway === gw.id;
                    return (
                      <div
                        key={gw.id}
                        onClick={() => setPaymentGateway(gw.id)}
                        className={`rounded-xl p-3.5 border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'border-[#733F49] bg-[#FAF3F0] shadow-2xs'
                            : 'border-[#EEDECF] bg-[#FCF9F6] hover:bg-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#EEDECF] mx-auto flex items-center justify-center text-[#733F49] mb-1.5 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="font-jakarta font-bold text-[13px] text-[#2C2523]">
                          {gw.title}
                        </div>
                        <div className="text-[11px] text-[#847374]">{gw.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 4. CAM KẾT PHÁP LÝ HỢP ĐỒNG THUÊ & TIỀN CỌC BẢO LÃNH */}
            <section className="bg-white rounded-2xl border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-[#F5EDE8] mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#B8737D]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-[19px] sm:text-[21px] font-semibold text-[#2C2523] m-0">
                      Cam Kết Pháp Lý Hợp Đồng Thuê & Tiền Cọc Bảo Lãnh
                    </h2>
                    <p className="text-[12px] text-[#847374] m-0 mt-0.5">
                      Quy chế bảo hộ quyền lợi cô dâu & trách nhiệm gìn giữ tác phẩm độc bản
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-[#FAF4EE] border border-[#EEDECF] text-[#733F49] font-bold text-[10.5px]">
                  HỢP ĐỒNG ĐIỆN TỬ #UB-2025
                </span>
              </div>

              {/* Legal Terms List */}
              <div className="space-y-3.5 mb-6">
                <div className="font-jakarta text-[13px] font-bold text-[#2C2523]">
                  Một số điều khoản chính:
                </div>

                {[
                  {
                    num: '1',
                    title: 'Bảo lưu quyền sở hữu và phom dáng chuẩn xác',
                    content: `UniBridal cam kết lễ phục mã định danh #UB-HC-2025-01 được bảo quản theo chuẩn Haute Couture, hấp tiệt trùng sinh học, phục hồi ren hoa tơ tằm nguyên bản và tinh chỉnh chuẩn số đo cô dâu ${brideName} hoàn thiện trước ${rentalSchedule.startDate}.`,
                  },
                  {
                    num: '2',
                    title: 'Chính Sách Hoàn Cọc',
                    content:
                      'Số tiền được hoàn chuyển khoản 100% tự động qua tài khoản ngân hàng của cô dâu trong vòng 24 giờ làm việc sau khi kiểm tra hoàn tất tình trạng nguyên vẹn khi bàn giao lại tại Shop.',
                  },
                  {
                    num: '3',
                    title: 'Điều khoản hủy lịch & Đổi ngày cưới linh hoạt',
                    content:
                      'Nàng dâu được quyền đổi lịch thuê hoàn toàn miễn phí nếu thông báo trước ngày khởi tạo 15 ngày, hoặc nhận hoàn lại 100% chi phí đặt cọc giữ lịch nếu kế hoạch dời trước tối thiểu 30 ngày.',
                  },
                  {
                    num: '4',
                    title: 'Chữ ký số và giá trị pháp lý song phương',
                    content:
                      'Sau khi xác nhận đặt chỗ thành công, bản hợp đồng hoàn chỉnh có chữ ký số điện tử của Tổng giám đốc UniBridal sẽ được tự động gửi kèm mã bảo mật tra cứu tới email đăng ký của người thuê.',
                  },
                ].map((term) => (
                  <div key={term.num} className="bg-[#FCF9F6] border border-[#F0E5DC] rounded-xl p-3.5 text-[12.5px] leading-relaxed">
                    <span className="font-bold text-[#733F49] mr-1.5">• {term.num}. {term.title}:</span>
                    <span className="text-[#5A4848]">{term.content}</span>
                  </div>
                ))}

                {/* View Full Contract Button */}
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#733F49] hover:bg-[#5F323B] text-white text-[12.5px] font-semibold transition-colors cursor-pointer border-0 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chi tiết hợp đồng</span>
                </button>
              </div>

              {/* Checkboxes Agreement */}
              <div className="space-y-3 pt-4 border-t border-[#F5EDE8]">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 accent-[#733F49] w-4 h-4 rounded"
                  />
                  <span className="text-[12.5px] text-[#4A3E3D] leading-normal font-normal">
                    Tôi đã đọc kỹ và đồng ý với toàn bộ{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsContractModalOpen(true);
                      }}
                      className="text-[#733F49] font-bold underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Điều khoản thuê lễ phục cao cấp
                    </button>{' '}
                    và xác nhận kích hoạt chữ ký điện tử hợp đồng số gửi về Email.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeNotifications}
                    onChange={(e) => setAgreeNotifications(e.target.checked)}
                    className="mt-0.5 accent-[#733F49] w-4 h-4 rounded"
                  />
                  <span className="text-[12.5px] text-[#4A3E3D] leading-normal font-normal">
                    Đồng ý nhận tin nhắn SMS/Zalo lịch trình thử váy & mã QR mã hóa chuyên biệt bàn giao lễ phục tại Atelier.
                  </span>
                </label>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Order Summary Card (col-span-5 or 4) - Matching Image 2 */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
            
            <div className="bg-white rounded-2xl border border-[#F0E5DC] shadow-[0_6px_30px_rgba(44,37,35,0.06)] overflow-hidden">
              
              {/* Card Header Bar */}
              <div className="bg-[#FAF4EE] px-5 py-3.5 border-b border-[#EEDECF] flex items-center justify-between gap-2 text-[12px]">
                <div className="truncate">
                  <span className="font-bold text-[#733F49] uppercase tracking-wide text-[11px]">
                    LỄ PHỤC THUÊ ĐỘC BẢN
                  </span>
                  <span className="text-[#847374] ml-1.5 hidden sm:inline">
                    Mã: #UB-HC-2025-01 • Bộ sưu tập Muse de Printemps
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#B8737D] bg-white px-2.5 py-1 rounded-full border border-[#F2D8D4]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Cọc bảo lãnh: 15.000.000₫</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Product Info Row */}
                <div className="flex gap-4 pb-5 border-b border-[#F5EDE8]">
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border border-[#EEDECF]">
                    <img
                      src={dressThumb}
                      alt="Elysian Rose Ballgown"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-[#733F49] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Couture
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-playfair text-[17px] sm:text-[18px] font-bold text-[#2C2523] m-0 mb-1 leading-snug">
                      Elysian Rose Ballgown
                    </h3>
                    <p className="text-[12px] text-[#786C6D] m-0 mb-2">
                      Champagne Rose • Tơ tằm Mikado Pháp
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF4EE] text-[#733F49] border border-[#EEDECF]">
                        Size S (Eo 64–68cm)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF4EE] text-[#733F49] border border-[#EEDECF]">
                        Gói thuê 3 ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thời gian giữ váy */}
                <div className="flex items-center justify-between text-[12.5px] bg-[#FCF9F6] p-3 rounded-xl border border-[#F0E5DC]">
                  <span className="text-[#847374] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B8737D]" />
                    THỜI GIAN GIỮ VÁY:
                  </span>
                  <span className="font-bold text-[#2C2523]">
                    {rentalSchedule.startDate} — {rentalSchedule.endDate}
                  </span>
                </div>

                {/* Financial Breakdown Table */}
                <div className="space-y-3 text-[13px] pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B5C5D]">Giá niêm yết (3 ngày)</span>
                    <span className="font-bold text-[#2C2523]">4.700.000₫</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6B5C5D] flex items-center gap-1">
                      <span>Đặc quyền tặng kèm (Voan Cathedral & Vali)</span>
                    </span>
                    <span className="font-bold text-[#2E7D32]">0₫ (Miễn phí)</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EDE8]">
                    <div>
                      <div className="font-bold text-[#2C2523]">Tổng giá trị gói thuê lễ phục</div>
                      <div className="text-[11px] text-[#847374]">Đã bao gồm chi phí may đo tinh chỉnh form corset</div>
                    </div>
                    <span className="font-bold text-[15px] text-[#2C2523]">4.700.000₫</span>
                  </div>

                  <div className="flex items-start justify-between pt-2 border-t border-[#F5EDE8] bg-[#FAF8F5] p-3 rounded-xl border border-[#F0E5DC]">
                    <div>
                      <div className="font-bold text-[#733F49] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#B8737D]" />
                        <span>Tiền cọc bảo lãnh lễ phục</span>
                      </div>
                      <div className="text-[11px] text-[#6B5C5D] mt-0.5 leading-normal max-w-[210px]">
                        Không thanh toán hôm nay. Thu vào ngày bàn giao váy và hoàn trả 100% trong vòng 2 giờ sau khi trả váy
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[14.5px] text-[#2C2523]">15.000.000₫</div>
                      <span className="inline-block text-[9.5px] font-bold text-[#B8737D] bg-white px-2 py-0.5 rounded-full border border-[#F2D8D4] mt-1">
                        CỌC BẢO LÃNH
                      </span>
                    </div>
                  </div>

                  {/* Highlight Deposit Option */}
                  <div className="bg-[#FAF0EC] p-3.5 rounded-xl border border-[#F2D8D4]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#733F49] text-[13.5px]">
                        {depositOption === 'deposit30'
                          ? 'Tiền cọc giữ váy hôm nay (30% tiền thuê)'
                          : 'Thanh toán trọn gói 100%'}
                      </span>
                      <span className="font-playfair font-bold text-[18px] text-[#733F49]">
                        {depositOption === 'deposit30' ? '2.350.000₫' : '4.700.000₫'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#733F49]/80 m-0 leading-normal">
                      {depositOption === 'deposit30'
                        ? 'Khóa lịch giữ tác phẩm • 70% còn lại thanh toán ngày thử váy'
                        : 'Hoàn tất 100% gói thuê • Tặng quà lưu niệm Swarovski'}
                    </p>
                  </div>
                </div>

                {/* SỐ TIỀN THANH TOÁN HÔM NAY */}
                <div className="bg-[#FAF4EE] p-4 rounded-xl border border-[#EEDECF] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#733F49] shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-[#847374]">
                        SỐ TIỀN THANH TOÁN HÔM NAY:
                      </div>
                      <div className="text-[11px] text-[#6B5C5D]">
                        Đã gồm VAT & bảo hiểm toàn diện áo cưới
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-playfair font-bold text-[22px] sm:text-[24px] text-[#733F49] leading-tight">
                      {amountToPayToday.toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-[11px] text-[#847374] font-medium">
                      {depositOption === 'deposit30' ? '/ hôm nay' : '/ trọn gói'}
                    </div>
                  </div>
                </div>

                {/* CTA Submit Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="w-full py-4 rounded-xl bg-[#733F49] hover:bg-[#5F323B] text-white font-jakarta text-[14px] sm:text-[15px] font-bold tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(115,63,73,0.3)] hover:shadow-[0_6px_22px_rgba(115,63,73,0.4)] cursor-pointer border-0 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>XÁC NHẬN ĐẶT THUÊ & KÝ HỢP ĐỒNG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Badges Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#847374] gap-2 border-t border-[#F5EDE8]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#B8737D]" />
                    Bảo mật PCI DSS 256-bit & Ký số OTP
                  </span>
                  <a
                    href="tel:18008998"
                    className="flex items-center gap-1 text-[#733F49] hover:underline font-semibold no-underline"
                  >
                    <Phone className="w-3 h-3" />
                    Hotline 24/7: 1800 8998
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />

      {/* MODAL 1: CHI TIẾT HỢP ĐỒNG SỐ */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EEDECF] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#F0E5DC] flex items-center justify-between bg-[#FAF4EE]">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#B8737D]">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </span>
                <h3 className="font-playfair text-[18px] font-bold text-[#2C2523] m-0">
                  HỢP ĐỒNG THUÊ LỄ PHỤC HAUTE COUTURE ĐIỆN TỬ
                </h3>
                <span className="text-[11.5px] text-[#847374]">Mã số định danh: #UB-HC-2025-E098</span>
              </div>
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF4EE] border border-[#EEDECF] flex items-center justify-center text-[#2C2523] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Legal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-[13px] leading-relaxed text-[#4A3E3D]">
              <div className="bg-[#FCF9F6] p-4 rounded-xl border border-[#EEDECF]">
                <h4 className="font-bold text-[#733F49] text-[14px] mb-2 uppercase tracking-wide">
                  Bên A (Bên Cho Thuê): UNIBRIDAL HAUTE COUTURE ATELIER
                </h4>
                <p className="m-0 text-[#6B5C5D]">Đại diện pháp lý: Bà Nguyễn Hoàng Bảo Ngọc — Tổng Giám Đốc</p>
                <p className="m-0 text-[#6B5C5D]">Địa chỉ Atelier: 88 Nam Kỳ Khởi Nghĩa, Bến Nghé, Quận 1, TP. HCM</p>
                <p className="m-0 text-[#6B5C5D]">Mã số thuế: 0318998822 — Hotline: 1800 8998</p>
              </div>

              <div className="bg-[#FCF9F6] p-4 rounded-xl border border-[#EEDECF]">
                <h4 className="font-bold text-[#733F49] text-[14px] mb-2 uppercase tracking-wide">
                  Bên B (Bên Thuê): CÔ DÂU {brideName.toUpperCase()}
                </h4>
                <p className="m-0 text-[#6B5C5D]">Số điện thoại / Zalo: {phone}</p>
                <p className="m-0 text-[#6B5C5D]">Email nhận hợp đồng số: {email}</p>
                <p className="m-0 text-[#6B5C5D]">Địa chỉ cư trú & giao váy: {address}</p>
                <p className="m-0 text-[#6B5C5D]">
                  Số đo tinh chỉnh: Chiều cao {measurements.height}cm, Ngực {measurements.bust}cm, Eo {measurements.waist}cm, Mông {measurements.hips}cm
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#2C2523] text-[14px] mb-1">
                  ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ
                </h4>
                <p className="m-0 text-[#5A4848]">
                  1.1. Bên A đồng ý cho Bên B thuê tác phẩm váy cưới độc bản mang tên <strong>Elysian Rose Ballgown</strong> (Mã kiểm soát: #UB-HC-2025-01).
                </p>
                <p className="m-0 text-[#5A4848]">
                  1.2. Thời gian thuê chính thức: Từ ngày <strong>{rentalSchedule.startDate}</strong> đến 18:00 ngày <strong>{rentalSchedule.endDate}</strong>.
                </p>

                <h4 className="font-bold text-[#2C2523] text-[14px] mb-1 pt-2">
                  ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG & CHÍNH SÁCH TIỀN CỌC
                </h4>
                <p className="m-0 text-[#5A4848]">
                  2.1. Tổng giá trị gói thuê: <strong>4.700.000₫</strong> (Đã bao gồm VAT, bảo hiểm tổn thất nhẹ và quà tặng phụ kiện).
                </p>
                <p className="m-0 text-[#5A4848]">
                  2.2. Tiền cọc bảo lãnh hoàn lại: <strong>15.000.000₫</strong>. Bên A cam kết hoàn tiền 100% vào số tài khoản của Bên B trong vòng 2 giờ sau khi nhận lại lễ phục nguyên vẹn.
                </p>

                <h4 className="font-bold text-[#2C2523] text-[14px] mb-1 pt-2">
                  ĐIỀU 3: CHỮ KÝ ĐIỆN TỬ VÀ HIỆU LỰC
                </h4>
                <p className="m-0 text-[#5A4848]">
                  Hợp đồng này được xác lập dưới dạng thông điệp dữ liệu điện tử có giá trị pháp lý tương đương văn bản theo quy định của Luật Giao dịch điện tử Việt Nam.
                </p>
              </div>

              {/* Digital Seal / Signature Simulation */}
              <div className="pt-4 border-t border-[#F0E5DC] flex items-center justify-between">
                <div className="text-center">
                  <div className="text-[12px] font-bold text-[#847374] mb-1 uppercase">ĐẠI DIỆN BÊN B</div>
                  <div className="font-playfair text-[15px] italic text-[#733F49] font-bold">
                    {brideName}
                  </div>
                  <span className="inline-block text-[10px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full mt-1">
                    ✓ Đã ký điện tử OTP
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-[12px] font-bold text-[#847374] mb-1 uppercase">ĐẠI DIỆN BÊN A (UNIBRIDAL)</div>
                  <div className="relative inline-block">
                    <div className="font-playfair text-[15px] italic text-[#733F49] font-bold">
                      Nguyễn Hoàng Bảo Ngọc
                    </div>
                    <span className="inline-block text-[10px] text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded-full mt-1 border border-[#FFCDD2]">
                      ★ ĐÃ CHỨNG THỰC CA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FAF4EE] border-t border-[#F0E5DC] flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-[#EEDECF] text-[#733F49] hover:bg-[#FAF0EC] text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In / Tải PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-[#733F49] hover:bg-[#5F323B] text-white text-[13px] font-bold transition-colors cursor-pointer border-0 shadow-xs"
              >
                Đã hiểu & Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HƯỚNG DẪN LẤY SỐ ĐO */}
      {isSizeGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EEDECF] relative">
            <button
              type="button"
              onClick={() => setIsSizeGuideModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF4EE] hover:bg-[#F2E5DC] flex items-center justify-center text-[#2C2523] border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <Scissors className="w-5 h-5 text-[#B8737D]" />
              <h3 className="font-playfair text-[20px] font-bold text-[#2C2523] m-0">
                Hướng Dẫn Lấy Số Đo Chuẩn Phom Váy
              </h3>
            </div>

            <p className="text-[13px] text-[#6B5C5D] mb-4">
              Đội ngũ nghệ nhân UniBridal sẽ dựa trên các số đo này để căn chỉnh xương corset siết eo vừa vặn nhất với cơ thể nàng:
            </p>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 bg-[#FCF9F6] rounded-xl border border-[#EEDECF]">
                <strong className="text-[#733F49]">1. Vòng 1 (Ngực):</strong> Đo vòng quanh điểm nhô cao nhất của ngực khi mặc áo ngực không mút hoặc áo lót ngày cưới.
              </div>
              <div className="p-3 bg-[#FCF9F6] rounded-xl border border-[#EEDECF]">
                <strong className="text-[#733F49]">2. Vòng 2 (Eo siết):</strong> Đo vòng eo tại điểm nhỏ nhất (trên rốn khoảng 3-4cm), thở ra tự nhiên không hóp bụng quá mức.
              </div>
              <div className="p-3 bg-[#FCF9F6] rounded-xl border border-[#EEDECF]">
                <strong className="text-[#733F49]">3. Vòng 3 (Mông):</strong> Đo vòng qua điểm nở nang nhất của mông.
              </div>
              <div className="p-3 bg-[#FCF9F6] rounded-xl border border-[#EEDECF]">
                <strong className="text-[#733F49]">4. Chiều cao & Chiều cao giày:</strong> Cung cấp chính xác để nghệ nhân canh tà váy vừa chạm đất thanh thoát, không bị giẫm gót.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeGuideModalOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-[#733F49] hover:bg-[#5F323B] text-white text-[13.5px] font-bold transition-colors border-0 cursor-pointer"
            >
              Tôi Đã Hiểu
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: XÁC NHẬN THÀNH CÔNG & MÃ QR THANH TOÁN (STEP 3) */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#EEDECF] text-center relative">
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF4EE] hover:bg-[#F2E5DC] flex items-center justify-center text-[#2C2523] border-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8737D] block mb-1">
              BƯỚC 3 / 3 • XÁC NHẬN THÀNH CÔNG
            </span>

            <h3 className="font-playfair text-[22px] font-bold text-[#2C2523] m-0 mb-2">
              Khóa Lịch Đặt Thuê Thành Công!
            </h3>

            <p className="text-[13px] text-[#6B5C5D] mb-5 leading-relaxed">
              Chúc mừng cô dâu <strong>{brideName}</strong>! Tuyệt tác <strong>Elysian Rose Ballgown</strong> đã được giữ lịch độc quyền cho ngày cưới của nàng.
            </p>

            {/* QR Payment Box */}
            <div className="bg-[#FAF4EE] border border-[#EEDECF] rounded-2xl p-4 mb-5">
              <div className="text-[12px] font-bold text-[#733F49] mb-1">
                QUÉT MÃ VIETQR ĐỂ HOÀN TẤT ĐẶT CỌC
              </div>
              <div className="text-[11.5px] text-[#847374] mb-3">
                Số tiền thanh toán: <strong className="text-[#733F49] text-[15px]">{amountToPayToday.toLocaleString('vi-VN')}₫</strong>
              </div>

              {/* VietQR Mock Code */}
              <div className="w-44 h-44 bg-white p-2.5 rounded-xl mx-auto shadow-xs border border-[#EEDECF] flex flex-col items-center justify-center">
                <QrCode className="w-36 h-36 text-[#2C2523]" />
                <span className="text-[10px] font-mono text-[#847374] mt-1">Mã đơn: UB-2025-E098</span>
              </div>

              <div className="text-[11px] text-[#6B5C5D] mt-3">
                Ngân hàng: <strong>MBBank</strong> • STK: <strong>0938128899</strong><br />
                Chủ TK: <strong>CONG TY CO PHAN UNIBRIDAL</strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/profile/orders');
                }}
                className="w-full py-3.5 rounded-xl bg-[#733F49] hover:bg-[#5F323B] text-white font-jakarta text-[13.5px] font-bold transition-all border-0 cursor-pointer shadow-sm"
              >
                Xem Hợp Đồng Trong Hồ Sơ Cá Nhân
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/');
                }}
                className="w-full py-2.5 text-[#847374] hover:text-[#2C2523] text-[13px] font-semibold bg-transparent border-0 cursor-pointer"
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
