import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Coupon, Order, product, User } from "../src/db.js";
import {
  buildUPIPaymentUri,
  getUPIConfig,
} from "../src/services/payment.service.js";
import {
  api,
  buildShippingAddress,
  createAdmin,
  createCreatorWithCoupon,
  createCustomer,
  createProduct,
  resetTestDb,
  startTestDb,
  stopTestDb,
} from "./helpers.js";

let customer: { user: any; token: string };
let admin: { admin: any; token: string };

beforeAll(async () => {
  await startTestDb();
  customer = await createCustomer("alice@test.com");
  admin = await createAdmin();
});

beforeEach(async () => {
  await resetTestDb();
  // Re-seed identity after the reset.
  customer = await createCustomer("alice@test.com");
  admin = await createAdmin();
});

afterAll(async () => {
  await stopTestDb();
});

const placeOrder = (
  token: string,
  body: Record<string, unknown>
) =>
  api()
    .post("/api/v1/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(body);

describe("authentication & authorization", () => {
  it("rejects unauthenticated access to admin endpoints with 401", async () => {
    const response = await api().get("/api/v1/admin/users");
    expect(response.status).toBe(401);
  });

  it("rejects a valid CUSTOMER token on admin endpoints with 403", async () => {
    const response = await api()
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${customer.token}`);
    expect(response.status).toBe(403);
  });

  it("allows an ADMIN token on admin endpoints", async () => {
    const response = await api()
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${admin.token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.allusers)).toBe(true);
  });

  it("rejects garbage/invalid tokens with 401", async () => {
    const response = await api()
      .get("/api/v1/admin/allOrders")
      .set("Authorization", "Bearer not.a.jwt");
    expect(response.status).toBe(401);
  });

  it("closes the Clerk sync authentication bypass (route no longer exists)", async () => {
    const response = await api()
      .post("/api/v1/user/sync-clerk")
      .send({ clerkUserId: "fake-clerk-id", email: "hacker@test.com" });
    expect(response.status).toBe(404);
  });

  it("does not allow public admin signup without the bootstrap key", async () => {
    const response = await api().post("/api/v1/admin/signup").send({
      username: "newadmin",
      password: "password123",
    });
    expect(response.status).toBe(403);
  });

  it("disables admin signup entirely when no bootstrap key is configured", async () => {
    const original = process.env.ADMIN_BOOTSTRAP_KEY;
    delete process.env.ADMIN_BOOTSTRAP_KEY;

    try {
      const response = await api()
        .post("/api/v1/admin/signup")
        .send({ username: "newadmin", password: "password123" });
      expect(response.status).toBe(404);
    } finally {
      if (original) {
        process.env.ADMIN_BOOTSTRAP_KEY = original;
      }
    }
  });

  it("rejects admin signup with a wrong bootstrap key", async () => {
    const response = await api()
      .post("/api/v1/admin/signup")
      .set("x-bootstrap-key", "wrong-key")
      .send({ username: "newadmin", password: "password123" });
    expect(response.status).toBe(403);
  });

  it("allows admin signup only with the correct bootstrap key", async () => {
    const response = await api()
      .post("/api/v1/admin/signup")
      .set("x-bootstrap-key", "test-bootstrap-key")
      .send({ username: "bootstrapped", password: "password123" });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });
});

describe("product CRUD protection", () => {
  it("forbids customers from creating products", async () => {
    const response = await api()
      .post("/api/v1/product")
      .set("Authorization", `Bearer ${customer.token}`)
      .send({ name: "Hack", price: 100, category: "Birthday" });
    expect(response.status).toBe(403);
  });

  it("forbids customers from updating products", async () => {
    const giftProduct = await createProduct();
    const response = await api()
      .put(`/api/v1/product/${giftProduct._id}`)
      .set("Authorization", `Bearer ${customer.token}`)
      .send({ price: 1 });
    expect(response.status).toBe(403);
  });

  it("forbids customers from deleting products", async () => {
    const giftProduct = await createProduct();
    const response = await api()
      .delete(`/api/v1/product/${giftProduct._id}`)
      .set("Authorization", `Bearer ${customer.token}`);
    expect(response.status).toBe(403);
  });

  it("allows admins to create products", async () => {
    const response = await api()
      .post("/api/v1/product")
      .set("Authorization", `Bearer ${admin.token}`)
      .field("name", "Admin Gift")
      .field("price", "499")
      .field("category", "Birthday")
      .field("stock", "3");
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it("soft-deletes products instead of hard delete and hides them from storefront", async () => {
    const giftProduct = await createProduct();
    const deleteResponse = await api()
      .delete(`/api/v1/product/${giftProduct._id}`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(deleteResponse.status).toBe(200);

    const archived = await product.findById(giftProduct._id).lean();
    expect(archived?.isArchived).toBe(true);

    const listing = await api().get("/api/v1/product");
    const ids = listing.body.products.map((p: any) => String(p._id));
    expect(ids).not.toContain(String(giftProduct._id));
  });
});

describe("server-side pricing authority", () => {
  it("computes quantity pricing with delivery fee server-side", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 20 });
    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 2,
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(201);
    // 299 × 2 = 598 >= 499 → free delivery → final 598.
    expect(response.body.subtotal).toBe(598);
    expect(response.body.deliveryFee).toBe(0);
    expect(response.body.finalAmount).toBe(598);
    expect(response.body.quantity).toBe(2);
  });

  it("ignores client-supplied finalAmount entirely", async () => {
    const giftProduct = await createProduct({ price: 799, stock: 20 });
    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      finalAmount: 1,
      discountAmount: 700,
      subtotal: 0,
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(201);
    // 799 >= 499 → free delivery → 799, NOT 1.
    expect(response.body.finalAmount).toBe(799);
  });

  it("prices gift upgrades server-side from known rates", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 20 });
    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      giftUpgrades: {
        giftWrap: true,
        personalisedCard: { enabled: true, message: "Happy birthday!" },
        chocolatePack: { enabled: false },
      },
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(201);
    // 299 + 49 delivery + 99 wrap + 49 card = 496.
    expect(response.body.giftUpgradeTotal).toBe(148);
    expect(response.body.finalAmount).toBe(496);
  });

  it("validates a flat coupon and applies it to the total", async () => {
    await Coupon.create({
      code: "SAVE50",
      discountType: "flat",
      discountValue: 50,
      minOrderAmount: 0,
      active: true,
    });
    const giftProduct = await createProduct({ price: 299, stock: 20 });

    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      couponCode: "save50",
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(201);
    // 299 - 50 + 49 = 298.
    expect(response.body.couponDiscount).toBe(50);
    expect(response.body.couponCode).toBe("SAVE50");
    expect(response.body.finalAmount).toBe(298);
  });

  it("rejects an invalid coupon", async () => {
    const giftProduct = await createProduct({ price: 799, stock: 20 });
    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      couponCode: "NOPE123",
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_COUPON");
  });

  it("rejects an expired coupon", async () => {
    await Coupon.create({
      code: "EXPIRED1",
      discountType: "flat",
      discountValue: 50,
      minOrderAmount: 0,
      active: true,
      expiresAt: new Date(Date.now() - 1000),
    });
    const giftProduct = await createProduct({ price: 799, stock: 20 });

    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      couponCode: "EXPIRED1",
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_COUPON");
  });
});

describe("order idempotency", () => {
  it("creates exactly one order when the same idempotency key is retried", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const body = {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
      idempotencyKey: "checkout-attempt-123",
    };

    const first = await placeOrder(customer.token, body);
    const second = await placeOrder(customer.token, body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
    expect(second.body.orderId).toBe(first.body.orderId);

    const count = await Order.countDocuments({ user: customer.user._id });
    expect(count).toBe(1);
  });

  it("does not double-count coupon usage on retries", async () => {
    await Coupon.create({
      code: "ONCE50",
      discountType: "flat",
      discountValue: 50,
      minOrderAmount: 0,
      usageLimit: 5,
      active: true,
    });
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const body = {
      productId: giftProduct._id,
      quantity: 1,
      couponCode: "ONCE50",
      shippingAddress: buildShippingAddress(),
      idempotencyKey: "retry-coupon-1",
    };

    await placeOrder(customer.token, body);
    await placeOrder(customer.token, body);

    const coupon = await Coupon.findOne({ code: "ONCE50" }).lean();
    expect(coupon?.usedCount).toBe(1);
  });
});

describe("inventory enforcement", () => {
  it("rejects orders beyond available stock with 409", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 2 });
    const response = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 3,
      shippingAddress: buildShippingAddress(),
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("INSUFFICIENT_STOCK");
  });

  it("decrements stock atomically on successful orders", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 5 });
    await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 2,
      shippingAddress: buildShippingAddress(),
    });

    const after = await product.findById(giftProduct._id).lean();
    expect(after?.stock).toBe(3);
  });

  it("cannot oversell under concurrent requests", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 2 });

    const [first, second] = await Promise.all([
      placeOrder(customer.token, {
        productId: giftProduct._id,
        quantity: 2,
        shippingAddress: buildShippingAddress(),
        idempotencyKey: "concurrent-a",
      }),
      placeOrder(customer.token, {
        productId: giftProduct._id,
        quantity: 2,
        shippingAddress: buildShippingAddress(),
        idempotencyKey: "concurrent-b",
      }),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);

    const after = await product.findById(giftProduct._id).lean();
    expect(after?.stock).toBe(0);
  });

  it("restores stock exactly once on cancellation and blocks double restore", async () => {
    const giftProduct = await createProduct({ price: 299, stock: 5 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 2,
      shippingAddress: buildShippingAddress(),
    });
    const orderId = placed.body.orderId;

    const firstCancel = await api()
      .patch(`/api/v1/admin/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${admin.token}`);
    const secondCancel = await api()
      .patch(`/api/v1/admin/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(firstCancel.status).toBe(200);
    expect(secondCancel.status).toBe(200);
    expect(secondCancel.body.message).toContain("already");

    const after = await product.findById(giftProduct._id).lean();
    expect(after?.stock).toBe(5);
  });
});

describe("order ownership", () => {
  it("requires authentication for /orders/me", async () => {
    const response = await api().get("/api/v1/orders/me");
    expect(response.status).toBe(401);
  });

  it("shows a customer only their own orders via /orders/me", async () => {
    const otherCustomer = await createCustomer("bob@test.com");
    const giftProduct = await createProduct({ price: 499, stock: 10 });

    await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });
    await placeOrder(otherCustomer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const mine = await api()
      .get("/api/v1/orders/me")
      .set("Authorization", `Bearer ${customer.token}`);

    expect(mine.status).toBe(200);
    expect(mine.body.orders.length).toBe(1);
    expect(String(mine.body.orders[0].orderId)).toBeTruthy();
  });

  it("forbids a customer from viewing another customer's order", async () => {
    const otherCustomer = await createCustomer("bob@test.com");
    const giftProduct = await createProduct({ price: 499, stock: 10 });

    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api()
      .get(`/api/v1/orders/${placed.body.orderId}`)
      .set("Authorization", `Bearer ${otherCustomer.token}`);
    expect(response.status).toBe(403);
  });

  it("lets admins view any order", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api()
      .get(`/api/v1/orders/${placed.body.orderId}`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(response.status).toBe(200);
  });
});

