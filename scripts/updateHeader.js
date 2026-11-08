import fs from 'fs';

let content = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldCat = `  const categories = [
    {
      title: 'Tất Cả Thiết Kế Bộ Sưu Tập',
      subtitle: 'Khám phá hơn 70+ mẫu trang phục cưới cao cấp',
      href: '/collection',
    },
    {
      title: 'Váy Cưới Haute Couture',
      subtitle: 'Độc bản may đo và ren Pháp cao cấp',
      href: '/collection',
    },
    {
      title: 'Phom Dáng Corsetry',
      subtitle: 'Ballgown, Mermaid, A-Line chuẩn tỷ lệ',
      href: '#silhouettes',
    },
    {
      title: 'Vest Cưới và Tuxedo',
      subtitle: 'Phong cách quý ông Châu Âu thanh lịch',
      href: '/collection',
    },
    {
      title: 'Áo Dài Cưới Truyền Thống',
      subtitle: 'Gấm thêu tay hoàng gia cao cấp',
      href: '/collection',
    },
  ];`;

const newCat = `  const categories = [
    {
      title: 'Tất Cả Thiết Kế Bộ Sưu Tập',
      subtitle: 'Khám phá 25 tuyệt phẩm váy cưới Haute Couture 2026',
      href: '/collection',
    },
    {
      title: 'Váy Cưới Haute Couture',
      subtitle: 'Độc bản may đo và ren Pháp cao cấp',
      href: '/collection',
    },
    {
      title: 'Phom Dáng Corsetry',
      subtitle: 'Ballgown, Mermaid, A-Line chuẩn tỷ lệ',
      href: '#silhouettes',
    },
    {
      title: 'Váy Cưới Lụa Tối Giản',
      subtitle: 'Lụa Mikado Ý & Satin tơ tằm thanh tao',
      href: '/collection?category=silk-gown',
    },
    {
      title: 'Váy Cưới Hoàng Gia Princess',
      subtitle: 'Đính kết pha lê Swarovski lộng lẫy',
      href: '/collection?category=princess',
    },
  ];`;

if (content.includes(oldCat)) {
  content = content.replace(oldCat, newCat);
  console.log('Replaced categories in Header.jsx');
} else {
  console.warn('Could not find categories in Header.jsx');
}

fs.writeFileSync('frontend/src/components/layout/Header.jsx', content, 'utf8');
console.log('Done updating Header.jsx');

