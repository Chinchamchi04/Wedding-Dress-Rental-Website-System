import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  MoreVertical,
  Check,
  Crown,
  RefreshCw,
  Layers,
  Trash2,
  Banknote,
  ShieldCheck,
  Percent,
  TableProperties,
  ChevronUp,
  Upload,
  Image as ImageIcon } from 'lucide-react';
import HangerIcon from '../../components/common/HangerIcon';
import { getAllDresses, createDress, updateDress, deleteDress, getCategories } from '../../services/dressService';
import { getAllOrdersAdmin } from '../../services/orderService';
import { formatCurrencyVND } from '../../utils/formatCurrency';
import { DRESS_CATALOG } from '../../data/dressCatalog';

const fmtVnd = (v) => formatCurrencyVND(v ?? 0);

import card1Elysian from '../../assets/card1_elysian.jpg';

const PAGE_SIZE = 6;

// Danh mục Phom Dáng chuẩn từ MongoDB Atlas
const DEFAULT_CATEGORIES = [
  { _id: '6ae179534b9795d371875c20', id: '6ae179534b9795d371875c20', slug: 'ballgown', name: 'Công Chúa Bồng Xòe (Ballgown)', silhouette: 'Ballgown' },
  { _id: '6ae179544b9795d371875c21', id: '6ae179544b9795d371875c21', slug: 'mermaid', name: 'Đuôi Cá Điêu Khắc (Mermaid)', silhouette: 'Mermaid' },
  { _id: '6ae179554b9795d371875c22', id: '6ae179554b9795d371875c22', slug: 'a-line', name: 'Chữ A Thanh Lịch (A-Line)', silhouette: 'A-Line' },
  { _id: '6ae76f99243e90678b3dbc67', id: '6ae76f99243e90678b3dbc67', slug: 'silk-gown', name: 'Váy Cưới Lụa Tối Giản (Silk Gown)', silhouette: 'Silk Gown' },
  { _id: '6ae76f99243e90678b3dbc68', id: '6ae76f99243e90678b3dbc68', slug: 'princess', name: 'Váy Cưới Hoàng Gia (Princess)', silhouette: 'Princess' },
];

// Danh mục Chất Liệu chuẩn từ MongoDB Atlas
const DEFAULT_MATERIALS = [
  'Lụa Mikado Ý',
  'Lụa Mikado Ý và Satin Tơ Tằm Tự Nhiên',
  'Ren 3D Floral',
  'Ren 3D Floral và Đính Kết Pha Lê Swarovski',
  'Satin Tơ Tằm Tự Nhiên',
  'Đính Kết Pha Lê Swarovski',
  'Voan Tulle Thụy Sĩ',
  'Gấm và Dạ Cao Cấp',
];

// Danh mục Màu Sắc cưới cao cấp phổ biến
const POPULAR_COLORS = [
  { name: 'Trắng Tinh Khôi', hex: '#FFFFFF', border: '#D1D5DB' },
  { name: 'Trắng Kem (Ivory)', hex: '#FFFDD0', border: '#D6CE9A' },
  { name: 'Champagne', hex: '#F7E7CE', border: '#D8C3A5' },
  { name: 'Hồng Pastel', hex: '#FFD1DC', border: '#EAA6B6' },
  { name: 'Hồng Nude', hex: '#E8C5B8', border: '#CFA496' },
  { name: 'Đỏ Ruby', hex: '#C41E3A', border: '#9E152D' },
  { name: 'Xanh Khói (Dusty Blue)', hex: '#A2B2C8', border: '#8A9DB5' },
];

