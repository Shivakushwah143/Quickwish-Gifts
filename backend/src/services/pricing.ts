import { Coupon } from "../db.js";

/**
 * Single authoritative pricing domain for QuickWish orders.
 *
 * The server computes every financial number. Client-supplied prices,
 * discount amounts and final totals are never trusted.
 */

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 499;
export const MAX_ORDER_QUANTITY = 10;

export const GIFT_UPGRADE_PRICES = {
  giftWrap: 99,
  personalisedCard: 49,
  ferreroRocher: 149,
} as const;

export const normalizeCouponCode = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
};

export type GiftUpgradesInput = {
  giftWrap?: unknown;
  personalisedCard?: {
    enabled?: unknown;
    message?: unknown;
  };
  chocolatePack?: {
    enabled?: unknown;
    type?: unknown;
  };
};

export type GiftUpgradeSelections = {
  giftWrap: boolean;
  personalisedCard: {
    enabled: boolean;
    message: string;
  };
  chocolatePack: {
    enabled: boolean;
    type: "FERRERO_ROCHER";
  };
};

type ProductPricingSource = any;

type CouponPricingSource = {
  discountType?: unknown;
  discountValue?: unknown;
};

/**
 * The selling price is `price` (frontend treats it as the current price), with
 * offPrice/originalPrice as legacy fallbacks.
 */
export const getUnitPrice = (giftProduct: ProductPricingSource | null | undefined): number => {
  const candidateValues = [
    giftProduct?.price,
    giftProduct?.offPrice,
    giftProduct?.originalPrice,
  ];

  for (const value of candidateValues) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return 0;
};

export const calculateCouponDiscount = (
  baseAmount: number,
  coupon: CouponPricingSource | null
): { discountAmount: number; finalAmount: number } => {
  const safeBaseAmount =
    Number.isFinite(baseAmount) && baseAmount > 0 ? baseAmount : 0;

  if (!coupon || safeBaseAmount <= 0) {
    return {
      discountAmount: 0,
      finalAmount: safeBaseAmount,
    };
  }

  let discountAmount = 0;

  if (coupon.discountType === "flat") {
    discountAmount = Math.min(Number(coupon.discountValue) || 0, safeBaseAmount);
  } else {
    discountAmount = (safeBaseAmount * (Number(coupon.discountValue) || 0)) / 100;
  }

  const roundedDiscount = Math.max(
    0,
    Math.min(safeBaseAmount, Number(discountAmount.toFixed(2)))
  );
  const finalAmount = Number((safeBaseAmount - roundedDiscount).toFixed(2));

  return {
    discountAmount: roundedDiscount,
    finalAmount,
  };
};

export const normalizeGiftUpgrades = (
  input: GiftUpgradesInput | undefined
): { upgrades: GiftUpgradeSelections; total: number } => {
  const giftWrap = input?.giftWrap === true;
  const personalisedCardEnabled = input?.personalisedCard?.enabled === true;
  const message =
    typeof input?.personalisedCard?.message === "string"
      ? input.personalisedCard.message.trim().slice(0, 250)
      : "";
  const chocolatePackEnabled = input?.chocolatePack?.enabled === true;

  const upgrades: GiftUpgradeSelections = {
    giftWrap,
    personalisedCard: {
      enabled: personalisedCardEnabled,
      message: personalisedCardEnabled ? message : "",
    },
    chocolatePack: {
      enabled: chocolatePackEnabled,
      type: "FERRERO_ROCHER",
    },
  };

  const total =
    (upgrades.giftWrap ? GIFT_UPGRADE_PRICES.giftWrap : 0) +
    (upgrades.personalisedCard.enabled ? GIFT_UPGRADE_PRICES.personalisedCard : 0) +
    (upgrades.chocolatePack.enabled ? GIFT_UPGRADE_PRICES.ferreroRocher : 0);

  return {
    upgrades,
    total,
  };
};

export interface OrderPricingInput {
  product: ProductPricingSource;
  quantity: number;
  coupon: CouponPricingSource | null;
  giftUpgrades: GiftUpgradesInput | undefined;
}

export interface CouponValidationResult {
  ok: boolean;
  message?: string;
  coupon?: any;
  discountAmount?: number;
  finalAmount?: number;
}

export interface OrderPricing {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  giftUpgradeTotal: number;
  couponDiscount: number;
  deliveryFee: number;
  finalAmount: number;
}

/**
 * Full server-side order calculation:
 * subtotal = unitPrice * quantity
 * final    = subtotal - couponDiscount + giftUpgradeTotal + deliveryFee
 */
export const calculateOrderPricing = ({
  product: giftProduct,
  quantity,
  coupon,
  giftUpgrades,
}: OrderPricingInput): OrderPricing => {
  const unitPrice = getUnitPrice(giftProduct);
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const subtotal = Number((unitPrice * safeQuantity).toFixed(2));

  const normalized = normalizeGiftUpgrades(giftUpgrades);
  const { discountAmount } = calculateCouponDiscount(subtotal, coupon);

  const safeSubtotal = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
  const safeCouponDiscount =
    Number.isFinite(discountAmount) && discountAmount > 0
      ? Math.min(discountAmount, safeSubtotal)
      : 0;
  const safeGiftUpgradeTotal =
    Number.isFinite(normalized.total) && normalized.total > 0
      ? normalized.total
      : 0;
  const deliveryFee =
    safeSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const finalAmount = Number(
    (
      safeSubtotal -
      safeCouponDiscount +
      safeGiftUpgradeTotal +
      deliveryFee
    ).toFixed(2)
  );

  return {
    unitPrice,
    quantity: safeQuantity,
    subtotal: safeSubtotal,
    giftUpgradeTotal: safeGiftUpgradeTotal,
    couponDiscount: safeCouponDiscount,
    deliveryFee,
    finalAmount,
  };
};

/**
 * Validates a coupon against the database. No side effects — does not mutate
 * usage counters.
 */
export const validateCouponForAmount = async (
  code: unknown,
  baseAmount: number
): Promise<CouponValidationResult> => {
  const couponCode = normalizeCouponCode(code);

  if (!couponCode) {
    return {
      ok: true,
      coupon: null,
      discountAmount: 0,
      finalAmount: baseAmount,
    };
  }

  const coupon = await Coupon.findOne({
    code: couponCode,
    active: true,
  });

  if (!coupon) {
    return {
      ok: false,
      message: "Invalid coupon code",
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      message: "Coupon has expired",
    };
  }

  if (Number(coupon.minOrderAmount || 0) > baseAmount) {
    return {
      ok: false,
      message: `Minimum order amount for this coupon is Rs ${coupon.minOrderAmount}`,
    };
  }

  if (
    typeof coupon.usageLimit === "number" &&
    coupon.usageLimit > 0 &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return {
      ok: false,
      message: "Coupon usage limit has been reached",
    };
  }

  const { discountAmount, finalAmount } = calculateCouponDiscount(
    baseAmount,
    coupon
  );

  return {
    ok: true,
    coupon,
    discountAmount,
    finalAmount,
  };
};
