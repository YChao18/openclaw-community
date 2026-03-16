import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-default/70 border-t">
      <div className="text-secondary mx-auto flex max-w-[1480px] flex-col gap-4 px-6 py-6 text-sm md:px-8 lg:px-12">
        <p className="text-primary font-medium">{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/posts" className="hover:text-primary">
            浏览帖子
          </Link>
          <Link href="/tags" className="hover:text-primary">
            浏览标签
          </Link>
          <Link href="/about" className="hover:text-primary">
            项目介绍
          </Link>
        </div>
      </div>
    </footer>
  );
}
