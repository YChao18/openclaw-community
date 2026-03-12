import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordPostView } from "@/lib/community";

const VIEWER_COOKIE_NAME = "openclaw_viewer";
const VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type PostViewRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: PostViewRouteContext,
) {
  const { postId } = await params;
  const normalizedPostId = postId.trim();

  if (!normalizedPostId) {
    return NextResponse.json(
      { message: "帖子标识不能为空。" },
      { status: 400 },
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const viewerKey = await getViewerKey(userId);
  const counted = await recordPostView({
    postId: normalizedPostId,
    userId,
    viewerKey,
  });

  if (counted === null) {
    return NextResponse.json({ message: "帖子不存在。" }, { status: 404 });
  }

  return NextResponse.json({ counted });
}

async function getViewerKey(userId: string | null) {
  if (userId) {
    return `user:${userId}`;
  }

  const cookieStore = await cookies();
  const existingViewerId = cookieStore.get(VIEWER_COOKIE_NAME)?.value;

  if (existingViewerId) {
    return `guest:${existingViewerId}`;
  }

  const viewerId = crypto.randomUUID();
  cookieStore.set(VIEWER_COOKIE_NAME, viewerId, {
    httpOnly: true,
    maxAge: VIEWER_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return `guest:${viewerId}`;
}
