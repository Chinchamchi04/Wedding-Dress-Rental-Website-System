import fs from 'fs';

let content = fs.readFileSync('frontend/src/components/home/SilhouetteShowcase.jsx', 'utf8').replace(/\r\n/g, '\n');

content = content.replace(
  'BỘ SƯU TẬP 8 DÁNG VÁY HAUTE COUTURE ĐỘC QUYỀN',
  'BỘ SƯU TẬP PHOM DÁNG HAUTE COUTURE ĐỘC QUYỀN'
);

content = content.replace(
  'Hệ thống quy tụ đầy đủ 8 phom dáng và lễ phục cưới cao cấp',
  'Hệ thống quy tụ các phom dáng và lễ phục cưới cao cấp'
);

content = content.replace(
  '<div className="absolute bottom-6 left-6 right-6 text-left">',
  '<div className="absolute bottom-6 left-5 right-5 text-left">'
);

content = content.replace(
  '<h3 className="font-playfair text-[24px] sm:text-[26px] font-normal text-white mb-2 leading-snug tracking-tight">',
  '<h3 className="font-playfair text-[20px] sm:text-[22px] lg:text-[20px] xl:text-[22.5px] font-normal text-white mb-2 leading-snug tracking-tight whitespace-nowrap">'
);

fs.writeFileSync('frontend/src/components/home/SilhouetteShowcase.jsx', content, 'utf8');
console.log('Successfully updated SilhouetteShowcase.jsx');

