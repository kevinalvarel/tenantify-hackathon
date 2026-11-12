import type { CustomerProduct } from "@/types/customer";

const AI_BASE_URL =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "https://s4usan-tenantify-models.hf.space";

export type AIRecommendationItem = {
  product: CustomerProduct;
  hybrid_score: number;
  semantic_score: number;
  complementary_score: number;
  reason: string;
  isFallback?: boolean;
};

export type AIRecommendResponse = {
  recommendations: AIRecommendationItem[];
  total_returned: number;
};

export type CommentClassificationResult = {
  comment_id?: string | null;
  tenant_id?: string | null;
  original_text: string;
  cleaned_text: string;
  category:
    | "Kritik & Saran Positif"
    | "Kritik & Saran Negatif"
    | "Comment aneh-aneh (komentar yang berbahasa kasar)"
    | string;
  action: "DELIVERED_TO_DASHBOARD" | "AUTO_REMOVED" | string;
  is_delivered_to_dashboard: boolean;
  confidence_score: number;
  sentiment: "POSITIVE" | "NEGATIVE" | "TOXIC" | string;
  aspects: string[];
  flagged_words: string[];
  moderation_reason: string;
  dashboard_badge?: string | null;
};

export async function getRecommendationsByProduct(
  productId: string,
  topN = 4,
): Promise<AIRecommendResponse> {
  const res = await fetch(`${AI_BASE_URL}/recommend/by-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      top_n: topN,
      exclude_same_tenant: true,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`AI recommend error: ${res.status}`);
  return res.json();
}

export async function getRecommendationsByOrder(
  items: Array<{
    productName: string;
    tenantName: string;
    price: number;
    quantity: number;
    notes?: string;
  }>,
  topN = 4,
): Promise<AIRecommendResponse> {
  const res = await fetch(`${AI_BASE_URL}/recommend/by-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, top_n: topN }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`AI order recommend error: ${res.status}`);
  return res.json();
}

export async function classifyComment(payload: {
  comment_text: string;
  comment_id?: string;
  tenant_id?: string;
  rating?: number;
}): Promise<CommentClassificationResult> {
  const res = await fetch(`${AI_BASE_URL}/comments/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`AI classify error: ${res.status}`);
  return res.json();
}

