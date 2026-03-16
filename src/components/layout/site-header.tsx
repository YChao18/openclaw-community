import Link from "next/link";
import { Brand } from "@/components/Brand";
import { HeaderNav } from "@/components/layout/header-nav";
import { AuthAccess } from "@/components/ui/auth-access";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-default/60 bg-background/82 shadow-[0_10px_30px_rgba(15,23,42,0.03)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
        <Link
          href="/"
          className="min-w-0 rounded-2xl transition duration-200 hover:opacity-95 hover:shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
        >
          <Brand variant="navbar" />
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
