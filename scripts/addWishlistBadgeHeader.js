import fs from 'fs';

let content = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldHeartBlock = `              <Heart className="w-[18px] h-[18px] stroke-[1.8] text-[#2C2523]" />
            </Link>`;

const newHeartBlock = `              <Heart className="w-[18px] h-[18px] stroke-[1.8] text-[#2C2523]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#B8737D] text-white font-jakarta text-[9.5px] font-bold flex items-center justify-center leading-none shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>`;

if (content.includes(oldHeartBlock)) {
  content = content.replace(oldHeartBlock, newHeartBlock);
  fs.writeFileSync('frontend/src/components/layout/Header.jsx', content, 'utf8');
  console.log('Successfully added wishlist badge in Header.jsx');
} else {
  console.warn('oldHeartBlock not found in Header.jsx');
}

