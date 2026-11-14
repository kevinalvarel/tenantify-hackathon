"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="h-11 cursor-pointer gap-2 rounded-xl bg-[#b34a24] px-5 font-bold text-white hover:bg-[#9e401f]"
    >
      <Printer className="size-4" aria-hidden="true" />
      Cetak / Simpan PDF
    </Button>
  );
}
