import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { message } from 'antd';
import {
  Search,
  Phone,
  Calendar,
  Clock,
  CalendarDays,
  Users,
  Building2,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
  APPOINTMENT_EVENT,
  SHOWROOM_BRANCHES,
} from '../../services/appointmentService';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAppointmentsApi();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setAppointments(list);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
      setError('Lỗi kết nối cơ sở dữ liệu: Không thể lấy danh sách lịch hẹn từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    window.addEventListener(APPOINTMENT_EVENT, fetchAppointments);
    return () => window.removeEventListener(APPOINTMENT_EVENT, fetchAppointments);
  }, [fetchAppointments]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAppointmentStatusApi(id, newStatus);
      const statusText =
        newStatus === 'confirmed'
          ? 'Đã xác nhận'
          : newStatus === 'completed'
          ? 'Hoàn tất'
          : 'Đã hủy';
      message.success(`Đã cập nhật trạng thái lịch hẹn thành "${statusText}"`);
      fetchAppointments();
    } catch {
      message.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch =
        !searchTerm.trim() ||
        (apt.customerName || apt.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.customerPhone || apt.phone || '').includes(searchTerm) ||
        (apt.appointmentCode || apt.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBranch =
        branchFilter === 'all' ||
        apt.branch === branchFilter ||
        apt.branchId === branchFilter;

      const currentStatus = (apt.status || 'pending').toLowerCase();
      const matchStatus =
        statusFilter === 'all' ||
        currentStatus === statusFilter.toLowerCase();

      return matchSearch && matchBranch && matchStatus;
    });
  }, [appointments, searchTerm, branchFilter, statusFilter]);

  const pendingCount = useMemo(() => {
    return appointments.filter((a) => (a.status || 'pending').toLowerCase() === 'pending').length;
  }, [appointments]);

  const confirmedCount = useMemo(() => {
    return appointments.filter((a) => (a.status || '').toLowerCase() === 'confirmed').length;
  }, [appointments]);

  const completedCount = useMemo(() => {
    return appointments.filter((a) => (a.status || '').toLowerCase() === 'completed').length;
  }, [appointments]);

  return (
    <AdminLayout activeMenu="appointments">
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Title & Subtitle */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-[26px] sm:text-[30px] font-bold text-[#5F2B36] tracking-tight">
            Quản Lý Lịch Hẹn Thử Váy
          </h1>
          <p className="text-[13px] text-[#7A6B6C] mt-1">
            Theo dõi, phê duyệt & sắp xếp phòng thử váy Private Suite 1:1 cho cô dâu tại hệ thống Showroom UniBridal.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#733F49] to-[#8C4654] hover:from-[#5A2D35] hover:to-[#733F49] text-white text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EFE5E1] p-5 shadow-xs transition-all hover:shadow-md">
          <span className="text-[11px] font-bold tracking-wider text-[#7A6B6C] uppercase">TỔNG LỊCH HẸN</span>
          <div className="text-[30px] font-bold text-[#2C2523] mt-1">{appointments.length}</div>
          <div className="text-[12px] text-[#8C7D7E] mt-1">Toàn bộ 2 chi nhánh</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#FDE68A] p-5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#FEF3C7_0%,_transparent_75%)] transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#92400E] uppercase">CHỜ DUYỆT (PENDING)</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                Mới
              </span>
            )}
          </div>
          <div className="text-[30px] font-bold text-[#B45309] mt-1">{pendingCount}</div>
          <div className="text-[12px] text-[#A16207] mt-1">Cần gọi điện xác nhận giờ</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#BBF7D0] p-5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#DEF5E7_0%,_transparent_75%)] transition-all hover:shadow-md">
          <span className="text-[11px] font-bold tracking-wider text-[#166534] uppercase">ĐÃ XÁC NHẬN</span>
          <div className="text-[30px] font-bold text-[#1E8347] mt-1">{confirmedCount}</div>
          <div className="text-[12px] text-[#15803D] mt-1">Phòng Suite đã khóa giờ</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDD6FE] p-5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#EDE9FE_0%,_transparent_75%)] transition-all hover:shadow-md">
          <span className="text-[11px] font-bold tracking-wider text-[#6D28D9] uppercase">HOÀN TẤT THỬ VÁY</span>
          <div className="text-[30px] font-bold text-[#7C3AED] mt-1">{completedCount}</div>
          <div className="text-[12px] text-[#6D28D9] mt-1">Đã trải nghiệm dịch vụ</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B8C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã lịch hẹn, tên cô dâu, số điện thoại..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F6] border border-[#EFE2DC] text-xs text-[#2C2523] outline-none focus:border-[#BA7A83] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Branch filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF2EE] border border-[#EFE2DC] text-[#554748] font-medium outline-none cursor-pointer"
          >
            <option value="all">Tất cả chi nhánh showroom (2 cơ sở)</option>
            <option value="hcm-q1">UniBridal Q.1 TP.HCM</option>
            <option value="hn-hoankiem">UniBridal Hoàn Kiếm, HN</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAF2EE] border border-[#EFE2DC] text-[#554748] font-medium outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt (Pending)</option>
            <option value="confirmed">Đã xác nhận (Confirmed)</option>
            <option value="completed">Đã hoàn tất (Completed)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Appointments Table Card */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3] text-[11px] font-bold text-[#7A696B] uppercase tracking-wider">
                <th className="py-4 px-5">MÃ & KHÁCH HÀNG</th>
                <th className="py-4 px-4">SHOWROOM & KHUNG GIỜ</th>
                <th className="py-4 px-4">LỄ PHỤC QUAN TÂM</th>
                <th className="py-4 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-4 px-5 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6EDE9] text-[12.5px]">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-[#8C7D7E] text-[13px]">
                    Không tìm thấy lịch hẹn thử váy nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const aptId = apt._id || apt.id || apt.appointmentCode;
                  const name = apt.customerName || apt.fullName || 'Cô dâu';
                  const phone = apt.customerPhone || apt.phone || '—';
                  const email = apt.customerEmail || apt.email || '';
                  const dateStr = apt.appointmentDate
                    ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN')
                    : apt.date || '—';
                  const time = apt.timeSlot || '—';
                  const dresses = apt.interestedDresses || apt.selectedDresses || [];
                  const status = (apt.status || 'pending').toLowerCase();
                  const branchLabel =
                    apt.branch === 'hn-hoankiem'
                      ? 'Hoàn Kiếm, HN'
                      : 'Q.1, TP. HCM';

                  return (
                    <tr key={aptId} className="hover:bg-[#FCF9F7] transition-colors">
                      <td className="py-4 px-5">
                        <div className="inline-block px-2 py-0.5 rounded bg-[#F6EDE8] text-[#846E63] font-mono text-[11px] font-bold mb-1">
                          {apt.appointmentCode || aptId}
                        </div>
                        <div className="font-semibold text-[#2C2523] text-[13.5px]">{name}</div>
                        <div className="text-[12px] text-[#7A6B6C] flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-[#BA7A83]" />
                          <a href={`tel:${phone}`} className="hover:text-[#BA7A83] hover:underline text-[#7A6B6C]">
                            {phone}
                          </a>
                        </div>
                        {email && (
                          <div className="text-[11px] text-[#9A8B8C] flex items-center gap-1 mt-0.5">
                            <Mail size={11} className="text-[#BA7A83]" />
                            <span>{email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF2EE] text-[#7A6B6C] text-[11px] font-semibold mb-1">
                          <Building2 size={11} className="text-[#BA7A83]" />
                          <span>{branchLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-[#2C2523]">
                          <Calendar size={13} className="text-[#BA7A83]" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-[#7A6B6C] mt-0.5">
                          <Clock size={12} className="text-[#BA7A83]" />
                          <span>{time}</span>
                        </div>
                        {apt.guestsCount && (
                          <div className="text-[11px] text-[#8C7D7E] mt-1 flex items-center gap-1">
                            <Users size={12} />
                            <span>Số khách: {apt.guestsCount} người</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-[280px]">
                        {dresses.length > 0 ? (
                          <div className="space-y-1">
                            {dresses.map((d, i) => (
                              <div
                                key={i}
                                className="inline-block px-2.5 py-1 rounded-lg bg-[#FFF2EE] text-[#804E55] text-[11px] font-medium mr-1.5 mb-1 border border-[#F3DBD4]"
                              >
                                {d.name || d}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#998889] italic text-[12px]">Tư vấn trực tiếp tại Showroom</span>
                        )}
                        {apt.notes && (
                          <div className="text-[11px] text-[#7A6B6C] mt-1 bg-[#FAF5F2] p-2 rounded-lg border border-[#F0E6E2]" title={apt.notes}>
                            <span className="font-semibold text-[#804E55]">Ghi chú:</span> {apt.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {status === 'confirmed' ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EAF8EE] text-[#1E8347]">
                            Đã xác nhận
                          </span>
                        ) : status === 'completed' ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#166534]">
                            Hoàn tất
                          </span>
                        ) : status === 'cancelled' ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280]">
                            Đã hủy
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]">
                            Chờ duyệt
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {status !== 'confirmed' && status !== 'completed' && status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(aptId, 'confirmed')}
                              className="px-3 py-1.5 rounded-lg bg-[#1E8347] hover:bg-[#166534] text-white text-[11px] font-semibold transition-colors cursor-pointer border-0 shadow-2xs"
                            >
                              Xác nhận lịch
                            </button>
                          )}
                          {status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(aptId, 'completed')}
                              className="px-3 py-1.5 rounded-lg bg-[#BA7A83] hover:bg-[#a86a73] text-white text-[11px] font-semibold transition-colors cursor-pointer border-0 shadow-2xs"
                            >
                              Đã thử xong
                            </button>
                          )}
                          {status !== 'cancelled' && status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(aptId, 'cancelled')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF5F2] hover:bg-[#FCEEEA] text-[#847374] hover:text-[#BA7A83] text-[11px] transition-colors cursor-pointer border border-[#EEDECF]"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

