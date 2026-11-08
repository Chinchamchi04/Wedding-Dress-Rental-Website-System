import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Update prices in seed25Dresses.js
let seedContent = fs.readFileSync('backend/src/utils/seed25Dresses.js', 'utf8').replace(/\r\n/g, '\n');

// Update UB-014 (Helena Cathedral Veil) to 15,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-014'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-014',\n    name: 'Helena Cathedral Veil',\n    silhouette: 'Ballgown',\n    categorySlug: 'ballgown',\n    material: 'Đính Kết Pha Lê Swarovski',\n    color: 'Trắng Sữa',\n    rentPrice: 15000000,\n    depositAmount: 35000000`
);

// Update UB-017 (Anastasia Czarina Ballgown) to 24,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-017'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-017',\n    name: 'Anastasia Czarina Ballgown',\n    silhouette: 'Ballgown',\n    categorySlug: 'ballgown',\n    material: 'Ren 3D Floral',\n    color: 'Bạch Kim Hoàng Kim',\n    rentPrice: 24000000,\n    depositAmount: 50000000`
);

// Update UB-013 (Valerie Rose Gold Embellished) to 16,500,000
seedContent = seedContent.replace(
  /code:\s*'UB-013'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-013',\n    name: 'Valerie Rose Gold Embellished',\n    silhouette: 'Mermaid',\n    categorySlug: 'mermaid',\n    material: 'Đính Kết Pha Lê Swarovski',\n    color: 'Rose Gold Ánh Bạc',\n    rentPrice: 16500000,\n    depositAmount: 38000000`
);

// Update UB-016 (Penelope Feathered Train) to 22,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-016'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-016',\n    name: 'Penelope Feathered Train',\n    silhouette: 'Mermaid',\n    categorySlug: 'mermaid',\n    material: 'Lụa Mikado Ý',\n    color: 'Trắng Tinh Khôi',\n    rentPrice: 22000000,\n    depositAmount: 48000000`
);

// Update UB-024 (Guinevere Renaissance Gown) to 12,500,000
seedContent = seedContent.replace(
  /code:\s*'UB-024'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-024',\n    name: 'Guinevere Renaissance Gown',\n    silhouette: 'A-Line',\n    categorySlug: 'a-line',\n    material: 'Satin Tơ Tằm Tự Nhiên',\n    color: 'Trắng Ngà',\n    rentPrice: 12500000,\n    depositAmount: 30000000`
);

// Update UB-023 (Eleanor Sovereign Silk) to 14,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-023'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-023',\n    name: 'Eleanor Sovereign Silk',\n    silhouette: 'Silk Gown',\n    categorySlug: 'silk-gown',\n    material: 'Lụa Mikado Ý',\n    color: 'Trắng Kim Cương',\n    rentPrice: 14000000,\n    depositAmount: 32000000`
);

// Update UB-005 (Aurora Crystal Princess) to 25,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-005'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-005',\n    name: 'Aurora Crystal Princess',\n    silhouette: 'Princess',\n    categorySlug: 'princess',\n    material: 'Đính Kết Pha Lê Swarovski',\n    color: 'Trắng Kim Cương',\n    rentPrice: 25000000,\n    depositAmount: 55000000`
);

// Update UB-011 (Isabella Royal Court) to 18,000,000
seedContent = seedContent.replace(
  /code:\s*'UB-011'[\s\S]*?rentPrice:\s*\d+[\s\S]*?depositAmount:\s*\d+/,
  `code: 'UB-011',\n    name: 'Isabella Royal Court',\n    silhouette: 'Princess',\n    categorySlug: 'princess',\n    material: 'Ren 3D Floral',\n    color: 'Trắng Hoàng Gia',\n    rentPrice: 18000000,\n    depositAmount: 40000000`
);

fs.writeFileSync('backend/src/utils/seed25Dresses.js', seedContent, 'utf8');
console.log('1. Updated backend/src/utils/seed25Dresses.js with calibrated price tiers');

// 2. Update frontend/src/services/dressService.js
let dressService = fs.readFileSync('frontend/src/services/dressService.js', 'utf8').replace(/\r\n/g, '\n');

