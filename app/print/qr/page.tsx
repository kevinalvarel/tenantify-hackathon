import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import QRCode from "qrcode";
import { resolveUmkmByCodeAction } from "@/servers/customer-server";
import { PrintButton } from "./print-button";

export const instant = false;

export const metadata: Metadata = {
  title: "Cetak QR | Tenantify",
  robots: { index: false, follow: false },
};

const CODE_PATTERN = /^[A-Z0-9]{4,20}$/;

function getOrigin(headerList: Headers) {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "http://localhost:3000";

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export default async function QrPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const code = (rawCode ?? "").trim().toUpperCase();

  if (!CODE_PATTERN.test(code)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-neutral-900">
            Kode QR tidak valid
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Buka halaman ini dari tombol Cetak QR pada kartu kode pengelola.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#b34a24] px-4 text-sm font-bold text-white hover:bg-[#9e401f]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const origin = getOrigin(await headers());
  const joinUrl = `${origin}/join?code=${encodeURIComponent(code)}`;
  const [qrSvg, result] = await Promise.all([
    QRCode.toString(joinUrl, {
      type: "svg",
      margin: 1,
      width: 720,
      errorCorrectionLevel: "M",
      color: { dark: "#1c1917", light: "#ffffff" },
    }),
    resolveUmkmByCodeAction(code),
  ]);

  const umkm = result.success ? result.umkm : null;
  const typeLabel =
    umkm?.type === "paguyuban" ? "Paguyuban" : "Stan UMKM";

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/association"
          className="text-sm font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Kembali ke Dashboard
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto flex min-h-[70vh] w-full max-w-[210mm] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl print:h-[296mm] print:min-h-0 print:rounded-none print:border-0 print:shadow-none">
        <div className="h-2 w-full bg-[#c85a32] print:h-[8mm]" />

        <div className="flex flex-1 flex-col items-center px-6 py-8 text-center sm:px-12 sm:py-10 print:justify-between print:px-[18mm] print:py-[14mm]">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-neutral-900">
            <Building2 className="size-6 text-[#c85a32]" aria-hidden="true" />
            <span>
              Tenant<span className="text-[#c85a32]">ify</span>
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center print:mt-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              Scan untuk buka menu
            </p>
            <h1 className="mt-3 max-w-[34ch] text-pretty break-words text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl print:text-[15mm]">
              {umkm?.name ?? "Menu UMKM Tenantify"}
            </h1>
            {umkm?.location && (
              <p className="mt-2 break-words text-sm font-medium text-neutral-600">
                {umkm.location}
              </p>
            )}

            <div
              role="img"
              className="mt-6 w-56 rounded-2xl border-4 border-neutral-900 bg-white p-3 [&>svg]:h-auto [&>svg]:w-full sm:w-72 print:mt-[10mm] print:w-[92mm] print:rounded-none print:p-[4mm] print:border-[2mm]"
              aria-label={`QR code untuk kode ${code}`}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 print:mt-[8mm]">
              Kode unik
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-[#c85a32] sm:text-4xl print:text-[12mm] print:tracking-[0.12em]">
              {code}
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-600">
              {typeLabel}
            </p>
          </div>

          <div className="mt-8 max-w-[42ch] text-pretty text-sm leading-relaxed text-neutral-600 print:mt-0 print:text-[4mm]">
            <p>
              Buka kamera HP, arahkan ke QR code di atas. Anda juga bisa membuka
              halaman join dan memasukkan kode unik secara manual.
            </p>
            <p className="mt-2 break-all text-xs text-neutral-500 print:text-[3.5mm]">
              {origin}/join
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
