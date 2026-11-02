import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, ConfigProvider, Form, Input } from 'antd';
import { Camera, Ruler, Calendar, MapPin, IdCard, Sparkles, CheckCircle2, Info } from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import { getProfile, saveProfile } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';

const profileStyles = `
:where(.profile-page) :is(h1, h2, h3, h4, p) { margin: 0; }
:where(.profile-page) button { background-color: transparent; font-family: inherit; cursor: pointer; }
.profile-page { background: #fff8f6; }
.profile-main { min-height: 809.5px; }
.profile-page button, .profile-page a, .profile-page input { -webkit-tap-highlight-color: transparent; }
.profile-page :is(button, a, input):focus-visible { outline: 2px solid #874e57; outline-offset: 4px; }
.profile-form .ant-form-item { margin-bottom: 16px; }
.profile-form .ant-form-item-label { padding-bottom: 4px; }
.profile-form .ant-form-item-label > label { font-size: 11px; height: auto; color: #514344; }
.profile-form .ant-input { background: #fff8f6; }
.profile-form .ant-input:hover, .profile-form .ant-input:focus { border-color: #b8737d; }
.profile-footer { background: #fff1ed; min-height: 378px; }
@media (min-width: 1024px) {
  .profile-identity { padding-top: 14px; padding-bottom: 14px; }
  .profile-form .ant-form-item { margin-bottom: 12px; }
  .profile-form .ant-form-item-label, .profile-form .ant-form-item-label > label { line-height: 16px; }
}
@media (max-width: 1023px) { .profile-main { min-height: auto; } }
@media (max-width: 479px) {
  .profile-cancel { min-width: 95px; }
  .profile-card { padding-left: 18px; padding-right: 18px; }
}
`;

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
  const [saved, setSaved] = useState(user || emptyProfile);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [notice, setNotice] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [readingAvatar, setReadingAvatar] = useState(false);
  const [form] = Form.useForm();
  const uploadRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        setSaved(profile);
        setAvatar(profile.avatar);
        form.setFieldsValue(profile);
        updateUser(profile);
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: error.message || 'Không tải được thông tin hồ sơ.' });
      });
    return () => {
      active = false;
    };
  }, [form]);

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
    setNotice({ type: 'info', text: 'Đã khôi phục thông tin được lưu gần nhất.' });
  };

  const submit = async (values) => {
    const profile = {
      ...saved,
      ...values,
      name: values.name?.trim(),
      email: values.email?.trim(),
      phone: values.phone?.trim(),
      address: values.address?.trim(),
      idCard: values.idCard?.trim(),
      avatar,
    };
    try {
      const updated = await saveProfile(profile);
      setSaved(updated);
      updateUser(updated);
      form.setFieldsValue(updated);
      setNotice({ type: 'success', text: 'Đã cập nhật thông tin hồ sơ & số đo vóc dáng thành công.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' });
    }
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
      setNotice({ type: 'info', text: 'Ảnh mới đã sẵn sàng. Bấm "Lưu thay đổi" để hoàn tất.' });
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
      <style>{profileStyles}</style>
      <AccountLayout breadcrumb={[{ label: 'Hồ sơ cá nhân' }]}>
        <section className="profile-card rounded-2xl bg-white px-5 py-7 sm:px-8 border border-[#F0E5DC] shadow-[0_4px_24px_rgba(44,37,35,0.03)]" aria-labelledby="profile-title">
          <div className="flex items-center gap-2">
            <span className="account-overline text-[#874e57] uppercase text-[11px] font-bold tracking-wider">Thông tin thành viên độc quyền</span>
          </div>
          <h1 id="profile-title" className="mt-1 font-playfair text-[26px] sm:text-[28px] font-semibold text-[#2C2523]">
            Hồ Sơ & Số Đo Cô Dâu
          </h1>
          <p className="mt-2 text-[13.5px] leading-6 text-[#6c5b57]">
            Quản lý thông tin liên hệ, ngày hôn lễ và thông số số đo riêng tư để xưởng may UniBridal Atelier căn chỉnh phom dáng hoàn mỹ nhất cho nàng.
          </p>
          <div className="account-heading-rule mt-3" />

          {notice && (
            <div className="mt-4">
              <Alert
                type={notice.type}
                message={notice.text}
                showIcon
                closable
                onClose={() => setNotice(null)}
              />
            </div>
          )}

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
                1. Thông Tin Cá Nhân & Liên Hệ
              </h3>
              <p className="text-[12px] text-[#7A6B6A] mb-4">
                Thông tin dùng để xưng hô và gửi thông báo lịch thử váy
              </p>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Họ và tên *</span>}
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn.' }]}
                >
                  <Input placeholder="Nhập họ và tên cô dâu..." size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Số điện thoại (Zalo) *</span>}
                  name="phone"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên lạc.' }]}
                >
                  <Input placeholder="Nhập số điện thoại liên hệ..." size="large" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Địa chỉ email *</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ email.' },
                    { type: 'email', message: 'Địa chỉ email không đúng định dạng.' },
                  ]}
                >
                  <Input placeholder="email@domain.com" size="large" />
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
                  2. Thông Tin Pháp Lý & Giao Nhận Lễ Phục
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Số CCCD / CMND (Lập hợp đồng pháp lý)</span>}
                  name="idCard"
                >
                  <Input placeholder="Nhập 12 số CCCD gắn chip..." size="large" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold uppercase tracking-wider text-[11px]">Ngày cưới chính thức</span>}
                  name="weddingDate"
                >
                  <Input type="date" size="large" />
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
                    3. Thông Số Vóc Dáng & Số Đo Haute Couture
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2E7D32]" /> Tinh chỉnh may đo miễn phí
                </span>
              </div>
              <p className="text-[12px] text-[#7A6B6A] mb-4">
                Thông số giúp hệ thống tính phom corset và hỗ trợ chuyên viên phòng VIP chuẩn bị váy vừa khít vóc dáng
              </p>

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

              <div className="bg-[#FAF7F5] rounded-xl p-3.5 border border-[#EEDECF] flex items-start gap-2.5 text-[12px] text-[#6E5D57]">
                <Info className="w-4 h-4 text-[#874e57] shrink-0 mt-0.5" />
                <span>
                  <strong>Mẹo nhỏ:</strong> Nếu nàng chưa có thước dây hoặc chưa chắc chắn, nàng hoàn toàn có thể để trống. Chuyên viên UniBridal sẽ hỗ trợ đo trực tiếp và tư vấn tại phòng VIP khi nàng đến thử váy.
                </span>
              </div>
            </div>

            {/* Submit / Reset Actions */}
            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#eee2df] pt-6">
              <button type="button" onClick={cancel} className="account-button-secondary">
                HỦY THAY ĐỔI
              </button>
              <button type="submit" className="account-button-primary">
                LƯU THAY ĐỔI
              </button>
            </div>
          </Form>
        </section>
      </AccountLayout>
    </ConfigProvider>
  );
}
