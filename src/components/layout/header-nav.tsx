"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/site";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface border-default hidden items-center gap-1 rounded-full border px-2 py-1 md:flex">
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
              "rounded-full px-3 py-2 text-sm transition",
              isActive
                ? "bg-interactive-muted text-primary"
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
