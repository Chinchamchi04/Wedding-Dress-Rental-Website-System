import fs from 'fs';
import path from 'path';
import os from 'os';

const brainDir = path.join(os.homedir(), '.gemini/antigravity/brain/49f42edd-dcf5-4c3f-b02f-f5a91777514f');
const destDir = path.resolve('frontend/public/assets/dresses');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);

const copyMap = [
  { prefix: 'dress_01_mannequin', target: 'dress_01_mannequin.jpg' },
  { prefix: 'dress_01_left', target: 'dress_01_left.jpg' },
  { prefix: 'dress_01_right', target: 'dress_01_right.jpg' },
  { prefix: 'dress_02_mannequin', target: 'dress_02_mannequin.jpg' },
];

for (const item of copyMap) {
  const match = files.find(f => f.startsWith(item.prefix) && f.endsWith('.jpg'));
  if (match) {
    const srcPath = path.join(brainDir, match);
    const destPath = path.join(destDir, item.target);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${match} -> ${item.target} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
  } else {
    console.warn(`File with prefix ${item.prefix} not found in ${brainDir}`);
  }
}

