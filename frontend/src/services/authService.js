import axiosClient from '../api/axiosClient';

export const loginAccount = async (email, password) => (await axiosClient.post('/auth/login', { email, password })).data;
export const registerAccount = async (payload) => (await axiosClient.post('/auth/register', {
  ...payload,
  fullName: payload.fullName ?? payload.name,
})).data;
export const verifyEmailOtp = async (payload) => (await axiosClient.post('/auth/verify-email-otp', payload)).data;
export const resendEmailOtp = async (email) => (await axiosClient.post('/auth/resend-otp', { email })).data;
export const forgotPassword = async (email) => (await axiosClient.post('/auth/forgot-password', { email })).data;
export const verifyResetOtp = async (payload) => (await axiosClient.post('/auth/verify-reset-otp', payload)).data;
export const resetPassword = async (payload) => (await axiosClient.post('/auth/reset-password', payload)).data;
