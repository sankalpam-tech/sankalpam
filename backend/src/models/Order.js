import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal must be a positive number']
  },
  selectedVariant: {
    name: String,
    value: String
  },
  selectedOptions: [{
    name: String,
    value: String
  }],
  image: {
    url: String,
    altText: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String,
    trim: true
  },
  returnStatus: {
    type: String,
    enum: ['', 'requested', 'approved', 'rejected', 'received', 'refunded'],
    default: ''
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, { _id: true, timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal must be a positive number']
  },
  shipping: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost must be a positive number']
  },
  tax: {
    type: Number,
    required: [true, 'Tax is required'],
    min: [0, 'Tax must be a positive number']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total must be a positive number']
  },
  coupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'on_hold',
      'completed',
      'cancelled',
      'refunded',
      'failed',
      'trash'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: [
      'pending',
      'authorized',
      'paid',
      'partially_refunded',
      'refunded',
      'voided',
      'failed'
    ],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true
  },
  paymentTransactionId: {
    type: String,
    trim: true
  },
  paymentDetails: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  billingAddress: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    address2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  shippingAddress: {
    sameAsBilling: {
      type: Boolean,
      default: true
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address1: {
      type: String,
      trim: true
    },
    address2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  customerNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Customer note cannot be more than 500 characters']
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin note cannot be more than 500 characters']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    trim: true,
    maxlength: 3
  },
  currencySymbol: {
    type: String,
    default: '₹',
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order status label
orderSchema.virtual('statusLabel').get(function() {
  const statusLabels = {
    'pending': 'Pending',
    'processing': 'Processing',
    'on_hold': 'On Hold',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'trash': 'Trash'
  };
  return statusLabels[this.status] || this.status;
});

// Virtual for payment status label
orderSchema.virtual('paymentStatusLabel').get(function() {
  const statusLabels = {
    'pending': 'Pending',
    'authorized': 'Authorized',
    'paid': 'Paid',
    'partially_refunded': 'Partially Refunded',
    'refunded': 'Refunded',
    'voided': 'Voided',
    'failed': 'Failed'
  };
  return statusLabels[this.paymentStatus] || this.paymentStatus;
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate a unique order number (e.g., ORD-YYYYMMDD-XXXXX)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    
    // Set shipping address to billing address if not provided
    if (this.shippingAddress.sameAsBilling) {
      this.shippingAddress = {
        ...this.billingAddress,
        sameAsBilling: true
      };
    }
  }
  
  next();
});

// After save, update product stock if order is completed
orderSchema.post('save', async function(doc, next) {
  if (doc.status === 'completed' && this.isModified('status')) {
    try {
      const Product = mongoose.model('Product');
      
      for (const item of doc.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity, purchaseCount: item.quantity } }
        );
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  }
  
  next();
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
        minOrderValue: { $min: '$total' },
        maxOrderValue: { $max: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        refundedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        totalRevenue: 1,
        avgOrderValue: 1,
        minOrderValue: 1,
        maxOrderValue: 1,
        statusCounts: {
          pending: '$pendingOrders',
          processing: '$processingOrders',
          completed: '$completedOrders',
          cancelled: '$cancelledOrders',
          refunded: '$refundedOrders'
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    minOrderValue: 0,
    maxOrderValue: 0,
    statusCounts: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
  };
};

// Method to get order status history
orderSchema.methods.getStatusHistory = function() {
  const history = [
    {
      status: 'created',
      date: this.createdAt,
      comment: 'Order was created'
    }
  ];
  
  if (this.status !== 'created') {
    history.push({
      status: this.status,
      date: this.updatedAt,
      comment: `Order was marked as ${this.status}`
    });
  }
  
  return history;
};

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'billingAddress.email': 1 });
orderSchema.index({ 'billingAddress.phone': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;