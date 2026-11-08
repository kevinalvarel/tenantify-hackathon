import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductShot as ProductShotData } from "@/lib/landing/product-content";

/**
 * A product screenshot, or the frame that names the file it is still waiting
 * for. Exactly one of `src` and `expectedPath` is set on every role, so this
 * never requests a file that is not committed and never shows a broken image.
 */
export function ProductShot({
  shot,
  className,
}: {
  shot: ProductShotData;
  className?: string;
}) {
  if (shot.src) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-xs",
          className,
        )}
      >
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(min-width: 1024px) 38vw, 100vw"
          className="object-cover object-top"
          priority={false}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/20 bg-muted/40 p-6 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground">
        <ImageOff className="size-6" aria-hidden />
      </span>
      <p className="font-sans text-sm font-bold text-foreground">{shot.alt}</p>
      <p className="max-w-full break-all font-mono text-xs text-muted-foreground">
        {shot.expectedPath}
      </p>
      <p className="font-sans text-xs text-muted-foreground">
        Tangkapan layar ini belum tersedia. Letakkan berkasnya di lokasi di
        atas.
      </p>
    </div>
  );
}
