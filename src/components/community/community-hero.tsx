import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./community-hero.module.css";

type CommunityHeroProps = {
  className?: string;
};

export function CommunityHero({ className }: CommunityHeroProps) {
  return (
    <section className={cn(styles.heroShell, className)}>
      <div className={styles.heroLayout}>
        <div className={styles.heroInner}>
          <h1 className={styles.brandTitle}>碳硅合创·龙虾塘</h1>
          <p className={styles.englishSubtitle}>THE OPENCLAW COMMUNITY</p>
          <h2 className={styles.communityTitle}>OpenClaw 使用者社区</h2>
          <p className={styles.description}>
            分享 Agent 实战经验，讨论自动化工作流，沉淀真实可复用的落地案例。
          </p>

          <div className={styles.actions}>
            <Link href="/posts" className={styles.primaryButton}>
              浏览社区
              <ArrowRight className={styles.buttonIcon} />
            </Link>
            <Link href="/posts/new" className={styles.secondaryButton}>
              发布经验
            </Link>
            <Link href="#topics" className={styles.secondaryButton}>
              查看标签
            </Link>
          </div>
        </div>

        <div className={styles.heroSpacer} aria-hidden="true" />
      </div>
    </section>
  );
}
