import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { user } from "@/db/schema";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateAssociationCode() {
  return Array.from(
    { length: CODE_LENGTH },
    () => ALPHABET[randomInt(ALPHABET.length)],
  ).join("");
}

export async function assignAssociationCode(userId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAssociationCode();
    // shortcut: cek unik sebelum update, tabrakan sangat kecil — tambahkan retry saat volume naik
    const [taken] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.associationCode, code))
      .limit(1);

    if (taken) continue;

    await db
      .update(user)
      .set({ associationCode: code })
      .where(eq(user.id, userId));

    return code;
  }

  throw new Error("Gagal membuat kode unik. Coba lagi.");
}
