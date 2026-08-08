const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products (with optional category filter & search)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TEMP: Seed images for existing products (remove after running once)
router.post('/seed-images', async (req, res) => {
  try {
    const imageMap = {
      'Gấu Bông Siêu Nhỏ Mini 15cm': 'https://loremflickr.com/400/400/teddy,bear?lock=1',
      'Gấu Bông Nhỏ 30cm Xinh Xắn': 'https://loremflickr.com/400/400/teddy,bear?lock=2',
      'Gấu Bông Lớn Cao Cấp 60cm': 'https://loremflickr.com/400/400/teddy,bear?lock=3',
      'Gấu Bông Siêu Đại 100cm': 'https://loremflickr.com/400/400/teddy,bear?lock=4',
      'Gấu Bông Quà Tặng Valentine': 'https://loremflickr.com/400/400/teddy,bear?lock=5',
      'Combo Gấu Bông Cặp Đôi': 'https://loremflickr.com/400/400/teddy,bear?lock=6',
      'Gấu Bông Mặc Váy Công Chúa': 'https://loremflickr.com/400/400/teddy,bear?lock=7',
      'Gấu Bông Thỏ Pink Rabbit': 'https://loremflickr.com/400/400/teddy,bear?lock=8',
    };

    const products = await Product.find({});
    let updated = 0;

    for (const product of products) {
      if (imageMap[product.name]) {
        product.image = imageMap[product.name];
        await product.save();
        updated++;
      }
    }

    res.json({ message: `Đã cập nhật ảnh cho ${updated} sản phẩm`, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
