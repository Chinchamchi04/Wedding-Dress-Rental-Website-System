import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Check,
  CheckCircle2,
} from 'lucide-react';
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

export default function CustomerCareManagement() {
  const [conversations, setConversations] = useState([]);
  const [aptError, setAptError] = useState('');
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

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

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
        // Chỉ hiển thị tin nhắn của KHÁCH HÀNG thực tế (loại bỏ tài khoản Quản trị viên và Chuyên viên tư vấn)
        const customerOnly = res.data.filter((c) => {
          const roleCode = c.customerId?.roleId?.code;
          if (roleCode === 'ADMIN' || roleCode === 'STAFF') return false;
          const name = (c.customerId?.fullName || c.customerName || '').toLowerCase();
          return !(
            name.includes('quản trị') ||
            name.includes('administrator') ||
            name.includes('chuyên viên') ||
            name.includes('staff')
          );
        });

        const mapped = customerOnly.map((c, index) => ({
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
        setSelectedId((current) => {
          if (current && mapped.some((m) => m.id === current)) return current;
          return mapped[0].id;
        });
      } else {
        setConversations([]);
        setSelectedId(null);
        setActiveMessages([]);
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

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

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

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0] || null;

  const filteredConversations = conversations.filter((c) => {
    // Đảm bảo chỉ khách hàng mới xuất hiện trong danh sách trò chuyện
    const lowerName = (c.name || '').toLowerCase();
    if (
      lowerName.includes('quản trị') ||
      lowerName.includes('administrator') ||
      lowerName.includes('chuyên viên') ||
      lowerName.includes('staff')
    ) {
      return false;
    }
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
      {/* Page Title */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-[26px] sm:text-[30px] font-bold text-[#5F2B36] tracking-tight">
            Chăm Sóc Khách Hàng
          </h1>
          <p className="text-[13px] text-[#7A6B6C] mt-1">
            Trung tâm kết nối nàng dâu: Tư vấn 1:1 qua tin nhắn thời gian thực cùng chuyên viên Atelier UniBridal.
          </p>
        </div>
      </div>

      {/* Main Container Chat */}
      <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-210px)] min-h-[600px]">
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
        {activeConv ? (
          <div className="flex-1 bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden flex flex-col justify-between min-h-0">
            {/* Chat Header */}
            <div className="p-3.5 px-5 bg-[#FAF2EE] border-b border-[#F0E4DF] flex items-center justify-between shrink-0">
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
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-white">
            {activeMessages.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center text-[#9A8B8C] py-8">
                <div className="w-12 h-12 rounded-full bg-[#FAF2EE] flex items-center justify-center text-[#BA7A83] mb-3">
                  <Sparkles size={20} />
                </div>
                <p className="text-xs font-semibold text-[#7A6B6C]">Chưa có tin nhắn trong cuộc hội thoại này.</p>
                <p className="text-[11px] text-[#A89899] mt-0.5">Nhập phản hồi hoặc bấm câu trả lời nhanh bên dưới để tư vấn nàng dâu.</p>
              </div>
            ) : (
              activeMessages.map((msg) => {
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
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer & Input */}
          <div className="border-t border-[#F0E6E2] p-4 bg-white space-y-3 shrink-0">
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
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-[#EFE5E1] shadow-xs p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF2EE] flex items-center justify-center text-[#BA7A83] mb-4 shadow-2xs">
              <MessageSquare size={28} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C2523] mb-1">Chưa có hội thoại tư vấn</h3>
            <p className="text-xs text-[#7A6B6C] max-w-sm leading-relaxed">
              Khi khách hàng nhắn tin hoặc đặt lịch hẹn thử váy qua hệ thống, các cuộc trò chuyện tư vấn trực tiếp sẽ hiển thị tại đây.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
