import Link from "next/link";
import { HeaderNav } from "@/components/layout/header-nav";
import { AuthAccess } from "@/components/ui/auth-access";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

export async function SiteHeader() {
  return (
    <header className="bg-background/75 border-default/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
        <Link href="/" className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
          <span className="text-secondary truncate text-xs tracking-[0.24em] uppercase">
            {siteConfig.subtitle}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <HeaderNav />
          <ThemeToggle />
          <AuthAccess />
        </div>
      </div>
    </header>
  );
}
