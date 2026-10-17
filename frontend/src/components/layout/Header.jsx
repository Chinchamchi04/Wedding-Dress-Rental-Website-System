import React, { useState, useRef } from 'react';
import { ShoppingBag, Heart, User, Calendar, ChevronDown, Menu, X } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const Header = ({ onOpenBooking, cartCount = 2, wishlistCount = 2 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userTimeoutRef = useRef(null);

  const categories = [
    {
      title: 'Váy Cưới Haute Couture',
      subtitle: 'Độc bản may đo & ren Pháp cao cấp',
      href: '#collection',
    },
    {
      title: 'Phom Dáng Corsetry',
      subtitle: 'Ballgown, Mermaid, A-Line chuẩn tỷ lệ',
      href: '#silhouettes',
    },
    {
      title: 'Vest Cưới & Tuxedo',
      subtitle: 'Phong cách quý ông Châu Âu thanh lịch',
      href: '#collection',
    },
    {
      title: 'Áo Dài Cưới Truyền Thống',
      subtitle: 'Gấm thêu tay hoàng gia cao cấp',
      href: '#collection',
    },
  ];

  const userAccountItems = [
    {
      title: 'Trang cá nhân',
      href: '/profile',
    },
    {
      title: 'Đăng nhập',
      href: '/login',
    },
    {
      title: 'Đăng xuất',
      href: '/logout',
    },
  ];

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
    setIsUserMenuOpen(true);
  };

  const handleUserMouseLeave = () => {
    userTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#E6DAC8]/40 shadow-[0px_1px_6px_rgba(201,138,144,0.05)]">
      <div className="max-w-[1320px] mx-auto h-[68px] px-5 sm:px-8 flex items-center justify-between">

        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline group select-none">
          <img
            src={logoImg}
            alt="UniBridal Emblem"
            className="h-[32px] w-auto object-contain"
          />
          <span className="font-playfair text-[24px] font-bold tracking-[0.2px] text-[#2C2523] leading-none">
            UniBridal
          </span>
        </a>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          <a
            href="#home"
            className="font-jakarta text-[15.5px] font-medium text-[#2C2523] no-underline hover:text-[#B8737D] transition-colors"
          >
            Trang chủ
          </a>

          {/* Dropdown: Bộ Sưu Tập */}
          <div
            className="relative group py-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`font-jakarta text-[15.5px] font-medium flex items-center gap-1.5 no-underline transition-colors bg-transparent border-0 cursor-pointer p-0 ${isDropdownOpen ? 'text-[#B8737D]' : 'text-[#2C2523] group-hover:text-[#B8737D]'
                }`}
            >
              <span>Bộ Sưu Tập</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 stroke-[2.2] ${isDropdownOpen
                  ? 'rotate-180 text-[#B8737D]'
                  : 'text-[#2C2523] group-hover:rotate-180 group-hover:text-[#B8737D]'
                  }`}
              />
            </button>

            {/* Dropdown Menu Box - shows on group-hover or when isDropdownOpen */}
            <div
              className={`absolute top-full -left-6 pt-1 z-50 transition-all duration-150 ${isDropdownOpen
                ? 'block opacity-100 pointer-events-auto'
                : 'hidden group-hover:block group-hover:opacity-100 group-hover:pointer-events-auto'
                }`}
            >
              <div className="w-[330px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(44,37,35,0.12)] border border-[#F0E6E8] p-4 text-left">
                <div className="text-[11px] font-bold tracking-wider text-[#B8737D] uppercase mb-2.5 px-2">
                  DANH MỤC TRANG PHỤC CƯỚI
                </div>

                <div className="space-y-1">
                  {categories.map((cat, idx) => (
                    <a
                      key={idx}
                      href={cat.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#FAF5F6] transition-colors no-underline group/item cursor-pointer"
                    >
                      <div className="font-jakarta font-bold text-[14.5px] text-[#2C2523] group-hover/item:text-[#B8737D] transition-colors leading-snug">
                        {cat.title}
                      </div>
                      <div className="font-jakarta text-[12px] text-[#78716C] mt-0.5 leading-normal font-normal">
                        {cat.subtitle}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a
            href="#collection"
            className="font-jakarta text-[15.5px] font-medium text-[#2C2523] no-underline hover:text-[#B8737D] transition-colors"
          >
            Bảng Giá & Gói Thuê
          </a>

          <a
            href="#brides"
            className="font-jakarta text-[15.5px] font-medium text-[#2C2523] no-underline hover:text-[#B8737D] transition-colors"
          >
            Về chúng tôi
          </a>
        </nav>

        {/* Action Elements Right */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Wishlist Heart with badge */}
          <button
            type="button"
            className="relative p-1.5 flex items-center justify-center text-[#2C2523] hover:text-[#B8737D] transition-colors border-0 bg-transparent cursor-pointer"
            title="Yêu thích"
          >
            <Heart className="w-[19px] h-[19px] stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[#B8737D] text-white font-jakarta text-[9.5px] font-bold flex items-center justify-center leading-none">
              {wishlistCount}
            </span>
          </button>

          {/* Shopping Bag with badge */}
          <button
            type="button"
            className="relative p-1.5 flex items-center justify-center text-[#2C2523] hover:text-[#B8737D] transition-colors border-0 bg-transparent cursor-pointer"
            title="Giỏ thuê váy"
          >
            <ShoppingBag className="w-[19px] h-[19px] stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[#B8737D] text-white font-jakarta text-[9.5px] font-bold flex items-center justify-center leading-none">
              {cartCount}
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div
            className="relative group py-4"
            onMouseEnter={handleUserMouseEnter}
            onMouseLeave={handleUserMouseLeave}
          >
            <button
              id="user-profile-button"
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className={`p-1.5 flex items-center justify-center transition-colors border-0 bg-transparent cursor-pointer ${isUserMenuOpen ? 'text-[#B8737D]' : 'text-[#2C2523] group-hover:text-[#B8737D]'
                }`}
              title="Tài khoản"
            >
              <User className="w-[19px] h-[19px] stroke-[1.8]" />
            </button>

            {/* Dropdown Menu Box - matching 'Bộ Sưu Tập' design */}
            <div
              id="user-dropdown-menu"
              className={`absolute top-full right-0 pt-1 z-50 transition-all duration-150 ${isUserMenuOpen
                ? 'block opacity-100 pointer-events-auto'
                : 'hidden group-hover:block group-hover:opacity-100 group-hover:pointer-events-auto'
                }`}
            >
              <div className="w-[280px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(44,37,35,0.12)] border border-[#F0E6E8] p-4 text-left">
                <div className="text-[11px] font-bold tracking-wider text-[#B8737D] uppercase mb-2.5 px-2">
                  TÀI KHOẢN
                </div>

                <div className="space-y-1">
                  {userAccountItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#FAF5F6] transition-colors no-underline group/useritem cursor-pointer"
                    >
                      <div className="font-jakarta font-bold text-[14.5px] text-[#2C2523] group-hover/useritem:text-[#B8737D] transition-colors leading-snug">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="font-jakarta text-[12px] text-[#78716C] mt-0.5 leading-normal font-normal">
                          {item.subtitle}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Đặt Lịch Thử Váy CTA Button */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden sm:inline-flex items-center gap-2 bg-[#B8737D] hover:bg-[#a6626c] text-white font-jakarta text-[13.5px] font-semibold px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer border-0 select-none ml-1 active:scale-95"
          >
            <Calendar className="w-4 h-4 stroke-[2]" />
            <span>Đặt Lịch Thử Váy</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 flex items-center justify-center text-[#2C2523] hover:bg-[#FCEEE9] rounded-lg border-0 bg-transparent cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E6DAC8]/50 px-6 py-5 space-y-4 shadow-xl">
          <a
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-jakarta text-[16px] font-semibold text-[#2C2523] no-underline hover:text-[#B8737D]"
          >
            Trang chủ
          </a>

          <div>
            <div className="text-[11px] font-bold tracking-wider text-[#B8737D] uppercase mb-2">
              DANH MỤC TRANG PHỤC CƯỚI
            </div>
            <div className="pl-3 border-l-2 border-[#B8737D]/30 space-y-2.5">
              {categories.map((cat, idx) => (
                <a
                  key={idx}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block no-underline"
                >
                  <div className="text-[14px] font-semibold text-[#2C2523]">
                    {cat.title}
                  </div>
                  <div className="text-[12px] text-[#78716C]">
                    {cat.subtitle}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <a
            href="#collection"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-jakarta text-[16px] font-semibold text-[#2C2523] no-underline hover:text-[#B8737D]"
          >
            Bảng Giá & Gói Thuê
          </a>

          <a
            href="#brides"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-jakarta text-[16px] font-semibold text-[#2C2523] no-underline hover:text-[#B8737D]"
          >
            Về chúng tôi
          </a>

          <div>
            <div className="text-[11px] font-bold tracking-wider text-[#B8737D] uppercase mb-2">
              TÀI KHOẢN
            </div>
            <div className="pl-3 border-l-2 border-[#B8737D]/30 space-y-2.5">
              {userAccountItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block no-underline"
                >
                  <div className="text-[14px] font-semibold text-[#2C2523]">
                    {item.title}
                  </div>
                  <div className="text-[12px] text-[#78716C]">
                    {item.subtitle}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#B8737D] hover:bg-[#a6626c] text-white font-jakarta text-[14px] font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer border-0"
            >
              <Calendar className="w-4 h-4 stroke-[2]" />
              <span>Đặt Lịch Thử Váy</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