export default function InventoryManagement() {
  const [rawDresses, setRawDresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showMatrixTable, setShowMatrixTable] = useState(false);

  // Danh mục phom dáng và chất liệu đồng bộ từ MongoDB Atlas
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [materialsList, setMaterialsList] = useState(DEFAULT_MATERIALS);

  // State cho Modal Sửa Sản Phẩm (Edit Modal)
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSilhouette, setEditSilhouette] = useState(DEFAULT_CATEGORIES[0].name);
  const [editMaterial, setEditMaterial] = useState(DEFAULT_MATERIALS[0]);
  const [editLocation, setEditLocation] = useState('Tủ A1');
  const [editRentPrice, setEditRentPrice] = useState('5.000.000');
  const [editDepositAmount, setEditDepositAmount] = useState('15.000.000');
  const [editStatusType, setEditStatusType] = useState('stored');
  const [editDescription, setEditDescription] = useState('');
  const [editSizes, setEditSizes] = useState({ XS: 0, S: 2, M: 2, L: 0 });
  const [editColor, setEditColor] = useState('Trắng Tinh Khôi');
  const [editImages, setEditImages] = useState([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Form thêm sản phẩm kho mới (Lưu trực tiếp vào MongoDB Atlas)
  const [newName, setNewName] = useState('');
  const [newSilhouette, setNewSilhouette] = useState(DEFAULT_CATEGORIES[0].name);
  const [newMaterial, setNewMaterial] = useState(DEFAULT_MATERIALS[0]);
  const [newRentPrice, setNewRentPrice] = useState('5.000.000');
  const [newDepositAmount, setNewDepositAmount] = useState('15.000.000');
  const [newDescription, setNewDescription] = useState('');
  const [newSizeXS, setNewSizeXS] = useState(1);
  const [newSizeS, setNewSizeS] = useState(2);
  const [newSizeM, setNewSizeM] = useState(2);
  const [newSizeL, setNewSizeL] = useState(1);
  const [newColor, setNewColor] = useState('Trắng Tinh Khôi');
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lưu trữ can thiệp chỉnh sửa của Staff/Admin
  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unibridal_inventory_overrides') || '{}');
    } catch {
      return {};
    }
  });

  // Refs cho thanh cuộn ngang hình ảnh trong modal
  const editImagesScrollRef = useRef(null);
  const addImagesScrollRef = useRef(null);

  // Xử lý kéo chuột và lăn chuột để cuộn danh sách ảnh ngang
  const handleScrollMouseDown = (e) => {
    const slider = e.currentTarget;
    slider.isDown = true;
    slider.startX = e.pageX - slider.offsetLeft;
    slider.scrollLeftStart = slider.scrollLeft;
  };
  const handleScrollMouseLeave = (e) => {
    e.currentTarget.isDown = false;
  };
  const handleScrollMouseUp = (e) => {
    e.currentTarget.isDown = false;
  };
  const handleScrollMouseMove = (e) => {
    const slider = e.currentTarget;
    if (!slider.isDown) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = x - slider.startX;
    if (Math.abs(walk) > 3) {
      e.preventDefault();
      slider.scrollLeft = slider.scrollLeftStart - walk * 1.5;
    }
  };
  const handleScrollWheel = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Hàm tiện ích chuẩn hóa chuỗi để so khớp chính xác
  const cleanStr = (s) => (s ? String(s).toLowerCase().replace(/[^a-z0-9]/g, '') : '');

  // Hàm trích xuất số nguyên an toàn (loại bỏ ký tự tiền tệ ₫, dấu chấm, phẩy...)
  const parseNum = (val, fallback = 0) => {
    if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
    if (!val) return fallback;
    const digits = String(val).replace(/\D/g, '');
    const parsed = parseInt(digits, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
  };

  // Hàm định dạng số có dấu chấm phân cách hàng nghìn (VD: 5.500.000)
  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const digits = String(val).replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const isColorMatch = (a, b) => {
    if (!a || !b) return false;
    const ca = cleanStr(a);
    const cb = cleanStr(b);
    return ca && cb && (ca === cb || ca.includes(cb) || cb.includes(ca));
  };

  const handleToggleColorSelection = (colorName, currentVal, setter) => {
    const list = (currentVal || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const existingIndex = list.findIndex((c) => isColorMatch(c, colorName));
    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
    } else {
      list.push(colorName);
    }
    setter(list.join(', '));
  };

  // Tính toán tình trạng kho và liên kết đơn thuê tự động
  const computeItemData = useCallback((d, index, orderList, overrides) => {
    const dressId = d._id || d.id || `inv_${index + 1}`;
    const code = d.code || `UB-${(index + 1).toString().padStart(3, '0')}`;
    const dressCleanName = cleanStr(d.name);
    const dressCleanCode = cleanStr(code);

    const override =
      overrides[dressId] ||
      overrides[String(d._id)] ||
      (code && overrides[code]) ||
      (dressCleanName && overrides[dressCleanName]) ||
      {};

    const num = (index + 1).toString().padStart(2, '0');
    const cabinets = ['Tủ A1', 'Tủ B2', 'Tủ C1', 'Tủ VIP', 'Tủ D3'];
    const location = override.location || cabinets[index % cabinets.length];

    // Xử lý sizes và số lượng tồn kho
    let sizeList = [];
    if (override.sizes && Array.isArray(override.sizes) && override.sizes.length > 0) {
      sizeList = override.sizes;
    } else {
      const defaultSizes = Array.isArray(d.sizes) && d.sizes.length > 0 ? d.sizes : ['S', 'M'];
      sizeList = defaultSizes.map((sz) => {
        if (typeof sz === 'object' && sz.size) {
          return { size: sz.size, quantity: sz.quantity ?? 2, label: `Size ${sz.size} (${sz.quantity ?? 2} bộ)` };
        }
        const sName = typeof sz === 'object' ? (sz.label || 'S') : sz;
        return { size: sName, quantity: 2, label: `Size ${sName} (2 bộ)` };
      });
    }

    const totalStock = sizeList.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    // Tính toán liên kết với đơn thuê thực tế (Orders) - SO KHỚP CHÍNH XÁC THEO ID, MÃ HOẶC TÊN HOÀN TOÀN
    const matchedOrders = (orderList || []).filter((o) => {
      const hasItem = (o.items || []).some((it) => {
        const itId = it.dressId?._id || it.dressId || it.id || it._id;
        const itCleanName = cleanStr(it.name);
        const itCleanCode = cleanStr(it.code);
        const idMatch = itId && (String(itId) === String(dressId) || (d._id && String(itId) === String(d._id)));
        const codeMatch = itCleanCode && dressCleanCode && itCleanCode === dressCleanCode;
        const exactNameMatch = itCleanName && dressCleanName && itCleanName === dressCleanName && dressCleanName.length >= 2;
        return idMatch || codeMatch || exactNameMatch;
      });
      const mainClean = cleanStr(o.dress);
      const mainMatch = mainClean && dressCleanName && mainClean === dressCleanName && dressCleanName.length >= 2;
      return hasItem || mainMatch;
    });

    const relatedOrderCodes = matchedOrders.map((o) =>
      String(o.orderCode || o.id || o._id || '').toLowerCase()
    );

    // 1. Các đơn đang trong chu trình kiểm định và bảo dưỡng sau thuê
    const maintenanceOrders = matchedOrders.filter((o) =>
      ['returned', 'inspecting', 'maintenance'].includes(o.rawStatus || o.status)
    );

    // 2. Các đơn đang được khách thuê / chuẩn bị giao
    const rentingOrders = matchedOrders.filter((o) =>
      ['renting', 'delivered', 'preparing', 'deposit_paid'].includes(o.rawStatus || o.status)
    );

    // 3. Phân bổ chi tiết theo từng Size: Khả dụng / Đang kiểm định / Đang thuê
    const detailedSizes = sizeList.map((sz) => {
      const sName = String(sz.size || '').trim();
      const sQty = Number(sz.quantity) || 0;

      const sMaint = maintenanceOrders.filter((o) => {
        const matchedItem = (o.items || []).find((it) => {
          const itId = it.dressId?._id || it.dressId || it.id || it._id;
          const itCleanName = cleanStr(it.name);
          const itCleanCode = cleanStr(it.code);
          return (
            (itId && (String(itId) === String(dressId) || (d._id && String(itId) === String(d._id)))) ||
            (itCleanCode && dressCleanCode && itCleanCode === dressCleanCode) ||
            (itCleanName && dressCleanName && itCleanName === dressCleanName && dressCleanName.length >= 2)
          );
        });
        const itemSize = matchedItem?.size || o.size || '';
        return String(itemSize).trim().toUpperCase() === sName.toUpperCase();
      }).length;

      const sRented = rentingOrders.filter((o) => {
        const matchedItem = (o.items || []).find((it) => {
          const itId = it.dressId?._id || it.dressId || it.id || it._id;
          const itCleanName = cleanStr(it.name);
          const itCleanCode = cleanStr(it.code);
          return (
            (itId && (String(itId) === String(dressId) || (d._id && String(itId) === String(d._id)))) ||
            (itCleanCode && dressCleanCode && itCleanCode === dressCleanCode) ||
            (itCleanName && dressCleanName && itCleanName === dressCleanName && dressCleanName.length >= 2)
          );
        });
        const itemSize = matchedItem?.size || o.size || '';
        return String(itemSize).trim().toUpperCase() === sName.toUpperCase();
      }).length;

      const sAvail = Math.max(0, sQty - sMaint - sRented);
      return {
        ...sz,
        size: sName,
        quantity: sQty,
        available: sAvail,
        maintenance: sMaint,
        rented: sRented,
      };
    });

    // 4. Số lượng khả dụng tính chính xác từ tổng số lượng khả dụng của từng Size
    const availableStock = detailedSizes.reduce((sum, sz) => sum + (Number(sz.available) || 0), 0);
    const maintenanceCount = detailedSizes.reduce((sum, sz) => sum + (Number(sz.maintenance) || 0), 0);
    const rentedCount = detailedSizes.reduce((sum, sz) => sum + (Number(sz.rented) || 0), 0);

    // Xử lý trạng thái: Tự động vs Thủ công
    const manualStatus = override.statusType || null;
    let statusType = manualStatus && manualStatus !== 'auto' ? manualStatus : 'auto';
    let statusText = 'CÒN HÀNG';
    let statusSubNote = '';

    const computeStoredSubNote = () => {
      if (totalStock === 0) return 'Chưa nhập kho';
      if (rentedCount > 0 || maintenanceCount > 0) {
        const parts = [`Sẵn sàng: ${availableStock}/${totalStock} bộ`];
        if (maintenanceCount > 0) parts.push(`Bảo dưỡng: ${maintenanceCount}`);
        if (rentedCount > 0) parts.push(`Đang thuê: ${rentedCount}`);
        return parts.join(' • ');
      }
      return `Sẵn sàng phục vụ (${availableStock}/${totalStock} bộ)`;
    };

    if (statusType === 'auto') {
      if (maintenanceCount > 0 && availableStock === 0) {
        statusType = 'drying';
        statusText = 'ĐANG BẢO DƯỠNG';
        statusSubNote = `Đang kiểm định và bảo dưỡng (${maintenanceCount} bộ)`;
      } else if (availableStock <= 0 && totalStock > 0) {
        statusType = 'out_of_stock';
        statusText = 'HẾT HÀNG';
        statusSubNote = `Đã xuất thuê toàn bộ (${totalStock} bộ)`;
      } else {
        statusType = 'stored';
        statusText = 'CÒN HÀNG';
        statusSubNote = computeStoredSubNote();
      }
    } else if (statusType === 'drying') {
      statusText = 'ĐANG BẢO DƯỠNG';
      statusSubNote = maintenanceCount > 0 ? `Đang kiểm định và bảo dưỡng (${maintenanceCount} bộ)` : 'Giặt khô, là hơi phục hồi';
    } else if (statusType === 'ready') {
      statusText = 'ĐÃ CHO THUÊ';
      statusSubNote = rentedCount > 0 ? `Đang phục vụ cô dâu (${rentedCount} bộ)` : 'Đang phục vụ cô dâu';
    } else if (statusType === 'out_of_stock') {
      statusText = 'HẾT HÀNG';
      statusSubNote = 'Tạm hết mẫu này trong kho';
    } else {
      statusType = 'stored';
      statusText = 'CÒN HÀNG';
      statusSubNote = computeStoredSubNote();
    }

    return {
      id: dressId,
      code,
      name: override.name || d.name,
      collection: d.collection || '',
      rfid: `#RF-2026-${(index + 1).toString().padStart(4, '0')}`,
      location,
      statusType,
      statusText,
      statusSubNote,
      manualStatus,
      totalStock,
      availableStock,
      rentedCount,
      maintenanceCount,
      relatedOrderCodes,
      customerNames: matchedOrders.map((o) => (o.customerName || '').toLowerCase()),
      customerPhones: matchedOrders.map((o) => (o.customerPhone || '').toLowerCase()),
      matchedOrders,
      sizes: detailedSizes,
      totalUnits: `Tổng: ${String(totalStock).padStart(2, '0')} bộ`,
      description: override.description || d.description || 'Lễ phục cưới cao cấp UniBridal Haute Couture',
      rentPrice: parseNum(override.rentPrice) || parseNum(d.rentPrice) || parseNum(d.price) || 5000000,
      depositAmount: parseNum(override.depositAmount) || parseNum(d.depositAmount) || parseNum(d.deposit) || 15000000,
      material: override.material || d.material || 'Lụa Mikado Ý',
      color: override.color || d.color || 'Trắng Tinh Khôi',
      silhouette: override.silhouette || d.silhouette || d.category?.name || 'Ballgown',
      images: (Array.isArray(d.images) && d.images.length > 0)
        ? d.images
        : (Array.isArray(override.images) && override.images.length > 0)
        ? override.images
        : (d.image ? [d.image] : [`/assets/dresses/dress_${num}.jpg`]),
      image: (d.images && d.images[0]) || d.image || `/assets/dresses/dress_${num}.jpg`,
      rawDress: d,
    };
  }, []);

  // Tải đồng thời dữ liệu Váy Cưới và Đơn Hàng thực tế
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [dressesRes, ordersRes] = await Promise.all([
        getAllDresses(),
        getAllOrdersAdmin({ limit: 150 }),
      ]);

      const dressList = Array.isArray(dressesRes?.data) ? dressesRes.data : [];
      const orderList = Array.isArray(ordersRes?.orders) ? ordersRes.orders : [];

      // Gộp thêm các đơn từ localStorage nếu có (ví dụ đơn khách hàng vừa đặt hoặc offline)
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('unibridal-orders') || '[]');
      } catch { }
      try {
        const lastOrder = JSON.parse(localStorage.getItem('unibridal-last-order') || 'null');
        if (lastOrder) localOrders.push(lastOrder);
      } catch { }

      const combinedOrders = [...orderList];
      localOrders.forEach((lo) => {
        const loCode = String(lo.orderCode || lo.id || lo._id || '');
        if (loCode && !combinedOrders.some((co) => String(co.orderCode || co.id || co._id) === loCode)) {
          combinedOrders.push(lo);
        }
      });

      // Lấy danh sách ID đã xóa từ localStorage (nếu có) để lọc bỏ
      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('unibridal_deleted_dress_ids') || '[]');
      } catch { }

      const activeDressList = dressList.filter(
        (d) => !deletedIds.includes(d._id || d.id) && d.status !== 'retired'
      );

      setRawDresses(activeDressList);
      setOrders(combinedOrders);

      const computed = activeDressList.map((d, index) =>
        computeItemData(d, index, combinedOrders, manualOverrides)
      );
      setItems(computed);
      setError('');
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Lỗi kết nối cơ sở dữ liệu: Không thể tải danh sách kho hàng từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [computeItemData, manualOverrides]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Đồng bộ danh mục phom dáng và chất liệu từ MongoDB Atlas
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          setCategoriesList(res.data);
          if (!newSilhouette && res.data[0]) {
            setNewSilhouette(res.data[0].name || res.data[0].slug);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch categories from server, using defaults:', err));
  }, []);

  useEffect(() => {
    if (rawDresses.length > 0) {
      const mats = Array.from(new Set(rawDresses.map((d) => d.material).filter(Boolean)));
      if (mats.length > 0) {
        setMaterialsList(Array.from(new Set([...DEFAULT_MATERIALS, ...mats])));
      }
    }
  }, [rawDresses]);

  // Bộ lọc trạng thái
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'stored', label: 'Còn Hàng' },
    { value: 'ready', label: 'Đã Cho Thuê' },
    { value: 'drying', label: 'Đang Bảo Dưỡng' },
    { value: 'out_of_stock', label: 'Hết Hàng' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.material || '').toLowerCase().includes(q) ||
        (item.color || '').toLowerCase().includes(q) ||
        (item.silhouette || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        item.statusType === statusFilter ||
        (statusFilter === 'drying' &&
          (item.statusType === 'drying' || (item.maintenanceCount && item.maintenanceCount > 0))) ||
        (statusFilter === 'stored' &&
          (item.statusType === 'stored' || item.statusType === 'partially_rented')) ||
        (statusFilter === 'ready' &&
          (item.statusType === 'out_of_stock' ||
            item.statusType === 'ready' ||
            item.statusType === 'partially_rented' ||
            (item.rentedCount && item.rentedCount > 0)));

      return matchSearch && matchStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (activePage < 3) {
      return [1, 2, 3, '...', totalPages - 1, totalPages];
    }
    if (activePage >= totalPages - 2) {
      return ['...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    if (activePage + 2 >= totalPages - 1) {
      return ['...', activePage - 1, activePage, activePage + 1, totalPages - 1, totalPages];
    }
    return ['...', activePage - 1, activePage, activePage + 1, '...', totalPages - 1, totalPages];
  }, [activePage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, activePage]);

  useEffect(() => {
    setActivePage(1);
  }, [searchTerm, statusFilter]);

  // Cập nhật nhanh trạng thái qua dropdown 3 chấm
  const handleUpdateItemStatus = (itemId, newStatusType, newStatusLabel) => {
    const updatedOverrides = {
      ...manualOverrides,
      [itemId]: {
        ...(manualOverrides[itemId] || {}),
        statusType: newStatusType,
      },
    };
    setManualOverrides(updatedOverrides);
    try {
      localStorage.setItem('unibridal_inventory_overrides', JSON.stringify(updatedOverrides));
    } catch { }

    // Cập nhật lại state items tức thời
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return computeItemData(
            rawDresses.find((d) => (d._id || d.id) === itemId) || it,
            0,
            orders,
            updatedOverrides
          );
        }
        return it;
      })
    );
    setActionMenuOpenId(null);
    showToast(`Đã cập nhật trạng thái: ${newStatusLabel}`);
  };

  // Mở Modal Sửa Sản Phẩm
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');

    // Tìm phom dáng phù hợp từ categoriesList
    const itemSil = item.silhouette || item.category || '';
    const matchedCat = categoriesList.find(
      (c) =>
        c.name === itemSil ||
        c.slug === itemSil ||
        c.silhouette === itemSil ||
        c.name === item.category ||
        (c._id && (c._id === item.categoryId || c._id === item.categoryId?._id))
    );
    setEditSilhouette(matchedCat ? matchedCat.name : categoriesList[0]?.name || DEFAULT_CATEGORIES[0].name);

    // Tìm chất liệu phù hợp từ materialsList
    const itemMat = item.material || item.fabric || '';
    const matchedMat = materialsList.find((m) => m.toLowerCase() === itemMat.toLowerCase()) || itemMat;
    setEditMaterial(matchedMat || DEFAULT_MATERIALS[0]);

    // LẤY ĐẦY ĐỦ TẤT CẢ DỮ LIỆU CÓ SẴN TRONG MONGODB ATLAS:
    const rawDress = rawDresses.find(
      (d) =>
        (d._id && String(d._id) === String(item.id || item._id)) ||
        (d.id && String(d.id) === String(item.id || item._id)) ||
        (d.code && item.code && d.code === item.code) ||
        (cleanStr(d.name) && cleanStr(item.name) && cleanStr(d.name) === cleanStr(item.name))
    ) || item.rawDress || {};

    setEditLocation(item.location || 'Tủ A1');
    setEditRentPrice(
      formatNumberWithDots(
        parseNum(rawDress.rentPrice) ||
        parseNum(item.rentPrice) ||
        parseNum(rawDress.price) ||
        parseNum(item.price) ||
        5000000
      )
    );
    setEditDepositAmount(
      formatNumberWithDots(
        parseNum(rawDress.depositAmount) ||
        parseNum(item.depositAmount) ||
        parseNum(rawDress.deposit) ||
        parseNum(item.deposit) ||
        15000000
      )
    );
    setEditStatusType(
      item.manualStatus ||
        (item.status === 'renting'
          ? 'ready'
          : item.status === 'maintenance'
          ? 'drying'
          : item.status === 'retired'
          ? 'out_of_stock'
          : 'stored')
    );
    setEditDescription(item.description || rawDress.description || '');

    // Tự động nạp chính xác 100% tất cả Màu Sắc từ MongoDB Atlas (kể cả mảng colorOptions):
    let loadedColors = [];
    if (Array.isArray(rawDress.colorOptions) && rawDress.colorOptions.length > 0) {
      loadedColors = rawDress.colorOptions.map((co) => (typeof co === 'object' ? co.name : co)).filter(Boolean);
    } else if (Array.isArray(item.colorOptions) && item.colorOptions.length > 0) {
      loadedColors = item.colorOptions.map((co) => (typeof co === 'object' ? co.name : co)).filter(Boolean);
    }

    const singleColorStr = rawDress.color || item.color || item.rawDress?.color || '';
    if (singleColorStr) {
      const splitColors = singleColorStr.split(',').map((c) => c.trim()).filter(Boolean);
      splitColors.forEach((sc) => {
        if (!loadedColors.some((lc) => cleanStr(lc) === cleanStr(sc))) {
          loadedColors.push(sc);
        }
      });
    }

    if (loadedColors.length === 0) {
      loadedColors = ['Trắng Tinh Khôi'];
    }

    // Chuẩn hóa tên màu để khớp với tên các pill POPULAR_COLORS nếu có
    const normalizedColorList = loadedColors.map((colName) => {
      const cleaned = cleanStr(colName);
      const matchedPopular = POPULAR_COLORS.find((pc) => cleanStr(pc.name) === cleaned);
      return matchedPopular ? matchedPopular.name : colName;
    });

    setEditColor(Array.from(new Set(normalizedColorList)).join(', '));

    let imgs = [];
    if (Array.isArray(rawDress.images) && rawDress.images.length > 1) {
      imgs = [...rawDress.images];
    } else if (Array.isArray(item.images) && item.images.length > 1) {
      imgs = [...item.images];
    } else {
      // Fallback lấy toàn bộ ảnh từ DRESS_CATALOG chuẩn
      const catalogItem = DRESS_CATALOG.find(
        (dc) =>
          (dc.code && (item.code || rawDress.code) && dc.code === (item.code || rawDress.code)) ||
          (cleanStr(dc.name) && cleanStr(item.name || rawDress.name) && cleanStr(dc.name) === cleanStr(item.name || rawDress.name))
      );
      if (catalogItem && Array.isArray(catalogItem.images) && catalogItem.images.length > 0) {
        imgs = [...catalogItem.images];
      } else if (Array.isArray(rawDress.images) && rawDress.images.length > 0) {
        imgs = [...rawDress.images];
      } else if (Array.isArray(item.images) && item.images.length > 0) {
        imgs = [...item.images];
      } else if (item.image) {
        imgs = [item.image];
      } else if (rawDress.image) {
        imgs = [rawDress.image];
      }
    }
    imgs = Array.from(new Set(imgs.filter(Boolean)));
    setEditImages(imgs);

    const sizeMap = { XS: 0, S: 0, M: 0, L: 0 };
    (item.sizes || []).forEach((sz) => {
      const sName = typeof sz === 'object' ? sz.size : sz;
      const qty = typeof sz === 'object' ? (sz.quantity ?? 2) : 2;
      if (sizeMap[sName] !== undefined) sizeMap[sName] = qty;
    });
    if (Object.values(sizeMap).every((v) => v === 0)) {
      sizeMap.S = 2;
      sizeMap.M = 2;
    }
    setEditSizes(sizeMap);
  };

  // Upload ảnh cho modal chỉnh sửa
  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImages((prev) => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveEditImage = (indexToRemove) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Lưu chỉnh sửa sản phẩm kho (Đồng bộ trực tiếp lên MongoDB Atlas)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editName.trim()) {
      showToast('Vui lòng nhập tên tác phẩm!');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const selectedCatObj =
        categoriesList.find(
          (c) => c.name === editSilhouette || c.slug === editSilhouette
        ) || DEFAULT_CATEGORIES[0];

      const qtyXS = Math.max(0, Number(editSizes.XS || 0));
      const qtyS = Math.max(0, Number(editSizes.S || 0));
      const qtyM = Math.max(0, Number(editSizes.M || 0));
      const qtyL = Math.max(0, Number(editSizes.L || 0));

      const activeSizes = [];
      if (qtyXS > 0) activeSizes.push('XS');
      if (qtyS > 0) activeSizes.push('S');
      if (qtyM > 0) activeSizes.push('M');
      if (qtyL > 0) activeSizes.push('L');
      if (activeSizes.length === 0) activeSizes.push('S', 'M');

      const sizeList = [
        { size: 'XS', quantity: qtyXS, label: `Size XS (${String(qtyXS).padStart(2, '0')} bộ)` },
        { size: 'S', quantity: qtyS, label: `Size S (${String(qtyS).padStart(2, '0')} bộ)` },
        { size: 'M', quantity: qtyM, label: `Size M (${String(qtyM).padStart(2, '0')} bộ)` },
        { size: 'L', quantity: qtyL, label: `Size L (${String(qtyL).padStart(2, '0')} bộ)` },
      ];

      // Ánh xạ trạng thái UI sang status MongoDB
      let mongoStatus = 'available';
      if (editStatusType === 'ready') mongoStatus = 'renting';
      else if (editStatusType === 'drying') mongoStatus = 'maintenance';
      else if (editStatusType === 'out_of_stock') mongoStatus = 'retired';

      // Chuẩn hóa silhouette an toàn trước khi gửi (đảm bảo đúng enum Schema)
      const normalizeSil = (s = '') => {
        const lower = String(s).toLowerCase();
        if (lower.includes('ballgown') || lower.includes('bồng')) return 'Ballgown';
        if (lower.includes('mermaid') || lower.includes('đuôi cá')) return 'Mermaid';
        if (lower.includes('a-line') || lower.includes('chữ a') || lower.includes('aline')) return 'A-Line';
        if (lower.includes('silk') || lower.includes('lụa')) return 'Silk Gown';
        if (lower.includes('princess') || lower.includes('hoàng gia')) return 'Princess';
        return 'Other';
      };

      const finalSil = normalizeSil(selectedCatObj?.silhouette || selectedCatObj?.name || editSilhouette);

      const updatePayload = {
        name: editName.trim(),
        ...(selectedCatObj?._id ? { categoryId: selectedCatObj._id } : {}),
        silhouette: finalSil,
        material: editMaterial.trim() || 'Lụa Mikado Ý',
        color: editColor.trim() || 'Trắng Tinh Khôi',
        rentPrice: parseNum(editRentPrice, 5000000),
        depositAmount: parseNum(editDepositAmount, 15000000),
        description: editDescription.trim(),
        sizes: activeSizes,
        status: mongoStatus,
        ...(editImages.length > 0 ? { images: editImages } : {}),
      };

      const targetId = editingItem.rawDress?._id || editingItem._id || editingItem.id || editingItem.code;
      if (targetId && !String(targetId).startsWith('fake') && !String(targetId).startsWith('new_')) {
        try {
          await updateDress(targetId, updatePayload);
        } catch (apiErr) {
          console.warn('Cập nhật dress qua API gặp cảnh báo:', apiErr);
        }
      }

      // Cập nhật overrides cho kho
      const overrideObj = {
        ...(manualOverrides[editingItem.id] || {}),
        name: editName.trim(),
        silhouette: selectedCatObj?.name || editSilhouette,
        category: selectedCatObj?.name || editSilhouette,
        material: editMaterial.trim(),
        color: editColor.trim(),
        rentPrice: parseNum(editRentPrice, 5000000),
        depositAmount: parseNum(editDepositAmount, 15000000),
        statusType: editStatusType,
        description: editDescription.trim(),
        sizes: sizeList,
        images: editImages.length > 0 ? editImages : (editingItem.images || [editingItem.image]),
        location: editLocation || 'Tủ A1',
      };

      const updatedOverrides = {
        ...manualOverrides,
        [editingItem.id]: overrideObj,
        ...(editingItem.code ? { [editingItem.code]: overrideObj } : {}),
        ...(cleanStr(editName) ? { [cleanStr(editName)]: overrideObj } : {}),
      };

      setManualOverrides(updatedOverrides);
      try {
        localStorage.setItem('unibridal_inventory_overrides', JSON.stringify(updatedOverrides));
      } catch { }

      // Tải lại dữ liệu kho từ MongoDB
      await loadInventory();

      setEditingItem(null);
      showToast(`Đã lưu thay đổi cho mẫu lễ phục "${editName}" thành công!`);
    } catch (err) {
      console.error('Lỗi khi lưu chỉnh sửa:', err);
      showToast('Có lỗi xảy ra khi lưu thay đổi.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Xử lý upload ảnh cho sản phẩm từ máy tính (hỗ trợ chọn nhiều ảnh)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImages((prev) => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Xử lý nộp phiếu nhập kho mới - Lưu trực tiếp vào MongoDB Atlas bảng dresses
  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Vui lòng nhập Tên Tác Phẩm.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tìm danh mục phom dáng tương ứng từ categoriesList
      const selectedCatObj = categoriesList.find(
        (c) => c.name === newSilhouette || c.slug === newSilhouette || c._id === newSilhouette || c.id === newSilhouette
      );

      // 2. Tính toán tồn kho 4 size XS, S, M, L
      const qtyXS = Math.max(0, Number(newSizeXS || 0));
      const qtyS = Math.max(0, Number(newSizeS || 0));
      const qtyM = Math.max(0, Number(newSizeM || 0));
      const qtyL = Math.max(0, Number(newSizeL || 0));
      const totalCount = qtyXS + qtyS + qtyM + qtyL;

      const activeSizes = [];
      if (qtyXS > 0) activeSizes.push('XS');
      if (qtyS > 0) activeSizes.push('S');
      if (qtyM > 0) activeSizes.push('M');
      if (qtyL > 0) activeSizes.push('L');
      if (activeSizes.length === 0) activeSizes.push('S', 'M');

      const payload = {
        name: newName.trim(),
        categoryId: selectedCatObj?._id || selectedCatObj?.id,
        category: selectedCatObj?.name || newSilhouette,
        silhouette: selectedCatObj?.slug || selectedCatObj?.silhouette || newSilhouette,
        material: newMaterial.trim() || 'Lụa Mikado Ý',
        color: newColor.trim() || 'Trắng Tinh Khôi',
        rentPrice: parseNum(newRentPrice, 5000000),
        depositAmount: parseNum(newDepositAmount, 15000000),
        description: newDescription.trim() || 'Lễ phục cưới cao cấp bảo quản tiêu chuẩn vi khí hậu.',
        sizes: activeSizes,
        images: newImages.length > 0 ? newImages : [card1Elysian],
        status: 'available',
        collectionTag: 'ATELIER COUTURE 2026',
      };

      // 3. Gửi Request tạo váy cưới trực tiếp trên MongoDB Atlas
      const res = await createDress(payload);
      const createdDress = res?.data || res;
      const createdId = createdDress?._id || createdDress?.id || `new_${Date.now()}`;

      // 4. Lưu cấu hình phân bổ số lượng tồn kho từng size vào manualOverrides
      const sizeList = [
        { size: 'XS', quantity: qtyXS, label: `Size XS (${String(qtyXS).padStart(2, '0')} bộ)` },
        { size: 'S', quantity: qtyS, label: `Size S (${String(qtyS).padStart(2, '0')} bộ)` },
        { size: 'M', quantity: qtyM, label: `Size M (${String(qtyM).padStart(2, '0')} bộ)` },
        { size: 'L', quantity: qtyL, label: `Size L (${String(qtyL).padStart(2, '0')} bộ)` },
      ];

      const overrideObj = {
        name: newName.trim(),
        material: newMaterial.trim(),
        color: newColor.trim(),
        silhouette: selectedCatObj?.name || newSilhouette,
        sizes: sizeList,
        rentPrice: parseNum(newRentPrice, 5000000),
        depositAmount: parseNum(newDepositAmount, 15000000),
        description: newDescription.trim(),
        location: 'Tủ A1',
      };

      const newOverrides = {
        ...manualOverrides,
        [createdId]: overrideObj,
        ...(createdDress?.code ? { [createdDress.code]: overrideObj } : {}),
        ...(cleanStr(newName) ? { [cleanStr(newName)]: overrideObj } : {}),
      };

      setManualOverrides(newOverrides);
      try {
        localStorage.setItem('unibridal_inventory_overrides', JSON.stringify(newOverrides));
      } catch { }

      // 5. Tải lại toàn bộ dữ liệu kho hàng từ MongoDB Atlas
      await loadInventory();

      // Đóng modal và reset form
      setIsAddModalOpen(false);
      setNewName('');
      setNewImages([]);
      setNewColor('Trắng Tinh Khôi');
      setNewDescription('');
      setNewRentPrice('5.000.000');
      setNewDepositAmount('15.000.000');
      setNewSizeXS(1);
      setNewSizeS(2);
      setNewSizeM(2);
      setNewSizeL(1);

      showToast(`Đã lưu và nhập kho thành công tác phẩm "${payload.name}" vào MongoDB Atlas!`);
    } catch (err) {
      console.error('Lỗi khi lưu tác phẩm vào MongoDB Atlas:', err);
      showToast(`Lỗi khi lưu tác phẩm: ${err.message || 'Không thể kết nối máy chủ'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quản lý xóa mẫu váy khỏi kho
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDeleteItem = (item) => {
    setActionMenuOpenId(null);
    setDeletingItem(item);
  };

  const handleExecuteDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      // 1. Gọi API Backend nếu là mẫu váy có ID trong database
      if (deletingItem.id && !String(deletingItem.id).startsWith('new_')) {
        try {
          await deleteDress(deletingItem.id);
        } catch (apiErr) {
          console.warn('API delete dress warning:', apiErr);
        }
      }

      // 2. Ghi nhận ID đã xóa vào localStorage để không bị tải lại khi reload
      try {
        const deletedIds = JSON.parse(localStorage.getItem('unibridal_deleted_dress_ids') || '[]');
        if (!deletedIds.includes(deletingItem.id)) {
          deletedIds.push(deletingItem.id);
          localStorage.setItem('unibridal_deleted_dress_ids', JSON.stringify(deletedIds));
        }
      } catch { }

      // 3. Xóa override nếu có
      if (manualOverrides[deletingItem.id]) {
        const nextOverrides = { ...manualOverrides };
        delete nextOverrides[deletingItem.id];
        setManualOverrides(nextOverrides);
        try {
          localStorage.setItem('unibridal_inventory_overrides', JSON.stringify(nextOverrides));
        } catch { }
      }

      // 4. Cập nhật state UI ngay lập tức
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      setRawDresses((prev) => prev.filter((d) => (d._id || d.id) !== deletingItem.id));

      showToast(`Đã xóa thành công mẫu váy "${deletingItem.name}" khỏi kho!`);
      setDeletingItem(null);
    } catch (err) {
      console.error('Lỗi khi xóa mẫu váy khỏi kho:', err);
      showToast('Có lỗi xảy ra khi xóa mẫu váy khỏi kho.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đếm các số liệu tổng quan theo yêu cầu quản lý kho:
  // 1. Tổng số váy (tính tổng chiếc/bộ váy trên mọi size)
  const totalUnitsAll = items.reduce((sum, item) => sum + (item.totalStock || 0), 0);

  // 2. Tổng số mẫu (tổng số mẫu thiết kế lưu kho)
  const totalCount = items.length;

  // 3. Tổng số mẫu đang cho thuê (có đơn thuê hoặc trạng thái đã cho thuê)
  const rentedModelsCount = items.filter(
    (i) =>
      (i.rentedCount && i.rentedCount > 0) ||
      i.statusType === 'ready' ||
      i.statusType === 'partially_rented' ||
      i.statusType === 'out_of_stock'
  ).length;

  // 4. Tổng số mẫu đang bảo dưỡng (giặt khô, là hơi hoặc váy của các đơn đang kiểm định sau thuê)
  const maintenanceCount = items.filter(
    (i) => i.statusType === 'drying' || (i.maintenanceCount && i.maintenanceCount > 0)
  ).length;

  // 5. Tổng giá trị tài sản kho bảo lãnh
  const totalAssetValue = useMemo(() => {
    return items.reduce((sum, item) => sum + ((parseNum(item.depositAmount, 15000000)) * (item.totalStock || 1)), 0);
  }, [items]);

  // 6. Tổng số váy khả dụng sẵn sàng ngay
  const totalAvailableUnits = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.availableStock || 0), 0);
  }, [items]);

  // 7. Tổng số váy đang phục vụ cô dâu
  const totalRentedUnits = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.rentedCount || 0), 0);
  }, [items]);

  // 8. Tỷ lệ lấp đầy kho (%)
  const utilizationRate = totalUnitsAll > 0 ? Math.round((totalRentedUnits / totalUnitsAll) * 100) : 0;

  const selectedFilterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label || 'Tất Cả Tình Trạng';

  return (
    <AdminLayout activeMenu="inventory">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2523] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#443836] animate-slideUp">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadInventory}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Page Title và Main CTA Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-[32px] sm:text-[38px] font-normal text-[#5F2B36] tracking-tight leading-tight mb-2">
            Quản Lý Sản Phẩm Kho
          </h1>
          <p className="text-[14px] text-[#7A6B6C] font-normal max-w-3xl leading-relaxed">
            Theo dõi số lượng váy cưới thực tế, vị trí tủ lưu trữ, kiểm định và bảo dưỡng lễ phục showroom UniBridal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              await loadInventory();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-[#5F2B36] hover:bg-[#FAF0EC] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
            title="Làm mới dữ liệu kho hàng từ máy chủ"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMatrixTable(!showMatrixTable)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
              showMatrixTable
                ? 'bg-[#5F2B36] text-white border-[#5F2B36]'
                : 'bg-white text-[#5F2B36] border-[#E8DDD8] hover:bg-[#FAF0EC]'
            }`}
          >
            <TableProperties size={15} />
            <span>{showMatrixTable ? 'Ẩn Ma Trận Size' : 'Bảng Ma Trận Tồn Kho và Size'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#733F49] to-[#8C4654] hover:from-[#5A2D35] hover:to-[#733F49] text-white text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
          >
            <Plus size={15} />
            <span>Nhập Lễ Phục Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards Nâng Cấp: Tổng số váy, Tổng số mẫu, Đang cho thuê, Đang bảo dưỡng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: TỔNG MẪU THIẾT KẾ (Ánh hồng thanh lịch) */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FDE8EC_0%,_transparent_70%)] rounded-2xl border border-[#FAD2DA] py-4 px-5 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#733F49] uppercase">
                TỔNG MẪU THIẾT KẾ
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#733F49]">
                <Layers size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#2C2523] leading-none">
                {totalCount}
              </span>
              <span className="text-[12px] font-medium text-[#8C7D7E] ml-2">mẫu thiết kế</span>
            </div>
          </div>
        </div>

        {/* Card 2: TỔNG SỐ VÁY (Ánh xanh lá dịu mát) */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#EAF8EE_0%,_transparent_70%)] rounded-2xl border border-[#C6EED1] py-4 px-5 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#1E8347] uppercase">
                TỔNG SỐ LỄ PHỤC
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF8EE] flex items-center justify-center text-[#1E8347]">
                <HangerIcon size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#1E8347] leading-none">
                {totalUnitsAll}
              </span>
              <span className="text-[12px] font-medium text-[#736364] ml-2">chiếc váy</span>
            </div>
          </div>
        </div>

        {/* Card 3: MẪU ĐANG CHO THUÊ */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#EFF6FF_0%,_transparent_70%)] rounded-2xl border border-[#BFDBFE] py-4 px-5 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#1D4ED8] uppercase">
                LỄ PHỤC ĐI THUÊ
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8]">
                <Crown size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#1E3A8A] leading-none">
                {rentedModelsCount}
              </span>
              <span className="text-[12px] font-medium text-[#60A5FA] ml-2">
                mẫu ({totalCount > 0 ? Math.round((rentedModelsCount / totalCount) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: MẪU ĐANG BẢO DƯỠNG */}
        <div className="bg-white bg-[radial-gradient(ellipse_at_top_right,_#FEF3C7_0%,_transparent_70%)] rounded-2xl border border-[#FDE68A] py-4 px-5 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-[1.2px] text-[#92400E] uppercase">
                MẪU ĐANG BẢO DƯỠNG
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FEF2E6] flex items-center justify-center text-[#D97706]">
                <Clock size={17} />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[#78350F] leading-none">
                {maintenanceCount}
              </span>
              <span className="text-[12px] font-medium text-[#D97706] ml-2">mẫu đang xử lý</span>
            </div>
          </div>
        </div>
      </div>

      {/* NÂNG CẤP: Bảng Ma Trận Tồn Kho Chi Tiết Theo Size (Hiển thị khi bật nút toggle) */}
      {showMatrixTable && (
        <section className="bg-white rounded-2xl border border-[#EFE5E1] p-6 shadow-xs mb-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F4EBE7]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] flex items-center justify-center text-[#733F49]">
                <TableProperties size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2C2523] uppercase tracking-wider">
                  Bảng Ma Trận Tồn Kho Theo Size và Tình Trạng Lễ Phục
                </h3>
                <p className="text-xs text-[#8A797A]">Đối soát chi tiết từng kích cỡ và số lượng sẵn sàng phục vụ tại showroom</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <CheckCircle2 size={13} /> {totalAvailableUnits} chiếc sẵn sàng
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                <Crown size={13} /> {totalRentedUnits} chiếc đang cho thuê
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5F2] text-[#705F60] font-bold uppercase tracking-wider text-[11px] border-b border-[#EFE2DC]">
                  <th className="py-3 px-3.5">Mã Váy</th>
                  <th className="py-3 px-3.5">Tên Mẫu Thiết Kế</th>
                  <th className="py-3 px-3 text-center">Vị Trí Tủ</th>
                  <th className="py-3 px-2 text-center bg-[#FDF8F6]">Size XS</th>
                  <th className="py-3 px-2 text-center bg-[#FDF8F6]">Size S</th>
                  <th className="py-3 px-2 text-center bg-[#FDF8F6]">Size M</th>
                  <th className="py-3 px-2 text-center bg-[#FDF8F6]">Size L</th>
                  <th className="py-3 px-3 text-center font-bold">Tổng Bộ</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Khả Dụng</th>
                  <th className="py-3 px-3 text-center text-blue-700">Đang Thuê</th>
                  <th className="py-3 px-3 text-center text-amber-700">Bảo Dưỡng</th>
                  <th className="py-3 px-3.5 text-right">Tiền Cọc Niêm Yết</th>
                  <th className="py-3 px-3 text-center">Tình Trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EAE6]">
                {items.map((it) => {
                  const szXS = (it.sizes || []).find((s) => s.size?.toUpperCase() === 'XS')?.quantity || 0;
                  const szS = (it.sizes || []).find((s) => s.size?.toUpperCase() === 'S')?.quantity || 0;
                  const szM = (it.sizes || []).find((s) => s.size?.toUpperCase() === 'M')?.quantity || 0;
                  const szL = (it.sizes || []).find((s) => s.size?.toUpperCase() === 'L')?.quantity || 0;

                  return (
                    <tr key={it.id} className="hover:bg-[#FFFDFB] transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-[#733F49]">
                        {it.code}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-[#2C2523]">
                        {it.name}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#705F60]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF2EE] text-[11px] font-semibold border border-[#EFE2DC]">
                          {it.location || 'Tủ A1'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center bg-[#FFFBF9] font-medium text-[#5D4E50]">
                        {szXS > 0 ? szXS : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center bg-[#FFFBF9] font-medium text-[#5D4E50]">
                        {szS > 0 ? szS : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center bg-[#FFFBF9] font-medium text-[#5D4E50]">
                        {szM > 0 ? szM : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center bg-[#FFFBF9] font-medium text-[#5D4E50]">
                        {szL > 0 ? szL : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#2C2523]">
                        {it.totalStock}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                        {it.availableStock}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-blue-700">
                        {it.rentedCount > 0 ? it.rentedCount : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-amber-700">
                        {it.maintenanceCount > 0 ? it.maintenanceCount : '0'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-medium text-[#733F49]">
                        {fmtVnd(it.depositAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          it.statusType === 'drying' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          it.statusType === 'out_of_stock' ? 'bg-red-50 text-red-700 border border-red-200' :
                          it.statusType === 'ready' || it.statusType === 'partially_rented' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {it.statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Hàng Tổng Cộng Kho */}
                <tr className="bg-[#FAF0EC] font-bold text-[#2C2523] border-t-2 border-[#EAD5CF]">
                  <td colSpan={3} className="py-3 px-3.5 text-xs font-playfair uppercase">
                    TỔNG CỘNG TOÀN KHO SHOWROOM
                  </td>
                  <td className="py-3 px-2 text-center bg-[#FAF0EC]">
                    {items.reduce((sum, it) => sum + ((it.sizes || []).find((s) => s.size?.toUpperCase() === 'XS')?.quantity || 0), 0)}
                  </td>
                  <td className="py-3 px-2 text-center bg-[#FAF0EC]">
                    {items.reduce((sum, it) => sum + ((it.sizes || []).find((s) => s.size?.toUpperCase() === 'S')?.quantity || 0), 0)}
                  </td>
                  <td className="py-3 px-2 text-center bg-[#FAF0EC]">
                    {items.reduce((sum, it) => sum + ((it.sizes || []).find((s) => s.size?.toUpperCase() === 'M')?.quantity || 0), 0)}
                  </td>
                  <td className="py-3 px-2 text-center bg-[#FAF0EC]">
                    {items.reduce((sum, it) => sum + ((it.sizes || []).find((s) => s.size?.toUpperCase() === 'L')?.quantity || 0), 0)}
                  </td>
                  <td className="py-3 px-3 text-center text-sm font-bold text-[#2C2523]">
                    {totalUnitsAll}
                  </td>
                  <td className="py-3 px-3 text-center text-sm font-bold text-emerald-700">
                    {totalAvailableUnits}
                  </td>
                  <td className="py-3 px-3 text-center text-sm font-bold text-blue-700">
                    {totalRentedUnits}
                  </td>
                  <td className="py-3 px-3 text-center text-sm font-bold text-amber-700">
                    {items.reduce((sum, it) => sum + (it.maintenanceCount || 0), 0)}
                  </td>
                  <td className="py-3 px-3.5 text-right text-xs font-bold text-[#733F49]">
                    {fmtVnd(totalAssetValue)}
                  </td>
                  <td className="py-3 px-3 text-center text-[11px] text-emerald-700">
                    Sẵn sàng {totalAvailableUnits}/{totalUnitsAll}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Search và Filter Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#EFE5E1] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39192]" />
          <input
            type="text"
            placeholder="Tìm theo mã váy, tên thiết kế, vị trí tủ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#EFE5E1] bg-[#FCF7F4] text-sm text-[#302626] placeholder-[#A39293] focus:outline-none focus:ring-2 focus:ring-[#B8737D]/30 focus:border-[#B8737D] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39192] hover:text-[#5F333B] cursor-pointer bg-transparent border-0 p-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {statusOptions.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-0 ${
                statusFilter === tab.value
                  ? 'bg-[#733F49] text-white shadow-xs'
                  : 'bg-[#FCF7F4] text-[#7A6B6C] hover:bg-[#FAF0EC] hover:text-[#733F49]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#EFE5E1] shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F2E5E0] bg-[#FFF6F3]">
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[25%] min-w-[210px]">
                  SẢN PHẨM và MÃ VÁY
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[18%] min-w-[160px]">
                  VỊ TRÍ TỦ
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase w-[17%] min-w-[150px]">
                  GIÁ THUÊ và CỌC
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[18%] min-w-[160px]">
                  TỒN KHO THEO SIZE
                </th>
                <th className="py-4 px-4 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[13%] min-w-[140px]">
                  TÌNH TRẠNG KHO
                </th>
                <th className="py-4 px-5 text-[11px] font-bold tracking-[1px] text-[#7A696B] uppercase text-center w-[9%] min-w-[100px]">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6EDE9]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#8C7D7E] text-sm">
                    Không tìm thấy sản phẩm kho nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#FCF9F7] transition-colors">
                      {/* Col 1: Sản phẩm */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#EFE5E1] shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleOpenEditModal(item)}
                          />
                          <div className="flex flex-col gap-1 items-start">
                            <div
                              onClick={() => handleOpenEditModal(item)}
                              className="font-jakarta text-[14px] font-bold text-[#2C2523] hover:text-[#B8737D] cursor-pointer transition-colors leading-tight"
                            >
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAF0EC] text-[#733F49] font-mono text-[10.5px] font-bold border border-[#F2D8D4] leading-none">
                                {item.code}
                              </span>
                            </div>
                            {item.collection ? (
                              <div className="text-[10px] font-bold text-[#A39293] tracking-wider uppercase leading-none">
                                {item.collection}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Vị trí tủ */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <HangerIcon size={16} strokeWidth={1.8} className="text-[#8A4650] shrink-0" />
                          <span className="font-bold text-[#2C2523] text-[13.5px] whitespace-nowrap">
                            {item.location}
                          </span>
                        </div>
                      </td>

                      {/* Col 3: Giá thuê và Cọc */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#733F49] text-[13.5px] leading-tight">
                          {fmtVnd(item.rentPrice)}
                        </div>
                        <div className="text-[11px] text-[#8C7D7E] mt-1 font-medium">
                          Cọc: <span className="font-semibold text-[#5F4E50]">{fmtVnd(item.depositAmount)}</span>
                        </div>
                      </td>

                      {/* Col 4: Tồn kho theo size */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <div className="text-[13.5px] font-bold text-[#2C2523] leading-tight">
                            Khả dụng:{' '}
                            <span className={item.availableStock < item.totalStock ? 'text-[#D97706]' : 'text-[#1E8347]'}>
                              {String(item.availableStock).padStart(2, '0')}
                            </span>
                            <span className="text-[11.5px] font-medium text-[#8C7D7E]"> / {String(item.totalStock || 0).padStart(2, '0')} bộ</span>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
                            {(Array.isArray(item.sizes) ? item.sizes : [])
                              .filter((s) => {
                                const sQty = typeof s === 'object' ? (s.quantity ?? 0) : 0;
                                const sAvail = typeof s === 'object' && s.available !== undefined ? s.available : sQty;
                                return sQty > 0 || sAvail > 0;
                              })
                              .map((s, idx) => {
                              const sName = typeof s === 'object' ? s.size : s;
                              const sQty = typeof s === 'object' ? (s.quantity ?? 0) : 0;
                              const sAvail = typeof s === 'object' && s.available !== undefined ? s.available : sQty;
                              const sMaint = typeof s === 'object' ? (s.maintenance ?? 0) : 0;
                              const sRented = typeof s === 'object' ? (s.rented ?? 0) : 0;

                              return (
                                <span
                                  key={idx}
                                  title={sMaint > 0 ? `Đang có ${sMaint} bộ size ${sName} kiểm định sau thuê` : sRented > 0 ? `Đang có ${sRented} bộ size ${sName} đang được khách thuê` : `Sẵn sàng phục vụ: ${sAvail} bộ`}
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md border font-semibold text-[10.5px] ${sMaint > 0
                                    ? 'bg-[#FEF2E6] text-[#B45309] border-[#FED7AA]'
                                    : sRented > 0
                                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                      : 'bg-[#FAF5F2] text-[#733F49] border-[#EFE2DC]'
                                    }`}
                                >
                                  {sName}: <span className="font-bold ml-1 text-[#2C2523]">{sAvail}/{sQty}</span>
                                  {sMaint > 0 && <span className="ml-1 text-[9px] text-[#D97706] font-bold">({sMaint} bảo dưỡng)</span>}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Col 5: Tình trạng kho */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          {item.statusType === 'stored' && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                              <Crown size={12} className="text-[#1D4ED8]" />
                              <span>Còn Hàng</span>
                            </span>
                          )}
                          {item.statusType === 'ready' && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap bg-[#EAF7EE] text-[#1E8347] border border-[#BCE7C7]">
                              <CheckCircle2 size={12} className="text-[#1E8347]" />
                              <span>Đã Cho Thuê</span>
                            </span>
                          )}
                          {item.statusType === 'out_of_stock' && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                              <AlertTriangle size={12} className="text-[#DC2626]" />
                              <span>Hết Hàng</span>
                            </span>
                          )}
                          {item.statusType === 'drying' && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap bg-[#FEF2E6] text-[#D97706] border border-[#FED7AA]">
                              <Clock size={12} className="text-[#D97706]" />
                              <span>Đang Bảo Dưỡng</span>
                            </span>
                          )}

                          {/* Chú thích trạng thái rõ ràng, dễ hiểu */}
                          {(item.statusSubNote || item.statusType === 'stored') && (
                            <span className="text-[11px] text-[#8C7A7B] font-medium leading-tight max-w-[170px] text-center">
                              {item.statusSubNote || (item.availableStock === item.totalStock
                                ? `Sẵn sàng phục vụ (${item.availableStock}/${item.totalStock} bộ)`
                                : `Sẵn sàng: ${item.availableStock}/${item.totalStock} bộ`)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col 6: Thao tác (Nút SỬA + NÚT XÓA + Menu Dropdown) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="relative inline-flex items-center justify-center gap-1.5 text-[#736364]">
                          {/* Nút Sửa thay thế nút Xem Chi Tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Chỉnh sửa thông tin và kho váy"
                            className="px-2.5 py-1.5 rounded-xl bg-[#FAF0EC] text-[#733F49] hover:bg-[#F2DCD6] hover:text-[#5F2B36] transition-colors cursor-pointer flex items-center gap-1 text-[11.5px] font-bold border border-[#F2D8D4] shadow-2xs"
                          >
                            <Pencil size={13} />
                            <span>Sửa</span>
                          </button>

                          {/* Nút Xóa hàng ở kho */}
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteItem(item)}
                            title="Xóa mẫu váy khỏi kho"
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors cursor-pointer flex items-center gap-1 text-[11.5px] font-bold border border-red-200 shadow-2xs"
                          >
                            <Trash2 size={13} />
                            <span>Xóa</span>
                          </button>

                          {/* Dropdown 3 chấm chuyển nhanh trạng thái */}
                          <button
                            type="button"
                            onClick={() =>
                              setActionMenuOpenId(
                                actionMenuOpenId === item.id ? null : item.id
                              )
                            }
                            title="Chuyển trạng thái kho"
                            className="p-1.5 rounded-xl hover:bg-[#F3E7E3] hover:text-[#733F49] transition-colors cursor-pointer border-0 bg-transparent"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Action Popover Menu */}
                          {actionMenuOpenId === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-[#EFE5E1] py-2 z-30 text-left animate-fadeIn">
                              <div className="px-3.5 py-1 text-[10px] font-bold text-[#8C7A7B] uppercase tracking-wider bg-[#FCF8F5] mb-1">
                                TRẠNG THÁI KHO
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'stored', 'CÒN HÀNG')}
                                className="w-full px-3.5 py-2 text-xs text-[#1D4ED8] hover:bg-[#EFF6FF] font-semibold block text-left transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                ✨ Còn Hàng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'ready', 'ĐÃ CHO THUÊ')}
                                className="w-full px-3.5 py-2 text-xs text-[#1E8347] hover:bg-[#EAF8EE] font-semibold block text-left transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                ✓ Đã Cho Thuê
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'drying', 'ĐANG BẢO DƯỠNG')}
                                className="w-full px-3.5 py-2 text-xs text-[#C05621] hover:bg-[#FFF4E6] font-semibold block text-left transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                ♨ Đang Bảo Dưỡng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemStatus(item.id, 'out_of_stock', 'HẾT HÀNG')}
                                className="w-full px-3.5 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] font-semibold block text-left transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                ✕ Hết Hàng
                              </button>

                              <div className="border-t border-[#F2E5E0] my-1" />
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteItem(item)}
                                className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 text-left transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                <Trash2 size={13} />
                                <span>Xóa mẫu khỏi kho</span>
                              </button>
                            </div>
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[#F2E5E0] bg-[#FFFBF9] flex-wrap gap-3">
          <div className="text-xs text-[#7A6B6C]">
            Hiển thị{' '}
            <span className="font-bold text-[#2C2523]">
              {filteredItems.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1}
            </span>{' '}
            –{' '}
            <span className="font-bold text-[#2C2523]">
              {Math.min(activePage * PAGE_SIZE, filteredItems.length)}
            </span>{' '}
            trong tổng số <span className="font-bold text-[#2C2523]">{filteredItems.length}</span> mẫu lễ phục
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <button
                  key={`ellipsis-${idx}`}
                  type="button"
                  title={idx === 0 ? 'Về các trang trước' : 'Đến các trang sau'}
                  onClick={() => {
                    if (idx === 0) setActivePage((prev) => Math.max(1, prev - 3));
                    else setActivePage((prev) => Math.min(totalPages, prev + 3));
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#8C7D7E] text-xs font-bold hover:bg-[#F5ECE8] hover:text-[#733F49] transition-colors cursor-pointer"
                >
                  ...
                </button>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePage(p)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${activePage === p
                    ? 'bg-[#733F49] text-white shadow-xs'
                    : 'bg-white border border-[#EFE5E1] shadow-2xs text-[#4A3B3D] hover:bg-[#F5ECE8]'
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={activePage >= totalPages}
              onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-[#EFE5E1] shadow-2xs flex items-center justify-center text-[#7A6B6C] hover:bg-[#F5ECE8] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL SỬA SẢN PHẨM VÀ TỒN KHO (EDIT MODAL)                  */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-jakarta">
          <div
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#EFE5E1] max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header Cố Định (Sticky / Pinned Header) */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F0E6E2] bg-white shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0EC] flex items-center justify-center text-[#733F49] shrink-0">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="font-playfair text-xl font-bold text-[#5F2B36] m-0">
                    Chỉnh Sửa Thông Tin và Tồn Kho
                  </h3>
                  <p className="text-xs text-[#8C7D7E] m-0 mt-0.5">
                    Mã lễ phục: <strong className="font-mono text-[#733F49]">{editingItem.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-[#FAF2EE] text-[#7A6B6C] hover:text-[#5F2B36] flex items-center justify-center transition-colors cursor-pointer border-0 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              {/* 1. Tên Tác Phẩm */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Tên Tác Phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Juliette Royal Velvet"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>

              {/* 2. Phom Dáng và Chất Liệu (Chọn trực tiếp từ MongoDB Atlas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Phom Dáng *
                  </label>
                  <select
                    value={editSilhouette}
                    onChange={(e) => setEditSilhouette(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D] cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat._id || cat.id || cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Chất Liệu *
                  </label>
                  <select
                    value={editMaterial}
                    onChange={(e) => setEditMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D] cursor-pointer"
                  >
                    {materialsList.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Cơ Chế Trạng Thái Kho (Chỉ có ở modal Chỉnh Sửa) */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Cơ Chế Trạng Thái Kho *
                </label>
                <select
                  value={editStatusType}
                  onChange={(e) => setEditStatusType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] font-medium outline-none focus:border-[#B8737D] cursor-pointer"
                >
                  <option value="stored">Còn Hàng</option>
                  <option value="ready">Đã Cho Thuê</option>
                  <option value="drying">Đang Bảo Dưỡng</option>
                  <option value="out_of_stock">Hết Hàng</option>
                </select>
              </div>

              {/* 4. Đơn Giá Thuê và Tiền Đặt Cọc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Đơn Giá Thuê (VNĐ) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 5.500.000"
                    value={formatNumberWithDots(editRentPrice)}
                    onChange={(e) => setEditRentPrice(formatNumberWithDots(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Tiền Đặt Cọc (VNĐ) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 15.000.000"
                    value={formatNumberWithDots(editDepositAmount)}
                    onChange={(e) => setEditDepositAmount(formatNumberWithDots(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
              </div>

              {/* 5. Tồn Kho Ban Đầu (4 Size: XS, S, M, L) */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#F3DDD7]">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-[#5F2B36] uppercase tracking-wider text-[11px]">
                    Số Lượng Tồn Kho Theo Từng Kích Cỡ Size
                  </div>
                  <div className="text-[11px] text-[#8C6C72] font-semibold">
                    Tổng: {Number(editSizes.XS || 0) + Number(editSizes.S || 0) + Number(editSizes.M || 0) + Number(editSizes.L || 0)} bộ
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size XS</label>
                    <input
                      type="number"
                      min="0"
                      value={editSizes.XS ?? 0}
                      onChange={(e) =>
                        setEditSizes((prev) => ({
                          ...prev,
                          XS: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size S</label>
                    <input
                      type="number"
                      min="0"
                      value={editSizes.S ?? 0}
                      onChange={(e) =>
                        setEditSizes((prev) => ({
                          ...prev,
                          S: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size M</label>
                    <input
                      type="number"
                      min="0"
                      value={editSizes.M ?? 0}
                      onChange={(e) =>
                        setEditSizes((prev) => ({
                          ...prev,
                          M: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size L</label>
                    <input
                      type="number"
                      min="0"
                      value={editSizes.L ?? 0}
                      onChange={(e) =>
                        setEditSizes((prev) => ({
                          ...prev,
                          L: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Màu Sắc */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Màu Sắc *
                  <span className="text-[11px] font-normal text-[#8C7A7C] ml-2">
                    (Gõ trực tiếp hoặc bấm chọn nhanh bên dưới, hỗ trợ nhiều màu)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trắng Tinh Khôi, Trắng Kem, Champagne, Hồng Pastel..."
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_COLORS.map((c) => {
                    const isSelected = (editColor || '')
                      .split(',')
                      .map((s) => s.trim())
                      .some((s) => isColorMatch(s, c.name));
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleToggleColorSelection(c.name, editColor, setEditColor)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#B8737D] text-white border-[#B8737D] shadow-xs'
                            : 'bg-white text-[#5F4E50] border-[#E5D7D0] hover:border-[#B8737D] hover:bg-[#FAF5F2]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: c.hex, border: `1px solid ${c.border}` }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Ảnh Sản Phẩm (Tải lên từ máy, chọn được nhiều ảnh) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#5F4E50]">
                    Ảnh Sản Phẩm * (Tải lên từ máy, chọn được nhiều ảnh)
                  </label>
                  <div className="flex items-center gap-2">
                    {editImages.length > 0 && (
                      <span className="text-[11px] text-[#8C6C72]">
                        Đã có {editImages.length} ảnh
                      </span>
                    )}
                    {editImages.length > 3 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => editImagesScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                          className="w-6 h-6 rounded-lg bg-[#FAF5F2] hover:bg-[#733F49] hover:text-white text-[#733F49] border border-[#E6DAC8] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Cuộn sang trái"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editImagesScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                          className="w-6 h-6 rounded-lg bg-[#FAF5F2] hover:bg-[#733F49] hover:text-white text-[#733F49] border border-[#E6DAC8] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Cuộn sang phải xem nút thêm ảnh"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  id="edit-dress-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="hidden"
                />

                {editImages.length > 0 ? (
                  <div
                    ref={editImagesScrollRef}
                    onMouseDown={handleScrollMouseDown}
                    onMouseLeave={handleScrollMouseLeave}
                    onMouseUp={handleScrollMouseUp}
                    onMouseMove={handleScrollMouseMove}
                    onWheel={handleScrollWheel}
                    className="flex items-center gap-2.5 p-2.5 bg-[#FAF5F2] rounded-2xl border border-[#EFE5E1] overflow-x-auto cursor-grab active:cursor-grabbing select-none transition-all scroll-smooth pb-2.5 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#F0E6E2] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D4A59A] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#733F49]"
                  >
                    {editImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden w-[100px] h-[135px] sm:w-[110px] sm:h-[148px] shrink-0 border border-[#E6DAC8] bg-white shadow-xs"
                      >
                        <img
                          src={imgSrc}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#733F49] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Ảnh chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer border-0"
                          title="Xóa ảnh này"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    <label
                      htmlFor="edit-dress-image-upload"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4B2A7] hover:border-[#733F49] bg-white hover:bg-[#FFF9F6] w-[100px] h-[135px] sm:w-[110px] sm:h-[148px] shrink-0 cursor-pointer transition-all text-[#733F49]"
                      title="Chọn thêm ảnh"
                    >
                      <Plus size={20} />
                      <span className="text-[10px] font-semibold mt-1">Thêm ảnh</span>
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-dress-image-upload"
                    className="w-full flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#D4B2A7] hover:border-[#733F49] bg-[#FAF5F2] hover:bg-[#FFF9F6] cursor-pointer transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFF0EB] text-[#733F49] flex items-center justify-center mb-2 shadow-xs">
                      <Upload size={18} />
                    </div>
                    <div className="font-bold text-[#5F2B36] text-xs">
                      Click để chọn ảnh từ máy tính (hỗ trợ nhiều ảnh)
                    </div>
                    <div className="text-[10.5px] text-[#9A8B8C] mt-0.5">
                      Định dạng JPG, PNG, WEBP (Ảnh đầu tiên sẽ là ảnh bìa chính)
                    </div>
                  </label>
                )}
              </div>

              {/* 8. Mô Tả / Đặc Điểm Lễ Phục */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Mô Tả / Đặc Điểm Lễ Phục
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ghi chú chi tiết về chất liệu ren, phom dáng corset, lưu ý bảo quản..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>
              </div>

              {/* 9. Nút Thao Tác Cố Định Ở Dưới: Xóa Khỏi Kho, Hủy, Lưu Thay Đổi */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#F0E6E2] bg-[#FAF5F2]/60 shrink-0">
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={() => {
                    const itemToDelete = editingItem;
                    setEditingItem(null);
                    handleConfirmDeleteItem(itemToDelete);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 cursor-pointer transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span>Xóa Khỏi Kho</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingEdit}
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-2.5 rounded-xl border border-[#EFE2DC] bg-white text-[#7A6B6C] font-bold hover:bg-[#FAF2EE] cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#733F49] to-[#8C4654] hover:from-[#5A2D35] hover:to-[#733F49] text-white font-bold cursor-pointer transition-all shadow-md border-0 flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSubmittingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nhập Kho Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-jakarta">
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EFE5E1] max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header Cố Định (Sticky / Pinned Header) */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F0E6E2] bg-white shrink-0 z-10">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#733F49]" />
                <h3 className="font-playfair text-xl font-bold text-[#5F2B36] m-0">
                  Nhập Kho Lễ Phục Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#9A8B8C] hover:text-[#5F333B] cursor-pointer border-0 bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              {/* 1. Tên Tác Phẩm */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Tên Tác Phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Juliette Royal Velvet"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>

              {/* 2. Phom Dáng và Chất Liệu (Chọn trực tiếp từ MongoDB Atlas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Phom Dáng *
                  </label>
                  <select
                    value={newSilhouette}
                    onChange={(e) => setNewSilhouette(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D] cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat._id || cat.id || cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Chất Liệu *
                  </label>
                  <select
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D] cursor-pointer"
                  >
                    {materialsList.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Đơn Giá Thuê và Tiền Đặt Cọc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Đơn Giá Thuê (VNĐ) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 5.000.000"
                    value={formatNumberWithDots(newRentPrice)}
                    onChange={(e) => setNewRentPrice(formatNumberWithDots(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5F4E50] mb-1">
                    Tiền Đặt Cọc (VNĐ) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 15.000.000"
                    value={formatNumberWithDots(newDepositAmount)}
                    onChange={(e) => setNewDepositAmount(formatNumberWithDots(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                  />
                </div>
              </div>

              {/* 4. Tồn Kho Ban Đầu (4 Size: XS, S, M, L) */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#F3DDD7]">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-[#5F2B36] uppercase tracking-wider text-[11px]">
                    Tồn Kho Ban Đầu
                  </div>
                  <div className="text-[11px] text-[#8C6C72] font-semibold">
                    Tổng: {Number(newSizeXS || 0) + Number(newSizeS || 0) + Number(newSizeM || 0) + Number(newSizeL || 0)} bộ
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size XS</label>
                    <input
                      type="number"
                      min="0"
                      value={newSizeXS}
                      onChange={(e) => setNewSizeXS(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size S</label>
                    <input
                      type="number"
                      min="0"
                      value={newSizeS}
                      onChange={(e) => setNewSizeS(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size M</label>
                    <input
                      type="number"
                      min="0"
                      value={newSizeM}
                      onChange={(e) => setNewSizeM(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#733F49] font-medium text-center mb-1 text-[11px]">Size L</label>
                    <input
                      type="number"
                      min="0"
                      value={newSizeL}
                      onChange={(e) => setNewSizeL(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#EFE5E1] font-bold text-center text-xs outline-none focus:border-[#B8737D]"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Màu Sắc (Người dùng tự điền hoặc chọn nhanh) */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Màu Sắc *
                  <span className="text-[11px] font-normal text-[#8C7A7C] ml-2">
                    (Gõ trực tiếp hoặc bấm chọn nhanh bên dưới, hỗ trợ nhiều màu)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trắng Tinh Khôi, Trắng Kem, Champagne, Hồng Pastel..."
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_COLORS.map((c) => {
                    const isSelected = (newColor || '')
                      .split(',')
                      .map((s) => s.trim())
                      .some((s) => isColorMatch(s, c.name));
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleToggleColorSelection(c.name, newColor, setNewColor)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#B8737D] text-white border-[#B8737D] shadow-xs'
                            : 'bg-white text-[#5F4E50] border-[#E5D7D0] hover:border-[#B8737D] hover:bg-[#FAF5F2]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: c.hex, border: `1px solid ${c.border}` }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Chọn Ảnh Cho Sản Phẩm (Tải lên nhiều ảnh từ máy tính) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#5F4E50]">
                    Ảnh Sản Phẩm * (Tải lên từ máy, chọn được nhiều ảnh)
                  </label>
                  <div className="flex items-center gap-2">
                    {newImages.length > 0 && (
                      <span className="text-[11px] text-[#8C6C72]">
                        Đã chọn {newImages.length} ảnh
                      </span>
                    )}
                    {newImages.length > 3 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => addImagesScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                          className="w-6 h-6 rounded-lg bg-[#FAF5F2] hover:bg-[#733F49] hover:text-white text-[#733F49] border border-[#E6DAC8] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Cuộn sang trái"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => addImagesScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                          className="w-6 h-6 rounded-lg bg-[#FAF5F2] hover:bg-[#733F49] hover:text-white text-[#733F49] border border-[#E6DAC8] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Cuộn sang phải xem nút thêm ảnh"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  id="dress-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {newImages.length > 0 ? (
                  <div
                    ref={addImagesScrollRef}
                    onMouseDown={handleScrollMouseDown}
                    onMouseLeave={handleScrollMouseLeave}
                    onMouseUp={handleScrollMouseUp}
                    onMouseMove={handleScrollMouseMove}
                    onWheel={handleScrollWheel}
                    className="flex items-center gap-2.5 p-2.5 bg-[#FAF5F2] rounded-2xl border border-[#EFE5E1] overflow-x-auto cursor-grab active:cursor-grabbing select-none transition-all scroll-smooth pb-2.5 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#F0E6E2] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D4A59A] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#733F49]"
                  >
                    {newImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden w-[100px] h-[135px] sm:w-[110px] sm:h-[148px] shrink-0 border border-[#E6DAC8] bg-white shadow-xs"
                      >
                        <img
                          src={imgSrc}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#733F49] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Ảnh chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer border-0"
                          title="Xóa ảnh này"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    <label
                      htmlFor="dress-image-upload"
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4B2A7] hover:border-[#733F49] bg-white hover:bg-[#FFF9F6] w-[100px] h-[135px] sm:w-[110px] sm:h-[148px] shrink-0 cursor-pointer transition-all text-[#733F49]"
                      title="Chọn thêm ảnh"
                    >
                      <Plus size={20} />
                      <span className="text-[10px] font-semibold mt-1">Thêm ảnh</span>
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="dress-image-upload"
                    className="w-full flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#D4B2A7] hover:border-[#733F49] bg-[#FAF5F2] hover:bg-[#FFF9F6] cursor-pointer transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFF0EB] text-[#733F49] flex items-center justify-center mb-2 shadow-xs">
                      <Upload size={18} />
                    </div>
                    <div className="font-bold text-[#5F2B36] text-xs">
                      Click để chọn ảnh từ máy tính (hỗ trợ nhiều ảnh)
                    </div>
                    <div className="text-[10.5px] text-[#9A8B8C] mt-0.5">
                      Định dạng JPG, PNG, WEBP (Ảnh đầu tiên sẽ là ảnh bìa chính)
                    </div>
                  </label>
                )}
              </div>

              {/* 7. Mô Tả / Đặc Điểm Chất Liệu */}
              <div>
                <label className="block font-bold text-[#5F4E50] mb-1">
                  Mô Tả / Đặc Điểm Lễ Phục
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Lễ phục cưới cao cấp bảo quản tiêu chuẩn vi khí hậu..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF5F2] border border-[#EFE5E1] text-[#2C2523] outline-none focus:border-[#B8737D]"
                />
              </div>
              </div>

              {/* 8. Nút Bấm Thao Tác Cố Định Ở Dưới */}
              <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#F0E6E2] bg-[#FAF5F2]/60 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EFE2DC] bg-white text-[#7A6B6C] font-bold hover:bg-[#FAF2EE] cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#733F49] hover:bg-[#5C3038] text-white font-bold cursor-pointer transition-colors shadow-xs border-0 flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang lưu vào Atlas...</span>
                    </>
                  ) : (
                    <span>Lưu và Nhập Kho</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Xác Nhận Xóa Mẫu Váy Khỏi Kho */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-jakarta">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#EFE5E1] animate-scaleUp">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-playfair text-[20px] font-bold text-[#2C2523] leading-tight">
                  Xác Nhận Xóa Khỏi Kho
                </h3>
                <p className="text-xs text-[#8C7D7E] mt-0.5">
                  Thao tác sẽ loại bỏ mẫu lễ phục khỏi danh mục quản lý kho
                </p>
              </div>
            </div>

            <div className="bg-[#FFF9F8] border border-[#FDE2DF] rounded-2xl p-4 mb-5 text-xs text-[#4A3B3D] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#F7D8D4]">
                <span className="text-[#8C7D7E]">Mã váy:</span>
                <span className="font-bold text-[#733F49] font-mono">{deletingItem.code}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F7D8D4]">
                <span className="text-[#8C7D7E]">Tên mẫu váy:</span>
                <span className="font-bold text-[#2C2523] text-right">{deletingItem.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7D7E]">Số lượng lưu kho:</span>
                <span className="font-bold text-[#1E8347]">{deletingItem.totalStock} bộ</span>
              </div>
              <p className="text-[11px] text-red-600 mt-2 italic">
                * Lưu ý: Mẫu váy này sẽ ngừng hiển thị trong danh mục cho thuê và quản lý tồn kho.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl border border-[#D5C7C2] text-[#4A3B3D] text-xs font-bold hover:bg-[#F5ECE8] transition-colors cursor-pointer bg-white"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs border-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Xác Nhận Xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
