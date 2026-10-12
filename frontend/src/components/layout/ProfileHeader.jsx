import React from 'react';
import { Link } from 'react-router-dom';
import { Popover } from 'antd';
import { Bell, Heart, Menu, MessageSquare, ShoppingBag, User } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const navLinks = <><a href="/">Trang chủ</a><a href="/#collection">Bộ Sưu Tập</a><a href="/#brides">Về chúng tôi</a></>;

export default function ProfileHeader({ onLogout }) {
  const account = <div className="profile-account-menu">
    <p>TÀI KHOẢN</p>
    <Link to="/profile" className="profile-account-active"><strong>Trang cá nhân</strong><span>Quản lý thông tin & lịch hẹn thử váy.</span></Link>
    <Link to="/login"><strong>Đăng nhập</strong><span>Truy cập tài khoản thành viên UniBridal.</span></Link>
    <button onClick={onLogout}><strong>Đăng xuất</strong><span>Xóa hồ sơ mẫu đã lưu trên thiết bị.</span></button>
  </div>;

  return <header className="profile-header border-b border-[#f1e6e2] bg-white">
    <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
      <Link to="/" aria-label="UniBridal — Trang chủ" className="flex shrink-0 items-center gap-2.5">
        <img src={logoImg} alt="" className="h-10 w-auto" />
        <span className="font-playfair text-[24px] font-bold">UniBridal</span>
      </Link>
      <nav aria-label="Điều hướng chính" className="hidden items-center gap-12 lg:flex">{navLinks}</nav>
      <div className="flex items-center gap-1 sm:gap-3">
        {[{ Icon: Bell, label: 'Thông báo', text: 'Bạn chưa có thông báo mới.', mobile: true }, { Icon: MessageSquare, label: 'Tin nhắn', text: 'Liên hệ showroom qua hotline 0908 123 888.', mobile: true }, { Icon: ShoppingBag, label: 'Giỏ thuê váy', text: 'Chưa có sản phẩm trong giỏ thuê.' }, { Icon: Heart, label: 'Yêu thích', text: 'Khám phá bộ sưu tập và chọn những thiết kế bạn yêu thích.' }].map(({ Icon, label, text, mobile }) =>
          <Popover key={label} title={label} content={<div className="max-w-[240px] text-sm leading-6">{text}<a className="block text-[#874e57] underline" href="/#collection">Khám phá bộ sưu tập</a></div>} trigger="click" placement="bottomRight">
            <button type="button" aria-label={label} className={`profile-icon-button ${mobile ? 'hidden sm:inline-flex' : 'inline-flex'}`}><Icon size={23} strokeWidth={1.7} /></button>
          </Popover>)}
        <Popover content={account} trigger="click" placement="bottomRight" classNames={{ root: 'profile-account-popover', container: 'profile-account-surface' }}>
          <button type="button" aria-label="Tài khoản" className="profile-icon-button profile-account-button inline-flex"><User size={23} strokeWidth={1.7} /></button>
        </Popover>
        <Popover content={<nav className="flex min-w-40 flex-col gap-4 p-2" aria-label="Điều hướng di động">{navLinks}</nav>} trigger="click" placement="bottomRight">
          <button type="button" aria-label="Mở menu" className="profile-icon-button inline-flex lg:hidden"><Menu size={23} /></button>
        </Popover>
      </div>
    </div>
  </header>;
}
