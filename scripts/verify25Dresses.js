import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyAll() {
  console.log('=== 1. VERIFY DRESS CATALOG ===');
  const catalogModule = await import('../frontend/src/data/dressCatalog.js');
  const catalog = catalogModule.DRESS_CATALOG;

  console.log(`Total dresses in DRESS_CATALOG: ${catalog.length}`);
  if (catalog.length !== 25) {
    throw new Error(`Expected exactly 25 dresses, got ${catalog.length}`);
  }

  const silhouetteCounts = {};
  catalog.forEach((d, idx) => {
    silhouetteCounts[d.category] = (silhouetteCounts[d.category] || 0) + 1;
    if (d.category === 'traditional' || d.category === 'tuxedo') {
      throw new Error(`Found forbidden category ${d.category} at index ${idx}`);
    }
  });
  console.log('Silhouette distribution:', silhouetteCounts);

  const expectedSilhouettes = ['ballgown', 'mermaid', 'a-line', 'silk-gown', 'princess'];
  for (const s of expectedSilhouettes) {
    if (silhouetteCounts[s] !== 5) {
      throw new Error(`Expected exactly 5 dresses for ${s}, got ${silhouetteCounts[s]}`);
    }
  }

  console.log('\n=== 2. VERIFY FILTER LOGIC (COMBINATIONS GUARANTEE) ===');
  const materials = [
    'Ren 3D Floral',
    'Lụa Mikado Ý',
    'Satin Tơ Tằm Tự Nhiên',
    'Đính Kết Pha Lê Swarovski',
  ];

  function matchesMaterial(dressMat, selectedMat) {
    if (!dressMat) return false;
    const dMat = dressMat.toLowerCase();
    const tMat = selectedMat.toLowerCase();
    if (dMat.includes(tMat)) return true;
    if (tMat.includes('ren') && (dMat.includes('ren') || dMat.includes('lace'))) return true;
    if (tMat.includes('mikado') && (dMat.includes('mikado') || dMat.includes('lụa') || dMat.includes('silk'))) return true;
    if (tMat.includes('satin') && (dMat.includes('satin') || dMat.includes('tơ tằm'))) return true;
    if (tMat.includes('swarovski') && (dMat.includes('swarovski') || dMat.includes('pha lê') || dMat.includes('crystal') || dMat.includes('đính kết'))) return true;
    return false;
  }

  console.log('Testing each silhouette alone:');
  for (const s of expectedSilhouettes) {
    const matched = catalog.filter(d => d.category === s);
    console.log(`  Silhouette [${s}]: ${matched.length} dresses`);
    if (matched.length === 0) throw new Error(`0 dresses for silhouette ${s}`);
  }

  console.log('\nTesting each material alone:');
  for (const m of materials) {
    const matched = catalog.filter(d => matchesMaterial(d.material, m));
    console.log(`  Material [${m}]: ${matched.length} dresses`);
    if (matched.length === 0) throw new Error(`0 dresses for material ${m}`);
  }

  console.log('\nTesting EVERY combination of (Silhouette + Material):');
  let totalCombinations = 0;
  for (const s of expectedSilhouettes) {
    for (const m of materials) {
      totalCombinations++;
      const matched = catalog.filter(d => d.category === s && matchesMaterial(d.material, m));
      console.log(`  [${s}] + [${m}]: ${matched.length} dress(es) -> ${matched.map(d => d.code).join(', ')}`);
      if (matched.length === 0) {
        throw new Error(`FAILED combination: [${s}] + [${m}] has 0 dresses!`);
      }
    }
  }
  console.log(`All ${totalCombinations} combinations have >= 1 product! Guarantee fulfilled 100%!`);

  console.log('\n=== 3. VERIFY ALL 25 IMAGES ON DISK ===');
  const imgDir = path.resolve(__dirname, '../frontend/public/assets/dresses');
  for (let i = 1; i <= 25; i++) {
    const num = i.toString().padStart(2, '0');
    const filename = `dress_${num}.jpg`;
    const fullPath = path.join(imgDir, filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Image missing: ${filename}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`  ${filename}: ${(stat.size / 1024).toFixed(1)} KB`);
    if (stat.size < 400 * 1024) {
      throw new Error(`Image ${filename} is smaller than 400KB!`);
    }
  }
  console.log('All 25 images exist, are high resolution, and verified!');

  console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
}

verifyAll().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});

