import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  variant?: "hero" | "navbar";
};

const LOGO_SRC = "/brand/cobrand-logo.png";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 1024;
const logoFilePath = join(process.cwd(), "public", "brand", "cobrand-logo.png");

export function BrandLogo({
  className,
  variant = "navbar",
}: BrandLogoProps) {
  if (!existsSync(logoFilePath)) {
    return null;
  }

  const isNavbar = variant === "navbar";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "shrink-0",
        isNavbar
          ? "max-h-[42px] sm:max-h-[44px]"
          : "w-full max-w-[104px] sm:max-w-[120px] lg:max-w-[136px]",
        className,
      )}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={isNavbar}
        className={cn(
          "block object-contain",
          isNavbar
            ? "h-auto w-auto max-h-[42px] sm:max-h-[44px]"
            : "h-auto w-full",
        )}
      />
    </div>
  );
}
