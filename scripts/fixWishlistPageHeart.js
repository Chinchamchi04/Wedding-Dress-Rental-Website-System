import fs from 'fs';

let c = fs.readFileSync('frontend/src/pages/customer/WishlistPage.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRecommended(recDress);
                        }}
                        className="absolute top-2.5 right-2.5 w-[32px] h-[32px] rounded-[8px] bg-white flex items-center justify-center border border-[#EEDECF] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] cursor-pointer z-10 transition-transform active:scale-90 p-0"
                        title={isSaved ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <Heart
                          className={\`w-3.5 h-3.5 transition-colors \${
                            isSaved
                              ? 'fill-[#804E55] text-[#804E55]'
                              : 'text-[#4A3E3F] hover:text-[#804E55]'
                          }\`}
                        />
                      </button>`;

const newBlock = `                      <button
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
                      </button>`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync('frontend/src/pages/customer/WishlistPage.jsx', c, 'utf8');
  console.log('Successfully updated WishlistPage.jsx');
} else {
  console.warn('Target block not found in WishlistPage.jsx');
}

