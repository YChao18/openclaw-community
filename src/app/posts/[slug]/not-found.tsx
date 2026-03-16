import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-14 md:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-default bg-surface p-8 text-center shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
        <p className="text-sm tracking-[0.28em] text-secondary uppercase">
          帖子详情
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary">
          没找到这篇帖子
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-secondary">
          这篇内容可能已被删除、尚未发布，或者当前链接已经失效。你可以返回帖子列表继续浏览。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/posts"
            className="rounded-full border border-brand-yellow/30 bg-brand-yellow-soft px-5 py-3 text-sm font-medium text-brand-yellow transition hover:bg-brand-yellow/20"
          >
            返回帖子列表
          </Link>
          <Link
            href="/tags"
            className="rounded-full border border-default bg-interactive-muted px-5 py-3 text-sm text-primary transition hover:bg-interactive-muted-hover"
          >
            浏览标签
          </Link>
        </div>
      </section>
    </div>
  );
}
