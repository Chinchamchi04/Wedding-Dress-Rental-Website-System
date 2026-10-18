import mongoose from 'mongoose';
import Dress from '../models/Dress.model.js';
import Category from '../models/Category.model.js';

/**
 * Service xử lý toàn bộ logic nghiệp vụ cho mẫu váy cưới (Dress)
 * Tuân thủ quy chuẩn Layered Architecture: 100% logic tương tác với Mongoose Model
 */
class DressService {
  /**
   * Lấy chi tiết một mẫu váy cưới theo ID, Slug hoặc Mã SKU (code)
   */
  async getDressById(identifier) {
    if (!identifier) {
      throw new Error('Vui lòng cung cấp mã hoặc ID váy cưới');
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      // Tìm theo slug hoặc mã SKU (BGW-2026,...) hoặc ID số giả định
      const numberMap = {
        '1': 'elysian-rose-ballgown',
        '2': 'celeste-royal-mermaid',
        '3': 'lumiere-minimal-silk',
        '4': 'monet-3d-floral-couture',
        '5': 'aurora-pearl-sheath',
      };

      const resolvedSlug = numberMap[identifier] || identifier.toLowerCase();
      query = {
        $or: [
          { slug: resolvedSlug },
          { code: identifier.toUpperCase() },
        ],
      };
    }

    const dress = await Dress.findOne(query).populate('categoryId', 'name slug description');

    if (!dress) {
      // Nếu không tìm thấy, lấy mẫu đầu tiên trong MongoDB làm mặc định
      const fallbackDress = await Dress.findOne().populate('categoryId', 'name slug description');
      if (!fallbackDress) {
        throw new Error('Không tìm thấy thông tin váy cưới trong cơ sở dữ liệu');
      }
      return fallbackDress;
    }

    return dress;
  }

  /**
   * Lấy danh sách mẫu váy tương tự / gợi ý
   */
  async getRelatedDresses(currentId, limit = 4) {
    const query = {};
    if (mongoose.Types.ObjectId.isValid(currentId)) {
      query._id = { $ne: currentId };
    } else {
      query.slug = { $ne: currentId };
    }

    const dresses = await Dress.find(query)
      .populate('categoryId', 'name slug')
      .limit(Number(limit))
      .sort({ rentCount: -1, createdAt: -1 });

    return dresses;
  }

  /**
   * Lấy danh sách áo cưới có lọc, tìm kiếm và phân trang
   */
  async getDresses(filters = {}) {
    const { category, silhouette, search, minPrice, maxPrice, status, page = 1, limit = 12 } = filters;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (silhouette) {
      query.silhouette = silhouette;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentPrice.$lte = Number(maxPrice);
    }

    if (category) {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        query.categoryId = foundCategory._id;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [dresses, total] = await Promise.all([
      Dress.find(query)
        .populate('categoryId', 'name slug')
        .sort({ isFeatured: -1, rentCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Dress.countDocuments(query),
    ]);

    return {
      dresses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }
}

export default new DressService();
