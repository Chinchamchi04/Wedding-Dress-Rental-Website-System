import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Dress from '../models/Dress.model.js';

async function sync() {
  await mongoose.connect(process.env.MONGO_URI);
  const dresses = await Dress.find().sort({ code: 1 }).lean();
  console.log(`Found ${dresses.length} dresses from MongoDB.`);

  const catalogItems = dresses.map((d, index) => {
    const num = (index + 1).toString().padStart(2, '0');
    const catSlug = (d.silhouette || 'ballgown').toLowerCase().replace(/\s+/g, '-');
    const priceNum = d.rentPrice || 5000000;
    const priceCat = priceNum < 5000000 ? 'under-5' : priceNum <= 10000000 ? '5-10' : 'over-10';

    return `  {
    id: '${d._id}',
    code: '${d.code}',
    name: '${d.name}',
    badgeMain: '${d.collectionTag || 'HAUTE COUTURE'}',
    badgeSub: 'Size: ${d.sizes.join(' - ')}',
    rating: '${d.rating.toFixed(1)}',
    rentCount: '${d.rentCount} lượt thuê',
    size: 'Size: ${d.sizes.join(' - ')}',
    sizes: ${JSON.stringify(d.sizes)},
    priceNumber: ${priceNum},
    price: '${priceNum.toLocaleString('vi-VN')}₫',
    depositAmount: '${(d.depositAmount || 15000000).toLocaleString('vi-VN')}₫',
    depositPolicy: '(Hoàn tức thì)',
    category: '${catSlug}',
    categoryName: '${d.silhouette}',
    material: '${d.material}',
    priceCategory: '${priceCat}',
    image: '${d.images[0] || `/assets/dresses/dress_${num}.jpg`}',
    description: '${d.description.replace(/'/g, "\\'")}',
  }`;
  });

  const content = `// Danh mục 50 bộ váy cưới cao cấp UniBridal Haute Couture 2026 (Đồng bộ với MongoDB & Logo)

export const DRESS_CATALOG = [
${catalogItems.join(',\n')}
];
`;

  fs.writeFileSync(path.join(__dirname, '../../../frontend/src/data/dressCatalog.js'), content, 'utf8');
  console.log('Successfully updated frontend/src/data/dressCatalog.js!');
  await mongoose.disconnect();
}

sync().catch(console.error);

