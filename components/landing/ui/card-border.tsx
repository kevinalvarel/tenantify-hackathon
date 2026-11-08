import { cn } from "@/lib/utils";
import Image from "next/image";

interface SolutionItem {
  icon: string;
  body: string;
}

export function CardBorder({ SOLUTIONS }: { SOLUTIONS: SolutionItem[] }) {
  return (
    <>
      <div className="relative grid border-y border-foreground/30 md:grid-cols-3">
        {}
        <div className="absolute -top-[1.5px] -left-[1.5px] z-10 hidden h-4 w-4 border-l-[3px] border-t-[3px] border-foreground/40 md:block" />
        <div className="absolute -top-[1.5px] -right-[1.5px] z-10 hidden h-4 w-4 border-r-[3px] border-t-[3px] border-foreground/40 md:block" />

        {}
        <div className="absolute -top-[1.5px] left-[calc(33.333%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
          <div className="absolute top-0 h-[3px] w-full bg-foreground/40" />
          <div className="h-full w-[3px] bg-foreground/40" />
        </div>
        <div className="absolute -top-[1.5px] left-[calc(66.667%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
          <div className="absolute top-0 h-[3px] w-full bg-foreground/40" />
          <div className="h-full w-[3px] bg-foreground/40" />
        </div>

        {}
        <div className="absolute -bottom-[1.5px] -left-[1.5px] z-10 hidden h-4 w-4 border-b-[3px] border-l-[3px] border-foreground/40 md:block" />
        <div className="absolute -bottom-[1.5px] -right-[1.5px] z-10 hidden h-4 w-4 border-b-[3px] border-r-[3px] border-foreground/40 md:block" />

        {}
        <div className="absolute -bottom-[1.5px] left-[calc(33.333%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
          <div className="absolute bottom-0 h-[3px] w-full bg-foreground/40" />
          <div className="h-full w-[3px] bg-foreground/40" />
        </div>
        <div className="absolute -bottom-[1.5px] left-[calc(66.667%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
          <div className="absolute bottom-0 h-[3px] w-full bg-foreground/40" />
          <div className="h-full w-[3px] bg-foreground/40" />
        </div>

        {SOLUTIONS.map(({ icon, body }, idx) => (
          <div
            key={body}
            className={cn(
              "px-6 py-10 md:px-12 flex flex-col items-center text-center",
              idx > 0 &&
                "md:border-l md:border-foreground/30 flex flex-col items-center text-center",
            )}
          >
            <Image
              src={icon}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
              aria-hidden
            />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