describe("upi payment instructions", () => {
  it("builds a UPI URI with the configured UPI ID, INR, server amount and order reference", () => {
    const config = getUPIConfig();
    expect(config.upiId).toBe("9009917146@ptyes");

    const uri = buildUPIPaymentUri({
      upiId: config.upiId,
      upiName: "QuickWish",
      amount: 423,
      orderReference: "QW-2026-001582",
    });

    const parsed = new URL(uri);
    expect(parsed.protocol).toBe("upi:");
    expect(parsed.searchParams.get("pa")).toBe("9009917146@ptyes");
    expect(parsed.searchParams.get("pn")).toBe("QuickWish");
    expect(parsed.searchParams.get("am")).toBe("423.00");
    expect(parsed.searchParams.get("cu")).toBe("INR");
    expect(parsed.searchParams.get("tr")).toBe("QW-2026-001582");
    expect(parsed.searchParams.get("tn")).toBe("QW-2026-001582");
  });

  it("encodes query parameter values safely", () => {
    const uri = buildUPIPaymentUri({
      upiId: "9009917146@ptyes",
      upiName: "QuickWish & Co",
      amount: 1234.5,
      orderReference: "QW-2026-001582 / (gift)",
    });

    const parsed = new URL(uri);
    expect(parsed.searchParams.get("pn")).toBe("QuickWish & Co");
    expect(parsed.searchParams.get("am")).toBe("1234.50");
    expect(parsed.searchParams.get("tr")).toBe("QW-2026-001582 / (gift)");
  });

  it("serves order-specific payment instructions whose amount is the server total", async () => {
    const giftProduct = await createProduct({ price: 374, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      giftUpgrades: { giftWrap: true, personalisedCard: { enabled: false }, chocolatePack: { enabled: false } },
      couponCode: undefined,
      shippingAddress: buildShippingAddress(),
    });

    expect(placed.status).toBe(201);
    expect(placed.body.orderNumber).toMatch(/^QW-\d{4}-\d{6}$/);

    const instructions = placed.body.paymentInstructions;
    expect(instructions.amount).toBe(placed.body.finalAmount); // 374 + 99 wrap + 49 delivery = 522
    expect(instructions.orderReference).toBe(placed.body.orderNumber);
    expect(instructions.upiId).toBe("9009917146@ptyes");

    const parsed = new URL(instructions.upiUri);
    expect(parsed.searchParams.get("am")).toBe(placed.body.finalAmount.toFixed(2));
    expect(parsed.searchParams.get("pa")).toBe("9009917146@ptyes");
    expect(parsed.searchParams.get("tr")).toBe(placed.body.orderNumber);
  });

  it("client-supplied finalAmount never reaches the UPI amount", async () => {
    const giftProduct = await createProduct({ price: 799, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      finalAmount: 1,
      shippingAddress: buildShippingAddress(),
    });

    expect(placed.status).toBe(201);
    expect(placed.body.finalAmount).toBe(799);
    expect(placed.body.paymentInstructions.amount).toBe(799);
  });
});

