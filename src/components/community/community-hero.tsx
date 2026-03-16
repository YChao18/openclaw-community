import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/Brand";
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
          <Brand variant="hero" className={styles.brandBlock} />
          <h2 className={cn(styles.communityTitle, "whitespace-nowrap")}>
            OpenClaw 用户分享的经验、问题与实践
          </h2>
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

        <div className={styles.heroAccent} aria-hidden="true">
          <div className={styles.accentOrb} />
          <div className={styles.accentPanel}>
            <p className={styles.accentEyebrow}>Community</p>
            <p className={styles.accentCopy}>
              面向真实实践者的 OpenClaw 讨论空间，沉淀案例、问题和工作流经验。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