const oldMappedPattern = /const mapped = rawList\.map\(\(d\) => \(\{[\s\S]*?categoryName: d\.silhouette \|\| 'Ballgown',\s*\}\)\);/;
const newMappedCode = `const mapped = rawList.map((d) => {
      const pNum = typeof d.rentPrice === 'number'
        ? d.rentPrice
        : typeof d.priceNumber === 'number'
        ? d.priceNumber
        : typeof d.price === 'number'
        ? d.price
        : (parseInt(String(d.price || d.rentPrice || '5200000').replace(/\\D/g, ''), 10) || 5200000);

      let pCat = '5-10';
      if (pNum < 5000000) pCat = 'under-5';
      else if (pNum <= 10000000) pCat = '5-10';
      else if (pNum <= 20000000) pCat = '10-20';
      else pCat = 'vip';

      return {
        ...d,
        id: String(d._id || d.id),
        name: d.name,
        rentPrice: pNum,
        priceNumber: pNum,
        price: formatCurrencyVND(pNum),
        depositAmount: d.depositAmount ? (typeof d.depositAmount === 'string' && d.depositAmount.includes('₫') ? d.depositAmount : formatCurrencyVND(d.depositAmount)) : '15.000.000₫',
        priceCategory: pCat,
        image: (d.images && d.images[0]) || d.image || '/assets/dresses/dress_01.jpg',
        badgeMain: d.collectionTag || (pCat === 'vip' ? 'HAUTE COUTURE VIP' : 'HAUTE COUTURE'),
        badgeSub: d.sizes?.length ? \`Size: \${d.sizes.join(' - ')}\` : 'Đủ size',
        size: d.sizes?.length ? \`Size: \${d.sizes.join(' - ')}\` : 'Size: S - M',
        sizes: d.sizes,
        category: (d.silhouette || 'ballgown').toLowerCase().replace(/\\s+/g, '-'),
        categoryName: d.silhouette || 'Ballgown',
      };
    });`;

dressService = dressService.replace(oldMappedPattern, newMappedCode);
fs.writeFileSync('frontend/src/services/dressService.js', dressService, 'utf8');
console.log('2. Updated frontend/src/services/dressService.js');

// 3. Update frontend/src/pages/customer/CollectionPage.jsx
let collectionPage = fs.readFileSync('frontend/src/pages/customer/CollectionPage.jsx', 'utf8').replace(/\r\n/g, '\n');

// Replace price filtering in filteredProducts
const oldPriceFilterPattern = /\/\/ Lọc mức giá \(chỉ áp dụng khi người dùng đã chủ động tương tác hoặc bấm áp dụng bộ lọc\)\s*if \(isFilterApplied && selectedPriceRanges\.length > 0 && !selectedPriceRanges\.includes\(dress\.priceCategory\)\) \{\s*return false;\s*\}/;

const newPriceFilterCode = `// Lọc mức giá thuê theo giá sản phẩm thực tế ở bảng dresses (rentPrice / priceNumber)
      if (selectedPriceRanges.length > 0) {
        const price = typeof dress.rentPrice === 'number'
          ? dress.rentPrice
          : typeof dress.priceNumber === 'number'
          ? dress.priceNumber
          : typeof dress.price === 'number'
          ? dress.price
          : (parseInt(String(dress.price || '0').replace(/\\D/g, ''), 10) || 0);

        const matchesPrice = selectedPriceRanges.some((rangeId) => {
          if (rangeId === 'under-5') return price < 5000000;
          if (rangeId === '5-10') return price >= 5000000 && price <= 10000000;
          if (rangeId === '10-20') return price > 10000000 && price <= 20000000;
          if (rangeId === 'vip') return price > 20000000;
          return false;
        });

        if (!matchesPrice) {
          return false;
        }
      }`;

collectionPage = collectionPage.replace(oldPriceFilterPattern, newPriceFilterCode);

// Update activeFiltersCount
collectionPage = collectionPage.replace(
  '(isFilterApplied ? selectedPriceRanges.length : 0)',
  'selectedPriceRanges.length'
);

// Update active filter pills condition
collectionPage = collectionPage.replace(
  '{isFilterApplied && selectedPriceRanges.map((priceId) => {',
  '{selectedPriceRanges.map((priceId) => {'
);

fs.writeFileSync('frontend/src/pages/customer/CollectionPage.jsx', collectionPage, 'utf8');
console.log('3. Updated frontend/src/pages/customer/CollectionPage.jsx');

