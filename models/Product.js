const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: 0,
    },
    oldPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Vui lòng nhập danh mục'],
      enum: ['gau-nho', 'gau-lon', 'qua-tang', 'combo', 'gau-mini'],
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
