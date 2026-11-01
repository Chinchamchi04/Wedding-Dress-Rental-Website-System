import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, ConfigProvider, Form, Input, Select } from 'antd';
import { BadgeCheck, Camera, Check, IdCard, Upload } from 'lucide-react';
import AccountLayout from '../../components/layout/AccountLayout';
import emblemImg from '../../assets/images/unibridal-emblem-transparent.png';
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
.profile-form .ant-select { width: 100%; }
.profile-form .ant-select-selector { background: #fff8f6 !important; }
.profile-form .ant-input:hover, .profile-form .ant-input:focus { border-color: #b8737d; }
.profile-footer { background: #fff1ed; min-height: 378px; }
@media (min-width: 1024px) {
  .profile-identity { padding-top: 14px; padding-bottom: 14px; }
  .profile-contact-title { margin-bottom: 8px; }
  .profile-form .ant-form-item { margin-bottom: 9px; }
  .profile-form .ant-form-item-label, .profile-form .ant-form-item-label > label { line-height: 16px; }
  .profile-sidebar nav > button { padding-top: 8.5px; padding-bottom: 8.5px; }
  .profile-sidebar nav > button:last-child { padding-top: 9px; padding-bottom: 8px; }
}
@media (max-width: 1023px) { .profile-main { min-height: auto; } }
@media (max-width: 479px) {
  .profile-cancel { min-width: 95px; }
  .profile-card { padding-left: 18px; padding-right: 18px; }
}
`;

export default function ProfilePage() {
  const { user, logout: logoutAccount, updateUser } = useAuth();
  const emptyProfile = { name: '', phone: '', email: '', gender: 'unspecified', birthday: '', avatar: '' };
  const [saved, setSaved] = useState(user || emptyProfile);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [notice, setNotice] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [readingAvatar, setReadingAvatar] = useState(false);
  const [form] = Form.useForm();
  const uploadRef = useRef(null);
  const readerRef = useRef(null);
  const navigate = useNavigate();

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
    form.setFields(['name', 'phone', 'email', 'gender', 'birthday'].map((name) => ({ name, errors: [] })));
    setAvatar(saved.avatar);
    setAvatarError('');
    setNotice({ type: 'info', text: 'Đã khôi phục thông tin được lưu gần nhất.' });
  };

  const submit = async (values) => {
    const profile = {
      ...saved,
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      avatar,
    };
    try {
      const updated = await saveProfile(profile);
      setSaved(updated);
      updateUser(updated);
      form.setFieldsValue(updated);
      setNotice({ type: 'success', text: 'Đã cập nhật thông tin hồ sơ thành công.' });
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
      setAvatarError('Chỉ hỗ trợ file ảnh định dạng PNG, JPG hoặc WEBP.');
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
          borderRadius: 2,
          fontFamily: 'inherit',
          colorText: '#2c2221',
        },
      }}
    >
      <style>{profileStyles}</style>
      <AccountLayout breadcrumb={[{ label: 'Hồ sơ cá nhân' }]}>
        <section className="profile-card rounded-lg bg-white px-5 py-7 sm:px-7" aria-labelledby="profile-title">
          <p className="account-overline text-[#874e57]">Thông tin thành viên độc quyền</p>
          <h1 id="profile-title" className="mt-1 font-playfair text-[25px]">
            Hồ Sơ Của Nàng
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6c5b57]">
            Quản lý thông tin cá nhân, liên hệ và các thông số riêng tư để chuyên viên UniBridal chuẩn bị chu đáo nhất cho ngày cưới.
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

          <div className="profile-identity mt-6 flex flex-wrap items-center gap-5 border-b border-[#eee2df] pb-6">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#eee2df] bg-[#fff8f6]">
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
            <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
              <Form.Item
                label={<span className="font-semibold uppercase tracking-wider text-[11px]">Họ và tên *</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn.' }]}
              >
                <Input placeholder="Nhập họ và tên..." size="large" />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold uppercase tracking-wider text-[11px]">Số điện thoại *</span>}
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên lạc.' }]}
              >
                <Input placeholder="Nhập số điện thoại Zalo..." size="large" />
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

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#eee2df] pt-6">
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
