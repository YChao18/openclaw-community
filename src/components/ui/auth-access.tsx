import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/auth";
import { getUserDisplayName } from "@/lib/user/service";

export async function AuthAccess() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-brand-yellow/25 bg-brand-yellow-soft/90 px-4 py-2 text-[15px] font-medium text-brand-yellow shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition duration-200 hover:bg-brand-yellow/15"
      >
        登录 / 注册
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/posts/new"
        className="hidden rounded-full border border-default/80 bg-surface/88 px-3 py-2 text-[15px] text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-200 hover:bg-interactive-muted-hover hover:text-primary md:inline-flex"
      >
        去发帖
      </Link>
      <Link
        href="/me"
        className="hidden rounded-full border border-default/80 bg-surface/88 px-3 py-2 text-[15px] text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-200 hover:bg-interactive-muted-hover hover:text-primary md:inline-flex"
      >
        {getUserDisplayName(user)}
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut();
          redirect("/");
        }}
      >
        <button
          type="submit"
          className="rounded-full border border-default/80 bg-surface/88 px-4 py-2 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-200 hover:bg-interactive-muted-hover"
        >
          退出登录
        </button>
      </form>
    </div>
  );
}
