import fs from 'fs';

// 1. accountService.js
let serviceContent = fs.readFileSync('backend/src/services/accountService.js', 'utf8').replace(/\r\n/g, '\n');

if (!serviceContent.includes('export async function getWishlist')) {
  serviceContent += `
export async function getWishlist(user) {
  const account = await User.findById(user._id).populate('wishlist').lean();
  return (account?.wishlist || []).map((d) => String(d._id || d));
}

export async function updateWishlist(user, { dressIds }) {
  if (!Array.isArray(dressIds)) fail(400, 'dressIds phải là một mảng danh sách ID.');
  const validObjectIds = dressIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const account = await User.findByIdAndUpdate(
    user._id,
    { wishlist: validObjectIds },
    { new: true }
  ).lean();
  return (account?.wishlist || []).map((d) => String(d._id || d));
}
`;
  fs.writeFileSync('backend/src/services/accountService.js', serviceContent, 'utf8');
  console.log('Added getWishlist & updateWishlist to accountService.js');
}

// 2. accountController.js
let controllerContent = fs.readFileSync('backend/src/controllers/accountController.js', 'utf8').replace(/\r\n/g, '\n');

if (!controllerContent.includes('export const getWishlist')) {
  controllerContent += `export const getWishlist = async (req, res) => ok(res, 'Lấy danh sách yêu thích thành công.', await account.getWishlist(req.user));
export const updateWishlist = async (req, res) => ok(res, 'Cập nhật danh sách yêu thích thành công.', await account.updateWishlist(req.user, req.body));
`;
  fs.writeFileSync('backend/src/controllers/accountController.js', controllerContent, 'utf8');
  console.log('Added getWishlist & updateWishlist to accountController.js');
}

// 3. routes/index.js
let routesContent = fs.readFileSync('backend/src/routes/index.js', 'utf8').replace(/\r\n/g, '\n');

if (!routesContent.includes('/profile/wishlist')) {
  const target = `router.get('/profile', optionalAuthenticate, handle(account.profile));`;
  const addition = `router.get('/profile/wishlist', authenticate, handle(account.getWishlist));
router.put('/profile/wishlist', authenticate, handle(account.updateWishlist));
router.get('/profile', optionalAuthenticate, handle(account.profile));`;

  if (routesContent.includes(target)) {
    routesContent = routesContent.replace(target, addition);
    fs.writeFileSync('backend/src/routes/index.js', routesContent, 'utf8');
    console.log('Added wishlist routes to backend/src/routes/index.js');
  }
}

