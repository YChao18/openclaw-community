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
            OpenClaw 鐢ㄦ埛鍒嗕韩鐨勭粡楠屻€侀棶棰樹笌瀹炶返
          </h2>
          <p className={styles.description}>
            鍒嗕韩 Agent 瀹炴垬缁忛獙锛岃璁鸿嚜鍔ㄥ寲宸ヤ綔娴侊紝娌夋穩鐪熷疄鍙鐢ㄧ殑钀藉湴妗堜緥銆?
          </p>

          <div className={styles.accentPanel}>
            <p className={styles.accentEyebrow}>Community</p>
            <p className={styles.accentCopy}>
              闈㈠悜鐪熷疄瀹炶返鑰呯殑 OpenClaw 璁ㄨ绌洪棿锛屾矇娣€妗堜緥銆侀棶棰樺拰宸ヤ綔娴佺粡楠屻€?
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/posts" className={styles.primaryButton}>
              娴忚绀惧尯
              <ArrowRight className={styles.buttonIcon} />
            </Link>
            <Link href="/posts/new" className={styles.secondaryButton}>
              鍙戝竷甯栧瓙
            </Link>
            <Link href="#topics" className={styles.secondaryButton}>
              鏌ョ湅鏍囩
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
