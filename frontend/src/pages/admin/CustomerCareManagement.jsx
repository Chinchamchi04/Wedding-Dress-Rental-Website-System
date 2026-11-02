import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { message } from 'antd';
import {
  Search,
  Pin,
  Phone,
  Image,
  Smile,
  Send,
  Sparkles,
  X,
  MessageSquare,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  CalendarDays,
  Users,
  Building2,
  RefreshCw,
  Mail,
  Filter,
} from 'lucide-react';
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
  APPOINTMENT_EVENT,
  SHOWROOM_BRANCHES,
} from '../../services/appointmentService';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  togglePin,
} from '../../services/chatService';

import card1Elysian from '../../assets/card1_elysian.jpg';
import card2Celeste from '../../assets/card2_celeste.jpg';
import card3Lumiere from '../../assets/card3_lumiere.jpg';
import card4Monet from '../../assets/card4_monet.jpg';
import heroBride from '../../assets/hero_bride.jpg';

const WEDDING_EMOJIS = [
  '😊', '🥰', '👰', '💍', '👗', '✨', '💐', '💖',
  '🤍', '🌸', '👑', '🥂', '🎉', '💌', '🎀', '💎',
  '🕊️', '🌹', '❤️', '👏', '🙏', '👍', '😍', '😘'
];

const INITIAL_CONVERSATIONS = [
  {
    id: 'init_1',
    name: 'Nguyễn Thảo Linh',
    avatar: card1Elysian,
    online: true,
    time: '14:32',
    lastMessage: 'Em muốn chỉnh hạ eo thêm 1.5cm cho mẫu Elysian Rose...',
    unread: false,
    messages: [
      {
        id: 101,
        sender: 'staff',
        text: 'Chị gửi Linh ảnh cận cảnh mũi thêu đính kết cườm hoa hồng 3D xưởng vừa lên khung xong trưa nay nhé!',
        time: '14:25',
        status: 'Đã xem',
      },
      {
        id: 102,
        sender: 'customer',
        text: 'Dạ tuyệt quá chị ơi! Vậy chị chốt lưu số đo chỉnh hạ eo thêm 1.5cm cho mẫu Elysian Rose giúp em vào hợp đồng nhé ạ! Hôm 15/11 em đến thử trực tiếp nha.',
        time: '14:32',
        status: 'Vừa nhận',
      },
    ],
  },
  {
    id: 'init_2',
    name: 'Lê Hoàng Yến',
    avatar: card2Celeste,
    online: false,
    time: '14:15',
    lastMessage: 'Cho em xin thông tin chuyển cọc hợp đồng #HD-2025-089',
    unread: true,
    messages: [
      {
        id: 201,
        sender: 'customer',
        text: 'Cho em xin thông tin chuyển cọc hợp đồng #HD-2025-089 với ạ, em chuyển khoản qua Vietcombank nha chị.',
        time: '14:15',
        status: 'Chưa đọc',
      },
    ],
  },
  {
    id: 'init_3',
    name: 'Trần Mai Phương',
    avatar: card3Lumiere,
    online: false,
    time: '13:40',
    lastMessage: 'Bộ voan cài đầu Cathedral có sẵn ở showroom Nam Kỳ...',
    unread: true,
    messages: [
      {
        id: 301,
        sender: 'customer',
        text: 'Bộ voan cài đầu Cathedral có sẵn ở showroom Nam Kỳ Khởi Nghĩa không chị ơi?',
        time: '13:40',
        status: 'Chưa đọc',
      },
    ],
  },
  {
    id: 'init_4',
    name: 'Đặng Ngọc Hà',
    avatar: card4Monet,
    online: false,
    time: '11:20',
    lastMessage: 'Lịch fitting ngày 20/11 em có thể đổi sang buổi chiều...',
    unread: true,
    messages: [
      {
        id: 401,
        sender: 'customer',
        text: 'Lịch fitting ngày 20/11 em có thể đổi sang buổi chiều khoảng 15h được không ạ?',
        time: '11:20',
        status: 'Chưa đọc',
      },
    ],
  },
  {
    id: 'init_5',
    name: 'Bùi Phương Anh',
    avatar: heroBride,
    online: false,
    time: 'Hôm qua',
    lastMessage: 'Dạ em đã nhận được vali váy cưới rồi, đẹp xuất sắc luôn ạ!',
    unread: false,
    messages: [
      {
        id: 501,
        sender: 'customer',
        text: 'Dạ em đã nhận được vali váy cưới rồi, đẹp xuất sắc luôn ạ! Cảm ơn đội ngũ UniBridal rất nhiều!',
        time: 'Hôm qua',
        status: 'Đã xem',
      },
    ],
  },
];

