import dressService from '../services/dress.service.js';

/**
 * Controller điều phối các yêu cầu liên quan đến áo cưới
 * TUYỆT ĐỐI KHÔNG thực hiện câu lệnh Mongoose trực tiếp trong Controller (theo quy chuẩn AGENTS.md)
 */
class DressController {
  /**
   * [GET] /api/dresses/:id
   * Lấy chi tiết mẫu váy cưới theo ID, Slug hoặc SKU
   */
  async getDressById(req, res) {
    try {
      const { id } = req.params;
      const dress = await dressService.getDressById(id);

      return res.status(200).json({
        success: true,
        message: 'Lấy chi tiết áo cưới thành công',
        data: dress,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy thông tin sản phẩm',
      });
    }
  }

  /**
   * [GET] /api/dresses/:id/related
   * Lấy danh sách mẫu váy gợi ý / tương tự
   */
  async getRelatedDresses(req, res) {
    try {
      const { id } = req.params;
      const limit = req.query.limit || 4;
      const related = await dressService.getRelatedDresses(id, limit);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách váy cưới tương tự thành công',
        data: related,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách sản phẩm liên quan',
      });
    }
  }

  /**
   * [GET] /api/dresses
   * Lấy danh sách áo cưới có lọc và phân trang
   */
  async getDresses(req, res) {
    try {
      const result = await dressService.getDresses(req.query);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách áo cưới thành công',
        data: result.dresses,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi phát sinh từ hệ thống server',
      });
    }
  }
}

export default new DressController();
