import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
    landmark: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
shippingAddressSchema.index({ user: 1, isDefault: 1 });

// Ensure only one default address per user
shippingAddressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Virtual for formatted address
shippingAddressSchema.virtual('formattedAddress').get(function () {
  return `${this.addressLine1}${this.addressLine2 ? ', ' + this.addressLine2 : ''}, ${this.city}, ${this.state} ${this.postalCode}, ${this.country}`;
});

// Static method to get user's default address
shippingAddressSchema.statics.getDefaultAddress = async function (userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get all user addresses
shippingAddressSchema.statics.getUserAddresses = async function (userId) {
  return this.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressSchema);

export default ShippingAddress;
