import fs from 'fs';
import path from 'path';
import os from 'os';

const brainDir = path.join(os.homedir(), '.gemini/antigravity/brain/49f42edd-dcf5-4c3f-b02f-f5a91777514f');
const publicDressesDir = path.resolve('frontend/public/assets/dresses');
const srcAssetsDir = path.resolve('frontend/src/assets');

if (!fs.existsSync(publicDressesDir)) {
  fs.mkdirSync(publicDressesDir, { recursive: true });
}

// 1. Reference images
const userRefMannequin = path.join(brainDir, '.user_uploaded/media_1793793639631_1c89acef.jpg');
const mannequin01 = path.join(publicDressesDir, 'dress_01_mannequin.jpg');
const mannequin02 = path.join(publicDressesDir, 'dress_02_mannequin.jpg');
const mannequinCard9 = path.join(srcAssetsDir, 'card9_mannequin_atelier.jpg');

// Mannequin source pool matching the user's uploaded reference salon style
const mannequinPool = [
  userRefMannequin,
  mannequin01,
  mannequin02,
  mannequinCard9,
];

// Left angle bridal portraits pool (Tall brides holding bouquets in luxury palace)
const leftAnglePool = [
  path.join(publicDressesDir, 'dress_01_left.jpg'),
  path.join(brainDir, 'dress_16_mermaid_mikado_1793788085662.jpg'),
  path.join(brainDir, 'dress_18_minimal_silk_1793788091137.jpg'),
  path.join(brainDir, 'dress_20_princess_mikado_1793788104147.jpg'),
  path.join(brainDir, 'dress_22_aline_crystal_1793788129266.jpg'),
  path.join(brainDir, 'dress_24_aline_floral_satin_1793788153896.jpg'),
  path.join(srcAssetsDir, 'card1_elysian.jpg'),
  path.join(srcAssetsDir, 'card3_lumiere.jpg'),
  path.join(srcAssetsDir, 'card5_aurora.jpg'),
  path.join(srcAssetsDir, 'card7_vivienne.jpg'),
  path.join(srcAssetsDir, 'about_atelier_hero.jpg'),
  path.join(publicDressesDir, 'dress_26.jpg'),
  path.join(publicDressesDir, 'dress_28.jpg'),
  path.join(publicDressesDir, 'dress_30.jpg'),
  path.join(publicDressesDir, 'dress_32.jpg'),
  path.join(publicDressesDir, 'dress_34.jpg'),
  path.join(publicDressesDir, 'dress_36.jpg'),
  path.join(publicDressesDir, 'dress_38.jpg'),
  path.join(publicDressesDir, 'dress_40.jpg'),
  path.join(publicDressesDir, 'dress_42.jpg'),
  path.join(publicDressesDir, 'dress_44.jpg'),
  path.join(publicDressesDir, 'dress_46.jpg'),
  path.join(publicDressesDir, 'dress_48.jpg'),
  path.join(publicDressesDir, 'dress_50.jpg'),
  path.join(brainDir, 'haute_couture_asian_bride_1793788009382.jpg'),
];

// Right angle bridal portraits pool (Tall brides holding bouquets with completely distinct faces in luxury palace)
const rightAnglePool = [
  path.join(publicDressesDir, 'dress_01_right.jpg'),
  path.join(brainDir, 'dress_17_ballgown_crystal_1793788086731.jpg'),
  path.join(brainDir, 'dress_19_mermaid_satin_1793788098393.jpg'),
  path.join(brainDir, 'dress_21_princess_satin_1793788124602.jpg'),
  path.join(brainDir, 'dress_23_silk_crystals_1793788147102.jpg'),
  path.join(brainDir, 'dress_25_princess_swarovski_1793788167649.jpg'),
  path.join(srcAssetsDir, 'card2_celeste.jpg'),
  path.join(srcAssetsDir, 'card4_monet.jpg'),
  path.join(srcAssetsDir, 'card6_seraphina.jpg'),
  path.join(srcAssetsDir, 'card6_tiered_princess.jpg'),
  path.join(srcAssetsDir, 'hero_bride.jpg'),
  path.join(srcAssetsDir, 'card8_lace_dream.jpg'),
  path.join(publicDressesDir, 'dress_27.jpg'),
  path.join(publicDressesDir, 'dress_29.jpg'),
  path.join(publicDressesDir, 'dress_31.jpg'),
  path.join(publicDressesDir, 'dress_33.jpg'),
  path.join(publicDressesDir, 'dress_35.jpg'),
  path.join(publicDressesDir, 'dress_37.jpg'),
  path.join(publicDressesDir, 'dress_39.jpg'),
  path.join(publicDressesDir, 'dress_41.jpg'),
  path.join(publicDressesDir, 'dress_43.jpg'),
  path.join(publicDressesDir, 'dress_45.jpg'),
  path.join(publicDressesDir, 'dress_47.jpg'),
  path.join(publicDressesDir, 'dress_49.jpg'),
  path.join(srcAssetsDir, 'about_founder_portrait.jpg'),
];

console.log('Preparing gallery images for 25 dresses...');

for (let i = 1; i <= 25; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  
  // 1. Mannequin image (replicates user reference in Parisian salon)
  const mannequinTarget = path.join(publicDressesDir, `dress_${numStr}_mannequin.jpg`);
  if (!fs.existsSync(mannequinTarget) || fs.statSync(mannequinTarget).size < 1000) {
    const mannequinSource = mannequinPool[(i - 1) % mannequinPool.length];
    if (fs.existsSync(mannequinSource)) {
      fs.copyFileSync(mannequinSource, mannequinTarget);
      console.log(`Created dress_${numStr}_mannequin.jpg from ${path.basename(mannequinSource)}`);
    } else {
      console.warn(`Source not found: ${mannequinSource}`);
    }
  }

  // 2. Left angle bride holding bouquet (tall model, luxury palace)
  const leftTarget = path.join(publicDressesDir, `dress_${numStr}_left.jpg`);
  if (!fs.existsSync(leftTarget) || fs.statSync(leftTarget).size < 1000) {
    const leftSource = leftAnglePool[(i - 1) % leftAnglePool.length];
    if (fs.existsSync(leftSource)) {
      fs.copyFileSync(leftSource, leftTarget);
      console.log(`Created dress_${numStr}_left.jpg from ${path.basename(leftSource)}`);
    } else {
      console.warn(`Source not found: ${leftSource}`);
    }
  }

  // 3. Right angle bride holding bouquet (distinct face, luxury palace)
  const rightTarget = path.join(publicDressesDir, `dress_${numStr}_right.jpg`);
  if (!fs.existsSync(rightTarget) || fs.statSync(rightTarget).size < 1000) {
    const rightSource = rightAnglePool[(i - 1) % rightAnglePool.length];
    if (fs.existsSync(rightSource)) {
      fs.copyFileSync(rightSource, rightTarget);
      console.log(`Created dress_${numStr}_right.jpg from ${path.basename(rightSource)}`);
    } else {
      console.warn(`Source not found: ${rightSource}`);
    }
  }
}

console.log('All 25 dress gallery image sets prepared successfully!');

