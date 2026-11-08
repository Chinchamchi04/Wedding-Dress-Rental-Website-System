import fs from 'fs';

let content = fs.readFileSync('frontend/src/pages/customer/CollectionPage.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Replace SILHOUETTE_OPTIONS
const oldSil = `// Danh mục Phom Dáng chuẩn Haute Couture đồng bộ 8 danh mục hệ thống
const SILHOUETTE_OPTIONS = [
  { id: 'all', label: 'Tất cả (All)' },
  { id: 'ballgown', label: 'Công Chúa Bồng Xòe (Ballgown)' },
  { id: 'mermaid', label: 'Đuôi Cá Điêu Khắc (Mermaid)' },
  { id: 'a-line', label: 'Chữ A Thanh Lịch (A-line)' },
  { id: 'silk-gown', label: 'Lụa Satin Tối Giản (Silk Gown)' },
  { id: 'princess', label: 'Váy Cưới Hoàng Gia (Princess)' },
  { id: 'traditional', label: 'Áo Dài Cưới Truyền Thống (Traditional)' },
  { id: 'tuxedo', label: 'Vest Cưới & Tuxedo (Tuxedo)' },
];`;

const newSil = `// Danh mục Phom Dáng chuẩn Haute Couture 5 dòng thiết kế chủ đạo
const SILHOUETTE_OPTIONS = [
  { id: 'all', label: 'Tất cả (All)' },
  { id: 'ballgown', label: 'Công Chúa Bồng Xòe (Ballgown)' },
  { id: 'mermaid', label: 'Đuôi Cá Điêu Khắc (Mermaid)' },
  { id: 'a-line', label: 'Chữ A Thanh Lịch (A-line)' },
  { id: 'silk-gown', label: 'Lụa Satin Tối Giản (Silk Gown)' },
  { id: 'princess', label: 'Váy Cưới Hoàng Gia (Princess)' },
];`;

if (content.includes(oldSil)) {
  content = content.replace(oldSil, newSil);
  console.log('Replaced SILHOUETTE_OPTIONS');
} else {
  console.warn('Could not find SILHOUETTE_OPTIONS');
}

// 2. Replace catalogItems load fallback
const oldLoad = `        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCatalogItems(res.data);
          setError('');
        } else if (res?.success === false) {
          setCatalogItems([]);
          setError(res.message || 'Lỗi kết nối cơ sở dữ liệu: Không thể tải sản phẩm từ MongoDB.');
        } else {
          setCatalogItems([]);
          setError('Không có sản phẩm nào trong cơ sở dữ liệu.');
        }`;

const newLoad = `        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCatalogItems(res.data);
          setError('');
        } else {
          setCatalogItems(DRESS_CATALOG);
          setError('');
        }`;

if (content.includes(oldLoad)) {
  content = content.replace(oldLoad, newLoad);
  console.log('Replaced catalogItems load');
} else {
  console.warn('Could not find catalogItems load');
}

// 3. Replace catch fallback
const oldCatch = `      .catch((err) => {
        if (!active) return;
        setCatalogItems([]);
        setError('Lỗi kết nối cơ sở dữ liệu: Không thể kết nối đến máy chủ MongoDB.');
        setLoading(false);
      });`;

const newCatch = `      .catch((err) => {
        if (!active) return;
        setCatalogItems(DRESS_CATALOG);
        setError('');
        setLoading(false);
      });`;

if (content.includes(oldCatch)) {
  content = content.replace(oldCatch, newCatch);
  console.log('Replaced catch fallback');
} else {
  console.warn('Could not find catch fallback');
}

// 4. Replace material filtering
const oldMat = `      // Lọc chất liệu (nếu có chọn)
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(dress.material)) {
        return false;
      }`;

const newMat = `      // Lọc chất liệu (nếu có chọn)
      if (selectedMaterials.length > 0) {
        const matchesMaterial = selectedMaterials.some((mat) => {
          if (!dress.material) return false;
          const dressMat = dress.material.toLowerCase();
          const targetMat = mat.toLowerCase();
          if (dressMat.includes(targetMat)) return true;
          if (targetMat.includes('ren') && (dressMat.includes('ren') || dressMat.includes('lace'))) return true;
          if (targetMat.includes('mikado') && (dressMat.includes('mikado') || dressMat.includes('lụa') || dressMat.includes('silk'))) return true;
          if (targetMat.includes('satin') && (dressMat.includes('satin') || dressMat.includes('tơ tằm'))) return true;
          if (targetMat.includes('swarovski') && (dressMat.includes('swarovski') || dressMat.includes('pha lê') || dressMat.includes('crystal') || dressMat.includes('đính kết'))) return true;
          return false;
        });
        if (!matchesMaterial) {
          return false;
        }
      }`;

if (content.includes(oldMat)) {
  content = content.replace(oldMat, newMat);
  console.log('Replaced material filtering');
} else {
  console.warn('Could not find material filtering');
}

fs.writeFileSync('frontend/src/pages/customer/CollectionPage.jsx', content, 'utf8');
console.log('Done updating CollectionPage.jsx');

