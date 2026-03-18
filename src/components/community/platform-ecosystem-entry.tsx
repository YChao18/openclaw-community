import { ArrowUpRight, Orbit } from "lucide-react";

export function PlatformEcosystemEntry() {
  return (
    <section aria-labelledby="platform-ecosystem-entry" className="space-y-8">
      <div className="border-default relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,rgba(255,252,247,0.97),rgba(254,247,238,0.92)_52%,rgba(251,244,235,0.96))] px-6 py-7 shadow-[0_18px_44px_rgba(180,149,104,0.14)] sm:px-8 sm:py-8 lg:px-10 lg:py-10 dark:border-[#d5c2a2]/18 dark:bg-[linear-gradient(135deg,rgba(44,35,26,0.92),rgba(35,31,25,0.92)_52%,rgba(30,27,23,0.96))] dark:shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(239,196,123,0.18),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.16),transparent_62%)]" />
        <div className="pointer-events-none absolute -top-10 left-12 h-28 w-28 rounded-full bg-[rgba(248,211,160,0.18)] blur-3xl dark:bg-[rgba(234,179,8,0.08)]" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-36 w-36 rounded-full bg-[rgba(242,167,92,0.16)] blur-3xl dark:bg-[rgba(220,120,60,0.12)]" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.95fr)] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead8bc] bg-white/78 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-[#8c6a37] uppercase shadow-[0_8px_20px_rgba(190,160,120,0.12)] backdrop-blur-sm dark:border-[#d2bb98]/30 dark:bg-white/8 dark:text-[#f0d28d]">
              <Orbit className="h-3.5 w-3.5" />
              平台生态
            </span>

            <div className="max-w-3xl space-y-3">
              <h2
                id="platform-ecosystem-entry"
                className="text-primary text-3xl font-semibold tracking-tight md:text-4xl"
              >
                进入碳硅合创社区
              </h2>
              <p className="text-[15px] leading-7 text-[#74675a] md:text-base dark:text-[#cdbfae]">
                探索更大范围的 AI 社区内容、实践交流与生态资源
              </p>
              <p className="text-secondary max-w-3xl text-sm leading-8 md:text-base">
                龙虾塘聚焦 OpenClaw 用户经验、问题与实践；碳硅合创社区面向更广泛的
                AI 探索者、开发者与行业参与者。
              </p>
            </div>
          </div>

          <div className="border border-[#eadbc4] bg-white/72 p-5 backdrop-blur-sm shadow-[0_16px_36px_rgba(180,149,104,0.12)] rounded-[1.6rem] dark:border-[#d5c2a2]/18 dark:bg-white/6 dark:shadow-none">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-medium tracking-[0.24em] text-[#9a7b4d] uppercase dark:text-[#e6c98c]">
                  上层社区入口
                </p>
                <p className="text-primary text-sm leading-7">
                  从“碳硅合创·龙虾塘”继续进入更完整的社区生态，查看更广泛的内容与交流。
                </p>
              </div>

              <a
                href="https://csicommunity.dezezhilian.top/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e7bc6d] px-5 py-3 text-sm font-medium text-[#2f2416] shadow-[0_12px_28px_rgba(201,152,76,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e2b15a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a447]/50 dark:bg-[#eab308] dark:text-[#1f1408] dark:hover:bg-[#d4a107]"
              >
                进入碳硅合创社区
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
