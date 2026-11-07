import fs from 'fs';

let c = fs.readFileSync('frontend/src/pages/customer/DressDetailPage.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldTarget = `                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={\`w-[48px] h-[48px] rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer \${isWishlisted
                      ? 'bg-[#FFF2F0] border-[#70484E] text-[#70484E]'
                      : 'bg-white border-[#D6C7C3] text-[#70484E] hover:border-[#70484E]'
                      }\`}
                    title={isWishlisted ? 'Đã yêu thích' : 'Lưu vào danh sách yêu thích'}
                  >
                    <Heart className={\`w-5 h-5 \${isWishlisted ? 'fill-current' : ''}\`} strokeWidth={1.75} />
                  </button>
                )}`;

const newTarget = `                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={\`w-[48px] h-[48px] rounded-[4px] border flex items-center justify-center transition-all duration-200 cursor-pointer \${isWishlisted
                      ? 'bg-red-50 border-red-300 text-red-500 shadow-xs'
                      : 'bg-white border-[#D6C7C3] text-[#70484E] hover:border-red-300 hover:text-red-500'
                      }\`}
                    title={isWishlisted ? 'Đã yêu thích' : 'Lưu vào danh sách yêu thích'}
                  >
                    <Heart className={\`w-5 h-5 transition-all duration-200 \${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : ''}\`} strokeWidth={1.75} />
                  </button>
                )}`;

if (c.includes(oldTarget)) {
  c = c.replace(oldTarget, newTarget);
  fs.writeFileSync('frontend/src/pages/customer/DressDetailPage.jsx', c, 'utf8');
  console.log('Successfully updated DressDetailPage.jsx');
} else {
  console.warn('Target not found in DressDetailPage.jsx');
}

