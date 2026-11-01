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
  try {
    const res = await axiosClient.get('/profile');
    const profile = res?.data || res || {};
    return {
      ...profile,
      gender: profile.gender || 'unspecified',
      birthday: profile.birthday || '',
      ...localExtras(profile.id || profile._id),
    };
  } catch (error) {
    const cached = localStorage.getItem('user');
    const profile = cached ? JSON.parse(cached) : {};
    return {
      ...profile,
      gender: profile.gender || 'unspecified',
      birthday: profile.birthday || '',
      ...localExtras(profile.id || profile._id),
    };
  }
};

export const saveProfile = async (profile) => {
  const res = await axiosClient.put('/profile', {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    avatar: profile.avatar,
  });
  const updated = res?.data || res || profile;
  const extras = { gender: profile.gender || 'unspecified', birthday: profile.birthday || '' };
  if (updated.id || updated._id) {
    localStorage.setItem(extrasKey(updated.id || updated._id), JSON.stringify(extras));
  }
  return { ...updated, ...extras };
};

export const changePassword = async (payload) => {
  const res = await axiosClient.patch('/profile/password', payload);
  return res?.data || res;
};

export const clearProfile = () => {};
