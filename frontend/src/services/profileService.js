import axiosClient from '../api/axiosClient';
const extrasKey = (id) => `unibridal.profile.extras.${id}`;
const addressText = (address) => typeof address === 'string' ? address : ['street', 'ward', 'district', 'city'].map((key) => address?.[key]).filter(Boolean).join(', ');
const measurementKeys = ['height', 'weight', 'bust', 'waist', 'hips'];
function localExtras(id) {
    try {
        return JSON.parse(localStorage.getItem(extrasKey(id)) || '{}');
    }
    catch {
        return {};
    }
}
function normalize(profile) {
    const extras = localExtras(profile.id || profile._id);
    return {
        ...profile,
        name: profile.name || profile.fullName || '',
        address: addressText(profile.address),
        addressParts: profile.address,
        ...Object.fromEntries(measurementKeys.map((key) => [key, profile.measurements?.[key] ?? ''])),
        gender: extras.gender || 'unspecified',
        birthday: extras.birthday || '',
        weddingDate: extras.weddingDate || '',
        heel: extras.heel || '',
    };
}
export const getProfile = async () => normalize((await axiosClient.get('/profile')).data);
export const saveProfile = async (profile) => {
    const address = profile.address === addressText(profile.addressParts)
        ? profile.addressParts : { street: profile.address || '', ward: '', district: '', city: '' };
    const res = await axiosClient.put('/profile', {
        name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar,
        address, idCard: profile.idCard,
        measurements: Object.fromEntries(measurementKeys.map((key) => [key, profile[key] === '' || profile[key] == null ? null : Number(profile[key])])),
    });
    // Only fields absent from the existing User schema stay on this device.
    const extras = Object.fromEntries(['gender', 'birthday', 'weddingDate', 'heel'].map((key) => [key, profile[key] || '']));
    try {
        localStorage.setItem(extrasKey(res.data.id || res.data._id), JSON.stringify(extras));
    }
    catch { /* Server save remains successful when device storage is full. */ }
    const updated = { ...normalize(res.data), ...extras };
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    try {
        storage.setItem('user', JSON.stringify(updated));
    }
    catch { /* AuthContext also keeps the current profile in memory. */ }
    return updated;
};
export const changePassword = async (payload) => (await axiosClient.patch('/profile/password', payload)).data;
export const clearProfile = () => { };
