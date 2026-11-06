import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Heart, LockKeyhole, Minus, Phone, Plus, ShieldCheck, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { CART_EVENT, addToCart, clearCart, getCart, refreshCartWithDresses, removeFromCart, resolveCartItem, updateCartDays } from '../../services/cartService';
import { getWishlistIds, toggleWishlist, WISHLIST_EVENT } from '../../services/wishlistService';
import { getDressesFromApi } from '../../services/dressApiService';
import logoEmblemImg from '../../assets/logo_emblem.png';
import './CartPage.css';

import { formatCurrencyVND } from '../../utils/formatCurrency';
const money = (amount) => formatCurrencyVND(amount);

function CartItem({ item, onUpdate, onRemove, onWishlist, isWishlisted }) {
  const days = Math.max(1, Number(item.days || 1)); const total = Number(item.price || 0) * days;
  const ProductImage = item.detailHref === null ? 'div' : Link;
  return (
    <article className="cart-product">
      <ProductImage className="cart-product-image" {...(item.detailHref === null ? {} : { to: item.detailHref || `/dresses/${item.id}`, 'aria-label': `Xem ${item.name}` })}>
        <img src={item.image} alt={item.name} />
        {item.code && <span>{item.code}</span>}
        <div style={{ position: 'absolute', bottom: '6px', right: '6px', zIndex: 10, pointerEvents: 'none', userSelect: 'none' }} title="UniBridal Haute Couture">
          <img src={logoEmblemImg} alt="UniBridal Emblem" style={{ width: '30px', height: '30px', objectFit: 'contain', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))' }} />
        </div>
      </ProductImage>
      <div className="cart-product-body">
        <div className="cart-product-heading">
          <div>
            <span className="cart-eyebrow">{item.collection || 'HAUTE COUTURE'}</span>
            <h3>{item.detailHref === null ? item.name : <Link to={item.detailHref || `/dresses/${item.id}`}>{item.name}</Link>}</h3>
          </div>
          <div className="cart-product-price"><strong>{item.unavailable ? 'Cần kiểm tra' : money(total)}</strong><small>{days} ngày x {money(item.price)}</small></div>
        </div>
        <div className="cart-tags"><span>✦ Size {item.size || 'Theo tư vấn'}</span>{item.fabric && <span>✦ {item.fabric}</span>}{item.style && <span>{item.style}</span>}{item.unavailable && <span>Mẫu không còn trong danh sách hiện có</span>}</div>
        <div className="cart-schedule">
          <p><CalendarDays size={13} /> Lịch thử và thời gian thuê sẽ được xác nhận khi đặt váy.</p>
          <small>Tiền cọc theo giá niêm yết: {money(item.deposit)}</small>
        </div>
        <div className="cart-product-notes">
          <span><CheckCircle2 size={13} /> Tình trạng váy được cập nhật từ hệ thống.</span>
          <span><CheckCircle2 size={13} /> Giá cuối cùng được xác nhận trước khi đặt thuê.</span>
        </div>
        <div className="cart-product-bottom">
          <div className="cart-days"><span>Thời gian thuê dự kiến:</span><div className="cart-stepper"><button type="button" onClick={() => onUpdate(item.id, item.days - 1)} disabled={item.days <= 1} aria-label={`Giảm ngày thuê ${item.name}`}><Minus size={13} /></button><strong>{item.days} Ngày</strong><button type="button" onClick={() => onUpdate(item.id, item.days + 1)} disabled={item.days >= 14} aria-label={`Tăng ngày thuê ${item.name}`}><Plus size={13} /></button></div><em>Giá theo số ngày xác nhận sau tư vấn</em></div>
          <div className="cart-item-actions"><button type="button" aria-pressed={isWishlisted} onClick={() => onWishlist(item)}><Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} /> {isWishlisted ? 'Đã lưu yêu thích' : 'Lưu yêu thích'}</button><button type="button" className="cart-remove" onClick={() => onRemove(item.id)}><Trash2 size={14} /> Xóa</button></div>
        </div>
      </div>
    </article>
  );
}

