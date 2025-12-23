import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    selectedVariant: {
      type: mongoose.Schema.Types.Mixed,
    },
    selectedOptions: [
      {
        name: String,
        value: String,
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

// Virtual for line total
cartItemSchema.virtual('lineTotal').get(function () {
  const optionTotal = this.selectedOptions?.reduce((sum, opt) => sum + (opt.price || 0), 0) || 0;
  return (this.price + optionTotal) * this.quantity;
});

// Update cart totals when cart item is saved
cartItemSchema.post('save', async function (doc) {
  await this.model('Cart').calculateTotals(doc.cart);
});

// Update cart totals when cart item is removed
cartItemSchema.post('remove', async function (doc) {
  await this.model('Cart').calculateTotals(doc.cart);
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
