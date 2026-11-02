import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Tạo đơn thuê váy và ký hợp đồng thành công!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn thuê cá nhân thành công',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn thuê hệ thống thành công',
      data: result.orders,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderByIdOrCode(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết đơn thuê thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn thuê sang "${status}" thành công!`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getDressBookedDates = async (req, res, next) => {
  try {
    const bookedDates = await orderService.getDressBookedDates(req.query.dressId);
    res.status(200).json({
      success: true,
      message: 'Lấy lịch đặt thuê của váy thành công',
      data: bookedDates,
    });
  } catch (error) {
    next(error);
  }
};

export const submitReturnInspection = async (req, res, next) => {
  try {
    const result = await orderService.submitReturnInspection(req.params.id, req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Lập biên bản kiểm định tình trạng váy thành công!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getReturnInspection = async (req, res, next) => {
  try {
    const inspection = await orderService.getReturnInspection(req.params.id);
    res.status(200).json({
      success: true,
      message: inspection ? 'Lấy biên bản kiểm định thành công' : 'Đơn này chưa có biên bản kiểm định',
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
};

export const approveReturnInspection = async (req, res, next) => {
  try {
    const result = await orderService.approveReturnInspection(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Khách hàng đã đồng ý biên bản kiểm định. Hệ thống đã tự động hoàn cọc và hoàn tất đơn hàng!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const disputeReturnInspection = async (req, res, next) => {
  try {
    const result = await orderService.disputeReturnInspection(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Gửi khiếu nại biên bản kiểm định thành công! Chuyên viên showroom sẽ liên hệ giải quyết.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

