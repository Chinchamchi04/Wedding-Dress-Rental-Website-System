import fs from 'fs';

// 1. Update frontend/src/services/wishlistService.js
let wishlistService = fs.readFileSync('frontend/src/services/wishlistService.js', 'utf8').replace(/\r\n/g, '\n');

// Map legacy mock IDs to real collection dresses
const legacyMapSnippet = `const LEGACY_REC_MAP = {
  'rec_01': '6aeb0ad4e1e74eee06062bf7', // Seraphina Feather Romance
  'rec_02': '6aeb0ad4e1e74eee06062c24', // Genevieve French Chantilly
  'rec_03': '6aeb0ad4e1e74eee06062c7e', // Juliette Pure Silk
};`;

if (!wishlistService.includes('LEGACY_REC_MAP')) {
  wishlistService = wishlistService.replace(
    'export const WISHLIST_KEY',
    `${legacyMapSnippet}\n\nexport const WISHLIST_KEY`
  );
}

// Update RECOMMENDED_DRESSES in wishlistService.js to be sourced from DRESS_CATALOG
const newRecDefinition = `// Danh sách mẫu váy gợi ý lấy trực tiếp từ Bộ Sưu Tập 25 tuyệt tác Haute Couture
export const RECOMMENDED_DRESSES = (Array.isArray(DRESS_CATALOG) && DRESS_CATALOG.length >= 4
  ? DRESS_CATALOG.slice(3, 7)
  : DRESS_CATALOG || []
).map((d) => ({
  ...d,
  categoryBadge: d.categoryName ? d.categoryName.toUpperCase() : (d.silhouette || 'VÁY CƯỚI CAO CẤP').toUpperCase(),
  sizeDisplay: d.badgeSub || d.size || (Array.isArray(d.sizes) ? \`SIZE: \${d.sizes.join(' - ')}\` : 'SIZE: S - M'),
  priceFormatted: d.price ? (typeof d.price === 'string' && d.price.includes('₫') ? d.price : formatCurrencyVND(d.price)) : (d.priceNumber ? formatCurrencyVND(d.priceNumber) : '5.200.000₫'),
}));`;

wishlistService = wishlistService.replace(
  /\/\/ Danh sách 3 mẫu váy trong phần "Có Thể Nàng Cũng Yêu Thích"[\s\S]*?export const RECOMMENDED_DRESSES = \[\s*\{[\s\S]*?\}\s*\];/,
  newRecDefinition
);

// In getWishlistDresses, resolve legacy IDs
wishlistService = wishlistService.replace(
  'const strId = String(id);',
  'let strId = String(id);\n    if (LEGACY_REC_MAP[strId]) strId = LEGACY_REC_MAP[strId];'
);

fs.writeFileSync('frontend/src/services/wishlistService.js', wishlistService, 'utf8');
console.log('1. Updated frontend/src/services/wishlistService.js');

// 2. Update frontend/src/pages/customer/WishlistPage.jsx
let wishlistPage = fs.readFileSync('frontend/src/pages/customer/WishlistPage.jsx', 'utf8').replace(/\r\n/g, '\n');

// Update imports
if (!wishlistPage.includes('getAllDresses')) {
  wishlistPage = wishlistPage.replace(
    "import { addToCart } from '../../services/cartService';",
    `import { addToCart } from '../../services/cartService';\nimport { getAllDresses, formatCurrencyVND } from '../../services/dressService';\nimport { DRESS_CATALOG } from '../../data/dressCatalog';\nimport logoEmblemImg from '../../assets/unibridal-emblem.png';`
  );
}

// Add state for collectionDresses and recommendedDresses
const stateTarget = `const [toastMessage, setToastMessage] = useState(null);`;
const stateAddition = `const [toastMessage, setToastMessage] = useState(null);
  const [collectionDresses, setCollectionDresses] = useState(() => DRESS_CATALOG || []);
  const [recommendedDresses, setRecommendedDresses] = useState([]);

  // Lấy toàn bộ danh sách sản phẩm từ Bộ Sưu Tập (API MongoDB + Fallback DRESS_CATALOG)
  useEffect(() => {
    let active = true;
    getAllDresses()
      .then((res) => {
        if (!active) return;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCollectionDresses(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Lấy 4 mẫu từ Bộ Sưu Tập làm sản phẩm gợi ý (ưu tiên các mẫu nàng chưa thêm vào Wishlist)
  useEffect(() => {
    const source = collectionDresses && collectionDresses.length > 0 ? collectionDresses : DRESS_CATALOG;
    const currentWishlist = getWishlistIds();
    const unliked = source.filter(
      (d) => !currentWishlist.some((wId) => String(wId) === String(d.id) || (d.code && String(wId) === String(d.code)))
    );
    const pool = unliked.length >= 4 ? unliked : source;
    setRecommendedDresses(
      pool.slice(0, 4).map((d) => ({
        ...d,
        categoryBadge: d.categoryName ? d.categoryName.toUpperCase() : (d.silhouette || 'VÁY CƯỚI CAO CẤP').toUpperCase(),
        sizeDisplay: d.badgeSub || d.size || (Array.isArray(d.sizes) ? \`SIZE: \${d.sizes.join(' - ')}\` : 'SIZE: S - M'),
        priceFormatted: d.price ? (typeof d.price === 'string' && d.price.includes('₫') ? d.price : formatCurrencyVND(d.price)) : (d.priceNumber ? formatCurrencyVND(d.priceNumber) : '5.200.000₫'),
      }))
    );
  }, [collectionDresses]);`;

