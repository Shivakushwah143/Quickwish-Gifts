import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, trim: true },
  password: { type: String, default: null },
  role: {
    type: String,
    enum: ["ADMIN"],
    default: "ADMIN",
    index: true,
  },
});

export const admin = mongoose.model("admin", adminSchema);

const creatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    
    trim: true,
  },
  password: {
    type: String,
    default: null,
  },
  preferredCode: {

    type: String,
    uppercase: true,
    trim: true,
  },
  assignedCouponId: {
    type: mongoose.Types.ObjectId,
    ref: "Coupon",
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["CREATOR"],
    default: "CREATOR",
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

creatorSchema.pre("save", function (this: any, next) {
  this.updatedAt = new Date();
  next();
});

export const Creator = mongoose.model("Creator", creatorSchema);

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
      "Crochet Bouquets",
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
  storefrontGroups: [
    {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
  ],
  displayOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  comparisons: [
    {
      siteName: {
        type: String,
        trim: true,
      },
      price: Number,
      url: {
        type: String,
        trim: true,
      },
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
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const product = mongoose.model("product", productSchema);

const storefrontSettingsSchema = new mongoose.Schema({
  singletonKey: {
    type: String,
    default: "default",
    unique: true,
    index: true,
  },
  heroImages: [
    {
      url: { type: String, trim: true },
      title: { type: String, trim: true },
      subtitle: { type: String, trim: true },
      enabled: { type: Boolean, default: true },
      displayOrder: { type: Number, default: 0 },
    },
  ],
  featuredProductIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: "product",
    },
  ],
  checkoutOccasionBanner: {
    image: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
  },
  giftUpgradeImages: {
    wrapping: { type: String, trim: true, default: "" },
    messageCard: { type: String, trim: true, default: "" },
    ferrero: { type: String, trim: true, default: "" },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

storefrontSettingsSchema.pre("save", function (this: any, next) {
  this.updatedAt = new Date();
  next();
});

export const StorefrontSettings =
  (mongoose.models.StorefrontSettings as mongoose.Model<any>) ||
  mongoose.model("StorefrontSettings", storefrontSettingsSchema);

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
    type: mongoose.Types.ObjectId,
    ref: "Creator",
  },
  isCreatorCode: {
    type: Boolean,
    default: false,
    index: true,
  },
  commissionPerOrder: {
    type: Number,
    default: 100,
    min: 0,
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
    unique: true,
    sparse: true,
    index: true,
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
    ref: "product",
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
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: [
      "PENDING",
      "PROOF_SUBMITTED", // legacy value from the old screenshot/WhatsApp flow
      "AWAITING_VERIFICATION",
      "VERIFIED",
      "REJECTED",
    ],
    default: "PENDING",
    index: true,
  },
  // Human-readable unique order reference, e.g. QW-2026-001582. Used as the
  // UPI transaction reference (tr) so admin can find the payment in the UPI app.
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  productSnapshot: {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "product",
    },
    name: String,
    image: String,
    unitPrice: Number,
    quantity: Number,
    category: String,
  },
  paymentMethod: {
    type: String,
    default: "UPI_DIRECT",
    // Legacy orders may still hold "WhatsApp/UPI" — those values stay readable.
  },
  whatsappProof: String, // Deprecated: legacy screenshot URL from the old proof flow. Never written by new orders.
  // Payment lifecycle audit trail (zero-gateway UPI verification).
  paymentReportedAt: Date,
  paymentExpiresAt: Date,
  paymentVerifiedAt: Date,
  paymentVerifiedBy: {
    type: mongoose.Types.ObjectId,
    ref: "admin",
  },
  paymentRejectedAt: Date,
  paymentRejectedBy: {
    type: mongoose.Types.ObjectId,
    ref: "admin",
  },
  paymentRejectionReason: String,
  amount: {
    type: Number,
    required: true,
  },
  originalAmount: {
    type: Number,
    required: false,
  },
  subtotal: {
    type: Number,
    required: false,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  giftUpgradeTotal: {
    type: Number,
    default: 0,
  },
  giftUpgrades: {
    giftWrap: {
      type: Boolean,
      default: false,
    },
    personalisedCard: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "",
        maxlength: 250,
      },
    },
    chocolatePack: {
      enabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ["FERRERO_ROCHER"],
        default: "FERRERO_ROCHER",
      },
    },
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
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: "Creator",
  },
  creatorCode: {
    type: String,
    uppercase: true,
    trim: true,
  },
  creatorCommission: {
    type: Number,
    default: 0,
  },
  creatorCommissionStatus: {
    type: String,
    enum: ["none", "pending", "earned", "cancelled"],
    default: "none",
    index: true,
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

/**
 * Atomic per-year sequence used to mint human-readable order numbers
 * (QW-2026-001582). findOneAndUpdate with upsert keeps concurrent order
 * creation race-free.
 */
const orderCounterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

export const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);

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
