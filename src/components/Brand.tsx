import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  variant?: "hero" | "navbar";
};

export function Brand({ className, variant = "navbar" }: BrandProps) {
  const isNavbar = variant === "navbar";

  return (
    <div
      className={cn(
        "min-w-0",
        isNavbar
          ? "flex items-center gap-3"
          : "flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-5 lg:gap-6",
        className,
      )}
    >
      <BrandLogo variant={variant} />

      <div
        className={cn(
          "min-w-0",
          isNavbar ? "space-y-0.5" : "space-y-2.5 sm:space-y-2",
        )}
      >
        <p
          className={cn(
            "m-0 text-primary",
            isNavbar
              ? "truncate text-[16px] font-semibold tracking-tight"
              : "text-[clamp(2.45rem,5.4vw,4.35rem)] font-semibold leading-[1.02] tracking-[-0.045em]",
          )}
        >
          {siteConfig.name}
        </p>
        <p
          className={cn(
            "m-0 uppercase text-secondary",
            isNavbar
              ? "truncate text-[11px] font-medium tracking-[0.12em] opacity-55"
              : "text-[11px] font-medium tracking-[0.2em] opacity-70 sm:text-[12px] sm:tracking-[0.22em]",
          )}
        >
          {siteConfig.subtitle}
        </p>
      </div>
    </div>
  );
}
