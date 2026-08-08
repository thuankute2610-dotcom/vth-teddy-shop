require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

const products = [
  {
    name: 'Gấu Bông Siêu Nhỏ Mini 15cm',
    price: 89000,
    oldPrice: 120000,
    category: 'gau-mini',
    description: 'Gấu bông mini 15cm siêu đáng yêu, mềm mại, thích hợp để bàn làm việc, trang trí.',
    image: 'https://via.placeholder.com/400x400/F8C8DC/ffffff?text=Gấu+Mini',
    stock: 50,
    featured: false,
  },
  {
    name: 'Gấu Bông Nhỏ 30cm Xinh Xắn',
    price: 159000,
    oldPrice: 199000,
    category: 'gau-nho',
    description: 'Gấu bông 30cm với bộ lông mịn màng, màu hồng sữa ngọt ngào, ôm rất êm.',
    image: 'https://via.placeholder.com/400x400/FFB6C1/ffffff?text=Gấu+Nhỏ',
    stock: 30,
    featured: true,
  },
  {
    name: 'Gấu Bông Lớn Cao Cấp 60cm',
    price: 349000,
    oldPrice: 450000,
    category: 'gau-lon',
    description: 'Gấu bông lớn 60cm cao cấp, bông dày, mềm mại, quà tặng lý tưởng cho người thân.',
    image: 'https://via.placeholder.com/400x400/F28CB0/ffffff?text=Gấu+Lớn',
    stock: 15,
    featured: true,
  },
  {
    name: 'Gấu Bông Siêu Đại 100cm',
    price: 699000,
    oldPrice: 900000,
    category: 'gau-lon',
    description: 'Gấu bông khổng lồ 100cm, người bạn tuyệt vời để ôm ngủ, trang trí phòng.',
    image: 'https://via.placeholder.com/400x400/FFF0F5/000000?text=Gấu+Đại',
    stock: 8,
    featured: true,
  },
  {
    name: 'Gấu Bông Quà Tặng Valentine',
    price: 249000,
    oldPrice: 320000,
    category: 'qua-tang',
    description: 'Bộ gấu bông quà tặng kèm hộp hoa xinh xắn, gửi gắm yêu thương.',
    image: 'https://via.placeholder.com/400x400/FFD1DC/000000?text=Gấu+Valentine',
    stock: 20,
    featured: true,
  },
  {
    name: 'Combo Gấu Bông Cặp Đôi',
    price: 399000,
    oldPrice: 520000,
    category: 'combo',
    description: 'Bộ đôi gấu bông cặp đôi (2 con) đáng yêu, quà tặng cho các cặp đôi.',
    image: 'https://via.placeholder.com/400x400/FFC0CB/ffffff?text=Combo+Đôi',
    stock: 12,
    featured: true,
  },
  {
    name: 'Gấu Bông Mặc Váy Công Chúa',
    price: 289000,
    oldPrice: 360000,
    category: 'gau-nho',
    description: 'Gấu bông mặc váy công chúa xinh đẹp, phù hợp làm quà tặng cho bé gái.',
    image: 'https://via.placeholder.com/400x400/F8C8DC/ffffff?text=Gấu+Váy',
    stock: 18,
    featured: false,
  },
  {
    name: 'Gấu Bông Thỏ Pink Rabbit',
    price: 189000,
    oldPrice: 240000,
    category: 'gau-nho',
    description: 'Gấu bông hình thỏ màu hồng dễ thương, bạn đồng hành của mọi người.',
    image: 'https://via.placeholder.com/400x400/FFB6C1/ffffff?text=Thỏ+Hồng',
    stock: 25,
    featured: false,
  },
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu cũ');

    // Thêm dữ liệu mới
    await Product.insertMany(products);
    console.log(`✅ Đã thêm ${products.length} sản phẩm vào MongoDB!`);

    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

seedDB();
