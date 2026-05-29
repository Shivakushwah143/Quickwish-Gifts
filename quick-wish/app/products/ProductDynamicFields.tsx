"use client";

import { useEffect, useState } from "react";

type DynamicProductFields = {
  price: number;
  stock: number;
  availability: "in-stock" | "out-of-stock";
  personalization: boolean;
  originalPrice?: number;
  offPrice?: number;
  discountPercent?: number;
};

type ApiProduct = {
  _id?: string;
  price?: number;
  stock?: number;
  originalPrice?: number;
  offPrice?: number;
  discountPercent?: number;
  tags?: string[];
  category?: string;
};

type ProductsResponse = {
  products?: ApiProduct[];
};

type ProductResponse = {
  singleProduct?: ApiProduct;
  product?: ApiProduct;
};

type ProductDynamicFieldsProps = {
  productId: string;
  mode?: "card" | "detail";
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const isProductResponse = (
  value: ProductResponse | ApiProduct
): value is ProductResponse => {
  return "singleProduct" in value || "product" in value;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const toDynamicFields = (product: ApiProduct): DynamicProductFields => {
  const stock = Number(product.stock || 0);
  const tags = product.tags || [];
  const personalization =
    tags.some((tag) => tag.toLowerCase().includes("personal")) ||
    product.category === "Personalized Gifts";

  return {
    price: Number(product.price || 0),
    stock,
    availability: stock > 0 ? "in-stock" : "out-of-stock",
    personalization,
    originalPrice: product.originalPrice,
    offPrice: product.offPrice,
    discountPercent: product.discountPercent,
  };
};

const calculateDiscount = (
  currentPrice: number,
  originalPrice?: number,
  discountPercent?: number
): number => {
  if (typeof discountPercent === "number" && discountPercent > 0) {
    return discountPercent;
  }

  if (typeof originalPrice === "number" && originalPrice > currentPrice) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  return 0;
};

export default function ProductDynamicFields({
  productId,
  mode = "card",
}: ProductDynamicFieldsProps) {
  const [fields, setFields] = useState<DynamicProductFields | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDynamicFields = async () => {
      if (!API_BASE_URL) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as ProductResponse | ApiProduct;
        const product = isProductResponse(data)
          ? data.singleProduct || data.product
          : data;

        if (isMounted && product) {
          setFields(toDynamicFields(product));
        }
      } catch (error) {
        console.error("Failed to load dynamic product fields", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchDynamicFields();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-5 w-24 rounded bg-[#eadfd4]/70 animate-pulse" />
        <div className="h-6 w-full rounded bg-[#eadfd4]/60 animate-pulse" />
      </div>
    );
  }

  if (!fields) {
    return (
      <p className="rounded-full bg-[#fff4e4] px-2.5 py-1 text-[11px] font-semibold text-[#8b3f2f]">
        Details updating
      </p>
    );
  }

  const originalPrice = fields.originalPrice || fields.offPrice;
  const discount = calculateDiscount(
    fields.price,
    originalPrice,
    fields.discountPercent
  );

  if (mode === "detail") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-3xl font-semibold text-[color:var(--wine)]">
            {formatPrice(fields.price)}
          </span>
          {originalPrice && originalPrice > fields.price && (
            <span className="text-lg text-[color:var(--muted)] line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-[color:var(--gold)]/20 px-2 py-0.5 text-sm font-medium text-[color:var(--plum)]">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="lux-pill px-3 py-1 text-xs">
            {fields.availability === "in-stock"
              ? "Available today"
              : "Currently unavailable"}
          </span>
          <span className="lux-pill px-3 py-1 text-xs">
            Stock: {fields.stock}
          </span>
          {fields.personalization && (
            <span className="lux-pill px-3 py-1 text-xs">
              Personalization available
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-[color:var(--wine)]">
          {formatPrice(fields.price)}
        </span>
        {originalPrice && originalPrice > fields.price && (
          <span className="text-xs text-[color:var(--muted)] line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>
      <p className="rounded-md bg-[#fff4e4] px-2 py-1 text-[11px] font-semibold text-[#8b3f2f]">
        {fields.availability === "in-stock"
          ? "Same day delivery"
          : "Out of stock"}
      </p>
    </div>
  );
}

export const fetchDynamicProducts = async (): Promise<
  Record<string, DynamicProductFields>
> => {
  if (!API_BASE_URL) {
    return {};
  }

  const response = await fetch(`${API_BASE_URL}/product`, {
    cache: "no-store",
  });
  const data = (await response.json()) as ProductsResponse;

  return (data.products || []).reduce<Record<string, DynamicProductFields>>(
    (acc, product) => {
      if (product._id) {
        acc[product._id] = toDynamicFields(product);
      }
      return acc;
    },
    {}
  );
};