if (!wishlistPage.includes('setCollectionDresses')) {
  wishlistPage = wishlistPage.replace(stateTarget, stateAddition);
}

// Update Recommended Section mapping
const oldSectionRegex = /\{RECOMMENDED_DRESSES\.map\(\(recDress\) => \{[\s\S]*?return \(\s*<div[\s\S]*?key=\{recDress\.id\}[\s\S]*?<\/div>\s*\);\s*\}\)\}/;

const newSectionCode = `{recommendedDresses.map((recDress) => {
                const isSaved = wishlistIds.some(
                  (id) => String(id) === String(recDress.id) || (recDress.code && String(id) === String(recDress.code))
                );

                return (
                  <div
                    key={recDress.id}
                    onClick={() => navigate(\`/dresses/\${recDress.id}\`)}
                    className="bg-white border border-[#EEDECF] rounded-[18px] overflow-hidden shadow-[0px_4px_18px_rgba(201,138,144,0.06)] hover:shadow-[0px_10px_26px_rgba(184,115,125,0.13)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    {/* Hình ảnh & Nút Trái Tim */}
                    <div className="relative w-full h-[280px] sm:h-[300px] bg-[#FCEEE9] overflow-hidden rounded-t-[17px]">
                      <img
                        src={recDress.image}
                        alt={recDress.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Watermark Logo UniBridal */}
                      <div className="absolute bottom-2.5 right-2.5 pointer-events-none select-none opacity-85 group-hover:opacity-100 transition-opacity">
                        <img
                          src={logoEmblemImg}
                          alt="UniBridal Emblem"
                          className="w-[34px] h-[34px] object-contain drop-shadow-[0px_2px_4px_rgba(0,0,0,0.3)]"
                        />
                      </div>

                      {/* Nút Trái Tim: Outline nếu chưa thêm, Filled nếu đã thêm */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRecommended(recDress);
                        }}
                        className={\`absolute top-2.5 right-2.5 w-[32px] h-[32px] rounded-[8px] bg-white flex items-center justify-center border shadow-[0px_2px_8px_rgba(0,0,0,0.08)] cursor-pointer z-10 transition-all active:scale-90 p-0 \${
                          isSaved ? 'border-red-200 bg-red-50/70 text-red-500' : 'border-[#EEDECF] text-[#4A3E3F] hover:text-red-500 hover:border-red-200'
                        }\`}
                        title={isSaved ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <Heart
                          className={\`w-3.5 h-3.5 transition-all duration-200 \${
                            isSaved
                              ? 'fill-red-500 text-red-500 scale-110'
                              : 'text-[#4A3E3F]'
                          }\`}
                        />
                      </button>
                    </div>

                    {/* Chi Tiết */}
                    <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                      <div>
                        {/* Dòng Category & Size */}
                        <div className="text-[10px] font-jakarta font-semibold tracking-wider text-[#8A7978] uppercase mb-1 flex items-center justify-between">
                          <span className="truncate max-w-[140px]">{recDress.categoryBadge}</span>
                          <span>•</span>
                          <span className="shrink-0">{recDress.sizeDisplay || recDress.size}</span>
                        </div>

                        {/* Tên Váy */}
                        <h3 className="font-playfair text-[17px] sm:text-[18px] font-semibold text-[#2C2523] group-hover:text-[#BA7A83] transition-colors leading-[1.25] tracking-tight mb-1.5 min-h-[44px] flex items-center">
                          {recDress.name}
                        </h3>

                        {/* Giá Thuê */}
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="font-playfair font-bold text-[20px] sm:text-[22px] leading-tight text-[#804E55] tracking-tight">
                            {recDress.priceFormatted}
                          </span>
                          <span className="font-jakarta text-[11px] font-medium text-[#8A7978]">
                            / ngày
                          </span>
                        </div>
                      </div>

                      {/* 2 Nút Bấm - Chỉ hiện giỏ hàng khi đã đăng nhập */}
                      {isLoggedIn ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(recDress);
                            }}
                            className="w-full py-2 rounded-[8px] bg-white border border-[#804E55]/60 text-[#804E55] font-jakarta text-[11px] font-semibold tracking-wide hover:bg-[#FFF9F6] transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span className="truncate">Thêm Giỏ</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRentNow(recDress);
                            }}
                            className="w-full py-2 rounded-[8px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[11px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98] text-center"
                          >
                            Thuê Ngay
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRentNow(recDress);
                            }}
                            className="w-full py-2 rounded-[8px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[11px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98] text-center"
                          >
                            Thuê Ngay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}`;

wishlistPage = wishlistPage.replace(oldSectionRegex, newSectionCode);

fs.writeFileSync('frontend/src/pages/customer/WishlistPage.jsx', wishlistPage, 'utf8');
console.log('2. Updated frontend/src/pages/customer/WishlistPage.jsx');

