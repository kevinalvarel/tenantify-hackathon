import { NextResponse } from "next/server";
import { classifyComment } from "@/lib/ai-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      commentText?: string;
      commentId?: string;
      tenantId?: string;
      rating?: number;
    };

    const commentText = body.commentText?.trim() ?? "";
    if (!commentText) {
      return NextResponse.json(
        { error: "Teks ulasan tidak boleh kosong." },
        { status: 400 },
      );
    }

    const moderation = await classifyComment({
      comment_text: commentText,
      comment_id: body.commentId,
      tenant_id: body.tenantId,
      rating: body.rating,
    });

    const accepted =
      Boolean(moderation.is_delivered_to_dashboard) &&
      moderation.action !== "AUTO_REMOVED";

    return NextResponse.json({
      accepted,
      moderation,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memoderasi ulasan.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

