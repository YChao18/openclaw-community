import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-default/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-secondary md:px-8 lg:px-12">
        <p className="font-medium text-primary">{siteConfig.name}</p>
        <p>
          基于 Next.js、Prisma、PostgreSQL 与 Auth.js 构建的 OpenClaw 用户社区。
        </p>
      </div>
    </footer>
  );
}
