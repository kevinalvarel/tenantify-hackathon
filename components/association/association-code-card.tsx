"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ensureAssociationCodeAction } from "@/servers/account-server";

export function AssociationCodeCard({
  initialCode,
}: {
  initialCode: string | null;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kode pengelola disalin.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const response = await ensureAssociationCodeAction();
    setIsLoading(false);

    if (!response.success || !response.code) {
      toast.error(response.message);
      return;
    }

    setCode(response.code);
    toast.success(response.message);
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Kode Unik Pengelola
            </p>
            <p className="font-mono text-xl font-bold tracking-[0.3em]">
              {code ?? "Belum dibuat"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Bagikan kode ini ke pembeli agar mereka bisa menemukan area Anda.
            </p>
          </div>
        </div>

        {code ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Tersalin" : "Salin Kode"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="size-3.5" /> : null}
            {isLoading ? "Membuat..." : "Buat Kode"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
