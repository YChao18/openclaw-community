import Link from "next/link";
import { AuthAccess } from "@/components/ui/auth-access";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navigation, siteConfig } from "@/config/site";

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
          <nav className="bg-surface border-default hidden items-center gap-1 rounded-full border px-2 py-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-secondary hover:text-primary hover:bg-interactive-muted-hover rounded-full px-3 py-2 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <AuthAccess />
        </div>
      </div>
    </header>
  );
}
