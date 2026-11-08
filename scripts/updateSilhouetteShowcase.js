import fs from 'fs';

let content = fs.readFileSync('frontend/src/components/home/SilhouetteShowcase.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. SILHOUETTES_CONFIG
const oldConfig = `const SILHOUETTES_CONFIG = [
  {
    id: 'ballgown',
    title: 'Công Chúa Hoàng Gia',
    description: 'Lộng lẫy, bồng bềnh với cấu trúc siết eo corsetry tôn vinh tỉ lệ vàng.',
    image: '/assets/dresses/dress_01.jpg',
    fallback: card1Img,
    defaultCount: 13,
  },
  {
    id: 'mermaid',
    title: 'Đuôi Cá Điêu Khắc',
    description: 'Ôm trọn đường cong quyến rũ với chất liệu ren hoa nổi 3D cao cấp.',
    image: '/assets/dresses/dress_02.jpg',
    fallback: card2Img,
    defaultCount: 7,
  },
  {
    id: 'a-line',
    title: 'Chữ A Thanh Lịch',
    description: 'Nhẹ nhàng, bay bổng, hoàn hảo cho tiệc cưới ngoài trời và sảnh tiệc thân mật.',
    image: '/assets/dresses/dress_04.jpg',
    fallback: card4Img,
    defaultCount: 7,
  },
  {
    id: 'silk-gown',
    brandBadge: 'UNIBRIDAL',
    title: 'Satin Lụa Tối Giản',
    description: 'Vẻ đẹp đương đại từ lụa tơ tằm nguyên bản, thuần khiết và sang trọng.',
    image: '/assets/dresses/dress_03.jpg',
    fallback: card3Img,
    defaultCount: 7,
  },
  {
    id: 'princess',
    title: 'Hoàng Gia Princess',
    description: 'Tùng váy xòe rộng 2m đính kết pha lê Swarovski lấp lánh như cực quang.',
    image: '/assets/dresses/dress_05.jpg',
    fallback: card5Img,
    defaultCount: 6,
  },
  {
    id: 'traditional',
    brandBadge: 'DI SẢN VIỆT',
    title: 'Áo Cưới Truyền Thống',
    description: 'Áo dài cưới thêu tay Long Phụng, hoa sen thủ công trên nền lụa tơ tằm thượng hạng.',
    image: '/assets/dresses/dress_31.jpg',
    fallback: card7Img,
    defaultCount: 5,
  },
  {
    id: 'tuxedo',
    title: 'Âu Phục & Tuxedo',
    description: 'Phong thái chú rể lịch lãm với chất liệu len lông cừu Ý và ve áo satin sang trọng.',
    image: '/assets/dresses/dress_36.jpg',
    fallback: card1Img,
    defaultCount: 5,
  },
  {
    id: 'custom-atelier',
    brandBadge: 'ĐẶC QUYỀN 1:1',
    isCustomBooking: true,
    title: 'May Đo Riêng 1:1',
    description: 'Thiết kế độc bản theo số đo và phong cách riêng cùng Giám Đốc Sáng Tạo Atelier.',
    image: '/assets/dresses/dress_09.jpg',
    fallback: card2Img,
    customTag: 'ATELIER MAY ĐO',
    defaultCount: 1,
  },
];`;

const newConfig = `const SILHOUETTES_CONFIG = [
  {
    id: 'ballgown',
    title: 'Công Chúa Hoàng Gia',
    description: 'Lộng lẫy, bồng bềnh với cấu trúc siết eo corsetry tôn vinh tỉ lệ vàng.',
    image: '/assets/dresses/dress_01.jpg',
    fallback: card1Img,
    defaultCount: 5,
  },
  {
    id: 'mermaid',
    title: 'Đuôi Cá Điêu Khắc',
    description: 'Ôm trọn đường cong quyến rũ với chất liệu ren hoa nổi 3D cao cấp.',
    image: '/assets/dresses/dress_02.jpg',
    fallback: card2Img,
    defaultCount: 5,
  },
  {
    id: 'a-line',
    title: 'Chữ A Thanh Lịch',
    description: 'Nhẹ nhàng, bay bổng, hoàn hảo cho tiệc cưới ngoài trời và sảnh tiệc thân mật.',
    image: '/assets/dresses/dress_04.jpg',
    fallback: card4Img,
    defaultCount: 5,
  },
  {
    id: 'silk-gown',
    brandBadge: 'UNIBRIDAL',
    title: 'Satin Lụa Tối Giản',
    description: 'Vẻ đẹp đương đại từ lụa tơ tằm nguyên bản, thuần khiết và sang trọng.',
    image: '/assets/dresses/dress_03.jpg',
    fallback: card3Img,
    defaultCount: 5,
  },
  {
    id: 'princess',
    title: 'Hoàng Gia Princess',
    description: 'Tùng váy xòe rộng 2m đính kết pha lê Swarovski lấp lánh như cực quang.',
    image: '/assets/dresses/dress_05.jpg',
    fallback: card5Img,
    defaultCount: 5,
  },
  {
    id: 'custom-atelier',
    brandBadge: 'ĐẶC QUYỀN 1:1',
    isCustomBooking: true,
    title: 'May Đo Riêng 1:1',
    description: 'Thiết kế độc bản theo số đo và phong cách riêng cùng Giám Đốc Sáng Tạo Atelier.',
    image: '/assets/dresses/dress_09.jpg',
    fallback: card2Img,
    customTag: 'ATELIER MAY ĐO',
    defaultCount: 1,
  },
];`;

if (content.includes(oldConfig)) {
  content = content.replace(oldConfig, newConfig);
  console.log('Replaced SILHOUETTES_CONFIG');
} else {
  console.warn('Could not find SILHOUETTES_CONFIG');
}

// 2. Default counts state
const oldCounts = `  const [counts, setCounts] = useState({
    ballgown: 13,
    mermaid: 7,
    'a-line': 7,
    'silk-gown': 7,
    princess: 6,
    traditional: 5,
    tuxedo: 5,
  });`;

const newCounts = `  const [counts, setCounts] = useState({
    ballgown: 5,
    mermaid: 5,
    'a-line': 5,
    'silk-gown': 5,
    princess: 5,
  });`;

if (content.includes(oldCounts)) {
  content = content.replace(oldCounts, newCounts);
  console.log('Replaced default counts state');
} else {
  console.warn('Could not find default counts state');
}

fs.writeFileSync('frontend/src/components/home/SilhouetteShowcase.jsx', content, 'utf8');
console.log('Done updating SilhouetteShowcase.jsx');

