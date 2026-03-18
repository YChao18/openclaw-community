import { ArrowUpRight, Orbit } from "lucide-react";

export function PlatformEcosystemEntry() {
  return (
    <section aria-labelledby="platform-ecosystem-entry" className="space-y-8">
      <div className="border-default relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(145deg,rgba(255,252,247,0.98),rgba(253,246,235,0.95)_58%,rgba(248,238,220,0.94))] px-6 py-8 shadow-[0_16px_36px_rgba(177,145,95,0.12)] sm:px-8 sm:py-9 lg:px-10 lg:py-10 dark:border-[#d5c2a2]/18 dark:bg-[linear-gradient(145deg,rgba(44,35,26,0.94),rgba(37,31,24,0.94)_58%,rgba(31,27,22,0.96))] dark:shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,196,123,0.16),transparent_42%),linear-gradient(180deg,transparent,rgba(255,255,255,0.14))] dark:bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.16),transparent_42%)]" />
        <div className="pointer-events-none absolute -top-12 right-10 h-32 w-32 rounded-full bg-[rgba(248,211,160,0.16)] blur-3xl dark:bg-[rgba(234,179,8,0.08)]" />
        <div className="pointer-events-none absolute bottom-0 left-8 h-28 w-40 rounded-full bg-[rgba(242,167,92,0.12)] blur-3xl dark:bg-[rgba(220,120,60,0.12)]" />

        <div className="relative flex flex-col items-start gap-8">
          <div className="w-full space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead8bc] bg-white/78 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8c6a37] shadow-[0_8px_20px_rgba(190,160,120,0.12)] backdrop-blur-sm dark:border-[#d2bb98]/30 dark:bg-white/8 dark:text-[#f0d28d]">
              <Orbit className="h-3.5 w-3.5" />
              平台生态
            </span>

            <div className="max-w-3xl space-y-4">
              <h2
                id="platform-ecosystem-entry"
                className="text-primary text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
              >
                进入碳硅合创社区
              </h2>
              <p className="max-w-3xl text-base leading-8 text-[#6f604f] md:text-lg dark:text-[#d6c4b0]">
                探索更大范围的 AI 社区内容、实践交流与生态资源
              </p>
              <div className="text-secondary max-w-3xl space-y-1.5 text-base leading-relaxed md:text-[17px]">
                <p className="font-medium text-[#5f5347] dark:text-[#d8c7b4]">
                  龙虾塘聚焦 OpenClaw 用户经验、问题与实践
                </p>
                <p>碳硅合创社区面向更广泛的 AI 探索者、开发者与行业参与者</p>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <a
              href="https://csicommunity.dezezhilian.top/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#f5d79a] via-[#eec06d] to-[#df9f49] px-7 py-4 text-base font-medium text-[#2f2416] shadow-[0_14px_30px_rgba(201,152,76,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(201,152,76,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a447]/50 sm:w-auto sm:min-w-[320px] dark:from-[#f1c661] dark:via-[#eab308] dark:to-[#d89612] dark:text-[#1f1408]"
            >
              进入碳硅合创社区
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
