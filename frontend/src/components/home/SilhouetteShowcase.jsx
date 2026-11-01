import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import card1Img from '../../assets/card1_elysian.jpg';
import card2Img from '../../assets/card2_celeste.jpg';
import card7Img from '../../assets/card7_vivienne.jpg';
import card3Img from '../../assets/card3_lumiere.jpg';

const silhouettes = [
  {
    id: 'ballgown',
    count: '18 MẪU ĐỘC BẢN',
    title: 'Công Chúa Hoàng Gia',
    description: 'Lộng lẫy, bồng bềnh với cấu trúc siết eo corsetry tôn vinh tỉ lệ vàng.',
    image: '/assets/dresses/dress_01.jpg',
    fallback: card1Img,
  },
  {
    id: 'mermaid',
    count: '14 MẪU ĐỘC BẢN',
    title: 'Đuôi Cá Điêu Khắc',
    description: 'Ôm trọn đường cong quyến rũ với chất liệu ren hoa nổi 3D cao cấp.',
    image: '/assets/dresses/dress_02.jpg',
    fallback: card2Img,
  },
  {
    id: 'a-line',
    count: '22 MẪU ĐỘC BẢN',
    title: 'Chữ A Thanh Lịch',
    description: 'Nhẹ nhàng, bay bổng, hoàn hảo cho tiệc cưới ngoài trời và sảnh tiệc thân mật.',
    image: '/assets/dresses/dress_04.jpg',
    fallback: card7Img,
  },
  {
    id: 'sheath',
    brandBadge: 'UNIBRIDAL',
    count: '12 MẪU ĐỘC BẢN',
    title: 'Satin Lụa Tối Giản',
    description: 'Vẻ đẹp đương đại từ lụa tơ tằm nguyên bản, thuần khiết và sang trọng.',
    image: '/assets/dresses/dress_03.jpg',
    fallback: card3Img,
  },
];

const SilhouetteShowcase = ({ onSelectSilhouette }) => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    if (onSelectSilhouette) {
      onSelectSilhouette(id);
    }
    navigate(`/collection?silhouette=${id}`);
  };

  return (
    <section id="silhouettes" className="py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12 text-left">
          <h2 className="font-playfair text-[32px] sm:text-[40px] leading-[1.15] font-normal tracking-tight text-[#2C2523] m-0">
            Dáng Váy Tuyệt Tác Cho Nàng Dâu
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {silhouettes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="group relative h-[480px] rounded-2xl overflow-hidden cursor-pointer shadow-[0px_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0px_12px_30px_rgba(0,0,0,0.15)] transition-all duration-500"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  if (item.fallback && e.currentTarget.src !== item.fallback) {
                    e.currentTarget.src = item.fallback;
                  }
                }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(29,20,20,0.92)] via-[rgba(29,20,20,0.35)] to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Top Tag */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                <span className="font-jakarta font-semibold text-[10.5px] uppercase tracking-[0.2em] text-[#E6DAC8] bg-[rgba(44,37,35,0.6)] backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(230,218,200,0.25)]">
                  {item.count}
                </span>
                {item.brandBadge && (
                  <span className="font-playfair text-[11px] tracking-[0.25em] text-[#F3D8D8] bg-[rgba(184,115,125,0.7)] px-2.5 py-0.5 rounded">
                    {item.brandBadge}
                  </span>
                )}
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <h3 className="font-playfair text-[24px] sm:text-[26px] font-normal text-white mb-2 leading-snug tracking-tight">
                  {item.title}
                </h3>
                <p className="font-jakarta text-[13px] font-light text-[#E0D5D1] leading-[20px] mb-4 opacity-90 line-clamp-2">
                  {item.description}
                </p>

                {/* Discover Link with hover arrow shift */}
                <div className="inline-flex items-center gap-2 text-[#FCEEE9] group-hover:text-white font-jakarta text-[12.5px] font-medium tracking-wide">
                  <span className="relative pb-0.5">
                    Khám phá bộ sưu tập
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FCEEE9] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SilhouetteShowcase;
