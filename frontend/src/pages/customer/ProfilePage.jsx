import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, ConfigProvider, Form, Input } from 'antd';
import { Camera, Ruler, Calendar, MapPin, IdCard, Sparkles, CheckCircle2, Info, Lock } from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import { getProfile, saveProfile } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';

import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const emptyProfile = {
    name: '',
    phone: '',
    email: '',
    gender: 'unspecified',
    birthday: '',
    avatar: '',
    address: '',
    idCard: '',
    weddingDate: '',
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hips: '',
    heel: '',
  };
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [reload, setReload] = useState(0);
  const [saved, setSaved] = useState(user || emptyProfile);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [notice, setNotice] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [readingAvatar, setReadingAvatar] = useState(false);
  const [form] = Form.useForm();
  const uploadRef = useRef(null);
  const readerRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const notify = (type, text) => {
    setNotice({ type, text });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setNotice(null);
    }, 4500);
  };

  useEffect(() => {
    let active = true;
    setProfileLoading(true);
    setProfileError('');
    getProfile()
      .then((profile) => {
        if (!active) return;
        setSaved(profile);
        setAvatar(profile.avatar);
        form.setFieldsValue(profile);
        updateUser(profile);
      })
      .catch((error) => {
        if (active) setProfileError(error.message || 'Không tải được thông tin hồ sơ.');
      }).finally(() => { if (active) setProfileLoading(false); });
    return () => {
      active = false;
    };
  }, [form, reload]);

  // Tự động cuộn đến mục số đo khi có hash #measurements
  useEffect(() => {
    if (location.hash === '#measurements') {
      setTimeout(() => {
        const el = document.getElementById('measurements');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
    }
  }, [location.hash]);

  useEffect(() => () => {
    readerRef.current?.abort();
    readerRef.current = null;
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  const today = new Date();
  const maxBirthday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cancel = () => {
    readerRef.current?.abort();
    readerRef.current = null;
    setReadingAvatar(false);
    form.setFieldsValue(saved);
    setAvatar(saved.avatar);
    setAvatarError('');
    notify('info', 'Đã khôi phục thông tin được lưu gần nhất.');
  };

  const submit = async (values) => {
    // Validate không cho phép sửa email đã đăng ký
    if (saved?.email && values.email && values.email.trim().toLowerCase() !== saved.email.trim().toLowerCase()) {
      notify('error', 'Không được phép thay đổi địa chỉ email đã đăng ký tài khoản.');
      return;
    }

    const profile = {
      ...saved,
      ...values,
      name: values.name?.trim(),
      email: saved?.email || values.email?.trim(), // Luôn bảo toàn email cố định
      phone: values.phone?.trim(),
      address: values.address?.trim(),
      idCard: values.idCard?.trim(),
      avatar,
    };
    setSaving(true);
    try {
      const updated = await saveProfile(profile);
      setSaved(updated);
      updateUser(updated);
      form.setFieldsValue(updated);
      notify('success', 'Đã cập nhật thông tin hồ sơ & số đo vóc dáng thành công.');
    } catch (error) {
      notify('error', error.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    readerRef.current?.abort();
    setAvatarError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setAvatarError('Chị hỗ trợ file ảnh định dạng PNG, JPG hoặc WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Dung lượng ảnh đại diện tối đa là 5MB.');
      return;
    }
    setReadingAvatar(true);
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => {
      setAvatar(reader.result);
      setReadingAvatar(false);
      notify('info', 'Ảnh mới đã sẵn sàng. Bấm "Lưu thay đổi" để hoàn tất.');
    };
    reader.onerror = () => {
      setAvatarError('Đọc file ảnh thất bại. Vui lòng thử lại.');
      setReadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#874e57',
          colorBorder: '#eee2df',
          borderRadius: 4,
          fontFamily: 'inherit',
          colorText: '#2c2221',
        },
      }}
    >

      {/* Floating Notification Toast */}
      {notice && (
        <div className="fixed top-8 right-6 z-[9999] max-w-sm sm:max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="shadow-[0_12px_36px_rgba(44,36,36,0.18)] rounded-xl overflow-hidden backdrop-blur-md">
            <Alert
              type={notice.type}
              message={
                <div className="flex flex-col pr-2">
                  <span className="font-semibold text-[13px] text-[#2C2424]">
                    {notice.type === 'success'
                      ? 'Thành công'
                      : notice.type === 'error'
                        ? 'Lỗi'
                        : 'Thông báo'}
                  </span>
                  <span className="text-[12px] text-[#554543] mt-0.5 leading-snug">
                    {notice.text}
                  </span>
                </div>
              }
              showIcon
              closable
              onClose={() => setNotice(null)}
              className="border border-[#EADBCE] bg-[#FFFBF9]/95 rounded-xl px-4 py-3"
            />
          </div>
        </div>
      )}

      <AccountLayout hideBreadcrumb={true} breadcrumb={[]}>
        <section className="profile-card rounded-2xl bg-white px-5 py-7 sm:px-8 border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)]" aria-labelledby="profile-title">
          <div className="flex items-center gap-2">

          </div>
          <h1 id="profile-title" className="mt-1 font-playfair text-[26px] sm:text-[28px] font-semibold text-[#2C2523]">
            Hồ Sơ Người Dùng
          </h1>

          <div className="account-heading-rule mt-3" />
          {profileError && <p role="alert" className="mt-4 text-sm text-red-700">{profileError} <button type="button" onClick={() => setReload((value) => value + 1)} className="underline">Thử lại</button></p>}

          {/* Avatar Upload */}
          <div className="profile-identity mt-6 flex flex-wrap items-center gap-5 border-b border-[#eee2df] pb-6">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#D498A0] bg-[#fff8f6] shadow-sm">
              {avatar ? (
                <img src={avatar} alt="Ảnh đại diện của nàng" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-playfair text-2xl text-[#874e57]">
                  {saved.name?.charAt(0) || 'U'}
                </div>
              )}
              {readingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                  ...
                </div>
              )}
            </div>
            <div>
              <input
                ref={uploadRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={uploadAvatar}
              />
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="account-button-secondary inline-flex items-center gap-1.5"
              >
                <Camera size={14} /> Thay đổi ảnh
              </button>
              {avatarError && <p className="mt-1.5 text-xs text-red-700">{avatarError}</p>}
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={saved}
            onFinish={submit}
            className="profile-form mt-6"
          >
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="pb-3 mb-4">
              <h3 className="font-playfair text-[18px] font-semibold text-[#2C2523] mb-1">
                1. Thông Tin  Liên Hệ
              </h3>


              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Họ và tên *</span>}
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn.' }]}
                >
                  <Input placeholder="Nhập họ và tên cô dâu..." size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Số điện thoại *</span>}
                  name="phone"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên lạc.' }]}
                >
                  <Input placeholder="Nhập số điện thoại liên hệ..." size="large" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={
                    <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span>Địa chỉ email *</span>
                      <Lock size={12} className="text-[#874e57]" />
                      <span className="text-[10px] lowercase text-[#8C7A7B] font-normal tracking-normal">
                        (cố định theo tài khoản)
                      </span>
                    </span>
                  }
                  name="email"
                  tooltip="Địa chỉ email dùng để định danh tài khoản và nhận thông báo đơn hàng/biên bản, không thể thay đổi."
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ email.' },
                    { type: 'email', message: 'Địa chỉ email không đúng định dạng.' },
                    () => ({
                      validator(_, value) {
                        if (saved?.email && value && value.trim().toLowerCase() !== saved.email.trim().toLowerCase()) {
                          return Promise.reject(new Error('Không được phép thay đổi địa chỉ email đã đăng ký.'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    placeholder="email@domain.com"
                    size="large"
                    disabled
                    className="!bg-[#F6EFEB] !text-[#6B5E5F] !cursor-not-allowed border-[#E5DAD4]"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Ngày sinh</span>}
                  name="birthday"
                >
                  <Input type="date" max={maxBirthday} size="large" />
                </Form.Item>
              </div>
            </div>

            {/* 2. THÔNG TIN PHÁP LÝ & GIAO NHẬN LỄ PHỤC */}
            <div className="pt-5 border-t border-[#eee2df] pb-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <IdCard className="w-4 h-4 text-[#874e57]" />
                <h3 className="font-playfair text-[18px] font-semibold text-[#2C2523] m-0">
                  2. Thông Tin Pháp Lý
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Số CCCD / CMND (Lập hợp đồng pháp lý)</span>}
                  name="idCard"
                >
                  <Input placeholder="Nhập 12 số CCCD gắn chip..." size="large" />
                </Form.Item>


              </div>

              <Form.Item
                label={<span className="font-semibold uppercase tracking-wider text-[11px]">Địa chỉ thường trú hoặc nhận lễ phục tận nhà</span>}
                name="address"
              >
                <Input placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..." size="large" />
              </Form.Item>
            </div>

            {/* 3. THÔNG SỐ VÓC DÁNG & SỐ ĐO CÔ DÂU (ANCHOR: #measurements) */}
            <div id="measurements" className="pt-5 border-t border-[#eee2df] pb-2 scroll-mt-24">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#874e57]" />
                  <h3 className="font-playfair text-[18px] font-semibold text-[#2C2523] m-0">
                    3. Thông Số Đo
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2E7D32]" /> Tinh chỉnh may đo miễn phí
                </span>
              </div>


              <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Chiều cao (cm)</span>}
                  name="height"
                >
                  <Input placeholder="VD: 165" size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Cân nặng (kg)</span>}
                  name="weight"
                >
                  <Input placeholder="VD: 50" size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Vòng 1 - Ngực (cm)</span>}
                  name="bust"
                >
                  <Input placeholder="VD: 84" size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Vòng 2 - Eo (cm)</span>}
                  name="waist"
                >
                  <Input placeholder="VD: 64" size="large" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Vòng 3 - Mông (cm)</span>}
                  name="hips"
                >
                  <Input placeholder="VD: 92" size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Chiều cao giày cưới dự kiến (cm)</span>}
                  name="heel"
                >
                  <Input placeholder="VD: 7 hoặc 9 (để căn chiều dài tùng váy)" size="large" />
                </Form.Item>
              </div>


            </div>

            {/* Submit / Reset Actions */}
            <p className="text-xs text-stone-500">Ngày sinh, ngày cưới và chiều cao giày được lưu trên thiết bị này.</p>
            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#eee2df] pt-6">
              <button type="button" onClick={cancel} className="account-button-secondary">
                HỦY THAY ĐỔI
              </button>
              <button type="submit" disabled={saving || profileLoading || !!profileError || readingAvatar} className="account-button-primary disabled:opacity-50">
                {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
            </div>
          </Form>
        </section>
      </AccountLayout>
    </ConfigProvider>
  );
}
