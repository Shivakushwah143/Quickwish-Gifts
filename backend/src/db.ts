import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String, default: null },
});

export const admin = mongoose.model("admin", adminSchema);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  description: String,
  offPrice: {
    type: Number,
    required: false,
  },
  badge: String,
  originalPrice: Number,
  discountPercent: {
    type: Number,
    required: false,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    enum: [
      "Fresh Flowers",
      "Flower Bouquets",
      "dresses",
      "Plants",
      "Chocolate Bouquets",
      "Dry Fruits",
      "Cakes",
      "Personalized Gifts",
      "Photo Frames",
      "Customized Mugs",
      "Birthday",
      "Anniversary",
      "Valentine's Day",
      "besti",
      "Jewelry",
      "Watches",
      "Perfumes",
      "Teddy Bears",
      "Home Decor",
    ],
    required: true,
    index: true,
  },
  tags: [
    {
      type: String,
      index: true,
    },
  ],
  stock: {
    type: Number,
    default: 1,
  },
  deliveryOptions: {
    sameDay: {
      type: Boolean,
      default: false,
    },
    estimatedDays: {
      type: Number,
      default: 3,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const product = mongoose.model("product", productSchema);

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ["percent", "flat"],
    required: true,
    default: "percent",
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  creatorName: {
    type: String,
    trim: true,
  },
  creatorId: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

couponSchema.pre("save", function (this: any, next) {
  this.updatedAt = new Date();
  next();
});

const couponModel =
  (mongoose.models.Coupon as mongoose.Model<any>) ||
  mongoose.model("Coupon", couponSchema);

export const Coupon = couponModel as mongoose.Model<any>;

interface IUser {
  clerkUserId?: string;
  password?: string;
  email: string;
  username: string;
  shippingAddresses: [
    {
      name: String;
      locationLink: String;
      street: String;
      city: String;
      pinCode: String;
      phone: String;
      isDefault: Boolean;
    }
  ];
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  clerkUserId: {
    type: String,
  } as any,
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
  },
  shippingAddresses: [
    {
      name: String,
      locationLink: String,
      street: String,
      city: String,
      pinCode: String,
      phone: String,
      isDefault: Boolean,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", userSchema);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "GiftProduct",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Processing",
      "Paid ",
      "orderConfirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Processing",
  },
  paymentMethod: {
    type: String,
    default: "WhatsApp/UPI",
  },
  whatsappProof: String, // Screenshot URL
  amount: {
    type: Number,
    required: true,
  },
  originalAmount: {
    type: Number,
    required: false,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: false,
  },
  couponCode: {
    type: String,
    trim: true,
  },
  couponId: {
    type: mongoose.Types.ObjectId,
    ref: "Coupon",
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    pinCode: String,
    phone: String,
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
  deliveredAt: Date,
});

export const Order = mongoose.model("Order", orderSchema);

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  messages: [
    {
      role: { type: String, enum: ["system", "user", "assistant"], required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export const ChatMemory = mongoose.model("ChatMemory", chatMessageSchema);
