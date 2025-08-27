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
