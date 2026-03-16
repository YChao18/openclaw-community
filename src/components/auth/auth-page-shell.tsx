import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  highlights: Array<{
    body: string;
    title: string;
  }>;
  title: string;
};

export function AuthPageShell({
  children,
  description,
  eyebrow,
  highlights,
  title,
}: AuthPageShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-default bg-surface rounded-[2rem] border p-8 shadow-[0_24px_60px_var(--shadow-card)] md:p-10">
          <p className="text-secondary text-sm tracking-[0.28em] uppercase">
            {eyebrow}
          </p>
          <h1 className="text-primary mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-secondary mt-5 text-sm leading-8 md:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-5">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="border-default bg-surface rounded-[1.75rem] border p-6"
            >
              <p className="text-brand-yellow text-sm font-medium tracking-[0.2em] uppercase">
                {item.title}
              </p>
              <p className="text-secondary mt-4 text-sm leading-7">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-default bg-surface rounded-[2rem] border p-6 md:p-8">
        {children}
      </section>
    </div>
  );
}
