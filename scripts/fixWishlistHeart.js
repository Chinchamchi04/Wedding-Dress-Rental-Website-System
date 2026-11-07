import fs from 'fs';

let content = fs.readFileSync('frontend/src/pages/customer/CollectionPage.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Update handleToggleWishlist
const oldHandler = `  // Toggle Wishlist
  const handleToggleWishlist = (id) => {
    const result = toggleWishlist(id);
    showToast(
      result.isAdded
        ? 'Đã thêm váy vào danh sách yêu thích'
        : 'Đã xóa váy khỏi danh sách yêu thích'
    );
  };`;

const newHandler = `  // Toggle Wishlist
  const handleToggleWishlist = (id) => {
    const result = toggleWishlist(id);
    setWishlistIds(getWishlistIds());
    showToast(
      result.isAdded
        ? 'Đã thêm váy vào danh sách yêu thích ♥'
        : 'Đã xóa váy khỏi danh sách yêu thích'
    );
  };`;

if (content.includes(oldHandler)) {
  content = content.replace(oldHandler, newHandler);
  console.log('Updated handleToggleWishlist in CollectionPage.jsx');
} else {
  console.warn('Could not find handleToggleWishlist');
}

// 2. Update isWishlisted and Heart button in CollectionPage.jsx
const oldButton = `                  {paginatedProducts.map((dress) => {
                    const isWishlisted = Boolean(
                      Array.isArray(wishlistIds) &&
                      wishlistIds.some((w) => (typeof w === 'object' ? w?.id : w) == dress.id)
                    );

                    return (
                      <div
                        key={dress.id}
                        onClick={() => navigate(\`/dresses/\${dress.id}\`)}
                        className="bg-white border border-[#EEDECF] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_rgba(201,138,144,0.06)] hover:shadow-[0px_12px_32px_rgba(184,115,125,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      >
                        {/* Hình ảnh & Badges */}
                        <div className="relative w-full h-[380px] bg-[#FCEEE9] overflow-hidden rounded-t-[23px]">
                          <img
                            src={dress.image}
                            alt={dress.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Left Badges */}
                          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                            <span className="px-2.5 py-1 rounded-[6px] bg-white text-[#2C2523] font-jakarta font-bold text-[9px] tracking-[0.8px] shadow-xs">
                              {dress.badgeMain}
                            </span>
                            {dress.badgeSub && (
                              <span className="px-2.5 py-1 rounded-[6px] bg-[#BA7A83] text-white font-jakarta font-semibold text-[9px] tracking-wide shadow-xs">
                                {dress.badgeSub}
                              </span>
                            )}
                          </div>

                          {/* Right Heart Wishlist Button - Chỉ hiển thị khi đã đăng nhập */}
                          {isLoggedIn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(dress.id);
                              }}
                              className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-[8px] bg-white flex items-center justify-center text-[#4A3E3F] hover:text-[#BA7A83] border border-[#EEDECF] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] cursor-pointer z-10 transition-transform active:scale-90 p-0"
                              style={{ borderRadius: '8px' }}
                              title="Yêu thích"
                            >
                              <Heart
                                className={\`w-4 h-4 transition-colors \${
                                  isWishlisted ? 'fill-[#BA7A83] text-[#BA7A83]' : 'text-[#4A3E3F]'
                                }\`}
                              />
                            </button>
                          )}`;

const newButton = `                  {paginatedProducts.map((dress) => {
                    const isWishlisted = Boolean(
                      Array.isArray(wishlistIds) &&
                      wishlistIds.some((w) => {
                        const wId = typeof w === 'object' && w !== null ? w?.id : w;
                        return String(wId) === String(dress.id) || (dress.code && String(wId) === String(dress.code));
                      })
                    );

                    return (
                      <div
                        key={dress.id}
                        onClick={() => navigate(\`/dresses/\${dress.id}\`)}
                        className="bg-white border border-[#EEDECF] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_rgba(201,138,144,0.06)] hover:shadow-[0px_12px_32px_rgba(184,115,125,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      >
                        {/* Hình ảnh & Badges */}
                        <div className="relative w-full h-[380px] bg-[#FCEEE9] overflow-hidden rounded-t-[23px]">
                          <img
                            src={dress.image}
                            alt={dress.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Left Badges */}
                          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                            <span className="px-2.5 py-1 rounded-[6px] bg-white text-[#2C2523] font-jakarta font-bold text-[9px] tracking-[0.8px] shadow-xs">
                              {dress.badgeMain}
                            </span>
                            {dress.badgeSub && (
                              <span className="px-2.5 py-1 rounded-[6px] bg-[#BA7A83] text-white font-jakarta font-semibold text-[9px] tracking-wide shadow-xs">
                                {dress.badgeSub}
                              </span>
                            )}
                          </div>

                          {/* Right Heart Wishlist Button - Chỉ hiển thị khi đã đăng nhập */}
                          {isLoggedIn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(dress.id);
                              }}
                              className={\`absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-[8px] bg-white flex items-center justify-center border shadow-[0px_2px_8px_rgba(0,0,0,0.06)] cursor-pointer z-10 transition-all duration-200 active:scale-90 p-0 \${
                                isWishlisted
                                  ? 'border-red-200 bg-red-50/70 text-red-500'
                                  : 'border-[#EEDECF] text-[#4A3E3F] hover:text-red-500 hover:border-red-200'
                              }\`}
                              style={{ borderRadius: '8px' }}
                              title={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                            >
                              <Heart
                                className={\`w-4 h-4 transition-all duration-200 \${
                                  isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-[#4A3E3F]'
                                }\`}
                              />
                            </button>
                          )}`;

if (content.includes(oldButton)) {
  content = content.replace(oldButton, newButton);
  console.log('Updated Heart button in CollectionPage.jsx');
} else {
  console.warn('Could not find oldButton in CollectionPage.jsx');
}

fs.writeFileSync('frontend/src/pages/customer/CollectionPage.jsx', content, 'utf8');
console.log('CollectionPage.jsx updated successfully.');

