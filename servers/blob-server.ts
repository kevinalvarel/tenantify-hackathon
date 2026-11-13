"use server";

import { put, del } from "@vercel/blob";

export type BlobUploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Server action to upload product photos to Vercel Blob storage.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<BlobUploadResult> {
  try {
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { success: false, error: "Berkas tidak ditemukan." };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Format berkas harus berupa gambar (PNG, JPG, JPEG, WebP).",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Ukuran berkas melebihi batas maksimal 5MB.",
      };
    }

    const ext = file.name.split(".").pop() || "png";
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const pathname = `products/${Date.now()}-${cleanName}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
    });

    return {
      success: true,
      url: blob.url,
    };
  } catch (error) {
    console.error("Gagal mengunggah berkas ke Vercel Blob:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengunggah gambar ke Blob Storage.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server action to remove uploaded file from Vercel Blob storage.
 */
export async function deleteBlobAction(
  url: string
): Promise<{ success: boolean }> {
  try {
    if (url && url.includes("blob.vercel-storage.com")) {
      await del(url);
    }
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus berkas Blob:", error);
    return { success: false };
  }
}