export default function CustomerCareManagement() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // all | unread
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(
    'Chốt lưu số đo chỉnh hạ eo thêm 1.5cm cho mẫu Elysian Rose vào hợp đồng. (Hôm 15/11 em đến thử trực tiếp nha)'
  );

  // State quản lý Lịch Hẹn Thử Váy (Appointments)
  const [mainTab, setMainTab] = useState('chat'); // 'chat' | 'appointments'
  const [appointments, setAppointments] = useState([]);
  const [aptLoading, setAptLoading] = useState(false);
  const [aptSearch, setAptSearch] = useState('');
  const [aptBranchFilter, setAptBranchFilter] = useState('all');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');

  const fetchAppointments = useCallback(async () => {
    setAptLoading(true);
    try {
      const res = await getAppointmentsApi();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setAppointments(list);
    } catch {
      // ignore
    } finally {
      setAptLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    window.addEventListener(APPOINTMENT_EVENT, fetchAppointments);
    return () => window.removeEventListener(APPOINTMENT_EVENT, fetchAppointments);
  }, [fetchAppointments]);

  const handleUpdateAptStatus = async (id, newStatus) => {
    try {
      await updateAppointmentStatusApi(id, newStatus);
      message.success(`Đã cập nhật trạng thái lịch hẹn thành "${newStatus === 'confirmed' ? 'Đã xác nhận' : newStatus === 'completed' ? 'Hoàn tất' : 'Đã hủy'}"`);
      fetchAppointments();
    } catch {
      message.error('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch =
        !aptSearch.trim() ||
        (apt.customerName || apt.fullName || '').toLowerCase().includes(aptSearch.toLowerCase()) ||
        (apt.customerPhone || apt.phone || '').includes(aptSearch) ||
        (apt.appointmentCode || apt.id || '').toLowerCase().includes(aptSearch.toLowerCase());

      const matchBranch =
        aptBranchFilter === 'all' ||
        apt.branch === aptBranchFilter ||
        apt.branchId === aptBranchFilter;

      const currentStatus = (apt.status || 'pending').toLowerCase();
      const matchStatus =
        aptStatusFilter === 'all' ||
        currentStatus === aptStatusFilter.toLowerCase();

      return matchSearch && matchBranch && matchStatus;
    });
  }, [appointments, aptSearch, aptBranchFilter, aptStatusFilter]);

  const pendingAptsCount = useMemo(() => {
    return appointments.filter((a) => (a.status || 'pending').toLowerCase() === 'pending').length;
  }, [appointments]);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Avatar presets cho các hội thoại
  const AVATAR_LIST = [card1Elysian, card2Celeste, card3Lumiere, card4Monet, heroBride];

  // Hàm tải danh sách hội thoại từ máy chủ
  const fetchConversationsList = useCallback(async () => {
    try {
      const res = await getConversations({
        status: filterTab,
        search: searchTerm.trim() || undefined,
      });

      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((c, index) => ({
          id: c._id,
          name: c.customerId?.fullName || c.customerName || 'Khách hàng',
          phone: c.customerId?.phone || c.customerPhone || '',
          avatar: c.customerAvatar || c.customerId?.avatar || AVATAR_LIST[index % AVATAR_LIST.length],
          online: true,
          time: new Date(c.lastMessage?.createdAt || c.updatedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          lastMessage: c.lastMessage?.text || 'Bắt đầu cuộc trò chuyện',
          unread: (c.unreadStaffCount || 0) > 0,
          unreadCount: c.unreadStaffCount || 0,
          isPinned: c.isPinned || false,
          messages: [],
        }));

        setConversations(mapped);
        setSelectedId((current) => current || mapped[0].id);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách hội thoại:', err);
    }
  }, [filterTab, searchTerm]);

  // Hàm tải danh sách tin nhắn của hội thoại đang chọn
  const fetchActiveMessages = useCallback(async (convId) => {
    if (!convId || convId.startsWith?.('init_')) return;

    try {
      const res = await getMessages(convId);
      if (res?.data && Array.isArray(res.data)) {
        const mapped = res.data.map((m) => ({
          id: m._id,
          sender: m.senderRole === 'customer' ? 'customer' : 'staff',
          text: m.text,
          image: m.image,
          time: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: m.status === 'read' ? 'Đã xem' : 'Đã gửi',
        }));
        setActiveMessages(mapped);
      }
      // Đánh dấu đã đọc
      markAsRead(convId).catch(() => {});
    } catch (err) {
      console.warn('Lỗi tải tin nhắn:', err);
    }
  }, []);

  // Lần đầu mount và khi search/filter thay đổi
  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  // Khi selectedId thay đổi
  useEffect(() => {
    if (selectedId) {
      fetchActiveMessages(selectedId);
      const conv = conversations.find((c) => c.id === selectedId);
      if (conv) {
        setIsPinned(conv.isPinned);
      }
    }
  }, [selectedId, fetchActiveMessages]);

  // Polling chu kỳ 3.5s để cập nhật tin nhắn mới từ khách hàng
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversationsList();
      if (selectedId) {
        fetchActiveMessages(selectedId);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchConversationsList, fetchActiveMessages, selectedId]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === 'unread' && !c.unread) return false;
    if (searchTerm.trim()) {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const textToSend = inputText.trim();
    const imageToSend = selectedImage;

    const newMsg = {
      id: Date.now(),
      sender: 'staff',
      text: textToSend,
      image: imageToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Đã gửi',
    };

    setActiveMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedImage(null);

    // Gửi tin nhắn lên server
    if (selectedId && !selectedId.startsWith?.('init_')) {
      try {
        await sendMessage({
          conversationId: selectedId,
          text: textToSend,
          image: imageToSend,
          senderRole: 'staff',
        });
        fetchConversationsList();
      } catch (err) {
        console.error('Lỗi gửi tin nhắn từ Admin:', err);
      }
    }
  };

  const handleTogglePinConversation = async () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    if (selectedId && !selectedId.startsWith?.('init_')) {
      try {
        await togglePin(selectedId);
        fetchConversationsList();
      } catch (err) {
        console.warn('Lỗi ghim:', err);
      }
    }
  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  return (
    <AdminLayout activeMenu="customer-care">
      {/* Page Title & Main Tabs */}
      <div className="mb-4 -mt-5 lg:-mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-normal text-[#844F5A] tracking-normal select-none">
            Chăm Sóc Khách Hàng
          </h1>
          <p className="text-[12.5px] text-[#7A6B6C]">
            Trung tâm kết nối nàng dâu: Tư vấn 1:1 qua tin nhắn & Quản lý lịch hẹn thử váy Private Suite.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF2EE] rounded-xl border border-[#EFE2DC]">
          <button
            type="button"
            onClick={() => setMainTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
              mainTab === 'chat'
                ? 'bg-[#733F49] text-white shadow-xs'
                : 'bg-transparent text-[#7A6B6C] hover:text-[#2C2523]'
            }`}
          >
            <MessageSquare size={14} />
            <span>Tư Vấn Trực Tuyến</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('appointments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
              mainTab === 'appointments'
                ? 'bg-[#733F49] text-white shadow-xs'
                : 'bg-transparent text-[#7A6B6C] hover:text-[#2C2523]'
            }`}
          >
            <Calendar size={14} />
            <span>Lịch Hẹn Thử Váy</span>
            {pendingAptsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#BA7A83] text-white text-[10px] font-bold">
                {pendingAptsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mainTab === 'appointments' ? (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4.5 shadow-xs">
              <span className="text-[11px] font-bold tracking-wider text-[#7A6B6C] uppercase">TỔNG LỊCH HẸN</span>
              <div className="text-[28px] font-bold text-[#2C2523] mt-1">{appointments.length}</div>
              <div className="text-[11.5px] text-[#8C7D7E] mt-1">Toàn bộ các chi nhánh</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4.5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#FEF3C7_0%,_transparent_70%)]">
              <span className="text-[11px] font-bold tracking-wider text-[#92400E] uppercase">CHỜ DUYỆT (PENDING)</span>
              <div className="text-[28px] font-bold text-[#B45309] mt-1">{pendingAptsCount}</div>
              <div className="text-[11.5px] text-[#A16207] mt-1">Cần gọi điện xác nhận</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4.5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#DEF5E7_0%,_transparent_70%)]">
              <span className="text-[11px] font-bold tracking-wider text-[#166534] uppercase">ĐÃ XÁC NHẬN</span>
              <div className="text-[28px] font-bold text-[#1E8347] mt-1">
                {appointments.filter((a) => (a.status || '').toLowerCase() === 'confirmed').length}
              </div>
              <div className="text-[11.5px] text-[#15803D] mt-1">Phòng Suite đã khóa giờ</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4.5 shadow-xs bg-[radial-gradient(ellipse_at_top_right,_#EDE9FE_0%,_transparent_70%)]">
              <span className="text-[11px] font-bold tracking-wider text-[#6D28D9] uppercase">HOÀN TẤT THỬ VÁY</span>
              <div className="text-[28px] font-bold text-[#7C3AED] mt-1">
                {appointments.filter((a) => (a.status || '').toLowerCase() === 'completed').length}
              </div>
              <div className="text-[11.5px] text-[#6D28D9] mt-1">Đã trải nghiệm dịch vụ</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-[#EFE5E1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B8C]" />
              <input
                type="text"
                value={aptSearch}
                onChange={(e) => setAptSearch(e.target.value)}
                placeholder="Tìm mã lịch, tên cô dâu, số điện thoại..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F6] border border-[#EFE2DC] text-xs text-[#2C2523] outline-none focus:border-[#BA7A83] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Branch filter */}
              <select
                value={aptBranchFilter}
                onChange={(e) => setAptBranchFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF2EE] border border-[#EFE2DC] text-[#554748] font-medium outline-none cursor-pointer"
              >
                <option value="all">Tất cả chi nhánh showroom (2 cơ sở)</option>
                <option value="hcm-q1">UniBridal Q.1 TP.HCM</option>
                <option value="hn-hoankiem">UniBridal Hoàn Kiếm, HN</option>
              </select>

              {/* Status filter */}
              <select
                value={aptStatusFilter}
                onChange={(e) => setAptStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF2EE] border border-[#EFE2DC] text-[#554748] font-medium outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="confirmed">Đã xác nhận (Confirmed)</option>
                <option value="completed">Đã hoàn tất (Completed)</option>
                <option value="cancelled">Đã hủy (Cancelled)</option>
              </select>

              <button
                type="button"
                onClick={fetchAppointments}
                disabled={aptLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#733F49] text-white font-semibold hover:bg-[#5C3038] transition-colors cursor-pointer border-0"
              >
                <RefreshCw size={13} className={aptLoading ? 'animate-spin' : ''} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3] text-[11px] font-bold text-[#7A696B] uppercase tracking-wider">
                    <th className="py-3.5 px-5">MÃ & KHÁCH HÀNG</th>
                    <th className="py-3.5 px-4">SHOWROOM & KHUNG GIỜ</th>
                    <th className="py-3.5 px-4">LỄ PHỤC QUAN TÂM</th>
                    <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                    <th className="py-3.5 px-5 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6EDE9] text-[12.5px]">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8C7D7E] text-[13px]">
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
                            <div className="inline-block px-1.5 py-0.5 rounded bg-[#F6EDE8] text-[#846E63] font-mono text-[10.5px] font-bold mb-1">
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
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF2EE] text-[#7A6B6C] text-[11px] font-semibold mb-1">
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
                                <span>Số khách đi cùng: {apt.guestsCount} người</span>
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
                                  onClick={() => handleUpdateAptStatus(aptId, 'confirmed')}
                                  className="px-3 py-1.5 rounded-lg bg-[#1E8347] hover:bg-[#166534] text-white text-[11px] font-semibold transition-colors cursor-pointer border-0 shadow-2xs"
                                >
                                  Xác nhận lịch
                                </button>
                              )}
                              {status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAptStatus(aptId, 'completed')}
                                  className="px-3 py-1.5 rounded-lg bg-[#BA7A83] hover:bg-[#a86a73] text-white text-[11px] font-semibold transition-colors cursor-pointer border-0 shadow-2xs"
                                >
                                  Đã thử xong
                                </button>
                              )}
                              {status !== 'cancelled' && status !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAptStatus(aptId, 'cancelled')}
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
        </div>
      ) : (
        /* Main Container Chat */
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-160px)] min-h-[620px]">
        {/* Left Card: Conversation List Panel */}
        <div className="w-full lg:w-[350px] shrink-0 bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden flex flex-col">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-[#F5EBE7] flex flex-col gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B8C]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên cô dâu, SĐT, mã hợp đồng..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#EFE5E1] text-xs text-[#2C2523] placeholder:text-[#9A8B8C] outline-none focus:border-[#C98A90] shadow-2xs transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all border-0 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#733F49] text-white shadow-2xs'
                    : 'bg-[#FAF2EE] text-[#7A6B6C] hover:bg-[#F2E5E0]'
                }`}
              >
                Tất cả ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('unread')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all border-0 cursor-pointer ${
                  filterTab === 'unread'
                    ? 'bg-[#733F49] text-white shadow-2xs'
                    : 'bg-[#FAF2EE] text-[#7A6B6C] hover:bg-[#F2E5E0]'
                }`}
              >
                Chưa đọc ({conversations.filter((c) => c.unread).length})
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredConversations.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FDF4F0] border border-[#F2E3DC] shadow-2xs'
                      : 'hover:bg-[#FAF5F2] border border-transparent'
                  }`}
                >
                  {/* Active vertical accent bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#733F49] rounded-l-2xl" />
                  )}

                  {/* Rounded square avatar */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                    {c.online && (
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[13px] truncate ${c.unread ? 'font-bold text-[#733F49]' : 'font-bold text-[#2C2523]'}`}>
                          {c.name}
                        </span>
                        {c.unread && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                        )}
                        {c.isPinned && (
                          <Pin size={11} className="text-[#B8737D] fill-[#B8737D] -rotate-45 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#9A8B8C] shrink-0 ml-1">
                        {c.time}
                      </span>
                    </div>
                    <p className={`text-xs truncate leading-snug ${c.unread ? 'font-semibold text-[#2C2523]' : 'text-[#6A5B5D]'}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Active Chat View */}
        <div className="flex-1 bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden flex flex-col justify-between">
          {/* Chat Header */}
          <div className="p-3.5 px-5 bg-[#FAF2EE] border-b border-[#F0E4DF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-xs border-2 border-white ring-1 ring-[#E8D8D0]">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-full h-full object-cover"
                />
                {activeConv.online && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ring-white" />
                )}
              </div>
              <h2 className="font-serif text-[22px] font-bold text-[#2C2523] leading-none">
                {activeConv.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePinConversation}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-0 cursor-pointer ${
                  isPinned
                    ? 'bg-[#F2E2DC] text-[#733F49] shadow-2xs'
                    : 'bg-transparent text-[#7A6B6C] hover:bg-[#F5E6E0] hover:text-[#733F49]'
                }`}
                title={isPinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
              >
                <Pin size={16} className={isPinned ? 'fill-[#733F49]' : ''} />
              </button>
              <button
                type="button"
                onClick={() => alert(`Đang kết nối cuộc gọi thoại hotline tư vấn với ${activeConv.name}...`)}
                className="w-8 h-8 rounded-lg bg-[#FAF0EB] text-[#733F49] flex items-center justify-center hover:bg-[#F3E2DB] transition-colors border-0 cursor-pointer shadow-2xs"
                title="Gọi điện tư vấn"
              >
                <Phone size={15} />
              </button>
            </div>
          </div>

          {/* Pinned Message Alert (Active when isPinned is true) */}
          {isPinned && (
            <div className="bg-[#FFF9F6] border-b border-[#F2E5E0] px-5 py-2.5 flex items-center justify-between text-xs text-[#5C4549] animate-in fade-in duration-200">
              <div className="flex items-center gap-2 truncate">
                <Pin size={13} className="text-[#863E4B] shrink-0 fill-[#863E4B]" />
                <span className="font-bold text-[#863E4B] shrink-0">Tin nhắn đã ghim:</span>
                <span className="truncate italic text-[#4A3B3D]">
                  "{pinnedMessage}"
                </span>
              </div>
              <button
                type="button"
                onClick={handleTogglePinConversation}
                className="bg-transparent border-0 text-[#9A8B8C] hover:text-[#733F49] cursor-pointer p-0.5 text-xs font-semibold shrink-0 ml-2"
                title="Bỏ ghim"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {((activeMessages.length > 0 ? activeMessages : activeConv.messages) || []).map((msg) => {
              const isStaff = msg.sender === 'staff';
              if (isStaff) {
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="bg-[#733F49] text-white text-[13.5px] leading-relaxed p-4 rounded-2xl rounded-tr-xs max-w-lg shadow-2xs">
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh đính kèm"
                          className="rounded-xl max-w-full max-h-56 object-cover mb-2 border border-white/20"
                        />
                      )}
                      {msg.text && <div>{msg.text}</div>}
                    </div>
                    <span className="text-[11px] text-[#9A8B8C] mt-1 mr-1">
                      {msg.time} • {msg.status}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <img
                    src={activeConv.avatar}
                    alt={activeConv.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-[#EFE5E1] shadow-2xs"
                  />
                  <div className="flex flex-col items-start max-w-xl">
                    <div className="bg-[#FAF5F2] text-[#2C2523] text-[13.5px] leading-relaxed p-4 rounded-2xl rounded-tl-xs border border-[#F0E6E2]">
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh đính kèm"
                          className="rounded-xl max-w-full max-h-56 object-cover mb-2 border border-[#EFE5E1]"
                        />
                      )}
                      {msg.text && <div>{msg.text}</div>}
                    </div>
                    <span className="text-[11px] text-[#9A8B8C] mt-1 ml-1">
                      {msg.time} • {msg.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Footer & Input */}
          <div className="border-t border-[#F0E6E2] p-4 bg-white space-y-3">
            {/* Quick Replies Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-[#8C7D7E] uppercase flex items-center gap-1 shrink-0">
                <Sparkles size={12} className="text-[#B8737D]" />
                PHẢN HỒI NHANH:
              </span>
              <button
                type="button"
                onClick={() => handleQuickReply('Xác nhận chỉnh hạ eo thêm 1.5cm cho mẫu Elysian Rose vào phụ lục hợp đồng.')}
                className="px-3 py-1 rounded-full bg-white border border-[#EFE5E1] text-xs text-[#5A4B4D] hover:bg-[#FAF2EE] hover:text-[#733F49] transition-colors cursor-pointer"
              >
                Xác nhận chỉnh eo 1.5cm
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('UniBridal gửi nàng cẩm nang và hướng dẫn thử váy VIP tại phòng thử riêng.')}
                className="px-3 py-1 rounded-full bg-white border border-[#EFE5E1] text-xs text-[#5A4B4D] hover:bg-[#FAF2EE] hover:text-[#733F49] transition-colors cursor-pointer"
              >
                Gửi hướng dẫn thử váy VIP
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('Quý khách có thể sử dụng phương thức bảo lãnh đặt cọc qua hạn mức thẻ tín dụng.')}
                className="px-3 py-1 rounded-full bg-white border border-[#EFE5E1] text-xs text-[#5A4B4D] hover:bg-[#FAF2EE] hover:text-[#733F49] transition-colors cursor-pointer"
              >
                Bảo lãnh cọc thẻ tín dụng
              </button>
            </div>

            {/* Utility Icons & Hint */}
            <div className="flex items-center justify-between text-[#7A6B6C]">
              <div className="flex items-center gap-1 relative">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-transparent border-0 p-1.5 rounded-lg text-[#7A6B6C] hover:text-[#733F49] hover:bg-[#FAF2EE] transition-colors cursor-pointer inline-flex items-center justify-center"
                  title="Tải ảnh từ máy tính"
                >
                  <Image size={18} />
                </button>

                {/* Emoji Picker Button & Popover */}
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="bg-transparent border-0 p-1.5 rounded-lg text-[#7A6B6C] hover:text-[#733F49] hover:bg-[#FAF2EE] transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Biểu tượng cảm xúc"
                  >
                    <Smile size={18} />
                  </button>

                  {/* Floating Emoji Popover */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-10 left-0 bg-white border border-[#EFE5E1] rounded-2xl shadow-xl p-3 z-30 w-64 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5EBE7]">
                        <span className="text-xs font-bold text-[#733F49] flex items-center gap-1">
                          <Sparkles size={12} />
                          Biểu tượng cảm xúc
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="bg-transparent border-0 text-[#9A8B8C] hover:text-[#733F49] cursor-pointer p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-1">
                        {WEDDING_EMOJIS.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectEmoji(emoji)}
                            className="w-8 h-8 rounded-lg hover:bg-[#FAF2EE] flex items-center justify-center text-lg transition-transform hover:scale-125 bg-transparent border-0 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-[#9A8B8C]">
                Gõ / để gọi câu lệnh nhanh
              </span>
            </div>

            {/* Selected Image Preview (if any) */}
            {selectedImage && (
              <div className="relative inline-block mb-1">
                <img
                  src={selectedImage}
                  alt="Ảnh đã chọn"
                  className="w-20 h-20 rounded-xl object-cover border border-[#EFE5E1] shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#733F49] text-white flex items-center justify-center hover:bg-[#5C3038] shadow-xs border-0 cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Message Input & Send Button */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập tin nhắn tư vấn nàng dâu..."
                className="flex-1 bg-[#FDF4F0] border border-[#F2E5E0] rounded-xl px-4 py-2.5 text-sm text-[#2C2523] placeholder:text-[#B5A5A2] outline-none focus:border-[#C98A90] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="bg-[#733F49] hover:bg-[#5C3038] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer border-0"
              >
                <span>GỬI</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}
