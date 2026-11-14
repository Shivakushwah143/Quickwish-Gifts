import type { Request, Response } from "express";
import { PRODUCT_CATEGORIES, product } from "../../db.js";

/**
 * Categories and tags exposed to the connector. Categories come from the
 * product schema enum, so a connector can never invent an invalid category.
 */

type CategoryCount = { productCount: number; publishedCount: number };

export const connectorListCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const rows = await product.aggregate<{
      _id: string;
      productCount: number;
      publishedCount: number;
    }>([
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          publishedCount: {
            $sum: { $cond: [{ $ne: ["$status", "draft"] }, 1, 0] },
          },
        },
      },
    ]);

    const counts = new Map<string, CategoryCount>();

    for (const row of rows) {
      if (typeof row._id === "string") {
        counts.set(row._id, {
          productCount: Number(row.productCount) || 0,
          publishedCount: Number(row.publishedCount) || 0,
        });
      }
    }

    res.status(200).json({
      success: true,
      categories: PRODUCT_CATEGORIES.map((name) => ({
        name,
        ...(counts.get(name) ?? { productCount: 0, publishedCount: 0 }),
      })),
    });
  } catch {
    res.status(500).json({
      success: false,
      code: "CATEGORY_LIST_FAILED",
      message: "Failed to list categories",
    });
  }
};

export const connectorListTags = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tags = await product.distinct("tags");

    res.status(200).json({
      success: true,
      tags: tags.map((tag) => String(tag)).filter(Boolean).sort(),
    });
  } catch {
    res.status(500).json({
      success: false,
      code: "TAG_LIST_FAILED",
      message: "Failed to list tags",
    });
  }
};
