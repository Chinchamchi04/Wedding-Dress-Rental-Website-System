import Order from '../models/Order.model.js';
import ReturnInspection from '../models/ReturnInspection.model.js';

/**
 * Service xử lý nghiệp vụ Đơn Thuê Váy & Hợp Đồng (Orders)
 */

export const createOrder = async (orderData, currentUser = null) => {
  const {
    items,
    dress,
    rentalStartDate,
    rentalEndDate,
    rentalDays,
    shippingAddress,
    deliveryMethod,
    customerName,
    brideName,
    customerPhone,
    phone,
    customerEmail,
    email,
    customerCccd,
    cccd,
    contractCode,
    contractSignature,
    measurements,
    depositOption,
    notes,
  } = orderData;

  // Chuẩn hóa danh sách sản phẩm thuê
  let resolvedItems = [];
  if (Array.isArray(items) && items.length > 0) {
    resolvedItems = items.map((item) => ({
      dressId: item.dressId || item.id || 'dress_custom',
      name: item.name || 'Váy cưới Haute Couture',
      size: item.size || 'S',
      rentPrice: Number(item.rentPrice || item.price || 0),
      depositAmount: Number(item.depositAmount || item.deposit || 0),
      image: item.image || item.images?.[0] || '',
    }));
  } else if (dress) {
    resolvedItems = [
      {
        dressId: dress.id || dress._id || 'dress_custom',
        name: dress.name || 'Váy cưới Haute Couture',
        size: orderData.selectedSize || dress.size || 'S',
        rentPrice: Number(dress.price || 0),
        depositAmount: Number(dress.depositAmount || dress.deposit || 0),
        image: dress.image || dress.images?.[0] || '',
      },
    ];
  }

  if (resolvedItems.length === 0) {
    throw new Error('Đơn thuê cần ít nhất 1 sản phẩm váy cưới.');
  }

  // Tính toán chi phí
  const totalRentPrice = resolvedItems.reduce((sum, item) => sum + item.rentPrice, 0);
  const totalDeposit = resolvedItems.reduce((sum, item) => sum + item.depositAmount, 0);
  const shippingFee = Number(orderData.shippingFee || 0);
  const discountAmount = Number(orderData.discountAmount || 0);

  // Số tiền cọc cần thanh toán ban đầu (50% hoặc 100%)
  const is50Percent = depositOption === 'deposit30'; // deposit30 đại diện cho cọc 50%
  const depositPaidAmount = is50Percent ? Math.round(totalRentPrice * 0.5) : totalRentPrice;
  const totalPayment = totalRentPrice + totalDeposit + shippingFee - discountAmount;

  // Tạo mã đơn ngẫu nhiên chuẩn UniBridal
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const orderCode = `UB-2026-${randomSuffix}`;

  const resolvedStartDate = rentalStartDate ? new Date(rentalStartDate) : new Date();
  const resolvedEndDate = rentalEndDate
    ? new Date(rentalEndDate)
    : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

  const newOrder = new Order({
    orderCode,
    customerId: currentUser?._id || null,
    customerName: customerName || brideName || currentUser?.fullName || '',
    customerPhone: customerPhone || phone || currentUser?.phone || '',
    customerEmail: customerEmail || email || currentUser?.email || '',
    customerCccd: customerCccd || cccd || '',
    contractCode: contractCode || `HĐ-${orderCode}`,
    contractSignature: contractSignature || customerName || brideName || '',
    measurements: measurements || {},
    items: resolvedItems,
    rentalStartDate: resolvedStartDate,
    rentalEndDate: resolvedEndDate,
    rentalDays: Number(rentalDays || 4),
    totalRentPrice,
    totalDeposit,
    depositPaidAmount,
    shippingFee,
    discountAmount,
    totalPayment,
    status: 'deposit_paid',
    shippingAddress: shippingAddress || 'Nhận trực tiếp tại Showroom UniBridal',
    deliveryMethod: deliveryMethod || 'showroom',
    rentalAgreementAccepted: true,
    notes: notes || '',
  });

  await newOrder.save();
  return newOrder;
};

