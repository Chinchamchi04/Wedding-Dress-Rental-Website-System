import axiosClient from '../api/axiosClient';

// Import hình ảnh asset để đảm bảo hiển thị sắc nét trong bundle của Vite
import card1Elysian from '../assets/card1_elysian.jpg';
import card2Celeste from '../assets/card2_celeste.jpg';
import card3Lumiere from '../assets/card3_lumiere.jpg';
import card4Monet from '../assets/card4_monet.jpg';
import card5Aurora from '../assets/card5_aurora.jpg';
import card6Seraphina from '../assets/card6_seraphina.jpg';
import card7Vivienne from '../assets/card7_vivienne.jpg';
import card8LaceDream from '../assets/card8_lace_dream.jpg';
import card9MannequinAtelier from '../assets/card9_mannequin_atelier.jpg';
import laceDetail from '../assets/lace_detail.jpg';
import heroBride from '../assets/hero_bride.jpg';

const ASSET_MAP = {
  'card1_elysian.jpg': card1Elysian,
  'card2_celeste.jpg': card2Celeste,
  'card3_lumiere.jpg': card3Lumiere,
  'card4_monet.jpg': card4Monet,
  'card5_aurora.jpg': card5Aurora,
  'card6_seraphina.jpg': card6Seraphina,
  'card7_vivienne.jpg': card7Vivienne,
  'card8_lace_dream.jpg': card8LaceDream,
  'card9_mannequin_atelier.jpg': card9MannequinAtelier,
  'lace_detail.jpg': laceDetail,
  'hero_bride.jpg': heroBride,
};

/**
 * Ánh xạ đường dẫn ảnh từ MongoDB sang asset được xử lý bởi Vite
 */
function resolveAsset(pathOrUrl) {
  if (!pathOrUrl) return card1Elysian;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const filename = pathOrUrl.split('/').pop();
  return ASSET_MAP[filename] || pathOrUrl;
}

/**
 * Chuẩn hóa dữ liệu áo cưới nhận từ MongoDB để khớp với UI Component
 */
function normalizeDress(raw) {
  if (!raw) return null;

  const images = (raw.images && raw.images.length > 0)
    ? raw.images.map(resolveAsset)
    : [card1Elysian, laceDetail, card6Seraphina, heroBride];

  const storyAtelier = raw.story?.atelierImage
    ? resolveAsset(raw.story.atelierImage)
    : card9MannequinAtelier;

  const realBrides = (raw.realBrides && raw.realBrides.length > 0)
    ? raw.realBrides.map((rb) => ({
        ...rb,
        image: resolveAsset(rb.image),
      }))
    : [];

  const sizes = (raw.sizes && raw.sizes.length > 0 && typeof raw.sizes[0] === 'string')
    ? [
        { id: 'XS', label: 'XS', note: 'Dưới 46kg', bust: '80-82cm', waist: '58-62cm' },
        { id: 'S', label: 'S', note: '46 - 52kg', bust: '83-86cm', waist: '63-67cm' },
        { id: 'M', label: 'M', note: '52 - 58kg', bust: '87-90cm', waist: '68-73cm' },
        { id: 'L', label: 'L', note: '58 - 65kg', bust: '91-95cm', waist: '74-78cm' },
      ]
    : raw.sizes || [];

  return {
    ...raw,
    id: raw._id || raw.id,
    price: raw.rentPrice || raw.price || 5200000,
    depositAmount: raw.depositAmount || 15000000,
    silhouetteCategory: raw.categoryId?.name || (raw.silhouette ? `Váy Cưới ${raw.silhouette}` : 'Váy Cưới Haute Couture'),
    images,
    colors: raw.colorOptions || [
      { name: raw.color || 'Mặc định', hex: '#F5D6D8', border: '#E8B6BC' },
    ],
    sizes,
    story: raw.story
      ? {
          collection: raw.story.collectionName || raw.collectionTag || 'HAUTE COUTURE',
          title: raw.story.title || raw.name,
          content: raw.story.content || [raw.description],
          atelierImage: storyAtelier,
          stats: raw.story.stats || [
            { value: '420h', label: 'ĐÍNH KẾT THỦ CÔNG' },
            { value: '1.800+', label: 'PHA LÊ SWAROVSKI' },
            { value: '12 Lớp', label: 'LỤA TULLE PHÁP SIÊU NHẸ' },
          ],
        }
      : null,
    realBrides,
  };
}

/**
 * Lấy chi tiết mẫu váy cưới từ MongoDB qua API Backend (/api/dresses/:id)
 */
export async function getDressById(idOrSlug) {
  try {
    const response = await axiosClient.get(`/dresses/${idOrSlug}`);
    if (response?.success && response?.data) {
      return {
        success: true,
        data: normalizeDress(response.data),
        source: 'mongodb',
      };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error('Lỗi khi tải chi tiết áo cưới từ MongoDB:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Lấy danh sách mẫu váy tương tự từ MongoDB qua API Backend (/api/dresses/:id/related)
 */
export async function getRelatedDresses(currentId) {
  try {
    const response = await axiosClient.get(`/dresses/${currentId}/related?limit=4`);
    if (response?.success && Array.isArray(response?.data)) {
      return {
        success: true,
        data: response.data.map(normalizeDress),
        source: 'mongodb',
      };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Lỗi khi lấy mẫu váy liên quan từ MongoDB:', error);
    return { success: false, data: [] };
  }
}

/**
 * Lấy tất cả mẫu váy cưới từ MongoDB qua API Backend (/api/dresses)
 */
export async function getAllDresses(params = {}) {
  try {
    const response = await axiosClient.get('/dresses', { params });
    if (response?.success && Array.isArray(response?.data)) {
      return {
        success: true,
        data: response.data.map(normalizeDress),
        pagination: response.pagination,
        source: 'mongodb',
      };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Lỗi khi tải danh sách áo cưới từ MongoDB:', error);
    return { success: false, data: [] };
  }
}

/**
 * Định dạng tiền tệ VND chuẩn Việt Nam
 */
export function formatCurrencyVND(amount) {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}
