import { product } from "../db.js";

/**
 * Inventory enforcement.
 *
 * Stock is only ever changed with atomic guarded updates so concurrent orders
 * cannot oversell. We never "read stock, check, then save stock".
 */

/**
 * Atomically decrement stock only when enough is available.
 * Returns true when exactly one document was updated.
 */
export const decrementProductStock = async (
  productId: string,
  quantity: number
): Promise<boolean> => {
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

  const result = await product.updateOne(
    { _id: productId, stock: { $gte: safeQuantity } },
    { $inc: { stock: -safeQuantity } }
  );

  return result.modifiedCount === 1;
};

/**
 * Return stock. Callers are responsible for ensuring this happens exactly once
 * per order lifecycle (e.g. only on the cancelled/rejected transition).
 */
export const restoreProductStock = async (
  productId: string,
  quantity: number
): Promise<void> => {
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

  await product.updateOne(
    { _id: productId },
    { $inc: { stock: safeQuantity } }
  );
};