function ConsultationDialog({ selectedProduct, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="cart-dialog-backdrop" onMouseDown={onClose}>
      <section className="cart-dialog" role="dialog" aria-modal="true" aria-labelledby="cart-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="cart-dialog-close" type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        <span className="cart-eyebrow">UNI BRIDAL PRIVATE ATELIER</span>
        <h2 id="cart-dialog-title">Tư Vấn Đặt Thuê</h2>
        {selectedProduct && <p className="cart-dialog-product">Nàng đang quan tâm: <strong>{selectedProduct.name}</strong></p>}
        <p>Giỏ hàng được lưu trên thiết bị này; giá và tình trạng mẫu được cập nhật từ hệ thống. Để xác nhận lịch thử váy, nàng vui lòng liên hệ atelier.</p>
        <a className="cart-dialog-call" href="tel:18008998"><Phone size={18} /> Gọi 1800 8998</a>
        <p className="cart-dialog-note">Chưa có yêu cầu đặt lịch hay đơn thuê nào được gửi. Chưa phát sinh thanh toán.</p>
      </section>
    </div>
  );
}

export default function CartPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [storedItems, setStoredItems] = useState(getCart);
  const [wishlistIds, setWishlistIds] = useState(getWishlistIds);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    getDressesFromApi().then((dresses) => {
      if (!active) return;
      refreshCartWithDresses(dresses);
      setCatalog(dresses);
      setRecommendations(dresses.filter((dress) => dress.status === 'available').slice(0, 3).map((dress) => ({ ...dress, price: dress.rentPrice, deposit: dress.depositAmount, collection: dress.collectionTag, size: dress.sizes?.join(' / ') || 'Theo tư vấn', style: dress.code, detailHref: `/dresses/${dress.id}` })));
    }).catch((issue) => { if (active) setCatalogError(issue.message || 'Không cập nhật được giá váy. Vui lòng tải lại.'); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);
  const items = useMemo(() => storedItems.map(resolveCartItem), [storedItems]);
  const rentalFee = items.reduce((sum, item) => sum + (item.unavailable ? 0 : Number(item.price || 0) * Math.max(1, Number(item.days || 1))), 0);
  const deposit = items.reduce((sum, item) => sum + (item.unavailable ? 0 : Number(item.deposit || 0)), 0);
  const hasUnavailable = items.some((item) => item.unavailable);

  useEffect(() => {
    const refresh = () => setStoredItems(getCart());
    const refreshStorage = () => { refresh(); setWishlistIds(getWishlistIds()); };
    const refreshWishlist = () => setWishlistIds(getWishlistIds());
    window.addEventListener(WISHLIST_EVENT, refreshWishlist);
    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener('storage', refreshStorage);
    return () => { window.removeEventListener(WISHLIST_EVENT, refreshWishlist); window.removeEventListener(CART_EVENT, refresh); window.removeEventListener('storage', refreshStorage); };
  }, []);

  const showMessage = (text) => { setMessage(text); window.setTimeout(() => setMessage(''), 3200); };
  const handleAdd = (dress) => showMessage(addToCart(dress) ? `Đã thêm ${dress.name} vào giỏ thuê váy.` : `${dress.name} đã có trong giỏ thuê váy.`);
  const wishlistKey = (dress) => {
    const legacyId = Number(/(?:UB|WDR)-(\d+)/.exec(dress.code || '')?.[1]);
    return wishlistIds.find((id) => String(id) === String(dress.id) || Number(id) === legacyId) ?? dress.id;
  };
  const wishlist = catalog.filter((dress) => wishlistIds.some((id) => String(id) === String(wishlistKey(dress))));
  const handleWishlist = (dress) => {
    const result = toggleWishlist(wishlistKey(dress));
    setWishlistIds(result.items);
    showMessage(result.isAdded ? `Đã lưu ${dress.name} vào danh sách yêu thích.` : `Đã bỏ ${dress.name} khỏi danh sách yêu thích.`);
  };
  const isWishlisted = (id) => {
    const dress = catalog.find((item) => String(item.id) === String(id)) || items.find((item) => String(item.id) === String(id)) || {id};
    return wishlistIds.some((value) => String(value) === String(wishlistKey(dress)));
  };
  // One order uses a single rental window; selected days must agree across items.
  const selectedDays = [...new Set(items.map((item) => Math.max(1, Number(item.days || 1))))];
  const mismatchedDays = selectedDays.length > 1;
  const checkoutBlocked = !items.length || hasUnavailable || catalogLoading || !!catalogError || mismatchedDays;
  const handleRent = (dress) => { addToCart(dress); setSelectedProduct(dress); setIsConsultationOpen(true); };
  const handleClearCart = () => { if (!items || items.length === 0) return; clearCart(); setStoredItems([]); showMessage("Đã xóa tất cả sản phẩm khỏi giỏ thuê váy."); };

  return (
    <div className="cart-page">
      <Header onOpenBooking={() => { setSelectedProduct(null); setIsConsultationOpen(true); }} />
      <main>
        <section className="cart-hero" aria-labelledby="cart-title">
          <span className="cart-hero-label"><Sparkles size={13} /> THUÊ VÁY CƯỚI CAO CẤP</span>
          <h1 id="cart-title">Giỏ Hàng Của Nàng</h1>
          <p>Lưu giữ những tác phẩm Haute Couture hoàn mỹ cho khoảnh khắc bước vào lễ đường vĩnh cửu.</p>
          <span className="cart-hero-rule" />
        </section>

        {catalogError && <p role="alert" className="mb-4 text-sm text-red-700">{catalogError}</p>}
        {mismatchedDays && <p role="alert" className="mb-4 text-sm text-amber-800">Các váy trong cùng đơn cần chọn cùng số ngày thuê. Vui lòng điều chỉnh trước khi đặt thuê.</p>}
        <div className="cart-content">
          <section className="cart-saved" aria-labelledby="cart-saved-title">
            <div className="cart-section-bar"><div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}><h2 id="cart-saved-title">Tác phẩm trong giỏ thuê {items.length > 0 ? `(${items.length})` : ""}</h2>{items.length > 0 && (<button type="button" onClick={handleClearCart} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "999px", backgroundColor: "#fff", border: "1px solid #e0bcbc", color: "#b84f58", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fff0f0"; e.currentTarget.style.color = "#963740"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#b84f58"; }} title="Xóa tất cả sản phẩm khỏi giỏ thuê"><Trash2 size={13} /><span>Xóa tất cả</span></button>)}</div><span><LockKeyhole size={13} /> Lịch thuê được xác nhận sau khi tư vấn</span></div>
            {items.length ? <div className="cart-items">{items.map((item) => <CartItem key={item.id} item={item} onUpdate={updateCartDays} onRemove={removeFromCart} onWishlist={handleWishlist} isWishlisted={isWishlisted(item.id)} />)}</div> : <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1.3} /><h3>Giỏ thuê của nàng đang trống</h3><p>Khám phá những tuyệt tác được tuyển chọn dành riêng cho ngày trọng đại.</p><Link to="/collection">Khám phá bộ sưu tập <ArrowRight size={16} /></Link></div>}
            {wishlist.length > 0 && <div className="cart-wishlist" id="cart-wishlist"><h3><Heart size={17} fill="currentColor" /> Danh sách yêu thích ({wishlist.length})</h3><div>{wishlist.map((dress) => <div className="cart-wishlist-item" key={dress.id}><img src={dress.image} alt="" /><span>{dress.name}</span><button type="button" onClick={() => handleWishlist(dress)} aria-label={`Bỏ ${dress.name} khỏi yêu thích`}><X size={16} /></button></div>)}</div></div>}
          </section>

          <aside className="cart-aside" aria-label="Tóm tắt đơn thuê">
            <div className="cart-summary">
              <span className="cart-eyebrow">TÓM TẮT ĐƠN THUÊ & ĐẶT CỌC</span>
              <h2>Chi Phí Tạm Tính</h2>
              <div className="cart-summary-line"><span>Tổng phí thuê váy ({items.length} tác phẩm)</span><strong>{money(rentalFee)}</strong></div>
              <div className="cart-summary-line"><span>Phí giao nhận</span><strong className="cart-rose">Xác nhận sau</strong></div>
              <div className="cart-summary-subtotal"><span>Thành tiền thuê lễ phục:</span><strong>{money(rentalFee)}</strong></div>
              <div className="cart-deposit"><div><ShieldCheck size={15} /><strong>Tiền cọc theo giá niêm yết:</strong><b>{money(deposit)}</b></div><p>Điều kiện hoàn cọc sẽ được xác nhận trong đơn thuê và hợp đồng.</p></div>
              <Link
                to={`/checkout?days=${selectedDays[0] || 1}`}
                aria-disabled={checkoutBlocked}
                tabIndex={checkoutBlocked ? -1 : 0}
                onClick={(event) => { if (checkoutBlocked) event.preventDefault(); }}
                className={`cart-checkout ${checkoutBlocked ? 'opacity-50 pointer-events-none' : ''}`}
              >
                TIẾN HÀNH ĐẶT THUÊ & KÝ HỢP ĐỒNG <ArrowRight size={16} />
              </Link>
              <p className="cart-checkout-note">Xác thực số đo, chính sách đặt cọc và hợp đồng bảo chứng số.</p>
              <Link className="cart-continue" to="/collection">TIẾP TỤC KHÁM PHÁ BỘ SƯU TẬP</Link>
            </div>
            <div className="cart-promises"><h2><ShieldCheck size={19} /> CAM KẾT ĐỘC QUYỀN</h2><ul><li><strong>Hoàn cọc từ 100%</strong><span>Giải ngân tự động qua ngân hàng trong vòng 2 giờ sau khi kiểm tra lễ phục.</span></li><li><strong>Hợp đồng điện tử ký số</strong><span>Minh bạch điều khoản, bảo vệ toàn diện quyền lợi và số đo của cô dâu.</span></li><li><strong>Bảo hiểm lỗi sợi & hạt đính</strong><span>Miễn trừ trách nhiệm với các vết dơ thông thường và hạt rơi nhẹ khi khiêu vũ.</span></li><li><strong>Đổi dáng váy miễn phí</strong><span>Được chuyển đổi mẫu váy khác cùng phân khúc trước ngày cưới 15 ngày.</span></li></ul><p>Cần hỗ trợ lựa chọn? <a href="tel:18008998"><Phone size={13} /> Hotline 1800 8998 (24/7)</a></p></div>
          </aside>
        </div>

        <section className="cart-recommendations" aria-labelledby="cart-recommend-title"><div className="cart-recommend-head"><div><span className="cart-eyebrow">RECOMMENDED FOR YOU</span><h2 id="cart-recommend-title">Có Thể Nàng Cũng Yêu Thích</h2><p>Ba mẫu váy hiện có trong bộ sưu tập UniBridal.</p></div><Link to="/collection">KHÁM PHÁ THÊM <ArrowRight size={15} /></Link></div><div className="cart-recommend-grid">{recommendations.map((dress) => <article className="cart-recommend-card" key={dress.id}><div className="cart-recommend-image"><div><img src={dress.image} alt={dress.name} /></div><div style={{ position: 'absolute', bottom: '10px', right: '12px', zIndex: 10, pointerEvents: 'none', userSelect: 'none' }} title="UniBridal Haute Couture"><img src={logoEmblemImg} alt="UniBridal Emblem" style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))' }} /></div><span>{dress.collection}</span><button type="button" aria-label={`${isWishlisted(dress.id) ? 'Bỏ' : 'Lưu'} ${dress.name} ${isWishlisted(dress.id) ? 'khỏi' : 'vào'} yêu thích`} aria-pressed={isWishlisted(dress.id)} onClick={() => handleWishlist(dress)}><Heart size={19} fill={isWishlisted(dress.id) ? 'currentColor' : 'none'} /></button></div><div className="cart-recommend-body"><div className="cart-recommend-meta"><span>{dress.style}</span><span>✦ SIZE {dress.size}</span></div><h3>{dress.name}</h3><p>Mẫu váy đang có trong bộ sưu tập UniBridal.</p><div className="cart-recommend-price"><strong>{money(dress.price)}</strong><span>/ giá niêm yết</span></div><div className="cart-recommend-actions"><button type="button" onClick={() => handleAdd(dress)}><ShoppingBag size={14} /> Thêm Vào Giỏ</button><button type="button" onClick={() => handleRent(dress)}>Liên hệ thuê</button></div></div></article>)}</div></section>
      </main>
      <Footer />
      {message && <div className="cart-toast" role="status">{message}</div>}
      {isConsultationOpen && <ConsultationDialog selectedProduct={selectedProduct} onClose={() => setIsConsultationOpen(false)} />}
    </div>
  );
}
