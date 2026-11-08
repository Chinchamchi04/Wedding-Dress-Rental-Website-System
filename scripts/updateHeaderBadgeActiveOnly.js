import fs from 'fs';

let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Only show cart badge when on cart page
header = header.replace(
  '{cartCount > 0 && (\n                <span className="absolute -top-1 -right-1 min-w-[16px]',
  '{isCartPage && cartCount > 0 && (\n                <span className="absolute -top-1 -right-1 min-w-[16px]'
);

// 2. Only show wishlist badge when on wishlist page
header = header.replace(
  '{wishlistCount > 0 && (\n                <span className="absolute -top-1 -right-1 min-w-[16px]',
  '{isWishlistPage && wishlistCount > 0 && (\n                <span className="absolute -top-1 -right-1 min-w-[16px]'
);

fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');
console.log('Successfully updated Header.jsx: badges now only display on their respective active pages.');

