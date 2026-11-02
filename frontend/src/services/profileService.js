import axiosClient from '../api/axiosClient';

const extrasKey = (id) => `unibridal.profile.extras.${id}`;
function localExtras(id) {
  if (!id) return {};
  try {
    return JSON.parse(localStorage.getItem(extrasKey(id)) || '{}');
  } catch {
    return {};
  }
}

export const getProfile = async () => {
  let profile = {};
  try {
    const res = await axiosClient.get('/profile');
    profile = res?.data || res || {};
  } catch (error) {
    const cached = localStorage.getItem('user');
    profile = cached ? JSON.parse(cached) : {};
  }
  const uid = profile.id || profile._id || 'current_user';
  const extras = localExtras(uid);

  return {
    ...profile,
    gender: profile.gender || extras.gender || 'unspecified',
    birthday: profile.birthday || extras.birthday || '',
    weddingDate: profile.weddingDate || extras.weddingDate || '',
    address: profile.address || extras.address || '',
    idCard: profile.idCard || extras.idCard || '',
    height: extras.height || extras.measurements?.height || profile.height || '',
    weight: extras.weight || extras.measurements?.weight || profile.weight || '',
    bust: extras.bust || extras.measurements?.bust || profile.bust || '',
    waist: extras.waist || extras.measurements?.waist || profile.waist || '',
    hips: extras.hips || extras.measurements?.hips || profile.hips || '',
    heel: extras.heel || extras.measurements?.heel || profile.heel || '',
    ...extras,
  };
};

export const saveProfile = async (profile) => {
  let updated = profile;
  try {
    const res = await axiosClient.put('/profile', {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar,
    });
    updated = res?.data || res || profile;
  } catch {
    // Luôn giữ an toàn nếu endpoint chưa hỗ trợ các trường mở rộng
    updated = profile;
  }

  const extras = {
    gender: profile.gender || 'unspecified',
    birthday: profile.birthday || '',
    weddingDate: profile.weddingDate || '',
    address: profile.address || '',
    idCard: profile.idCard || '',
    height: profile.height || '',
    weight: profile.weight || '',
    bust: profile.bust || '',
    waist: profile.waist || '',
    hips: profile.hips || '',
    heel: profile.heel || '',
    measurements: {
      height: profile.height || '',
      weight: profile.weight || '',
      bust: profile.bust || '',
      waist: profile.waist || '',
      hips: profile.hips || '',
      heel: profile.heel || '',
    },
  };

  const uid = updated.id || updated._id || 'current_user';
  localStorage.setItem(extrasKey(uid), JSON.stringify(extras));

  // Đồng bộ vào 'user' trong localStorage để các trang khác (Checkout, Appointment) tự động nhận
  try {
    const currentCached = JSON.parse(localStorage.getItem('user') || '{}');
    const mergedUser = {
      ...currentCached,
      ...updated,
      ...extras,
      name: updated.name || currentCached.name,
      fullName: updated.name || currentCached.fullName,
    };
    localStorage.setItem('user', JSON.stringify(mergedUser));
  } catch {}

  return { ...updated, ...extras };
};

export const changePassword = async (payload) => {
  const res = await axiosClient.patch('/profile/password', payload);
  return res?.data || res;
};

export const clearProfile = () => {};
