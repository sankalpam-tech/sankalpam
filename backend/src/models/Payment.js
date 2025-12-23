import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Reference to the booking this payment is for
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    index: true
  },
  
  // Reference to the user making the payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // Payment amount details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  // Currency (default to INR)
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    enum: {
      values: ['INR', 'USD', 'EUR'],
      message: 'Currency must be either INR, USD, or EUR'
    }
  },
  
  // Payment method details
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['credit_card', 'debit_card', 'netbanking', 'upi', 'wallet', 'cod'],
      message: 'Invalid payment method'
    }
  },
  
  // Payment gateway details
  gateway: {
    name: {
      type: String,
      required: [true, 'Payment gateway name is required'],
      enum: {
        values: ['razorpay', 'stripe', 'paypal', 'paytm', 'instamojo', 'cash'],
        message: 'Unsupported payment gateway'
      }
    },
    transactionId: {
      type: String,
      required: [
        function() { return this.gateway.name !== 'cash'; },
        'Transaction ID is required for non-cash payments'
      ]
    },
    orderId: String,
    paymentId: String,
    signature: String,
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'refunded', 'failed', 'pending'],
      default: 'pending'
    },
    rawResponse: mongoose.Schema.Types.Mixed
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Payment items breakdown
  items: [{
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    description: String,
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    amount: {
      type: Number,
      required: [true, 'Item amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Item total is required'],
      min: [0, 'Total cannot be negative']
    }
  }],
  
  // Billing information
  billingAddress: {
    name: {
      type: String,
      required: [true, 'Billing name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Billing email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Billing phone is required'],
      trim: true
    },
    address: {
      line1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        trim: true
      },
      line2: {
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
        trim: true,
        default: 'India'
      }
    }
  },
  
  // Tax and discount details
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Payment notes
  notes: [{
    text: {
      type: String,
      required: [true, 'Note text is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for note']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Refund information
  refunds: [{
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0, 'Refund amount cannot be negative']
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Soft delete
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ 'gateway.transactionId': 1 }, { unique: true, sparse: true });
paymentSchema.index({ 'gateway.orderId': 1 }, { unique: true, sparse: true });
paymentSchema.index({ 'gateway.paymentId': 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  if (!this.refunds || this.refunds.length === 0) return 0;
  return this.refunds
    .filter(refund => refund.status === 'processed')
    .reduce((sum, refund) => sum + refund.amount, 0);
});

// Virtual for payment status
paymentSchema.virtual('isPaid').get(function() {
  return this.status === 'completed' || this.status === 'refunded' || this.status === 'partially_refunded';
});

// Pre-save hook to calculate totals
paymentSchema.pre('save', function(next) {
  // Calculate subtotal from items if not set
  if (this.isModified('items') && this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  }
  
  // Calculate total amount if not set
  if (this.isModified(['subtotal', 'taxAmount', 'discountAmount'])) {
    this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
  }
  
  // If payment is being marked as completed, set completedAt
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  next();
});

// Static method to create payment for a booking
paymentSchema.statics.createForBooking = async function(bookingId, paymentData, userId) {
  const Booking = mongoose.model('Booking');
  
  // Find the booking
  const booking = await Booking.findById(bookingId)
    .populate('puja', 'name price')
    .populate('user', 'name email phone');
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  // Create payment data
  const payment = new this({
    booking: booking._id,
    user: booking.user._id,
    amount: paymentData.amount || booking.totalAmount,
    currency: paymentData.currency || 'INR',
    paymentMethod: paymentData.paymentMethod,
    gateway: {
      name: paymentData.gateway || 'cash', // Default to cash if not specified
      status: 'pending',
      ...paymentData.gatewayData
    },
    status: 'pending',
    items: [{
      name: `Puja: ${booking.puja.name}`,
      description: `Booking for ${booking.bookingDate.toLocaleDateString()} at ${booking.startTime}`,
      quantity: 1,
      amount: booking.puja.price,
      tax: 0, // You can add tax calculation logic here
      discount: 0, // You can add discount logic here
      total: booking.totalAmount
    }],
    billingAddress: paymentData.billingAddress || {
      name: booking.contactPerson.name,
      email: booking.contactPerson.email,
      phone: booking.contactPerson.phone,
      address: booking.location.address
    },
    subtotal: booking.puja.price,
    taxAmount: 0, // Add tax calculation if needed
    discountAmount: 0, // Add discount calculation if needed
    totalAmount: booking.totalAmount,
    createdBy: userId,
    metadata: paymentData.metadata || {}
  });
  
  // Save payment
  await payment.save();
  
  // Update booking with payment reference
  booking.payment = payment._id;
  booking.status = 'payment_pending';
  await booking.save();
  
  return payment;
};

// Method to process payment
paymentSchema.methods.processPayment = async function(paymentResult) {
  // Update payment status based on gateway response
  this.gateway = {
    ...this.gateway.toObject(),
    ...paymentResult.gatewayData,
    status: paymentResult.status || 'captured',
    updatedAt: Date.now()
  };
  
  this.status = paymentResult.success ? 'completed' : 'failed';
  
  if (paymentResult.metadata) {
    this.metadata = { ...this.metadata, ...paymentResult.metadata };
  }
  
  await this.save();
  
  // If payment was successful, update booking status
  if (this.status === 'completed') {
    const Booking = mongoose.model('Booking');
    await Booking.findByIdAndUpdate(this.booking, {
      status: 'confirmed',
      paymentStatus: 'paid',
      $push: {
        notes: {
          text: `Payment of ${this.amount} ${this.currency} received via ${this.paymentMethod}`,
          createdBy: this.updatedBy || this.createdBy
        }
      }
    });
    
    // TODO: Send payment confirmation email/notification
  }
  
  return this;
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason, userId) {
  if (this.status !== 'completed' && this.status !== 'partially_refunded') {
    throw new Error('Cannot refund a payment that is not completed');
  }
  
  const refundableAmount = this.amount - this.totalRefunded;
  
  if (amount > refundableAmount) {
    throw new Error(`Cannot refund more than ${refundableAmount} ${this.currency}`);
  }
  
  // Add refund to refunds array
  const refund = {
    amount,
    reason,
    status: 'pending',
    processedBy: userId,
    createdAt: Date.now()
  };
  
  this.refunds.push(refund);
  
  // Update payment status
  if (amount === refundableAmount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  await this.save();
  
  // Process refund with payment gateway
  try {
    // TODO: Implement actual refund processing with payment gateway
    // This is a placeholder for the refund processing logic
    const refundResult = {
      success: true,
      refundId: `ref_${Date.now()}`,
      status: 'processed',
      processedAt: new Date()
    };
    
    // Update refund status
    const refundIndex = this.refunds.length - 1;
    this.refunds[refundIndex] = {
      ...this.refunds[refundIndex].toObject(),
      status: refundResult.status,
      processedAt: refundResult.processedAt,
      gatewayResponse: refundResult
    };
    
    await this.save();
    
    // Update booking status if fully refunded
    if (this.status === 'refunded') {
      const Booking = mongoose.model('Booking');
      await Booking.findByIdAndUpdate(this.booking, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        $push: {
          notes: {
            text: `Refund of ${amount} ${this.currency} processed. Reason: ${reason}`,
            createdBy: userId
          }
        }
      });
    }
    
    return this;
    
  } catch (error) {
    // If refund fails, mark it as failed
    const refundIndex = this.refunds.length - 1;
    this.refunds[refundIndex].status = 'failed';
    this.refunds[refundIndex].gatewayResponse = {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    await this.save();
    
    throw error;
  }
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;