export const getMyOrders = async (userId) => {
  return await Order.find({ customerId: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { orderCode: { $regex: filters.search, $options: 'i' } },
      { customerName: { $regex: filters.search, $options: 'i' } },
      { customerPhone: { $regex: filters.search, $options: 'i' } },
      { 'items.name': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getOrderByIdOrCode = async (idOrCode) => {
  const isObjectId = idOrCode.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: idOrCode } : { orderCode: idOrCode.toUpperCase() };

  const order = await Order.findOne(query);
  if (!order) {
    throw new Error('Không tìm thấy thông tin đơn thuê.');
  }
  return order;
};

export const updateOrderStatus = async (idOrCode, status) => {
  const order = await getOrderByIdOrCode(idOrCode);
  order.status = status;
  await order.save();

  if (status === 'completed') {
    await ReturnInspection.findOneAndUpdate(
      { orderId: order._id },
      { isRefunded: true, refundedAt: new Date() }
    );
  }

  return order;
};

export const getDressBookedDates = async (dressId) => {
  const query = {
    status: { $nin: ['CANCELLED', 'RETURNED'] },
  };
  if (dressId) {
    query['items.dressId'] = dressId;
  }
  const orders = await Order.find(query).select('orderCode rentalStartDate rentalEndDate');
  return orders.map((o) => ({
    orderCode: o.orderCode,
    startDate: o.rentalStartDate,
    endDate: o.rentalEndDate,
  }));
};

/**
 * Lập biên bản kiểm định tình trạng váy khi khách trả
 * @param {string} orderId - ID đơn thuê
 * @param {Object} data - { itemsCondition,
    evidencePhotos: data.evidencePhotos || [], lateDays, staffId }
 * @param {Object} staffUser - user object của nhân viên
 */
export const submitReturnInspection = async (orderId, data, staffUser) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Không tìm thấy đơn thuê.');

  if (!['renting', 'delivered', 'returned'].includes(order.status)) {
    throw new Error('Đơn thuê chưa ở trạng thái có thể kiểm định. Vui lòng xác nhận khách đã nhận váy trước.');
  }

  const existingInspection = await ReturnInspection.findOne({ orderId });
  if (existingInspection) throw new Error('Đơn thuê này đã có biên bản kiểm định rồi.');

  // Tính số ngày trễ
  const today = new Date();
  const dueDate = new Date(order.rentalEndDate);
  const lateDays = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
  const latePenaltyFee = lateDays * Math.round(order.totalRentPrice * 0.05); // 5% mỗi ngày trễ

  // Tổng khấu trừ từ hư hỏng
  const itemsCondition = (data.itemsCondition || []).map((item) => ({
    dressId: item.dressId || item.id || null,
    condition: item.condition || 'good',
    note: item.note || item.damageNotes || '',
    repairFee: Number(item.repairFee ?? item.compensation ?? 0),
  }));
  const damageTotal = itemsCondition.reduce((sum, i) => sum + i.repairFee, 0);

  const totalDeduction = latePenaltyFee + damageTotal;
  const finalRefundAmount = Math.max(0, order.totalDeposit - totalDeduction);

  const inspection = new ReturnInspection({
    orderId: order._id,
    staffId: staffUser?._id,
    returnedAt: new Date(),
    lateDays,
    latePenaltyFee,
    itemsCondition,
    totalDeduction,
    initialDeposit: order.totalDeposit,
    finalRefundAmount,
    isRefunded: false,
  });

  await inspection.save();

  // Cập nhật trạng thái đơn
  order.status = 'returned';
  order.actualReturnDate = new Date();
  await order.save();

  return { order, inspection };
};

/**
 * Lấy biên bản kiểm định của một đơn thuê
 * @param {string} orderId
 */
export const getReturnInspection = async (orderId) => {
  const inspection = await ReturnInspection.findOne({ orderId }).lean();
  if (!inspection) return null;
  return inspection;
};