describe("payment reporting", () => {
  it("lets the owner report their own payment and stay unverified", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    expect(placed.body.paymentStatus).toBe("PENDING");

    const reported = await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);

    expect(reported.status).toBe(200);
    expect(reported.body.paymentStatus).toBe("AWAITING_VERIFICATION");
    expect(reported.body.paymentStatus).not.toBe("VERIFIED");
    expect(reported.body.status).toBe("Processing");
    expect(reported.body.paymentReportedAt).toBeTruthy();
  });

  it("rejects reporting another customer's order with 403", async () => {
    const otherCustomer = await createCustomer("bob@test.com");
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${otherCustomer.token}`);
    expect(response.status).toBe(403);
  });

  it("requires authentication to report payment", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api().post(
      `/api/v1/orders/${placed.body.orderId}/payment-reported`
    );
    expect(response.status).toBe(401);
  });

  it("is idempotent and ignores any VERIFIED value in the body", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const first = await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`)
      .send({ paymentStatus: "VERIFIED" }); // hostile client value — ignored
    const second = await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.paymentStatus).toBe("AWAITING_VERIFICATION");
    expect(second.body.paymentStatus).toBe("AWAITING_VERIFICATION");

    const order = await Order.findById(placed.body.orderId).lean();
    expect(order?.paymentStatus).toBe("AWAITING_VERIFICATION");
    expect(order?.paymentReportedAt).toBeTruthy();
  });

  it("does not let a customer verify their own payment through any endpoint", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const confirmAttempt = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${customer.token}`);
    expect(confirmAttempt.status).toBe(403);
  });
});

describe("admin payment verification", () => {
  it("rejects unauthenticated confirm-payment with 401", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api().patch(
      `/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`
    );
    expect(response.status).toBe(401);
  });

  it("rejects a customer token with 403", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const response = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${customer.token}`);
    expect(response.status).toBe(403);
  });

  it("admin confirmation sets VERIFIED, orderConfirmed and audit fields", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const confirmed = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(confirmed.status).toBe(200);
    expect(confirmed.body.order.paymentStatus).toBe("VERIFIED");
    expect(confirmed.body.order.status).toBe("orderConfirmed");
    expect(confirmed.body.order.paidAt).toBeTruthy();
    expect(confirmed.body.order.paymentVerifiedAt).toBeTruthy();
    expect(String(confirmed.body.order.paymentVerifiedBy)).toBe(String(admin.admin._id));

    const view = await api()
      .get(`/api/v1/orders/${placed.body.orderId}`)
      .set("Authorization", `Bearer ${customer.token}`);
    expect(view.body.order.paymentStatus).toBe("VERIFIED");
  });

  it("repeated confirmation is idempotent — commission, stock, coupon never double-run", async () => {
    const { coupon } = await createCreatorWithCoupon("CREATOR1");
    const giftProduct = await createProduct({ price: 499, stock: 10 });

    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 2,
      couponCode: "CREATOR1",
      shippingAddress: buildShippingAddress(),
    });

    expect(placed.body.creatorCommissionStatus).toBe("pending");

    const first = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);
    const second = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(first.body.order.creatorCommissionStatus).toBe("earned");
    expect(second.body.message).toContain("already");
    expect(second.body.order.creatorCommissionStatus).toBe("earned");

    const order = await Order.findById(placed.body.orderId).lean();
    expect(order?.creatorCommissionStatus).toBe("earned");
    expect(order?.creatorCommission).toBe(100);

    // Stock decremented exactly once (10 - 2 = 8), coupon counted once.
    const productAfter = await product.findById(giftProduct._id).lean();
    expect(productAfter?.stock).toBe(8);

    const couponAfter = await Coupon.findById(coupon._id).lean();
    expect(couponAfter?.usedCount).toBe(1);
  });

  it("exposes the awaiting-verification queue to admins", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const pendingOrder = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    await api()
      .post(`/api/v1/orders/${pendingOrder.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);

    const queue = await api()
      .get("/api/v1/admin/payments/awaiting")
      .set("Authorization", `Bearer ${admin.token}`);

    expect(queue.status).toBe(200);
    expect(queue.body.count).toBeGreaterThanOrEqual(1);
    expect(
      queue.body.orders.some(
        (order: any) => order.orderId === pendingOrder.body.orderId
      )
    ).toBe(true);

    // A verified order leaves the queue.
    await api()
      .patch(`/api/v1/admin/orders/${pendingOrder.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);

    const after = await api()
      .get("/api/v1/admin/payments/awaiting")
      .set("Authorization", `Bearer ${admin.token}`);
    expect(
      after.body.orders.some(
        (order: any) => order.orderId === pendingOrder.body.orderId
      )
    ).toBe(false);
  });

  it("supports the legacy /confirm alias without losing idempotency", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    const first = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm`)
      .set("Authorization", `Bearer ${admin.token}`);
    const second = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.order.paymentStatus).toBe("VERIFIED");
    expect(second.body.message).toContain("already");
  });
});

describe("payment rejection & retry", () => {
  it("admin can reject a reported payment without cancelling the order", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);

    const rejected = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/reject-payment`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ reason: "Payment not found in UPI app" });

    expect(rejected.status).toBe(200);
    expect(rejected.body.order.paymentStatus).toBe("REJECTED");
    expect(rejected.body.order.paymentRejectedAt).toBeTruthy();
    expect(rejected.body.order.paymentRejectionReason).toBe("Payment not found in UPI app");
    // Reservation is kept — order status unchanged, stock still held.
    expect(rejected.body.order.status).toBe("Processing");

    const productAfter = await product.findById(giftProduct._id).lean();
    expect(productAfter?.stock).toBe(9);
  });

  it("a rejected payment can be re-reported and then verified without a duplicate order", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);
    await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/reject-payment`)
      .set("Authorization", `Bearer ${admin.token}`);

    const retry = await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);
    expect(retry.status).toBe(200);
    expect(retry.body.paymentStatus).toBe("AWAITING_VERIFICATION");

    const confirmed = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(confirmed.body.order.paymentStatus).toBe("VERIFIED");
    expect(confirmed.body.order.status).toBe("orderConfirmed");

    const orderCount = await Order.countDocuments({ user: customer.user._id });
    expect(orderCount).toBe(1); // no duplicate order from the retry
  });

  it("rejecting twice is idempotent and cannot reject a verified payment", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10 });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    await api()
      .post(`/api/v1/orders/${placed.body.orderId}/payment-reported`)
      .set("Authorization", `Bearer ${customer.token}`);

    const first = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/reject-payment`)
      .set("Authorization", `Bearer ${admin.token}`);
    const second = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/reject-payment`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(first.status).toBe(200);
    expect(second.body.message).toContain("already");

    const verified = await api()
      .patch(`/api/v1/admin/orders/${placed.body.orderId}/confirm-payment`)
      .set("Authorization", `Bearer ${admin.token}`);
    expect(verified.status).toBe(409);
    expect(verified.body.code).toBe("PAYMENT_REJECTED");
  });
});

describe("historical order snapshots", () => {
  it("keeps order readable after the product is archived", async () => {
    const giftProduct = await createProduct({ price: 499, stock: 10, name: "Keepsake Box" });
    const placed = await placeOrder(customer.token, {
      productId: giftProduct._id,
      quantity: 1,
      shippingAddress: buildShippingAddress(),
    });

    await product.findByIdAndUpdate(giftProduct._id, { isArchived: true, deletedAt: new Date() });

    const response = await api()
      .get(`/api/v1/orders/${placed.body.orderId}`)
      .set("Authorization", `Bearer ${customer.token}`);

    expect(response.status).toBe(200);
    expect(response.body.order.product.name).toBe("Keepsake Box");
    expect(response.body.order.product.unitPrice).toBe(499);
  });
});
