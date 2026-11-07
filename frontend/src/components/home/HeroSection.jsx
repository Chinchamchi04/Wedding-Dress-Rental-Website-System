import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CheckCircle } from 'lucide-react';
import heroBrideImg from '../../assets/hero_bride.jpg';
import laceDetailImg from '../../assets/lace_detail.jpg';
import logoEmblemImg from '../../assets/logo_emblem.png';

const HeroSection = ({ onOpenBooking }) => {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#FFF7F5] via-[#FFFBF8] to-[#FDFBF7] pt-8 pb-16 lg:pt-10 lg:pb-20">
      {/* Soft Ambient Radial Glows */}
      <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[rgba(201,138,144,0.12)] blur-[60px] pointer-events-none" />
      <div className="absolute top-1/2 -right-28 w-[500px] h-[500px] rounded-full bg-[rgba(230,218,200,0.3)] blur-[65px] pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start z-10 -mt-2 lg:-mt-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-[0px_2px_10px_rgba(0,0,0,0.04)] mb-6 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8737D] shrink-0" />
              <span className="font-jakarta font-semibold text-[11px] sm:text-[11.5px] tracking-[0.2em] uppercase text-[#B8737D] leading-none">
                BỘ SƯU TẬP CAO CẤP 2026
              </span>
            </div>

            {/* Heading 1 */}
            <h1 className="font-playfair text-[44px] sm:text-[54px] lg:text-[58px] leading-[1.15] font-normal tracking-tight text-[#2C2523] mb-5">
              Khoảnh Khắc <br />
              <span className="italic text-[#B8737D] font-normal">Tỏa Sáng Trọn Vẹn</span>
            </h1>

            {/* Paragraph */}
            <p className="font-jakarta font-light text-[15px] sm:text-[16px] leading-[26px] text-[#514344] max-w-[490px] mb-8">
              Tuyển tập áo cưới hoàng gia nhập khẩu và đính kết pha lê thủ công tinh xảo. Trải nghiệm nghi thức thử váy riêng tư đỉnh cao trong không gian salon độc bản.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8 sm:mb-9">
              <Link
                to="/collection"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#B8737D] text-white font-jakarta text-[14px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0px_4px_16px_rgba(184,115,125,0.3)] hover:bg-[#a6626c] hover:shadow-[0px_6px_20px_rgba(184,115,125,0.4)] active:scale-[0.98]"
              >
                KHÁM PHÁ BỘ SƯU TẬP
              </Link>
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white border border-[#E6DAC8] text-[#2C2523] font-jakarta text-[14px] font-medium tracking-wide hover:border-[#B8737D] hover:text-[#B8737D] transition-all duration-300 shadow-[0px_2px_8px_rgba(0,0,0,0.03)] cursor-pointer"
              >
                Đặt Lịch Thử Váy
              </button>
            </div>

            {/* Value Propositions: 3 cam kết nằm trên 1 hàng */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-3.5 border-t border-[#EEDECF] w-full overflow-x-auto sm:overflow-visible no-scrollbar">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8737D] shrink-0" />
                <span className="font-jakarta text-[11px] sm:text-[12.5px] text-[#514344] font-normal whitespace-nowrap">
                  Chỉnh may đo chuẩn số đo
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8737D] shrink-0" />
                <span className="font-jakarta text-[11px] sm:text-[12.5px] text-[#514344] font-normal whitespace-nowrap">
                  Giặt hấp sinh học tiệt trùng
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8737D] shrink-0" />
                <span className="font-jakarta text-[11px] sm:text-[12.5px] text-[#514344] font-normal whitespace-nowrap">
                  Ký hợp đồng &amp; hoàn cọc tức thì
                </span>
              </div>
            </div>

            {/* Atelier Key Stats: Chỉ số uy tín chất lượng (Ảnh 2) */}
            <div className="w-full pt-4 mt-3.5 border-t border-[#EEDECF]/60 grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <span className="font-playfair text-[28px] sm:text-[34px] font-normal text-[#B8737D] block leading-none mb-1.5">
                  100<span className="text-[18px] sm:text-[22px] font-normal">%</span>
                </span>
                <span className="font-jakarta text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] text-[#514344] block">
                  Lụa tơ tằm &amp; ren nhập khẩu Pháp
                </span>
              </div>

              <div>
                <span className="font-playfair text-[28px] sm:text-[34px] font-normal text-[#B8737D] block leading-none mb-1.5">
                  1 : 1
                </span>
                <span className="font-jakarta text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] text-[#514344] block">
                  Staff tư vấn riêng tư
                </span>
              </div>

              <div>
                <span className="font-playfair text-[28px] sm:text-[34px] font-normal text-[#B8737D] block leading-none mb-1.5">
                  2.400+
                </span>
                <span className="font-jakarta text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] text-[#514344] block">
                  Cô dâu tỏa sáng rạng ngời
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-[440px] sm:max-w-[480px]">
              {/* Floating Top Badge: Chính Sách Hoàn Cọc 100% */}
              <div className="absolute -top-4 right-4 sm:right-6 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-xs border border-[#E6DAC8] rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)]">
                <BadgeCheck className="w-4 h-4 text-white fill-[#B8737D] shrink-0" />
                <span className="font-jakarta text-[12px] font-medium text-[#2C2523]">
                  Chính Sách Hoàn Cọc 100%
                </span>
              </div>

              {/* Main Portrait Card */}
              <div className="relative w-full h-[580px] sm:h-[640px] rounded-[32px] overflow-hidden shadow-[0px_16px_40px_rgba(44,37,35,0.08)] border-4 border-white">
                <img
                  src={heroBrideImg}
                  alt="Nàng dâu trong mẫu váy cưới Elysian Rose"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,37,35,0.4)] via-transparent to-transparent pointer-events-none" />
                {/* Logo UniBridal Watermark */}
                <div
                  className="absolute bottom-5 right-5 z-10 pointer-events-none select-none transition-transform duration-300 hover:scale-110"
                  title="UniBridal Haute Couture"
                >
                  <img
                    src={logoEmblemImg}
                    alt="UniBridal Emblem"
                    className="w-[52px] h-[52px] object-contain drop-shadow-[0px_2px_8px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </div>

              {/* Floating Overlap Card 1: Luxury Lace Detail */}
              <div className="absolute -bottom-6 -left-8 sm:-left-12 lg:-left-14 z-20 w-[160px] sm:w-[190px] h-[210px] sm:h-[240px] rounded-2xl overflow-hidden shadow-[0px_12px_32px_rgba(0,0,0,0.12)] border-4 border-white hidden sm:block">
                <img
                  src={laceDetailImg}
                  alt="Chi tiết ren đính đá Swarovski thủ công"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs py-1.5 px-2 rounded-xl text-center shadow-xs">
                  <span className="font-jakarta text-[11px] uppercase font-bold tracking-wider text-[#B8737D]">
                    Ren Ý Thủ Công
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
