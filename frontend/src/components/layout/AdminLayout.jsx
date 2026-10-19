import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  CalendarCheck,
  Package,
  FileSignature,
  Headphones,
  Store,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import emblemImg from '../../assets/images/unibridal-emblem-transparent.png';
import heroBride from '../../assets/hero_bride.jpg';
import HangerIcon from '../common/HangerIcon';

export default function AdminLayout({ children, activeMenu = 'don-thue' }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, to: '/admin/don-thue' },
    { key: 'products', label: 'Quản Lý Sản Phẩm', icon: HangerIcon, to: '/admin/kho-hang' },
    { key: 'categories', label: 'Quản Lý Danh Mục', icon: Layers, to: '/admin/kho-hang' },
    { key: 'don-thue', label: 'Quản Lý Đơn Thuê', icon: CalendarCheck, to: '/admin/don-thue' },
    { key: 'inventory', label: 'Quản Lý Kho Hàng', icon: Package, to: '/admin/kho-hang' },
    { key: 'contracts', label: 'Quản Lý Hợp Đồng', icon: FileSignature, to: '/admin/kho-hang' },
    { key: 'customer-care', label: 'Chăm sóc khách hàng', icon: Headphones, to: '/admin/cham-soc-khach-hang' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-jakarta text-[#2C2523] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Sticky/Cố định khi cuộn */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FCF7F4] border-r border-[#EFE5E1] flex flex-col justify-between py-6 px-4 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Logo */}
          <div className="flex items-center justify-between px-2 mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#EFE5E0] flex items-center justify-center p-1 shrink-0 transition-transform group-hover:scale-105">
                <img
                  src={logoImg}
                  alt="UniBridal"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-serif text-[20px] font-semibold tracking-normal text-[#733F49] select-none leading-none">
                UniBridal
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#733F49] hover:bg-[#F3E7E3]"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Section Title */}
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#A39192]">
              MENU QUẢN TRỊ
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.key;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#F2E4DE] text-[#5F333B] font-bold shadow-xs'
                      : 'text-[#6D5D5E] hover:bg-[#F8EFEA] hover:text-[#5F333B]'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#733F49]' : 'text-[#8A797A]'}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Box */}
        <div className="mt-8 rounded-lg bg-[#F6ECE8] border border-[#EFE2DD] p-2.5 flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-[#5F333B] bg-transparent hover:bg-[#EDE0DA] transition-colors"
          >
            <Store size={16} className="text-[#733F49]" />
            <span>VỀ TRANG CHỦ</span>
          </Link>
          <div className="h-px bg-[#EADBCE] my-0.5" />
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-[#C93B3B] bg-transparent hover:bg-[#FADBD8] transition-colors w-full text-left"
          >
            <LogOut size={16} />
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF5F2]">
        {/* Top Header Bar */}
        <header className="h-16 px-6 lg:px-8 bg-white border-b border-[#F0E6E2] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#733F49] hover:bg-[#F8EFEA]"
              aria-label="Mở menu điều hướng"
            >
              <Menu size={22} />
            </button>
            <Sparkles size={20} className="text-[#8A797A]" />
          </div>

          {/* User Profile Widget */}
          <div className="flex items-center">
            <div className="h-8 w-px bg-[#EFE5E1] mr-5 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[13.5px] font-bold text-[#2C2523] leading-tight">
                  Trần Bích Ngọc
                </div>
                <div className="inline-block mt-0.5 px-2 py-0.5 rounded-sm bg-[#FDECEE] text-[#B8737D] text-[9.5px] font-bold tracking-wider uppercase">
                  STAFF MODE
                </div>
              </div>
              <div className="relative">
                <img
                  src={heroBride}
                  alt="Trần Bích Ngọc"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#EFE5E1]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
