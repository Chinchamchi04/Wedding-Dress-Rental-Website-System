import fs from 'fs';

let content = fs.readFileSync('frontend/src/components/home/TrendingCollection.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldBlock = `          {items.map((item, index) => {
            const isWishlisted = Boolean(
              Array.isArray(wishlistedIds) &&
              wishlistedIds.some((w) => {
                const wId = typeof w === 'object' && w !== null ? w?.id : w;
                return String(wId) === String(item.id) || Number(wId) === Number(item.id);
              })
            );
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.slug || item.id)}
                className="bg-white border border-[#EFE5E2] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_rgba(44,37,35,0.03)] hover:shadow-[0px_12px_32px_rgba(44,37,35,0.07)] transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-[370px] sm:h-[390px] bg-[#FCEEE9] overflow-hidden rounded-t-[23px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      const fallback = products[index]?.image || card1Img;
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Left Badge */}
                  {item.badgeSub && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="h-[32px] px-3.5 rounded-full bg-[#FDF2F0] border border-[#F7D8D4] text-[#B26B74] font-jakarta font-medium text-[11.5px] tracking-normal shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-center">
                        {item.badgeSub}
                      </span>
                    </div>
                  )}

                  {/* Right Heart Button - Chỉ hiển thị khi đã đăng nhập */}
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) {
                          onToggleWishlist(item.id);
                        } else {
                          toggleWishlist(item.id);
                        }
                      }}
                      className="absolute top-4 right-4 w-[36px] h-[36px] rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#4A3E3D] hover:text-[#B26B74] border-0 cursor-pointer z-10 transition-transform hover:scale-105 active:scale-90 p-0"
                      title="Yêu thích"
                      aria-label="Yêu thích"
                    >
                      <Heart
                        className={\`w-[17px] h-[17px] \${isWishlisted ? 'fill-[#B26B74] text-[#B26B74]' : 'text-[#4A3E3D]'}\`}
                        strokeWidth={1.65}
                      />
                    </button>
                  )}
                </div>`;

const newBlock = `          {items.map((item, index) => {
            const isWishlisted = Boolean(
              Array.isArray(wishlistedIds) &&
              wishlistedIds.some((w) => {
                const wId = typeof w === 'object' && w !== null ? w?.id : w;
                return String(wId) === String(item.id) || (item.code && String(wId) === String(item.code));
              })
            );
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.slug || item.id)}
                className="bg-white border border-[#EFE5E2] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_rgba(44,37,35,0.03)] hover:shadow-[0px_12px_32px_rgba(44,37,35,0.07)] transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative w-full h-[370px] sm:h-[390px] bg-[#FCEEE9] overflow-hidden rounded-t-[23px]">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      const fallback = products[index]?.image || card1Img;
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Left Badge */}
                  {item.badgeSub && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="h-[32px] px-3.5 rounded-full bg-[#FDF2F0] border border-[#F7D8D4] text-[#B26B74] font-jakarta font-medium text-[11.5px] tracking-normal shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-center">
                        {item.badgeSub}
                      </span>
                    </div>
                  )}

                  {/* Right Heart Button - Chỉ hiển thị khi đã đăng nhập */}
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) {
                          onToggleWishlist(item.id);
                        } else {
                          toggleWishlist(item.id);
                          setInternalWishlistIds(getWishlistIds());
                        }
                      }}
                      className={\`absolute top-4 right-4 w-[36px] h-[36px] rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center border cursor-pointer z-10 transition-all hover:scale-105 active:scale-90 p-0 \${
                        isWishlisted ? 'border-red-200 bg-red-50/70 text-red-500' : 'border-transparent text-[#4A3E3D] hover:text-red-500'
                      }\`}
                      title={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                      aria-label="Yêu thích"
                    >
                      <Heart
                        className={\`w-[17px] h-[17px] transition-all duration-200 \${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-[#4A3E3D]'}\`}
                        strokeWidth={1.65}
                      />
                    </button>
                  )}
                </div>`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log('Updated TrendingCollection.jsx');
} else {
  console.warn('Could not find oldBlock in TrendingCollection.jsx');
}

fs.writeFileSync('frontend/src/components/home/TrendingCollection.jsx', content, 'utf8');
console.log('TrendingCollection.jsx saved.');

