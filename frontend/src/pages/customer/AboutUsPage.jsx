import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Scissors,
  Crown,
  Heart,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
  Gem,
  Award,
  CheckCircle2
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BookingModal from '../../components/common/BookingModal';

import aboutAtelierImg from '../../assets/about_atelier_hero.jpg';
import aboutFounderImg from '../../assets/about_founder_portrait.jpg';

export default function AboutUsPage() {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2523] flex flex-col font-jakarta selection:bg-[#FCEEE9] selection:text-[#B8737D]">
      {/* 1. Header Navigation */}
      <Header onOpenBooking={() => setIsBookingOpen(true)} />

      {/* 2. Main Content */}
      <main className="flex-1 w-full pb-20">
        
        {/* ========================================================================= */}
        {/* SECTION 1: HERO - TRIẾT LÝ NGHỆ THUẬT & DI SẢN UNIBRIDAL                */}
        {/* ========================================================================= */}
        <section className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 px-6 sm:px-8 overflow-hidden bg-gradient-to-b from-[#FFF7F5] via-[#FFFBF8] to-[#FDFBF7]">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[rgba(201,138,144,0.1)] blur-[70px] pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full bg-[rgba(230,218,200,0.25)] blur-[75px] pointer-events-none" />

          <div className="max-w-[1240px] mx-auto text-center relative z-10">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F3D8D8] shadow-xs mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D]"></span>
              <span className="font-jakarta font-bold text-[10.5px] uppercase tracking-[1.6px] text-[#B8737D]">
                DI SẢN & NGHỆ THUẬT
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-playfair text-[38px] sm:text-[48px] md:text-[54px] font-normal leading-[1.18] text-[#2C2523] m-0 mb-4 tracking-tight">
              Triết Lý Nghệ Thuật &{' '}
              <span className="italic text-[#B8737D] font-serif block sm:inline">
                Di Sản UniBridal
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-jakarta text-[14px] sm:text-[15.5px] leading-[26px] text-[#514344] max-w-[720px] mx-auto mb-10 sm:mb-12">
              Hành trình kiến tạo những giấc mơ lụa là, nơi chuẩn mực Haute Couture hòa quyện cùng câu chuyện tình yêu vĩnh cửu của người phụ nữ Á Đông.
            </p>

            {/* Large Atelier Banner Photo Card */}
            <div className="relative rounded-[28px] sm:rounded-[34px] overflow-hidden shadow-[0px_20px_50px_rgba(44,37,35,0.08)] border border-[#EEDECF] group">
              <img
                src={aboutAtelierImg}
                alt="Atelier De Haute Couture UniBridal"
                className="w-full h-[400px] sm:h-[500px] md:h-[560px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Bottom-Left Overlay Information */}
              <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-left z-10">
                <span className="px-3 py-1 rounded-[6px] bg-[#BA7A83]/90 backdrop-blur-md text-white font-jakarta text-[10px] sm:text-[11px] font-bold tracking-[1px] uppercase mb-2.5 inline-block shadow-xs">
                  KHÔNG GIAN ATELIER MAY ĐO
                </span>
                <h2 className="font-playfair text-[26px] sm:text-[34px] md:text-[38px] font-semibold text-white m-0 mb-2 leading-tight drop-shadow-sm">
                  Atelier De Haute Couture
                </h2>
                <p className="font-jakarta text-[13px] sm:text-[14.5px] text-white/90 max-w-[620px] m-0 leading-relaxed drop-shadow-xs">
                  Nơi mỗi tác phẩm váy cưới đều trải qua hàng trăm giờ đính kết thủ công tỉ mỉ từ những nghệ nhân có hơn 20 năm kinh nghiệm.
                </p>
              </div>
            </div>

            {/* 4 Statistics Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 mt-6 sm:mt-8">
              {[
                { number: '100%', label: 'Lụa Tơ Tằm & Ren Pháp' },
                { number: '300+', label: 'Giờ May Đo Thủ Công' },
                { number: '12+', label: 'Năm Di Sản Thương Hiệu' },
                { number: '5.000+', label: 'Nàng Dâu Đã Tỏa Sáng' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[22px] border border-[#EEDECF] p-5 sm:p-6 text-center shadow-[0px_4px_16px_rgba(201,138,144,0.06)] hover:shadow-[0px_8px_24px_rgba(184,115,125,0.12)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="font-playfair text-[30px] sm:text-[38px] font-medium text-[#804E55] mb-1 leading-none tracking-tight">
                    {stat.number}
                  </div>
                  <div className="font-jakarta text-[11px] sm:text-[12px] font-semibold text-[#695C4E] uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: CÂU CHUYỆN NGƯỜI SÁNG LẬP (FOUNDER'S STORY)                   */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 border-t border-[#EAE0DC]/60">
          <div className="max-w-[1240px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              
              {/* Left Column: Founder Photo with floating badge */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-[28px] overflow-hidden shadow-[0px_16px_40px_rgba(44,37,35,0.08)] border border-[#EEDECF]">
                  <img
                    src={aboutFounderImg}
                    alt="Elena Nguyen - Founder & Creative Director UniBridal"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>

                {/* Floating Signature Badge */}
                <div className="absolute -bottom-5 sm:-bottom-6 right-3 sm:-right-4 bg-white/95 backdrop-blur-md border border-[#EEDECF] rounded-[20px] p-4 sm:p-4.5 shadow-[0px_12px_32px_rgba(201,138,144,0.16)] flex items-center gap-3.5 z-10">
                  <div className="w-11 h-11 rounded-full bg-[#FFF2F0] border border-[#D498A0] flex items-center justify-center text-[#804E55] font-playfair font-bold text-[18px] shrink-0">
                    EN
                  </div>
                  <div>
                    <span className="block font-jakarta text-[10px] font-bold uppercase tracking-[1.4px] text-[#B8737D]">
                      FOUNDER & CREATIVE DIRECTOR
                    </span>
                    <span className="block font-playfair text-[16px] font-bold text-[#2C2523]">
                      Elena Nguyen
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative Content */}
              <div className="lg:col-span-7 flex flex-col items-start pt-4 lg:pt-0">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF2F0] border border-[#F3D8D8] shadow-xs mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D]"></span>
                  <span className="font-jakarta font-bold text-[10.5px] uppercase tracking-[1.4px] text-[#B8737D]">
                    CÂU CHUYỆN SÁNG LẬP
                  </span>
                </div>

                {/* Heading */}
                <h2 className="font-playfair text-[32px] sm:text-[40px] leading-[1.2] font-normal text-[#2C2523] mb-5 tracking-tight">
                  Giấc Mơ Tơ Lụa Giữa Trái Tim Paris Và <br className="hidden sm:inline" />
                  <span className="text-[#804E55] italic font-serif">Khát Vọng Tôn Vinh Phụ Nữ Á Đông</span>
                </h2>

                {/* Paragraphs */}
                <p className="font-jakarta text-[14px] sm:text-[15px] leading-[26px] text-[#514344] mb-4">
                  Khởi nguồn từ những năm tháng tu nghiệp và làm việc tại các nhà mốt danh tiếng ở Paris, chúng tôi nhận ra rằng người phụ nữ Á Đông xứng đáng có những thiết kế váy cưới vừa mang phom dáng corsetry siết eo kinh điển phương Tây, vừa thấu hiểu trọn vẹn tỷ lệ hình thể thanh thoát của người Á Châu.
                </p>

                <p className="font-jakarta text-[14px] sm:text-[15px] leading-[26px] text-[#514344] mb-6">
                  Tại UniBridal, chúng tôi không chỉ đơn thuần cho thuê hay may một chiếc váy cưới. Chúng tôi gửi gắm vào đó cả một tác phẩm nghệ thuật mang tính độc bản, một lời chúc phúc vĩnh cửu và sự tôn kính sâu sắc nhất dành cho ngày trọng đại thiêng liêng của mỗi nàng dâu.
                </p>

                {/* Quote Box */}
                <div className="w-full bg-[#FFF9F7] rounded-[20px] p-5 sm:p-6 border-l-4 border-[#804E55] shadow-xs mb-6">
                  <p className="font-playfair italic text-[16px] sm:text-[17.5px] text-[#2C2523] leading-[26px] m-0 mb-3">
                    "Một chiếc váy cưới đẹp không chỉ nằm ở sự lộng lẫy, mà ở cảm xúc tự hào được thắp sáng trên gương mặt nàng dâu khi bước vào lễ đường."
                  </p>
                  <div className="font-jakarta text-[11.5px] font-bold text-[#804E55] tracking-wider uppercase">
                    Elena Nguyen — Nhà Sáng Lập & Giám Đốc Sáng Tạo UniBridal
                  </div>
                </div>

                {/* Signature Block */}
                <div className="flex items-center gap-3">
                  <div className="font-playfair text-[20px] italic font-bold text-[#804E55]">
                    Elena Nguyen
                  </div>
                  <span className="text-[#A49394] text-[13px]">•</span>
                  <span className="font-jakarta text-[12.5px] text-[#695C4E]">
                    Paris & Sài Gòn Atelier
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: BỐN TRỤ CỘT CỐT LÕI (CORE VALUES)                             */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 bg-[#FAF6F3] border-t border-b border-[#EAE0DC]">
          <div className="max-w-[1240px] mx-auto text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#F3D8D8] shadow-xs mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D]"></span>
              <span className="font-jakarta font-bold text-[10.5px] uppercase tracking-[1.4px] text-[#B8737D]">
                GIÁ TRỊ CỐT LÕI
              </span>
            </div>

            {/* Title */}
            <h2 className="font-playfair text-[32px] sm:text-[40px] font-normal text-[#2C2523] m-0 mb-3 tracking-tight">
              Bốn Trụ Cột Cốt Lõi Tạo Nên Tuyệt Tác
            </h2>
            <p className="font-jakarta text-[14px] sm:text-[15px] text-[#514344] max-w-[620px] mx-auto m-0 mb-12">
              Chuẩn mực tạo nên sự khác biệt và đẳng cấp độc bản của UniBridal
            </p>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                {
                  icon: Gem,
                  title: 'Lụa & Ren Pháp Ý',
                  desc: '100% chất liệu cao cấp nhập khẩu từ các xưởng dệt truyền thống tại Lyon và Como, mang lại cảm giác mềm mại và sang trọng tuyệt đối.',
                },
                {
                  icon: Scissors,
                  title: 'Corsetry Hoàng Gia',
                  desc: 'Kỹ thuật nẹp eo corsetry chuẩn Châu Âu giúp định hình vòng eo con kiến hoàn hảo mà vẫn đảm bảo sự êm ái, thoải mái khi di chuyển.',
                },
                {
                  icon: Crown,
                  title: 'Đính Kết Thủ Công',
                  desc: 'Hàng nghìn viên pha lê Swarovski và hạt cườm ngọc trai được đính kết thủ công bằng tay với độ chính xác và tinh xảo từng milimet.',
                },
                {
                  icon: Heart,
                  title: 'Dáng Thể Phù Hợp',
                  desc: 'Phom dáng được hiệu chỉnh tỉ mỉ theo tỷ lệ nhân trắc học của phụ nữ Việt, tôn vinh nét đẹp dịu dàng và thanh thoát tự nhiên.',
                },
              ].map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[24px] border border-[#EEDECF] p-7 shadow-[0px_4px_20px_rgba(201,138,144,0.06)] hover:shadow-[0px_12px_32px_rgba(184,115,125,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-[14px] bg-[#FFF2F0] border border-[#D498A0]/70 flex items-center justify-center text-[#804E55] mb-5 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-5 h-5 stroke-[1.8]" />
                      </div>

                      {/* Title */}
                      <h3 className="font-playfair text-[20px] font-semibold text-[#2C2523] mb-2.5">
                        {pillar.title}
                      </h3>

                      {/* Desc */}
                      <p className="font-jakarta text-[13px] leading-[22px] text-[#695C4E] m-0">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-[#F2E8E1] flex items-center gap-1 text-[#804E55] font-jakarta text-[11px] font-bold tracking-wider uppercase">
                      <span>Chuẩn mực độc bản</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: DÒNG THỜI GIAN (NHỮNG DẤU ẤN KHÔNG THỂ QUÊN)                  */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 px-6 sm:px-8">
          <div className="max-w-[1080px] mx-auto">
            {/* Tag & Title */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#F3D8D8] shadow-xs mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D]"></span>
                <span className="font-jakarta font-bold text-[10.5px] uppercase tracking-[1.4px] text-[#B8737D]">
                  HÀNH TRÌNH PHÁT TRIỂN
                </span>
              </div>
              <h2 className="font-playfair text-[34px] sm:text-[42px] font-normal text-[#2C2523] m-0 tracking-tight">
                Những Dấu Ấn Không Thể Quên
              </h2>
            </div>

            {/* Alternating Timeline */}
            <div className="relative">
              {/* Central Spine Line */}
              <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#D498A0]/30 via-[#804E55]/60 to-[#D498A0]/30 -translate-x-1/2 hidden md:block" />

              <div className="space-y-12 md:space-y-16">
                {[
                  {
                    year: '2014',
                    side: 'left',
                    title: 'Khởi Nguồn Tại Paris',
                    desc: 'Những bản vẽ phác thảo đầu tiên và xưởng may đo thủ công nhỏ ra đời tại Paris, phục vụ các khách hàng cá nhân yêu thích phong cách Haute Couture tinh xảo.',
                  },
                  {
                    year: '2018',
                    side: 'right',
                    title: 'Ra Mắt Showroom Flagship Đầu Tiên',
                    desc: 'Chính thức ra mắt không gian thử váy riêng tư chuẩn hoàng gia tại TP. Hồ Chí Minh với bộ sưu tập hơn 100 thiết kế váy cưới độc bản may đo thủ công.',
                  },
                  {
                    year: '2022',
                    side: 'left',
                    title: 'Mở Rộng Dịch Vụ Thuê Cao Cấp',
                    desc: 'Tiên phong chuẩn hóa quy trình giặt hấp sinh học và bảo quản váy cưới công nghệ cao, đưa trải nghiệm váy cưới cao cấp đến gần hơn với mọi cô dâu.',
                  },
                  {
                    year: '2026',
                    side: 'right',
                    title: 'Kỷ Nguyên Số Cùng UniBridal',
                    desc: 'Ra mắt nền tảng thử váy và đặt thuê trực tuyến đồng bộ, kết hợp dịch vụ tư vấn 1-1 chuyên nghiệp cùng chuyên gia tạo mẫu tại salon.',
                  },
                ].map((milestone, idx) => {
                  const isLeft = milestone.side === 'left';
                  return (
                    <div
                      key={idx}
                      className="relative flex flex-col md:flex-row items-center justify-between"
                    >
                      {/* Left Block */}
                      <div className={`w-full md:w-[44%] ${isLeft ? 'md:text-right' : 'md:order-2 md:text-left'}`}>
                        <div className="bg-white rounded-[22px] border border-[#EEDECF] p-6 sm:p-7 shadow-[0px_4px_20px_rgba(201,138,144,0.06)] hover:shadow-md transition-shadow">
                          <span className="font-playfair text-[24px] font-bold text-[#804E55] block mb-1">
                            {milestone.year}
                          </span>
                          <h3 className="font-playfair text-[20px] font-semibold text-[#2C2523] mb-2">
                            {milestone.title}
                          </h3>
                          <p className="font-jakarta text-[13.5px] leading-[22px] text-[#695C4E] m-0">
                            {milestone.desc}
                          </p>
                        </div>
                      </div>

                      {/* Central Node */}
                      <div className="my-4 md:my-0 z-10">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-[#804E55] shadow-[0_0_14px_rgba(218,142,150,0.5)] flex items-center justify-center text-[#804E55] font-playfair font-bold text-[13px]">
                          {milestone.year.slice(-2)}
                        </div>
                      </div>

                      {/* Empty Placeholder for symmetrical grid */}
                      <div className={`hidden md:block w-full md:w-[44%] ${isLeft ? 'md:order-2' : ''}`} />
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: KẾT NỐI CÙNG UNIBRIDAL (SHOWROOM & SALON)                     */}
        {/* ========================================================================= */}
        <section className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-6 sm:px-8 bg-[#FAF6F3] border-t border-[#EAE0DC]">
          <div className="max-w-[1080px] mx-auto text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#F3D8D8] shadow-xs mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D]"></span>
              <span className="font-jakarta font-bold text-[10.5px] uppercase tracking-[1.4px] text-[#B8737D]">
                HỆ THỐNG SHOWROOM & SALON
              </span>
            </div>

            {/* Title */}
            <h2 className="font-playfair text-[34px] sm:text-[42px] font-normal text-[#2C2523] m-0 mb-3 tracking-tight">
              Kết Nối Cùng UniBridal
            </h2>
            <p className="font-jakarta text-[14px] sm:text-[15px] text-[#514344] max-w-[620px] mx-auto m-0 mb-12">
              Hãy để chúng tôi đồng hành cùng nàng kiến tạo khoảnh khắc rạng ngời nhất cuộc đời
            </p>

            {/* 2 Showroom Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 text-left">
              {/* Showroom TP. Hồ Chí Minh */}
              <div className="bg-white rounded-[26px] border border-[#EEDECF] p-8 shadow-[0px_6px_24px_rgba(201,138,144,0.08)] flex flex-col justify-between hover:shadow-[0px_12px_32px_rgba(184,115,125,0.14)] hover:-translate-y-1 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-[14px] bg-[#FFF2F0] border border-[#D498A0]/70 flex items-center justify-center text-[#804E55] mb-5">
                    <MapPin className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="font-jakarta text-[11px] font-bold text-[#B8737D] uppercase tracking-[1.2px] block mb-1">
                    SHOWROOM & ATELIER
                  </span>
                  <h3 className="font-playfair text-[22px] font-semibold text-[#2C2523] mb-4">
                    TP. Hồ Chí Minh
                  </h3>

                  <div className="space-y-3 font-jakarta text-[13.5px] text-[#514344]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#804E55] shrink-0 mt-0.5" />
                      <span>Số 12 Đường Lê Duẩn, Phường Bến Nghé, Quận 1</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#804E55] shrink-0" />
                      <span>Hotline: 0908 123 456</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#804E55] shrink-0" />
                      <span>09:00 - 21:00 (Tất cả các ngày trong tuần)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F2E8E1]">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full py-3 rounded-xl bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer active:scale-98"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt Lịch Thử Váy Riêng Tư</span>
                  </button>
                </div>
              </div>

              {/* Showroom Hà Nội */}
              <div className="bg-white rounded-[26px] border border-[#EEDECF] p-8 shadow-[0px_6px_24px_rgba(201,138,144,0.08)] flex flex-col justify-between hover:shadow-[0px_12px_32px_rgba(184,115,125,0.14)] hover:-translate-y-1 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-[14px] bg-[#FFF2F0] border border-[#D498A0]/70 flex items-center justify-center text-[#804E55] mb-5">
                    <MapPin className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="font-jakarta text-[11px] font-bold text-[#B8737D] uppercase tracking-[1.2px] block mb-1">
                    SHOWROOM & SALON
                  </span>
                  <h3 className="font-playfair text-[22px] font-semibold text-[#2C2523] mb-4">
                    Hà Nội
                  </h3>

                  <div className="space-y-3 font-jakarta text-[13.5px] text-[#514344]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#804E55] shrink-0 mt-0.5" />
                      <span>Số 24 Tràng Thi, Phường Hàng Trống, Quận Hoàn Kiếm</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#804E55] shrink-0" />
                      <span>Hotline: 0909 789 012</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#804E55] shrink-0" />
                      <span>09:00 - 21:00 (Tất cả các ngày trong tuần)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F2E8E1]">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full py-3 rounded-xl bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer active:scale-98"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt Lịch Thử Váy Riêng Tư</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Booking Consultation Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
