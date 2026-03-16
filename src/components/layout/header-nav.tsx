"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/site";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface/82 border-default/70 hidden items-center gap-1 rounded-full border px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_16px_rgba(15,23,42,0.04)] backdrop-blur-sm md:flex">
      {navigation.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-2 text-[15px] transition duration-200",
              isActive
                ? "bg-interactive-muted text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                : "text-secondary hover:bg-interactive-muted-hover hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
