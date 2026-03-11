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
        className="rounded-full border border-brand-yellow/30 bg-brand-yellow-soft px-4 py-2 text-sm font-medium text-brand-yellow transition hover:bg-brand-yellow/20"
      >
        登录 / 注册
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/posts/new"
        className="hidden rounded-full border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-interactive-muted-hover hover:text-primary md:inline-flex"
      >
        去发布
      </Link>
      <Link
        href="/me"
        className="hidden rounded-full border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-interactive-muted-hover hover:text-primary md:inline-flex"
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
          className="rounded-full border border-default bg-surface px-4 py-2 text-sm transition hover:bg-interactive-muted-hover"
        >
          退出登录
        </button>
      </form>
    </div>
  );
}
