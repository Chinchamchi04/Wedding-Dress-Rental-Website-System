import fs from 'fs';

// 1. Update CollectionPage.jsx
let colContent = fs.readFileSync('frontend/src/pages/customer/CollectionPage.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldColBlock = `                          {/* Rating & Size Row */}
                          <div className="flex items-center justify-between text-[11.5px] font-jakarta mb-1">
                            <div className="flex items-center gap-1.5 text-[#2C2523]">
                              <span className="text-[#C68A4C] text-[13px] leading-none">★</span>
                              <span className="font-bold text-[12px]">{Number(dress.rating || 4.9).toFixed(1)}</span>
                              <span className="text-[#695C4E] font-medium text-[11.5px] ml-0.5">
                                ({dress.rentCount})
                              </span>
                            </div>

                            {dress.id === 6 ? (
                              <div className="text-right leading-tight text-[#514344] font-semibold text-[11px] tracking-wider uppercase">
                                <div>Size: Custom</div>
                                <div className="mt-0.5">Fit</div>
                              </div>
                            ) : (
                              <span className="text-[#514344] font-semibold uppercase tracking-wider text-[11px]">
                                {dress.size}
                              </span>
                            )}
                          </div>

                          {/* Tên Thiết Kế - Khoảng cách gần gọn gàng với Size */}
                          <h3 className="font-playfair text-[21px] sm:text-[22px] font-semibold text-[#2C2523] group-hover:text-[#BA7A83] transition-colors leading-[1.2] tracking-tight mb-2 min-h-[42px] line-clamp-2 mt-0">
                            {dress.name}
                          </h3>`;

const newColBlock = `                          {/* Rating & Size Row */}
                          <div className="flex items-center justify-between text-[11.5px] font-jakarta mb-2">
                            <div className="flex items-center gap-1.5 text-[#2C2523]">
                              <span className="text-[#C68A4C] text-[13px] leading-none">★</span>
                              <span className="font-bold text-[12px]">{Number(dress.rating || 4.9).toFixed(1)}</span>
                              <span className="text-[#695C4E] font-medium text-[11.5px] ml-0.5">
                                ({dress.rentCount})
                              </span>
                            </div>

                            {dress.id === 6 ? (
                              <div className="text-right leading-tight text-[#514344] font-semibold text-[11px] tracking-wider uppercase">
                                <div>Size: Custom</div>
                                <div className="mt-0.5">Fit</div>
                              </div>
                            ) : (
                              <span className="text-[#514344] font-semibold uppercase tracking-wider text-[11px]">
                                {dress.size}
                              </span>
                            )}
                          </div>

                          {/* Tên Thiết Kế - Khoảng cách thoáng đẹp, hài hòa và tinh tế */}
                          <h3 className="font-playfair text-[21px] sm:text-[22px] font-semibold text-[#2C2523] group-hover:text-[#BA7A83] transition-colors leading-[1.25] tracking-tight mb-2.5 min-h-[44px] line-clamp-2 mt-0">
                            {dress.name}
                          </h3>`;

if (colContent.includes(oldColBlock)) {
  colContent = colContent.replace(oldColBlock, newColBlock);
  fs.writeFileSync('frontend/src/pages/customer/CollectionPage.jsx', colContent, 'utf8');
  console.log('CollectionPage.jsx: relaxed size to title spacing.');
} else {
  console.warn('CollectionPage.jsx: block not found.');
}

// 2. Update TrendingCollection.jsx
let trendContent = fs.readFileSync('frontend/src/components/home/TrendingCollection.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldTrendBlock = `                    {/* Rating & Size Row */}
                    <div className="flex items-center justify-between text-[12px] font-jakarta mb-1">
                      <div className="flex items-center gap-1.5 text-[#B26B74]">
                        <span className="font-bold">★ {Number(item.rating || 4.9).toFixed(1)}</span>
                        <span className="text-[#C69098] font-normal">({item.rentCount})</span>
                      </div>
                      <span className="text-[#231A19] font-semibold tracking-wide text-[12.5px]">
                        {item.size}
                      </span>
                    </div>

                    {/* Product Name - Khoảng cách gần gọn với size */}
                    <div className="min-h-[42px] mb-2 flex items-start">
                      <h3 className="font-playfair text-[20px] sm:text-[21px] leading-[24px] font-semibold text-[#231A19] m-0 text-left">
                        {item.name}
                      </h3>
                    </div>`;

const newTrendBlock = `                    {/* Rating & Size Row */}
                    <div className="flex items-center justify-between text-[12px] font-jakarta mb-2">
                      <div className="flex items-center gap-1.5 text-[#B26B74]">
                        <span className="font-bold">★ {Number(item.rating || 4.9).toFixed(1)}</span>
                        <span className="text-[#C69098] font-normal">({item.rentCount})</span>
                      </div>
                      <span className="text-[#231A19] font-semibold tracking-wide text-[12.5px]">
                        {item.size}
                      </span>
                    </div>

                    {/* Product Name - Khoảng cách thoáng đẹp với size */}
                    <div className="min-h-[44px] mb-2.5 flex items-start">
                      <h3 className="font-playfair text-[20px] sm:text-[21px] leading-[25px] font-semibold text-[#231A19] m-0 text-left">
                        {item.name}
                      </h3>
                    </div>`;

if (trendContent.includes(oldTrendBlock)) {
  trendContent = trendContent.replace(oldTrendBlock, newTrendBlock);
  fs.writeFileSync('frontend/src/components/home/TrendingCollection.jsx', trendContent, 'utf8');
  console.log('TrendingCollection.jsx: relaxed size to title spacing.');
} else {
  console.warn('TrendingCollection.jsx: block not found.');
}

