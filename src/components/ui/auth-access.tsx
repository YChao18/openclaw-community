import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LoginComingSoon } from "@/components/ui/login-coming-soon";

export async function AuthAccess() {
  const session = await auth();

  if (!session?.user) {
    return <LoginComingSoon />;
  }

  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
      className="flex items-center gap-2"
    >
      <Link
        href="/posts/new"
        className="hidden rounded-full border border-default bg-surface px-3 py-2 text-sm text-secondary transition hover:bg-interactive-muted-hover hover:text-primary md:inline-flex"
      >
        去发帖
      </Link>
      <span className="hidden text-sm text-secondary md:inline">
        {session.user.name ?? session.user.email}
      </span>
      <button
        type="submit"
        className="rounded-full border border-default bg-surface px-4 py-2 text-sm transition hover:bg-interactive-muted-hover"
      >
        退出
      </button>
    </form>
  );
}
