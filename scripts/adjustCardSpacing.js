import fs from 'fs';

let content = fs.readFileSync('frontend/src/pages/customer/CollectionPage.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldDetails = `                        {/* Thông Tin Chi Tiết Thẻ */}
                        <div className="p-5 flex flex-col flex-1 justify-between">
                          <div>
                            {/* Rating & Size Row */}
                            <div className="flex items-center justify-between text-[11.5px] font-jakarta mb-2.5">
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

                            {/* Tên Thiết Kế */}
                            <h3 className="font-playfair text-[22px] sm:text-[23px] font-semibold text-[#2C2523] group-hover:text-[#BA7A83] transition-colors leading-[1.25] tracking-tight mb-4 min-h-[58px] flex items-center">
                              {dress.name}
                            </h3>
                          </div>

                          {/* Giá Thuê & Tiền Cọc */}
                          <div className="pt-2">
                            <div className="flex items-baseline gap-1.5 mb-1.5">
                              <span className="font-playfair font-bold text-[28px] sm:text-[30px] leading-tight text-[#BA7A83] tracking-tight">
                                {formatCurrencyVND(dress.priceNumber || dress.price)}
                              </span>
                              <span className="font-jakarta text-[12px] font-medium text-[#695C4E] ml-1">
                                / 1 ngày
                              </span>
                            </div>

                            <p className="font-jakarta text-[11.5px] leading-[18px] text-[#695C4E] mb-4 m-0">
                              Tiền cọc bảo lãnh: <strong className="font-semibold text-[#2C2523]">{formatCurrencyVND(dress.depositAmount)}</strong>
                              <br />
                              <span className="text-[#7A6B6C]">{dress.depositPolicy || '(Hoàn cọc tức thì)'}</span>
                            </p>

                            {/* Nút Bấm: Thêm Vào Giỏ & Thuê Ngay (Chỉ hiện nút Giỏ Hàng khi đã đăng nhập) */}
                            {isLoggedIn ? (
                              <div className="grid grid-cols-2 gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-white border border-[#BA7A83] text-[#BA7A83] font-jakarta text-[12.5px] font-semibold tracking-wide hover:bg-[#FFF9F6] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                                >
                                  Thêm Vào Giỏ
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRentNow(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98]"
                                >
                                  Thuê Ngay
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRentNow(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98]"
                                >
                                  Thuê Ngay
                                </button>
                              </div>
                            )}

                          </div>
                        </div>`;

const newDetails = `                        {/* Thông Tin Chi Tiết Thẻ */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Rating & Size Row */}
                          <div className="flex items-center justify-between text-[11.5px] font-jakarta mb-1.5">
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

                          {/* Tên Thiết Kế - Khoảng cách vừa phải, gọn gàng và tinh tế */}
                          <h3 className="font-playfair text-[21px] sm:text-[22px] font-semibold text-[#2C2523] group-hover:text-[#BA7A83] transition-colors leading-[1.25] tracking-tight mb-2 min-h-[46px] line-clamp-2">
                            {dress.name}
                          </h3>

                          {/* Giá Thuê & Tiền Cọc - Đặt sát tự nhiên ngay dưới tên sản phẩm */}
                          <div className="mb-3.5">
                            <div className="flex items-baseline gap-1.5 mb-1">
                              <span className="font-playfair font-bold text-[26px] sm:text-[28px] leading-tight text-[#BA7A83] tracking-tight">
                                {formatCurrencyVND(dress.priceNumber || dress.price)}
                              </span>
                              <span className="font-jakarta text-[12px] font-medium text-[#695C4E] ml-1">
                                / 1 ngày
                              </span>
                            </div>

                            <p className="font-jakarta text-[11.5px] leading-[17px] text-[#695C4E] m-0">
                              Tiền cọc bảo lãnh: <strong className="font-semibold text-[#2C2523]">{formatCurrencyVND(dress.depositAmount)}</strong>
                              <br />
                              <span className="text-[#7A6B6C]">{dress.depositPolicy || '(Hoàn cọc tức thì)'}</span>
                            </p>
                          </div>

                          {/* Nút Bấm: Thêm Vào Giỏ & Thuê Ngay (Đẩy sát đáy card với mt-auto) */}
                          <div className="mt-auto pt-1">
                            {isLoggedIn ? (
                              <div className="grid grid-cols-2 gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-white border border-[#BA7A83] text-[#BA7A83] font-jakarta text-[12.5px] font-semibold tracking-wide hover:bg-[#FFF9F6] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                                >
                                  Thêm Vào Giỏ
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRentNow(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98]"
                                >
                                  Thuê Ngay
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRentNow(dress);
                                  }}
                                  className="w-full py-2.5 rounded-[10px] bg-[#804E55] hover:bg-[#6D3940] text-white font-jakarta text-[12.5px] font-semibold tracking-wide transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98]"
                                >
                                  Thuê Ngay
                                </button>
                              </div>
                            )}
                          </div>
                        </div>`;

if (content.includes(oldDetails)) {
  content = content.replace(oldDetails, newDetails);
  fs.writeFileSync('frontend/src/pages/customer/CollectionPage.jsx', content, 'utf8');
  console.log('Successfully updated card spacing in CollectionPage.jsx');
} else {
  console.warn('Could not find oldDetails in CollectionPage.jsx');
}

